import { Injectable, Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import {
  BinanceRequest,
  BinanceResponse,
  BinanceSuccessResponse,
  BinanceErrorResponse,
} from '../types/binance.types';
import { RedisService } from '../../redis/redis.service';
import { FeeClient } from './fee.client';
import { createTickerKey, TickerData } from '../types/common.types';

@Injectable()
export class BinanceClient {
  private readonly logger = new Logger(BinanceClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://ws-api.binance.com:443/ws-api/v3';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly REFRESH_INTERVAL = 10 * 1000; // 10 seconds
  private readonly CHUNK_SIZE = 50; // 한 번에 요청할 심볼 수 증가
  private symbols: string[] = [];
  private validSymbols: Set<string> = new Set();

  // 레이트 리밋 관련 상수
  private readonly RATE_LIMIT = 300; // 5분당 최대 요청 수
  private readonly RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5분
  private requestCount = 0;
  private lastRequestTime = Date.now();

  private readonly VALID_SYMBOLS_KEY = 'valid-binance-symbols';
  private readonly TICKER_REQUEST_CHUNK_SIZE = 100; // weight 제한 고려한 청크 사이즈

  constructor(
    private readonly redisService: RedisService,
    private readonly feeClient: FeeClient,
  ) {}

  async onModuleInit() {
    await this.connectWebSocket();
  }

  async connectWebSocket() {
    try {
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to Binance WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', async () => {
      this.logger.log('Connected to Binance WebSocket');
      this.reconnectAttempts = 0;
      await this.subscribeToTickers();
    });

    this.ws.on('message', async (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString()) as BinanceResponse;
        await this.handleResponse(response);
      } catch (error) {
        this.logger.error('Error processing response data', error);
      }
    });

    this.ws.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket connection closed');
      this.handleReconnect();
    });
  }

  private async handleResponse(response: BinanceResponse) {
    if (response.status === 200 && response.id) {
      const tickers = (response as BinanceSuccessResponse).result;

      // 검증 응답인 경우
      if (response.id.startsWith('validate-')) {
        for (const ticker of tickers) {
          if (ticker && typeof ticker.lastPrice === 'string') {
            const price = parseFloat(ticker.lastPrice);
            if (!isNaN(price) && price > 0) {
              this.validSymbols.add(ticker.symbol);
              this.logger.debug(`Validated symbol: ${ticker.symbol}`);
            }
          }
        }
        return;
      }

      // 일반 티커 응답인 경우
      try {
        for (const ticker of tickers) {
          const [baseToken, quoteToken] = [ticker.symbol.slice(0, -4), 'USDT'];
          const redisKey = createTickerKey('binance', baseToken, quoteToken);

          const tickerData: TickerData = {
            exchange: 'binance',
            baseToken,
            quoteToken,
            price: parseFloat(ticker.lastPrice),
            volume: parseFloat(ticker.volume),
            timestamp: ticker.closeTime,
          };

          await this.redisService.set(redisKey, JSON.stringify(tickerData));
        }
      } catch (error) {
        this.logger.error(`Error processing tickers: ${error.message}`);
        await this.validateSymbols(); // 데이터 처리 중 에러 발생 시 재검증
      }
    } else if (!response.id?.startsWith('validate-')) {
      const error = (response as BinanceErrorResponse).error;
      this.logger.error(`Ticker request failed: ${error?.msg || 'Unknown error'}`);
      await this.validateSymbols(); // API 에러 발생 시 재검증
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      setTimeout(() => {
        this.logger.log(
          `Attempting to reconnect... (${this.reconnectAttempts})`,
        );
        this.connectWebSocket();
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached');
    }
  }

  private async subscribeToTickers() {
    try {
      // 1. 먼저 모든 USDT 페어 목록 생성
      const fees = await this.feeClient.getBinanceFees();
      this.symbols = [...new Set(fees.map((fee) => `${fee.symbol}USDT`))];

      // 2. 첫 요청으로 유효한 심볼만 필터링
      await this.validateSymbols();

      // 3. 이후부터는 유효한 심볼만 주기적으로 요청
      await this.requestTickers();
      setInterval(() => this.requestTickers(), this.REFRESH_INTERVAL);
    } catch (error) {
      this.logger.error('Failed to subscribe to tickers', error);
      this.handleReconnect();
    }
  }

  private async validateSymbols() {
    this.logger.debug(`Validating ${this.symbols.length} symbols...`);
    this.validSymbols.clear(); // 재검증 시 초기화

    // 첫 번째 시도: 큰 청크로 검증
    for (let i = 0; i < this.symbols.length; i += this.CHUNK_SIZE) {
      await this.checkRateLimit();

      const symbolsChunk = this.symbols.slice(i, i + this.CHUNK_SIZE);
      const success = await this.validateSymbolChunk(symbolsChunk);

      // 실패한 청크는 개별 검증
      if (!success && symbolsChunk.length > 1) {
        this.logger.debug(`Retrying chunk ${i} individually...`);
        for (const symbol of symbolsChunk) {
          await this.checkRateLimit();
          await this.validateSymbolChunk([symbol]);
        }
      }
    }

    // 유효한 심볼 목록을 Redis에 저장
    const validSymbolsList = Array.from(this.validSymbols);
    await this.redisService.set(
      this.VALID_SYMBOLS_KEY,
      JSON.stringify(validSymbolsList),
    );

    this.logger.debug(
      `Validation complete. Valid symbols: ${this.validSymbols.size}`,
    );
  }

  private async validateSymbolChunk(symbols: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = `validate-${new Date().getTime()}`;
      
      // 이 청크에 대한 응답을 기다리는 핸들러
      const responseHandler = async (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString()) as BinanceResponse;
          if (response.id === requestId) {
            // 응답을 받으면 핸들러 제거
            this.ws.removeListener('message', responseHandler);
            
            if (response.status === 200) {
              resolve(true);
            } else {
              this.logger.error(
                `Failed to validate symbols [${symbols.join(',')}]: ${
                  (response as BinanceErrorResponse).error?.msg || 'Unknown error'
                }`,
              );
              resolve(false);
            }
          }
        } catch (error) {
          this.logger.error(
            `Error processing validation response: ${error.message}`,
          );
        }
      };

      // 응답 대기를 위한 핸들러 추가
      this.ws.addListener('message', responseHandler);

      // 요청 전송
      const request: BinanceRequest = {
        id: requestId,
        method: 'ticker.24hr',
        params: {
          symbols: symbols,
          type: 'MINI',
        },
      };

      try {
        this.ws.send(JSON.stringify(request));
        this.requestCount++;
      } catch (error) {
        this.ws.removeListener('message', responseHandler);
        this.logger.error(
          `Failed to send validation request: ${error.message}`,
        );
        resolve(false);
      }
    });
  }

  private async checkRateLimit() {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;

    // 5분이 지났으면 카운터 리셋
    if (timeElapsed >= this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
      return;
    }

    // 레이트 리밋에 도달했다면 남은 시간만큼 대기
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.RATE_LIMIT_WINDOW - timeElapsed;
      this.logger.debug(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }
  }

  private async requestTickers() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket is not ready');
      return;
    }

    const validSymbolsList = Array.from(this.validSymbols);

    if (validSymbolsList.length === 0) {
      this.logger.error('No valid symbols found');
      await this.validateSymbols(); // 유효한 심볼이 없으면 재검증
      return;
    }

    this.logger.debug(`Requesting ${validSymbolsList.length} valid symbols`);

    // weight 제한을 고려한 청크 사이즈로 요청
    for (let i = 0; i < validSymbolsList.length; i += this.TICKER_REQUEST_CHUNK_SIZE) {
      await this.checkRateLimit();

      const symbolsChunk = validSymbolsList.slice(i, i + this.TICKER_REQUEST_CHUNK_SIZE);
      const request: BinanceRequest = {
        id: `tickers-${new Date().getTime()}`,
        method: 'ticker.24hr',
        params: {
          symbols: symbolsChunk,
          type: 'MINI',
        },
      };

      try {
        this.ws.send(JSON.stringify(request));
        this.requestCount++;

        if (i + this.TICKER_REQUEST_CHUNK_SIZE < validSymbolsList.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        this.logger.error(`Failed to request tickers: ${error.message}`);
        await this.validateSymbols(); // 에러 발생 시 재검증
        break;
      }
    }
  }
}

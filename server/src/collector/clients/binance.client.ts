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
  private symbols: string[] = [];
  private readonly CHUNK_SIZE = 20; // 한 번에 요청할 심볼 수
  private validSymbols: Set<string> = new Set();

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
          this.validSymbols.add(ticker.symbol);
        }
        return;
      }

      // 일반 티커 응답인 경우
      for (const ticker of tickers) {
        try {
          const [baseToken, quoteToken] = [ticker.symbol.slice(0, -4), 'USDT'];
          const redisKey = createTickerKey('binance', baseToken, quoteToken);

          const tickerData: TickerData = {
            exchange: 'binance',
            baseToken: baseToken,
            quoteToken: quoteToken,
            price: parseFloat(ticker.lastPrice),
            volume: parseFloat(ticker.volume),
            timestamp: ticker.closeTime,
          };

          await this.redisService.set(redisKey, JSON.stringify(tickerData));
        } catch (error) {
          this.logger.error(
            `Error processing ticker ${ticker.symbol}: ${error.message}`,
          );
        }
      }
    } else {
      // 검증 과정의 에러는 무시 (일부 심볼이 유효하지 않은 것이 정상)
      if (!response.id?.startsWith('validate-')) {
        const error = (response as BinanceErrorResponse).error;
        this.logger.error(
          `Ticker request failed: ${error?.msg || 'Unknown error'}`,
        );
      }
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
    
    for (let i = 0; i < this.symbols.length; i += this.CHUNK_SIZE) {
      const symbolsChunk = this.symbols.slice(i, i + this.CHUNK_SIZE);
      
      const request: BinanceRequest = {
        id: `validate-${Date.now()}-${i}`,
        method: 'ticker.24hr',
        params: {
          symbols: symbolsChunk,
        },
      };

      this.ws.send(JSON.stringify(request));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async requestTickers() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket is not ready');
      return;
    }

    // 유효한 심볼만 요청
    const validSymbolsList = Array.from(this.validSymbols);
    this.logger.debug(`Requesting ${validSymbolsList.length} valid symbols`);

    for (let i = 0; i < validSymbolsList.length; i += this.CHUNK_SIZE) {
      const symbolsChunk = validSymbolsList.slice(i, i + this.CHUNK_SIZE);
      
      const request: BinanceRequest = {
        id: `tickers-${Date.now()}-${i}`,
        method: 'ticker.24hr',
        params: {
          symbols: symbolsChunk,
        },
      };

      this.ws.send(JSON.stringify(request));
      
      if (i + this.CHUNK_SIZE < validSymbolsList.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

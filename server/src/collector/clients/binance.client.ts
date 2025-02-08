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
import { parseBinanceMarket, createTickerKey, TickerData } from '../types/common.types';

@Injectable()
export class BinanceClient {
  private readonly logger = new Logger(BinanceClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://ws-api.binance.com:443/ws-api/v3';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly REQUEST_INTERVAL = 1000; // 1 second between requests
  private readonly MAX_REQUESTS_PER_WINDOW = 300;
  private readonly WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes in milliseconds
  private requestTimestamps: number[] = [];
  private requestQueue: string[] = [];
  private processingQueue = false;

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
      const trades = (response as BinanceSuccessResponse).result;
      if (trades.length > 0) {
        const latestTrade = trades[0];
        const symbol = response.id.split('trade-')[1];
        if (!symbol) {
          this.logger.error(`Invalid response id format: ${response.id}`);
          return;
        }

        const { baseToken, quoteToken } = parseBinanceMarket(symbol);
        const redisKey = createTickerKey('binance', baseToken, quoteToken);
        
        const tickerData: TickerData = {
          exchange: 'binance',
          baseToken,
          quoteToken,
          price: parseFloat(latestTrade.price),
          volume: parseFloat(latestTrade.qty),
          timestamp: latestTrade.time,
        };

        await this.redisService.set(redisKey, JSON.stringify(tickerData));
      }
    } else {
      const error = (response as BinanceErrorResponse).error;
      this.logger.error(
        `Trade data request failed: ${error?.msg || 'Unknown error'}`,
      );
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

  private canMakeRequest(): boolean {
    const now = Date.now();
    // Remove timestamps older than the window size
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_SIZE,
    );
    return this.requestTimestamps.length < this.MAX_REQUESTS_PER_WINDOW;
  }

  private async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) return;

    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      if (!this.canMakeRequest()) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.REQUEST_INTERVAL),
        );
        continue;
      }

      const symbol = this.requestQueue.shift();
      if (!symbol) continue;

      const request: BinanceRequest = {
        id: `trade-${symbol}`,
        method: 'trades.recent',
        params: {
          symbol: symbol,
          limit: 1,
        },
      };

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(request));
        this.requestTimestamps.push(Date.now());
        await new Promise((resolve) =>
          setTimeout(resolve, this.REQUEST_INTERVAL),
        );
      } else {
        this.logger.error('WebSocket is not ready');
        this.handleReconnect();
        break;
      }
    }

    this.processingQueue = false;
  }

  private async subscribeToTickers() {
    try {
      const fees = await this.feeClient.getBinanceFees();
      const symbols = [...new Set(fees.map((fee) => fee.symbol))];
      const usdtPairs = symbols.map((symbol) => `${symbol}USDT`);

      // Clear existing queue
      this.requestQueue = [];

      // Add all symbols to the queue
      this.requestQueue.push(...usdtPairs);

      // Start processing the queue
      this.processQueue();

      // Set up periodic resubscription (every 5 minutes)
      setInterval(() => {
        if (this.requestQueue.length === 0) {
          this.requestQueue.push(...usdtPairs);
          this.processQueue();
        }
      }, this.WINDOW_SIZE);
    } catch (error) {
      this.logger.error('Failed to subscribe to trades', error);
      this.handleReconnect();
    }
  }
}

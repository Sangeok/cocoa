import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';
import {
  BinanceRequest,
  BinanceResponse,
  BinanceRequestParams,
  BinanceSuccessResponse,
  BinanceErrorResponse,
} from '../types/binance.types';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class BinanceClient {
  private readonly logger = new Logger(BinanceClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://ws-api.binance.com:443/ws-api/v3';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async connect() {
    try {
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to Binance WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', () => {
      this.logger.log('Connected to Binance WebSocket');
      this.reconnectAttempts = 0;
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
    if (response.status === 200) {
      const result = (response as BinanceSuccessResponse).result;
      const redisKey = `ticker-binance-${result.symbol}`;
      
      await this.redisService.set(redisKey, JSON.stringify({
        exchange: 'binance',
        orderId: result.orderId,
        symbol: result.symbol,
        price: result.price,
        quantity: result.origQty,
        status: result.status,
        timestamp: result.transactTime,
      }));

      this.logger.log(`Order placed successfully: ${result.orderId}`);
    } else {
      const error = (response as BinanceErrorResponse).error;
      this.logger.error(`Order failed: ${error.msg}`);
    }
  }

  async placeOrder(params: Omit<BinanceRequestParams, 'apiKey' | 'signature' | 'timestamp'>) {
    const timestamp = Date.now();
    const apiKey = this.configService.get<string>('BINANCE_API_KEY');
    
    if (!apiKey) {
      throw new Error('BINANCE_API_KEY is not configured');
    }

    const signature = this.generateSignature({
      ...params,
      timestamp,
      apiKey,
    });

    const request: BinanceRequest = {
      id: uuidv4(),
      method: 'order.place',
      params: {
        ...params,
        timestamp,
        apiKey,
        signature,
      },
    };

    this.ws.send(JSON.stringify(request));
  }

  private generateSignature(params: Omit<BinanceRequestParams, 'signature'>): string {
    // TODO: Implement actual signature generation logic
    const secretKey = this.configService.get<string>('BINANCE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('BINANCE_SECRET_KEY is not configured');
    }

    // This is a placeholder implementation
    const hmac = createHmac('sha256', secretKey);
    hmac.update(JSON.stringify(params));
    return hmac.digest('hex');
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        this.logger.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached');
    }
  }
} 
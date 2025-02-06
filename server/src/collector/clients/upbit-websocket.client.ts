import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import WebSocket from 'ws';
import { RedisService } from '../../redis/redis.service';
import { AppGateway } from '../../gateway/app.gateway';
import { MarketCodesService } from '../services/market-codes.service';
import { UpbitTickerResponse } from '../types/upbit.types';

@Injectable()
export class UpbitWebsocketClient implements OnModuleInit {
  private readonly logger = new Logger(UpbitWebsocketClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://api.upbit.com/websocket/v1';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
    private readonly marketCodesService: MarketCodesService,
  ) {}

  async onModuleInit() {
    await this.marketCodesService.loadMarketCodes();
    await this.connectWebSocket();
  }

  private async connectWebSocket() {
    try {
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.setupWebSocketHandlers();
      await this.subscribeToTickers();
    } catch (error) {
      this.logger.error('Failed to connect to Upbit WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', () => {
      this.logger.log('Connected to Upbit WebSocket');
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', async (data: Buffer) => {
      try {
        const tickerData = JSON.parse(data.toString()) as UpbitTickerResponse;
        await this.handleTickerData(tickerData);
      } catch (error) {
        this.logger.error('Error processing ticker data', error);
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

  private async subscribeToTickers() {
    const marketCodes = this.marketCodesService.getMarketCodes();
    const tickerSubscription = JSON.stringify([
      { ticket: 'UNIQUE_TICKET' },
      {
        type: 'ticker',
        codes: marketCodes,
      },
    ]);

    this.ws.send(tickerSubscription);
  }

  private async handleTickerData(data: UpbitTickerResponse) {
    const redisKey = `ticker-${data.code}`;
    
    // Redis에 데이터 저장
    await this.redisService.set(redisKey, JSON.stringify({
      price: data.trade_price,
      change: data.signed_change_rate,
      timestamp: data.timestamp,
      volume24h: data.acc_trade_price_24h,
    }));

    // 웹소켓 클라이언트에게 데이터 전송
    this.appGateway.emitCoinPrice({
      symbol: data.code.replace('KRW-', ''),
      price: data.trade_price,
      difference: data.signed_change_rate * 100,
      timestamp: data.timestamp,
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      setTimeout(() => {
        this.logger.log(`Attempting to reconnect... (${this.reconnectAttempts})`);
        this.connectWebSocket();
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached');
    }
  }
} 
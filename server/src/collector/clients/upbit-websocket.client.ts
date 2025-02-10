import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { RedisService } from '../../redis/redis.service';
import { AppGateway } from '../../gateway/app.gateway';
import { MarketCodesService } from '../services/market-codes.service';
import { UpbitTickerResponse } from '../types/upbit.types';
import { createTickerKey, TickerData, parseUpbitMarket } from '../types/common.types';

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
    } catch (error) {
      this.logger.error('Failed to connect to Upbit WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', async () => {
      this.logger.log('Connected to Upbit WebSocket');
      this.reconnectAttempts = 0;
      await this.subscribeToTickers();
    });

    this.ws.on('message', async (data: Buffer) => {
      try {
        const tickerData = JSON.parse(data.toString()) as UpbitTickerResponse;
        await this.handleTickerData(tickerData);
        // this.logger.debug(`Upbit ticker data: ${tickerData.code}`);
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
    try {
      const marketCodes = this.marketCodesService.getMarketCodes();
      const tickerSubscription = JSON.stringify([
        { ticket: 'UNIQUE_TICKET' },
        {
          type: 'ticker',
          codes: marketCodes,
        },
      ]);

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(tickerSubscription);
        this.logger.log('Subscribed to tickers');
      } else {
        this.logger.error('WebSocket is not ready');
        this.handleReconnect();
      }
    } catch (error) {
      this.logger.error('Failed to subscribe to tickers', error);
      this.handleReconnect();
    }
  }

  private async handleTickerData(data: UpbitTickerResponse) {
    try {

      const { baseToken, quoteToken } = parseUpbitMarket(data.code);
      const redisKey = createTickerKey('upbit', baseToken, quoteToken);
      
      const tickerData: TickerData = {
        exchange: 'upbit',
        baseToken,
        quoteToken,
        price: data.trade_price,
        volume: data.acc_trade_price_24h,
        change24h: data.signed_change_rate,
        timestamp: data.timestamp,
      };

      await this.redisService.set(redisKey, JSON.stringify(tickerData));

    } catch (error) {
      this.logger.error(`Error handling ticker data: ${error.message}`, {
        data,
        error,
      });
    }
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
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { RedisService } from '../../redis/redis.service';
import {
  BithumbTickerResponse,
  BithumbMarketResponse,
} from '../types/bithumb.types';
import { createTickerKey, TickerData } from '../types/common.types';
import { CollectorService } from '../collector.service';
@Injectable()
export class BithumbWebsocketClient implements OnModuleInit {
  private readonly logger = new Logger(BithumbWebsocketClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://pubwss.bithumb.com/pub/ws';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(
    private readonly redisService: RedisService,
    private readonly collectorService: CollectorService,
  ) {}

  async onModuleInit() {
    await this.connectWebSocket();
  }

  private async connectWebSocket() {
    try {
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to Bithumb WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', async () => {
      this.logger.log('Connected to Bithumb WebSocket');
      this.reconnectAttempts = 0;
      await this.subscribeToTickers();
    });

    this.ws.on('message', async (data: Buffer) => {
      try {
        const tickerData = JSON.parse(data.toString()) as BithumbTickerResponse;
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
    try {
      let markets = await this.redisService.get('bithumb-markets');

      if (!markets) {
        this.logger.error('No markets found in Redis');
        await this.collectorService.collectMarkets();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        markets = await this.redisService.get('bithumb-markets');
      }

      if (!markets) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await this.subscribeToTickers();
        return;
      }

      const symbols = JSON.parse(markets).map(
        (market: BithumbMarketResponse) => {
          const symbol = market.market.split('-');
          return `${symbol[1]}_${symbol[0]}`;
        },
      );
      const subscribeMessage = {
        type: 'ticker',
        symbols: symbols,
        tickTypes: ['30M', '1H', '12H', '24H', 'MID'],
      };

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(subscribeMessage));
        this.logger.log('Subscribed to Bithumb tickers');
      } else {
        this.logger.error('WebSocket is not ready');
        this.handleReconnect();
      }
    } catch (error) {
      this.logger.error('Failed to subscribe to tickers', error);
      this.handleReconnect();
    }
  }

  private async handleTickerData(data: BithumbTickerResponse) {
    try {
      if (data.type !== 'ticker') return;

      const [baseToken, quoteToken] = data.content.symbol.split('_');
      const redisKey = createTickerKey('bithumb', baseToken, quoteToken);

      const tickerData: TickerData = {
        exchange: 'bithumb',
        baseToken,
        quoteToken,
        price: parseFloat(data.content.closePrice),
        volume: parseFloat(data.content.volume),
        change24h: parseFloat(data.content.chgRate),
        timestamp: parseInt(data.content.time),
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
        this.logger.log(
          `Attempting to reconnect... (${this.reconnectAttempts})`,
        );
        this.connectWebSocket();
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached');
    }
  }
}

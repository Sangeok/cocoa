import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import { RedisService } from '../../redis/redis.service';
import {
  CoinoneTickerResponse,
  CoinoneMarketResponse,
  CoinoneSubscribeRequest,
} from '../types/coinone.types';
import { createTickerKey, TickerData } from '../types/common.types';
import { CollectorService } from '../collector.service';

@Injectable()
export class CoinoneWebsocketClient implements OnModuleInit {
  private readonly logger = new Logger(CoinoneWebsocketClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://stream.coinone.co.kr';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private pingInterval: NodeJS.Timeout;

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
      this.logger.error('Failed to connect to Coinone WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', async () => {
      this.logger.log('Connected to Coinone WebSocket');
      this.reconnectAttempts = 0;
      await this.subscribeToTickers();
      this.setupPingInterval();
    });

    this.ws.on('message', async (data: Buffer) => {
      try {
        const tickerData = JSON.parse(data.toString()) as CoinoneTickerResponse;
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
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
      }
      this.handleReconnect();
    });
  }

  private setupPingInterval() {
    // 25분마다 PING 전송 (30분 제한보다 여유있게)
    this.pingInterval = setInterval(
      () => {
        const pingMessage: CoinoneSubscribeRequest = {
          request_type: 'PING',
        };

        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(pingMessage));
          this.logger.debug('Ping sent to Coinone WebSocket');
        }
      },
      25 * 60 * 1000,
    );
  }

  private async subscribeToTickers() {
    try {
      let markets = await this.redisService.get('coinone-markets');

      if (!markets) {
        this.logger.warn('No markets found in Redis');
        await this.collectorService.collectMarkets();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        markets = await this.redisService.get('coinone-markets');
      }

      if (!markets) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await this.subscribeToTickers();
        return;
      }

      const parsedMarkets = JSON.parse(markets) as CoinoneMarketResponse[];

      for (const market of parsedMarkets) {
        const [baseToken, quoteToken] = market.market.split('-');
        const subscribeMessage: CoinoneSubscribeRequest = {
          request_type: 'SUBSCRIBE',
          channel: 'TICKER',
          topic: {
            quote_currency: quoteToken,
            target_currency: baseToken,
          },
        };

        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(subscribeMessage));
        }
      }

      this.logger.log('Subscribed to Coinone tickers');
    } catch (error) {
      this.logger.error('Failed to subscribe to tickers', error);
      this.handleReconnect();
    }
  }

  private async handleTickerData(data: CoinoneTickerResponse) {
    try {
      this.logger.debug('handleTickerData: ', data);
      if (data.channel !== 'TICKER') return;

      const redisKey = createTickerKey(
        'coinone',
        data.data.target_currency,
        data.data.quote_currency,
      );

      const tickerData: TickerData = {
        exchange: 'coinone',
        baseToken: data.data.target_currency,
        quoteToken: data.data.quote_currency,
        price: parseFloat(data.data.last),
        volume: parseFloat(data.data.target_volume),
        change24h:
          (parseFloat(data.data.last) - parseFloat(data.data.yesterday_last)) /
          parseFloat(data.data.yesterday_last),
        timestamp: data.data.timestamp,
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

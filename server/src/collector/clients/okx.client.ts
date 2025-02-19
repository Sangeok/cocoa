import { Injectable, Logger, Inject } from '@nestjs/common';
import * as WebSocket from 'ws';
import { RedisService } from '../../redis/redis.service';
import { FeeClient } from './fee.client';
import { createTickerKey, TickerData } from '../types/common.types';
import { DrizzleClient } from '../../database/database.module';
import { okxMarkets } from '../../database/schema/market';

interface OKXTickerResponse {
  arg: {
    channel: string;
    instId: string;
  };
  data: Array<{
    instId: string;
    last: string;
    lastSz: string;
    askPx: string;
    askSz: string;
    bidPx: string;
    bidSz: string;
    open24h: string;
    high24h: string;
    low24h: string;
    volCcy24h: string;
    vol24h: string;
    ts: string;
    sodUtc0: string;
    sodUtc8: string;
  }>;
}

interface OKXInstrument {
  instId: string;
  baseCcy: string;
  quoteCcy: string;
  state: string;
}

interface OKXInstrumentsResponse {
  code: string;
  data: OKXInstrument[];
  msg: string;
}

@Injectable()
export class OKXClient {
  private readonly logger = new Logger(OKXClient.name);
  private ws: WebSocket;
  private readonly WEBSOCKET_URL = 'wss://ws.okx.com:8443/ws/v5/public';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly REST_API_URL = 'https://www.okx.com';
  private validMarkets: Map<string, string> = new Map();
  private pingInterval: NodeJS.Timeout;
  private readonly PING_INTERVAL = 20000; // 20 seconds
  private isInitialized = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly feeClient: FeeClient,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
  ) {}

  async onModuleInit() {
    // Only initialize once
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // Load markets first before connecting to WebSocket
      await this.loadValidMarkets();
      await this.connectWebSocket();
    } catch (error) {
      this.logger.error('Failed to initialize OKX client:', error);
    }
  }

  async connectWebSocket() {
    try {
      this.ws = new WebSocket(this.WEBSOCKET_URL);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.logger.error('Failed to connect to OKX WebSocket', error);
      this.handleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    this.ws.on('open', async () => {
      this.logger.log('Connected to OKX WebSocket');
      this.reconnectAttempts = 0;
      this.setupPingInterval();
      await this.subscribeToTickers();
    });

    this.ws.on('message', async (data: Buffer) => {
      const message = data.toString();
      
      // Handle plain pong message
      if (message === 'pong') {
        this.logger.debug('Received pong from server');
        return;
      }

      try {
        const response = JSON.parse(message);

        // Handle JSON pong message
        if (response.event === 'pong' || response.op === 'pong') {
          this.logger.debug('Received pong from server');
          return;
        }

        // Handle ticker message
        if (response.arg?.channel === 'tickers') {
          await this.handleTickerMessage(response as OKXTickerResponse);
        }
      } catch (error) {
        // Only log error if it's not a plain pong message
        if (message !== 'pong') {
          this.logger.error('Error processing response data:', error);
        }
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

  private setupPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        // OKX expects ping message in this format
        const pingMessage = 'ping';
        this.ws.send(pingMessage);
        this.logger.debug('Sent ping to server');
      }
    }, this.PING_INTERVAL);
  }

  private async handleTickerMessage(response: OKXTickerResponse) {
    if (!response.data || !response.arg) return;

    try {
      for (const ticker of response.data) {
        const [baseToken, quoteToken] = ticker.instId.split('-');
        if (quoteToken !== 'USDT') continue;

        const redisKey = createTickerKey('okx', baseToken, quoteToken);
        const price = parseFloat(ticker.last);
        const volume = parseFloat(ticker.volCcy24h);
        const open24h = parseFloat(ticker.open24h);
        const change24h = ((price - open24h) / open24h) * 100;

        const tickerData: TickerData = {
          exchange: 'okx',
          baseToken,
          quoteToken,
          price,
          volume,
          change24h,
          timestamp: parseInt(ticker.ts),
        };

        await this.redisService.set(redisKey, JSON.stringify(tickerData));
      }
    } catch (error) {
      this.logger.error(`Error processing ticker: ${error.message}`);
    }
  }

  private async loadValidMarkets() {
    try {
      const response = await fetch(
        `${this.REST_API_URL}/api/v5/public/instruments?instType=SPOT`,
      );
      const data = (await response.json()) as OKXInstrumentsResponse;

      if (data.code === '0' && Array.isArray(data.data)) {
        // Filter for USDT markets and active state
        const usdtMarkets = data.data.filter(
          (instrument) =>
            instrument.quoteCcy === 'USDT' && instrument.state === 'live',
        );

        // Use a single transaction for all database operations
        await this.db.transaction(async (tx) => {
          for (const market of usdtMarkets) {
            await tx
              .insert(okxMarkets)
              .values({
                symbol: market.baseCcy,
                baseToken: market.baseCcy,
                quoteToken: market.quoteCcy,
                validatedAt: new Date(),
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: okxMarkets.symbol,
                set: {
                  validatedAt: new Date(),
                  updatedAt: new Date(),
                },
              });
          }
        });

        // Store both baseCcy and instId mapping
        this.validMarkets = new Map(
          usdtMarkets.map((m) => [m.baseCcy, m.instId]),
        );

        this.logger.log(
          `Loaded and stored ${this.validMarkets.size} valid USDT markets from OKX`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to load OKX markets:', error);
      throw error;
    }
  }

  private async subscribeToTickers() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.logger.error('WebSocket is not ready');
      return;
    }

    try {
      const allSubscriptions = {
        op: 'subscribe',
        args: Array.from(this.validMarkets.values()).map((instId) => ({
          channel: 'tickers',
          instId,
        })),
      };

      this.ws.send(JSON.stringify(allSubscriptions));
      this.logger.log(`Subscribing to ${this.validMarkets.size} OKX tickers`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to tickers: ${error.message}`);
    }
  }

  private handleReconnect() {
    // Clear ping interval on reconnect
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

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

  async onModuleDestroy() {
    this.isInitialized = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

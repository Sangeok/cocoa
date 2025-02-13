import { Injectable, Logger, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { CoinPremiumData } from '../collector/types/common.types';
import { DrizzleClient } from '../database/database.module';
import { upbitMarkets, bithumbMarkets, binanceMarkets } from '../database/schema/market';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly PREMIUM_CACHE_KEY = 'coin-premium-data';

  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
  ) {}

  @Interval(1000)
  async processMarketData() {
    try {
      const premiumData: CoinPremiumData = {};

      // Get all ticker data from Redis
      const upbitKeys = await this.redisService.getKeys('ticker-upbit-*');
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');
      const bithumbKeys = await this.redisService.getKeys('ticker-bithumb-*');
      const coinoneKeys = await this.redisService.getKeys('ticker-coinone-*');

      // Process Upbit data
      for (const key of upbitKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        const symbol = tickerData.baseToken;

        if (!premiumData[`${symbol}-${tickerData.quoteToken}`]) {
          premiumData[`${symbol}-${tickerData.quoteToken}`] = {};
        }

        premiumData[`${symbol}-${tickerData.quoteToken}`].upbit = {
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
          change24h: tickerData.change24h,
        };
      }

      // Process Binance data
      for (const key of binanceKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        const symbol = tickerData.baseToken;

        if (!premiumData[`${symbol}-${tickerData.quoteToken}`]) {
          premiumData[`${symbol}-${tickerData.quoteToken}`] = {};
        }

        premiumData[`${symbol}-${tickerData.quoteToken}`].binance = {
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
          change24h: tickerData.change24h,
        };
      }

      // Process Bithumb data
      for (const key of bithumbKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        const symbol = tickerData.baseToken;

        if (!premiumData[`${symbol}-${tickerData.quoteToken}`]) {
          premiumData[`${symbol}-${tickerData.quoteToken}`] = {};
        }

        premiumData[`${symbol}-${tickerData.quoteToken}`].bithumb = {
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
          change24h: tickerData.change24h,
        };
      }

      // Process Coinone data
      for (const key of coinoneKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        const symbol = tickerData.baseToken;

        if (!premiumData[`${symbol}-${tickerData.quoteToken}`]) {
          premiumData[`${symbol}-${tickerData.quoteToken}`] = {};
        }

        premiumData[`${symbol}-${tickerData.quoteToken}`].coinone = {
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
          change24h: tickerData.change24h,
        };
      }

      // Cache the premium data
      await this.redisService.set(
        this.PREMIUM_CACHE_KEY,
        JSON.stringify(premiumData),
      );

      this.logger.log(
        `Premium data cached: Upbit: ${upbitKeys.length}, Binance: ${binanceKeys.length}, Bithumb: ${bithumbKeys.length}, Coinone: ${coinoneKeys.length}`,
      );
      // Emit the consolidated data
      this.appGateway.emitCoinPremium(premiumData);
    } catch (error) {
      this.logger.error('Error processing market data:', error);
    }
  }

  async getMarkets() {
    try {
      const [upbitData, bithumbData, binanceData] = await Promise.all([
        this.db.select().from(upbitMarkets),
        this.db.select().from(bithumbMarkets),
        this.db.select().from(binanceMarkets),
      ]);

      return {
        upbit: upbitData,
        bithumb: bithumbData,
        binance: binanceData,
      };
    } catch (error) {
      this.logger.error('Failed to get markets:', error);
      throw error;
    }
  }
}

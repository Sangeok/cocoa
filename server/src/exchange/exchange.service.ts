import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { CoinPremiumData } from '../collector/types/common.types';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly PREMIUM_CACHE_KEY = 'coin-premium-data';

  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
  ) {}

  @Interval(1000)
  async processMarketData() {
    try {
      const premiumData: CoinPremiumData = {};

      // Get all ticker data from Redis
      const upbitKeys = await this.redisService.getKeys('ticker-upbit-*');
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');
      const bithumbKeys = await this.redisService.getKeys('ticker-bithumb-*');

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
        };
      }

      // Cache the premium data
      await this.redisService.set(
        this.PREMIUM_CACHE_KEY,
        JSON.stringify(premiumData),
      );

      // Emit the consolidated data
      this.appGateway.emitCoinPremium(premiumData);
    } catch (error) {
      this.logger.error('Error processing market data:', error);
    }
  }
}

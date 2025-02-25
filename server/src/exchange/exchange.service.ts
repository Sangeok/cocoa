import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { Interval, Cron } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { CoinPremiumData } from '../collector/types/common.types';
import { DrizzleClient } from '../database/database.module';
import {
  upbitMarkets,
  bithumbMarkets,
  binanceMarkets,
  okxMarkets,
} from '../database/schema/market';
import { PredictService } from '../predict/predict.service';
import axios from 'axios';

@Injectable()
export class ExchangeService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeService.name);
  private readonly PREMIUM_CACHE_KEY = 'coin-premium-data';
  private readonly GLOBAL_METRICS_KEY = 'global-metrics';
  private readonly CMC_API_URL =
    'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest';
  private readonly FEAR_GREED_INDEX_API_URL =
    'https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest';
  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly predictService: PredictService,
  ) {}

  async onModuleInit() {
    try {
      // Wait a bit to ensure Redis is ready
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if global metrics data exists
      const existingData = await this.getGlobalMetrics();
      if (!existingData) {
        this.logger.log(
          'No cached global metrics found. Fetching initial data...',
        );
        await this.fetchGlobalMetrics();
      }

      const fearGreedIndex = await this.getFearGreedIndex();
      if (!fearGreedIndex) {
        this.logger.log(
          'No cached fear and greed index found. Fetching initial data...',
        );
        await this.fetchFearGreedIndex();
      }
    } catch (error) {
      this.logger.warn(error.message);
      // Schedule a retry after 5 seconds
      setTimeout(async () => {
        try {
          await this.fetchGlobalMetrics();
        } catch (retryError) {
          this.logger.error('Retry failed:', retryError.message);
        }
      }, 5000);
    }
  }

  @Interval(1000)
  async processMarketData() {
    try {
      const premiumData: CoinPremiumData = {};

      // Get all ticker data from Redis
      const upbitKeys = await this.redisService.getKeys('ticker-upbit-*');
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');
      const bithumbKeys = await this.redisService.getKeys('ticker-bithumb-*');
      const coinoneKeys = await this.redisService.getKeys('ticker-coinone-*');
      const okxKeys = await this.redisService.getKeys('ticker-okx-*');

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

      // Process Okx data
      for (const key of okxKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        const symbol = tickerData.baseToken;

        if (!premiumData[`${symbol}-${tickerData.quoteToken}`]) {
          premiumData[`${symbol}-${tickerData.quoteToken}`] = {};
        }

        premiumData[`${symbol}-${tickerData.quoteToken}`].okx = {
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

      // Close predictions
      await this.predictService.closePredict(premiumData);

      // Emit the consolidated data
      this.appGateway.emitCoinPremium(premiumData);
    } catch (error) {
      this.logger.error('Error processing market data:', error);
    }
  }

  async getUSDPrice() {
    const price = await this.redisService.get('krw-usd-rate');
    return price;
  }

  async getMarkets() {
    try {
      const [upbitData, bithumbData, binanceData, okxData] = await Promise.all([
        this.db.select().from(upbitMarkets),
        this.db.select().from(bithumbMarkets),
        this.db.select().from(binanceMarkets),
        this.db.select().from(okxMarkets),
      ]);

      return {
        upbit: upbitData,
        bithumb: bithumbData,
        binance: binanceData,
        okx: okxData,
      };
    } catch (error) {
      this.logger.error('Failed to get markets:', error);
      throw error;
    }
  }

  @Cron('0 0 0 * * *') // Runs at midnight every day
  async fetchGlobalMetrics() {
    try {
      this.logger.log('Fetching global metrics data from CoinMarketCap...');
      const response = await axios.get(this.CMC_API_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
      });

      if (response.data && response.data.data) {
        const metrics = response.data.data;

        // Store the entire metrics data
        await this.redisService.set(
          this.GLOBAL_METRICS_KEY,
          JSON.stringify(metrics),
          // Cache for 24 hours + 1 hour buffer
          25 * 60 * 60,
        );

        // Store individual important metrics separately for easier access
        const usdQuote = metrics.quote.USD;
        const keyMetrics = {
          btc_dominance: metrics.btc_dominance,
          eth_dominance: metrics.eth_dominance,
          total_market_cap: usdQuote.total_market_cap,
          total_volume_24h: usdQuote.total_volume_24h,
          defi_market_cap: usdQuote.defi_market_cap,
          stablecoin_market_cap: usdQuote.stablecoin_market_cap,
          last_updated: metrics.last_updated,
        };

        await this.redisService.set(
          'global-metrics-summary',
          JSON.stringify(keyMetrics),
          25 * 60 * 60,
        );

        this.logger.log('Global metrics data successfully fetched and cached');
      }
    } catch (error) {
      this.logger.error('Error fetching global metrics:', error);
    }
  }

  @Cron('0 0 0 * * *') // Runs at midnight every day
  async fetchFearGreedIndex() {
    try {
      const response = await axios.get(this.FEAR_GREED_INDEX_API_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
      });

      if (response.data && response.data.data) {
        const fearGreedIndex = response.data.data;
        await this.redisService.set(
          'fear-greed-index',
          JSON.stringify(fearGreedIndex),
        );
      }
    } catch (error) {
      this.logger.error('Error fetching fear and greed index:', error);
    }
  }

  async getFearGreedIndex() {
    const data = await this.redisService.get('fear-greed-index');
    return data ? JSON.parse(data) : null;
  }

  // Helper method to get cached global metrics
  async getGlobalMetrics() {
    try {
      const data = await this.redisService.get(this.GLOBAL_METRICS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Error getting global metrics:', error.message);
      return null;
    }
  }

  // Helper method to get cached summary metrics
  async getGlobalMetricsSummary() {
    try {
      const data = await this.redisService.get('global-metrics-summary');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Error getting global metrics summary:', error.message);
      return null;
    }
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleClient } from '../database/database.module';
import { UpbitClient } from './clients/upbit.client';
import { upbitMarkets } from '../database/schema/market';
import { ExchangeRateClient } from './clients/exchange-rate.client';
import { RedisService } from '../redis/redis.service';
import { exchangeRates } from '../database/schema/exchange-rate';
import { AppGateway } from '../gateway/app.gateway';
import axios from 'axios';
import { BithumbMarketResponse } from './types/bithumb.types';
import { bithumbMarkets } from '../database/schema/market';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor(
    private readonly upbitClient: UpbitClient,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly exchangeRateClient: ExchangeRateClient,
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async collectHourData() {
    this.logger.debug('Collecting hourly data from exchanges...');
    // 시간별 데이터 수집 로직
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async collectDailyData() {
    this.logger.debug('Collecting daily data from exchanges...');
    // 일별 데이터 수집 로직
  }

  @Cron(CronExpression.EVERY_HOUR)
  async collectMarkets() {
    await Promise.all([
      this.collectUpbitMarkets(),
      this.collectBithumbMarkets(),
    ]);
  }

  private async collectUpbitMarkets() {
    try {
      this.logger.debug('Collecting Upbit markets...');
      const markets = await this.upbitClient.getMarkets();

      // Upsert markets data
      await this.db.transaction(async (tx) => {
        for (const market of markets) {
          const payload = {
            market: market.market,
            koreanName: market.korean_name,
            englishName: market.english_name,
            marketWarning: market.market_warning,
            updatedAt: new Date(),
          };

          await tx
            .insert(upbitMarkets)
            .values(payload)
            .onConflictDoUpdate({
              target: upbitMarkets.market,
              set: {
                koreanName: market.korean_name,
                englishName: market.english_name,
                marketWarning: market.market_warning,
                updatedAt: new Date(),
              },
            });
        }
      });
      this.logger.debug(`Updated ${markets.length} Upbit markets`);
    } catch (error) {
      this.logger.error('Failed to collect Upbit markets', error);
    }
  }

  @Cron('*/60 * * * * *') // Every 60 seconds
  async collectExchangeRate() {
    try {
      const rate = await this.exchangeRateClient.getUsdKrwRate();
      await this.redisService.set('krw-usd-rate', rate.toString(), 60); // 60초 TTL
      this.logger.debug(`Updated USD-KRW rate: ${rate}`);

      this.appGateway.emitExchangeRate({
        rate: rate,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error('Failed to collect exchange rate', error);
    }
  }

  // 매 초마다 저장된 환율을 조회하여 웹소켓으로 전송
  @Cron('*/1 * * * * *')
  async emitExchangeRate() {
    const rate = await this.redisService.get('krw-usd-rate');
    this.appGateway.emitExchangeRate({
      rate: Number(rate),
      timestamp: Date.now(),
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async storeExchangeRateHistory() {
    try {
      const rate = await this.exchangeRateClient.getUsdKrwRate();
      await this.db.insert(exchangeRates).values({
        rate: rate.toString(),
        timestamp: new Date(),
      });
      this.logger.debug(`Stored USD-KRW rate history: ${rate}`);
    } catch (error) {
      this.logger.error('Failed to store exchange rate history', error);
    }
  }

  private async collectBithumbMarkets() {
    try {
      this.logger.debug('Collecting Bithumb markets...');
      const response = await axios.get<BithumbMarketResponse[]>(
        'https://api.bithumb.com/v1/market/all?isDetails=true',
      );

      // Coin array
      const markets = response.data;

      // Store in Redis for WebSocket subscription
      await this.redisService.set(
        'bithumb-markets',
        JSON.stringify(markets),
        24 * 60 * 60, // 24 hours TTL
      );
      console.log('markets', markets);
      // Store in database
      await this.db.transaction(async (tx) => {
        markets.forEach(async (market) => {
          const payload = {
            market: `${market.market}`,
            koreanName: market.korean_name,
            englishName: market.english_name,
            marketWarning: market.market_warning,
            updatedAt: new Date(),
          };

          await tx
            .insert(bithumbMarkets)
            .values(payload)
            .onConflictDoUpdate({
              target: bithumbMarkets.market,
              set: {
                updatedAt: new Date(),
              },
            });
        });
      });

      this.logger.debug(`Updated ${markets.length} Bithumb markets`);
    } catch (error) {
      this.logger.error('Failed to collect Bithumb markets', error);
    }
  }
}

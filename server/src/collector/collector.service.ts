import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DrizzleClient } from '../database/database.module';
import { UpbitClient } from './clients/upbit.client';
import { upbitMarkets } from '../database/schema/market';
import { ExchangeRateClient } from './clients/exchange-rate.client';
import { RedisService } from '../redis/redis.service';
import { exchangeRates } from '../database/schema/exchange-rate';
import { exchangeFees } from '../database/schema/fee';
import { FeeClient } from './clients/fee.client';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly upbitClient: UpbitClient,
    @Inject('DATABASE') private readonly db: typeof DrizzleClient,
    private readonly exchangeRateClient: ExchangeRateClient,
    private readonly redisService: RedisService,
    private readonly feeClient: FeeClient,
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async collectUpbitMarkets() {
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

  @Cron('*/10 * * * * *') // Every 10 seconds
  async collectExchangeRate() {
    try {
      const rate = await this.exchangeRateClient.getUsdKrwRate();
      await this.redisService.set('krw-usd-rate', rate.toString(), 15); // 15초 TTL
      this.logger.debug(`Updated USD-KRW rate: ${rate}`);
    } catch (error) {
      this.logger.error('Failed to collect exchange rate', error);
    }
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async collectExchangeFees() {
    try {
      // Upbit 수수료 수집
      const upbitFees = await this.feeClient.getUpbitFees();

      // Binance 수수료 수집 (Upbit에서 지원하는 코인만)
      const upbitSymbols = upbitFees.map((fee) => fee.symbol);
      const binanceFees = await this.feeClient.getBinanceFees(upbitSymbols);

      // 수수료 정보 저장
      await this.db.transaction(async (tx) => {
        for (const fee of [...upbitFees, ...binanceFees]) {
          const exchange = fee.symbol.includes('UPBIT') ? 'upbit' : 'binance';
          await tx
            .insert(exchangeFees)
            .values({
              id: `${exchange}_${fee.symbol}_${fee.network}`,
              exchange,
              ...fee,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: exchangeFees.id,
              set: {
                withdrawalFee: fee.withdrawalFee,
                minimumWithdrawal: fee.minimumWithdrawal,
                depositFee: fee.depositFee,
                updatedAt: new Date(),
              },
            });
        }
      });

      this.logger.debug('Updated exchange fees');
    } catch (error) {
      this.logger.error('Failed to collect exchange fees', error);
    }
  }
}

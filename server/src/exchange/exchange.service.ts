import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly appGateway: AppGateway,
  ) {}

  @Interval(1000)
  async processMarketData() {
    try {
      // 각 거래소의 데이터 처리
      const upbitKeys = await this.redisService.getKeys('ticker-upbit-*');
      const binanceKeys = await this.redisService.getKeys('ticker-binance-*');

      // Upbit 데이터 처리
      for (const key of upbitKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        this.appGateway.emitCoinPrice({
          exchange: 'upbit',
          baseToken: tickerData.baseToken,
          quoteToken: tickerData.quoteToken,
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
        });
      }

      // Binance 데이터 처리
      for (const key of binanceKeys) {
        const data = await this.redisService.get(key);
        if (!data) continue;

        const tickerData = JSON.parse(data);
        this.appGateway.emitCoinPrice({
          exchange: 'binance',
          baseToken: tickerData.baseToken,
          quoteToken: tickerData.quoteToken,
          price: tickerData.price,
          timestamp: tickerData.timestamp,
          volume: tickerData.volume,
        });
      }
    } catch (error) {
      this.logger.error('Error processing market data:', error);
    }
  }
}

import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { CollectorModule } from '../collector/collector.module';
import { CollectorService } from '../collector/collector.service';
import { UpbitClient } from '../collector/clients/upbit.client';
import { ExchangeRateClient } from '../collector/clients/exchange-rate.client';
import { RedisService } from '../redis/redis.service';
import { FeeClient } from '../collector/clients/fee.client';

@Module({
  imports: [CollectorModule],
  controllers: [TestController],
  providers: [CollectorService, UpbitClient, ExchangeRateClient, RedisService, FeeClient],
})
export class TestModule {} 
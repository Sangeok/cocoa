import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CollectorService } from './collector.service';
import { UpbitClient } from './clients/upbit.client';
import { DatabaseModule } from '../database/database.module';
import { ExchangeRateClient } from './clients/exchange-rate.client';
import { RedisService } from './services/redis.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  providers: [
    CollectorService,
    UpbitClient,
    ExchangeRateClient,
    RedisService,
  ],
})
export class CollectorModule {} 
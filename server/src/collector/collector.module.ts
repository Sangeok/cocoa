import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CollectorService } from './collector.service';
import { UpbitClient } from './clients/upbit.client';
import { DatabaseModule } from '../database/database.module';
import { ExchangeRateClient } from './clients/exchange-rate.client';
import { RedisService } from '../redis/redis.service';
import { FeeClient } from './clients/fee.client';
import { UpbitWebsocketClient } from './clients/upbit-websocket.client';
import { MarketCodesService } from './services/market-codes.service';
import { AppGateway } from '../gateway/app.gateway';
import { ConfigService } from '@nestjs/config';
import { BinanceClient } from './clients/binance.client';

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
    ConfigService,
    FeeClient,
    UpbitWebsocketClient,
    MarketCodesService,
    AppGateway,
    BinanceClient,
  ],
  exports: [UpbitClient, UpbitWebsocketClient, BinanceClient],
})
export class CollectorModule {} 
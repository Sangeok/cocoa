import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CollectorService } from './collector.service';
import { UpbitClient } from './clients/upbit.client';
import { DatabaseModule } from '../database/database.module';
import { ExchangeRateClient } from './clients/exchange-rate.client';
import { RedisService } from '../redis/redis.service';
import { UpbitWebsocketClient } from './clients/upbit-websocket.client';
import { MarketCodesService } from './services/market-codes.service';
import { GatewayModule } from '../gateway/gateway.module';
import { BinanceClient } from './clients/binance.client';
import { FeeClient } from './clients/fee.client';
import { BithumbWebsocketClient } from './clients/bithumb-websocket.client';
import { OKXClient } from './clients/okx.client';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, GatewayModule],
  providers: [
    CollectorService,
    UpbitClient,
    ExchangeRateClient,
    RedisService,
    UpbitWebsocketClient,
    MarketCodesService,
    BinanceClient,
    FeeClient,
    OKXClient,
    BithumbWebsocketClient,
  ],
  exports: [
    UpbitClient,
    UpbitWebsocketClient,
    BinanceClient,
    OKXClient,
    BithumbWebsocketClient,
  ],
})
export class CollectorModule {}

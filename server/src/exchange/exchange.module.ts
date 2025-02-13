import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { RedisService } from '../redis/redis.service';
import { GatewayModule } from '../gateway/gateway.module';
import { PredictModule } from '../predict/predict.module';  

@Module({
  imports: [GatewayModule, PredictModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, RedisService],
  exports: [ExchangeService],
})
export class ExchangeModule {} 
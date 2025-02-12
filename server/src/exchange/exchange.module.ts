import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { RedisService } from '../redis/redis.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, RedisService],
  exports: [ExchangeService],
})
export class ExchangeModule {} 
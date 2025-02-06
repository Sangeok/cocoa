import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { RedisService } from '../redis/redis.service';
import { AppGateway } from '../gateway/app.gateway';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ExchangeController],
  providers: [ExchangeService, RedisService, AppGateway, ConfigService],
  exports: [ExchangeService],
})
export class ExchangeModule {} 
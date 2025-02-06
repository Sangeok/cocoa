import { Module } from '@nestjs/common';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { RedisService } from '../redis/redis.service';
import { FeeClient } from '../collector/clients/fee.client';

@Module({
  imports: [],
  controllers: [WithdrawController],
  providers: [WithdrawService, RedisService, FeeClient],
})
export class WithdrawModule {} 
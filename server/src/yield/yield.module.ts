import { Module } from '@nestjs/common';
import { YieldService } from './yield.service';
import { YieldController } from './yield.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [],
  providers: [YieldService, RedisService],
  controllers: [YieldController],
  exports: [YieldService],
})
export class YieldModule {}

import { Module } from '@nestjs/common';
import { PredictService } from './predict.service';
import { PredictController } from './predict.controller';
import { RedisService } from '../redis/redis.service';
import { GatewayModule } from '../gateway/gateway.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    GatewayModule,
    AdminModule,
  ],
  controllers: [PredictController],
  providers: [PredictService, RedisService],
  exports: [PredictService],
})
export class PredictModule {}

import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ChatModule } from '../chat/chat.module';
import { JwtService } from '@nestjs/jwt';
import { PredictService } from '../predict/predict.service';
import { RedisService } from '../redis/redis.service';

@Global()
@Module({
  imports: [ChatModule],
  providers: [AppGateway, JwtService, PredictService, RedisService],
  exports: [AppGateway],
})
export class GatewayModule {} 
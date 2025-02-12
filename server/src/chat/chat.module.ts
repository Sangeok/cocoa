import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [ChatService, RedisService],
  exports: [ChatService],
})
export class ChatModule {}

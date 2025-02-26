import { Module } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { GuestbookController } from './guestbook.controller';
import { NotificationModule } from '../notification/notification.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [NotificationModule],
  controllers: [GuestbookController],
  providers: [GuestbookService, RedisService],
  exports: [GuestbookService],
})
export class GuestbookModule {} 
import { Module } from '@nestjs/common';
import { StockDiscussionService } from './stock-discussion.service';
import { StockDiscussionController } from './stock-discussion.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [StockDiscussionController],
  providers: [StockDiscussionService],
  exports: [StockDiscussionService],
})
export class StockDiscussionModule {} 
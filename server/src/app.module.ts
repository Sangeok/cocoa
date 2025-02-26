import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeModule } from './exchange/exchange.module';
import { WithdrawModule } from './withdraw/withdraw.module';
import { NewsModule } from './news/news.module';
import { CollectorModule } from './collector/collector.module';
import { TestModule } from './test/test.module';
import { KolModule } from './kol/kol.module';
import { ChatModule } from './chat/chat.module';
import { GatewayModule } from './gateway/gateway.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { YieldModule } from './yield/yield.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { ProfileStatsModule } from './profile-stats/profile-stats.module';
import { NotificationModule } from './notification/notification.module';
import { StockDiscussionModule } from './stock-discussion/stock-discussion.module';
import { MessageModule } from './message/message.module';
import { AdminModule } from './admin/admin.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    GatewayModule,
    ExchangeModule,
    WithdrawModule,
    NewsModule,
    CollectorModule,
    TestModule,
    KolModule,
    ChatModule,
    UserModule,
    AuthModule,
    YieldModule,
    GuestbookModule,
    ProfileStatsModule,
    NotificationModule,
    StockDiscussionModule,
    MessageModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

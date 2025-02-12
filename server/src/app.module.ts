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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

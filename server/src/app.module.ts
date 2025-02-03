import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeModule } from './exchange/exchange.module';
import { PriceModule } from './price/price.module';
import { NewsModule } from './news/news.module';
import { CollectorModule } from './collector/collector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ExchangeModule,
    PriceModule,
    NewsModule,
    CollectorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { OpenAIClient } from './clients/openai.client';
import { TwitterClient } from './clients/twitter.client';
import { WebSearchClient } from './clients/web-search.client';
import { NewsRepository } from './news.repository';
import { UpbitClient } from '../collector/clients/upbit.client';
import { DrizzleClient } from '../database/database.module';
import { RedisService } from '../redis/redis.service';
@Module({
  controllers: [NewsController],
  providers: [
    NewsService,
    OpenAIClient,
    TwitterClient,
    WebSearchClient,
    NewsRepository,
    UpbitClient,
    RedisService,
    {
      provide: 'DATABASE',
      useValue: DrizzleClient,
    },
  ],
  exports: [NewsService],
})
export class NewsModule {} 
import { Injectable, Inject } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { news } from '../database/schema/news';
import { desc } from 'drizzle-orm';

interface NewsData {
  symbol: string;
  content: string;
  timestamp: Date;
  marketData: {
    volume: number;
    priceChange: number;
    currentPrice: number;
  };
}

@Injectable()
export class NewsRepository {
  constructor(@Inject('DATABASE') private readonly db: typeof DrizzleClient) {}

  async saveNews(newsData: NewsData) {
    return await this.db.insert(news).values({
      symbol: newsData.symbol,
      content: newsData.content,
      timestamp: newsData.timestamp,
      marketData: newsData.marketData,
    });
  }

  async getLatestNews(limit = 10) {
    return await this.db.select()
      .from(news)
      .orderBy(desc(news.timestamp))
      .limit(limit);
  }
} 
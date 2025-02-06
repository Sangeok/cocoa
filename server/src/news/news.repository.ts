import { Injectable, Inject } from '@nestjs/common';
import { DrizzleClient } from '../database/database.module';
import { news } from '../database/schema/news';
import { desc, eq, and, gte, lte, SQL } from 'drizzle-orm';
import { NewsData, NewsQueryOptions } from './types/news.types';

@Injectable()
export class NewsRepository {
  constructor(@Inject('DATABASE') private readonly db: typeof DrizzleClient) {}

  async saveNews(newsData: NewsData) {
    return await this.db.insert(news).values({
      title: newsData.title,
      symbol: newsData.symbol,
      content: newsData.content,
      timestamp: newsData.timestamp,
      marketData: newsData.marketData,
    });
  }

  async getLatestNews(limit = 10) {
    return await this.db
      .select()
      .from(news)
      .orderBy(desc(news.timestamp))
      .limit(limit);
  }

  async findNews(options: NewsQueryOptions) {
    let query: any;

    query = this.db.select().from(news);

    // Where 조건 적용
    if (options.where) {
      const conditions: SQL[] = [];

      if (options.where.symbol) {
        conditions.push(eq(news.symbol, options.where.symbol));
      }

      if (options.where.timestamp?.gte) {
        conditions.push(gte(news.timestamp, options.where.timestamp.gte));
      }

      if (options.where.timestamp?.lte) {
        conditions.push(lte(news.timestamp, options.where.timestamp.lte));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    // 정렬 적용
    if (options.orderBy) {
      const [field, direction] = Object.entries(options.orderBy)[0]; // 첫 번째 정렬 조건만 사용
      if (field === 'timestamp') {
        query = query.orderBy(
          direction === 'desc' ? desc(news.timestamp) : news.timestamp,
        );
      }
    }

    // 페이지네이션 적용
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  async findNewsById(id: string) {
    return await this.db.select().from(news).where(eq(news.id, id));
  }
}

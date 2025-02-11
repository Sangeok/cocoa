import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  symbol: text('symbol').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  marketData: jsonb('market_data').notNull(),
  newsData: jsonb('news_data'),
  type: text('type').default('COIN'),
});

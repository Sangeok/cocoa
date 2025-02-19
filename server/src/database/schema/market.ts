import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const upbitMarkets = pgTable('upbit_markets', {
  market: varchar('market').primaryKey(), // KRW-BTC
  koreanName: text('korean_name'), // 비트코인
  englishName: text('english_name'), // Bitcoin
  marketWarning: varchar('market_warning').default('NONE'), // NONE, CAUTION
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UpbitMarket = typeof upbitMarkets.$inferSelect;
export type NewUpbitMarket = typeof upbitMarkets.$inferInsert; 

export const bithumbMarkets = pgTable('bithumb_markets', {
  market: varchar('market').primaryKey(), // BTC-KRW
  koreanName: text('korean_name'), // 비트코인
  englishName: text('english_name'), // Bitcoin
  marketWarning: varchar('market_warning').default('NONE'), // NONE, CAUTION
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type BithumbMarket = typeof bithumbMarkets.$inferSelect;
export type NewBithumbMarket = typeof bithumbMarkets.$inferInsert;

export const binanceMarkets = pgTable('binance_markets', {
  symbol: varchar('symbol').primaryKey(),  // 예: 'BTCUSDT'
  baseToken: varchar('base_token'),        // 예: 'BTC'
  quoteToken: varchar('quote_token'),      // 예: 'USDT'
  validatedAt: timestamp('validated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type BinanceMarket = typeof binanceMarkets.$inferSelect;
export type NewBinanceMarket = typeof binanceMarkets.$inferInsert;

export const okxMarkets = pgTable('okx_markets', {
  symbol: varchar('symbol').primaryKey(),  // 예: 'BTCUSDT'
  baseToken: varchar('base_token'),        // 예: 'BTC'
  quoteToken: varchar('quote_token'),      // 예: 'USDT'
  validatedAt: timestamp('validated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type OkxMarket = typeof okxMarkets.$inferSelect;
export type NewOkxMarket = typeof okxMarkets.$inferInsert;


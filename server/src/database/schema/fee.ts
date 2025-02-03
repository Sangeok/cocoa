import { pgTable, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';

export const exchangeFees = pgTable('exchange_fees', {
  id: varchar('id').primaryKey(), // {exchange}_{symbol}_{network}, e.g., "upbit_BTC_BTC"
  exchange: varchar('exchange').notNull(), // upbit, binance
  symbol: varchar('symbol').notNull(), // BTC, ETH, etc
  network: varchar('network').notNull(), // BTC, ETH, BNB, etc
  withdrawalFee: decimal('withdrawal_fee', { precision: 18, scale: 8 }),
  minimumWithdrawal: decimal('minimum_withdrawal', { precision: 18, scale: 8 }),
  depositFee: decimal('deposit_fee', { precision: 18, scale: 8 }),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 
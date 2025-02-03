import { pgTable, timestamp, decimal } from 'drizzle-orm/pg-core';

export const exchangeRates = pgTable('exchange_rates', {
  timestamp: timestamp('timestamp').primaryKey(),
  rate: decimal('rate', { precision: 10, scale: 2 }),
}); 
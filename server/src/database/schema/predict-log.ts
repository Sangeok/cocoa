import { pgTable, serial, integer, timestamp, varchar, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { predicts } from './predict';

export const predictLogs = pgTable('predict_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => predicts.userId),
  market: varchar('market').notNull(),
  exchange: varchar('exchange').notNull(),
  entryPrice: decimal('entry_price').notNull(),
  closePrice: decimal('close_price').notNull(),
  deposit: decimal('deposit').notNull(),
  position: varchar('position').notNull(),
  leverage: integer('leverage').notNull().default(20),
  entryAt: timestamp('entry_at').notNull(),
  exitAt: timestamp('exit_at').notNull(),
});

export const predictLogsRelations = relations(predictLogs, ({ one }) => ({
  predict: one(predicts, {
    fields: [predictLogs.userId],
    references: [predicts.userId],
  }),
}));

export type PredictLog = typeof predictLogs.$inferSelect;
export type NewPredictLog = typeof predictLogs.$inferInsert;

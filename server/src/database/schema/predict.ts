import { pgTable, serial, integer, timestamp, varchar, decimal } from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';
import { predictLogs } from './predict-log';

export const predicts = pgTable('predicts', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  vault: decimal('vault').notNull().default('10000'),
  lastPredictAt: timestamp('last_predict_at').notNull(),
  lastCheckInAt: timestamp('last_check_in_at'),
});

export const predictsRelations = relations(predicts, ({ one, many }) => ({
  user: one(users, {
    fields: [predicts.userId],
    references: [users.id],
  }),
  logs: many(predictLogs),
}));

export type Predict = typeof predicts.$inferSelect;
export type NewPredict = typeof predicts.$inferInsert;

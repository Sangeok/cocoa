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
  longCount: integer('long_count').notNull().default(0),   // 롱 포지션 횟수
  shortCount: integer('short_count').notNull().default(0), // 숏 포지션 횟수
  maxWinStreak: integer('max_win_streak').notNull().default(0),  // 최다 연승
  maxLoseStreak: integer('max_lose_streak').notNull().default(0), // 최다 연패
  currentWinStreak: integer('current_win_streak').notNull().default(0), // 현재 연승
  currentLoseStreak: integer('current_lose_streak').notNull().default(0), // 현재 연패
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

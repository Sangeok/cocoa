import { pgTable, integer, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const profileStats = pgTable('profile_stats', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  totalVisits: integer('total_visits').notNull().default(0),
  todayVisits: integer('today_visits').notNull().default(0),
  lastResetAt: timestamp('last_reset_at').notNull().defaultNow(), // 일일 방문자 수 리셋 시간 기록
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});

export const profileStatsRelations = relations(profileStats, ({ one }) => ({
  user: one(users, {
    fields: [profileStats.userId],
    references: [users.id],
  }),
}));

export type ProfileStats = typeof profileStats.$inferSelect;
export type NewProfileStats = typeof profileStats.$inferInsert; 
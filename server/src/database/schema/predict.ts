import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const predicts = pgTable('predicts', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  lastPredictAt: timestamp('last_predict_at').notNull(),
});

export const predictsRelations = relations(predicts, ({ one }) => ({
  user: one(users, {
    fields: [predicts.userId],
    references: [users.id],
  }),
}));

export type Predict = typeof predicts.$inferSelect;
export type NewPredict = typeof predicts.$inferInsert;

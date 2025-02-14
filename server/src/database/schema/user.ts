import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { predicts } from './predict';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  socialId: varchar('social_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 255 }).default(''),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userRelations = relations(users, ({ one }) => ({
  predict: one(predicts, {
    fields: [users.id],
    references: [predicts.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';
import { guestbookComments } from './guestbook-comment';

export const guestbooks = pgTable('guestbooks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  content: varchar('content', { length: 200 }).notNull(),
  targetUserId: integer('target_user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  isSecret: boolean('is_secret').notNull().default(false),
});

export const guestbooksRelations = relations(guestbooks, ({ one, many }) => ({
  user: one(users, {
    fields: [guestbooks.userId],
    references: [users.id],
  }),
  comments: many(guestbookComments),
}));

export type Guestbook = typeof guestbooks.$inferSelect;
export type NewGuestbook = typeof guestbooks.$inferInsert;

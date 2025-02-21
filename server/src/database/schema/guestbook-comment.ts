import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './user';
import { guestbooks } from './guestbook';
import { relations } from 'drizzle-orm';

export const guestbookComments = pgTable('guestbook_comments', {
  id: serial('id').primaryKey(),
  guestbookId: integer('guestbook_id')
    .notNull()
    .references(() => guestbooks.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  content: varchar('content', { length: 200 }).notNull(),
  mentionedUserId: integer('mentioned_user_id')
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  isSecret: boolean('is_secret').notNull().default(false),
});

export const guestbookCommentsRelations = relations(guestbookComments, ({ one }) => ({
  user: one(users, {
    fields: [guestbookComments.userId],
    references: [users.id],
  }),
  mentionedUser: one(users, {
    fields: [guestbookComments.mentionedUserId],
    references: [users.id],
  }),
  guestbook: one(guestbooks, {
    fields: [guestbookComments.guestbookId],
    references: [guestbooks.id],
  }),
}));

export type GuestbookComment = typeof guestbookComments.$inferSelect;
export type NewGuestbookComment = typeof guestbookComments.$inferInsert; 
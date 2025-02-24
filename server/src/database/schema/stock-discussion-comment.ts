import { pgTable, serial, integer, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './user';
import { stockDiscussions } from './stock-discussion';
import { relations } from 'drizzle-orm';

export const stockDiscussionComments = pgTable('stock_discussion_comments', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id')
    .notNull()
    .references(() => stockDiscussions.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  content: varchar('content', { length: 200 }).notNull(),
  mentionedUserId: integer('mentioned_user_id')
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const stockDiscussionCommentsRelations = relations(stockDiscussionComments, ({ one }) => ({
  user: one(users, {
    fields: [stockDiscussionComments.userId],
    references: [users.id],
  }),
  mentionedUser: one(users, {
    fields: [stockDiscussionComments.mentionedUserId],
    references: [users.id],
  }),
  discussion: one(stockDiscussions, {
    fields: [stockDiscussionComments.discussionId],
    references: [stockDiscussions.id],
  }),
}));

export type StockDiscussionComment = typeof stockDiscussionComments.$inferSelect;
export type NewStockDiscussionComment = typeof stockDiscussionComments.$inferInsert; 
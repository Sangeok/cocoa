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
import { stockDiscussionComments } from './stock-discussion-comment';

export const stockDiscussions = pgTable('stock_discussions', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id),
  content: varchar('content', { length: 200 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const stockDiscussionsRelations = relations(stockDiscussions, ({ one, many }) => ({
  author: one(users, {
    fields: [stockDiscussions.authorId],
    references: [users.id],
  }),
  comments: many(stockDiscussionComments),
}));

export type StockDiscussion = typeof stockDiscussions.$inferSelect;
export type NewStockDiscussion = typeof stockDiscussions.$inferInsert; 
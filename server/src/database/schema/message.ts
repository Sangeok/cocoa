import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { admins } from './admin';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull().references(() => admins.id),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messageRelations = relations(messages, ({ one }) => ({
  admin: one(admins, {
    fields: [messages.adminId],
    references: [admins.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert; 
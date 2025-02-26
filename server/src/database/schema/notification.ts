import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

// 알림 타입 정의
export type NotificationType =
  | 'NEW_GUESTBOOK'
  | 'NEW_COMMENT'
  | 'NEW_COMMENT_STOCK_DISCUSSION'
  | 'NEW_ADMIN_MESSAGE';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id), // 알림 수신자
  senderId: integer('sender_id')
    .notNull()
    .references(() => users.id), // 알림 발신자
  type: varchar('type', { length: 30 }).notNull(),
  content: varchar('content', { length: 200 }).notNull(), // 알림 내용 (길이 200 유지)
  targetId: integer('target_id').notNull(), // 방명록 또는 댓글의 ID
  targetUserId: integer('target_user_id'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

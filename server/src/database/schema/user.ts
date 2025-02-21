import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { predicts } from './predict';

// 금지된 닉네임 목록
export const FORBIDDEN_USERNAMES = [
  '관리자',
  '코코아',
  '코인코인코리아',
  'cocoa',
  'coincoin.kr',
  '비공개',
  '운영자',
];

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  socialId: varchar('social_id', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 255 }).default(''),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  bio: text('bio').default(''),
  telegram: varchar('telegram', { length: 50 }).default(''),
  youtube: varchar('youtube', { length: 50 }).default(''),
  instagram: varchar('instagram', { length: 50 }).default(''),
  twitter: varchar('twitter', { length: 50 }).default(''),
  discord: varchar('discord', { length: 50 }).default(''),
  homepage: varchar('homepage', { length: 255 }).default(''),
  github: varchar('github', { length: 50 }).default(''),
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

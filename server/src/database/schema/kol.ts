import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const kols = pgTable('kols', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  telegram: text('telegram'),
  youtube: text('youtube'),
  x: text('x'),
  followers: integer('followers').notNull(),
  image: text('image').notNull(),
  keywords: text('keywords').array().notNull(),
  selfIntroduction: text('self_introduction').notNull(),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type KOL = typeof kols.$inferSelect;
export type NewKOL = typeof kols.$inferInsert; 
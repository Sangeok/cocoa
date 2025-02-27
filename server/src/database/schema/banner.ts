import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  position: integer('position').notNull(),
  pages: text('pages').array().notNull(),
  desktopImageUrl: text('desktop_image_url').notNull(),
  tabletImageUrl: text('tablet_image_url').notNull(),
  mobileImageUrl: text('mobile_image_url').notNull(),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at').notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bannerRelations = relations(banners, ({ one }) => ({
  user: one(users, {
    fields: [banners.userId],
    references: [users.id],
  }),
}));

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;

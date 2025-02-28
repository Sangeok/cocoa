import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  decimal,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { relations } from 'drizzle-orm';

export const bannerItems = pgTable('banner_items', {
  id: serial('id').primaryKey(),
  routePath: varchar('route_path', { length: 255 }).notNull(),
  previewImageUrl: text('preview_image_url').notNull(),
  deviceType: varchar('device_type', { length: 20 }).notNull(), // 'desktop', 'tablet', 'mobile'
  position: varchar('position', { length: 20 }).notNull(), // 'top', 'middle', 'bottom'
  recommendedImageSize: text('recommended_image_size').notNull(), // e.g. "1920x300"
  pricePerDay: decimal('price_per_day', { precision: 10, scale: 2 }).notNull(),
  cocoaMoneyPerDay: decimal('cocoa_money_per_day', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    // 동일한 페이지, 위치, 디바이스 타입에 대한 중복 방지
    uniquePositionPerRoute: uniqueIndex('unique_position_per_route').on(
      table.routePath,
      table.position,
      table.deviceType
    ),
  };
});

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  bannerItemId: integer('banner_item_id')
    .notNull()
    .references(() => bannerItems.id),
  imageUrl: text('image_url').notNull(),
  forwardUrl: text('forward_url').notNull(),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bannerRelations = relations(banners, ({ one }) => ({
  user: one(users, {
    fields: [banners.userId],
    references: [users.id],
  }),
  bannerItem: one(bannerItems, {
    fields: [banners.bannerItemId],
    references: [bannerItems.id],
  }),
}));

export const bannerItemRelations = relations(bannerItems, ({ many }) => ({
  banners: many(banners),
}));

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;
export type BannerItem = typeof bannerItems.$inferSelect;
export type NewBannerItem = typeof bannerItems.$inferInsert;

CREATE TABLE "banner_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_path" varchar(255) NOT NULL,
	"preview_image_url" text NOT NULL,
	"device_type" varchar(20) NOT NULL,
	"position" varchar(20) NOT NULL,
	"recommended_image_size" text NOT NULL,
	"price_per_day" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "banner_item_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "image_url" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_position_per_route" ON "banner_items" USING btree ("route_path","position","device_type");--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_banner_item_id_banner_items_id_fk" FOREIGN KEY ("banner_item_id") REFERENCES "public"."banner_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "pages";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "desktop_image_url";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "tablet_image_url";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "mobile_image_url";--> statement-breakpoint
ALTER TABLE "banners" DROP COLUMN "registered_at";
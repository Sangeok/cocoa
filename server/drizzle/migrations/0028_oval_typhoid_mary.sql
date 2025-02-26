ALTER TABLE "admins" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;
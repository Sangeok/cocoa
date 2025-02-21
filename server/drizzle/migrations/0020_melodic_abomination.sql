ALTER TABLE "guestbook_comments" ADD COLUMN "is_secret" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "guestbooks" ADD COLUMN "is_secret" boolean DEFAULT false NOT NULL;
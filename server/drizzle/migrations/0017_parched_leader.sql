ALTER TABLE "profile_stats" DROP CONSTRAINT "profile_stats_user_id_pk";--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "visitor_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD CONSTRAINT "profile_stats_visitor_id_users_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "total_visits";--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "today_visits";--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "last_reset_at";
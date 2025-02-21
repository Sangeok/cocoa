ALTER TABLE "profile_stats" DROP CONSTRAINT "profile_stats_visitor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_stats" ADD CONSTRAINT "profile_stats_user_id_pk" PRIMARY KEY("user_id");--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "total_visits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "today_visits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD COLUMN "last_reset_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "visitor_id";--> statement-breakpoint
ALTER TABLE "profile_stats" DROP COLUMN "created_at";
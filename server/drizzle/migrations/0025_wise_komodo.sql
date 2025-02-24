ALTER TABLE "profile_stats" DROP CONSTRAINT "profile_stats_user_id_pk";--> statement-breakpoint
ALTER TABLE "profile_stats" ADD PRIMARY KEY ("user_id");
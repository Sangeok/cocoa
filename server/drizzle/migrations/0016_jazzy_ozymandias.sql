CREATE TABLE "guestbook_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"guestbook_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" varchar(200) NOT NULL,
	"mentioned_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guestbooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" varchar(200) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"content" varchar(200) NOT NULL,
	"target_id" integer NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_stats" (
	"user_id" integer NOT NULL,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"today_visits" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_stats_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "long_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "short_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "max_win_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "max_lose_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "current_win_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "current_lose_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guestbook_comments" ADD CONSTRAINT "guestbook_comments_guestbook_id_guestbooks_id_fk" FOREIGN KEY ("guestbook_id") REFERENCES "public"."guestbooks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbook_comments" ADD CONSTRAINT "guestbook_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbook_comments" ADD CONSTRAINT "guestbook_comments_mentioned_user_id_users_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guestbooks" ADD CONSTRAINT "guestbooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_stats" ADD CONSTRAINT "profile_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
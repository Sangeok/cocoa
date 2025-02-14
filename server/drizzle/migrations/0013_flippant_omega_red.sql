ALTER TABLE "predict_logs" RENAME COLUMN "exit_price" TO "close_price";--> statement-breakpoint
ALTER TABLE "predict_logs" ADD COLUMN "position" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "last_check_in_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(255) DEFAULT '';
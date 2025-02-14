CREATE TABLE "predict_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"market" varchar NOT NULL,
	"exchange" varchar NOT NULL,
	"entry_price" numeric NOT NULL,
	"exit_price" numeric NOT NULL,
	"deposit" numeric NOT NULL,
	"leverage" integer DEFAULT 20 NOT NULL,
	"entry_at" timestamp NOT NULL,
	"exit_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predicts" ADD COLUMN "vault" numeric DEFAULT '10000' NOT NULL;--> statement-breakpoint
ALTER TABLE "predict_logs" ADD CONSTRAINT "predict_logs_user_id_predicts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."predicts"("user_id") ON DELETE no action ON UPDATE no action;
CREATE TABLE "exchange_rates" (
	"timestamp" timestamp PRIMARY KEY NOT NULL,
	"rate" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "exchange_fees" (
	"id" varchar PRIMARY KEY NOT NULL,
	"exchange" varchar NOT NULL,
	"symbol" varchar NOT NULL,
	"network" varchar NOT NULL,
	"withdrawal_fee" numeric(18, 8),
	"minimum_withdrawal" numeric(18, 8),
	"deposit_fee" numeric(18, 8),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "upbit_markets" (
	"market" varchar PRIMARY KEY NOT NULL,
	"korean_name" text,
	"english_name" text,
	"market_warning" varchar DEFAULT 'NONE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"market_data" jsonb NOT NULL
);

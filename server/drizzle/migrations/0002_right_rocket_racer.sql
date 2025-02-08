CREATE TABLE "bithumb_markets" (
	"market" varchar PRIMARY KEY NOT NULL,
	"korean_name" text,
	"english_name" text,
	"market_warning" varchar DEFAULT 'NONE',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

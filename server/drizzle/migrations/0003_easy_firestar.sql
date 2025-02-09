CREATE TABLE "binance_markets" (
	"symbol" varchar PRIMARY KEY NOT NULL,
	"base_token" varchar,
	"quote_token" varchar,
	"validated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

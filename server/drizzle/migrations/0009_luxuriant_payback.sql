CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "timestamp" timestamp PRIMARY KEY NOT NULL,
  "rate" numeric(10, 2)
);

CREATE TABLE IF NOT EXISTS "exchange_fees" (
  "id" varchar PRIMARY KEY NOT NULL,
  "exchange" varchar NOT NULL,
  "symbol" varchar NOT NULL,
  "network" varchar NOT NULL,
  "withdrawal_fee" numeric(18, 8),
  "minimum_withdrawal" numeric(18, 8),
  "deposit_fee" numeric(18, 8),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "binance_markets" (
  "symbol" varchar PRIMARY KEY NOT NULL,
  "base_token" varchar,
  "quote_token" varchar,
  "validated_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "bithumb_markets" (
  "market" varchar PRIMARY KEY NOT NULL,
  "korean_name" text,
  "english_name" text,
  "market_warning" varchar DEFAULT 'NONE',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "upbit_markets" (
  "market" varchar PRIMARY KEY NOT NULL,
  "korean_name" text,
  "english_name" text,
  "market_warning" varchar DEFAULT 'NONE',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "kols" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "telegram" text,
  "youtube" text,
  "x" text,
  "followers" integer NOT NULL,
  "image" text NOT NULL,
  "keywords" text[] NOT NULL,
  "self_introduction" text NOT NULL,
  "registered_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "news" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "symbol" text NOT NULL,
  "content" text NOT NULL,
  "timestamp" timestamp NOT NULL,
  "market_data" jsonb NOT NULL,
  "news_data" jsonb,
  "type" text DEFAULT 'COIN'
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "social_id" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "provider" varchar(50) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "users_social_id_unique" UNIQUE ("social_id")
);

CREATE TABLE IF NOT EXISTS "predicts" (
  "user_id" integer PRIMARY KEY NOT NULL,
  "wins" integer NOT NULL DEFAULT 0,
  "losses" integer NOT NULL DEFAULT 0,
  "draws" integer NOT NULL DEFAULT 0,
  "last_predict_at" timestamp NOT NULL,
  CONSTRAINT "predicts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
); 
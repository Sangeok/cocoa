CREATE TABLE "kols" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"telegram" text,
	"youtube" text,
	"x" text,
	"followers" integer NOT NULL,
	"image" text NOT NULL,
	"keywords" text[] NOT NULL,
	"self_introduction" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

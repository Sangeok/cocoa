CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"social_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_social_id_unique" UNIQUE("social_id")
);

ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE varchar(30);
ALTER TABLE "notifications" ADD COLUMN "target_user_id" integer;
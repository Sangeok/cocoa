-- 임시 테이블 생성
CREATE TABLE "profile_stats_new" (
  "user_id" integer NOT NULL,
  "total_visits" integer NOT NULL DEFAULT 0,
  "today_visits" integer NOT NULL DEFAULT 0,
  "last_reset_at" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id")
);

-- 기존 데이터 복사
INSERT INTO "profile_stats_new" 
SELECT * FROM "profile_stats";

-- 기존 테이블 삭제
DROP TABLE "profile_stats";

-- 새 테이블 이름 변경
ALTER TABLE "profile_stats_new" RENAME TO "profile_stats";

-- Foreign key 제약 조건 추가
ALTER TABLE "profile_stats" 
ADD CONSTRAINT "profile_stats_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id"); 
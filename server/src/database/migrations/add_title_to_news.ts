import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export async function up() {
  await db.execute(sql`
    ALTER TABLE news
    ADD COLUMN title TEXT NOT NULL DEFAULT 'No Title';
  `);
  
  // Remove the default after adding the column
  await db.execute(sql`
    ALTER TABLE news
    ALTER COLUMN title DROP DEFAULT;
  `);
}

export async function down() {
  await db.execute(sql`
    ALTER TABLE news
    DROP COLUMN title;
  `);
} 
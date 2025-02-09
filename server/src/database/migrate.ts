import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseMigration');

async function main() {
  logger.log('Starting database migration...');

  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
  

  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: 'drizzle',
      migrationsTable: 'migrations',
    });
    logger.log('Migration completed successfully');
  } catch (error) {
    // 테이블이 이미 존재하는 경우 (42P07) 무시
    if (error.code === '42P07') {
      logger.warn('Some tables already exist, continuing...');
    } else {
      logger.error('Migration failed:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 
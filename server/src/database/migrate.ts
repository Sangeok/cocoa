import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { config } from '../config';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseMigration');

async function main() {
  logger.log('Starting database migration...');

  const pool = new Pool({
    connectionString: config.database.url,
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
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/database/schema/*',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/cocoa_dev',
  },
};

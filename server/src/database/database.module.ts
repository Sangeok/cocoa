import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DrizzleClient = drizzle({
  connection: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT!),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get('POSTGRES_HOST'),
          port: parseInt(configService.get('POSTGRES_PORT', '5432')),
          user: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database: configService.get('POSTGRES_DB'),
          max: parseInt(configService.get('POSTGRES_MAX_CONNECTIONS', '100')),
          idleTimeoutMillis: parseInt(
            configService.get('POSTGRES_IDLE_TIMEOUT', '30000'),
          ),
          connectionTimeoutMillis: 2000,
        });

        // Test connection
        try {
          const client = await pool.connect();
          client.release();
          console.log('Database connection successful');
        } catch (error) {
          console.error('Failed to connect to database:', error);
          throw error;
        }

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}

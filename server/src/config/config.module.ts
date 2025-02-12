import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000'),

  // Database
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().default('5432'),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_MAX_CONNECTIONS: z.string().default('100'),
  POSTGRES_IDLE_TIMEOUT: z.string().default('30000'),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),

  // Binance
  BINANCE_API_KEY: z.string(),
  BINANCE_SECRET_KEY: z.string(),

  // OpenRouter
  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_HTTP_REFERER: z.string(),

  // Twitter
  TWITTER_BEARER_TOKEN: z.string(),

  // News API
  NEWS_API_KEY: z.string(),

  // Chat
  CORS_ORIGIN: z.string(),

  // Google
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // Naver
  NAVER_CLIENT_ID: z.string(),
  NAVER_CLIENT_SECRET: z.string(),
});

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config: Record<string, unknown>) => {
        try {
          return envSchema.parse(config);
        } catch (error) {
          console.error('Environment validation error:', error);
          throw error;
        }
      },
    }),
  ],
})
export class ConfigModule {}

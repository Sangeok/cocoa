import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('NODE_ENV') === 'production' 
      ? this.configService.get('REDIS_HOST', 'redis')
      : 'localhost';
    
    this.client = createClient({
      url: `redis://${host}:${this.configService.get('REDIS_PORT', '6379')}`
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // 개발 환경에서는 Redis 연결 실패를 허용
      if (this.configService.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  async set(key: string, value: string, ttl?: number) {
    try {
      if (ttl) {
        await this.client.set(key, value, { EX: ttl });
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      // Redis 작업 실패를 조용히 처리
    }
  }

  async get(key: string) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async getKeys(pattern: string) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis getKeys error:', error);
      return [];
    }
  }
} 
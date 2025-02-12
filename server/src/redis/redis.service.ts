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

  async debugKeys(pattern: string) {
    const keys = await this.client.keys(pattern);
    const values = await Promise.all(
      keys.map(async key => {
        const value = await this.client.get(key);
        return { key, value };
      })
    );
    return values;
  }

  async flushAll() {
    await this.client.flushAll();
  }

  async del(...keys: string[]) {
    await this.client.del(keys);
  }

  async lpush(key: string, value: string) {
    try {
      return await this.client.lPush(key, value);
    } catch (error) {
      console.error('Redis lpush error:', error);
      return 0;
    }
  }

  async ltrim(key: string, start: number, stop: number) {
    try {
      return await this.client.lTrim(key, start, stop);
    } catch (error) {
      console.error('Redis ltrim error:', error);
    }
  }

  async lrange(key: string, start: number, stop: number) {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      console.error('Redis lrange error:', error);
      return [];
    }
  }
} 
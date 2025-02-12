import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CoinTalkMessageData, GlobalChatMessageData } from './chat.type';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MESSAGE_TTL = 3600; // 1시간
  private readonly MAX_MESSAGES = 100; // 최대 메시지 수
  private readonly GLOBAL_CHAT_KEY = 'chat:global';

  constructor(
    private readonly redisService: RedisService,
  ) {}

  private getRedisKey(symbol: string) {
    return `chat:${symbol}`;
  }

  async sendMessage(data: CoinTalkMessageData) {
    try {
      const key = this.getRedisKey(data.symbol);
      const existingMessages = await this.getMessages(data.symbol);
      const newMessages = [data, ...existingMessages].slice(0, this.MAX_MESSAGES);

      await this.redisService.set(
        key,
        JSON.stringify(newMessages),
        this.MESSAGE_TTL
      );
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendGlobalMessage(data: GlobalChatMessageData) {
    try {
      const existingMessages = await this.getGlobalMessages();
      const newMessages = [data, ...existingMessages].slice(0, this.MAX_MESSAGES);

      await this.redisService.set(
        this.GLOBAL_CHAT_KEY,
        JSON.stringify(newMessages),
        this.MESSAGE_TTL
      );
    } catch (error) {
      this.logger.error('Failed to send global message:', error);
      throw error;
    }
  }

  async getMessages(symbol: string): Promise<CoinTalkMessageData[]> {
    try {
      const key = this.getRedisKey(symbol);
      const messages = await this.redisService.get(key);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      this.logger.error('Failed to get messages:', error);
      return [];
    }
  }

  async getGlobalMessages(): Promise<GlobalChatMessageData[]> {
    try {
      const messages = await this.redisService.get(this.GLOBAL_CHAT_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      this.logger.error('Failed to get global messages:', error);
      return [];
    }
  }
}

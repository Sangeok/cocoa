import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CoinTalkMessageData, GlobalChatMessageData } from './chat.type';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MESSAGE_TTL = 3600 * 24; // 24시간
  private readonly MAX_MESSAGES = 1000; // 최대 메시지 수
  private readonly GLOBAL_CHAT_KEY = 'chat:global';

  constructor(private readonly redisService: RedisService) {}

  private getSymbolKey(symbol: string): string {
    return `chat:${symbol.split('-')[0]}`; // BTC-KRW -> chat:BTC
  }

  async sendMessage(data: CoinTalkMessageData) {
    const key = this.getSymbolKey(data.symbol);
    this.logger.debug(`Saving message to key: ${key}`);
    await this.redisService.lpush(key, JSON.stringify(data));
    await this.redisService.ltrim(key, 0, this.MAX_MESSAGES - 1);
    this.logger.debug('Message saved successfully');
  }

  async sendGlobalMessage(data: GlobalChatMessageData) {
    try {
      const existingMessages = await this.getGlobalMessages();
      const newMessages = [data, ...existingMessages].slice(
        0,
        this.MAX_MESSAGES,
      );

      await this.redisService.set(
        this.GLOBAL_CHAT_KEY,
        JSON.stringify(newMessages),
        this.MESSAGE_TTL,
      );
    } catch (error) {
      this.logger.error('Failed to send global message:', error);
      throw error;
    }
  }

  async getMessages(symbol: string): Promise<CoinTalkMessageData[]> {
    const key = this.getSymbolKey(symbol);
    this.logger.debug(`Fetching messages from key: ${key}`);
    const messages = await this.redisService.lrange(key, 0, -1);
    this.logger.debug(`Found ${messages.length} messages`);
    return messages.map((msg) => JSON.parse(msg));
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

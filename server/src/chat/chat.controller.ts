import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CoinTalkMessageData, GlobalChatMessageData } from './chat.type';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':symbol')
  async getCoinMessages(
    @Param('symbol') symbol: string,
  ): Promise<CoinTalkMessageData[]> {
    return this.chatService.getMessages(symbol);
  }

  @Get('global/messages')
  async getGlobalMessages(): Promise<GlobalChatMessageData[]> {
    return this.chatService.getGlobalMessages();
  }
} 
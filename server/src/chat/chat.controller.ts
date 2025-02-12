import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CoinTalkMessageData, GlobalChatMessageData } from './chat.type';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('global')
  async getGlobalMessages() {
    return this.chatService.getGlobalMessages();
  }

  @Get(':symbol')
  async getMessages(@Param('symbol') symbol: string) {
    return this.chatService.getMessages(symbol);
  }
} 
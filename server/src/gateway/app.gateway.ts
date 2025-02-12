import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CoinPremiumData } from '../collector/types/common.types';
import { config } from 'dotenv';
import { CoinTalkMessageData, GlobalChatMessageData } from '../chat/chat.type';
import { ChatService } from '../chat/chat.service';
import { Logger } from '@nestjs/common';

config();

interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

interface ActiveUsersData {
  count: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket'],
  path: '/socket.io/',
  pingInterval: 1000,
  pingTimeout: 3000,
  maxHttpBufferSize: 1e6,
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  private activeUsers = 0;
  private readonly logger = new Logger(AppGateway.name);

  handleConnection() {
    this.activeUsers++;
    this.emitActiveUsers();
  }

  handleDisconnect() {
    this.activeUsers--;
    this.emitActiveUsers();
  }

  private emitActiveUsers() {
    const data: ActiveUsersData = { count: this.activeUsers };
    this.server.emit('active-users', data);
  }

  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }

  emitCoinPremium(data: CoinPremiumData) {
    this.server.emit('coin-premium', data);
  }

  @SubscribeMessage('coin-talk-message')
  async handleCoinMessage(client: any, data: CoinTalkMessageData) {
    try {
      await this.chatService.sendMessage(data);
      this.server.emit('coin-talk-message', data);
    } catch (error) {
      this.logger.error('Failed to handle coin message:', error);
    }
  }

  @SubscribeMessage('global-chat-message')
  async handleGlobalMessage(client: any, data: GlobalChatMessageData) {
    try {
      await this.chatService.sendGlobalMessage(data);
      this.server.emit('global-chat-message', data);
    } catch (error) {
      this.logger.error('Failed to handle global message:', error);
    }
  }
}

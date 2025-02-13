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
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import cookie from 'cookie';
import { MessageBody, ConnectedSocket } from '@nestjs/websockets';

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
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AppGateway.name);
  private connectedClients: Set<string> = new Set();

  async handleConnection(client: Socket) {
    try {
      // 쿠키에서 JWT 토큰 추출
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies.access_token;
      
      if (token) {
        try {
          const payload = await this.jwtService.verifyAsync(token);
          client.data.userId = payload.sub;
        } catch (e) {
          this.logger.warn('Invalid token received');
        }
      }
      
      // 클라이언트 ID를 Set에 추가
      this.connectedClients.add(client.id);
      this.emitActiveUsers();
      this.logger.log(`Client connected: ${client.id}. Total connections: ${this.connectedClients.size}`);
    } catch (error) {
      this.logger.error('Connection handling failed:', error);
    }
  }

  handleDisconnect(client: Socket) {
    // 클라이언트 ID를 Set에서 제거
    this.connectedClients.delete(client.id);
    this.emitActiveUsers();
    this.logger.log(`Client disconnected: ${client.id}. Total connections: ${this.connectedClients.size}`);
  }

  private emitActiveUsers() {
    const data: ActiveUsersData = { count: this.connectedClients.size };
    this.server.emit('active-users', data);
  }

  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }

  emitCoinPremium(data: CoinPremiumData) {
    this.server.emit('coin-premium', data);
  }

  @SubscribeMessage('coin-talk-message')
  async handleCoinMessage(client: Socket, data: CoinTalkMessageData) {
    try {
      const baseSymbol = data.symbol.split('-')[0];
      const messageData = {
        ...data,
        symbol: baseSymbol,
        userId: client.data.userId,
      };
      
      this.logger.debug(`Received coin message: ${JSON.stringify(messageData)}`);
      await this.chatService.sendMessage(messageData);
      this.logger.debug('Message saved to Redis');
      
      // room에 join하지 않았기 때문에 전체 클라이언트에게 broadcast
      this.server.emit('coin-talk-message', messageData);
      this.logger.debug('Message broadcasted to clients');
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

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string; symbol?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messageData = {
      message: data.message,
      timestamp: Date.now(),
      nickname: client.data.nickname,
      userId: client.data.userId,  // undefined 또는 사용자 ID
      ...(data.symbol && { symbol: data.symbol }),
    };

    if (data.symbol) {
      this.server.to(data.symbol).emit('newMessage', messageData);
    } else {
      this.server.emit('newMessage', messageData);
    }

    return messageData;
  }
}

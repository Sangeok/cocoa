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
import { MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { PredictService } from '../predict/predict.service';
import { Interval } from '@nestjs/schedule';

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
    private readonly predictService: PredictService,
  ) {}

  private readonly logger = new Logger(AppGateway.name);
  private connectedClients: Set<string> = new Set();

  async handleConnection(client: Socket) {
    try {
      // 클라이언트 ID를 Set에 추가
      this.connectedClients.add(client.id);
      this.emitActiveUsers();
      this.logger.log(
        `Client connected: ${client.id}, Total connections: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error('Connection handling failed:', error);
      // 에러가 발생해도 연결은 유지
      this.connectedClients.add(client.id);
      this.emitActiveUsers();
    }
  }

  handleDisconnect(client: Socket) {
    // 클라이언트 ID를 Set에서 제거
    this.connectedClients.delete(client.id);
    this.emitActiveUsers();
    this.logger.log(
      `Client disconnected: ${client.id}. Total connections: ${this.connectedClients.size}`,
    );
  }

  // 실시간 접속자 수
  private emitActiveUsers() {
    const data: ActiveUsersData = { count: this.connectedClients.size };
    this.server.emit('active-users', data);
  }

  // 실시간 환율 정보
  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }

  // 실시간 전체 거래소에 대한 코인 프리미엄 정보
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
        userId: data.userId,  // client.data.userId 대신 data.userId 사용
      };

      this.logger.debug(`Received coin message: ${JSON.stringify(messageData)}`);
      await this.chatService.sendMessage(messageData);
      this.server.emit('coin-talk-message', messageData);
    } catch (error) {
      this.logger.error('Failed to handle coin message:', error);
    }
  }

  @SubscribeMessage('global-chat-message')
  async handleGlobalChat(client: Socket, data: GlobalChatMessageData) {
    try {
      const messageData: GlobalChatMessageData = {
        message: data.message,
        nickname: data.nickname,
        timestamp: data.timestamp,
        userId: data.userId,
      };

      await this.chatService.sendGlobalMessage(messageData);
      this.server.emit('global-chat-message', messageData);
    } catch (error) {
      this.logger.error('Failed to handle global message:', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string; symbol?: string; timestamp: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messageData = {
      message: data.message,
      timestamp: data.timestamp,
      nickname: client.data.nickname,
      userId: client.data.userId, // undefined 또는 사용자 ID
      ...(data.symbol && { symbol: data.symbol }),
    };

    // 특정 코인 마켓 채팅방
    if (data.symbol) {
      this.server.to(data.symbol).emit('newMessage', messageData);
    } 
    // 전체 채팅방
    else {
      this.server.emit('newMessage', messageData);
    }

    return messageData;
  }

  @Interval(1000) // 1초마다 실행
  async emitLongShortRatios() {
    try {
      // 전체 롱숏 비율
      const globalRatio = await this.predictService.getGlobalLongShortRatio();
      this.server.emit('global-long-short-ratio', globalRatio);

      // 주요 마켓별 롱숏 비율
      const markets = [
        'BTC-KRW', 'ETH-KRW', 'XRP-KRW', 
        'BTC-USDT', 'ETH-USDT', 'XRP-USDT'
      ];

      const marketRatios = await Promise.all(
        markets.map(async (market) => {
          const ratio = await this.predictService.getMarketLongShortRatio(market);
          return { market, ...ratio };
        })
      );

      this.server.emit('market-long-short-ratios', marketRatios);
    } catch (error) {
      this.logger.error('Failed to emit long/short ratios:', error);
    }
  }
}

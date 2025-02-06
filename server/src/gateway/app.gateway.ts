import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface CoinPriceData {
  exchange: string;
  symbol: string;
  price: number;
  difference: number;
  timestamp: number;
  upbitPrice?: number;
  binancePrice?: number;
  upbitVolume?: number;
  binanceVolume?: number;
}

interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // 테스트용 메서드 (실제 로직 구현 전까지 사용)
  emitCoinPrice(data: CoinPriceData) {
    this.server.emit('coin-price', data);
  }

  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }
} 
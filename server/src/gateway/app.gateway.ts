import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TickerData, CoinPremiumData } from '../collector/types/common.types';

interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

interface ActiveUsersData {
  count: number;
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

  private activeUsers = 0;

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

  emitCoinPrice(data: TickerData) {
    this.server.emit('coinPrice', data);
  }

  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }

  emitCoinPremium(data: CoinPremiumData) {
    this.server.emit('coin-premium', data);
  }
}

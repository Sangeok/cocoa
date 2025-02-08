import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TickerData, CoinPremiumData } from '../collector/types/common.types';

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
export class AppGateway {
  @WebSocketServer()
  server: Server;

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

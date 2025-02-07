import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

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
export class AppGateway {
  @WebSocketServer()
  server: Server;

  emitCoinPrice(data: CoinPriceData) {
    this.server.emit('coinPrice', data);
  }

  emitExchangeRate(data: ExchangeRateData) {
    this.server.emit('exchange-rate', data);
  }
} 
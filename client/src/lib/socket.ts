import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

interface CoinPriceData {
  symbol: string;
  price: number;
  difference: number;
  timestamp: number;
}

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// 코인 가격 데이터 리스너
export const subscribeToCoinPrice = (callback: (data: CoinPriceData) => void) => {
  socket.on('coin-price', callback);
  return () => {
    socket.off('coin-price', callback);
  };
};

export default socket; 
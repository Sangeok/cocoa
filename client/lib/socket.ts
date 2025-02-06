import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

export default socket; 
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('🟢 Socket connected');
});

socket.on('disconnect', () => {
  console.log('🔴 Socket disconnected');
});

export default socket; 
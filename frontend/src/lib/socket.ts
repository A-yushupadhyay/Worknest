// /frontend/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
import type { SocketJoinPayload } from '../types';
import type { AppNotification } from '../types';

let socket: Socket | null = null;

export function initSocket(): Socket {
  if (socket) return socket;

  const base = import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE.replace(/\/api$/, '')
    : 'http://localhost:8000';

  socket = io(base, { transports: ['websocket'], reconnectionAttempts: 5 });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);

    // 🔑 Join personal room immediately after connecting
    const token = localStorage.getItem('token'); // JWT token
    if (token) {
      socket?.emit('auth', { token });
      console.log('➡️ Socket joined personal room with auth token');
    }
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err);
  });

  return socket;
}

export function joinRooms(payload: SocketJoinPayload): void {
  socket?.emit('join', payload);
}

export function leaveRooms(payload: SocketJoinPayload): void {
  socket?.emit('leave', payload);
}

export function getSocket(): Socket | null {
  return socket;
}

// ✅ Add subscription helper
export function onNotification(cb: (n: AppNotification) => void): void {
  socket?.on('notification:new', cb);
}

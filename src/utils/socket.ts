// project/src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Explicitly target port 5000
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectToRoom = (roomId: string, username: string): void => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join_room', { roomId, username });
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const sendChatMessage = (
  roomId: string,
  message: string,
  username: string
): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('chat_message', { roomId, message, username });
  }
};

export const emitPlayEvent = (roomId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('play', { roomId });
  }
};

export const emitPauseEvent = (roomId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('pause', { roomId });
  }
};

export const emitSeekEvent = (roomId: string, time: number): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('seek', { roomId, time });
  }
};

export const emitNextVideo = (roomId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('next', { roomId });
  }
};

export const emitSyncRequest = (roomId: string): void => {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('sync_request', { roomId });
  }
};

import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../../shared/types/socket';
import { SERVER_URL } from './config';

// we keep one shared socket instance for the whole frontend
// so we don't accidentally open a bunch of separate connections
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(SERVER_URL, {
      withCredentials: true,
    });
  }
  return socket;
}


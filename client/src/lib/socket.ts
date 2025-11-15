import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../../shared/types/socket';

// we keep one shared socket instance for the whole frontend
// so we don't accidentally open a bunch of separate connections
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    // for now we just hardcode the dev server url
    // later we might read this from a config file or env
    socket = io('http://localhost:4000', {
      withCredentials: true,
    });
  }
  return socket;
}


import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../../../shared/types/socket';

export function registerSocketHandlers(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  // this gets called from index.ts whenever a socket connects
  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    console.log(`client connected: ${socket.id}`);

    // phase 2 ping/pong tester with a timestamp
    socket.on('ping', () => {
      console.log(`received ping from ${socket.id}`);
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    });

    // just log disconnects for now
    socket.on('disconnect', (reason) => {
      console.log(`client disconnected: ${socket.id} (${reason})`);
    });
    }
  );
}


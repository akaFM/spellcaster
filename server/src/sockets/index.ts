import { Server as SocketIOServer, Socket } from 'socket.io';

export function registerSocketHandlers(io: SocketIOServer) {
  // this gets called from index.ts whenever a socket connects
  io.on('connection', (socket: Socket) => {
    console.log(`client connected: ${socket.id}`);

    // quick ping/pong tester so we know sockets are hooked up
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // just log disconnects for now
    socket.on('disconnect', (reason) => {
      console.log(`client disconnected: ${socket.id} (${reason})`);
    });
  });
}


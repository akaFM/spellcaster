import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  LobbyState,
  DuelState,
} from '../../../shared/types/socket';

const MAX_PLAYERS = 2;
const ROOM_CODE_LENGTH = 4;

const lobbies = new Map<string, LobbyState>();

export function registerSocketHandlers(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  // this gets called from index.ts whenever a socket connects
  io.on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      console.log(`client connected: ${socket.id}`);

      socket.on('ping', () => {
        console.log(`received ping from ${socket.id}`);
        socket.emit('pong', {
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('lobby:create', ({ playerName }) => {
        const cleanName = sanitizeName(playerName);
        if (!cleanName) {
          return sendError(socket, 'please enter a name before creating a duel');
        }

        leaveCurrentLobby(socket, io);

        const roomCode = generateRoomCode();
        const lobby: LobbyState = {
          roomCode,
          phase: 'lobby',
          players: [
            {
              id: socket.id,
              name: cleanName,
              isHost: true,
              ready: false,
            },
          ],
        };

        lobbies.set(roomCode, lobby);
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.playerName = cleanName;

        console.log(`created lobby ${roomCode} for host ${cleanName}`);
        broadcastLobbyState(io, lobby);
      });

      socket.on('lobby:join', ({ roomCode, playerName }) => {
        const code = normalizeRoomCode(roomCode);
        const cleanName = sanitizeName(playerName);

        if (!cleanName) {
          return sendError(socket, 'please enter a name before joining');
        }

        const lobby = lobbies.get(code);
        if (!lobby) {
          return sendError(socket, 'could not find that lobby code');
        }
        if (lobby.players.length >= MAX_PLAYERS) {
          return sendError(socket, 'this lobby is already full');
        }
        if (lobby.phase !== 'lobby') {
          return sendError(socket, 'this duel already started');
        }

        leaveCurrentLobby(socket, io);

        lobby.players.push({
          id: socket.id,
          name: cleanName,
          isHost: false,
          ready: false,
        });

        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerName = cleanName;

        console.log(`player ${cleanName} joined lobby ${code}`);
        broadcastLobbyState(io, lobby);
      });

      socket.on('lobby:leave', () => {
        const previousRoom = socket.data.roomCode;
        leaveCurrentLobby(socket, io);
        if (previousRoom) {
          console.log(`player ${socket.id} left lobby ${previousRoom}`);
        }
      });

      socket.on('lobby:setReady', ({ roomCode, ready }) => {
        const lobby = lobbies.get(roomCode);
        if (!lobby) {
          return sendError(socket, 'lobby no longer exists');
        }
        if (lobby.phase !== 'lobby') {
          return sendError(socket, 'duel already started');
        }

        const player = lobby.players.find((p) => p.id === socket.id);
        if (!player) {
          return sendError(socket, 'you are not part of this lobby');
        }

        player.ready = ready;
        broadcastLobbyState(io, lobby);
      });

      socket.on('lobby:startDuel', ({ roomCode }) => {
        const lobby = lobbies.get(roomCode);
        if (!lobby) {
          return sendError(socket, 'lobby no longer exists');
        }
        if (lobby.phase !== 'lobby') {
          return sendError(socket, 'duel already in progress');
        }

        const player = lobby.players.find((p) => p.id === socket.id);
        if (!player || !player.isHost) {
          return sendError(socket, 'only the host can start the duel');
        }

        const everyoneReady = lobby.players.every((p) => p.ready);
        if (!everyoneReady || lobby.players.length < 2) {
          return sendError(socket, 'both players must be ready before starting');
        }

        lobby.phase = 'in-duel';
        lobby.players = lobby.players.map((p) => ({
          ...p,
          ready: false,
        }));

        const duelState: DuelState = {
          roomCode,
          round: 1,
          startedAt: new Date().toISOString(),
          players: lobby.players,
        };

        console.log(`lobby ${roomCode} started a duel`);
        broadcastLobbyState(io, lobby);
        io.to(roomCode).emit('duel:started', duelState);
      });

      socket.on('disconnect', (reason) => {
        leaveCurrentLobby(socket, io);
        console.log(`client disconnected: ${socket.id} (${reason})`);
      });
    }
  );
}

function broadcastLobbyState(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  lobby: LobbyState
) {
  io.to(lobby.roomCode).emit('lobby:state', lobby);
}

function sendError(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  message: string
) {
  socket.emit('error', { message });
}

function leaveCurrentLobby(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) {
    return;
  }

  const lobby = lobbies.get(roomCode);
  socket.leave(roomCode);
  socket.data.roomCode = undefined;
  socket.data.playerName = undefined;

  if (!lobby) {
    return;
  }

  lobby.players = lobby.players.filter((p) => p.id !== socket.id);

  if (lobby.players.length === 0) {
    lobbies.delete(roomCode);
    console.log(`closed lobby ${roomCode} because it became empty`);
    return;
  }

  if (!lobby.players.some((p) => p.isHost)) {
    lobby.players[0].isHost = true;
    console.log(`reassigned host of ${roomCode} to ${lobby.players[0].name}`);
  }

  if (lobby.phase === 'lobby' && lobby.players.some((p) => p.ready)) {
    lobby.players = lobby.players.map((p) => ({ ...p, ready: false }));
  }

  broadcastLobbyState(io, lobby);
}

function sanitizeName(name: string): string {
  return name?.trim().slice(0, 24);
}

function normalizeRoomCode(roomCode: string): string {
  return roomCode?.trim().toUpperCase();
}

function generateRoomCode(): string {
  let code = '';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () => {
      const idx = Math.floor(Math.random() * chars.length);
      return chars[idx];
    }).join('');
  } while (lobbies.has(code));
  return code;
}

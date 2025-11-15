export type LobbyPhase = 'lobby' | 'in-duel';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
}

export interface LobbyState {
  roomCode: string;
  phase: LobbyPhase;
  players: Player[];
}

export interface DuelState {
  roomCode: string;
  round: number;
  startedAt: string;
  players: Player[];
}

export interface ServerErrorPayload {
  message: string;
}

// types that describe the events client can send to server
export interface ClientToServerEvents {
  // simple ping event for testing round-trip
  ping: () => void;
  'lobby:create': (payload: { playerName: string }) => void;
  'lobby:join': (payload: { roomCode: string; playerName: string }) => void;
  'lobby:leave': () => void;
  'lobby:setReady': (payload: { roomCode: string; ready: boolean }) => void;
  'lobby:startDuel': (payload: { roomCode: string }) => void;
}

// types that describe the events server can send to client
export interface ServerToClientEvents {
  // server replies to ping with a pong and some metadata
  pong: (data: { timestamp: string }) => void;
  'lobby:state': (state: LobbyState) => void;
  'duel:started': (state: DuelState) => void;
  error: (payload: ServerErrorPayload) => void;
}

// currently empty, but we might use this later
export interface InterServerEvents {
  // placeholder for inter-server events
}

// placeholder for per-socket data we might use later
export interface SocketData {
  roomCode?: string;
  playerName?: string;
}


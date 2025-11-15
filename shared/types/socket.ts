// types that describe the events client can send to server
export interface ClientToServerEvents {
  // simple ping event for testing round-trip
  ping: () => void;
}

// types that describe the events server can send to client
export interface ServerToClientEvents {
  // server replies to ping with a pong and some metadata
  pong: (data: { timestamp: string }) => void;
}

// currently empty, but we might use this later
export interface InterServerEvents {
  // placeholder for inter-server events
}

// placeholder for per-socket data we might use later
export interface SocketData {
  // someday this might include user id, lobby code, etc.
}


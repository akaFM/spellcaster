import { useEffect, useMemo, useState } from 'react';
import { getSocket } from '../lib/socket';
import type {
  DuelState,
  LobbyState,
  Player,
  ServerErrorPayload,
} from '../../../shared/types/socket';

interface UseLobbyResult {
  lobby: LobbyState | null;
  duel: DuelState | null;
  error: string | null;
  localPlayer: Player | null;
  createLobby: (playerName: string) => void;
  joinLobby: (roomCode: string, playerName: string) => void;
  leaveLobby: () => void;
  setReady: (ready: boolean) => void;
  startDuel: () => void;
  clearError: () => void;
}

export function useLobby(): UseLobbyResult {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleLobbyState = (state: LobbyState) => {
      setLobby(state);
      if (state.phase !== 'in-duel') {
        setDuel(null);
      }
    };

    const handleDuelStarted = (state: DuelState) => {
      setDuel(state);
    };

    const handleError = (payload: ServerErrorPayload) => {
      setError(payload.message);
    };

    const handleConnect = () => {
      setSocketId(socket.id ?? null);
    };

    const handleDisconnect = () => {
      setSocketId(null);
    };

    socket.on('lobby:state', handleLobbyState);
    socket.on('duel:started', handleDuelStarted);
    socket.on('error', handleError);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('lobby:state', handleLobbyState);
      socket.off('duel:started', handleDuelStarted);
      socket.off('error', handleError);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const localPlayer = useMemo(() => {
    if (!socketId || !lobby) {
      return null;
    }

    return lobby.players.find((player) => player.id === socketId) ?? null;
  }, [socketId, lobby]);

  const socketRef = () => getSocket();

  const createLobby = (playerName: string) => {
    const name = playerName.trim();
    if (!name) {
      setError('please enter your name first');
      return;
    }
    setError(null);
    socketRef().emit('lobby:create', { playerName: name });
  };

  const joinLobby = (roomCode: string, playerName: string) => {
    const name = playerName.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name || !code) {
      setError('enter both your name and a room code');
      return;
    }
    setError(null);
    socketRef().emit('lobby:join', { roomCode: code, playerName: name });
  };

  const leaveLobby = () => {
    socketRef().emit('lobby:leave');
    setLobby(null);
    setDuel(null);
  };

  const setReady = (ready: boolean) => {
    if (!lobby) {
      return;
    }
    socketRef().emit('lobby:setReady', { roomCode: lobby.roomCode, ready });
  };

  const startDuel = () => {
    if (!lobby) {
      return;
    }
    socketRef().emit('lobby:startDuel', { roomCode: lobby.roomCode });
  };

  const clearError = () => setError(null);

  return {
    lobby,
    duel,
    error,
    localPlayer,
    createLobby,
    joinLobby,
    leaveLobby,
    setReady,
    startDuel,
    clearError,
  };
}


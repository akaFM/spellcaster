import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseSocketConnectionResult {
  status: ConnectionStatus;
  lastPong: string | null;
  sendPing: () => void;
}

export function useSocketConnection(): UseSocketConnectionResult {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    // when the socket connects, update our status
    const handleConnect = () => {
      setStatus('connected');
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
    };

    const handleConnectError = () => {
      setStatus('disconnected');
    };

    const handlePong = (data: { timestamp: string }) => {
      // store the timestamp we got from the server
      setLastPong(data.timestamp);
    };

    // this is where we hook into socket.io connection events
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('pong', handlePong);

    // if the socket is already connected when this hook runs, reflect that
    if (socket.connected) {
      setStatus('connected');
    }

    return () => {
      // clean up listeners when the component using this hook unmounts
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('pong', handlePong);
    };
  }, []);

  const sendPing = () => {
    const socket = getSocket();
    // only try to ping if we are connected
    if (socket.connected) {
      socket.emit('ping');
    }
  };

  return { status, lastPong, sendPing };
}


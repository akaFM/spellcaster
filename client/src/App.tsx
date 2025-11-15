import React, { useMemo, useState } from 'react';
import { useSocketConnection } from './hooks/useSocketConnection';
import { useLobby } from './hooks/useLobby';

const App: React.FC = () => {
  const { status, lastPong, sendPing } = useSocketConnection();
  const {
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
  } = useLobby();

  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const everyoneReady = lobby?.players.every((player) => player.ready) ?? false;
  const canStartDuel =
    Boolean(lobby && lobby.phase === 'lobby' && localPlayer?.isHost && everyoneReady);
  const readyLabel = localPlayer?.ready ? 'unready' : 'ready up';
  const inLobby = Boolean(lobby && lobby.phase === 'lobby');
  const inDuel = Boolean(lobby && lobby.phase === 'in-duel');

  const playersForDisplay = useMemo(() => {
    return duel?.players ?? lobby?.players ?? [];
  }, [lobby, duel]);

  const handleCreate = () => createLobby(playerName);
  const handleJoin = () => joinLobby(roomCodeInput, playerName);
  const handleReadyToggle = () => setReady(!localPlayer?.ready);

  const renderEntry = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="player-name" className="text-sm text-slate-300">
          your wizard name
        </label>
        <input
          id="player-name"
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="ezra the typo slayer"
        />
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <button
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreate}
          disabled={status !== 'connected'}
        >
          create duel
        </button>

        <div className="flex-1 space-y-2">
          <input
            value={roomCodeInput}
            onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="room code"
            maxLength={8}
          />
          <button
            className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleJoin}
            disabled={status !== 'connected'}
          >
            join duel
          </button>
        </div>
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">room code</p>
          <p className="text-2xl font-semibold tracking-widest">{lobby?.roomCode}</p>
        </div>
        <button
          onClick={leaveLobby}
          className="text-sm text-rose-300 hover:text-rose-200 underline underline-offset-2"
        >
          leave lobby
        </button>
      </div>

      <div className="space-y-2">
        {lobby?.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {player.name}{' '}
                {player.isHost && (
                  <span className="text-xs uppercase tracking-wide text-amber-300">(host)</span>
                )}
              </span>
              {localPlayer?.id === player.id && (
                <span className="text-xs text-slate-400">that&apos;s you</span>
              )}
            </div>
            <span className={player.ready ? 'text-emerald-400' : 'text-slate-500'}>
              {player.ready ? 'ready' : 'not ready'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleReadyToggle}
          disabled={!localPlayer}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {readyLabel}
        </button>

        {localPlayer?.isHost && (
          <button
            onClick={startDuel}
            disabled={!canStartDuel}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            start duel
          </button>
        )}
        {!localPlayer?.isHost && (
          <p className="text-xs text-center text-slate-400">
            waiting for the host to start once everyone is ready.
          </p>
        )}
      </div>
    </div>
  );

  const renderDuel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">duel room</p>
          <p className="text-2xl font-semibold tracking-widest">{lobby?.roomCode}</p>
        </div>
        <button
          onClick={leaveLobby}
          className="text-sm text-rose-300 hover:text-rose-200 underline underline-offset-2"
        >
          leave duel
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 p-4 bg-slate-900/40">
        <p className="text-lg font-semibold">duel in progress</p>
        <p className="text-sm text-slate-400">
          round {duel?.round ?? 1} · started{' '}
          {(duel && new Date(duel.startedAt).toLocaleTimeString()) || 'just now'}
        </p>
        <p className="text-sm text-slate-300 mt-2">
          spellcasting ui goes here in phase 4. for now we just prove the duel state transitions.
        </p>
      </div>

      <div className="space-y-2">
        {playersForDisplay.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2"
          >
            <span className="font-medium">
              {player.name}{' '}
              {player.isHost && (
                <span className="text-xs uppercase tracking-wide text-amber-300">(host)</span>
              )}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest">casting...</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-slate-800/70 border border-slate-700 rounded-2xl shadow-xl p-6 space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">spellcaster</h1>
          <p className="text-sm text-slate-300">
            phase 3 – create a duel lobby, ready up with a friend, and launch the duel skeleton.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-600 bg-rose-900/30 px-3 py-2 text-sm text-rose-200 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-xs uppercase tracking-wide underline underline-offset-2"
            >
              dismiss
            </button>
          </div>
        )}

        {!lobby && renderEntry()}
        {inLobby && renderLobby()}
        {inDuel && renderDuel()}

        <div className="pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">socket status</span>
            <span
              className={`font-mono ${
                status === 'connected'
                  ? 'text-emerald-400'
                  : status === 'connecting'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {status}
            </span>
          </div>
          <button
            className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={sendPing}
            disabled={status !== 'connected'}
          >
            ping server
          </button>
          <div className="text-xs text-slate-400 text-center">
            {lastPong ? (
              <span>
                last pong at: <span className="font-mono">{lastPong}</span>
              </span>
            ) : (
              <span>no pong yet – handy for debugging if things go quiet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


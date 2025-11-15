import React from 'react';
import { useSocketConnection } from './hooks/useSocketConnection';

const App: React.FC = () => {
  const { status, lastPong, sendPing } = useSocketConnection();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center">spellcaster</h1>
        <p className="text-sm text-slate-300 text-center">
          this is phase 2 – we&apos;re just wiring up socket.io so the client and server can trade
          pings before we build the full duel.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">socket status:</span>
            <span
              className={`text-sm font-mono ${
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

          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={sendPing}
              disabled={status !== 'connected'}
            >
              ping server
            </button>
            <div className="text-xs text-slate-300">
              {lastPong ? (
                <span>
                  last pong at: <span className="font-mono">{lastPong}</span>
                </span>
              ) : (
                <span>no pong yet. hit the button once you&apos;re connected.</span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          future phases will swap this out for host/join screens, lobby flow, and the wizard duel
          ui. for now this just proves sockets are alive.
        </p>
      </div>
    </div>
  );
};

export default App;


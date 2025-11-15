import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center">spellcaster</h1>
        <p className="text-sm text-slate-300 text-center">
          this is phase 1 – just the basic skeleton. later we&apos;re going to turn this into a
          1v1 wizard spelling duel with sockets, tts, and gemini.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition">
            pretend host game
          </button>
          <button className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
            pretend join game
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-4">
          right now we just care that the client builds and the server runs. the actual game logic
          comes in later phases.
        </p>
      </div>
    </div>
  );
};

export default App;


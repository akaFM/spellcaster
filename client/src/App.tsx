import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSocketConnection } from './hooks/useSocketConnection';
import { useLobby } from './hooks/useLobby';
import { RoundRecapCard } from './components/RoundRecapCard';
import { WizardBeam } from './components/WizardBeam';
import { CountdownDisplay } from './components/CountdownDisplay';
import { GameSummaryCard } from './components/GameSummaryCard';
import { HostSettingsModal } from './components/HostSettingsModal';
import { SERVER_URL } from './lib/config';
import type { GameSettings } from '../../shared/types/socket';

const castingPrompts = [
  'Focus on the cadence of the wizarding voice.',
  'Your wand quivers as each rune etches into your mind.',
  'Do not trust your eyes—trust the echo of the spell.',
  'Let the syllables settle before you strike.',
];

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'medium',
  rounds: 5,
  readingSpeed: 1,
};

const App: React.FC = () => {
  const { status } = useSocketConnection();
  const {
    lobby,
    duel,
    countdown,
    prompt,
    roundRecap,
    summary,
    scores,
    error,
    localPlayer,
    createLobby,
    joinLobby,
    leaveLobby,
    setReady,
    startDuel,
    submitSpell,
    clearError,
    resetSummary,
  } = useLobby();

  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [typingStartedAt, setTypingStartedAt] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [feedbackPulse, setFeedbackPulse] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const pendingAudioRef = useRef<{ roundNumber: number; url: string } | null>(null);
  const audioFetchControllerRef = useRef<AbortController | null>(null);
  const [hostSettingsModalOpen, setHostSettingsModalOpen] = useState(false);
  const [hostSettings, setHostSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!countdown) {
      setCountdownValue(null);
      return;
    }
    setCountdownValue(countdown.seconds);
    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const cleanupPendingAudio = useCallback(() => {
    if (pendingAudioRef.current) {
      URL.revokeObjectURL(pendingAudioRef.current.url);
      pendingAudioRef.current = null;
    }
  }, []);

  const playAudioFromUrl = useCallback(
    async (url: string) => {
      cleanupAudio();
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.onended = () => {
        if (audioUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        }
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };
      try {
        await audio.play();
      } catch (error) {
        console.error('spell audio playback failed', error);
      }
    },
    [cleanupAudio]
  );

  const preloadSpellAudio = useCallback(
    async (roundNumber: number, text: string) => {
      if (!text || !roundNumber) {
        return;
      }

      if (pendingAudioRef.current?.roundNumber === roundNumber) {
        return;
      }

      audioFetchControllerRef.current?.abort();
      audioFetchControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${SERVER_URL}/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
          }),
          signal: audioFetchControllerRef.current.signal,
        });

        if (!response.ok) {
          console.error('failed to preload spell audio', await response.text());
          return;
        }

        const blob = await response.blob();
        cleanupPendingAudio();
        const url = URL.createObjectURL(blob);
        pendingAudioRef.current = { roundNumber, url };
      } catch (error) {
        if (audioFetchControllerRef.current?.signal.aborted) {
          return;
        }
        console.error('spell audio preload failed', error);
      }
    },
    [cleanupPendingAudio]
  );

  useEffect(() => {
    if (!countdown?.spellText) {
      return;
    }
    preloadSpellAudio(countdown.roundNumber, countdown.spellText);
  }, [countdown, preloadSpellAudio]);

  useEffect(() => {
    if (!prompt) {
      setCurrentGuess('');
      setTypingStartedAt(null);
      setHasSubmitted(false);
      cleanupAudio();
      cleanupPendingAudio();
      return;
    }
    setCurrentGuess('');
    setHasSubmitted(false);
    setTypingStartedAt(performance.now());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [prompt, cleanupAudio, cleanupPendingAudio]);

  useEffect(() => {
    if (!prompt) {
      cleanupAudio();
      return;
    }

    let cancelled = false;

    const ensureAudio = async () => {
      if (!pendingAudioRef.current || pendingAudioRef.current.roundNumber !== prompt.roundNumber) {
        await preloadSpellAudio(prompt.roundNumber, prompt.spellText);
      }
      if (cancelled) {
        return;
      }

      const cached = pendingAudioRef.current;
      if (!cached || cached.roundNumber !== prompt.roundNumber) {
        console.warn('spell audio not ready in time, skipping playback');
        return;
      }

      pendingAudioRef.current = null;
      await playAudioFromUrl(cached.url);
    };

    ensureAudio();

    return () => {
      cancelled = true;
      cleanupAudio();
    };
  }, [prompt, preloadSpellAudio, playAudioFromUrl, cleanupAudio]);

  useEffect(
    () => () => {
      audioFetchControllerRef.current?.abort();
      cleanupPendingAudio();
      cleanupAudio();
    },
    [cleanupAudio, cleanupPendingAudio]
  );

  useEffect(() => {
    if (hostSettingsModalOpen && lobby) {
      setHostSettingsModalOpen(false);
    }
  }, [hostSettingsModalOpen, lobby]);

  const everyoneReady = lobby?.players.every((player) => player.ready) ?? false;
  const canStartDuel = Boolean(lobby && lobby.phase === 'lobby' && localPlayer?.isHost && everyoneReady);
  const readyLabel = localPlayer?.ready ? 'unready' : 'ready up';
  const inLobby = Boolean(lobby && lobby.phase === 'lobby');
  const inDuel = Boolean(lobby && lobby.phase === 'in-duel');
  const activePlayers = useMemo(() => duel?.players ?? lobby?.players ?? [], [duel, lobby]);

  const currentRoundNumber =
    countdown?.roundNumber ?? prompt?.roundNumber ?? roundRecap?.roundNumber ?? duel?.round ?? 1;
  const totalRounds = duel?.totalRounds ?? lobby?.settings?.rounds ?? 5;
  const beamOffset = duel?.beamOffset ?? 0;

  const handleCreate = () => createLobby(playerName, hostSettings);
  const handleJoin = () => joinLobby(roomCodeInput, playerName);
  const handleReadyToggle = () => setReady(!localPlayer?.ready);
  const handleOpenHostSettings = () => {
    setHostSettings({ ...DEFAULT_SETTINGS });
    setHostSettingsModalOpen(true);
  };
  const handleHostSettingsChange = (partial: Partial<GameSettings>) => {
    setHostSettings((prev) => ({
      ...prev,
      ...partial,
    }));
  };
  const handleConfirmHostSettings = () => {
    handleCreate();
  };

  const handleGuessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGuess(event.target.value.toUpperCase());
    setFeedbackPulse((prev) => prev + 1);
  };

  const handleSubmitSpell = () => {
    if (!prompt || hasSubmitted) {
      return;
    }
    const duration = typingStartedAt ? Math.max(0, performance.now() - typingStartedAt) : 0;
    submitSpell(currentGuess, duration, prompt.promptId);
    setHasSubmitted(true);
  };

  const showResultsPending = hasSubmitted && !roundRecap && !prompt && !countdown;

  const renderCastingPanel = () => (
    <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          round {currentRoundNumber} / {totalRounds}
        </p>
        <p className="text-lg font-semibold text-slate-100">listen. conjure. commit.</p>
        <p className="text-sm text-slate-400">
          {castingPrompts[currentRoundNumber % castingPrompts.length]}
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 space-y-4">
        <label htmlFor="spell-input" className="text-xs uppercase tracking-wide text-slate-400">
          enter the incantation (keystrokes remain hidden)
        </label>
        <input
          ref={inputRef}
          id="spell-input"
          value={currentGuess}
          onChange={handleGuessChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmitSpell();
            }
          }}
          placeholder="silently channel the letters..."
          className="casting-input w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {hasSubmitted ? 'Submission locked. Awaiting opponent...' : 'You will not see your letters.'}
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className={`h-2 w-2 rounded-full bg-emerald-400 ${feedbackPulse % 2 === 0 ? 'animate-ping' : ''}`} />
            keystroke pulse
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmitSpell}
        disabled={!prompt || hasSubmitted}
        className="w-full rounded-lg bg-emerald-600 py-3 text-lg font-semibold uppercase tracking-widest hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        cast spell
      </button>
    </div>
  );

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
          onClick={handleOpenHostSettings}
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

      {lobby?.settings && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">configured spell rules</p>
          <div className="text-sm text-slate-300 space-y-1">
            <p>
              <span className="text-slate-500">difficulty:</span> {lobby.settings.difficulty}
            </p>
            <p>
              <span className="text-slate-500">rounds:</span> {lobby.settings.rounds}
            </p>
            <p>
              <span className="text-slate-500">reading speed:</span> {lobby.settings.readingSpeed.toFixed(2)}x
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleReadyToggle}
          disabled={!localPlayer}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {readyLabel}
        </button>

        {localPlayer?.isHost ? (
          <button
            onClick={startDuel}
            disabled={!canStartDuel}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            start duel
          </button>
        ) : (
          <p className="text-xs text-center text-slate-400">
            waiting for the host to start once everyone is ready.
          </p>
        )}
      </div>
    </div>
  );

  const renderDuel = () => (
    <div className="space-y-5">
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

      <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">round {currentRoundNumber}</p>
            <p className="text-sm text-slate-400">first to overwhelm the beam wins</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">turn timer</p>
            <p className="text-sm text-slate-200">
              {prompt ? 'spell being cast' : countdown ? 'countdown' : 'standing by'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePlayers.map((player) => (
            <div
              key={player.id}
              className={`rounded-xl border px-3 py-2 ${
                player.isHost ? 'border-indigo-500/60' : 'border-rose-500/60'
              }`}
            >
              <p className="text-sm font-semibold">
                {player.name}{' '}
                {player.id === localPlayer?.id && <span className="text-xs text-slate-400">(you)</span>}
              </p>
              <p className="text-xs text-slate-400">score {scores[player.id] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      {roundRecap && <RoundRecapCard recap={roundRecap} localPlayerId={localPlayer?.id ?? null} />}
      {!roundRecap && countdown && countdownValue && (
        <CountdownDisplay
          value={Math.max(1, Math.round(countdownValue))}
          roundNumber={countdown.roundNumber}
          totalRounds={countdown.totalRounds}
        />
      )}
      {!roundRecap && !countdown && prompt && renderCastingPanel()}

      {showResultsPending && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-sm text-amber-100">
          adjudicating this round... both wizards must finish before the scroll reveals your work.
        </div>
      )}

      <WizardBeam players={activePlayers} scores={scores} beamOffset={beamOffset} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-slate-800/70 border border-slate-700 rounded-3xl shadow-xl p-6 space-y-6 relative">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">spellcaster</h1>
          <p className="text-sm text-slate-300">
            dual-purpose spelling duels with real-time scoring, tts incantations, and wizard beams.
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

        {summary && (
          <GameSummaryCard
            summary={summary}
            players={lobby?.players ?? activePlayers}
            localPlayerId={localPlayer?.id ?? null}
            onClose={resetSummary}
          />
        )}
      </div>
      <HostSettingsModal
        open={hostSettingsModalOpen && !lobby}
        settings={hostSettings}
        onChange={handleHostSettingsChange}
        onCancel={() => setHostSettingsModalOpen(false)}
        onConfirm={handleConfirmHostSettings}
        confirmDisabled={status !== 'connected'}
      />
    </div>
  );
};

export default App;


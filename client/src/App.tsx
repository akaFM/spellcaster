import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import { useSocketConnection } from './hooks/useSocketConnection';
import { useLobby } from './hooks/useLobby';
import { GameSummaryCard } from './components/GameSummaryCard';
import { HostSettingsModal } from './components/HostSettingsModal';
import { SERVER_URL } from './lib/config';
import type { GameSettings } from '../../shared/types/socket';

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
    roundSubmissions,
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
  const [playerWizardId, setPlayerWizardId] = useState<string>('violet-warden');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'game'>('landing');
  const [currentGuess, setCurrentGuess] = useState('');
  const [typingStartedAt, setTypingStartedAt] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const pendingAudioRef = useRef<{ roundNumber: number; url: string; readingSpeed: number } | null>(
    null
  );
  const audioFetchControllerRef = useRef<AbortController | null>(null);
  const victorySfxRef = useRef<HTMLAudioElement | null>(null);
  const lossSfxRef = useRef<HTMLAudioElement | null>(null);
  const [hostSettingsModalOpen, setHostSettingsModalOpen] = useState(false);
  const [hostSettings, setHostSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const handleLandingHostGame = (nickname: string, wizardId: string) => {
    const safeName =  nickname.trim() || 'WIZARD';
    setPlayerName(safeName);
    setPlayerWizardId(wizardId);
  
    // open the existing host settings modal – same wiring as before
    handleOpenHostSettings();
  };
  
  const handleLandingJoinGame = (nickname: string, joinCode: string, wizardId: string) => {
    const safeName = nickname.trim() || 'WIZARD';
    const code = joinCode.trim().toUpperCase();

    setPlayerName(safeName);
    setPlayerWizardId(wizardId);
    setRoomCodeInput(code);

    // use the existing joinLobby logic
    joinLobby(code, safeName, wizardId);

    // Don't switch screens immediately - wait for lobby state or error
    // The useEffect below will handle switching to 'game' when lobby is received
  };

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
  const playSpellCastSfx = useCallback(() => {
    const randomTrack = Math.random() < 0.5 ? '/audio/spell1.wav' : '/audio/spell2.mp3';
    const audio = new Audio(randomTrack);
    audio.play().catch((error) => console.error('spell sfx failed', error));
  }, []);

  const playVictorySfx = useCallback(() => {
    try {
      if (!victorySfxRef.current) {
        victorySfxRef.current = new Audio('/audio/victory.wav');
      }
      victorySfxRef.current.currentTime = 0;
      void victorySfxRef.current.play();
    } catch (error) {
      console.error('victory sfx failed', error);
    }
  }, []);

  const playLossSfx = useCallback(() => {
    try {
      if (!lossSfxRef.current) {
        lossSfxRef.current = new Audio('/audio/loss.mp3');
      }
      lossSfxRef.current.currentTime = 0;
      void lossSfxRef.current.play();
    } catch (error) {
      console.error('loss sfx failed', error);
    }
  }, []);

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

  useEffect(() => {
    if (!summary || !localPlayer) {
      return;
    }
    if (summary.winnerId === localPlayer.id) {
      playVictorySfx();
    } else {
      playLossSfx();
    }
  }, [summary, localPlayer, playVictorySfx, playLossSfx]);

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
    async (roundNumber: number, text: string, readingSpeed: number) => {
      if (!text || !roundNumber) {
        return;
      }

      if (
        pendingAudioRef.current?.roundNumber === roundNumber &&
        pendingAudioRef.current.readingSpeed === readingSpeed
      ) {
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
            readingSpeed,
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
        pendingAudioRef.current = { roundNumber, url, readingSpeed };
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
    preloadSpellAudio(countdown.roundNumber, countdown.spellText, countdown.readingSpeed);
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
      if (
        !pendingAudioRef.current ||
        pendingAudioRef.current.roundNumber !== prompt.roundNumber ||
        pendingAudioRef.current.readingSpeed !== prompt.readingSpeed
      ) {
        await preloadSpellAudio(prompt.roundNumber, prompt.spellText, prompt.readingSpeed);
      }
      if (cancelled) {
        return;
      }

      const cached = pendingAudioRef.current;
      if (
        !cached ||
        cached.roundNumber !== prompt.roundNumber ||
        cached.readingSpeed !== prompt.readingSpeed
      ) {
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

  // Handle screen transitions based on lobby state
  useEffect(() => {
    // If we have a lobby, switch to game screen and clear any errors
    if (lobby && currentScreen === 'landing') {
      setCurrentScreen('game');
      clearError();
    }
    // If we lose the lobby and we're on game screen, go back to landing
    if (!lobby && currentScreen === 'game') {
      setCurrentScreen('landing');
    }
  }, [lobby, currentScreen, clearError]);

  const inLobby = Boolean(lobby && lobby.phase === 'lobby');
  const inDuel = Boolean(lobby && lobby.phase === 'in-duel');
  const activePlayers = useMemo(() => duel?.players ?? lobby?.players ?? [], [duel, lobby]);

  const currentRoundNumber =
    countdown?.roundNumber ?? prompt?.roundNumber ?? roundRecap?.roundNumber ?? duel?.round ?? 1;

  const handleCreate = () => createLobby(playerName, hostSettings, playerWizardId);
  const handleJoin = () => joinLobby(roomCodeInput, playerName, playerWizardId);
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
    setCurrentScreen('game');
  };

  const handleGuessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentGuess(event.target.value.toUpperCase());
  };

  const handleSubmitSpell = () => {
    if (!prompt || hasSubmitted) {
      return;
    }
    const duration = typingStartedAt ? Math.max(0, performance.now() - typingStartedAt) : 0;
    submitSpell(currentGuess, duration, prompt.promptId);
    setHasSubmitted(true);
    playSpellCastSfx();
  };

  const showResultsPending = hasSubmitted && !roundRecap && !prompt && !countdown;

  const opponent = useMemo(() => {
    if (!duel || !localPlayer) {
      return null;
    }
    return duel.players.find((player) => player.id !== localPlayer.id) ?? null;
  }, [duel, localPlayer]);

  const opponentSubmitted =
    opponent &&
    roundSubmissions &&
    roundSubmissions.roundNumber === currentRoundNumber &&
    Boolean(roundSubmissions.playerIds[opponent.id]);


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


  
  return (
    <>
      {currentScreen === 'landing' ? (
        <LandingPage
          onHostGame={handleLandingHostGame}
          onJoinGame={handleLandingJoinGame}
          serverError={error}
          onClearError={clearError}
        />
      ) : inLobby && lobby ? (
        <LobbyPage
          lobby={lobby}
          localPlayer={localPlayer}
          onReadyToggle={handleReadyToggle}
          onStartDuel={startDuel}
          onLeaveLobby={() => {
            leaveLobby();
            setCurrentScreen('landing');
          }}
        />
      ) : inDuel && duel ? (
        <GamePage
          duel={duel}
          localPlayer={localPlayer}
          countdown={countdown}
          countdownValue={countdownValue}
          prompt={prompt}
          roundRecap={roundRecap}
          scores={scores}
          currentGuess={currentGuess}
          hasSubmitted={hasSubmitted}
          opponentSubmitted={opponentSubmitted ?? false}
          opponent={opponent}
          showResultsPending={showResultsPending}
          onGuessChange={handleGuessChange}
          onSubmitSpell={handleSubmitSpell}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmitSpell();
            }
            if (event.key === 'Backspace' || event.key === 'Delete') {
              event.preventDefault();
            }
          }}
          inputRef={inputRef}
          onLeaveDuel={() => {
            leaveLobby();
            setCurrentScreen('landing');
          }}
        />
      ) : (
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

          </div>
        </div>
      )}

      {/* shared host settings modal, works on landing + game */}
      <HostSettingsModal
        open={hostSettingsModalOpen && !lobby}
        settings={hostSettings}
        onChange={handleHostSettingsChange}
        onCancel={() => setHostSettingsModalOpen(false)}
        onConfirm={handleConfirmHostSettings}
        confirmDisabled={status !== 'connected'}
      />

      {summary && (
        <GameSummaryCard
          summary={summary}
          players={activePlayers}
          localPlayerId={localPlayer?.id ?? null}
          onClose={resetSummary}
        />
      )}
    </>
  );

};

export default App;


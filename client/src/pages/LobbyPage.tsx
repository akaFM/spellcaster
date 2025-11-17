import { useMemo } from 'react';
import Logo from '../components/Logo';
import type { LobbyState, Player } from '../../../shared/types/socket';
import type { Wizard } from '../types/wizard';
import wizardPurple from '../assets/spellcaster-wizards/wizard-purple.png';
import wizardRed from '../assets/spellcaster-wizards/wizard-red.png';
import wizardBlue from '../assets/spellcaster-wizards/wizard-blue.png';
import wizardGreen from '../assets/spellcaster-wizards/wizard-green.png';
import wizardOrange from '../assets/spellcaster-wizards/wizard-orange.png';
import wizardGrey from '../assets/spellcaster-wizards/wizard-grey.png';

const WIZARDS: Wizard[] = [
  {
    id: 'violet-warden',
    name: 'Violet Vowel',
    color: '#a78bfa',
    description: 'Calm focus. Loves perfect cadence.',
    imageUrl: wizardPurple,
  },
  {
    id: 'crimson-aegis',
    name: 'Red Rhyme',
    color: '#f87171',
    description: 'Aggressive caster with fiery streaks.',
    imageUrl: wizardRed,
  },
  {
    id: 'azure-sage',
    name: 'Blue Backspace',
    color: '#38bdf8',
    description: 'Quick thinker, thrives on momentum.',
    imageUrl: wizardBlue,
  },
  {
    id: 'emerald-scribe',
    name: 'Green Grammar',
    color: '#34d399',
    description: 'Lore keeper of the dueling halls.',
    imageUrl: wizardGreen,
  },
  {
    id: 'golden-starling',
    name: 'Orange Oops',
    color: '#fcd34d',
    description: 'Flashy tactician — accuracy under pressure.',
    imageUrl: wizardOrange,
  },
  {
    id: 'obsidian-mage',
    name: 'Grey Ghostwriter',
    color: '#94a3b8',
    description: 'Steady and unshakable aura.',
    imageUrl: wizardGrey,
  },
];

interface LobbyPageProps {
  lobby: LobbyState;
  localPlayer: Player | null;
  onReadyToggle: () => void;
  onStartDuel: () => void;
  onLeaveLobby: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({
  lobby,
  localPlayer,
  onReadyToggle,
  onStartDuel,
  onLeaveLobby,
}) => {
  const everyoneReady = useMemo(
    () => lobby.players.every((player) => player.ready),
    [lobby.players]
  );
  const canStartDuel = Boolean(localPlayer?.isHost && everyoneReady && lobby.players.length >= 2);

  const formatReadingSpeed = (speed: number): string => {
    return `${speed.toFixed(2)}x`;
  };

  const formatDifficulty = (difficulty: string): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getWizardForPlayer = (wizardId?: string): Wizard | null => {
    if (!wizardId) return null;
    return WIZARDS.find((w) => w.id === wizardId) ?? null;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-magic text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <span className="magic-star" style={{ top: '14%', left: '45%', animationDelay: '0s' }} />
        <span className="magic-star" style={{ top: '60%', left: '75%', animationDelay: '2s' }} />
        <span className="magic-star" style={{ top: '35%', left: '20%', animationDelay: '4s' }} />
        <span className="shooting-star" style={{ top: '5%', right: '10%', animationDelay: '1s' }} />
        <span className="shooting-star" style={{ top: '30%', left: '5%', animationDelay: '6s' }} />
        <span className="floating-spark" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
        <span className="floating-spark" style={{ top: '35%', left: '70%', animationDelay: '2s' }} />
        <span className="floating-spark" style={{ top: '65%', left: '25%', animationDelay: '4s' }} />
        <span className="floating-spark" style={{ top: '50%', left: '85%', animationDelay: '6s' }} />
        <span className="floating-spark" style={{ top: '15%', left: '80%', animationDelay: '8s' }} />
        <span className="wand-ember" style={{ top: '18%', right: '18%', animationDelay: '1s' }} />
        <span className="wand-ember" style={{ bottom: '14%', left: '12%', animationDelay: '3s' }} />
        <span className="wand-ember" style={{ bottom: '20%', right: '30%', animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-4">
        <div className="w-full max-w-3xl space-y-6">
          <header className="text-center space-y-4">
            <Logo />
            <p className="font-spellcaster text-emerald-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] md:text-xl">
              Prepare for the duel.
            </p>
          </header>

          <section className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl sm:p-6">
            <div className="space-y-5">
              {/* Room Code Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Room Code
                  </label>
                  <p className="font-spellcaster text-4xl tracking-[0.3em] text-emerald-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    {lobby.roomCode}
                  </p>
                  <p className="text-xs text-slate-400">
                    Share this code with your opponent
                  </p>
                </div>
                <button
                  onClick={onLeaveLobby}
                  className="rounded-full border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20 hover:border-rose-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
                >
                  Leave Lobby
                </button>
              </div>

              {/* Players Section */}
              <div className="space-y-3">
                <label className="text-sm text-slate-300 uppercase tracking-wide">
                  Dueling Wizards
                </label>
                <div className="space-y-3">
                  {lobby.players.map((player) => {
                    const isLocalPlayer = localPlayer?.id === player.id;
                    const playerWizard = getWizardForPlayer(player.wizardId);
                    return (
                      <div
                        key={player.id}
                        className="rounded-[26px] border border-white/10 bg-slate-950/40 p-4 shadow-inner"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-900/70 to-slate-900 shadow-[0_0_25px_rgba(59,7,100,0.6)]">
                              {playerWizard ? (
                                <span
                                  className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                  style={{ background: playerWizard.color }}
                                >
                                  {playerWizard.imageUrl && (
                                    <img
                                      src={playerWizard.imageUrl}
                                      alt={playerWizard.name}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </span>
                              ) : (
                                <div className="h-12 w-12 rounded-full border border-white/20 bg-gradient-to-br from-purple-500/40 to-indigo-500/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-incantation text-xl text-white">{player.name}</p>
                                {player.isHost && (
                                  <span className="text-xs uppercase tracking-wide text-amber-300">
                                    (Host)
                                  </span>
                                )}
                                {isLocalPlayer && (
                                  <span className="text-xs uppercase tracking-wide text-emerald-300">
                                    (You)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">
                                {player.ready ? (
                                  <span className="inline-flex items-center gap-1.5 text-emerald-300">
                                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    Ready
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                                    <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
                                    Not Ready
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {lobby.players.length < 2 && (
                    <div className="rounded-[26px] border border-dashed border-white/20 bg-slate-950/20 p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/40">
                          <div className="h-12 w-12 rounded-full border border-dashed border-slate-600/40" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-incantation text-xl text-slate-500">Waiting for opponent...</p>
                          <p className="text-xs text-slate-500">
                            Share your room code to invite a friend
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Settings Section */}
              {lobby.settings && (
                <div className="rounded-[26px] border border-white/10 bg-slate-950/40 p-5 shadow-inner">
                  <label className="text-sm text-slate-300 uppercase tracking-wide mb-3 block">
                    Game Settings
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Difficulty</p>
                      <p className="font-incantation text-lg text-white">
                        {formatDifficulty(lobby.settings.difficulty)}
                      </p>
                      {lobby.settings.difficulty === 'custom' && (
                        <p className="text-[11px] text-slate-400">
                          {(lobby.settings.customWords?.length ?? 0)} words loaded
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Rounds</p>
                      <p className="font-incantation text-lg text-white">{lobby.settings.rounds}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reading Speed</p>
                      <p className="font-incantation text-lg text-white">
                        {formatReadingSpeed(lobby.settings.readingSpeed)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onReadyToggle}
                  disabled={!localPlayer}
                  className={`group relative overflow-hidden rounded-2xl border px-4 py-3 text-sm font-spellcaster shadow-[0_12px_28px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                    localPlayer?.ready
                      ? 'border-rose-200/40 bg-gradient-to-r from-rose-500/30 via-rose-600/30 to-rose-500/30 text-rose-50 focus-visible:ring-rose-200/70'
                      : 'border-emerald-300/60 bg-gradient-to-r from-emerald-500/50 via-emerald-600/50 to-emerald-500/50 text-emerald-100 focus-visible:ring-emerald-300/70'
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                    {localPlayer?.ready ? (
                      <>
                        <span className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-rose-300/30 to-transparent blur-xl" />
                        <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-rose-300/30 to-transparent blur-xl" />
                      </>
                    ) : (
                      <>
                        <span className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-emerald-400/50 to-transparent blur-xl" />
                        <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-emerald-400/50 to-transparent blur-xl" />
                      </>
                    )}
                  </span>
                  <span className="relative text-xl tracking-[0.1em]">
                    {localPlayer?.ready ? 'Unready' : 'Ready Up'}
                  </span>
                </button>

                {localPlayer?.isHost ? (
                  <button
                    type="button"
                    onClick={onStartDuel}
                    disabled={!canStartDuel}
                    className="group relative overflow-hidden rounded-2xl border border-emerald-200/40 bg-gradient-to-r from-emerald-500/30 via-indigo-600/30 to-cyan-500/30 px-4 py-3 text-sm font-spellcaster text-emerald-50 shadow-[0_12px_28px_rgba(6,95,70,0.45)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <span className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-emerald-300/30 to-transparent blur-xl" />
                      <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-cyan-300/30 to-transparent blur-xl" />
                    </span>
                    <span className="relative text-3xl tracking-[0.1em]">
                      Start Duel
                    </span>
                  </button>
                ) : (
                  <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-amber-100">
                      Waiting for host to start the game...
                    </p>
                    {!everyoneReady && (
                      <p className="text-xs text-amber-200/80 mt-1">
                        All players must be ready first
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LobbyPage;


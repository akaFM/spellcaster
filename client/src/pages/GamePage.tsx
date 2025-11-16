import { useMemo } from 'react';
import Logo from '../components/Logo';
import { RoundRecapCard } from '../components/RoundRecapCard';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { OnScreenKeyboard } from '../components/OnScreenKeyboard';
import { WizardBeam } from '../components/WizardBeam';
import type { DuelState, Player, CountdownPayload, SpellPromptPayload, RoundRecapPayload } from '../../../shared/types/socket';

interface GamePageProps {
  duel: DuelState;
  localPlayer: Player | null;
  countdown: CountdownPayload | null;
  countdownValue: number | null;
  prompt: SpellPromptPayload | null;
  roundRecap: RoundRecapPayload | null;
  scores: Record<string, number>;
  currentGuess: string;
  hasSubmitted: boolean;
  opponentSubmitted: boolean;
  opponent: Player | null;
  showResultsPending: boolean;
  onGuessChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitSpell: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onLeaveDuel: () => void;
}

const GamePage: React.FC<GamePageProps> = ({
  duel,
  localPlayer,
  countdown,
  countdownValue,
  prompt,
  roundRecap,
  scores,
  currentGuess,
  hasSubmitted,
  opponentSubmitted,
  opponent,
  showResultsPending,
  onGuessChange,
  onSubmitSpell,
  onKeyDown,
  inputRef,
  onLeaveDuel,
}) => {
  const currentRoundNumber = countdown?.roundNumber ?? prompt?.roundNumber ?? roundRecap?.roundNumber ?? duel.round ?? 1;
  const totalRounds = duel.totalRounds;

  const renderCastingPanel = () => (
    <div className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl space-y-2 max-w-2xl mx-auto w-full h-full flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <p className="font-spellcaster text-base text-emerald-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          Type what you hear!
        </p>
        {opponent && (
          <p className="text-xs text-slate-300">
            {opponentSubmitted ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                {opponent.name} cast their spell!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" />
                {opponent.name} is typing...
              </span>
            )}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        id="spell-input"
        value={currentGuess}
        onChange={onGuessChange}
        onKeyDown={onKeyDown}
        className="sr-only-input"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
      />

      <div className="rounded-[20px] border border-white/10 bg-slate-950/40 p-2.5 shadow-inner space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 px-1">Wizard Keyboard Feedback</p>
        <div className="w-full scale-85 origin-top -mt-0">
          <OnScreenKeyboard inputRef={inputRef} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <button
          type="button"
          onClick={onSubmitSpell}
          disabled={!prompt || hasSubmitted}
          className="group relative overflow-hidden rounded-2xl border border-emerald-200/40 bg-gradient-to-r from-emerald-500/30 via-indigo-600/30 to-cyan-500/30 px-3 py-1.5 text-xs font-spellcaster text-emerald-50 shadow-[0_12px_28px_rgba(6,95,70,0.45)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          title={!prompt ? 'Waiting for prompt...' : hasSubmitted ? 'Already submitted' : 'Cast your spell'}
        >
          <span className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <span className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-emerald-300/30 to-transparent blur-xl" />
            <span className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-cyan-300/30 to-transparent blur-xl" />
          </span>
          <span className="relative text-sm tracking-[0.1em]">
            {hasSubmitted ? (
              <span className="inline-flex items-center gap-1.5">
                Spell Casted
                <span className="inline-block text-sm">✔</span>
              </span>
            ) : (
              'Cast Spell'
            )}
          </span>
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-400 select-none">
          <span>or press</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-600/40 bg-slate-800/60 px-2 py-1 font-mono text-[10px] uppercase">
            enter
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-magic text-slate-100">
      {/* Enhanced background animations */}
      <div className="pointer-events-none absolute inset-0">
        <span className="magic-star" style={{ top: '10%', left: '20%', animationDelay: '0s' }} />
        <span className="magic-star" style={{ top: '25%', left: '80%', animationDelay: '1.5s' }} />
        <span className="magic-star" style={{ top: '50%', left: '15%', animationDelay: '3s' }} />
        <span className="magic-star" style={{ top: '70%', left: '75%', animationDelay: '4.5s' }} />
        <span className="magic-star" style={{ top: '35%', left: '50%', animationDelay: '6s' }} />
        <span className="shooting-star" style={{ top: '8%', right: '15%', animationDelay: '0.5s' }} />
        <span className="shooting-star" style={{ top: '45%', left: '8%', animationDelay: '3.5s' }} />
        <span className="shooting-star" style={{ top: '80%', right: '20%', animationDelay: '7s' }} />
        <span className="floating-spark" style={{ top: '15%', left: '30%', animationDelay: '0s' }} />
        <span className="floating-spark" style={{ top: '30%', left: '60%', animationDelay: '1s' }} />
        <span className="floating-spark" style={{ top: '55%', left: '25%', animationDelay: '2s' }} />
        <span className="floating-spark" style={{ top: '65%', left: '70%', animationDelay: '3s' }} />
        <span className="floating-spark" style={{ top: '20%', left: '85%', animationDelay: '4s' }} />
        <span className="floating-spark" style={{ top: '75%', left: '45%', animationDelay: '5s' }} />
        <span className="wand-ember" style={{ top: '12%', right: '25%', animationDelay: '1s' }} />
        <span className="wand-ember" style={{ bottom: '15%', left: '20%', animationDelay: '2.5s' }} />
        <span className="wand-ember" style={{ top: '40%', right: '10%', animationDelay: '4s' }} />
        <span className="wand-ember" style={{ bottom: '25%', right: '35%', animationDelay: '5.5s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-2">
        <div className="w-full max-w-4xl mx-auto space-y-2 flex-1 flex flex-col">
          {/* Header */}
          <header className="text-center space-y-1">
            <div className="flex items-center justify-between">
              <button
                onClick={onLeaveDuel}
                className="rounded-full border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20 hover:border-rose-300/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
              >
                Leave Duel
              </button>
              <div className="flex-1" />
            </div>
            <div className="scale-75 origin-top">
              <Logo />
            </div>
            <div className="flex items-center justify-center gap-4">
              <p className="font-spellcaster text-emerald-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] md:text-lg">
                Round {currentRoundNumber} of {totalRounds}
              </p>
            </div>
          </header>

          {/* Main Content Area - Fixed height to prevent resizing */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-center h-[280px]">
              {roundRecap && (
                <RoundRecapCard recap={roundRecap} localPlayerId={localPlayer?.id ?? null} />
              )}
              {!roundRecap && countdown && countdownValue && (
                <CountdownDisplay
                  value={Math.max(1, Math.round(countdownValue))}
                  roundNumber={countdown.roundNumber}
                  totalRounds={countdown.totalRounds}
                />
              )}
              {!roundRecap && !countdown && prompt && renderCastingPanel()}

              {showResultsPending && (
                <div className="card-glow rounded-[28px] border border-amber-300/30 bg-amber-400/10 px-6 py-4 text-center shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl max-w-2xl mx-auto w-full h-full flex items-center justify-center">
                  <p className="text-sm font-semibold text-amber-100">
                    Adjudicating this round... both wizards must finish before the scroll reveals your work.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Wizard Beam at Bottom */}
          <div className="mt-auto pt-2">
            <WizardBeam
              players={duel.players}
              scores={scores}
              beamOffset={duel.beamOffset}
              roundRecap={roundRecap}
              localPlayerId={localPlayer?.id ?? null}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default GamePage;


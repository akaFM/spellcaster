import type { GameSummary, Player } from '../../../shared/types/socket';

interface GameSummaryCardProps {
  summary: GameSummary;
  players: Player[];
  localPlayerId: string | null;
  onClose: () => void;
}

export function GameSummaryCard({ summary, players, localPlayerId, onClose }: GameSummaryCardProps) {
  const didWin = summary.winnerId === localPlayerId;
  const localPlayer = players.find((player) => player.id === localPlayerId);
  const localRole = localPlayer?.isHost ? 'defending' : 'challenging';
  const opponentRole = localRole === 'defending' ? 'challenging' : 'defending';
  const heroSummary = summary.players.find((player) => player.playerId === localPlayerId);
  const reasonLabelMap: Record<GameSummary['reason'], string> = {
    beam: 'Beam overwhelm',
    rounds: 'All rounds complete',
    forfeit: 'Victory by forfeit',
  };
  const reasonLabel = reasonLabelMap[summary.reason] ?? summary.reason;

  const bannerGradient = didWin
    ? 'from-emerald-400/80 via-emerald-500/70 to-cyan-400/60'
    : 'from-rose-600/80 via-rose-700/60 to-fuchsia-600/50';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_25px_65px_rgba(4,0,24,0.85)]">
        <div className="relative z-10 space-y-8">
          <header
            className="rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-6 text-center text-slate-100 shadow-inner"
          >
            <h2
              className={`font-spellcaster tracking-[0.3em] drop-shadow-[0_0_25px_rgba(0,0,0,0.35)] ${
                didWin
                  ? 'text-emerald-300 text-5xl sm:text-6xl'
                  : 'text-red-500 text-6xl sm:text-7xl'
              }`}
            >
              {didWin ? 'Victory' : 'Defeat'}
            </h2>
            <p
              className={`mt-3 text-base font-incantation ${
                didWin ? 'text-slate-200' : 'text-red-300'
              }`}
            >
              {didWin
                ? `You outspelled the ${opponentRole} wizard.`
                : `The ${opponentRole} wizard overwhelmed your aura.`}
            </p>
          </header>

          {heroSummary && (
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="Average Accuracy" value={`${(heroSummary.averageAccuracy * 100).toFixed(1)}%`} />
              <StatCard label="Average Speed" value={`${(heroSummary.averageDurationMs / 1000).toFixed(2)}s`} />
              <StatCard label="Total Score" value={`${heroSummary.totalScore}`} />
            </section>
          )}

          <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Battle Scroll</p>
              <p className="text-xs text-slate-400">
                Reason:&nbsp;
                <span className="font-semibold text-slate-100">{reasonLabel}</span>
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/5 bg-slate-950/50">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-950/80 text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
                  <tr>
                    <th className="px-3 py-3 text-left">Round</th>
                    <th className="px-3 py-3 text-left">Spell</th>
                    <th className="px-3 py-3 text-left">Your Cast</th>
                    <th className="px-3 py-3 text-left">Accuracy</th>
                    <th className="px-3 py-3 text-left">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summary.rounds.map((round) => {
                    const hero = round.playerResults.find((result) => result.playerId === localPlayerId);
                    if (!hero) {
                      return null;
                    }
                    return (
                      <tr key={`${round.roundNumber}-${round.spell}`} className="hover:bg-white/5 transition">
                        <td className="px-3 py-3 text-slate-400">{round.roundNumber}</td>
                        <td className="px-3 py-3 font-incantation text-slate-100">{round.spell}</td>
                        <td className="px-3 py-3 font-mono text-slate-200 break-words">{hero.guess || '...'}</td>
                        <td className="px-3 py-3 text-slate-200">{Math.round(hero.accuracy * 100)}%</td>
                        <td className="px-3 py-3 text-slate-200">{hero.totalScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex items-center justify-center rounded-2xl border px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 ${
                didWin
                  ? 'border-emerald-200/40 bg-gradient-to-r from-emerald-500/30 via-indigo-600/30 to-cyan-500/30 text-emerald-50 shadow-[0_12px_28px_rgba(6,95,70,0.45)] focus-visible:ring-emerald-200/70'
                  : 'border-rose-200/40 bg-gradient-to-r from-rose-600/40 via-rose-700/40 to-rose-500/30 text-rose-50 shadow-[0_12px_28px_rgba(250,113,113,0.35)] focus-visible:ring-rose-200/70'
              }`}
            >
              Return to Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-4 text-center shadow-[0_12px_28px_rgba(4,0,22,0.6)]">
    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-incantation text-amber-100 drop-shadow-[0_0_15px_rgba(251,191,36,0.45)]">
      {value}
    </p>
  </div>
);


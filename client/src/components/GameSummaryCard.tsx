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

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-6 space-y-5">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">duel results</p>
          <p className={`text-4xl font-bold ${didWin ? 'text-emerald-300' : 'text-rose-300'}`}>
            {didWin ? 'You win!' : 'You lose.'}
          </p>
          <p className="text-slate-300">
            {didWin
              ? `You successfully outspelled the ${opponentRole} wizard.`
              : `You were outspelled by the ${opponentRole} wizard.`}
          </p>
        </div>

        {heroSummary && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">avg accuracy</p>
              <p className="text-2xl font-semibold text-amber-200">
                {(heroSummary.averageAccuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">avg typing speed</p>
              <p className="text-2xl font-semibold text-amber-200">
                {(heroSummary.averageDurationMs / 1000).toFixed(2)}s
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">total score</p>
              <p className="text-2xl font-semibold text-amber-200">{heroSummary.totalScore}</p>
            </div>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
          <table className="w-full text-sm">
            <thead className="text-slate-400 uppercase tracking-wide text-xs">
              <tr>
                <th className="text-left py-2">round</th>
                <th className="text-left py-2">spell</th>
                <th className="text-left py-2">your cast</th>
                <th className="text-left py-2">accuracy</th>
                <th className="text-left py-2">score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {summary.rounds.map((round) => {
                const hero = round.playerResults.find((result) => result.playerId === localPlayerId);
                if (!hero) {
                  return null;
                }
                return (
                  <tr key={`${round.roundNumber}-${round.spell}`}>
                    <td className="py-2 text-slate-400">{round.roundNumber}</td>
                    <td className="py-2 font-semibold text-slate-100">{round.spell}</td>
                    <td className="py-2 font-mono text-slate-200 break-words">{hero.guess || '...'}</td>
                    <td className="py-2 text-slate-200">{Math.round(hero.accuracy * 100)}%</td>
                    <td className="py-2 text-slate-200">{hero.totalScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400">
            Reason: {summary.reason === 'beam' ? 'beam overwhelm' : summary.reason}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"
          >
            return to pregame
          </button>
        </div>
      </div>
    </div>
  );
}


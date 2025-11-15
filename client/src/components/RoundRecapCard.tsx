import type { RoundRecapPayload } from '../../../shared/types/socket';

interface RoundRecapCardProps {
  recap: RoundRecapPayload;
  localPlayerId: string | null;
}

export function RoundRecapCard({ recap, localPlayerId }: RoundRecapCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-700/40 bg-slate-900/70 p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">
          round {recap.roundNumber} / {recap.totalRounds}
        </p>
        <p className="text-2xl font-semibold text-amber-200 mt-1">{recap.spell}</p>
        <p className="text-sm text-slate-400 mt-1">revealed incantation</p>
      </div>

      <div className="space-y-3">
        {recap.playerResults.map((result) => {
          const accuracyPercent = Math.round(result.accuracy * 100);
          const isLocal = result.playerId === localPlayerId;
          const isWinner = recap.winningPlayerId === result.playerId;
          const guessLabel = isLocal ? 'you spelled' : `${result.playerName} spelled`;
          return (
            <div
              key={result.playerId}
              className={`rounded-xl border px-4 py-3 transition ${
                isWinner
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {result.playerName}{' '}
                    {isLocal && <span className="text-xs text-slate-400">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    {isWinner ? 'round advantage' : 'press on'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-200">{result.totalScore}</p>
                  <p className="text-xs text-slate-400">round score</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">{guessLabel}</p>
                  <p className="font-mono text-slate-100 break-words">{result.guess || '...'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">correct spelling</p>
                  <p className="font-mono text-amber-200 break-words">{recap.spell}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">accuracy</p>
                  <p className="font-semibold text-slate-100">{accuracyPercent}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">typing speed</p>
                  <p className="font-semibold">{(result.durationMs / 1000).toFixed(2)}s</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">base score</p>
                  <p className="font-semibold">{result.baseScore}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">speed bonus</p>
                  <p className="font-semibold">{result.bonusScore}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


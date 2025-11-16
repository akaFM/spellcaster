import type { RoundRecapPayload } from '../../../shared/types/socket';

interface RoundRecapCardProps {
  recap: RoundRecapPayload;
  localPlayerId: string | null;
}

export function RoundRecapCard({ recap, localPlayerId }: RoundRecapCardProps) {
  return (
    <div className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl space-y-2 max-w-2xl mx-auto w-full h-full">
      <div className="text-center">
        <p className="text-lg font-semibold text-amber-200">{recap.spell}</p>
        <p className="text-xs text-slate-400 mt-0.5">revealed incantation</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {recap.playerResults.map((result) => {
          const accuracyPercent = Math.round(result.accuracy * 100);
          const isLocal = result.playerId === localPlayerId;
          const isWinner = recap.winningPlayerId === result.playerId;
          const guessLabel = isLocal ? 'you spelled' : `${result.playerName} spelled`;
          return (
            <div
              key={result.playerId}
              className={`rounded-xl border px-2.5 py-1.5 transition ${
                isWinner
                  ? 'border-emerald-400/60 bg-emerald-500/10'
                  : 'border-slate-700/60 bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-xs font-semibold">
                    {result.playerName}{' '}
                    {isLocal && <span className="text-[10px] text-emerald-300">(you)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-200">{result.totalScore}</p>
                  <p className="text-[10px] text-slate-400">round score</p>
                </div>
              </div>
              {/* First line: you spelled, correct spelling, accuracy */}
              <div className="grid grid-cols-3 gap-1.5 mb-1.5 text-xs">
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">{guessLabel}</p>
                  <p className="font-mono text-slate-100 break-words text-xs">{result.guess || '...'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">correct spelling</p>
                  <p className="font-mono text-amber-200 break-words text-xs">{recap.spell}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">accuracy</p>
                  <p className="font-semibold text-slate-100 text-xs">{accuracyPercent}%</p>
                </div>
              </div>
              {/* Second line: typing speed, base score, speed bonus */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">typing speed</p>
                  <p className="font-semibold text-slate-100 text-xs">{(result.durationMs / 1000).toFixed(2)}s</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">base score</p>
                  <p className="font-semibold text-slate-100 text-xs">{result.baseScore}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase tracking-wide mb-0.5">speed bonus</p>
                  <p className="font-semibold text-slate-100 text-xs">{result.bonusScore}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


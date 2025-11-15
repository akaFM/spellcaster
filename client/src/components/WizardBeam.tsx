import type { Player } from '../../../shared/types/socket';

interface WizardBeamProps {
  players: Player[];
  scores: Record<string, number>;
  beamOffset?: number;
}

const BEAM_RANGE = 100;

export function WizardBeam({ players, scores, beamOffset = 0 }: WizardBeamProps) {
  const leftWizard = players[0];
  const rightWizard = players[1];
  const normalized = (beamOffset + BEAM_RANGE) / (BEAM_RANGE * 2);
  const intersectionPercent = Math.max(0, Math.min(100, normalized * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-600/40 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-5">
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-widest mb-4">
        <span className="text-indigo-200">dueling beams</span>
        <span className="text-slate-400 text-xs">
          {Math.round(intersectionPercent)}% toward defender
        </span>
      </div>

      <div className="relative h-24">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-indigo-500 via-amber-300 to-rose-500 opacity-30" />
        <div
          className="absolute top-0 bottom-0 w-1 translate-x-[-50%]"
          style={{
            left: `${intersectionPercent}%`,
          }}
        >
          <div className="h-full w-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-indigo-500/70 border border-indigo-200" />
          <div>
            <p className="text-sm font-semibold text-slate-100">{leftWizard?.name ?? 'waiting'}</p>
            <p className="text-xs text-slate-400">score {scores[leftWizard?.id ?? ''] ?? 0}</p>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 flex-row-reverse">
          <div className="h-12 w-12 rounded-full bg-rose-500/70 border border-rose-200" />
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-100">{rightWizard?.name ?? 'waiting'}</p>
            <p className="text-xs text-slate-400">
              score {scores[rightWizard?.id ?? ''] ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


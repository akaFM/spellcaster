import type { GameSettings } from '../../../shared/types/socket';
import { GameSettingsControls } from './GameSettingsControls';

interface HostSettingsModalProps {
  open: boolean;
  settings: GameSettings;
  onChange: (settings: Partial<GameSettings>) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}

export function HostSettingsModal({
  open,
  settings,
  onChange,
  onCancel,
  onConfirm,
  confirmDisabled,
}: HostSettingsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6 space-y-5">
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">host ritual</p>
          <p className="text-2xl font-bold text-white">configure duel settings</p>
          <p className="text-sm text-slate-400">
            choose your incantation difficulty, number of rounds, and reading speed before summoning the lobby.
          </p>
        </div>

        <GameSettingsControls settings={settings} onChange={onChange} />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-lg border border-slate-600 bg-transparent py-2 text-sm font-semibold text-slate-200 hover:border-slate-400 transition"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            create lobby
          </button>
        </div>
      </div>
    </div>
  );
}


import type { GameSettings, ReadingSpeed, SpellDifficulty } from '../../../shared/types/socket';

interface GameSettingsControlsProps {
  settings: GameSettings;
  disabled?: boolean;
  onChange: (settings: Partial<GameSettings>) => void;
}

const difficultyOptions: SpellDifficulty[] = ['easy', 'medium', 'hard'];
const roundOptions: GameSettings['rounds'][] = [5, 10, 15];
const speedOptions: ReadingSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function GameSettingsControls({ settings, disabled, onChange }: GameSettingsControlsProps) {
  const speedIndex = Math.max(speedOptions.indexOf(settings.readingSpeed), 0);

  const handleSpeedChange = (index: number) => {
    const clampedIndex = Math.min(Math.max(index, 0), speedOptions.length - 1);
    onChange({ readingSpeed: speedOptions[clampedIndex] });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-300 mb-3">spell difficulty</p>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((option) => {
            const isActive = settings.difficulty === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ difficulty: option })}
                className={`py-2.5 rounded-2xl border border-slate-700 bg-gradient-to-r text-sm font-spellcaster uppercase tracking-[0.2em] transition ${
                  isActive
                    ? 'from-sky-500/25 via-blue-500/25 to-indigo-500/25 text-white shadow-[0_5px_14px_rgba(59,130,246,0.28)]'
                    : 'from-transparent via-transparent to-transparent text-slate-200 hover:border-sky-200/40 hover:from-sky-500/5 hover:via-blue-500/5 hover:to-indigo-500/5 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-300 mb-3">rounds</p>
        <div className="flex gap-3">
          {roundOptions.map((round) => {
            const isActive = settings.rounds === round;
            return (
              <button
                key={round}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ rounds: round })}
                className={`flex-1 py-2.5 rounded-2xl border border-slate-700 bg-gradient-to-r text-base font-semibold transition ${
                  isActive
                    ? 'from-sky-400/25 via-blue-500/25 to-indigo-500/25 text-white shadow-[0_5px_14px_rgba(59,130,246,0.28)]'
                    : 'from-transparent via-transparent to-transparent text-slate-200 hover:border-sky-200/40 hover:from-sky-500/5 hover:via-blue-500/5 hover:to-indigo-500/5 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {round}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-300 mb-3">
          <span>reading speed</span>
          <span className="text-slate-200">{settings.readingSpeed.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={0}
          max={speedOptions.length - 1}
          step={1}
          value={speedIndex}
          disabled={disabled}
          onChange={(event) => handleSpeedChange(Number(event.target.value))}
          className="w-full accent-sky-200 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-slate-800/40 [&::-webkit-slider-runnable-track]:via-blue-900/25 [&::-webkit-slider-runnable-track]:to-slate-800/40 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-200 [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(59,130,246,0.45)]"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
          {speedOptions.map((speed) => (
            <span key={speed}>{speed.toFixed(2)}x</span>
          ))}
        </div>
      </div>
    </div>
  );
}


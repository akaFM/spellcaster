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
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">spell difficulty</p>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map((option) => {
            const isActive = settings.difficulty === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ difficulty: option })}
                className={`py-2 rounded-lg border transition ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-500/20 text-white'
                    : 'border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">rounds</p>
        <div className="flex gap-2">
          {roundOptions.map((round) => {
            const isActive = settings.rounds === round;
            return (
              <button
                key={round}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ rounds: round })}
                className={`flex-1 py-2 rounded-lg border transition ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {round}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400 mb-2">
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
          className="w-full accent-purple-400"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          {speedOptions.map((speed) => (
            <span key={speed}>{speed.toFixed(2)}x</span>
          ))}
        </div>
      </div>
    </div>
  );
}


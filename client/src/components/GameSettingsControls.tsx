import { useCallback, useMemo, useRef, useState, useLayoutEffect, type ChangeEvent } from 'react';
import type { GameSettings, ReadingSpeed, SpellDifficulty } from '../../../shared/types/socket';

interface GameSettingsControlsProps {
  settings: GameSettings;
  disabled?: boolean;
  onChange: (settings: Partial<GameSettings>) => void;
}

const difficultyOptions: SpellDifficulty[] = ['easy', 'medium', 'hard', 'custom'];
const roundOptions: GameSettings['rounds'][] = [5, 10, 15];
const speedOptions: ReadingSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
const MAX_CUSTOM_FILE_BYTES = 150 * 1024;
const MAX_CUSTOM_WORDS = 400;
const CUSTOM_PANEL_BUFFER = 32;
const csvSplitter = /[\r\n,;]+/;

const UploadIcon = () => (
  <svg
    aria-hidden="true"
    className="h-3.5 w-3.5 text-slate-200"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path d="M10 4v9" strokeLinecap="round" />
    <path d="M6.5 7.5 10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16h12" strokeLinecap="round" />
  </svg>
);

export function GameSettingsControls({ settings, disabled, onChange }: GameSettingsControlsProps) {
  const speedIndex = Math.max(speedOptions.indexOf(settings.readingSpeed), 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const customPanelContentRef = useRef<HTMLDivElement>(null);
  const [customPanelHeight, setCustomPanelHeight] = useState(0);

  const handleDifficultySelect = useCallback(
    (option: SpellDifficulty) => {
      if (disabled) {
        return;
      }

      if (option === 'custom') {
        onChange({ difficulty: 'custom' });
        return;
      }

      setUploadError(null);
      onChange({
        difficulty: option,
      });
    },
    [disabled, onChange, settings.customWords]
  );

  const handleSpeedChange = (index: number) => {
    const clampedIndex = Math.min(Math.max(index, 0), speedOptions.length - 1);
    onChange({ readingSpeed: speedOptions[clampedIndex] });
  };

  const handleUploadClick = () => {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // reset input so the same file can be selected twice
    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.size > MAX_CUSTOM_FILE_BYTES) {
      setUploadError('csv is too beefy, keep it under 150kb');
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isCsvLike =
      lowerName.endsWith('.csv') ||
      file.type.includes('csv') ||
      file.type.startsWith('text/');

    if (!isCsvLike) {
      setUploadError('only csv files are allowed right now');
      return;
    }

    try {
      setIsParsingCsv(true);
      const text = await file.text();
      const words = text
        .split(csvSplitter)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => entry.slice(0, 64).toUpperCase());

      const uniqueWords = Array.from(new Set(words)).slice(0, MAX_CUSTOM_WORDS);

      if (uniqueWords.length === 0) {
        setUploadError('need at least one word in the csv');
        return;
      }

      setUploadError(null);
      onChange({
        difficulty: 'custom',
        customWords: uniqueWords,
        customWordSourceName: file.name.slice(0, 64),
      });
    } catch (error) {
      console.error('custom csv load failed', error);
      setUploadError('could not read that csv, try again?');
    } finally {
      setIsParsingCsv(false);
    }
  };

  const customWordCount = settings.customWords?.length ?? 0;
  const hasCustomWords = customWordCount > 0;
  const customStatus = useMemo(() => {
    if (!hasCustomWords) {
      return 'Upload a .csv file to load your own words!';
    }
    return `Successfully loaded ${customWordCount} words!`;
  }, [hasCustomWords, customWordCount]);
  const customFilename = settings.customWordSourceName || 'custom.csv';
  const customTrayOpen = settings.difficulty === 'custom';

  const recalcCustomPanelHeight = useCallback(() => {
    if (customPanelContentRef.current) {
      setCustomPanelHeight(customPanelContentRef.current.scrollHeight);
    }
  }, []);

  useLayoutEffect(() => {
    if (customTrayOpen) {
      recalcCustomPanelHeight();
    } else {
      setCustomPanelHeight(0);
    }
  }, [customTrayOpen, recalcCustomPanelHeight, customWordCount, uploadError, isParsingCsv]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-300 mb-3">spell difficulty</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {difficultyOptions.map((option) => {
            const isActive = settings.difficulty === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => handleDifficultySelect(option)}
                className={`py-2.5 rounded-2xl border border-slate-700 bg-gradient-to-r text-sm font-spellcaster uppercase tracking-[0.2em] transition ${
                  isActive
                    ? 'from-sky-500/25 via-blue-500/25 to-indigo-500/25 text-white shadow-[0_5px_14px_rgba(59,130,246,0.28)]'
                    : 'from-transparent via-transparent to-transparent text-slate-200 hover:border-sky-200/40 hover:from-sky-500/5 hover:via-blue-500/5 hover:to-indigo-500/5 hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="inline-flex items-center justify-center gap-1 capitalize">
                  {option}
                  {option === 'custom' && <UploadIcon />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out will-change-[max-height,opacity] ${
              customTrayOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ maxHeight: customTrayOpen ? customPanelHeight + CUSTOM_PANEL_BUFFER : 0 }}
          >
            <div
              ref={customPanelContentRef}
              className="space-y-2 rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex-1 text-sm text-slate-200">{customStatus}</p>
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={disabled || isParsingCsv}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 hover:border-slate-300/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isParsingCsv ? 'loading...' : 'upload csv'}
                    <UploadIcon />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>max {MAX_CUSTOM_WORDS} entries · duplicates removed · keep files under 150kb</p>
                {hasCustomWords && (
                  <p className="text-emerald-300">
                    ✓ {customFilename}
                  </p>
                )}
              </div>
              {uploadError && <p className="text-xs text-rose-300">{uploadError}</p>}
            </div>
          </div>
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


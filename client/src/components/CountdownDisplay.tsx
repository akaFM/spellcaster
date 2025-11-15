interface CountdownDisplayProps {
  value: number;
  roundNumber: number;
  totalRounds: number;
}

export function CountdownDisplay({ value, roundNumber, totalRounds }: CountdownDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-10">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">round begins</p>
      <div className="h-32 w-32 rounded-full border-4 border-indigo-500 flex items-center justify-center">
        <span className="text-5xl font-black text-amber-200">{value}</span>
      </div>
      <p className="text-sm text-slate-300 mt-4">
        round {roundNumber} / {totalRounds}
      </p>
    </div>
  );
}


interface CountdownDisplayProps {
  value: number;
  roundNumber: number;
  totalRounds: number;
}

export function CountdownDisplay({ value, roundNumber, totalRounds }: CountdownDisplayProps) {
  return (
    <div className="card-glow rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_50px_rgba(4,0,23,0.7)] backdrop-blur-2xl flex flex-col items-center justify-center max-w-2xl mx-auto w-full h-full">
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


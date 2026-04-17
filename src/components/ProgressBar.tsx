interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-felt-800/70 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-chip-gold via-poker-red to-chip-gold transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

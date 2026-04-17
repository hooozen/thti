interface OptionButtonProps {
  label: string;
  index: number;
  selected: boolean;
  onClick: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function OptionButton({ label, index, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-xl border px-4 py-3 sm:px-5 sm:py-4 transition-all duration-200 ${
        selected
          ? 'border-chip-gold bg-chip-gold/10 shadow-[0_0_0_2px_rgba(245,192,74,0.25)] scale-[1.01]'
          : 'border-felt-700/70 bg-felt-900/40 hover:border-chip-gold/70 hover:bg-felt-800/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold transition ${
            selected
              ? 'bg-chip-gold text-poker-black'
              : 'bg-felt-800 text-dim group-hover:bg-felt-700 group-hover:text-cream'
          }`}
        >
          {LETTERS[index]}
        </span>
        <span className={`flex-1 leading-relaxed ${selected ? 'text-cream' : 'text-cream/90'}`}>
          {label}
        </span>
      </div>
    </button>
  );
}

const SUITS: { glyph: string; colorClass: string; top: string; left: string; size: string; rotate: string; opacity: string }[] = [
  { glyph: '♠', colorClass: 'text-cream',     top: '8%',  left: '6%',  size: 'text-7xl sm:text-9xl', rotate: '-rotate-12', opacity: 'opacity-[0.04]' },
  { glyph: '♥', colorClass: 'text-poker-red', top: '20%', left: '82%', size: 'text-8xl sm:text-[9rem]', rotate: 'rotate-6',   opacity: 'opacity-[0.05]' },
  { glyph: '♦', colorClass: 'text-poker-red', top: '62%', left: '4%',  size: 'text-7xl sm:text-9xl', rotate: 'rotate-12',  opacity: 'opacity-[0.04]' },
  { glyph: '♣', colorClass: 'text-cream',     top: '78%', left: '86%', size: 'text-8xl sm:text-[9rem]', rotate: '-rotate-6',  opacity: 'opacity-[0.05]' },
  { glyph: '♠', colorClass: 'text-cream',     top: '45%', left: '48%', size: 'text-6xl sm:text-8xl', rotate: 'rotate-3',   opacity: 'opacity-[0.03]' },
];

export function SuitDecoration() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {SUITS.map((s, i) => (
        <span
          key={i}
          className={`absolute select-none font-display ${s.colorClass} ${s.size} ${s.rotate} ${s.opacity}`}
          style={{ top: s.top, left: s.left }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}

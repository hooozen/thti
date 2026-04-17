interface TermFootnoteProps {
  footnotes: { term: string; explain: string }[];
}

export function TermFootnote({ footnotes }: TermFootnoteProps) {
  if (!footnotes || footnotes.length === 0) return null;

  return (
    <dl className="mt-5 rounded-lg border border-felt-700/60 bg-felt-900/30 px-4 py-3 text-xs space-y-1.5">
      {footnotes.map((f, i) => (
        <dd key={i} className="text-dim">
          {" "}
          <span className="font-mono text-chip-gold/90">{f.term}</span> —{" "}
          {f.explain}
        </dd>
      ))}
    </dl>
  );
}

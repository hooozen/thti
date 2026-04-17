import type { GateQuestion, Question } from '../types';
import { ui } from '../i18n';
import { OptionButton } from './OptionButton';
import { TermFootnote } from './TermFootnote';

interface QuestionCardProps {
  question: Question | GateQuestion;
  value: number | undefined;
  onSelect: (v: number) => void;
}

function isGate(q: Question | GateQuestion): q is GateQuestion {
  return (q as GateQuestion).kind === 'gate';
}

export function QuestionCard({ question, value, onSelect }: QuestionCardProps) {
  const t = ui();
  const gate = isGate(question);
  const reversed = !gate && question.reversed;
  const footnotes = !gate ? question.footnotes : undefined;

  return (
    <article className="rounded-2xl bg-felt-900/70 border border-felt-700/60 card-shadow p-5 sm:p-7 backdrop-blur-sm animate-[fadeIn_.3s_ease]">
      <div className="flex items-center gap-2 mb-3">
        {gate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-poker-red text-cream px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            ♦ {t.test.gateBadge}
          </span>
        )}
        {reversed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-chip-gold text-poker-black px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            ⚠ {t.test.reversedBadge}
          </span>
        )}
      </div>
      <h2 className="text-lg sm:text-xl font-semibold leading-snug text-cream">
        {question.text}
      </h2>

      <div className="mt-5 space-y-2.5">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            index={i}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>

      {footnotes && footnotes.length > 0 && <TermFootnote footnotes={footnotes} />}
    </article>
  );
}

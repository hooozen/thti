import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsData, ui } from '../i18n';
import { shuffle, pickGateInsertIndex } from '../lib/shuffle';
import { saveSession, encodeAnswers } from '../lib/store';
import { score } from '../lib/scoring';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import type { AnswerMap, GateQuestion, Question } from '../types';

interface GateAnswers {
  g1?: number;
  g2?: number;
}

export function TestPage() {
  const t = ui();
  const navigate = useNavigate();
  const data = questionsData() as unknown as { questions: Question[]; gates: GateQuestion[] };
  const all = data.questions;
  const gates = data.gates;
  const g1 = gates.find((g) => g.id === 'g1')!;
  const g2 = gates.find((g) => g.id === 'g2')!;

  const seedRef = useRef<number>(Math.floor(Math.random() * 1e9));
  const { order, gateIndex } = useMemo(() => {
    const seed = seedRef.current;
    const ordered = shuffle(all, seed);
    const idx = pickGateInsertIndex(all.length, seed + 1);
    return { order: ordered, gateIndex: idx };
  }, [all]);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [gate, setGate] = useState<GateAnswers>({});
  const [cursor, setCursor] = useState(0);
  const [showG2, setShowG2] = useState(false);

  const list = useMemo(() => {
    const arr: (Question | GateQuestion)[] = [...order];
    arr.splice(gateIndex, 0, g1);
    if (showG2) {
      arr.splice(gateIndex + 1, 0, g2);
    }
    return arr;
  }, [order, gateIndex, g1, g2, showG2]);

  const total = list.length;
  const finished = cursor >= total;
  const currentQ = finished ? null : list[cursor];
  const currentValue = !currentQ
    ? undefined
    : currentQ.id === 'g1'
      ? gate.g1
      : currentQ.id === 'g2'
        ? gate.g2
        : answers[currentQ.id];

  function handleSelect(v: number) {
    if (!currentQ) return;
    const qid = currentQ.id;
    if (qid === 'g1') {
      const opt = g1.options.find((o) => o.value === v);
      if (opt?.triggers === 'g2') {
        setGate((prev) => ({ ...prev, g1: v }));
        setShowG2(true);
      } else {
        setGate((prev) => ({ ...prev, g1: v, g2: undefined }));
        setShowG2(false);
      }
    } else if (qid === 'g2') {
      setGate((prev) => ({ ...prev, g2: v }));
    } else {
      setAnswers((prev) => ({ ...prev, [qid]: v }));
    }
    setCursor((c) => c + 1);
  }

  function handleBack() {
    setCursor((c) => Math.max(0, c - 1));
  }

  function handleNext() {
    setCursor((c) => c + 1);
  }

  useEffect(() => {
    if (!finished) return;
    const mainAnswered = order.every((q) => typeof answers[q.id] === 'number');
    if (!mainAnswered) {
      const firstMissing = list.findIndex((q) => {
        if (q.id === 'g1') return gate.g1 === undefined;
        if (q.id === 'g2') return gate.g2 === undefined;
        return typeof answers[q.id] !== 'number';
      });
      if (firstMissing >= 0) setCursor(firstMissing);
      return;
    }

    const result = score({ answers, gateG1: gate.g1, gateG2: gate.g2 });
    const payload = encodeAnswers(answers, gate.g1, gate.g2);
    saveSession({
      answers,
      gateG1: gate.g1,
      gateG2: gate.g2,
      questionOrder: list.map((q) => q.id),
      gateInsertIndex: gateIndex,
      startedAt: Date.now(),
    });
    navigate(`/result/${encodeURIComponent(result.code)}/${payload}`, { replace: true });
  }, [finished, order, answers, gate.g1, gate.g2, gateIndex, list, navigate]);

  const answeredMainCount = order.reduce(
    (n, q) => (typeof answers[q.id] === 'number' ? n + 1 : n),
    0,
  );
  const nextEnabled = currentValue !== undefined;
  const isLast = !finished && cursor === total - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 bg-felt-900/80 backdrop-blur-md border-b border-felt-800/60">
        <div className="flex items-center justify-end mb-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-dim hover:text-cream transition"
          >
            × 退出
          </button>
        </div>
        <ProgressBar current={answeredMainCount} total={order.length} />
      </div>

      {currentQ ? (
        <>
          <div className="mt-6">
            <QuestionCard
              key={`${currentQ.id}-${cursor}`}
              question={currentQ}
              value={currentValue}
              onSelect={handleSelect}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={cursor === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-felt-700 bg-felt-900/40 px-4 py-2 text-sm text-cream disabled:opacity-40 disabled:cursor-not-allowed hover:border-chip-gold/60 transition"
            >
              ← {t.test.backButton}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!nextEnabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-chip-gold text-poker-black font-semibold px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              {isLast ? t.test.submitButton : t.test.nextButton} →
            </button>
          </div>
        </>
      ) : (
        <div className="mt-20 text-center text-dim text-sm">
          正在统计你的德扑人格…
        </div>
      )}
    </div>
  );
}

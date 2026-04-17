import type { AnswerMap } from '../types';

const KEY = 'thti:session:v1';

export interface Session {
  answers: AnswerMap;
  gateG1?: number;
  gateG2?: number;
  questionOrder: string[];      // resolved question ids including gate insert positions
  gateInsertIndex: number;
  startedAt: number;
}

export function saveSession(s: Session) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Encode answers into a URL-friendly string for shareable /result/:code/:payload */
export function encodeAnswers(answers: AnswerMap, g1?: number, g2?: number): string {
  // 30 main questions q1..q30 each 1/2/3 → 30 digits, then g1(0-4) + g2(0-2)
  let s = '';
  for (let i = 1; i <= 30; i++) {
    s += String(answers[`q${i}`] ?? 0);
  }
  s += String(g1 ?? 0);
  s += String(g2 ?? 0);
  return s;
}

export function decodeAnswers(payload: string): { answers: AnswerMap; g1?: number; g2?: number } | null {
  if (!/^\d{32}$/.test(payload)) return null;
  const answers: AnswerMap = {};
  for (let i = 0; i < 30; i++) {
    const v = Number(payload[i]);
    if (v < 1 || v > 3) return null;
    answers[`q${i + 1}`] = v;
  }
  const g1 = Number(payload[30]);
  const g2 = Number(payload[31]);
  return {
    answers,
    g1: g1 === 0 ? undefined : g1,
    g2: g2 === 0 ? undefined : g2,
  };
}

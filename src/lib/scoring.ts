import {
  DIMENSION_ORDER,
  type AnswerMap,
  type DimensionCode,
  type Level,
  type LevelNum,
  type PersonalityType,
  type Question,
  type ScoreResult,
} from '../types';
import { questionsData, typesData } from '../i18n';

/** raw score (2~6) → L/M/H */
export function levelOf(raw: number): Level {
  if (raw <= 3) return 'L';
  if (raw === 4) return 'M';
  return 'H';
}

export function levelToNum(l: Level): LevelNum {
  return l === 'L' ? 1 : l === 'M' ? 2 : 3;
}

export function numToLevel(n: LevelNum): Level {
  return n === 1 ? 'L' : n === 2 ? 'M' : 'H';
}

/** Parse pattern like "HHH-HMH-MHH-HHH-MHM" → [3,3,3,3,2,3,2,3,3,3,3,3,2,3,2] */
export function parsePattern(pattern: string): LevelNum[] {
  const clean = pattern.replace(/-/g, '');
  if (clean.length !== 15) {
    throw new Error(`Invalid pattern length: ${pattern}`);
  }
  return Array.from(clean).map((c) => levelToNum(c as Level));
}

/** User's 15 raw sums → 15 LevelNums */
export function buildUserVector(answers: AnswerMap): {
  vector: LevelNum[];
  dimensionBreakdown: ScoreResult['dimensionBreakdown'];
} {
  const questions = (questionsData().questions as unknown as Question[]);
  const byDim: Record<DimensionCode, number> = {} as Record<DimensionCode, number>;

  for (const d of DIMENSION_ORDER) byDim[d] = 0;

  for (const q of questions) {
    const v = answers[q.id];
    if (typeof v !== 'number') continue;
    byDim[q.dimension] += v;
  }

  const vector: LevelNum[] = [];
  const dimensionBreakdown: ScoreResult['dimensionBreakdown'] = [];
  for (const code of DIMENSION_ORDER) {
    const raw = byDim[code];
    const lvl = levelOf(raw);
    const num = levelToNum(lvl);
    vector.push(num);
    dimensionBreakdown.push({ code, level: lvl, value: num, raw });
  }

  return { vector, dimensionBreakdown };
}

export function vectorToPattern(vec: LevelNum[]): string {
  const chars = vec.map((n) => numToLevel(n));
  return [
    chars.slice(0, 3).join(''),
    chars.slice(3, 6).join(''),
    chars.slice(6, 9).join(''),
    chars.slice(9, 12).join(''),
    chars.slice(12, 15).join(''),
  ].join('-');
}

export function manhattan(a: LevelNum[], b: LevelNum[]): number {
  let sum = 0;
  for (let i = 0; i < 15; i++) sum += Math.abs(a[i] - b[i]);
  return sum;
}

export function exactCount(a: LevelNum[], b: LevelNum[]): number {
  let c = 0;
  for (let i = 0; i < 15; i++) if (a[i] === b[i]) c++;
  return c;
}

export function similarity(distance: number): number {
  return Math.max(0, Math.round((1 - distance / 30) * 100));
}

/** Main match function (without hidden overrides) */
export function matchBest(answers: AnswerMap): ScoreResult {
  const { vector, dimensionBreakdown } = buildUserVector(answers);
  const userPattern = vectorToPattern(vector);
  const types = typesData().types as unknown as PersonalityType[];

  const scored = types.map((t) => {
    const tv = parsePattern(t.pattern);
    const d = manhattan(vector, tv);
    const e = exactCount(vector, tv);
    return {
      code: t.code,
      cn: t.cn,
      pattern: t.pattern,
      distance: d,
      exactCount: e,
      similarity: similarity(d),
    };
  });

  scored.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.exactCount !== b.exactCount) return b.exactCount - a.exactCount;
    return b.similarity - a.similarity;
  });

  const best = scored[0];
  const second = scored[1];

  return {
    ...best,
    userPattern,
    userVector: vector,
    dimensionBreakdown,
    secondary: {
      ...second,
      userPattern,
      userVector: vector,
      dimensionBreakdown,
    },
  };
}

export interface ScoreInput {
  answers: AnswerMap;
  gateG1?: number;
  gateG2?: number;
}

/**
 * Full pipeline with hidden overrides.
 * - DEGEN: if g1==4 && g2==2 → override result, normal best becomes secondary
 * - LUCKY-Star: if best similarity < 60% → fallback
 */
export function score({ answers, gateG1, gateG2 }: ScoreInput): ScoreResult {
  const normal = matchBest(answers);

  // DEGEN override
  if (gateG1 === 4 && gateG2 === 2) {
    return {
      code: 'DEGEN',
      cn: '赌狗',
      pattern: '',
      distance: 0,
      similarity: 100,
      exactCount: 15,
      userPattern: normal.userPattern,
      userVector: normal.userVector,
      dimensionBreakdown: normal.dimensionBreakdown,
      hiddenTrigger: 'degen',
      secondary: {
        code: normal.code,
        cn: normal.cn,
        pattern: normal.pattern,
        distance: normal.distance,
        similarity: normal.similarity,
        exactCount: normal.exactCount,
        userPattern: normal.userPattern,
        userVector: normal.userVector,
        dimensionBreakdown: normal.dimensionBreakdown,
      },
    };
  }

  // LUCKY-Star fallback
  if (normal.similarity < 60) {
    return {
      code: 'LUCKY-Star',
      cn: '锦鲤',
      pattern: '',
      distance: normal.distance,
      similarity: normal.similarity,
      exactCount: normal.exactCount,
      userPattern: normal.userPattern,
      userVector: normal.userVector,
      dimensionBreakdown: normal.dimensionBreakdown,
      hiddenTrigger: 'lucky',
      secondary: {
        code: normal.code,
        cn: normal.cn,
        pattern: normal.pattern,
        distance: normal.distance,
        similarity: normal.similarity,
        exactCount: normal.exactCount,
        userPattern: normal.userPattern,
        userVector: normal.userVector,
        dimensionBreakdown: normal.dimensionBreakdown,
      },
    };
  }

  return normal;
}

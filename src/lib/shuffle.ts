/** Deterministic shuffle (Fisher-Yates) with optional seed */
export function shuffle<T>(arr: readonly T[], seed?: number): T[] {
  const a = arr.slice();
  let rnd = seed !== undefined ? mulberry32(seed) : Math.random;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an index in [0, len) to insert gate q1 into shuffled question list */
export function pickGateInsertIndex(totalQuestions: number, seed?: number): number {
  const rnd = seed !== undefined ? mulberry32(seed) : Math.random;
  // Avoid very first / very last to keep it surprising
  return 5 + Math.floor(rnd() * (totalQuestions - 10));
}

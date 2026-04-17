import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { dimensionsData, typesData, ui } from "../i18n";
import { decodeAnswers, loadSession } from "../lib/store";
import { score } from "../lib/scoring";
import type { DimensionCode, PersonalityType, ScoreResult } from "../types";
import { ShareControls } from "../components/ShareControls";

function findType(code: string): PersonalityType | null {
  const td = typesData() as unknown as {
    types: PersonalityType[];
    hidden?: PersonalityType[];
  };
  const all = [...td.types, ...(td.hidden ?? [])];
  return all.find((t) => t.code === code) ?? null;
}

function suitFor(code: string): { glyph: string; red: boolean } {
  const seed = code.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const suits = ["♠", "♥", "♦", "♣"];
  const glyph = suits[seed % 4];
  return { glyph, red: glyph === "♥" || glyph === "♦" };
}

function SuitBadge({ code }: { code: string }) {
  const { glyph, red } = suitFor(code);
  return (
    <div
      className={`flex h-24 w-16 sm:h-28 sm:w-20 items-center justify-center rounded-lg bg-cream font-display text-5xl sm:text-6xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15),0_4px_20px_-4px_rgba(0,0,0,0.5)] ${red ? "text-poker-red" : "text-poker-black"}`}
    >
      {glyph}
    </div>
  );
}

function LevelBar({ level }: { level: "L" | "M" | "H" }) {
  const width = level === "L" ? "w-1/3" : level === "M" ? "w-2/3" : "w-full";
  const color =
    level === "H"
      ? "bg-chip-gold"
      : level === "M"
        ? "bg-felt-400"
        : "bg-felt-700";
  return (
    <div className="h-1.5 w-16 sm:w-24 rounded-full bg-felt-900/60 overflow-hidden">
      <div className={`h-full ${width} ${color}`} />
    </div>
  );
}

interface DimensionBreakdownProps {
  breakdown: ScoreResult["dimensionBreakdown"];
}

function DimensionBreakdown({ breakdown }: DimensionBreakdownProps) {
  const dims = dimensionsData() as unknown as {
    models: Record<string, { name: string; short: string; desc: string }>;
    dimensions: Record<
      DimensionCode,
      { name: string; L: string; M: string; H: string }
    >;
  };

  const byModel: Record<string, typeof breakdown> = {
    P: [],
    A: [],
    R: [],
    T: [],
    S: [],
  };
  for (const b of breakdown) {
    const m = b.code[0];
    byModel[m].push(b);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["P", "A", "R", "T", "S"] as const).map((m) => (
        <div
          key={m}
          className="rounded-xl border border-felt-700/60 bg-felt-900/50 p-4"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h4 className="font-display text-base text-chip-gold">
              {dims.models[m].name}
            </h4>
            <span className="font-mono text-[10px] text-dim tracking-wider">
              {m}
            </span>
          </div>
          <div className="space-y-2.5">
            {byModel[m].map((b) => {
              const info = dims.dimensions[b.code];
              return (
                <div key={b.code} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-cream truncate">
                        {info.name}
                      </span>
                      <span className="font-mono text-[10px] text-dim">
                        {b.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-dim/80 truncate">
                      {info[b.level]}
                    </div>
                  </div>
                  <LevelBar level={b.level} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultPage() {
  const { code, payload } = useParams();
  const t = ui();
  const navigate = useNavigate();

  // Decode payload or load from session
  const decoded = useMemo(() => {
    if (payload) return decodeAnswers(payload);
    const s = loadSession();
    if (s && Object.keys(s.answers).length > 0) {
      return { answers: s.answers, g1: s.gateG1, g2: s.gateG2 };
    }
    return null;
  }, [payload]);

  useEffect(() => {
    // If no code and no decoded data → bounce home
    if (!code && !decoded) {
      navigate("/", { replace: true });
    }
  }, [code, decoded, navigate]);

  // If we have decoded answers, compute score. Otherwise render static type info by code.
  const result: ScoreResult | null = decoded
    ? score({
        answers: decoded.answers,
        gateG1: decoded.g1,
        gateG2: decoded.g2,
      })
    : null;

  // Resolve which code to display (URL code param wins if it diverges from score — e.g., browsing)
  const displayCode = code || result?.code || "";
  const typeInfo = findType(displayCode);

  if (!typeInfo) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl text-cream">找不到这个人格</h1>
        <Link to="/" className="mt-6 inline-block text-chip-gold underline">
          返回首页
        </Link>
      </div>
    );
  }

  const isHidden = !!typeInfo.hidden;
  const hasUserData = !!result;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const isDegen = result?.hiddenTrigger === "degen" || displayCode === "DEGEN";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <section className="rounded-2xl bg-felt-900/60 border border-felt-700/60 card-shadow p-5 sm:p-8 backdrop-blur-sm">
        <div className="flex  gap-5 sm:gap-7 items-center">
          <SuitBadge code={typeInfo.code} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-dim tracking-wider font-mono uppercase">
              {t.result.yourType}
              {isHidden && (
                <span className="rounded-full bg-poker-red text-cream px-2 py-0.5 text-[10px]">
                  HIDDEN
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl sm:text-5xl font-black leading-tight">
              <span className="text-chip-gold font-mono mr-3 text-2xl sm:text-4xl">
                {typeInfo.code}
              </span>
              <span className="text-cream">{typeInfo.cn}</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-cream/90 leading-relaxed italic">
              「{typeInfo.tagline}」
            </p>
            {hasUserData && !isHidden && (
              <div className="mt-4 flex flex-wrap text-sm items-baseline gap-1.5">
                <span className="text-dim">{t.result.exactLabel}</span>
                <span className="font-mono font-bold text-cream">
                  {result!.exactCount}
                  <span className="text-dim">/15</span>
                </span>
                <span className="text-dim">{t.result.matchLabel}</span>
                <span className="font-mono font-bold text-chip-gold text-xl">
                  {result!.similarity}%
                </span>
              </div>
            )}
            {hasUserData && result!.hiddenTrigger === "lucky" && (
              <div className="mt-4 rounded-lg bg-chip-gold/10 border border-chip-gold/40 text-cream/90 px-4 py-2.5 text-sm">
                🎏 {t.result.luckyNotice}
              </div>
            )}
            {isDegen && (
              <div className="mt-4 rounded-lg bg-poker-red/15 border border-poker-red/50 text-cream px-4 py-3 text-sm">
                <div className="font-bold text-poker-red mb-1">
                  ⚠ {t.result.degenNotice}
                </div>
                <div className="text-xs text-cream/80">
                  {t.result.degenHotline}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Three-part description */}
      <section className="mt-6 grid gap-4">
        <div className="rounded-xl border border-felt-700/60 bg-felt-900/50 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-poker-red text-xl">♠</span>
            <h2 className="font-display text-xl text-chip-gold">
              {t.result.pokerLabel}
            </h2>
          </div>
          <p className="text-cream/90 leading-relaxed text-[15px]">
            {typeInfo.poker}
          </p>
        </div>

        <div className="rounded-xl border border-felt-700/60 bg-felt-900/50 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-poker-red text-xl">♥</span>
            <h2 className="font-display text-xl text-chip-gold">
              {t.result.lifeLabel}
            </h2>
          </div>
          <p className="text-cream/90 leading-relaxed text-[15px]">
            {typeInfo.life}
          </p>
        </div>

        <div className="rounded-xl border border-poker-red/50 bg-poker-red/10 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-chip-gold text-xl">⚠</span>
            <h2 className="font-display text-xl text-poker-red">
              {t.result.warningLabel}
            </h2>
          </div>
          <p className="text-cream leading-relaxed text-[15px] font-medium">
            {typeInfo.warning}
          </p>
        </div>
      </section>

      {/* Dimension breakdown */}
      {hasUserData && !isHidden && (
        <section className="mt-8">
          <h3 className="font-display text-xl sm:text-2xl text-cream mb-4">
            {t.result.dimensionBreakdownLabel}
          </h3>
          <div className="mb-3 font-mono text-xs text-dim">
            {t.result.dimensionLabel}:{" "}
            <span className="text-chip-gold">{result!.userPattern}</span>
            {typeInfo.pattern && (
              <>
                {" "}
                · 参考型{" "}
                <span className="text-cream/70">{typeInfo.pattern}</span>
              </>
            )}
          </div>
          <DimensionBreakdown breakdown={result!.dimensionBreakdown} />
        </section>
      )}

      {/* Secondary */}
      {hasUserData && result!.secondary && !isHidden && (
        <section className="mt-8 rounded-xl border border-felt-700/60 bg-felt-900/40 p-5">
          <div className="text-xs text-dim mb-2">{t.result.secondaryLabel}</div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-chip-gold">
              {result!.secondary!.code}
            </span>
            <span className="font-display text-lg text-cream">
              {result!.secondary!.cn}
            </span>
            <span className="font-mono text-xs text-dim ml-auto">
              {result!.secondary!.similarity}%
            </span>
          </div>
        </section>
      )}

      {/* Share + actions */}
      <section className="mt-10 flex flex-col gap-4">
        {hasUserData &&
          (() => {
            const s = suitFor(typeInfo.code);
            return (
              <ShareControls
                code={typeInfo.code}
                cn={typeInfo.cn}
                tagline={typeInfo.tagline}
                shareUrl={shareUrl}
                similarity={isHidden ? undefined : result!.similarity}
                exactCount={isHidden ? undefined : result!.exactCount}
                suitGlyph={s.glyph}
                suitIsRed={s.red}
              />
            );
          })()}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            to="/test"
            className="inline-flex items-center gap-2 rounded-lg bg-poker-red text-cream font-semibold px-4 py-2.5 hover:bg-poker-red-dark transition"
          >
            ↻ {t.result.retakeButton}
          </Link>
        </div>
      </section>
    </div>
  );
}

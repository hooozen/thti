import { Link } from 'react-router-dom';
import { ui } from '../i18n';

export function HomePage() {
  const t = ui();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-24">
      <section className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-felt-700/70 bg-felt-900/50 px-3 py-1 text-[11px] tracking-wider text-dim font-mono uppercase">
          <span className="text-poker-red">♥</span>
          <span>{t.app.fullName}</span>
          <span className="text-poker-red">♦</span>
        </div>

        <h1 className="mt-6 font-display text-4xl sm:text-6xl font-black leading-[1.1] text-cream text-shadow-card">
          {t.home.heroTitle}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-cream/80 max-w-2xl mx-auto leading-relaxed">
          {t.home.heroSubtitle}
        </p>
        <p className="mt-3 font-mono text-xs sm:text-sm text-chip-gold/80 tracking-wider">
          {t.home.heroMeta}
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Link
            to="/test"
            className="btn-shine inline-flex items-center gap-2 rounded-lg bg-poker-red text-cream font-bold px-6 py-3 text-base shadow-[0_8px_24px_-8px_rgba(215,38,61,0.6)] transition hover:bg-poker-red-dark active:scale-[0.98]"
          >
            {t.home.startButton}
            <span className="text-lg">→</span>
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-3">
        {t.home.features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-felt-700/60 bg-felt-900/40 p-5 hover:border-chip-gold/60 transition"
          >
            <div className="font-display text-lg text-chip-gold">{f.title}</div>
            <p className="mt-2 text-sm text-cream/80 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

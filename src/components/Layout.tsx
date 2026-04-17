import { Link, Outlet } from 'react-router-dom';
import { ui } from '../i18n';
import { SuitDecoration } from './SuitDecoration';

export function Layout() {
  const t = ui();

  return (
    <div className="felt-bg min-h-dvh flex flex-col text-cream">
      <SuitDecoration />

      <header className="relative z-10 border-b border-felt-800/60 backdrop-blur-sm bg-felt-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="inline-flex items-baseline gap-0.5 font-mono font-bold text-xl sm:text-2xl tracking-tight">
              <span className="text-poker-red">T</span>
              <span className="text-cream">H</span>
              <span className="text-poker-red">T</span>
              <span className="text-cream">I</span>
            </span>
            <span className="hidden sm:inline text-xs text-dim tracking-wider uppercase border-l border-felt-700 pl-2">
              {t.app.subtitle}
            </span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-felt-800/60 bg-felt-900/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 text-center space-y-1.5">
          <p className="text-xs text-dim leading-relaxed">{t.footer.disclaimer}</p>
          <p className="text-[11px] text-dim/60">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

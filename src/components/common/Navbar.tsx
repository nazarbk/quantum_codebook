import React from 'react';
import { Language } from '../../types/language';
import type { AppUser } from '../../auth/AuthProvider';
import type { SyncStatus } from '../../hooks/useProgress';
import { Theme } from '../../types/theme';

export type AppTab = 'roadmap' | 'lessons' | 'quiz' | 'miniproject';

interface NavbarProps {
  /** Active block shown under the logo and used for the tab labels. */
  block: { order: number; title: Record<Language, string>; lessonCount: number; miniProjectShort: Record<Language, string> };
  quizPassed: boolean;
  miniProjectCompleted: boolean;
  xp: number;
  level: number;
  /** Signed-in user (null in local mode). */
  user: AppUser | null;
  syncStatus: SyncStatus;
  onSignOut?: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const SYNC_COPY: Record<SyncStatus, Record<Language, string>> = {
  idle: { es: 'Modo local · progreso en este navegador', en: 'Local mode · progress in this browser' },
  loading: { es: 'Cargando tu progreso…', en: 'Loading your progress…' },
  saving: { es: 'Guardando…', en: 'Saving…' },
  saved: { es: 'Progreso guardado en tu cuenta', en: 'Progress saved to your account' },
  error: { es: 'Sin conexión: se guarda en este navegador y se reintentará', en: 'Offline: kept in this browser, will retry' },
};

export const Navbar: React.FC<NavbarProps> = ({
  block,
  quizPassed,
  miniProjectCompleted,
  xp,
  level,
  user,
  syncStatus,
  onSignOut,
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-600 to-violet-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20">
            ⚛
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">Quantum Codebook</h1>
            <p className="text-xs text-cyan-300 font-mono">
              {lang === 'es' ? `Bloque ${block.order}: ${block.title.es}` : `Block ${block.order}: ${block.title.en}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex max-w-full flex-wrap items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('roadmap')}
            aria-current={activeTab === 'roadmap' ? 'page' : undefined}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🗺️ {lang === 'es' ? 'Ruta' : 'Roadmap'}
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            📖 {lang === 'es' ? `Lecciones (1-${block.lessonCount})` : `Lessons (1-${block.lessonCount})`}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'quiz'
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            📝 {lang === 'es' ? 'Test de Evaluación' : 'Assessment Quiz'}
            {quizPassed && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('miniproject')}
            className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'miniproject'
                ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🚀 {lang === 'es' ? `Mini-Proyecto (${block.miniProjectShort.es})` : `Mini-Project (${block.miniProjectShort.en})`}
            {miniProjectCompleted && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            )}
          </button>
        </nav>

        {/* Language Switcher & XP */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={lang === 'es' ? (theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro') : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
            title={lang === 'es' ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : (theme === 'dark' ? 'Light mode' : 'Dark mode')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-lg text-cyan-300 transition-colors hover:border-cyan-500/50"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setLang('es')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'es' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'en' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Lvl {level}
              </span>
              <span className="text-xs font-black text-amber-400 font-mono">⚡ {xp} XP</span>
            </div>
          </div>

          {/* Account */}
          <div className="flex items-center gap-2" title={SYNC_COPY[syncStatus][lang]}>
            {user ? (
              <>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full border border-slate-700" />
                  : <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sm font-bold text-cyan-300">{user.name.slice(0, 1).toUpperCase()}</span>}
                <div className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className={`block text-[10px] ${syncStatus === 'error' ? 'text-amber-300' : 'text-slate-500'}`}>{SYNC_COPY[syncStatus][lang]}</span>
                </div>
                {onSignOut && (
                  <button type="button" onClick={onSignOut} className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white">
                    {lang === 'es' ? 'Salir' : 'Sign out'}
                  </button>
                )}
              </>
            ) : (
              <span className="rounded-xl border border-dashed border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-400">{SYNC_COPY.idle[lang]}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

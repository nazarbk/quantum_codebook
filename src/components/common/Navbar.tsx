import React from 'react';
import { UserProgress } from '../../types/user';
import { Language } from '../../types/language';
import { Theme } from '../../types/theme';

export type AppTab = 'roadmap' | 'lessons' | 'quiz' | 'miniproject';

interface NavbarProps {
  progress: UserProgress;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
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
              {lang === 'es' ? 'Bloque 1: Fundamentos del Qubit' : 'Block 1: Qubit Fundamentals'}
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
            📖 {lang === 'es' ? 'Lecciones (1-6)' : 'Lessons (1-6)'}
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
            {progress.quizPassed && (
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
            🚀 {lang === 'es' ? 'Mini-Proyecto (QRNG)' : 'Mini-Project (QRNG)'}
            {progress.miniProjectCompleted && (
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
                Lvl {progress.level}
              </span>
              <span className="text-xs font-black text-amber-400 font-mono">⚡ {progress.totalXp} XP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

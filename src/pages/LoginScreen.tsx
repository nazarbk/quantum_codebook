import React from 'react';
import { Language } from '../types/language';
import { Theme } from '../types/theme';

interface LoginScreenProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onSignIn: () => void;
  error: string | null;
}

const GoogleLogo = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

/** Shown when accounts are enabled and nobody is signed in. */
export const LoginScreen: React.FC<LoginScreenProps> = ({ lang, setLang, theme, onToggleTheme, onSignIn, error }) => {
  const es = lang === 'es';
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="flex justify-end gap-2 p-4">
        <button type="button" onClick={onToggleTheme} aria-label={es ? 'Cambiar tema' : 'Toggle theme'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-lg text-cyan-300">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1 font-mono text-xs">
          {(['es', 'en'] as const).map((code) => (
            <button key={code} type="button" onClick={() => setLang(code)} className={`rounded-lg px-2.5 py-1 ${lang === code ? 'bg-cyan-700 font-bold text-white' : 'text-slate-400'}`}>{code.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-2xl md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-600 to-violet-600 text-2xl font-bold shadow-lg shadow-cyan-500/20">⚛</div>
          <h1 className="mt-4 text-2xl font-black text-white">Quantum Codebook</h1>
          <p className="mt-2 text-sm text-slate-400">
            {es
              ? 'Aprende computación cuántica desde cero: teoría, código en el navegador, tests y proyectos.'
              : 'Learn quantum computing from scratch: theory, in-browser code, quizzes and projects.'}
          </p>
          <ul className="mx-auto mt-5 max-w-xs space-y-1.5 text-left text-xs text-slate-300">
            <li>🗺️ {es ? 'Tu propia ruta y progreso, en cualquier dispositivo' : 'Your own roadmap and progress, on any device'}</li>
            <li>📝 {es ? 'Notas personales en cada lección' : 'Personal notes on every lesson'}</li>
            <li>⚡ {es ? 'XP, niveles y bloques que se desbloquean' : 'XP, levels and unlockable blocks'}</li>
          </ul>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow hover:bg-slate-50"
          >
            <GoogleLogo />
            {es ? 'Continuar con Google' : 'Continue with Google'}
          </button>
          {error && <p role="alert" className="mt-3 text-xs text-rose-400">{error}</p>}
          <p className="mt-4 text-[11px] text-slate-500">
            {es
              ? 'Solo usamos tu nombre, tu email y tu foto de Google para identificar tu cuenta y guardar tu progreso.'
              : 'We only use your Google name, email and picture to identify your account and save your progress.'}
          </p>
        </div>
      </main>
    </div>
  );
};

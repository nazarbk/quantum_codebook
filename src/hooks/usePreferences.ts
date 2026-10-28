import { useEffect, useState } from 'react';
import { Language } from '../types/language';
import { Theme } from '../types/theme';

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Preference stays for this session. */ }
}

/** Language and theme of this browser (kept even before signing in). */
export function usePreferences() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = read('quantum_codebook_lang');
    if (saved === 'es' || saved === 'en') return saved;
    return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = read('quantum_codebook_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    write('quantum_codebook_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    write('quantum_codebook_theme', theme);
  }, [theme]);

  return { lang, setLang, theme, setTheme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')) };
}

import React, { useEffect, useState } from 'react';
import { Language } from '../../types/language';
import { PREPARED_HINTS } from '../../data/preparedHints';

interface HintPanelProps { exerciseSlug: string; lang: Language }

export const HintPanel: React.FC<HintPanelProps> = ({ exerciseSlug, lang }) => {
  const [isHintOpen, setIsHintOpen] = useState(false);
  useEffect(() => {
    setIsHintOpen(false);
  }, [exerciseSlug]);
  const hints = PREPARED_HINTS[exerciseSlug];
  if (!hints) return null;
  const activeHint = isHintOpen ? hints[1][lang] : null;

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{lang === 'es' ? 'Pista de razonamiento' : 'Reasoning hint'}</h3>
          <p className="mt-1 text-xs text-slate-400">{lang === 'es' ? 'Una orientación conceptual para desbloquear el siguiente paso.' : 'A conceptual prompt to unlock the next step.'}</p>
        </div>
        <button
          type="button"
          aria-pressed={isHintOpen}
          onClick={() => setIsHintOpen((open) => !open)}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${isHintOpen ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-cyan-500/30'}`}
        >
          {isHintOpen ? (lang === 'es' ? '💡 Ocultar pista' : '💡 Hide hint') : (lang === 'es' ? '💡 Ver pista' : '💡 Show hint')}
        </button>
      </div>

      {activeHint && (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4" aria-live="polite">
          <h4 className="text-sm font-bold text-cyan-200">{activeHint.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{activeHint.guidance}</p>
          <p className="mt-3 border-t border-slate-800 pt-3 text-xs font-semibold text-violet-200">
            {lang === 'es' ? 'Siguiente paso: ' : 'Next step: '}{activeHint.nextStep}
          </p>
        </div>
      )}
    </section>
  );
};

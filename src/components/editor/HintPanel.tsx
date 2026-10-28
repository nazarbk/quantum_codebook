import React, { useEffect, useState } from 'react';
import { Language } from '../../types/language';
import type { HintLevel, LocalizedHints } from '../../types/hints';

interface HintPanelProps { exerciseSlug: string; hints?: LocalizedHints; lang: Language }

const LEVELS: HintLevel[] = [1, 2, 3];

/** Up to three hints, revealed one at a time: from a conceptual nudge to an almost explicit step. */
export const HintPanel: React.FC<HintPanelProps> = ({ exerciseSlug, hints, lang }) => {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    setRevealed(0);
  }, [exerciseSlug]);
  if (!hints) return null;
  const es = lang === 'es';
  const available = LEVELS.filter((level) => hints[level]);

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{es ? 'Pistas de razonamiento' : 'Reasoning hints'}</h3>
          <p className="mt-1 text-xs text-slate-400">{es ? 'Ábrelas de una en una: cada pista concreta un poco más el siguiente paso.' : 'Open them one at a time: each hint makes the next step a little more concrete.'}</p>
        </div>
        <div className="flex gap-2">
          {revealed > 0 && (
            <button type="button" onClick={() => setRevealed(0)} className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
              {es ? 'Ocultar' : 'Hide'}
            </button>
          )}
          {revealed < available.length && (
            <button
              type="button"
              onClick={() => setRevealed((count) => count + 1)}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-500/70"
            >
              💡 {revealed === 0 ? (es ? 'Ver pista' : 'Show hint') : (es ? `Otra pista (${revealed + 1}/${available.length})` : `Another hint (${revealed + 1}/${available.length})`)}
            </button>
          )}
        </div>
      </div>

      {revealed > 0 && (
        <ol className="mt-4 space-y-3" aria-live="polite">
          {available.slice(0, revealed).map((level) => {
            const hint = hints[level][lang];
            return (
              <li key={level} className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">{es ? `Pista ${level}` : `Hint ${level}`}</p>
                <h4 className="text-sm font-bold text-cyan-200">{hint.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{hint.guidance}</p>
                <p className="mt-3 border-t border-slate-800 pt-3 text-xs font-semibold text-violet-200">
                  {es ? 'Siguiente paso: ' : 'Next step: '}{hint.nextStep}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

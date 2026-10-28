import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../../types/language';

interface LessonNotesProps {
  value: string;
  onChange: (text: string) => void;
  lang: Language;
}

const SAVE_DELAY_MS = 600;
export const MAX_NOTE_LENGTH = 5000;

/** Personal notes for a lesson, saved automatically with the learner's progress. */
export const LessonNotes: React.FC<LessonNotesProps> = ({ value, onChange, lang }) => {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const es = lang === 'es';

  // Keep the box in sync when progress arrives from the account (only while not typing).
  useEffect(() => {
    if (saved) setDraft(value);
  }, [value, saved]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleChange = (text: string) => {
    const limited = text.slice(0, MAX_NOTE_LENGTH);
    setDraft(limited);
    setSaved(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      onChangeRef.current(limited);
      setSaved(true);
    }, SAVE_DELAY_MS);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor="lesson-notes" className="text-sm font-bold text-slate-100">📝 {es ? 'Mis notas' : 'My notes'}</label>
        <span className="text-[11px] text-slate-500" aria-live="polite">
          {saved ? (es ? 'Guardado' : 'Saved') : (es ? 'Guardando…' : 'Saving…')}
        </span>
      </div>
      <textarea
        id="lesson-notes"
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        rows={4}
        placeholder={es ? 'Apunta dudas, ideas o lo que quieras recordar de esta lección…' : 'Write down questions, ideas or anything you want to remember from this lesson…'}
        className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
      />
      <p className="mt-1 text-right text-[10px] text-slate-500">{draft.length}/{MAX_NOTE_LENGTH}</p>
    </section>
  );
};

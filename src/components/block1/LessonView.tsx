import React, { useEffect, useState } from 'react';
import { LESSONS_BLOCK_1 } from '../../data/block1Data';
import { QuantumCodeEditor } from '../editor/QuantumCodeEditor';
import { BlochSphere } from '../quantum/BlochSphere';
import { HintPanel } from '../editor/HintPanel';
import { MathRenderer } from '../common/MathRenderer';
import { BlochCoordinates, stateToBlochCoordinates } from '../../utils/quantumMath';
import { CheckFailure, TARGET_BLOCH, TARGET_CIRCUITS, checkExercise } from '../../utils/exerciseChecks';
import { Language } from '../../types/language';
import { Theme } from '../../types/theme';
import { CircuitWorkspace } from '../quantum/CircuitWorkspace';
import { compareCircuit, readPennyLaneCircuit } from '../../utils/pennylaneCircuit';

const FEEDBACK: Record<CheckFailure, Record<Language, string>> = {
  'wrong-result': {
    es: 'La ejecución terminó, pero el estado obtenido aún no es el objetivo. Revisa las puertas y vuelve a intentarlo.',
    en: 'The program ran, but the resulting state is not the target yet. Check your gates and try again.',
  },
  'missing-state': {
    es: 'No se encontró la variable `state`. Guarda el resultado del circuito en `state = circuit()` para poder comprobarlo.',
    en: 'No `state` variable was found. Store the circuit result as `state = circuit()` so it can be checked.',
  },
  'invalid-state': {
    es: '`state` debe ser el vector normalizado de un qubit (2 amplitudes con |α|² + |β|² = 1).',
    en: '`state` must be a normalized single-qubit vector (2 amplitudes with |α|² + |β|² = 1).',
  },
  'missing-samples': {
    es: 'No se encontró la variable `samples`. Guarda las medidas en `samples = circuit()` para poder comprobarlas.',
    en: 'No `samples` variable was found. Store the measurements as `samples = circuit()` so they can be checked.',
  },
};

interface LessonViewProps {
  completedLessons: string[];
  solvedExercises: string[];
  onMarkExerciseSolved: (slug: string) => void;
  onCompleteLesson: (slug: string, xp: number) => void;
  lang: Language;
  theme: Theme;
}

export const LessonView: React.FC<LessonViewProps> = ({
  completedLessons,
  solvedExercises,
  onMarkExerciseSolved,
  onCompleteLesson,
  lang,
  theme,
}) => {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [openTheorySections, setOpenTheorySections] = useState<number[]>([0]);
  const currentLesson = LESSONS_BLOCK_1[selectedLessonIndex];
  
  const [blochCoords, setBlochCoords] = useState<BlochCoordinates>({ x: 0, y: 0, z: 1 });
  const [lastOutput, setLastOutput] = useState<string>('');
  const [exerciseFeedback, setExerciseFeedback] = useState<string>('');
  const [visualization, setVisualization] = useState<'bloch' | 'circuit' | 'both'>('bloch');
  const [showBlochTarget, setShowBlochTarget] = useState(false);
  const [showCircuitTarget, setShowCircuitTarget] = useState(false);
  const [editorCode, setEditorCode] = useState<string>(currentLesson.exercise.starterCode.pennylane[lang]);
  const targetBloch = TARGET_BLOCH[currentLesson.slug] ?? { x: 0, y: 0, z: 1 };
  const targetCircuit = TARGET_CIRCUITS[currentLesson.slug] ?? [];
  const currentCircuit = readPennyLaneCircuit(editorCode);
  const circuitProgress = compareCircuit(currentCircuit, targetCircuit);

  const isLessonCompleted = completedLessons.includes(currentLesson.slug);
  const isExerciseSolved = solvedExercises.includes(currentLesson.slug);
  const theorySections = currentLesson.contentMarkdown[lang]
    .split(/(?=^###\s)/m)
    .map((section) => {
      const [heading, ...body] = section.trim().split('\n');
      return { heading: heading.replace(/^###\s*/, '').replace(/^\d+[.\s]+/, ''), body: body.join('\n').trim() };
    })
    .filter((section) => section.heading && section.body);

  useEffect(() => {
    setExerciseFeedback('');
    setLastOutput('');
    setBlochCoords({ x: 0, y: 0, z: 1 });
    setOpenTheorySections([0]);
    setVisualization('bloch');
    setShowBlochTarget(false);
    setShowCircuitTarget(false);
    setEditorCode(currentLesson.exercise.starterCode.pennylane[lang]);
  }, [currentLesson.slug]);

  const handleExecutionSuccess = (output: string, statevector?: [number, number][], samples?: number[]) => {
    setLastOutput(output);
    if (statevector?.length === 2) {
      setBlochCoords(stateToBlochCoordinates([statevector[0], statevector[1]]));
    }
    const check = checkExercise(currentLesson.slug, statevector, samples);
    if (!check.passed) {
      setExerciseFeedback(FEEDBACK[check.reason][lang]);
      return;
    }
    setExerciseFeedback('');
    onMarkExerciseSolved(currentLesson.slug);

  };

  const handleNextLesson = () => {
    if (selectedLessonIndex < LESSONS_BLOCK_1.length - 1) {
      setSelectedLessonIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">
      {/* Lesson Selector Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {LESSONS_BLOCK_1.map((lesson, idx) => {
          const done = completedLessons.includes(lesson.slug);
          const active = idx === selectedLessonIndex;
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLessonIndex(idx)}
              aria-current={active ? 'step' : undefined}
              aria-label={`${lang === 'es' ? 'Lección' : 'Lesson'} ${idx + 1}: ${lesson.title[lang]}${done ? (lang === 'es' ? ', completada' : ', completed') : ''}`}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                active
                  ? 'bg-cyan-700 text-white border-cyan-500 shadow-lg shadow-cyan-700/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-cyan-600/60'
              }`}
            >
              <span>{done ? '✅' : '📖'}</span>
              <span>L{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Deep Theory Content + KaTeX Math + Bibliography */}
        <div className="lg:col-span-5 self-start bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">
                {lang === 'es' ? `Lección ${selectedLessonIndex + 1} de ${LESSONS_BLOCK_1.length}` : `Lesson ${selectedLessonIndex + 1} of ${LESSONS_BLOCK_1.length}`}
              </span>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                +{currentLesson.xpReward} XP
              </span>
            </div>

            <h2 className="text-xl font-black text-white">{currentLesson.title[lang]}</h2>
            <p className="text-xs text-slate-400 italic">{currentLesson.subtitle[lang]}</p>

            <div className="space-y-2" aria-label={lang === 'es' ? 'Teoría de la lección' : 'Lesson theory'}>
              {theorySections.map((section, index) => (
                <section key={`${currentLesson.slug}-theory-${index}`} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/35">
                  <button
                    type="button"
                    aria-expanded={openTheorySections.includes(index)}
                    onClick={() => setOpenTheorySections((open) => open.includes(index)
                      ? open.filter((sectionIndex) => sectionIndex !== index)
                      : [...open, index])}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/40"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-[11px] font-bold text-cyan-300">{index + 1}</span>
                      {section.heading}
                    </span>
                    <span className="text-xs text-cyan-300" aria-hidden="true">{openTheorySections.includes(index) ? '−' : '+'}</span>
                  </button>
                  {openTheorySections.includes(index) && (
                    <div className="max-h-[42vh] overflow-y-auto border-t border-slate-800 px-4 py-3">
                      <MathRenderer content={section.body} className="text-sm leading-relaxed" />
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Bibliography Section */}
            {currentLesson.bibliography && currentLesson.bibliography.length > 0 && (
              <details className="rounded-xl border border-slate-800 bg-slate-950/30">
                <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-violet-300">
                  📚 {lang === 'es' ? 'Bibliografía y lecturas recomendadas' : 'Bibliography & recommended reading'}
                </summary>
                <div className="space-y-2 border-t border-slate-800 p-3">
                  {currentLesson.bibliography.map((item, i) => (
                    <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                      <div className="font-bold text-slate-200">
                        {item.title} ({item.year})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.author} — {item.publisher}
                      </div>
                      <p className="text-[11px] text-indigo-300/90 mt-1 italic">{item.note[lang]}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-1 text-[10px] text-sky-400 hover:underline font-mono"
                        >
                          🔗 {lang === 'es' ? 'Ver recurso original' : 'View original resource'} ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Action Footer: Gated Completion + Next Lesson Button */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={() => onCompleteLesson(currentLesson.slug, currentLesson.xpReward)}
              disabled={isLessonCompleted || !isExerciseSolved}
              className={`w-full py-3 rounded-xl text-xs font-extrabold transition-all shadow-lg ${
                isLessonCompleted
                  ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400 cursor-default'
                  : isExerciseSolved
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25 cursor-pointer active:scale-95'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLessonCompleted
                ? (lang === 'es' ? '✅ Lección Entendida y Completada' : '✅ Lesson Solved & Completed')
                : isExerciseSolved
                ? (lang === 'es' ? '✨ Marcar Lección como Entendida (+XP)' : '✨ Mark Lesson as Understood (+XP)')
                : (lang === 'es' ? '🔒 Ejecuta primero el código de la consola para desbloquear' : '🔒 Run console exercise first to unlock')}
            </button>

            {/* NEXT LESSON BUTTON (Visible when lesson is completed) */}
            {isLessonCompleted && selectedLessonIndex < LESSONS_BLOCK_1.length - 1 && (
              <button
                onClick={handleNextLesson}
                className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>{lang === 'es' ? 'Siguiente Lección ➔' : 'Next Lesson ➔'}</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: 1. Exercise Statement FIRST -> 2. Code Editor & Console -> 3. Bloch Sphere */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. EXERCISE STATEMENT AT THE TOP */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <span>🎯</span>
                <span>{currentLesson.exercise.title[lang]}</span>
              </h3>
              {isExerciseSolved && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  ✓ {lang === 'es' ? 'EJERCICIO RESUELTO' : 'EXERCISE SOLVED'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentLesson.exercise.description[lang]}
            </p>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
              <strong>{lang === 'es' ? 'Meta Esperada:' : 'Target Goal:'}</strong> {currentLesson.exercise.targetGoal[lang]}
            </div>
            {exerciseFeedback && <p role="status" className="text-xs text-amber-300">{exerciseFeedback}</p>}
          </div>

          {/* 2. MONACO CODE EDITOR & CONSOLE */}
          <div className="h-[620px]">
            <QuantumCodeEditor
              starterCodeMap={currentLesson.exercise.starterCode}
              initialSdk="pennylane"
              theme={theme}
              lang={lang}
              onCodeSuccess={handleExecutionSuccess}
              onCodeChange={setEditorCode}
            />
          </div>

          {/* 3. Interactive state and circuit visualizer */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-100">{lang === 'es' ? 'Visualización del ejercicio' : 'Exercise visualization'}</h3>
              <div className="flex flex-wrap justify-end gap-2">
                <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1" role="group" aria-label={lang === 'es' ? 'Tipo de visualización' : 'Visualization type'}>
                  {(['bloch', 'circuit', 'both'] as const).map((view) => (
                    <button key={view} type="button" aria-pressed={visualization === view} onClick={() => setVisualization(view)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${visualization === view ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {view === 'bloch' ? (lang === 'es' ? 'Esfera' : 'Sphere') : view === 'circuit' ? (lang === 'es' ? 'Circuito' : 'Circuit') : (lang === 'es' ? 'Ambos' : 'Both')}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1" aria-label={lang === 'es' ? 'Ayudas visuales' : 'Visual aids'}>
                  <button type="button" aria-pressed={showBlochTarget} onClick={() => setShowBlochTarget((visible) => !visible)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${showBlochTarget ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-400 hover:text-white'}`}>
                    ◎ {lang === 'es' ? 'Estado objetivo' : 'Target state'}
                  </button>
                  <button type="button" aria-pressed={showCircuitTarget} onClick={() => setShowCircuitTarget((visible) => !visible)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${showCircuitTarget ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:text-white'}`}>
                    ⌘ {lang === 'es' ? 'Circuito objetivo' : 'Target circuit'}
                  </button>
                </div>
              </div>
            </div>
            {(visualization === 'bloch' || visualization === 'both') && (
              <div className={visualization === 'both' ? 'grid grid-cols-1 xl:grid-cols-2 gap-3' : ''}>
                <div>
                  <BlochSphere coordinates={blochCoords} targetCoordinates={showBlochTarget ? targetBloch : undefined} size={280} theme={theme} />
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                    <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />{lastOutput ? (lang === 'es' ? 'Estado actual (última ejecución)' : 'Current state (last run)') : (lang === 'es' ? 'Estado inicial |0⟩' : 'Initial state |0⟩')}</span>
                    {showBlochTarget && <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />{lang === 'es' ? 'Estado objetivo' : 'Target state'}</span>}
                  </div>
                </div>
                {visualization === 'both' && <CircuitWorkspace
                  actual={currentCircuit}
                  target={targetCircuit}
                  revealTarget={showCircuitTarget}
                  progress={circuitProgress}
                  lang={lang}
                  theme={theme}
                />}
              </div>
            )}
            {visualization === 'circuit' && <CircuitWorkspace
              actual={currentCircuit}
              target={targetCircuit}
              revealTarget={showCircuitTarget}
              progress={circuitProgress}
              lang={lang}
              theme={theme}
            />}
          </section>

          <HintPanel exerciseSlug={currentLesson.slug} lang={lang} />
        </div>
      </div>
    </div>
  );
};

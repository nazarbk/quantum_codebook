import React from 'react';
import { COURSE_BLOCKS } from '../../data/courseBlocks';
import { LESSONS_BLOCK_1 } from '../../data/block1Data';
import { CourseBlockDefinition } from '../../types/course';
import { Language } from '../../types/language';
import { UserProgress } from '../../types/user';

export type RoadmapTarget = 'lessons' | 'quiz' | 'miniproject';

interface RoadmapViewProps {
  progress: UserProgress;
  block2Unlocked: boolean;
  lang: Language;
  onNavigate: (target: RoadmapTarget) => void;
}

type BlockState = 'completed' | 'in-progress' | 'unlocked' | 'locked';

const STATE_COPY: Record<BlockState, Record<Language, string>> = {
  completed: { es: '✓ Completado', en: '✓ Completed' },
  'in-progress': { es: 'En curso', en: 'In progress' },
  unlocked: { es: 'Desbloqueado · contenido en preparación', en: 'Unlocked · content in preparation' },
  locked: { es: '🔒 Bloqueado', en: '🔒 Locked' },
};

const STATE_STYLE: Record<BlockState, { badge: string; dot: string; card: string }> = {
  completed: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400 border-emerald-300', card: 'border-emerald-500/30' },
  'in-progress': { badge: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/30', dot: 'bg-cyan-400 border-cyan-200', card: 'border-cyan-500/40' },
  unlocked: { badge: 'bg-violet-500/10 text-violet-200 border-violet-500/30', dot: 'bg-violet-400 border-violet-200', card: 'border-violet-500/30' },
  locked: { badge: 'bg-slate-950 text-slate-400 border-slate-700', dot: 'bg-slate-700 border-slate-600', card: 'border-slate-800' },
};

/** Block 1 milestones: every lesson, the quiz, and the mini-project. */
function block1Milestones(progress: UserProgress) {
  const lessonsDone = LESSONS_BLOCK_1.filter((lesson) => progress.completedLessons.includes(lesson.slug)).length;
  const total = LESSONS_BLOCK_1.length + 2;
  const done = lessonsDone + Number(progress.quizPassed) + Number(progress.miniProjectCompleted);
  return { lessonsDone, done, total, percent: Math.round((done / total) * 100) };
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ progress, block2Unlocked, lang, onNavigate }) => {
  const block1 = block1Milestones(progress);
  const es = lang === 'es';
  const block1Minutes = LESSONS_BLOCK_1.reduce((sum, lesson) => sum + lesson.durationMinutes, 0);

  const stateOf = (block: CourseBlockDefinition): BlockState => {
    if (block.order === 1) return block1.done === block1.total ? 'completed' : 'in-progress';
    if (block.order === 2 && block2Unlocked) return 'unlocked';
    return 'locked';
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-300">{es ? 'Ruta del curso' : 'Course roadmap'}</p>
            <h2 className="mt-1 text-xl font-black text-white">{es ? 'Del qubit a la computación cuántica aplicada' : 'From the qubit to applied quantum computing'}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              {es
                ? `${COURSE_BLOCKS.length} bloques, desde nivel 0 hasta avanzado. Cada bloque combina teoría, ejercicios con PennyLane, un test y un mini-proyecto.`
                : `${COURSE_BLOCKS.length} blocks, from level 0 to advanced. Each block combines theory, PennyLane exercises, a quiz, and a mini-project.`}
            </p>
          </div>
          <div className="min-w-[180px] text-right">
            <span className="text-xs text-slate-400">{es ? 'Progreso del curso' : 'Course progress'}</span>
            <span className="block text-2xl font-black text-amber-400 font-mono">{Math.round(block1.percent / COURSE_BLOCKS.length)}%</span>
            <span className="text-[11px] text-slate-500">{es ? `Bloque 1: ${block1.percent}%` : `Block 1: ${block1.percent}%`}</span>
          </div>
        </div>
      </header>

      <ol className="relative space-y-4 border-l-2 border-slate-800 pl-6 md:pl-8" aria-label={es ? 'Bloques del curso' : 'Course blocks'}>
        {COURSE_BLOCKS.map((block) => {
          const state = stateOf(block);
          const style = STATE_STYLE[state];
          const prerequisite = COURSE_BLOCKS.find((candidate) => candidate.id === block.prerequisiteBlockId);
          return (
            <li key={block.id} className="relative" aria-current={state === 'in-progress' ? 'step' : undefined}>
              <span className={`absolute -left-[33px] md:-left-[41px] top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 ${style.dot}`} aria-hidden="true" />
              <article className={`rounded-2xl border bg-slate-900/80 p-4 md:p-5 ${style.card} ${state === 'locked' ? 'opacity-80' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                      {es ? `Bloque ${block.order}` : `Block ${block.order}`} · {block.level[lang]}
                    </p>
                    <h3 className="mt-0.5 text-base font-extrabold text-white">{block.title[lang]}</h3>
                    <p className="text-xs text-slate-400">{block.subtitle[lang]}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}>{STATE_COPY[state][lang]}</span>
                </div>

                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={es ? 'Temas' : 'Topics'}>
                  {block.topics[lang].map((topic) => (
                    <li key={topic} className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-[11px] text-slate-300">{topic}</li>
                  ))}
                </ul>

                {block.order === 1 ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{es ? `${block1.done} de ${block1.total} hitos` : `${block1.done} of ${block1.total} milestones`}</span>
                        <span>≈ {block1Minutes} min</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-950" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={block1.percent} aria-label={es ? 'Progreso del bloque 1' : 'Block 1 progress'}>
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all" style={{ width: `${block1.percent}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button type="button" onClick={() => onNavigate('lessons')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">📖 {es ? 'Lecciones' : 'Lessons'}</span>
                        <span className="text-sm font-bold text-slate-100">{block1.lessonsDone}/{LESSONS_BLOCK_1.length}</span>
                      </button>
                      <button type="button" onClick={() => onNavigate('quiz')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">📝 {es ? 'Test' : 'Quiz'}</span>
                        <span className={`text-sm font-bold ${progress.quizPassed ? 'text-emerald-300' : 'text-slate-100'}`}>{progress.quizPassed ? (es ? '✓ Aprobado' : '✓ Passed') : (es ? 'Pendiente' : 'Pending')}</span>
                      </button>
                      <button type="button" onClick={() => onNavigate('miniproject')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">🚀 {es ? 'Mini-proyecto' : 'Mini-project'}</span>
                        <span className={`text-sm font-bold ${progress.miniProjectCompleted ? 'text-emerald-300' : 'text-slate-100'}`}>{progress.miniProjectCompleted ? (es ? '✓ Superado' : '✓ Passed') : (es ? 'Pendiente' : 'Pending')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    {state === 'unlocked'
                      ? (es ? 'Has cumplido los requisitos. Las lecciones se publicarán aquí.' : 'You meet the requirements. Lessons will be published here.')
                      : prerequisite
                        ? (es ? `Se desbloquea al completar el Bloque ${prerequisite.order}: ${prerequisite.title.es}.` : `Unlocks after completing Block ${prerequisite.order}: ${prerequisite.title.en}.`)
                        : (es ? 'Próximamente.' : 'Coming soon.')}
                    {block.lessonCount === null && state !== 'unlocked' && (es ? ' Contenido en preparación.' : ' Content in preparation.')}
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

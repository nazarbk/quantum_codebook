import React from 'react';
import { COURSE_BLOCKS } from '../../data/courseBlocks';
import { CourseBlockDefinition } from '../../types/course';
import { Language } from '../../types/language';
import type { BlockContent } from '../../types/block';
import { CourseProgress, blockMilestones, blockProgressOf } from '../../utils/progress';
import { isBlockUnlocked } from '../../data/courseContent';

export type RoadmapTarget = 'lessons' | 'quiz' | 'miniproject';

interface RoadmapViewProps {
  progress: CourseProgress;
  content: Record<string, BlockContent>;
  activeBlockId: string;
  lang: Language;
  onOpenBlock: (blockId: string, target: RoadmapTarget) => void;
}

type BlockState = 'completed' | 'in-progress' | 'available' | 'preparing' | 'locked';

const STATE_COPY: Record<BlockState, Record<Language, string>> = {
  completed: { es: '✓ Completado', en: '✓ Completed' },
  'in-progress': { es: 'En curso', en: 'In progress' },
  available: { es: 'Disponible', en: 'Available' },
  preparing: { es: 'Desbloqueado · contenido en preparación', en: 'Unlocked · content in preparation' },
  locked: { es: '🔒 Bloqueado', en: '🔒 Locked' },
};

const STATE_STYLE: Record<BlockState, { badge: string; dot: string; card: string }> = {
  completed: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400 border-emerald-300', card: 'border-emerald-500/30' },
  'in-progress': { badge: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/30', dot: 'bg-cyan-400 border-cyan-200', card: 'border-cyan-500/40' },
  available: { badge: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/30', dot: 'bg-cyan-400 border-cyan-200', card: 'border-cyan-500/30' },
  preparing: { badge: 'bg-violet-500/10 text-violet-200 border-violet-500/30', dot: 'bg-violet-400 border-violet-200', card: 'border-violet-500/30' },
  locked: { badge: 'bg-slate-950 text-slate-400 border-slate-700', dot: 'bg-slate-700 border-slate-600', card: 'border-slate-800' },
};

export const RoadmapView: React.FC<RoadmapViewProps> = ({ progress, content, activeBlockId, lang, onOpenBlock }) => {
  const es = lang === 'es';

  const milestonesOf = (block: CourseBlockDefinition) => {
    const blockContent = content[block.id];
    return blockContent ? blockMilestones(blockProgressOf(progress, block.id), blockContent.lessons.map((lesson) => lesson.slug)) : null;
  };

  const stateOf = (block: CourseBlockDefinition): BlockState => {
    if (!isBlockUnlocked(block, progress)) return 'locked';
    const milestones = milestonesOf(block);
    if (!milestones) return 'preparing';
    if (milestones.done === milestones.total) return 'completed';
    return milestones.done > 0 || block.id === activeBlockId ? 'in-progress' : 'available';
  };

  const coursePercent = Math.round(COURSE_BLOCKS.reduce((sum, block) => sum + (milestonesOf(block)?.percent ?? 0), 0) / COURSE_BLOCKS.length);

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
            <span className="block text-2xl font-black text-amber-400 font-mono">{coursePercent}%</span>
          </div>
        </div>
      </header>

      <ol className="relative space-y-4 border-l-2 border-slate-800 pl-6 md:pl-8" aria-label={es ? 'Bloques del curso' : 'Course blocks'}>
        {COURSE_BLOCKS.map((block) => {
          const state = stateOf(block);
          const style = STATE_STYLE[state];
          const prerequisite = COURSE_BLOCKS.find((candidate) => candidate.id === block.prerequisiteBlockId);
          const blockContent = content[block.id];
          const milestones = milestonesOf(block);
          const blockProgress = blockProgressOf(progress, block.id);
          const open = state !== 'locked' && state !== 'preparing' && blockContent;
          const minutes = blockContent?.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0);
          return (
            <li key={block.id} className="relative" aria-current={block.id === activeBlockId ? 'step' : undefined}>
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

                {open && milestones ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{es ? `${milestones.done} de ${milestones.total} hitos` : `${milestones.done} of ${milestones.total} milestones`}</span>
                        <span>≈ {minutes} min</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-950" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={milestones.percent} aria-label={es ? `Progreso del bloque ${block.order}` : `Block ${block.order} progress`}>
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all" style={{ width: `${milestones.percent}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button type="button" onClick={() => onOpenBlock(block.id, 'lessons')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">📖 {es ? 'Lecciones' : 'Lessons'}</span>
                        <span className="text-sm font-bold text-slate-100">{milestones.lessonsDone}/{blockContent.lessons.length}</span>
                      </button>
                      <button type="button" onClick={() => onOpenBlock(block.id, 'quiz')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">📝 {es ? 'Test' : 'Quiz'}</span>
                        <span className={`text-sm font-bold ${blockProgress.quizPassed ? 'text-emerald-300' : 'text-slate-100'}`}>{blockProgress.quizPassed ? (es ? '✓ Aprobado' : '✓ Passed') : (es ? 'Pendiente' : 'Pending')}</span>
                      </button>
                      <button type="button" onClick={() => onOpenBlock(block.id, 'miniproject')} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-cyan-500/50">
                        <span className="block text-[11px] text-slate-400">🚀 {es ? 'Mini-proyecto' : 'Mini-project'}</span>
                        <span className={`text-sm font-bold ${blockProgress.miniProjectCompleted ? 'text-emerald-300' : 'text-slate-100'}`}>{blockProgress.miniProjectCompleted ? (es ? '✓ Superado' : '✓ Passed') : (es ? 'Pendiente' : 'Pending')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    {state === 'preparing'
                      ? (es ? 'Has cumplido los requisitos. Las lecciones se publicarán aquí.' : 'You meet the requirements. Lessons will be published here.')
                      : prerequisite
                        ? (es ? `Se desbloquea al completar el Bloque ${prerequisite.order}: ${prerequisite.title.es} (80 % de sus lecciones, o su test y su mini-proyecto).` : `Unlocks after completing Block ${prerequisite.order}: ${prerequisite.title.en} (80% of its lessons, or its quiz and mini-project).`)
                        : (es ? 'Próximamente.' : 'Coming soon.')}
                    {!blockContent && state === 'locked' && (es ? ' Contenido en preparación.' : ' Content in preparation.')}
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

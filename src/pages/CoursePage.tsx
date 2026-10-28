import React, { useState } from 'react';
import { AppTab, Navbar } from '../components/common/Navbar';
import { RoadmapTarget, RoadmapView } from '../components/roadmap/RoadmapView';
import { LessonView } from '../components/block1/LessonView';
import { QuizView } from '../components/block1/QuizView';
import { MiniProjectView } from '../components/block1/MiniProjectView';
import { useProgress } from '../hooks/useProgress';
import { Language } from '../types/language';
import { Theme } from '../types/theme';
import type { AppUser } from '../auth/AuthProvider';
import { COURSE_CONTENT, FIRST_BLOCK_ID, blockDefinition, isBlockUnlocked, nextBlockOf, xpAndLevel } from '../data/courseContent';
import { isBlockComplete, noteKey } from '../utils/progress';

interface CoursePageProps {
  user: AppUser | null;
  onSignOut?: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const CoursePage: React.FC<CoursePageProps> = ({ user, onSignOut, lang, setLang, theme, onToggleTheme }) => {
  const {
    progress,
    ready,
    syncStatus,
    blockProgress,
    markExerciseSolved,
    markLessonComplete,
    saveQuizResult,
    completeMiniProject,
    setNote,
    setActiveBlock,
  } = useProgress(user?.id ?? null);
  const [activeTab, setActiveTab] = useState<AppTab>('roadmap');
  const es = lang === 'es';

  // The last block the learner opened, if it still exists and is unlocked.
  const remembered = progress.activeBlockId;
  const activeBlockId = remembered && COURSE_CONTENT[remembered] && isBlockUnlocked(blockDefinition(remembered), progress) ? remembered : FIRST_BLOCK_ID;
  const block = COURSE_CONTENT[activeBlockId];
  const definition = blockDefinition(activeBlockId);
  const current = blockProgress(activeBlockId);
  const { xp, level } = xpAndLevel(progress);
  const next = nextBlockOf(activeBlockId);
  const blockComplete = isBlockComplete(current, block.lessons.length);

  const openBlock = (blockId: string, target: RoadmapTarget) => {
    setActiveBlock(blockId);
    setActiveTab(target);
    window.scrollTo({ top: 0 });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400" role="status">
        {es ? 'Cargando tu progreso…' : 'Loading your progress…'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        block={{ order: definition.order, title: definition.title, lessonCount: block.lessons.length, miniProjectShort: block.miniProject.shortTitle }}
        quizPassed={current.quizPassed}
        miniProjectCompleted={current.miniProjectCompleted}
        xp={xp}
        level={level}
        user={user}
        syncStatus={syncStatus}
        onSignOut={onSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="flex-1">
        {activeTab === 'roadmap' && (
          <RoadmapView progress={progress} content={COURSE_CONTENT} activeBlockId={activeBlockId} lang={lang} onOpenBlock={openBlock} />
        )}

        {activeTab === 'lessons' && (
          <LessonView
            key={block.id}
            block={block}
            progress={current}
            onMarkExerciseSolved={(slug) => markExerciseSolved(block.id, slug)}
            onCompleteLesson={(slug) => markLessonComplete(block.id, slug)}
            getNote={(slug) => progress.notes[noteKey(block.id, slug)] ?? ''}
            onNoteChange={(slug, text) => setNote(noteKey(block.id, slug), text)}
            lang={lang}
            theme={theme}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            key={block.id}
            quiz={block.quiz}
            quizXp={block.quizXp}
            blockOrder={definition.order}
            quizPassed={current.quizPassed}
            quizScore={current.quizScore}
            onSaveQuizResult={(score, max) => saveQuizResult(block.id, score, max)}
            lang={lang}
          />
        )}

        {activeTab === 'miniproject' && (
          <MiniProjectView
            key={block.id}
            block={block}
            completed={current.miniProjectCompleted}
            onCompleteMiniProject={() => completeMiniProject(block.id)}
            lang={lang}
            theme={theme}
          />
        )}
      </main>

      {next && activeTab !== 'roadmap' && (
        <footer className="w-full max-w-7xl mx-auto px-4 pb-6 md:px-6">
          <div className={`rounded-2xl border p-4 ${blockComplete ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/70'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100">
                  {es ? `Siguiente: Bloque ${next.order} · ${next.title.es}` : `Next: Block ${next.order} · ${next.title.en}`}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {blockComplete
                    ? (COURSE_CONTENT[next.id]
                      ? (es ? 'Requisitos cumplidos: ya puedes empezar el siguiente bloque.' : 'Requirements met: you can start the next block.')
                      : (es ? 'Requisitos cumplidos. El bloque se abrirá cuando se publique su contenido.' : 'Requirements met. The block will open when its content is published.'))
                    : (es
                      ? `Completa ${Math.ceil(block.lessons.length * 0.8)} de ${block.lessons.length} lecciones, o aprueba el test y el mini-proyecto.`
                      : `Complete ${Math.ceil(block.lessons.length * 0.8)} of ${block.lessons.length} lessons, or pass both the quiz and the mini-project.`)}
                </p>
              </div>
              {blockComplete && COURSE_CONTENT[next.id] ? (
                <button type="button" onClick={() => openBlock(next.id, 'lessons')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                  {es ? `Empezar Bloque ${next.order} ➔` : `Start Block ${next.order} ➔`}
                </button>
              ) : (
                <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${blockComplete ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-950 text-slate-400'}`}>
                  {blockComplete ? (es ? '✓ DESBLOQUEADO' : '✓ UNLOCKED') : (es ? '🔒 BLOQUEADO' : '🔒 LOCKED')}
                </span>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

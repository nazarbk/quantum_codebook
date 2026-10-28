import React, { useEffect, useState } from 'react';
import { AppTab, Navbar } from '../components/common/Navbar';
import { RoadmapView } from '../components/roadmap/RoadmapView';
import { LessonView } from '../components/block1/LessonView';
import { QuizView } from '../components/block1/QuizView';
import { MiniProjectView } from '../components/block1/MiniProjectView';
import { useProgress } from '../hooks/useProgress';
import { Language } from '../types/language';
import { LESSONS_BLOCK_1 } from '../data/block1Data';
import { Theme } from '../types/theme';

export const Block1Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('lessons');
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('quantum_codebook_lang');
      if (saved === 'es' || saved === 'en') return saved;
    } catch { /* Use the default if storage is unavailable. */ }
    return 'es';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('quantum_codebook_lang', lang); } catch { /* Language remains active for this session. */ }
  }, [lang]);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('quantum_codebook_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Use the default if storage is unavailable. */ }
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('quantum_codebook_theme', theme); } catch { /* Theme remains active for this session. */ }
  }, [theme]);

  const {
    progress,
    markExerciseSolved,
    markLessonComplete,
    saveQuizResult,
    completeMiniProject,
    canUnlockNextBlock,
  } = useProgress();
  const block2Unlocked = canUnlockNextBlock(LESSONS_BLOCK_1.length);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        progress={progress}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
      />

      <main className="flex-1">
        {activeTab === 'roadmap' && (
          <RoadmapView
            progress={progress}
            block2Unlocked={block2Unlocked}
            lang={lang}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'lessons' && (
          <LessonView
            completedLessons={progress.completedLessons}
            solvedExercises={progress.solvedExercises}
            onMarkExerciseSolved={markExerciseSolved}
            onCompleteLesson={markLessonComplete}
            lang={lang}
            theme={theme}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            quizPassed={progress.quizPassed}
            quizScore={progress.quizScore}
            onSaveQuizResult={saveQuizResult}
            lang={lang}
          />
        )}

        {activeTab === 'miniproject' && (
          <MiniProjectView
            completed={progress.miniProjectCompleted}
            onCompleteMiniProject={completeMiniProject}
            lang={lang}
            theme={theme}
          />
        )}
      </main>
      <footer className="w-full max-w-7xl mx-auto px-4 pb-6 md:px-6">
        <div className={`rounded-2xl border p-4 ${block2Unlocked ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/70'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {lang === 'es' ? 'Siguiente: Bloque 2 · Entrelazamiento cuántico' : 'Next: Block 2 · Quantum entanglement'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {block2Unlocked
                  ? (lang === 'es' ? 'Requisitos de Bloque 1 cumplidos. El módulo se habilitará cuando se incorpore su contenido.' : 'Block 1 requirements met. The module will open when its content is added.')
                  : (lang === 'es' ? `Completa ${Math.ceil(LESSONS_BLOCK_1.length * 0.8)} de ${LESSONS_BLOCK_1.length} lecciones, o aprueba el test y el mini-proyecto.` : `Complete ${Math.ceil(LESSONS_BLOCK_1.length * 0.8)} of ${LESSONS_BLOCK_1.length} lessons, or pass both the quiz and mini-project.`)}
              </p>
            </div>
            <span className={`rounded-lg px-3 py-1.5 text-xs font-bold ${block2Unlocked ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-950 text-slate-400'}`}>
              {block2Unlocked ? (lang === 'es' ? '✓ DESBLOQUEADO' : '✓ UNLOCKED') : (lang === 'es' ? '🔒 BLOQUEADO' : '🔒 LOCKED')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

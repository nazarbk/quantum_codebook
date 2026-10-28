import { useState, useEffect } from 'react';
import { UserProgress } from '../types/user';

const STORAGE_KEY = 'quantum_codebook_progress_v2';

const initialProgress: UserProgress = {
  completedLessons: [],
  solvedExercises: [],
  quizPassed: false,
  quizScore: 0,
  miniProjectCompleted: false,
  totalXp: 0,
  level: 1,
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialProgress;
      const parsed = JSON.parse(saved) as Partial<UserProgress>;
      const completedLessons = Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [];
      const legacyQuizResult = Boolean(parsed.quizPassed) && Number(parsed.quizScore) <= 2;
      return {
        ...initialProgress,
        ...parsed,
        completedLessons,
        // Older builds marked an exercise solved after any successful run and
        // let a single correct answer pass a two-question quiz. Keep earned
        // lesson completions, but require fresh evidence for those old checks.
        solvedExercises: Array.isArray(parsed.solvedExercises)
          ? parsed.solvedExercises.filter((slug) => !legacyQuizResult || completedLessons.includes(slug))
          : [],
        quizPassed: legacyQuizResult ? false : Boolean(parsed.quizPassed),
        quizScore: legacyQuizResult ? 0 : Number.isFinite(parsed.quizScore) ? parsed.quizScore! : 0,
        totalXp: Number.isFinite(parsed.totalXp) ? parsed.totalXp! : 0,
        level: Number.isFinite(parsed.level) ? parsed.level! : 1,
      };
    } catch {
      return initialProgress;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Progress remains available in memory when storage is disabled or full.
    }
  }, [progress]);

  const markExerciseSolved = (slug: string) => {
    setProgress((prev) => ({
      ...prev,
      solvedExercises: prev.solvedExercises.includes(slug) ? prev.solvedExercises : [...prev.solvedExercises, slug]
    }));
  };

  const markLessonComplete = (slug: string, xpReward: number) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(slug)) return prev;
      const completedLessons = [...prev.completedLessons, slug];
      const totalXp = prev.totalXp + xpReward;
      return { ...prev, completedLessons, totalXp, level: Math.floor(totalXp / 150) + 1 };
    });
  };

  const saveQuizResult = (score: number, maxScore: number, xpReward: number) => {
    const passed = maxScore > 0 && score / maxScore >= 0.7;
    setProgress((prev) => {
      const totalXp = prev.totalXp + (passed && !prev.quizPassed ? xpReward : 0);
      return {
        ...prev,
        totalXp,
        quizPassed: prev.quizPassed || passed,
        quizScore: Math.max(prev.quizScore, score),
        level: Math.floor(totalXp / 150) + 1,
      };
    });
  };

  const completeMiniProject = (xpReward: number) => {
    setProgress((prev) => {
      if (prev.miniProjectCompleted) return prev;
      const totalXp = prev.totalXp + xpReward;
      return { ...prev, miniProjectCompleted: true, totalXp, level: Math.floor(totalXp / 150) + 1 };
    });
  };

  // Helper: check if Block 1 prerequisites are met for unlocking Block 2
  const canUnlockNextBlock = (totalLessonsInBlock: number = 6) => {
    const completionRate = totalLessonsInBlock > 0
      ? Math.min(progress.completedLessons.length, totalLessonsInBlock) / totalLessonsInBlock
      : 0;
    return completionRate >= 0.8 || (progress.quizPassed && progress.miniProjectCompleted);
  };

  return {
    progress,
    markExerciseSolved,
    markLessonComplete,
    saveQuizResult,
    completeMiniProject,
    canUnlockNextBlock,
  };
}

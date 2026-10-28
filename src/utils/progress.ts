/*
 * Learner progress (version 3): one record per block, plus notes. Pure functions only, so
 * the same logic serves the browser cache, the Supabase account sync and the tests.
 *
 * XP and level are derived from what was completed (never stored), so merging progress
 * from two devices can never double-count rewards.
 */

export interface BlockProgress {
  completedLessons: string[];
  /** Lessons whose code exercise was verified. */
  solvedExercises: string[];
  quizPassed: boolean;
  /** Best quiz score. */
  quizScore: number;
  miniProjectCompleted: boolean;
}

export interface CourseProgress {
  version: 3;
  blocks: Record<string, BlockProgress>;
  /** Personal notes keyed by "<blockId>/<lessonSlug>". */
  notes: Record<string, string>;
  /** Last block the learner opened. */
  activeBlockId?: string;
  /** ISO date of the last change (used to resolve note conflicts between devices). */
  updatedAt: string;
}

/** What XP needs to know about the course content. */
export interface XpSource {
  id: string;
  lessons: { slug: string; xpReward: number }[];
  quizXp: number;
  miniProject: { xpReward: number };
}

export const XP_PER_LEVEL = 150;
/** A block is complete with 80 % of its lessons, or with both the quiz and the mini-project. */
export const LESSON_COMPLETION_RATIO = 0.8;

export const emptyBlockProgress = (): BlockProgress => ({
  completedLessons: [],
  solvedExercises: [],
  quizPassed: false,
  quizScore: 0,
  miniProjectCompleted: false,
});

export const emptyProgress = (): CourseProgress => ({ version: 3, blocks: {}, notes: {}, updatedAt: new Date(0).toISOString() });

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);
const unique = (values: string[]) => [...new Set(values)];

function normalizeBlock(raw: unknown): BlockProgress {
  const value = (raw ?? {}) as Partial<Record<keyof BlockProgress, unknown>>;
  return {
    completedLessons: unique(strings(value.completedLessons)),
    solvedExercises: unique(strings(value.solvedExercises)),
    quizPassed: value.quizPassed === true,
    quizScore: Number.isFinite(value.quizScore) ? Math.max(0, Number(value.quizScore)) : 0,
    miniProjectCompleted: value.miniProjectCompleted === true,
  };
}

/** Accepts anything read from storage (v3, the old v2 format, or garbage) and returns valid v3 progress. */
export function normalizeProgress(raw: unknown): CourseProgress {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  const value = raw as Record<string, unknown>;
  if (value.version !== 3) return migrateV2(value);
  const blocks: Record<string, BlockProgress> = {};
  for (const [id, block] of Object.entries((value.blocks ?? {}) as Record<string, unknown>)) blocks[id] = normalizeBlock(block);
  const notes: Record<string, string> = {};
  for (const [key, note] of Object.entries((value.notes ?? {}) as Record<string, unknown>)) {
    if (typeof note === 'string' && note.trim()) notes[key] = note;
  }
  return {
    version: 3,
    blocks,
    notes,
    activeBlockId: typeof value.activeBlockId === 'string' ? value.activeBlockId : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date(0).toISOString(),
  };
}

/**
 * v2 stored a single block. Older builds also marked exercises solved after any run and let one
 * right answer pass a two-question quiz; those results are discarded, earned lessons are kept.
 */
export function migrateV2(raw: Record<string, unknown>): CourseProgress {
  const completedLessons = strings(raw.completedLessons);
  const legacyQuiz = raw.quizPassed === true && Number(raw.quizScore) <= 2;
  const block = normalizeBlock({
    completedLessons,
    solvedExercises: strings(raw.solvedExercises).filter((slug) => !legacyQuiz || completedLessons.includes(slug)),
    quizPassed: legacyQuiz ? false : raw.quizPassed === true,
    quizScore: legacyQuiz ? 0 : raw.quizScore,
    miniProjectCompleted: raw.miniProjectCompleted === true,
  });
  const progress = emptyProgress();
  const hasData = block.completedLessons.length || block.solvedExercises.length || block.quizPassed || block.miniProjectCompleted;
  if (hasData) progress.blocks['block-1'] = block;
  return progress;
}

/** Combines two copies (e.g. this browser and the account): nothing earned on either is lost. */
export function mergeProgress(a: CourseProgress, b: CourseProgress): CourseProgress {
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const older = newer === a ? b : a;
  const blocks: Record<string, BlockProgress> = {};
  for (const id of new Set([...Object.keys(a.blocks), ...Object.keys(b.blocks)])) {
    const x = a.blocks[id] ?? emptyBlockProgress();
    const y = b.blocks[id] ?? emptyBlockProgress();
    blocks[id] = {
      // Sorted so that merging A into B and B into A give exactly the same result.
      completedLessons: unique([...x.completedLessons, ...y.completedLessons]).sort(),
      solvedExercises: unique([...x.solvedExercises, ...y.solvedExercises]).sort(),
      quizPassed: x.quizPassed || y.quizPassed,
      quizScore: Math.max(x.quizScore, y.quizScore),
      miniProjectCompleted: x.miniProjectCompleted || y.miniProjectCompleted,
    };
  }
  // Notes are text: for a note edited on both sides the most recently updated copy wins.
  const notes = { ...older.notes, ...newer.notes };
  return { version: 3, blocks, notes, activeBlockId: newer.activeBlockId ?? older.activeBlockId, updatedAt: newer.updatedAt };
}

export function blockProgressOf(progress: CourseProgress, blockId: string): BlockProgress {
  return progress.blocks[blockId] ?? emptyBlockProgress();
}

export function computeXp(progress: CourseProgress, content: XpSource[]): number {
  return content.reduce((total, block) => {
    const done = blockProgressOf(progress, block.id);
    const lessons = block.lessons.filter((lesson) => done.completedLessons.includes(lesson.slug)).reduce((sum, lesson) => sum + lesson.xpReward, 0);
    return total + lessons + (done.quizPassed ? block.quizXp : 0) + (done.miniProjectCompleted ? block.miniProject.xpReward : 0);
  }, 0);
}

export const levelForXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

export function isBlockComplete(block: BlockProgress, lessonCount: number): boolean {
  const ratio = lessonCount > 0 ? Math.min(block.completedLessons.length, lessonCount) / lessonCount : 0;
  return ratio >= LESSON_COMPLETION_RATIO || (block.quizPassed && block.miniProjectCompleted);
}

/** Milestones of a block: every lesson, the quiz and the mini-project. */
export function blockMilestones(block: BlockProgress, lessonSlugs: string[]) {
  const lessonsDone = lessonSlugs.filter((slug) => block.completedLessons.includes(slug)).length;
  const total = lessonSlugs.length + 2;
  const done = lessonsDone + Number(block.quizPassed) + Number(block.miniProjectCompleted);
  return { lessonsDone, done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export const noteKey = (blockId: string, lessonSlug: string) => `${blockId}/${lessonSlug}`;

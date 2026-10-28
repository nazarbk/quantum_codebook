import type { BlockContent } from '../../types/block';
import { LESSONS_BLOCK_1, MINI_PROJECT_BLOCK_1, QUIZ_BLOCK_1 } from '../block1Data';
import { PREPARED_HINTS } from '../preparedHints';
import { TARGET_BLOCH, TARGET_CIRCUITS, checkBiasedQrng, checkExercise } from '../../utils/exerciseChecks';

/** Block 1 · Qubit fundamentals, in the generic block format. */
export const BLOCK_1: BlockContent = {
  id: 'block-1',
  lessons: LESSONS_BLOCK_1,
  quiz: QUIZ_BLOCK_1,
  quizXp: 200,
  miniProject: MINI_PROJECT_BLOCK_1,
  hints: PREPARED_HINTS,
  targets: Object.fromEntries(LESSONS_BLOCK_1.map((lesson) => [lesson.slug, {
    bloch: TARGET_BLOCH[lesson.slug],
    circuit: TARGET_CIRCUITS[lesson.slug],
  }])),
  validateExercise: (slug, { statevector, samples }) => checkExercise(slug, statevector, samples),
  validateMiniProject: ({ statevector }) => checkBiasedQrng(MINI_PROJECT_BLOCK_1.targetBiasP0 ?? 0.75, statevector),
};

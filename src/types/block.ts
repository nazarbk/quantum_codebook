import type { BlochCoordinates } from '../utils/quantumMath';
import type { CircuitOperation } from '../components/quantum/CircuitDiagram';
import type { CheckResult } from '../utils/exerciseChecks';
import type { Samples } from './worker';
import type { LocalizedHints } from './hints';

/** Code shown in the editor, one version per UI language. */
export type LocalizedCode = Record<'es' | 'en', string>;

export interface BibliographyItem {
  title: string;
  author: string;
  year: string;
  publisher: string;
  link?: string;
  note: Record<'es' | 'en', string>;
}

export interface Exercise {
  title: Record<'es' | 'en', string>;
  description: Record<'es' | 'en', string>;
  targetGoal: Record<'es' | 'en', string>;
  /** Starter code per SDK and language. ES and EN versions must have the same lines in the same order. */
  starterCode: Record<string, LocalizedCode>;
}

export interface Lesson {
  id: string;
  slug: string;
  title: Record<'es' | 'en', string>;
  subtitle: Record<'es' | 'en', string>;
  durationMinutes: number;
  xpReward: number;
  contentMarkdown: Record<'es' | 'en', string>;
  exercise: Exercise;
  bibliography: BibliographyItem[];
  /** Qubits used by the exercise (default 1). With more than one, the multi-qubit view is shown. */
  qubits?: number;
}

export interface QuizQuestion {
  id: number;
  question: Record<'es' | 'en', string>;
  options: Record<'es' | 'en', string[]>;
  correctAnswer: number;
  explanation: Record<'es' | 'en', string>;
}

export interface MiniProject {
  id: string;
  title: Record<'es' | 'en', string>;
  description: Record<'es' | 'en', string>;
  xpReward: number;
  /** Block 1 only: requested P(|0⟩) of the biased random number generator. */
  targetBiasP0?: number;
  /** Qubits used by the starter code (default 1). */
  qubits?: number;
  /** Shown when a run does not meet the goal, instead of the generic message. */
  wrongResultHint?: Record<'es' | 'en', string>;
  /** Emoji shown next to the title. */
  icon?: string;
  /** Short name for the navigation tab, e.g. "QRNG". */
  shortTitle: Record<'es' | 'en', string>;
  /** Starter code per SDK and language. ES and EN versions must have the same lines in the same order. */
  starterCode: Record<string, LocalizedCode>;
}

/** What a run produced, handed to the validators. */
export interface ExerciseInput {
  statevector?: [number, number][];
  samples?: Samples;
  /** Code in the editor when it ran (some checks read parameters such as θ from it). */
  code: string;
}

/** Visual references for a lesson: Bloch target (1 qubit), target state (n qubits) and circuit. */
export interface LessonTargets {
  bloch?: BlochCoordinates;
  state?: [number, number][];
  circuit?: CircuitOperation[];
}

/** Everything a block of the course needs to be rendered by the generic course page. */
export interface BlockContent {
  /** Same id as in COURSE_BLOCKS (e.g. "block-2"). */
  id: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  /** XP for passing the quiz the first time. */
  quizXp: number;
  miniProject: MiniProject;
  hints: Record<string, LocalizedHints>;
  targets: Record<string, LessonTargets>;
  validateExercise: (slug: string, input: ExerciseInput) => CheckResult;
  validateMiniProject: (input: ExerciseInput) => CheckResult;
}

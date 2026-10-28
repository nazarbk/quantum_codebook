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
  targetBiasP0: number;
  /** Starter code per SDK and language. ES and EN versions must have the same lines in the same order. */
  starterCode: Record<string, LocalizedCode>;
}

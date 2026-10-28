import type { Language } from './language';

export type HintLevel = 1 | 2 | 3;

export interface PreparedHintCopy {
  title: string;
  guidance: string;
  nextStep: string;
}

/** Three hints per exercise, from a conceptual nudge (1) to an almost explicit step (3). */
export type LocalizedHints = Record<HintLevel, Record<Language, PreparedHintCopy>>;

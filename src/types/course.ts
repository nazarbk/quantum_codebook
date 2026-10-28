import { Language } from './language';

export type BlockContentStatus = 'available' | 'planned';

export interface CourseBlockDefinition {
  id: string;
  order: number;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  topics: Record<Language, string[]>;
  prerequisiteBlockId?: string;
  /** Difficulty shown on the roadmap, from level 0 (no prior knowledge) to advanced. */
  level: Record<Language, string>;
  lessonCount: number | null;
  contentStatus: BlockContentStatus;
}

import type { BlockContent } from '../types/block';
import type { CourseBlockDefinition } from '../types/course';
import { COURSE_BLOCKS } from './courseBlocks';
import { BLOCK_1 } from './blocks/block1';
import { BLOCK_2 } from './blocks/block2';
import { CourseProgress, blockProgressOf, computeXp, isBlockComplete, levelForXp } from '../utils/progress';

/** Blocks that already have lessons, by id. Blocks without an entry are shown as "in preparation". */
export const COURSE_CONTENT: Record<string, BlockContent> = {
  [BLOCK_1.id]: BLOCK_1,
  [BLOCK_2.id]: BLOCK_2,
};

export const FIRST_BLOCK_ID = COURSE_BLOCKS[0].id;

export const blockDefinition = (blockId: string): CourseBlockDefinition =>
  COURSE_BLOCKS.find((block) => block.id === blockId) ?? COURSE_BLOCKS[0];

/** A block opens when it has no prerequisite or its prerequisite block is complete. */
export function isBlockUnlocked(block: CourseBlockDefinition, progress: CourseProgress): boolean {
  if (!block.prerequisiteBlockId) return true;
  const prerequisite = COURSE_CONTENT[block.prerequisiteBlockId];
  if (!prerequisite) return false;
  return isBlockComplete(blockProgressOf(progress, prerequisite.id), prerequisite.lessons.length);
}

/** The block after `blockId` in the roadmap, if any. */
export const nextBlockOf = (blockId: string) => {
  const index = COURSE_BLOCKS.findIndex((block) => block.id === blockId);
  return index >= 0 ? COURSE_BLOCKS[index + 1] : undefined;
};

export function xpAndLevel(progress: CourseProgress) {
  const xp = computeXp(progress, Object.values(COURSE_CONTENT));
  return { xp, level: levelForXp(xp) };
}

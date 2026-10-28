import { COURSE_CONTENT } from '../src/data/courseContent';

// Starter code (Spanish version) of every exercise and mini-project, keyed by slug.
const out: Record<string, string> = {};
for (const block of Object.values(COURSE_CONTENT)) {
  for (const lesson of block.lessons) out[lesson.slug] = lesson.exercise.starterCode.pennylane.es;
  out[block.id === 'block-1' ? '__miniproject__' : `__miniproject_${block.id}__`] = block.miniProject.starterCode.pennylane.es;
}
console.log(JSON.stringify(out));

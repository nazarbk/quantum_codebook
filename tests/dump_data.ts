import { LESSONS_BLOCK_1, MINI_PROJECT_BLOCK_1 } from '../src/data/block1Data';
const out: Record<string,string> = {};
for (const l of LESSONS_BLOCK_1) out[l.slug] = l.exercise.starterCode.pennylane.es;
out['__miniproject__'] = MINI_PROJECT_BLOCK_1.starterCode.pennylane.es;
console.log(JSON.stringify(out));

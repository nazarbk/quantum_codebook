// Runs the whole test suite with one command (works on Windows, macOS, Linux and CI):
//   npm test
// Steps: dump starter code -> run exercises with the numpy mini-simulator -> unit tests.
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const TSX = process.env.TSX ?? 'npx --yes tsx@4.19.2';
fs.mkdirSync('tests/out', { recursive: true });

const run = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'inherit'] }).toString();
fs.writeFileSync('tests/out/starters.json', run(`${TSX} tests/dump_data.ts`));

const python = ['python3', 'python', 'py'].find((bin) => spawnSync(bin, ['-c', 'import numpy'], { stdio: 'ignore' }).status === 0);
if (!python) {
  console.error('✖ Hace falta Python 3 con numpy (pip install numpy).');
  process.exit(1);
}
fs.writeFileSync('tests/out/runs.json', run(`${python} tests/run_exercises.py tests/out/starters.json tests/fake_pennylane`));

const result = spawnSync(`${TSX} --test tests/unit.test.ts`, { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);

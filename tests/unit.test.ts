import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readPennyLaneCircuit, compareCircuit, evaluateExpression, formatAngle, rotationId } from '../src/utils/pennylaneCircuit';
import { translateStarterCode } from '../src/utils/localizedCode';
import { shuffledIndices } from '../src/utils/shuffle';
import { stateToBlochCoordinates, reducedBlochVector, blochLength, probabilities, qubitCount, basisLabel } from '../src/utils/quantumMath';
import { matchesState, isValidStateVector } from '../src/utils/exerciseChecks';
import { layoutColumns } from '../src/utils/circuitLayout';
import { LESSONS_BLOCK_1, QUIZ_BLOCK_1, MINI_PROJECT_BLOCK_1 } from '../src/data/block1Data';
import { PREPARED_HINTS } from '../src/data/preparedHints';
import { COURSE_BLOCKS } from '../src/data/courseBlocks';
import { checkExercise, checkBiasedQrng, fidelity, zeroFrequency, TARGET_BLOCH, TARGET_CIRCUITS } from '../src/utils/exerciseChecks';

const runs = JSON.parse(fs.readFileSync(new URL('./out/runs.json', import.meta.url), 'utf8'));
const r2 = Math.SQRT1_2;
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('quantumMath.stateToBlochCoordinates', () => {
  const cases: [string, [[number, number], [number, number]], [number, number, number]][] = [
    ['|0>', [[1, 0], [0, 0]], [0, 0, 1]],
    ['|1>', [[0, 0], [1, 0]], [0, 0, -1]],
    ['|+>', [[r2, 0], [r2, 0]], [1, 0, 0]],
    ['|->', [[r2, 0], [-r2, 0]], [-1, 0, 0]],
    ['|+i>', [[r2, 0], [0, r2]], [0, 1, 0]],
    ['|-i>', [[r2, 0], [0, -r2]], [0, -1, 0]],
    ['RY(pi/3)|0>', [[Math.cos(Math.PI / 6), 0], [Math.sin(Math.PI / 6), 0]], [Math.sqrt(3) / 2, 0, 0.5]],
    ['global phase i|0>', [[0, 1], [0, 0]], [0, 0, 1]],
  ];
  for (const [name, st, [x, y, z]] of cases) test(name, () => {
    const c = stateToBlochCoordinates(st);
    assert.ok(near(c.x, x) && near(c.y, y) && near(c.z, z), JSON.stringify(c));
  });
  test('TARGET_BLOCH matches the reference solution of every lesson', () => {
    for (const l of LESSONS_BLOCK_1) {
      if (l.slug === 'medida-y-colapso') continue; // sampling: no `state` variable
      const sv = runs[l.slug].solution.statevector;
      const c = stateToBlochCoordinates([sv[0], sv[1]]);
      const t = TARGET_BLOCH[l.slug];
      assert.ok(Math.hypot(c.x - t.x, c.y - t.y, c.z - t.z) < 1e-6, `${l.slug}: ${JSON.stringify(c)} vs ${JSON.stringify(t)}`);
    }
  });
});

describe('pennylaneCircuit.readPennyLaneCircuit', () => {
  test('detects basic gates in order', () => {
    const ops = readPennyLaneCircuit('qml.PauliX(wires=0)\nqml.Hadamard(wires=0)\nreturn qml.sample(qml.PauliZ(0))');
    assert.deepEqual(ops.map((o) => o.id), ['X', 'H', 'M']);
  });
  test('ignores commented-out gates', () => {
    assert.equal(readPennyLaneCircuit('# qml.Hadamard(wires=0)').length, 0);
  });
  test('resolves RY parameter through a variable', () => {
    const op = readPennyLaneCircuit('theta = np.pi / 3\nqml.RY(theta, wires=0)')[0];
    assert.equal(op.id, rotationId('RY', Math.PI / 3)); assert.equal(op.label, 'Rᵧ(π/3)');
  });
  test('reference solution of every lesson matches TARGET_CIRCUITS', () => {
    for (const l of LESSONS_BLOCK_1) {
      const p = compareCircuit(readPennyLaneCircuit(runs[l.slug].solution_code), TARGET_CIRCUITS[l.slug]);
      assert.ok(p.isComplete, `${l.slug}: ${JSON.stringify(p)}`);
    }
  });
  const wrap = (b: string) => `import pennylane as qml\nimport numpy as np\ntheta = np.pi / 3\ndev = qml.device("default.qubit", wires=2)\n\n@qml.qnode(dev)\ndef circuit():\n${b}\n\nstate = circuit()\nprint("qml.Hadamard(wires=0) dentro de un string")\n`;
  const ops = (b: string) => readPennyLaneCircuit(wrap(b)).map((o) => `${o.label}@${o.wire}`);
  test('forma corta qml.H(0) (la que usa hoy la documentación de PennyLane)', () =>
    assert.deepEqual(ops('    qml.PauliX(wires=0)\n    qml.H(0)\n    return qml.state()'), ['X@0', 'H@0']));
  test('qml.X / qml.Y / qml.Z / qml.T y cable posicional', () =>
    assert.deepEqual(ops('    qml.X(1)\n    qml.Y(0)\n    qml.Z(wires=1)\n    qml.T(0)\n    return qml.state()'), ['X@1', 'Y@0', 'Z@1', 'T@0']));
  test('cable posicional qml.Hadamard(1) va al qubit 1', () => assert.equal(readPennyLaneCircuit('qml.Hadamard(1)')[0].wire, 1));
  test('wires=[0] en forma de lista', () => assert.deepEqual(ops('    qml.Hadamard(wires=[1])\n    return qml.state()'), ['H@1']));
  test('dos puertas en la misma línea', () => assert.equal(readPennyLaneCircuit('qml.PauliX(wires=0); qml.Hadamard(wires=0)').length, 2));
  test('puerta partida en varias líneas', () => assert.deepEqual(ops('    qml.Hadamard(\n        wires=0\n    )\n    return qml.state()'), ['H@0']));
  test('RX/RZ con ángulos numéricos y negativos', () => assert.deepEqual(ops('    qml.RX(0.5, wires=0)\n    qml.RZ(-np.pi/2, wires=0)\n    return qml.state()'), ['Rₓ(0.50)@0', 'Rz(−π/2)@0']));
  test('adjoint: S† y T†', () => assert.deepEqual(ops('    qml.adjoint(qml.S(wires=0))\n    qml.adjoint(qml.T)(wires=0)\n    return qml.state()'), ['S†@0', 'T†@0']));
  test('la medida no cuenta el observable PauliZ como puerta', () => assert.deepEqual(ops('    qml.H(0)\n    return qml.sample(qml.PauliZ(0))'), ['H@0', 'M@0']));
  test('ignora puertas en comentarios, en strings y tras el return', () => assert.deepEqual(ops('    # qml.X(0)\n    qml.Z(0)\n    return qml.state()\n    qml.Y(0)'), ['Z@0']));
  test('puertas desconocidas con wires= también se muestran', () => assert.deepEqual(ops('    qml.Toffoli(wires=[0, 1, 2])\n    return qml.state()'), ['Toffo…@0']));
  test('ángulo equivalente 2*arccos(sqrt(0.75)) coincide con el objetivo Rᵧ(π/3)', () => {
    const p = compareCircuit(readPennyLaneCircuit(runs['puertas-rotacion-fase'].variant_code), TARGET_CIRCUITS['puertas-rotacion-fase']);
    assert.ok(p.isComplete, JSON.stringify(p));
  });
  test('evaluador: expresiones y variables', () => {
    assert.ok(Math.abs(evaluateExpression('np.pi/3')! - Math.PI / 3) < 1e-12);
    assert.ok(Math.abs(evaluateExpression('2*np.arcsin(np.sqrt(0.25))')! - Math.PI / 3) < 1e-12);
    assert.equal(evaluateExpression('2**3'), 8);
    assert.equal(evaluateExpression('a', new Map([['a', 'b * 2'], ['b', '1.5']])), 3);
    assert.equal(evaluateExpression('import_os()'), null);
    assert.equal(evaluateExpression('a', new Map([['a', 'a']])), null);
  });
  test('formatAngle', () => { assert.equal(formatAngle(Math.PI / 3), 'π/3'); assert.equal(formatAngle(-2 * Math.PI / 3), '−2π/3'); assert.equal(formatAngle(0.5), '0.50'); });
});

describe('pennylaneCircuit.compareCircuit', () => {
  const H = { id: 'H', label: 'H', wire: 0 }, X = { id: 'X', label: 'X', wire: 0 };
  test('complete', () => assert.ok(compareCircuit([X, H], [X, H]).isComplete));
  test('order issue', () => { const p = compareCircuit([H, X], [X, H]); assert.ok(p.hasOrderIssue && !p.isComplete); });
  test('missing', () => assert.deepEqual(compareCircuit([X], [X, H]).missing, [H]));
  test('extra', () => assert.deepEqual(compareCircuit([X, H, H], [X, H]).extra, [H]));
  test('empty target with empty circuit is complete', () => assert.ok(compareCircuit([], []).isComplete));
});

describe('Validación de ejercicios (checkExercise) con salida simulada', () => {
  const check = (slug: string, run: any) => checkExercise(slug, run.statevector ?? undefined, run.samples ?? undefined).passed;
  for (const l of LESSONS_BLOCK_1) {
    test(`${l.slug}: el código inicial NO aprueba`, () => {
      assert.equal(runs[l.slug].starter.error, null);
      assert.equal(check(l.slug, runs[l.slug].starter), false);
    });
    test(`${l.slug}: la solución de referencia SÍ aprueba`, () => {
      assert.equal(runs[l.slug].solution.error, null);
      assert.equal(check(l.slug, runs[l.slug].solution), true, runs[l.slug].solution.stdout);
    });
    test(`${l.slug}: un simple print() con el valor esperado NO aprueba`, () =>
      assert.equal(check(l.slug, runs[l.slug].cheat), false, runs[l.slug].cheat.stdout));
  }
  test('puertas-monoqubit-1: el estado |-i⟩ (incorrecto) NO aprueba como |−⟩', () =>
    assert.equal(check('puertas-monoqubit-1', runs['puertas-monoqubit-1'].variant), false));
  test('puertas-rotacion-fase: un ángulo equivalente (2·arccos√0.75) SÍ aprueba', () =>
    assert.equal(check('puertas-rotacion-fase', runs['puertas-rotacion-fase'].variant), true));
  test('la fase global no afecta: -|0⟩ aprueba la lección 1', () =>
    assert.ok(checkExercise('bit-vs-qubit', [[-1, 0], [0, 0]]).passed));
  test('un vector sin normalizar se rechaza', () =>
    assert.deepEqual(checkExercise('bit-vs-qubit', [[1, 0], [1, 0]]), { passed: false, reason: 'invalid-state' }));
  test('sin variable state -> motivo missing-state', () =>
    assert.deepEqual(checkExercise('esfera-de-bloch', undefined), { passed: false, reason: 'missing-state' }));
  test('sin variable samples -> motivo missing-samples', () =>
    assert.deepEqual(checkExercise('medida-y-colapso', undefined, undefined), { passed: false, reason: 'missing-samples' }));
  test('muestras en bits 0/1 también se aceptan', () =>
    assert.ok(checkExercise('medida-y-colapso', undefined, Array.from({ length: 1000 }, (_, i) => i % 2)).passed));
  test('fidelity(|+>,|+i>) = 0.5', () => assert.ok(Math.abs(fidelity([[r2, 0], [r2, 0]], [[r2, 0], [0, r2]]) - 0.5) < 1e-12));
  test('zeroFrequency rechaza valores no válidos', () => assert.equal(zeroFrequency([1, 2, 3]), null));
});

describe('Código de los ejercicios en ES/EN', () => {
  const all = [...LESSONS_BLOCK_1.map((l) => [l.slug, l.exercise.starterCode.pennylane] as const), ['__miniproject__', MINI_PROJECT_BLOCK_1.starterCode.pennylane] as const];
  const spanish = /\b(EJERCICIO|RETO|Estado|Vector de|Conteo|Muestras|Probabilidad|corrige|aplica|añade|invierte|elige|prepara|configura|verificado|creado|completada)\b/;
  for (const [slug, code] of all) {
    test(`${slug}: mismas líneas en ES y EN; sólo cambian comentarios y textos`, () => {
      const es = code.es.split('\n'), en = code.en.split('\n');
      assert.equal(es.length, en.length);
      es.forEach((line, i) => { if (line !== en[i]) assert.match(line.trim(), /^(#|print\(|_result\s*=)/, `línea ${i + 1}: ${line}`); });
    });
    test(`${slug}: la versión EN no tiene restos en castellano`, () => assert.doesNotMatch(code.en, spanish));
    test(`${slug}: cambiar de idioma sin editar da exactamente el código del otro idioma`, () => {
      assert.equal(translateStarterCode(code.es, code.es, code.en), code.en);
      assert.equal(translateStarterCode(code.en, code.en, code.es), code.es);
    });
  }
  test('cambiar de idioma conserva las líneas que escribió el alumno', () => {
    const { es, en } = LESSONS_BLOCK_1[0].exercise.starterCode.pennylane;
    const edited = es.replace('    qml.PauliX(wires=0)', '    qml.H(0)  # mi cambio');
    const result = translateStarterCode(edited, es, en);
    assert.match(result, /qml\.H\(0\)  # mi cambio/);
    assert.match(result, /# TODO: fix this gate/);
    assert.doesNotMatch(result, /corrige/);
  });
  test('respeta saltos de línea de Windows (\\r\\n)', () => {
    const { es, en } = LESSONS_BLOCK_1[0].exercise.starterCode.pennylane;
    const edited = es.replace(/\n/g, '\r\n').replace('qml.PauliX(wires=0)', 'qml.H(0)');
    const result = translateStarterCode(edited, es, en);
    assert.match(result, /# TODO: fix this gate/); assert.ok(result.includes('\r\n'));
  });
});

describe('Integridad de contenidos', () => {
  test('6 lecciones con slugs únicos y coherentes con COURSE_BLOCKS', () => {
    assert.equal(new Set(LESSONS_BLOCK_1.map((l) => l.slug)).size, LESSONS_BLOCK_1.length);
    assert.equal(COURSE_BLOCKS[0].lessonCount, LESSONS_BLOCK_1.length);
  });
  test('cada lección tiene objetivo Bloch, circuito objetivo y pistas', () => {
    for (const l of LESSONS_BLOCK_1) {
      assert.ok(TARGET_BLOCH[l.slug], l.slug); assert.ok(TARGET_CIRCUITS[l.slug], l.slug); assert.ok(PREPARED_HINTS[l.slug], l.slug);
      for (const lvl of [1, 2, 3] as const) assert.ok(PREPARED_HINTS[l.slug][lvl]?.es && PREPARED_HINTS[l.slug][lvl]?.en, `${l.slug} hint ${lvl}`);
    }
  });
  test('teoría ES/EN con el mismo número de secciones ###', () => {
    for (const l of LESSONS_BLOCK_1) {
      const n = (s: string) => (s.match(/^###\s/gm) || []).length;
      assert.equal(n(l.contentMarkdown.es), n(l.contentMarkdown.en), l.slug);
    }
  });
  test('quiz: ES/EN mismas opciones, respuesta en rango, ids únicos', () => {
    assert.equal(new Set(QUIZ_BLOCK_1.map((q) => q.id)).size, QUIZ_BLOCK_1.length);
    for (const q of QUIZ_BLOCK_1) {
      assert.equal(q.options.es.length, q.options.en.length, `q${q.id}`);
      assert.ok(q.correctAnswer >= 0 && q.correctAnswer < q.options.es.length, `q${q.id}`);
    }
  });
  test('quiz: las opciones se barajan y la correcta cae en todas las posiciones', () => {
    let seed = 42; const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const positions = new Set<number>();
    for (let attempt = 0; attempt < 50; attempt++) for (const q of QUIZ_BLOCK_1) {
      const order = shuffledIndices(q.options.es.length, random);
      assert.deepEqual([...order].sort(), q.options.es.map((_, i) => i));
      positions.add(order.indexOf(q.correctAnswer));
    }
    assert.deepEqual([...positions].sort(), [0, 1, 2, 3]);
  });

  test('enlaces de bibliografía usan https', () => {
    for (const l of LESSONS_BLOCK_1) for (const b of l.bibliography) if (b.link) assert.match(b.link, /^https:\/\//, `${l.slug}: ${b.link}`);
  });
  test('mini-proyecto: la solución de referencia imprime P(|0>) ≈ 0.75', () =>
    assert.match(runs['__miniproject__'].solution.stdout, /P\(\|0>\):\s*0\.75/));
  test('mini-proyecto: la solución SÍ aprueba y el código inicial NO', () => {
    assert.ok(checkBiasedQrng(MINI_PROJECT_BLOCK_1.targetBiasP0, runs['__miniproject__'].solution.statevector).passed);
    assert.ok(!checkBiasedQrng(MINI_PROJECT_BLOCK_1.targetBiasP0, runs['__miniproject__'].starter.statevector).passed);
  });
  test('mini-proyecto: print("P(|0>): 0.75") ya NO aprueba', () =>
    assert.ok(!checkBiasedQrng(MINI_PROJECT_BLOCK_1.targetBiasP0, runs['__miniproject__'].cheat.statevector ?? undefined).passed));
});

describe('Motor multi-qubit (preparación del Bloque 2)', () => {
  const bell = runs['__bell__'].statevector as [number, number][];
  const product = runs['__product__'].statevector as [number, number][];
  test('el worker/simulador devuelve estados de 2 qubits (4 amplitudes)', () => {
    assert.equal(bell.length, 4); assert.equal(qubitCount(bell), 2); assert.ok(isValidStateVector(bell));
  });
  test('orden de PennyLane: el cable 0 es el bit más significativo', () => {
    assert.deepEqual([0, 1, 2, 3].map((i) => basisLabel(i, 2)), ['00', '01', '10', '11']);
    // H en q0 y X en q1 → |+⟩|1⟩ = (|01⟩ + |11⟩)/√2
    assert.deepEqual(probabilities(product).map((p) => Math.round(p * 100) / 100), [0, 0.5, 0, 0.5]);
  });
  test('estado de Bell: probabilidades 1/2 en |00⟩ y |11⟩', () =>
    assert.deepEqual(probabilities(bell).map((p) => Math.round(p * 100) / 100), [0.5, 0, 0, 0.5]));
  test('estado de Bell: cada qubit por separado tiene vector de Bloch de longitud 0 (entrelazado)', () => {
    for (const wire of [0, 1]) assert.ok(blochLength(reducedBlochVector(bell, wire)) < 1e-9);
  });
  test('estado producto: cada qubit conserva longitud 1 y apunta a su sitio', () => {
    const q0 = reducedBlochVector(product, 0), q1 = reducedBlochVector(product, 1);
    assert.ok(Math.abs(q0.x - 1) < 1e-9 && Math.abs(q1.z + 1) < 1e-9, JSON.stringify({ q0, q1 }));
  });
  test('reducedBlochVector coincide con stateToBlochCoordinates para 1 qubit', () => {
    const st: [number, number][] = [[r2, 0], [0, r2]];
    assert.deepEqual(reducedBlochVector(st, 0), stateToBlochCoordinates([st[0], st[1]]));
  });
  test('validación con fidelidad en 4 dimensiones (y fase global)', () => {
    assert.ok(matchesState([[r2, 0], [0, 0], [0, 0], [r2, 0]], bell));
    assert.ok(matchesState([[0, r2], [0, 0], [0, 0], [0, r2]], bell));            // i·|Φ+⟩
    assert.ok(!matchesState([[r2, 0], [0, 0], [0, 0], [-r2, 0]], bell));          // |Φ−⟩
    assert.ok(!matchesState([[r2, 0], [r2, 0]], bell));                           // tamaño distinto
  });
  test('muestras de 2 qubits: una fila de bits por disparo y siempre correlacionadas', () => {
    const rows = runs['__bell_samples__'].samples as number[][];
    assert.equal(rows.length, 1000);
    assert.ok(rows.every((row) => row.length === 2 && row[0] === row[1]));
    const zeros = rows.filter((row) => row[0] === 0).length / 1000;
    assert.ok(zeros > 0.4 && zeros < 0.6, String(zeros));
  });
  test('lector de circuitos: CNOT con control y objetivo, y medida de todos los cables', () => {
    const ops = readPennyLaneCircuit('dev = qml.device("default.qubit", wires=2)\n@qml.qnode(dev)\ndef c():\n    qml.H(0)\n    qml.CNOT(wires=[0, 1])\n    return qml.sample()');
    assert.deepEqual(ops.map((o) => [o.label, o.wire, o.wires ?? null]), [['H', 0, null], ['CNOT', 0, [0, 1]], ['M', 0, null], ['M', 1, null]]);
  });
  test('lector de circuitos: CNOT invertido y medida de un producto de observables', () => {
    const ops = readPennyLaneCircuit('qml.CNOT(wires=[1, 0])\nqml.expval(qml.PauliZ(0) @ qml.PauliZ(1))');
    assert.deepEqual(ops.map((o) => o.wires ?? o.wire), [[1, 0], 0, 1]);
  });
  test('diagrama: puertas en qubits distintos comparten columna; CNOT ocupa ambos cables', () => {
    const H0 = { id: 'H', label: 'H', wire: 0 }, X1 = { id: 'X', label: 'X', wire: 1 };
    const CN = { id: 'CNOT:0,1', label: 'CNOT', wire: 0, wires: [0, 1] as [number, number] };
    assert.deepEqual(layoutColumns([H0, X1, CN, { id: 'M', label: 'M', wire: 0 }, { id: 'M', label: 'M', wire: 1 }]), [0, 0, 1, 2, 2]);
  });
});

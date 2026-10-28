import type { BlockContent, ExerciseInput, MiniProject, QuizQuestion } from '../../types/block';
import type { LocalizedHints } from '../../types/hints';
import { LESSONS_BLOCK_2 } from './block2Lessons';
import { CheckResult, isValidStateVector, matchesState } from '../../utils/exerciseChecks';
import { BlochCoordinates, qubitCount, reducedBlochVector } from '../../utils/quantumMath';
import { readNumericVariable, rotationId } from '../../utils/pennylaneCircuit';

const R2 = Math.SQRT1_2;
type State = [number, number][];
const basis = (index: number, qubits: number): State => Array.from({ length: 2 ** qubits }, (_, i) => [i === index ? 1 : 0, 0]);

/* ------------------------------------------------------------------ targets */

const PLUS_ONE: State = [[0, 0], [R2, 0], [0, 0], [R2, 0]];          // |+⟩|1⟩
const PHI_PLUS: State = [[R2, 0], [0, 0], [0, 0], [R2, 0]];          // (|00⟩+|11⟩)/√2
const PSI_PLUS: State = [[0, 0], [R2, 0], [R2, 0], [0, 0]];          // (|01⟩+|10⟩)/√2

/** |+⟩|+⟩ ⊗ (cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩): the end state of deferred-measurement teleportation. */
function teleportedState(theta: number, phi: number): State {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const bob: State = [[c, 0], [s * Math.cos(phi), s * Math.sin(phi)]];
  return Array.from({ length: 8 }, (_, index) => {
    const [re, im] = bob[index & 1];
    return [re / 2, im / 2] as [number, number];
  });
}

const blochOf = (theta: number, phi: number): BlochCoordinates => ({
  x: Math.sin(theta) * Math.cos(phi),
  y: Math.sin(theta) * Math.sin(phi),
  z: Math.cos(theta),
});

const op = (label: string, wire: number) => ({ id: label, label, wire });
const two = (label: 'CNOT' | 'CZ', a: number, b: number) => ({ id: `${label}:${a},${b}`, label, wire: a, wires: [a, b] as [number, number] });

/* ------------------------------------------------------------------ validators */

const pass: CheckResult = { passed: true };
const fail = (reason: Extract<CheckResult, { passed: false }>['reason']): CheckResult => ({ passed: false, reason });

function checkState(target: State, { statevector }: ExerciseInput): CheckResult {
  if (!statevector) return fail('missing-state');
  if (!isValidStateVector(statevector) || statevector.length !== target.length) return fail('invalid-state');
  return matchesState(target, statevector) ? pass : fail('wrong-result');
}

/** 1000 rows of two bits, always equal, with 00 and 11 each between 40 % and 60 %. */
export function checkBellSamples({ samples }: ExerciseInput): CheckResult {
  if (!samples || samples.length === 0) return fail('missing-samples');
  const rows = samples as number[][];
  if (rows.length !== 1000 || !rows.every((row) => Array.isArray(row) && row.length === 2)) return fail('wrong-result');
  if (!rows.every(([a, b]) => (a === 0 || a === 1) && a === b)) return fail('wrong-result');
  const zeros = rows.filter(([a]) => a === 0).length / rows.length;
  return zeros >= 0.4 && zeros <= 0.6 ? pass : fail('wrong-result');
}

const distance = (a: BlochCoordinates, b: BlochCoordinates) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Teleportation (deferred measurement): q2 must carry the prepared state and q0, q1 must end
 * in |+⟩|+⟩, which rules out preparing the state directly on Bob's qubit.
 */
export function checkTeleportation(statevector: State | undefined, theta: number, phi: number): CheckResult {
  if (!statevector) return fail('missing-state');
  if (!isValidStateVector(statevector) || qubitCount(statevector) !== 3) return fail('invalid-state');
  const plusX: BlochCoordinates = { x: 1, y: 0, z: 0 };
  const aliceDone = [0, 1].every((wire) => distance(reducedBlochVector(statevector, wire), plusX) < 0.02);
  const bobOk = distance(reducedBlochVector(statevector, 2), blochOf(theta, phi)) < 0.02;
  return aliceDone && bobOk ? pass : fail('wrong-result');
}

const VALIDATORS: Record<string, (input: ExerciseInput) => CheckResult> = {
  'producto-tensorial': (input) => checkState(PLUS_ONE, input),
  cnot: (input) => checkState(basis(2, 2), input),                    // |10⟩
  'estados-bell': (input) => checkState(PSI_PLUS, input),
  'medida-parcial': checkBellSamples,
  'no-clonacion': (input) => checkState(PHI_PLUS, input),
  'codificacion-superdensa': (input) => checkState(basis(3, 2), input), // |11⟩
  teleportacion: ({ statevector }) => checkTeleportation(statevector, Math.PI / 3, 0),
};

/** Mini-project: θ and φ are read from the code and must describe a non-trivial state. */
export function checkFreeTeleportation({ statevector, code }: ExerciseInput): CheckResult {
  const theta = readNumericVariable(code, 'theta');
  const phi = readNumericVariable(code, 'phi');
  if (theta === null || phi === null) return fail('wrong-result');
  const wrappedPhi = Math.abs(Math.atan2(Math.sin(phi), Math.cos(phi)));
  if (theta < 0.2 || theta > Math.PI - 0.2 || wrappedPhi < 0.2) return fail('wrong-result');
  return checkTeleportation(statevector, theta, phi);
}

/* ------------------------------------------------------------------ hints */

const HINTS: Record<string, LocalizedHints> = {
  'producto-tensorial': {
    1: {
      es: { title: 'Cada cable por separado', guidance: 'En un estado producto cada qubit se prepara por su cuenta. El cable 0 ya está en |+⟩; falta llevar el cable 1 de |0⟩ a |1⟩.', nextStep: '¿Qué puerta de un qubit convierte |0⟩ en |1⟩?' },
      en: { title: 'Each wire on its own', guidance: 'In a product state each qubit is prepared independently. Wire 0 is already in |+⟩; wire 1 still has to go from |0⟩ to |1⟩.', nextStep: 'Which one-qubit gate turns |0⟩ into |1⟩?' },
    },
    2: {
      es: { title: 'Lee el orden |q0 q1⟩', guidance: 'Con el cable 1 en |1⟩, el segundo bit de cada ket vale 1: solo pueden aparecer |01⟩ y |11⟩. Si ves |10⟩, has cambiado el cable equivocado.', nextStep: 'Aplica la puerta al cable 1, no al 0.' },
      en: { title: 'Read the |q0 q1⟩ order', guidance: 'With wire 1 in |1⟩, the second bit of every ket is 1: only |01⟩ and |11⟩ can appear. If you see |10⟩, you changed the wrong wire.', nextStep: 'Apply the gate to wire 1, not wire 0.' },
    },
    3: {
      es: { title: 'La línea que falta', guidance: 'Añade `qml.PauliX(wires=1)` dentro del circuito, antes del `return`. El orden respecto a la Hadamard da igual: actúan en cables distintos.', nextStep: 'Ejecuta y comprueba P = 0.5 en |01⟩ y |11⟩.' },
      en: { title: 'The missing line', guidance: 'Add `qml.PauliX(wires=1)` inside the circuit, before the `return`. Its order relative to the Hadamard does not matter: they act on different wires.', nextStep: 'Run it and check P = 0.5 on |01⟩ and |11⟩.' },
    },
  },
  cnot: {
    1: {
      es: { title: 'XOR en el objetivo', guidance: 'La CNOT deja el control igual y guarda control ⊕ objetivo en el objetivo. Con a = 1 y b = 1, el objetivo debe acabar en 0.', nextStep: 'Calcula a mano 1 ⊕ 1.' },
      en: { title: 'XOR on the target', guidance: 'CNOT leaves the control unchanged and stores control ⊕ target in the target. With a = 1 and b = 1, the target must end in 0.', nextStep: 'Work out 1 ⊕ 1 by hand.' },
    },
    2: {
      es: { title: 'Control y objetivo', guidance: 'En `qml.CNOT(wires=[c, t])`, el primer cable es el control. Aquí el control es el cable 0 (a) y el objetivo el cable 1 (b).', nextStep: 'Escribe la CNOT con wires=[0, 1].' },
      en: { title: 'Control and target', guidance: 'In `qml.CNOT(wires=[c, t])` the first wire is the control. Here the control is wire 0 (a) and the target is wire 1 (b).', nextStep: 'Write the CNOT with wires=[0, 1].' },
    },
    3: {
      es: { title: 'Resultado esperado', guidance: 'Añade `qml.CNOT(wires=[0, 1])` después de las dos X. El estado pasa de |11⟩ a |10⟩.', nextStep: 'Ejecuta y comprueba que la consola muestra |10>.' },
      en: { title: 'Expected result', guidance: 'Add `qml.CNOT(wires=[0, 1])` after the two X gates. The state goes from |11⟩ to |10⟩.', nextStep: 'Run it and check that the console shows |10>.' },
    },
  },
  'estados-bell': {
    1: {
      es: { title: 'De Φ a Ψ', guidance: '|Φ⁺⟩ tiene los dos bits iguales (00 y 11) y |Ψ⁺⟩ los tiene distintos (01 y 10). Basta con invertir uno de los dos qubits.', nextStep: '¿Qué puerta invierte un bit?' },
      en: { title: 'From Φ to Ψ', guidance: '|Φ⁺⟩ has equal bits (00 and 11) and |Ψ⁺⟩ has different bits (01 and 10). Flipping one of the two qubits is enough.', nextStep: 'Which gate flips a bit?' },
    },
    2: {
      es: { title: 'Sin cambiar el signo', guidance: 'Una Z cambiaría el signo (Φ⁺ → Φ⁻), pero no los bits. Necesitas una X en uno de los cables; en el cable 1 da directamente (|01⟩ + |10⟩)/√2.', nextStep: 'Añade una X en el cable 1 después de la CNOT.' },
      en: { title: 'Without changing the sign', guidance: 'A Z would flip the sign (Φ⁺ → Φ⁻) but not the bits. You need an X on one of the wires; on wire 1 it gives (|01⟩ + |10⟩)/√2 directly.', nextStep: 'Add an X on wire 1 after the CNOT.' },
    },
    3: {
      es: { title: 'La línea que falta', guidance: 'Escribe `qml.PauliX(wires=1)` antes del `return`. Las amplitudes de |01⟩ y |10⟩ deben valer 0.7071.', nextStep: 'Observa también que la flecha de cada qubit sigue en el centro de su esfera.' },
      en: { title: 'The missing line', guidance: 'Write `qml.PauliX(wires=1)` before the `return`. The amplitudes of |01⟩ and |10⟩ must be 0.7071.', nextStep: 'Notice that each qubit\'s arrow is still at the centre of its sphere.' },
    },
  },
  'medida-parcial': {
    1: {
      es: { title: 'Por qué no coinciden', guidance: 'Ahora solo el qubit 0 está en superposición y el qubit 1 siempre da 0: salen 00 y 10. Para que coincidan, el qubit 1 tiene que seguir al qubit 0.', nextStep: 'Recuerda cómo se prepara |Φ⁺⟩.' },
      en: { title: 'Why they disagree', guidance: 'Right now only qubit 0 is in superposition and qubit 1 always gives 0: you get 00 and 10. For them to agree, qubit 1 has to follow qubit 0.', nextStep: 'Recall how |Φ⁺⟩ is prepared.' },
    },
    2: {
      es: { title: 'Circuito de Bell', guidance: 'Hadamard en el cable 0 seguida de una CNOT con control 0 y objetivo 1 da (|00⟩ + |11⟩)/√2.', nextStep: 'Añade la CNOT antes del `return`.' },
      en: { title: 'Bell circuit', guidance: 'A Hadamard on wire 0 followed by a CNOT with control 0 and target 1 gives (|00⟩ + |11⟩)/√2.', nextStep: 'Add the CNOT before the `return`.' },
    },
    3: {
      es: { title: 'Comprueba los conteos', guidance: 'Con `qml.CNOT(wires=[0, 1])` solo aparecen 00 y 11, alrededor de 500 cada uno. Que no salga exactamente 500 es normal.', nextStep: 'Ejecuta y verifica que "Coinciden en todos los disparos" es True.' },
      en: { title: 'Check the counts', guidance: 'With `qml.CNOT(wires=[0, 1])` only 00 and 11 appear, around 500 each. Not getting exactly 500 is normal.', nextStep: 'Run it and check that "Agree in every shot" is True.' },
    },
  },
  'no-clonacion': {
    1: {
      es: { title: 'La copiadora de bits', guidance: 'Una CNOT con el objetivo en |0⟩ copia los estados de la base: |0⟩ → |00⟩ y |1⟩ → |11⟩. Vamos a ver qué hace con |+⟩.', nextStep: 'Aplica la CNOT con control 0 y objetivo 1.' },
      en: { title: 'The bit copier', guidance: 'A CNOT with the target in |0⟩ copies basis states: |0⟩ → |00⟩ and |1⟩ → |11⟩. Let\'s see what it does with |+⟩.', nextStep: 'Apply the CNOT with control 0 and target 1.' },
    },
    2: {
      es: { title: 'Linealidad', guidance: 'La CNOT actúa sobre cada término de |+⟩ = (|0⟩ + |1⟩)/√2 por separado, así que el resultado es (|00⟩ + |11⟩)/√2 y no |+⟩|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2.', nextStep: 'Compara en la consola los dos solapamientos: con |Φ⁺⟩ debe salir 1.000.' },
      en: { title: 'Linearity', guidance: 'CNOT acts on each term of |+⟩ = (|0⟩ + |1⟩)/√2 separately, so the result is (|00⟩ + |11⟩)/√2, not |+⟩|+⟩ = (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2.', nextStep: 'Compare the two overlaps in the console: with |Φ⁺⟩ it must be 1.000.' },
    },
    3: {
      es: { title: 'La línea que falta', guidance: 'Escribe `qml.CNOT(wires=[0, 1])` antes del `return`. Has obtenido un par de Bell: la "copia" ha fallado y se ha creado entrelazamiento.', nextStep: 'Ejecuta y compara las esferas: ya no apuntan a +X.' },
      en: { title: 'The missing line', guidance: 'Write `qml.CNOT(wires=[0, 1])` before the `return`. You get a Bell pair: the "copy" failed and entanglement was created instead.', nextStep: 'Run it and compare the spheres: they no longer point to +X.' },
    },
  },
  'codificacion-superdensa': {
    1: {
      es: { title: 'Un bit, una puerta', guidance: 'El primer bit del mensaje decide si Alice aplica Z y el segundo si aplica X. Para "11" necesita las dos.', nextStep: 'Aplica las puertas solo en el cable 0, el de Alice.' },
      en: { title: 'One bit, one gate', guidance: 'The first bit of the message decides whether Alice applies Z, the second whether she applies X. For "11" she needs both.', nextStep: 'Apply the gates on wire 0 only, Alice\'s wire.' },
    },
    2: {
      es: { title: 'El orden', guidance: 'Aplica primero X y después Z sobre el cable 0. El par pasa a |Ψ⁻⟩, que la decodificación de Bob convierte en |11⟩.', nextStep: 'Coloca las dos puertas entre la preparación del par y la decodificación.' },
      en: { title: 'The order', guidance: 'Apply X first and then Z on wire 0. The pair becomes |Ψ⁻⟩, which Bob\'s decoding turns into |11⟩.', nextStep: 'Place both gates between the pair preparation and the decoding.' },
    },
    3: {
      es: { title: 'Las dos líneas', guidance: 'Escribe `qml.PauliX(wires=0)` y después `qml.PauliZ(wires=0)` en la línea del TODO.', nextStep: 'Ejecuta: Bob debe recibir 11 con probabilidad 1.000.' },
      en: { title: 'The two lines', guidance: 'Write `qml.PauliX(wires=0)` and then `qml.PauliZ(wires=0)` on the TODO line.', nextStep: 'Run it: Bob must receive 11 with probability 1.000.' },
    },
  },
  teleportacion: {
    1: {
      es: { title: 'Medir y corregir, sin medir', guidance: 'En el protocolo, Bob aplica X si m1 = 1 y Z si m0 = 1. Con medida diferida, "si m1 = 1 aplica X" se convierte en una puerta controlada por q1.', nextStep: '¿Qué puerta aplica X al objetivo cuando el control es 1?' },
      en: { title: 'Measure and correct, without measuring', guidance: 'In the protocol Bob applies X if m1 = 1 and Z if m0 = 1. With deferred measurement, "apply X if m1 = 1" becomes a gate controlled by q1.', nextStep: 'Which gate applies X to the target when the control is 1?' },
    },
    2: {
      es: { title: 'Dos puertas controladas', guidance: 'La X condicionada es una CNOT de q1 a q2, y la Z condicionada es una CZ de q0 a q2. El orden importa: primero la CNOT y después la CZ.', nextStep: 'Añade ambas al final del circuito, antes del `return`.' },
      en: { title: 'Two controlled gates', guidance: 'The conditional X is a CNOT from q1 to q2, and the conditional Z is a CZ from q0 to q2. Order matters: CNOT first, then CZ.', nextStep: 'Add both at the end of the circuit, before the `return`.' },
    },
    3: {
      es: { title: 'Las dos líneas', guidance: 'Escribe `qml.CNOT(wires=[1, 2])` y después `qml.CZ(wires=[0, 2])`. La esfera de q2 debe apuntar a (0.866, 0, 0.5) con longitud 1, y q0 y q1 a +X.', nextStep: 'Ejecuta y comprueba P(q2 = 0) = 0.750.' },
      en: { title: 'The two lines', guidance: 'Write `qml.CNOT(wires=[1, 2])` and then `qml.CZ(wires=[0, 2])`. The q2 sphere must point to (0.866, 0, 0.5) with length 1, and q0 and q1 to +X.', nextStep: 'Run it and check P(q2 = 0) = 0.750.' },
    },
  },
};

/* ------------------------------------------------------------------ quiz */

export const QUIZ_BLOCK_2: QuizQuestion[] = [
  {
    id: 1,
    question: { es: '¿Cuántas amplitudes complejas describen el estado general de 3 qubits?', en: 'How many complex amplitudes describe the general state of 3 qubits?' },
    options: { es: ['3', '6', '8', '9'], en: ['3', '6', '8', '9'] },
    correctAnswer: 2,
    explanation: { es: 'Con n qubits hay 2ⁿ estados de la base: 2³ = 8. Por eso la memoria necesaria para simular crece exponencialmente.', en: 'n qubits have 2ⁿ basis states: 2³ = 8. That is why the memory needed to simulate them grows exponentially.' },
  },
  {
    id: 2,
    question: { es: 'Con el orden de PennyLane (|q0 q1⟩), ¿qué vector representa |+⟩ ⊗ |0⟩ (cable 0 en |+⟩)?', en: 'With PennyLane order (|q0 q1⟩), which vector represents |+⟩ ⊗ |0⟩ (wire 0 in |+⟩)?' },
    options: { es: ['(1/√2, 1/√2, 0, 0)', '(1/√2, 0, 1/√2, 0)', '(1/2, 1/2, 1/2, 1/2)', '(0, 1/√2, 0, 1/√2)'], en: ['(1/√2, 1/√2, 0, 0)', '(1/√2, 0, 1/√2, 0)', '(1/2, 1/2, 1/2, 1/2)', '(0, 1/√2, 0, 1/√2)'] },
    correctAnswer: 1,
    explanation: { es: '|+⟩|0⟩ = (|00⟩ + |10⟩)/√2. En el orden |q0 q1⟩, |00⟩ es la posición 0 y |10⟩ la posición 2.', en: '|+⟩|0⟩ = (|00⟩ + |10⟩)/√2. In |q0 q1⟩ order, |00⟩ is position 0 and |10⟩ is position 2.' },
  },
  {
    id: 3,
    question: { es: '¿Cuál de estos estados está entrelazado?', en: 'Which of these states is entangled?' },
    options: { es: ['|00⟩', '(|00⟩ + |01⟩)/√2', '(|00⟩ + |11⟩)/√2', '(|00⟩ + |01⟩ + |10⟩ + |11⟩)/2'], en: ['|00⟩', '(|00⟩ + |01⟩)/√2', '(|00⟩ + |11⟩)/√2', '(|00⟩ + |01⟩ + |10⟩ + |11⟩)/2'] },
    correctAnswer: 2,
    explanation: { es: 'Un estado es producto si c₀₀c₁₁ = c₀₁c₁₀. En (|00⟩ + |11⟩)/√2: 1/2 ≠ 0. Los demás son |0⟩|0⟩, |0⟩|+⟩ y |+⟩|+⟩.', en: 'A state is a product if c₀₀c₁₁ = c₀₁c₁₀. For (|00⟩ + |11⟩)/√2: 1/2 ≠ 0. The others are |0⟩|0⟩, |0⟩|+⟩ and |+⟩|+⟩.' },
  },
  {
    id: 4,
    question: { es: 'Aplicas CNOT (control q0, objetivo q1) al estado |10⟩. ¿Qué obtienes?', en: 'You apply CNOT (control q0, target q1) to |10⟩. What do you get?' },
    options: { es: ['|10⟩', '|11⟩', '|01⟩', '(|10⟩ + |11⟩)/√2'], en: ['|10⟩', '|11⟩', '|01⟩', '(|10⟩ + |11⟩)/√2'] },
    correctAnswer: 1,
    explanation: { es: 'El control vale 1, así que se invierte el objetivo: |1, 0⊕1⟩ = |11⟩.', en: 'The control is 1, so the target flips: |1, 0⊕1⟩ = |11⟩.' },
  },
  {
    id: 5,
    question: { es: 'Mides el qubit 0 de |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 y obtienes 1. ¿En qué estado queda el qubit 1?', en: 'You measure qubit 0 of |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 and get 1. What state is qubit 1 left in?' },
    options: { es: ['|+⟩', 'Sigue en superposición al 50 %', '|0⟩', '|1⟩ con certeza'], en: ['|+⟩', 'Still in a 50 % superposition', '|0⟩', '|1⟩ with certainty'] },
    correctAnswer: 3,
    explanation: { es: 'Solo sobrevive el término compatible con q0 = 1, que es |11⟩. Tras renormalizar, el qubit 1 queda en |1⟩.', en: 'Only the term compatible with q0 = 1 survives, which is |11⟩. After renormalizing, qubit 1 is in |1⟩.' },
  },
  {
    id: 6,
    question: { es: 'Si miras solo un qubit de un par de Bell, ¿dónde está su vector de Bloch?', en: 'Looking at only one qubit of a Bell pair, where is its Bloch vector?' },
    options: { es: ['En el polo norte, |0⟩', 'En el ecuador, en +X', 'En el centro de la esfera (longitud 0)', 'En un punto aleatorio de la superficie'], en: ['At the north pole, |0⟩', 'On the equator, at +X', 'At the centre of the sphere (length 0)', 'At a random point on the surface'] },
    correctAnswer: 2,
    explanation: { es: 'Su estado reducido es máximamente mezclado: ⟨X⟩ = ⟨Y⟩ = ⟨Z⟩ = 0. Toda la información está en las correlaciones.', en: 'Its reduced state is maximally mixed: ⟨X⟩ = ⟨Y⟩ = ⟨Z⟩ = 0. All the information is in the correlations.' },
  },
  {
    id: 7,
    question: { es: '¿Por qué el entrelazamiento no permite enviar mensajes más rápido que la luz?', en: 'Why can\'t entanglement send messages faster than light?' },
    options: { es: ['Porque el entrelazamiento se rompe a más de unos metros', 'Porque las estadísticas locales de Bob no cambian con lo que haga Alice; hace falta comunicación clásica', 'Porque solo funciona con fotones', 'Sí lo permite, pero solo con teleportación'], en: ['Because entanglement breaks beyond a few metres', 'Because Bob\'s local statistics do not change with what Alice does; classical communication is needed', 'Because it only works with photons', 'It does, but only with teleportation'] },
    correctAnswer: 1,
    explanation: { es: 'Sin conocer el resultado de Alice, el qubit de Bob sigue al 50 %: no puede detectar ninguna acción de ella (no señalización).', en: 'Without knowing Alice\'s result, Bob\'s qubit is still 50/50: he cannot detect any of her actions (no-signalling).' },
  },
  {
    id: 8,
    question: { es: 'Según el teorema de no clonación, ¿qué SÍ puede copiar una CNOT con el objetivo en |0⟩?', en: 'According to the no-cloning theorem, what CAN a CNOT with the target in |0⟩ copy?' },
    options: { es: ['Cualquier estado desconocido', 'Solo |+⟩ y |−⟩', 'Los estados de la base |0⟩ y |1⟩', 'Nada en absoluto'], en: ['Any unknown state', 'Only |+⟩ and |−⟩', 'The basis states |0⟩ and |1⟩', 'Nothing at all'] },
    correctAnswer: 2,
    explanation: { es: 'Una misma máquina solo copia estados ortogonales entre sí. La CNOT copia |0⟩ y |1⟩, pero convierte |+⟩|0⟩ en un par de Bell.', en: 'One machine can only copy mutually orthogonal states. CNOT copies |0⟩ and |1⟩ but turns |+⟩|0⟩ into a Bell pair.' },
  },
  {
    id: 9,
    question: { es: 'En la codificación superdensa, ¿cuántos bits clásicos recibe Bob por cada qubit que le envía Alice?', en: 'In superdense coding, how many classical bits does Bob receive per qubit Alice sends?' },
    options: { es: ['Medio bit', '1 bit', '2 bits, gracias al par entrelazado compartido antes', 'Infinitos, porque las amplitudes son continuas'], en: ['Half a bit', '1 bit', '2 bits, thanks to the previously shared entangled pair', 'Infinitely many, because amplitudes are continuous'] },
    correctAnswer: 2,
    explanation: { es: 'Con un par compartido, las cuatro operaciones de Alice (I, X, Z, ZX) producen los cuatro estados de Bell, que Bob distingue con certeza.', en: 'With a shared pair, Alice\'s four operations (I, X, Z, ZX) produce the four Bell states, which Bob tells apart with certainty.' },
  },
  {
    id: 10,
    question: { es: 'Tras una teleportación, ¿qué ocurre con el estado original en el qubit de Alice?', en: 'After teleportation, what happens to the original state in Alice\'s qubit?' },
    options: { es: ['Se conserva: ahora hay dos copias', 'Se destruye: el qubit de Alice queda en un estado que no contiene |ψ⟩', 'Se convierte en |0⟩ siempre', 'Viaja físicamente hasta Bob'], en: ['It is kept: there are now two copies', 'It is destroyed: Alice\'s qubit is left in a state that does not contain |ψ⟩', 'It always becomes |0⟩', 'It physically travels to Bob'] },
    correctAnswer: 1,
    explanation: { es: 'La teleportación transfiere el estado, no lo copia: tras la medida de Alice su qubit ya no guarda |ψ⟩, como exige la no clonación.', en: 'Teleportation transfers the state rather than copying it: after Alice\'s measurement her qubit no longer holds |ψ⟩, as no-cloning requires.' },
  },
];

/* ------------------------------------------------------------------ mini-project */

export const MINI_PROJECT_BLOCK_2: MiniProject = {
  id: 'free-teleportation',
  icon: '🛸',
  shortTitle: { es: 'Teleportación', en: 'Teleportation' },
  qubits: 3,
  title: {
    es: 'Mini-Proyecto: Teletransporta tu Propio Estado',
    en: 'Mini-Project: Teleport Your Own State',
  },
  description: {
    es: String.raw`Escribe el protocolo de teleportación **completo** para un estado que elijas tú: $|\psi\rangle = R_z(\phi)\,R_y(\theta)|0\rangle$.

Elige $\theta$ entre $0.2$ y $\pi-0.2$ y una fase $\phi$ distinta de $0$, crea el par entrelazado entre $q_1$ y $q_2$, programa la parte de Alice y las correcciones de Bob con medida diferida. El reto se supera cuando el vector de Bloch de $q_2$ coincide con $(\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta)$, y $q_0$ y $q_1$ terminan en $|+\rangle$. **Extensión opcional:** reescribe el protocolo con medidas a mitad de circuito (${'`'}qml.measure${'`'} y ${'`'}qml.cond${'`'}).`,
    en: String.raw`Write the **complete** teleportation protocol for a state of your choice: $|\psi\rangle = R_z(\phi)\,R_y(\theta)|0\rangle$.

Choose $\theta$ between $0.2$ and $\pi-0.2$ and a phase $\phi$ other than $0$, create the entangled pair between $q_1$ and $q_2$, then program Alice's part and Bob's corrections with deferred measurement. You pass when the Bloch vector of $q_2$ matches $(\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta)$, and $q_0$ and $q_1$ end in $|+\rangle$. **Optional extension:** rewrite the protocol with mid-circuit measurements (${'`'}qml.measure${'`'} and ${'`'}qml.cond${'`'}).`,
  },
  xpReward: 300,
  wrongResultHint: {
    es: 'Todavía no: comprueba que θ está entre 0.2 y π − 0.2 y φ ≠ 0, que creas el par entre q1 y q2, y que aplicas CNOT(q0→q1), H(q0), CNOT(q1→q2) y CZ(q0→q2).',
    en: 'Not yet: check that θ is between 0.2 and π − 0.2 and φ ≠ 0, that you create the pair between q1 and q2, and that you apply CNOT(q0→q1), H(q0), CNOT(q1→q2) and CZ(q0→q2).',
  },
  starterCode: {
    pennylane: {
      es: `# --- RETO: Teletransporta tu propio estado ---
import pennylane as qml
import numpy as np

# TODO: elige tu estado (theta entre 0.2 y pi - 0.2, phi distinto de 0).
theta = 0
phi = 0

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def teleport():
    # Estado de Alice en q0
    qml.RY(theta, wires=0)
    qml.RZ(phi, wires=0)
    # TODO: crea el par entrelazado entre q1 y q2.
    # TODO: operaciones de Alice sobre q0 y q1.
    # TODO: correcciones de Bob sobre q2 (medida diferida).
    return qml.state()

state = teleport()
psi = state.reshape(4, 2)
rho_bob = psi.T @ psi.conj()
bloch_bob = [2 * rho_bob[0, 1].real, -2 * rho_bob[0, 1].imag, (rho_bob[0, 0] - rho_bob[1, 1]).real]
expected = [np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)]
print("Bloch de q2 (Bob):", np.round(bloch_bob, 3))
print("Bloch esperado:   ", np.round(expected, 3))

_result = "Teleportación ejecutada"
`,
      en: `# --- CHALLENGE: Teleport your own state ---
import pennylane as qml
import numpy as np

# TODO: choose your state (theta between 0.2 and pi - 0.2, phi other than 0).
theta = 0
phi = 0

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def teleport():
    # Alice's state on q0
    qml.RY(theta, wires=0)
    qml.RZ(phi, wires=0)
    # TODO: create the entangled pair between q1 and q2.
    # TODO: Alice's operations on q0 and q1.
    # TODO: Bob's corrections on q2 (deferred measurement).
    return qml.state()

state = teleport()
psi = state.reshape(4, 2)
rho_bob = psi.T @ psi.conj()
bloch_bob = [2 * rho_bob[0, 1].real, -2 * rho_bob[0, 1].imag, (rho_bob[0, 0] - rho_bob[1, 1]).real]
expected = [np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)]
print("q2 Bloch (Bob):", np.round(bloch_bob, 3))
print("Expected Bloch:", np.round(expected, 3))

_result = "Teleportation executed"
`,
    },
  },
};

/* ------------------------------------------------------------------ block */

export const BLOCK_2: BlockContent = {
  id: 'block-2',
  lessons: LESSONS_BLOCK_2,
  quiz: QUIZ_BLOCK_2,
  quizXp: 250,
  miniProject: MINI_PROJECT_BLOCK_2,
  hints: HINTS,
  targets: {
    'producto-tensorial': { state: PLUS_ONE, circuit: [op('H', 0), op('X', 1)] },
    cnot: { state: basis(2, 2), circuit: [op('X', 0), op('X', 1), two('CNOT', 0, 1)] },
    'estados-bell': { state: PSI_PLUS, circuit: [op('H', 0), two('CNOT', 0, 1), op('X', 1)] },
    'medida-parcial': { state: PHI_PLUS, circuit: [op('H', 0), two('CNOT', 0, 1), op('M', 0), op('M', 1)] },
    'no-clonacion': { state: PHI_PLUS, circuit: [op('H', 0), two('CNOT', 0, 1)] },
    'codificacion-superdensa': {
      state: basis(3, 2),
      circuit: [op('H', 0), two('CNOT', 0, 1), op('X', 0), op('Z', 0), two('CNOT', 0, 1), op('H', 0)],
    },
    teleportacion: {
      state: teleportedState(Math.PI / 3, 0),
      circuit: [
        { id: rotationId('RY', Math.PI / 3), label: 'Rᵧ(π/3)', wire: 0 },
        op('H', 1), two('CNOT', 1, 2), two('CNOT', 0, 1), op('H', 0), two('CNOT', 1, 2), two('CZ', 0, 2),
      ],
    },
  },
  validateExercise: (slug, input) => VALIDATORS[slug]?.(input) ?? fail('wrong-result'),
  validateMiniProject: checkFreeTeleportation,
};

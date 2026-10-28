import type { BlochCoordinates } from './quantumMath';
import type { CircuitOperation } from '../components/quantum/CircuitDiagram';
import { rotationId } from './pennylaneCircuit';
import type { Samples } from '../types/worker';

/** Complex amplitude as [re, im], the format the Pyodide worker returns. */
export type Amplitude = [number, number];

const R2 = Math.SQRT1_2;

export const TARGET_BLOCH: Record<string, BlochCoordinates> = {
  'bit-vs-qubit': { x: 0, y: 0, z: 1 },
  'vector-estado-born': { x: 1, y: 0, z: 0 },
  'esfera-de-bloch': { x: 0, y: 1, z: 0 },
  'puertas-monoqubit-1': { x: -1, y: 0, z: 0 },
  'puertas-rotacion-fase': { x: Math.sqrt(3) / 2, y: 0, z: 0.5 },
  'medida-y-colapso': { x: 1, y: 0, z: 0 },
};

export const TARGET_CIRCUITS: Record<string, CircuitOperation[]> = {
  'bit-vs-qubit': [],
  'vector-estado-born': [{ id: 'H', label: 'H', wire: 0 }],
  'esfera-de-bloch': [{ id: 'H', label: 'H', wire: 0 }, { id: 'S', label: 'S', wire: 0 }],
  'puertas-monoqubit-1': [{ id: 'X', label: 'X', wire: 0 }, { id: 'H', label: 'H', wire: 0 }],
  'puertas-rotacion-fase': [{ id: rotationId('RY', Math.PI / 3), label: 'Rᵧ(π/3)', wire: 0 }],
  'medida-y-colapso': [{ id: 'H', label: 'H', wire: 0 }, { id: 'M', label: 'M', wire: 0 }],
};

/** Exact target states for lessons whose goal is a specific state (up to global phase). */
const TARGET_STATES: Record<string, [Amplitude, Amplitude]> = {
  'bit-vs-qubit': [[1, 0], [0, 0]],
  'vector-estado-born': [[R2, 0], [R2, 0]],
  'esfera-de-bloch': [[R2, 0], [0, R2]],
  'puertas-monoqubit-1': [[R2, 0], [-R2, 0]],
};

export const FIDELITY_THRESHOLD = 0.999;
export const PROBABILITY_TOLERANCE = 0.005;
export const SHOTS_EXPECTED = 1000;

export type CheckFailure = 'missing-state' | 'missing-samples' | 'invalid-state' | 'wrong-result';
export type CheckResult = { passed: true } | { passed: false; reason: CheckFailure };

const pass: CheckResult = { passed: true };
const fail = (reason: CheckFailure): CheckResult => ({ passed: false, reason });

/** A normalized state vector of 1 or more qubits (length 2ⁿ, |a|² summing to 1). */
export function isValidStateVector(state: Amplitude[] | undefined): state is Amplitude[] {
  if (!state || state.length < 2 || !Number.isInteger(Math.log2(state.length))) return false;
  if (!state.every((a) => a.length === 2 && a.every(Number.isFinite))) return false;
  const norm = state.reduce((sum, [re, im]) => sum + re * re + im * im, 0);
  return Math.abs(norm - 1) < 1e-3;
}

function isValidQubitState(state: Amplitude[] | undefined): state is [Amplitude, Amplitude] {
  return isValidStateVector(state) && state.length === 2;
}

/** |⟨target|ψ⟩|² for states of any size, insensitive to global phase (0 if sizes differ). */
export function fidelity(target: Amplitude[], state: Amplitude[]): number {
  if (target.length !== state.length) return 0;
  let re = 0;
  let im = 0;
  for (let i = 0; i < target.length; i++) {
    const [tr, ti] = target[i];
    const [sr, si] = state[i];
    // conj(t) * s
    re += tr * sr + ti * si;
    im += tr * si - ti * sr;
  }
  return re * re + im * im;
}

/** True when `state` matches `target` up to global phase. */
export function matchesState(target: Amplitude[], state: Amplitude[] | undefined, threshold = FIDELITY_THRESHOLD): boolean {
  return isValidStateVector(state) && fidelity(target, state) >= threshold;
}

export function probabilityOfZero(state: [Amplitude, Amplitude]): number {
  const [re, im] = state[0];
  return re * re + im * im;
}

/**
 * Fraction of shots that collapsed to |0⟩. Accepts PauliZ eigenvalues (+1 → |0⟩, −1 → |1⟩)
 * or computational-basis bits (0 → |0⟩, 1 → |1⟩).
 */
export function zeroFrequency(samples: number[]): number | null {
  if (samples.length === 0) return null;
  const eigenvalueMode = samples.some((v) => v === -1);
  const allowed = eigenvalueMode ? [1, -1] : [0, 1];
  if (!samples.every((v) => allowed.includes(v))) return null;
  const zeros = samples.filter((v) => v === (eigenvalueMode ? 1 : 0)).length;
  return zeros / samples.length;
}

/**
 * Verifies a lesson exercise from the data the simulator actually produced (the `state`
 * and `samples` variables), not from printed text, so a bare print() cannot pass it.
 */
export function checkExercise(slug: string, statevector?: Amplitude[], samples?: Samples): CheckResult {
  if (slug === 'medida-y-colapso') {
    if (!samples || samples.length === 0) return fail('missing-samples');
    if (samples.length !== SHOTS_EXPECTED || Array.isArray(samples[0])) return fail('wrong-result');
    const frequency = zeroFrequency(samples as number[]);
    if (frequency === null) return fail('wrong-result');
    return frequency >= 0.4 && frequency <= 0.6 ? pass : fail('wrong-result');
  }

  if (!statevector) return fail('missing-state');
  if (!isValidQubitState(statevector)) return fail('invalid-state');

  if (slug === 'puertas-rotacion-fase') {
    return Math.abs(probabilityOfZero(statevector) - 0.75) < PROBABILITY_TOLERANCE ? pass : fail('wrong-result');
  }

  const target = TARGET_STATES[slug];
  if (!target) return fail('wrong-result');
  return fidelity(target, statevector) >= FIDELITY_THRESHOLD ? pass : fail('wrong-result');
}

/** Mini-project: the prepared state must give P(|0⟩) = targetP0. */
export function checkBiasedQrng(targetP0: number, statevector?: Amplitude[]): CheckResult {
  if (!statevector) return fail('missing-state');
  if (!isValidQubitState(statevector)) return fail('invalid-state');
  return Math.abs(probabilityOfZero(statevector) - targetP0) < PROBABILITY_TOLERANCE ? pass : fail('wrong-result');
}

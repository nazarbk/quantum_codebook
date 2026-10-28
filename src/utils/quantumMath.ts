/** Cartesian Bloch vector in the conventional right-handed Pauli (X, Y, Z) basis. */
export interface BlochCoordinates {
  x: number;
  y: number;
  z: number;
}

/** Converts a normalized pure single-qubit state [alpha, beta] to its Bloch vector. */
export function stateToBlochCoordinates(state: readonly [complex: [number, number], complex: [number, number]]): BlochCoordinates {
  const [[alphaRe, alphaIm], [betaRe, betaIm]] = state;
  const x = 2 * (alphaRe * betaRe + alphaIm * betaIm);
  const y = 2 * (alphaRe * betaIm - alphaIm * betaRe);
  const z = alphaRe ** 2 + alphaIm ** 2 - betaRe ** 2 - betaIm ** 2;
  return { x, y, z };
}

/* ------------------------------------------------------------------ multi-qubit helpers */

/** Complex amplitude as [re, im]. */
export type ComplexPair = [number, number];

/**
 * Number of qubits of a state vector, or null if its length is not a power of two (≥ 2).
 * Convention (PennyLane): wire 0 is the most significant bit, so for 2 qubits the
 * amplitudes are ordered |q0 q1⟩ = |00⟩, |01⟩, |10⟩, |11⟩.
 */
export function qubitCount(state: readonly ComplexPair[]): number | null {
  const n = Math.log2(state.length);
  return state.length >= 2 && Number.isInteger(n) ? n : null;
}

/** Basis label for an index, e.g. 2 → "10" for 2 qubits (wire 0 first). */
export function basisLabel(index: number, qubits: number): string {
  return index.toString(2).padStart(qubits, '0');
}

/** Measurement probabilities |a_i|² of every basis state. */
export function probabilities(state: readonly ComplexPair[]): number[] {
  return state.map(([re, im]) => re * re + im * im);
}

/**
 * Bloch vector of qubit `wire` after tracing out the others (reduced state).
 * For a product state its length is 1; when the qubit is entangled the vector shrinks
 * towards the centre (length 0 for a maximally entangled qubit, e.g. in a Bell state).
 */
export function reducedBlochVector(state: readonly ComplexPair[], wire: number): BlochCoordinates {
  const qubits = qubitCount(state);
  if (qubits === null || wire < 0 || wire >= qubits) throw new Error('Invalid state or wire');
  const mask = 1 << (qubits - 1 - wire);
  let x = 0;
  let y = 0;
  let z = 0;
  state.forEach(([re, im], index) => {
    const bit = index & mask ? 1 : 0;
    z += (re * re + im * im) * (bit ? -1 : 1);
    if (bit === 0) {
      const [re1, im1] = state[index | mask];
      // 2·conj(a_i0)·a_i1 gives ⟨X⟩ (real part) and ⟨Y⟩ (imaginary part)
      x += 2 * (re * re1 + im * im1);
      y += 2 * (re * im1 - im * re1);
    }
  });
  return { x, y, z };
}

/** Length of a Bloch vector: 1 = pure qubit, < 1 = mixed (entangled with the rest). */
export function blochLength({ x, y, z }: BlochCoordinates): number {
  return Math.hypot(x, y, z);
}

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

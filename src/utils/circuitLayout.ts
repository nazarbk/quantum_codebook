import type { CircuitOperation } from '../components/quantum/CircuitDiagram';

/** Wires an operation touches (a two-qubit gate blocks every wire between its two ends). */
export const spanOf = (operation: CircuitOperation): [number, number] =>
  operation.wires ? [Math.min(...operation.wires), Math.max(...operation.wires)] : [operation.wire, operation.wire];

/**
 * Assigns each operation the earliest column after everything already drawn on its wires,
 * so gates on different qubits share a column, as in textbook circuit diagrams.
 */
export function layoutColumns(operations: CircuitOperation[]): number[] {
  const nextFree: number[] = [];
  return operations.map((operation) => {
    const [low, high] = spanOf(operation);
    let column = 0;
    for (let wire = low; wire <= high; wire++) column = Math.max(column, nextFree[wire] ?? 0);
    for (let wire = low; wire <= high; wire++) nextFree[wire] = column + 1;
    return column;
  });
}

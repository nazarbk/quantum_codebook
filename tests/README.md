# Tests de Quantum Codebook

Pruebas añadidas en la revisión del 28/10/2026. No modifican el código de la app.

## Ejecutar
```bash
npm test
```
Requisitos: Node 20+ y Python 3 con `numpy` (`pip install numpy`). La primera vez descarga `tsx` con npx.

Qué hace `tests/run.mjs`:
1. Vuelca el código inicial de los ejercicios (`tests/dump_data.ts`).
2. Ejecuta cada ejercicio (código inicial, solución de referencia y "trampa") con el mini-simulador.
3. Lanza los tests unitarios (`tests/unit.test.ts`).

`fake_pennylane/` es un simulador numpy de 1 qubit que imita SOLO la parte de PennyLane usada en el Bloque 1
(device, qnode, PauliX, Hadamard, S, RY, state, sample...). No sustituye a probar con PennyLane real en Pyodide.

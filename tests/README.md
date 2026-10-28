# Tests de Quantum Codebook

Pruebas añadidas en la revisión del 28/10/2026. No modifican el código de la app.

## Requisitos
- Node 20+ y `tsx` (`npm i -D tsx`)
- Python 3 con `numpy`

## Ejecutar
```bash
# 1. Volcar el código inicial de los ejercicios (crea antes la carpeta tests/out)
mkdir -p tests/out
npx tsx tests/dump_data.ts > tests/out/starters.json
# 2. Ejecutar ejercicios (código inicial, solución de referencia y "trampa") con el mini-simulador
python tests/run_exercises.py tests/out/starters.json tests/fake_pennylane > tests/out/runs.json
# 3. Tests unitarios
npx tsx --test tests/unit.test.ts
```

`fake_pennylane/` es un simulador numpy de 1 qubit que imita SOLO la parte de PennyLane usada en el Bloque 1
(device, qnode, PauliX, Hadamard, S, RY, state, sample...). No sustituye a probar con PennyLane real en Pyodide.

Los tests marcados `[LIMITACIÓN]` fallan a propósito hoy: documentan fallos conocidos y deberían pasar
cuando se corrijan (ver informe de revisión).

Sugerencia: añadir a package.json
```json
"test": "tsx tests/dump_data.ts > tests/out/starters.json && python tests/run_exercises.py tests/out/starters.json tests/fake_pennylane > tests/out/runs.json && tsx --test tests/unit.test.ts"
```
y `tests/out/` al .gitignore.

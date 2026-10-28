# Quantum Codebook

Web para aprender computación cuántica desde nivel 0 hasta nivel avanzado, con teoría, ejercicios
de código ejecutados en el navegador, tests y mini-proyectos. Disponible en castellano e inglés.

## Qué incluye
- **Ruta del curso** con 5 bloques, del qubit a la computación cuántica aplicada.
- **Bloque 1 · Fundamentos del qubit**: 6 lecciones con teoría (KaTeX), ejercicios en PennyLane,
  esfera de Bloch 3D, diagrama de circuito en vivo, pistas, test de 10 preguntas y mini-proyecto.
- **Bloque 2 · Entrelazamiento**: 7 lecciones (producto tensorial, CNOT, estados de Bell, medida
  parcial, no clonación, codificación superdensa y teleportación), con histograma de probabilidades
  y una esfera de Bloch por qubit; test y mini-proyecto de teleportación.
- **Python en el navegador** con [Pyodide](https://pyodide.org/): no hace falta servidor ni instalar nada.
- **Cuentas con Google** (opcional, vía Supabase): cada usuario tiene su ruta, progreso y notas en
  cualquier dispositivo. Sin configurar, la web funciona en modo local. Guía: [`docs/CUENTAS_GOOGLE.md`](docs/CUENTAS_GOOGLE.md).

## Desarrollo
Requisitos: Node 20+.

```bash
npm install
npm run dev      # servidor local en http://localhost:5173
npm run build    # comprueba tipos y genera dist/
npm test         # tests (necesita también Python 3 con numpy)
```

Detalles de los tests en [`tests/README.md`](tests/README.md).

## Despliegue
Cada push a `main` ejecuta los tests y publica la web en GitHub Pages
(`.github/workflows/deploy.yml`). En el repositorio: **Settings → Pages → Source: GitHub Actions**.

## Estructura
```
src/
  data/          contenido: bloques (blocks/), test, pistas, ruta del curso
  auth/, lib/    acceso con Google y cliente de Supabase
  pages/         pantalla de acceso y página del curso
  components/    vistas (lecciones, test, mini-proyecto, ruta, editor, visualizaciones)
  utils/         validación de ejercicios, lector de circuitos, matemáticas
  workers/       worker de Pyodide que ejecuta el código Python
tests/           tests unitarios y mini-simulador numpy
supabase/        esquema de la base de datos (progreso por usuario)
```

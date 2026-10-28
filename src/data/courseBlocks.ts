import { CourseBlockDefinition } from '../types/course';

/** Course roadmap. Blocks 1 and 2 have lesson content; the rest are planned. */
export const COURSE_BLOCKS: CourseBlockDefinition[] = [
  {
    id: 'block-1', order: 1, lessonCount: 6, contentStatus: 'available',
    level: { es: 'Nivel 0 · Inicial', en: 'Level 0 · Beginner' },
    title: { es: 'Fundamentos del Qubit', en: 'Qubit Fundamentals' },
    subtitle: { es: 'Estados, puertas, fases y medida', en: 'States, gates, phases, and measurement' },
    topics: { es: ['Superposición', 'Esfera de Bloch', 'Puertas de un qubit', 'Medida'], en: ['Superposition', 'Bloch sphere', 'Single-qubit gates', 'Measurement'] },
  },
  {
    id: 'block-2', order: 2, lessonCount: 7, contentStatus: 'available', prerequisiteBlockId: 'block-1',
    level: { es: 'Nivel 1 · Básico', en: 'Level 1 · Foundational' },
    title: { es: 'Entrelazamiento y Sistemas de Dos Qubits', en: 'Entanglement and Two-Qubit Systems' },
    subtitle: { es: 'Producto tensorial, estados de Bell, CNOT y teleportación', en: 'Tensor products, Bell states, CNOT, and teleportation' },
    topics: { es: ['Producto tensorial', 'CNOT', 'Estados de Bell', 'Medida parcial', 'No clonación', 'Codificación superdensa', 'Teleportación'], en: ['Tensor products', 'CNOT', 'Bell states', 'Partial measurement', 'No-cloning', 'Superdense coding', 'Teleportation'] },
  },
  {
    id: 'block-3', order: 3, lessonCount: null, contentStatus: 'planned', prerequisiteBlockId: 'block-2',
    level: { es: 'Nivel 2 · Intermedio', en: 'Level 2 · Intermediate' },
    title: { es: 'Algoritmos Cuánticos', en: 'Quantum Algorithms' },
    subtitle: { es: 'Interferencia, oráculos y ventaja computacional', en: 'Interference, oracles, and computational advantage' },
    topics: { es: ['Deutsch-Jozsa', 'Grover', 'Transformada de Fourier cuántica', 'Estimación de fase'], en: ['Deutsch-Jozsa', 'Grover', 'Quantum Fourier transform', 'Phase estimation'] },
  },
  {
    id: 'block-4', order: 4, lessonCount: null, contentStatus: 'planned', prerequisiteBlockId: 'block-3',
    level: { es: 'Nivel 3 · Avanzado', en: 'Level 3 · Advanced' },
    title: { es: 'Hardware, Ruido y Corrección de Errores', en: 'Hardware, Noise, and Error Correction' },
    subtitle: { es: 'Canales de ruido, mitigación y códigos cuánticos', en: 'Noise channels, mitigation, and quantum codes' },
    topics: { es: ['Matrices densidad', 'Decoherencia', 'Mitigación de errores', 'Código de repetición'], en: ['Density matrices', 'Decoherence', 'Error mitigation', 'Repetition code'] },
  },
  {
    id: 'block-5', order: 5, lessonCount: null, contentStatus: 'planned', prerequisiteBlockId: 'block-4',
    level: { es: 'Nivel 3 · Avanzado', en: 'Level 3 · Advanced' },
    title: { es: 'Computación Cuántica Aplicada', en: 'Applied Quantum Computing' },
    subtitle: { es: 'Algoritmos variacionales y proyecto final', en: 'Variational algorithms and a final project' },
    topics: { es: ['VQE', 'QAOA', 'Optimización híbrida', 'Proyecto integrador'], en: ['VQE', 'QAOA', 'Hybrid optimization', 'Capstone project'] },
  },
];


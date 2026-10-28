import type { CheckFailure } from '../utils/exerciseChecks';
import type { Language } from '../types/language';

/** Message shown when a run does not pass an exercise check. */
export const CHECK_FEEDBACK: Record<CheckFailure, Record<Language, string>> = {
  'wrong-result': {
    es: 'La ejecución terminó, pero el resultado aún no es el objetivo. Revisa las puertas y vuelve a intentarlo.',
    en: 'The program ran, but the result is not the target yet. Check your gates and try again.',
  },
  'missing-state': {
    es: 'No se encontró la variable `state`. Guarda el resultado del circuito en `state = circuit()` para poder comprobarlo.',
    en: 'No `state` variable was found. Store the circuit result as `state = circuit()` so it can be checked.',
  },
  'invalid-state': {
    es: '`state` debe ser un vector de estado normalizado (2ⁿ amplitudes cuyas probabilidades suman 1) con el número de qubits del ejercicio.',
    en: '`state` must be a normalized state vector (2ⁿ amplitudes whose probabilities add up to 1) with the exercise\'s number of qubits.',
  },
  'missing-samples': {
    es: 'No se encontró la variable `samples`. Guarda las medidas en `samples = circuit()` para poder comprobarlas.',
    en: 'No `samples` variable was found. Store the measurements as `samples = circuit()` so they can be checked.',
  },
};

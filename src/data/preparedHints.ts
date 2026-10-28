import type { LocalizedHints } from '../types/hints';

export type { PreparedHintCopy } from '../types/hints';

export const PREPARED_HINTS: Record<string, LocalizedHints> = {
  'bit-vs-qubit': {
    1: {
      es: { title: 'Un estado es un vector', guidance: 'El circuito parte de |0⟩, cuyo vector de amplitudes es [1, 0]. Una puerta X lo convierte en |1⟩.', nextStep: 'Compara las dos amplitudes que imprimes con [1, 0].' },
      en: { title: 'A state is a vector', guidance: 'The circuit starts in |0⟩, whose amplitude vector is [1, 0]. An X gate changes it to |1⟩.', nextStep: 'Compare the two printed amplitudes with [1, 0].' },
    },
    2: {
      es: { title: 'Consulta el estado del circuito', guidance: 'La función de circuito devuelve el vector mediante `return qml.state()`. Después, el array `state` contiene una amplitud compleja por cada estado de la base.', nextStep: 'Revisa qué puertas se aplican antes de devolver el vector.' },
      en: { title: 'Read the circuit state', guidance: 'Return the vector with `return qml.state()`. The `state` array then contains one complex amplitude for each basis state.', nextStep: 'Check which gates are applied before returning the vector.' },
    },
    3: {
      es: { title: 'Corrige la preparación', guidance: 'El código inicial incluye una puerta X a propósito. Quítala para que el circuito quede en su estado inicial.', nextStep: 'Ejecuta y confirma que la amplitud de |0⟩ vale 1 y la de |1⟩ vale 0.' },
      en: { title: 'Fix the preparation', guidance: 'The starter code includes an X gate on purpose. Remove it so the circuit remains in its initial state.', nextStep: 'Run it and confirm the |0⟩ amplitude is 1 and the |1⟩ amplitude is 0.' },
    },
  },
  'vector-estado-born': {
    1: {
      es: { title: 'Hadamard reparte amplitud', guidance: 'Al actuar sobre |0⟩, H produce |+⟩. Las dos amplitudes son iguales y su módulo al cuadrado debe dar 1/2.', nextStep: 'Calcula qué amplitudes producen dos probabilidades de 0,5.' },
      en: { title: 'Hadamard shares the amplitude', guidance: 'On |0⟩, H produces |+⟩. Both amplitudes are equal and their squared magnitudes must be 1/2.', nextStep: 'Work out which amplitudes give probabilities of 0.5.' },
    },
    2: {
      es: { title: 'Aplica H antes de medir', guidance: 'Añade Hadamard al circuito y pide su vector de estado. La Regla de Born se aplica a cada amplitud como |α|².', nextStep: 'Calcula p0 y p1 a partir del vector y muestra ambos valores.' },
      en: { title: 'Apply H before measuring', guidance: 'Add Hadamard to the circuit and request its statevector. Born’s rule uses the squared magnitude |α|².', nextStep: 'Calculate p0 and p1 from the vector and print both.' },
    },
    3: {
      es: { title: 'Comprueba las dos condiciones', guidance: 'El resultado esperado es [1/√2, 1/√2]. Después de elevar cada amplitud al cuadrado, la suma debe ser 1.', nextStep: 'Completa la puerta H y verifica que p0 = p1 = 0,5.' },
      en: { title: 'Check both conditions', guidance: 'The expected state is [1/√2, 1/√2]. After squaring each amplitude, the probabilities must sum to 1.', nextStep: 'Add H and verify p0 = p1 = 0.5.' },
    },
  },
  'esfera-de-bloch': {
    1: {
      es: { title: 'La fase no altera los módulos', guidance: 'H crea |+⟩. Para llegar a |+i⟩ hay que cambiar la fase relativa de la segunda amplitud sin alterar su módulo.', nextStep: 'Busca una puerta diagonal que aplique i solo a |1⟩.' },
      en: { title: 'Phase does not change magnitudes', guidance: 'H creates |+⟩. To reach |+i⟩, change the relative phase of the second amplitude without changing its magnitude.', nextStep: 'Find a diagonal gate that applies i only to |1⟩.' },
    },
    2: {
      es: { title: 'Puerta de fase S', guidance: 'La puerta S = diag(1, i) convierte [1/√2, 1/√2] en [1/√2, i/√2]. En PennyLane se escribe `qml.S`.', nextStep: 'Coloca S después de H, no antes.' },
      en: { title: 'The S phase gate', guidance: 'The S gate, diag(1, i), changes [1/√2, 1/√2] into [1/√2, i/√2]. In PennyLane it is `qml.S`.', nextStep: 'Place S after H, not before it.' },
    },
    3: {
      es: { title: 'Añade S y observa la parte imaginaria', guidance: 'El vector correcto tiene una segunda componente con parte imaginaria positiva. No basta con que las probabilidades Z sean iguales.', nextStep: 'Añade S y comprueba que la amplitud de |1⟩ contiene +i.' },
      en: { title: 'Add S and inspect the imaginary part', guidance: 'The correct vector has a positive imaginary part in its second component. Equal Z probabilities alone are not enough.', nextStep: 'Add S and confirm the |1⟩ amplitude contains +i.' },
    },
  },
  'puertas-monoqubit-1': {
    1: {
      es: { title: 'Sigue la transformación en orden', guidance: 'Primero X convierte |0⟩ en |1⟩. Después H convierte |1⟩ en |−⟩.', nextStep: 'Aplica las puertas una a una al estado inicial.' },
      en: { title: 'Follow the transformations in order', guidance: 'First X changes |0⟩ into |1⟩. Then H changes |1⟩ into |−⟩.', nextStep: 'Apply the gates one at a time to the initial state.' },
    },
    2: {
      es: { title: 'Orden de puertas en PennyLane', guidance: 'Usa `qml.PauliX(wires=0)` antes de `qml.Hadamard(wires=0)`. El orden importa: primero X convierte |0⟩ en |1⟩ y después H crea |−⟩.', nextStep: 'No inviertas el orden; comprueba la amplitud negativa de |1⟩.' },
      en: { title: 'Gate order in PennyLane', guidance: 'Use `qml.PauliX(wires=0)` before `qml.Hadamard(wires=0)`. Order matters: X first changes |0⟩ into |1⟩, then H creates |−⟩.', nextStep: 'Keep that order and inspect the negative |1⟩ amplitude.' },
    },
    3: {
      es: { title: 'Busca el signo negativo', guidance: 'El vector de |−⟩ es [1/√2, −1/√2]. El signo distingue |−⟩ de |+⟩, aunque ambos den 50/50 al medir en Z.', nextStep: 'Añade X antes de H y revisa la segunda amplitud.' },
      en: { title: 'Look for the negative sign', guidance: 'The |−⟩ vector is [1/√2, −1/√2]. Its sign distinguishes it from |+⟩, even though both give 50/50 in Z.', nextStep: 'Add X before H and inspect the second amplitude.' },
    },
  },
  'puertas-rotacion-fase': {
    1: {
      es: { title: 'Resuelve el ángulo', guidance: 'Para Ry(θ)|0⟩, p0 = cos²(θ/2). Igualar p0 a 3/4 da cos(θ/2)=√3/2.', nextStep: 'Encuentra el ángulo entre 0 y π que satisface esa igualdad.' },
      en: { title: 'Solve for the angle', guidance: 'For Ry(θ)|0⟩, p0 = cos²(θ/2). Setting p0 to 3/4 gives cos(θ/2)=√3/2.', nextStep: 'Find the angle between 0 and π that satisfies this.' },
    },
    2: {
      es: { title: 'Usa radianes', guidance: 'El ángulo buscado es π/3 radianes. La rotación actúa sobre |0⟩ y después se obtiene p0 como |state[0]|².', nextStep: 'Pasa θ al método Ry del SDK seleccionado.' },
      en: { title: 'Use radians', guidance: 'The angle is π/3 radians. Rotate |0⟩, then compute p0 as |state[0]|².', nextStep: 'Pass θ to the selected SDK’s Ry operation.' },
    },
    3: {
      es: { title: 'Comprueba la salida numérica', guidance: 'Con θ=π/3, la amplitud de |0⟩ es cos(π/6)=√3/2. Al elevarla al cuadrado obtienes 0,75.', nextStep: 'Define θ=π/3 y ejecuta de nuevo.' },
      en: { title: 'Check the numeric result', guidance: 'At θ=π/3, the |0⟩ amplitude is cos(π/6)=√3/2. Squaring it gives 0.75.', nextStep: 'Set θ=π/3 and run again.' },
    },
  },
  'medida-y-colapso': {
    1: {
      es: { title: 'La medición es estadística', guidance: 'H prepara un qubit con probabilidad 1/2 para cada resultado. Mil disparos no producen necesariamente 500 ceros exactos.', nextStep: 'Prepara primero la superposición y luego mide repetidamente.' },
      en: { title: 'Measurement is statistical', guidance: 'H prepares a qubit with probability 1/2 for each outcome. One thousand shots will not necessarily produce exactly 500 zeros.', nextStep: 'Prepare the superposition first, then measure repeatedly.' },
    },
    2: {
      es: { title: 'Cuenta los dos resultados', guidance: 'PennyLane devuelve muestras de Pauli Z como +1 para |0⟩ y −1 para |1⟩. Convierte cada signo en su resultado y suma los conteos.', nextStep: 'Asegura 1000 disparos y comprueba que ambos conteos suman 1000.' },
      en: { title: 'Count both outcomes', guidance: 'PennyLane returns Pauli-Z samples as +1 for |0⟩ and −1 for |1⟩. Convert each sign into its outcome and add the counts.', nextStep: 'Use 1000 shots and check that both counts sum to 1000.' },
    },
    3: {
      es: { title: 'Usa una tolerancia razonable', guidance: 'La frecuencia de ceros debe estar cerca de 0,5; un margen entre 0,4 y 0,6 es razonable para 1000 disparos.', nextStep: 'Añade H, ejecuta 1000 veces y comprueba ambos conteos.' },
      en: { title: 'Allow reasonable variation', guidance: 'The zero frequency should be near 0.5; a range from 0.4 to 0.6 is reasonable for 1000 shots.', nextStep: 'Add H, run 1000 shots, and check both counts.' },
    },
  },
};

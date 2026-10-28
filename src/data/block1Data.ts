import { Lesson, QuizQuestion, MiniProject } from '../types/block';

export const LESSONS_BLOCK_1: Lesson[] = [
  {
    id: 'l1',
    slug: 'bit-vs-qubit',
    title: {
      es: '1. El Bit Clásico vs. El Qubit',
      en: '1. Classical Bit vs. The Qubit'
    },
    subtitle: {
      es: 'Lógica binaria, superposición y notación de Dirac (Bra-Ket)',
      en: 'Binary logic, superposition, and Dirac Bra-Ket notation'
    },
    durationMinutes: 20,
    xpReward: 50,
    contentMarkdown: {
      es: String.raw`### 1. Lógica Clásica vs. Mecánica Cuántica
En la informática clásica, la unidad fundamental de información es el **bit**, el cual está restringido a dos estados discretos $x \in \{0, 1\}$.

En cambio, un **qubit** (quantum bit) es un sistema físico de dos niveles. Matemáticamente, el estado de un qubit no reside en un conjunto discreto, sino en un **Espacio de Hilbert complejo bidimensional ($\mathbb{C}^2$)**.

### 2. Notación de Dirac (Bra-Ket)
La base computacional ortonormal en $\mathbb{C}^2$ viene dada por los vectores columna:

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

El vector "Bra" $\langle\psi|$ es el transpuesto conjugado del "Ket" $|\psi\rangle$: $\langle\psi| = (|\psi\rangle)^\dagger$.

### 3. El Principio de Superposición Lineal
Cualquier estado puro $|\psi\rangle$ se expresa como una combinación lineal de los estados de la base:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle \quad \text{con } \alpha, \beta \in \mathbb{C}$$

Donde $\alpha$ y $\beta$ son las **amplitudes de probabilidad** complejas. Un estado físico válido está normalizado: $|\alpha|^2+|\beta|^2=1$. La normalización no dice que las amplitudes sean probabilidades: primero se toma su módulo al cuadrado.

### 4. ¿Qué significa superposición?
Una superposición no es un qubit que ya contiene dos bits clásicos que podemos leer a la vez. Es una descripción coherente que permite interferencia entre amplitudes. Al medir en la base computacional se obtiene un único resultado, 0 o 1, y la regla de Born asigna las probabilidades. Por ejemplo, $|+\rangle=(|0\rangle+|1\rangle)/\sqrt{2}$ produce cada resultado con probabilidad $1/2$.

Ser una superposición es algo **relativo a una base**, no una propiedad absoluta del estado. Los estados $|+\rangle$ y $|−\rangle$ son superposiciones respecto a la base $Z$, pero son resultados definidos en la base $X$. Aplicar una puerta antes de medir en $Z$ equivale a medir en otra base.

### 5. Kets, bras y productos internos
Un ket es un vector columna; su bra asociado se obtiene conjugando y transponiendo. El producto interno $\langle\phi|\psi\rangle$ es un número complejo y su módulo al cuadrado da la probabilidad de proyectar $|\psi\rangle$ sobre $|\phi\rangle$. La ortogonalidad $\langle0|1\rangle=0$ expresa que los resultados de la base computacional son perfectamente distinguibles. Dos estados no ortogonales, como $|0\rangle$ y $|+\rangle$, no pueden distinguirse con certeza mediante ninguna medida.

**Idea clave:** las amplitudes conservan información de fase necesaria para predecir interferencia; una medición concreta solo entrega un resultado clásico.`,
      en: String.raw`### 1. Classical Logic vs. Quantum Mechanics
In classical computing, the fundamental unit of information is the **bit**, restricted to discrete states $x \in \{0, 1\}$.

In contrast, a **qubit** is a two-level quantum system. Mathematically, its state lives in a **two-dimensional complex Hilbert Space ($\mathbb{C}^2$)**.

### 2. Dirac Notation (Bra-Ket)
The computational orthonormal basis in $\mathbb{C}^2$ is formed by:

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \quad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

The "bra" $\langle\psi|$ is the conjugate transpose of the "ket" $|\psi\rangle$: $\langle\psi| = (|\psi\rangle)^\dagger$.

### 3. Principle of Linear Superposition
Any pure state $|\psi\rangle$ is a linear combination of the basis states:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle \quad \text{with } \alpha, \beta \in \mathbb{C}$$

$\alpha$ and $\beta$ are complex **probability amplitudes**. A valid physical state is normalized: $|\alpha|^2+|\beta|^2=1$. Normalization does not mean amplitudes are probabilities: you first take their squared magnitude.

### 4. What does superposition mean?
A superposition is not a qubit that stores two readable classical bits at once. It is a coherent description that permits interference between amplitudes. A computational-basis measurement returns one result, 0 or 1, with probabilities given by Born's rule. For example, $|+\rangle=(|0\rangle+|1\rangle)/\sqrt{2}$ gives each result probability $1/2$.

Being a superposition is **relative to a basis**, not an absolute property of the state. $|+\rangle$ and $|−\rangle$ are superpositions relative to the $Z$ basis but definite outcomes in the $X$ basis. Applying a gate before a $Z$ measurement is equivalent to measuring in another basis.

### 5. Kets, bras, and inner products
A ket is a column vector; its bra is its conjugate transpose. The inner product $\langle\phi|\psi\rangle$ is a complex number, and its squared magnitude is the probability of projecting $|\psi\rangle$ onto $|\phi\rangle$. Orthogonality, $\langle0|1\rangle=0$, means the computational-basis outcomes are perfectly distinguishable. Two non-orthogonal states, such as $|0\rangle$ and $|+\rangle$, cannot be told apart with certainty by any measurement.

**Key idea:** amplitudes preserve phase information needed to predict interference; an individual measurement returns one classical result.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 1: Crear e inspeccionar el estado inicial |0⟩',
        en: 'Exercise 1: Initialize and inspect state |0⟩'
      },
      description: {
        es: 'Escribe un circuito de 1 qubit en PennyLane e imprime en consola el estado inicial |0⟩ = [1, 0]ᵀ.',
        en: 'Write a 1-qubit circuit and print the initial state |0⟩ = [1, 0]ᵀ in the console.'
      },
      targetGoal: {
        es: 'Ejecutar el código para confirmar el vector de estado inicial.',
        en: 'Run code to confirm initial statevector output.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 1: Estado Inicial en PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: corrige esta puerta para que el circuito devuelva |0>.
    qml.PauliX(wires=0)
    return qml.state()

state = circuit()
print("--- Vector de Estado Inicial ---")
print("α (|0>):", state[0])
print("β (|1>):", state[1])

_result = "Estado inicial |0> verificado"
`,
          en: `# --- EXERCISE 1: Initial State in PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: fix this gate so the circuit returns |0>.
    qml.PauliX(wires=0)
    return qml.state()

state = circuit()
print("--- Initial State Vector ---")
print("α (|0>):", state[0])
print("β (|1>):", state[1])

_result = "Initial state |0> verified"
`,
        },
      }
    },
    bibliography: [
      {
        title: "Quantum Computation and Quantum Information",
        author: "Michael A. Nielsen & Isaac L. Chuang",
        year: "2010",
        publisher: "Cambridge University Press",
        note: {
          es: "Capítulo 1: Introducción a qubits, notación Bra-Ket y espacios de Hilbert.",
          en: "Chapter 1: Introduction to qubits, Bra-Ket notation, and Hilbert spaces."
        }
      },
      {
        title: "Xanadu Quantum Codebook",
        author: "Xanadu",
        year: "2024",
        publisher: "Xanadu",
        link: "https://codebook.xanadu.ai/",
        note: {
          es: "Módulo I: Single-qubit states y PennyLane basics.",
          en: "Module I: Single-qubit states and PennyLane basics."
        }
      }
    ]
  },
  {
    id: 'l2',
    slug: 'vector-estado-born',
    title: {
      es: '2. Vector de Estado y Regla de Born',
      en: '2. State Vector and Born Rule'
    },
    subtitle: {
      es: 'Amplitudes complejas, probabilidad y condición de normalización',
      en: 'Complex amplitudes, probability, and normalization condition'
    },
    durationMinutes: 25,
    xpReward: 60,
    contentMarkdown: {
      es: String.raw`### 1. La Regla de Max Born (1926)
Al medir un qubit en la base computacional $\{|0\rangle, |1\rangle\}$, la probabilidad $P(x)$ de obtener el resultado $x$ viene dada por:

$$P(0) = |\alpha|^2 = \alpha \cdot \alpha^*, \quad P(1) = |\beta|^2 = \beta \cdot \beta^*$$

### 2. Condición de Normalización
La suma de probabilidades de todos los resultados posibles debe ser 1 (100%):

$$|\alpha|^2 + |\beta|^2 = 1 \quad \Longleftrightarrow \quad \langle\psi|\psi\rangle = 1$$

Esta restricción exige que todo vector de estado válido tenga norma unitaria en $\mathbb{C}^2$.

### 3. Amplitudes complejas: fase y módulo
Si $\alpha=a+ib$, entonces $|\alpha|^2=\alpha^*\alpha=a^2+b^2$. Un error típico es calcular $\alpha^2=(a+ib)^2=a^2-b^2+2iab$, que en general es complejo: sin el conjugado no se obtiene una probabilidad. El resultado correcto siempre es real y no negativo. Por ejemplo, para $\alpha=i/\sqrt{2}$: $|\alpha|^2=1/2$, mientras que $\alpha^2=-1/2$. Las probabilidades no revelan por sí solas la fase, pero la fase puede cambiar el resultado después de una puerta que recombine las amplitudes.

**Ejemplo.** Para $|\psi\rangle=(|0\rangle+i|1\rangle)/\sqrt{2}$, las dos probabilidades en $Z$ son $1/2$. Esto no implica que el estado sea idéntico a $|+\rangle$: al cambiar de base, la fase relativa produce resultados distintos.

### 4. Predicción frente a resultado individual
La regla de Born predice la distribución de resultados para preparaciones idénticas. Una medición individual es aleatoria cuando hay varias salidas posibles. Repetir el experimento muchas veces permite estimar probabilidades, pero con un número finito de muestras la frecuencia observada fluctúa.

### 5. Método de cálculo
1. Identifica la amplitud correspondiente al resultado que buscas.
2. Calcula su módulo complejo y después elévalo al cuadrado.
3. Comprueba que todas las probabilidades suman 1; si no lo hacen, revisa la normalización o el cálculo.

No confundas amplitud con probabilidad: una amplitud puede ser negativa o compleja, mientras que una probabilidad siempre pertenece a $[0,1]$.`,
      en: String.raw`### 1. Max Born Rule (1926)
Upon measuring a qubit in basis $\{|0\rangle, |1\rangle\}$, the probability $P(x)$ is given by:

$$P(0) = |\alpha|^2 = \alpha \cdot \alpha^*, \quad P(1) = |\beta|^2 = \beta \cdot \beta^*$$

### 2. Normalization Condition
The total probability sum must equal 1:

$$|\alpha|^2 + |\beta|^2 = 1 \quad \Longleftrightarrow \quad \langle\psi|\psi\rangle = 1$$

### 3. Complex amplitudes: magnitude and phase
If $\alpha=a+ib$, then $|\alpha|^2=\alpha^*\alpha=a^2+b^2$. A common mistake is computing $\alpha^2=(a+ib)^2=a^2-b^2+2iab$, which is generally complex: without the conjugate you do not get a probability. The correct result is always real and nonnegative. For example, with $\alpha=i/\sqrt{2}$: $|\alpha|^2=1/2$, whereas $\alpha^2=-1/2$. Probabilities alone do not reveal phase, but phase can change outcomes after a gate recombines amplitudes.

**Example.** For $|\psi\rangle=(|0\rangle+i|1\rangle)/\sqrt{2}$, both $Z$ probabilities are $1/2$. This does not make it the same state as $|+\rangle$: in another basis the relative phase changes the outcome distribution.

### 4. Prediction versus an individual result
Born's rule predicts the outcome distribution for identically prepared systems. An individual measurement is random when multiple outcomes are possible. Repeating the experiment estimates probabilities, but finite samples fluctuate.

### 5. A calculation routine
1. Identify the amplitude for the outcome of interest.
2. Compute its complex magnitude, then square it.
3. Check that all outcome probabilities sum to 1; otherwise review normalization or arithmetic.

Do not confuse amplitude with probability: amplitudes can be negative or complex, while probabilities lie in $[0,1]$.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 2: Crear el Estado Equiprobable |+⟩',
        en: 'Exercise 2: Create Equal Superposition |+⟩'
      },
      description: {
        es: 'Aplica una puerta Hadamard H sobre |0⟩ para generar |+⟩ = 1/√2 |0⟩ + 1/√2 |1⟩ y comprueba que P(|0⟩) = 0.5 y P(|1⟩) = 0.5.',
        en: 'Apply a Hadamard gate H on |0⟩ to produce |+⟩ and verify P(|0⟩) = 0.5 and P(|1⟩) = 0.5.'
      },
      targetGoal: {
        es: 'Verificar P(|0⟩) = 0.5000 en la consola.',
        en: 'Verify P(|0⟩) = 0.5000 in output.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 2: Regla de Born en PennyLane ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: aplica la puerta que crea superposición equiprobable.
    return qml.state()

state = circuit()
p0 = np.abs(state[0])**2
p1 = np.abs(state[1])**2

print(f"Estado |+>: {state}")
print(f"P(|0>): {p0:.4f}, P(|1>): {p1:.4f}")

_result = f"P0={p0:.2f}"
`,
          en: `# --- EXERCISE 2: Born Rule in PennyLane ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: apply the gate that creates an equal superposition.
    return qml.state()

state = circuit()
p0 = np.abs(state[0])**2
p1 = np.abs(state[1])**2

print(f"State |+>: {state}")
print(f"P(|0>): {p0:.4f}, P(|1>): {p1:.4f}")

_result = f"P0={p0:.2f}"
`,
        },
      }
    },
    bibliography: [
      {
        title: "Quantum Mechanics: Concepts and Applications",
        author: "Nouredine Zettili",
        year: "2009",
        publisher: "Wiley",
        note: {
          es: "Capítulo 3: Postulados de la mecánica cuántica y mediciones.",
          en: "Chapter 3: Postulates of quantum mechanics and measurements."
        }
      }
    ]
  },
  {
    id: 'l3',
    slug: 'esfera-de-bloch',
    title: {
      es: '3. La Esfera de Bloch y Fase Relativa',
      en: '3. Bloch Sphere and Relative Phase'
    },
    subtitle: {
      es: 'Parametrización geométrica (θ, φ) y la diferencia con la fase global',
      en: 'Geometric parametrization (θ, φ) and global vs relative phase'
    },
    durationMinutes: 30,
    xpReward: 70,
    contentMarkdown: {
      es: String.raw`### 1. Representación en la Esfera de Bloch
Todo estado puro de qubit, **salvo una fase global**, se parametriza mediante dos ángulos reales $\theta \in [0, \pi]$ y $\phi \in [0, 2\pi)$:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

### 2. Fase Global vs. Fase Relativa
- **Fase Global $e^{i\gamma}$:** No afecta ninguna probabilidad observable ($|e^{i\gamma}|^2 = 1$).
- **Fase Relativa $e^{i\phi}$:** Modifica la posición en el ecuador y produce interferencia cuántica observable.

### 3. Coordenadas y significado geométrico
El vector de Bloch asociado al estado anterior tiene coordenadas $x=\sin\theta\cos\phi$, $y=\sin\theta\sin\phi$ y $z=\cos\theta$. El polo norte representa $|0\rangle$ y el polo sur $|1\rangle$. El ecuador contiene estados con probabilidades iguales en la base $Z$; cambia la fase relativa al recorrerlo.

Los estados $|+\rangle$ y $|−\rangle$ apuntan a $+X$ y $−X$; $|+i\rangle$ y $|−i\rangle$ apuntan a $+Y$ y $−Y$. Así, la esfera resume las medias de las observables de Pauli: $x=\langle X\rangle$, $y=\langle Y\rangle$, $z=\langle Z\rangle$.

**¿Por qué $\theta/2$?** En el vector de estado aparece el medio ángulo, de modo que estados **ortogonales** quedan en puntos **opuestos** de la esfera: $|0\rangle$ y $|1\rangle$ están a $180^\circ$ en la esfera aunque como vectores formen $90^\circ$. Por eso un punto y su antípoda son siempre una base de medida.

### 4. Por qué la fase relativa se puede observar
Una fase global, como $e^{i\gamma}|\psi\rangle$, multiplica todas las componentes y no cambia predicciones. Una fase relativa solo multiplica una componente respecto a otra. La puerta $S=\mathrm{diag}(1,i)$ convierte $|+\rangle$ en $|+i\rangle$: las probabilidades en $Z$ siguen siendo iguales, pero una medición en $Y$ ahora es determinista. La interferencia convierte esa fase en una diferencia medible.

La esfera de Bloch representa estados **puros** de un qubit. Mezclas estadísticas, como preparar $|0\rangle$ o $|1\rangle$ al azar, ocupan el interior de la esfera y requieren una matriz densidad para describirse completamente.`,
      en: String.raw`### 1. Bloch Sphere Parametrization
Every pure qubit state, **up to a global phase**, is parametrized by two real angles $\theta \in [0, \pi]$ and $\phi \in [0, 2\pi)$:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

### 2. Global vs Relative Phase
- **Global Phase $e^{i\gamma}$:** Physically unobservable.
- **Relative Phase $e^{i\phi}$:** Determines quantum interference.

### 3. Coordinates and geometry
The Bloch vector has coordinates $x=\sin\theta\cos\phi$, $y=\sin\theta\sin\phi$, and $z=\cos\theta$. The north pole is $|0\rangle$ and the south pole is $|1\rangle$. The equator contains states with equal probabilities in the $Z$ basis; their relative phase changes around the equator.

$|+\rangle$ and $|−\rangle$ point along $+X$ and $−X$; $|+i\rangle$ and $|−i\rangle$ point along $+Y$ and $−Y$. The coordinates equal the expectation values $\langle X\rangle$, $\langle Y\rangle$, and $\langle Z\rangle$.

**Why $\theta/2$?** The state vector uses the half angle, so **orthogonal** states sit at **opposite** points of the sphere: $|0\rangle$ and $|1\rangle$ are $180^\circ$ apart on the sphere even though as vectors they are at $90^\circ$. A point and its antipode therefore always form a measurement basis.

### 4. Why relative phase is observable
A global phase, $e^{i\gamma}|\psi\rangle$, multiplies every component and changes no prediction. A relative phase changes one component relative to another. The phase gate $S=\mathrm{diag}(1,i)$ turns $|+\rangle$ into $|+i\rangle$: their $Z$ probabilities stay equal, but a $Y$ measurement becomes deterministic. Interference makes that phase measurable.

The Bloch sphere represents **pure** one-qubit states. Statistical mixtures lie inside the sphere and require a density matrix for a complete description.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 3: Construir el Estado |+i⟩',
        en: 'Exercise 3: Construct State |+i⟩'
      },
      description: {
        es: 'Aplica Hadamard H seguido de la puerta S para rotar φ = π/2 y generar |+i⟩ = 1/√2 |0⟩ + i/√2 |1⟩.',
        en: 'Apply Hadamard H followed by phase gate S to yield |+i⟩ = 1/√2 |0⟩ + i/√2 |1⟩.'
      },
      targetGoal: {
        es: 'Verificar la fase imaginaria +i en el componente |1⟩.',
        en: 'Verify imaginary phase +i on state |1⟩.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 3: Estado |+i> en PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: añade la puerta de fase que produce +i.
    return qml.state()

state = circuit()
print("Vector de Estado |+i>:", state)

_result = "Estado |+i> creado"
`,
          en: `# --- EXERCISE 3: State |+i> in PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: add the phase gate that produces +i.
    return qml.state()

state = circuit()
print("State vector |+i>:", state)

_result = "State |+i> created"
`,
        },
      }
    },
    bibliography: [
      {
        title: "Preskill Lecture Notes for Physics 219: Quantum Computation",
        author: "John Preskill",
        year: "2020",
        publisher: "Caltech",
        link: "https://preskill.caltech.edu/ph219/",
        note: {
          es: "Capítulo 2 (Foundations I): estados, el qubit y la esfera de Bloch.",
          en: "Chapter 2 (Foundations I): states, the qubit, and the Bloch sphere."
        }
      }
    ]
  },
  {
    id: 'l4',
    slug: 'puertas-monoqubit-1',
    title: {
      es: '4. Puertas Mono-Qubit I: X, Y, Z y Hadamard',
      en: '4. Single-Qubit Gates I: X, Y, Z, and Hadamard'
    },
    subtitle: {
      es: 'Transformaciones unitarias fundamentales y matrices de Pauli',
      en: 'Fundamental unitary transformations and Pauli matrices'
    },
    durationMinutes: 25,
    xpReward: 65,
    contentMarkdown: {
      es: String.raw`### 1. Puertas Unitarias $U(2)$
Toda puerta cuántica de 1 qubit es una matriz unitaria $2 \times 2$ tal que $U^\dagger U = I$.

### 2. Las Matrices de Pauli y Hadamard

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \quad H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

### 3. Qué hacen sobre los estados
$X$ intercambia $|0\rangle$ y $|1\rangle$ (un NOT cuántico). $Z$ conserva las poblaciones pero invierte la fase de $|1\rangle$. $Y$ combina inversión y fase. Por eso $Z|+\rangle=|−\rangle$: aunque una medición inmediata en $Z$ no distingue ambos estados, una medición en $X$ sí.

Hadamard cambia entre las bases computacional y diagonal: $H|0\rangle=|+\rangle$, $H|1\rangle=|−\rangle$, $H|+\rangle=|0\rangle$ y $H|−\rangle=|1\rangle$. Además $H^2=I$, así que aplicarla dos veces deshace su efecto.

**Lectura geométrica.** En la esfera de Bloch, $X$, $Y$ y $Z$ son giros de $180^\circ$ alrededor de sus ejes, y $H$ es un giro de $180^\circ$ alrededor del eje diagonal entre $X$ y $Z$; por eso intercambia los polos con $\pm X$. De ahí salen identidades útiles: $HZH=X$ y $HXH=Z$. Por ejemplo, $Y|0\rangle=i|1\rangle$: el mismo punto que $|1\rangle$ en la esfera, porque $i$ es una fase global.

### 4. Unitariedad y orden
La condición $U^\dagger U=I$ garantiza que la puerta conserva la norma y las probabilidades totales. La inversa es $U^\dagger$. No todas las puertas conmutan: el orden de un circuito es el orden real de aplicación, y la matriz situada más a la derecha actúa primero cuando se escribe un producto algebraico.

Para comprobar una secuencia, aplica cada matriz al vector actual y conserva las fases; mirar solo las probabilidades intermedias puede ocultar diferencias que reaparecen al interferir.`,
      en: String.raw`### 1. Unitary Gates $U(2)$
Every 1-qubit gate is a $2 \times 2$ unitary matrix satisfying $U^\dagger U = I$.

### 2. Pauli and Hadamard Matrices

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \quad H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

### 3. Action on basis states
$X$ swaps $|0\rangle$ and $|1\rangle$ (a quantum NOT). $Z$ preserves populations but flips the phase of $|1\rangle$. $Y$ combines a bit flip and phase. Thus $Z|+\rangle=|−\rangle$: an immediate $Z$ measurement cannot distinguish them, but an $X$ measurement can.

Hadamard changes between computational and diagonal bases: $H|0\rangle=|+\rangle$, $H|1\rangle=|−\rangle$, $H|+\rangle=|0\rangle$, and $H|−\rangle=|1\rangle$. Since $H^2=I$, applying it twice undoes its action.

**Geometric reading.** On the Bloch sphere, $X$, $Y$, and $Z$ are $180^\circ$ turns about their axes, and $H$ is a $180^\circ$ turn about the diagonal axis between $X$ and $Z$, which is why it swaps the poles with $\pm X$. Useful identities follow: $HZH=X$ and $HXH=Z$. For example, $Y|0\rangle=i|1\rangle$: the same point as $|1\rangle$ on the sphere, because $i$ is a global phase.

### 4. Unitarity and order
$U^\dagger U=I$ guarantees that a gate preserves norm and total probability. Its inverse is $U^\dagger$. Gates do not all commute: circuit order matters, and in a matrix product the rightmost matrix acts first.

To analyze a sequence, apply each matrix to the current vector and retain phase. Looking only at intermediate probabilities can hide differences that reappear through interference.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 4: Construir el estado |->',
        en: 'Exercise 4: Construct state |->'
      },
      description: {
        es: 'Aplica X seguido de H (H|1⟩ = |->) y comprueba la amplitud negativa en |1⟩: [0.7071, -0.7071].',
        en: 'Apply X followed by H (H|1⟩ = |->) and verify negative amplitude on |1⟩.'
      },
      targetGoal: {
        es: 'Comprobar el signo negativo en el terminal.',
        en: 'Check negative sign in output.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 4: Estado |-> en PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: invierte |0> antes de aplicar Hadamard.
    qml.Hadamard(wires=0)
    return qml.state()

state = circuit()
print("Vector de Estado |->:", state)

_result = "Estado |-> verificado"
`,
          en: `# --- EXERCISE 4: State |-> in PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    # TODO: flip |0> before applying Hadamard.
    qml.Hadamard(wires=0)
    return qml.state()

state = circuit()
print("State vector |->:", state)

_result = "State |-> verified"
`,
        },
      }
    },
    bibliography: [
      {
        title: "IBM Quantum Learning: Single Qubit Gates",
        author: "IBM Quantum",
        year: "2024",
        publisher: "IBM",
        link: "https://learning.quantum.ibm.com/",
        note: {
          es: "Guía interactiva sobre puertas de Pauli y transformaciones de base.",
          en: "Interactive guide on Pauli gates and basis transformations."
        }
      }
    ]
  },
  {
    id: 'l5',
    slug: 'puertas-rotacion-fase',
    title: {
      es: '5. Rotaciones Continuas (Ry, Rz) y Puertas de Fase S, T',
      en: '5. Continuous Rotations (Ry, Rz) and Phase Gates S, T'
    },
    subtitle: {
      es: 'Control continuo del qubit sobre la Esfera de Bloch',
      en: 'Continuous qubit control over the Bloch Sphere'
    },
    durationMinutes: 30,
    xpReward: 75,
    contentMarkdown: {
      es: String.raw`### 1. Rotaciones Paramétricas
Las puertas de rotación continua permiten mover el vector cualquier ángulo $\theta \in \mathbb{R}$:

$$R_y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

Al aplicar $R_y(\theta)$ sobre $|0\rangle$:

$$R_y(\theta)|0\rangle = \cos(\theta/2)|0\rangle + \sin(\theta/2)|1\rangle$$

### 2. Rotación alrededor de Z y fases
Con la convención habitual, $R_z(\phi)=\mathrm{diag}(e^{-i\phi/2},e^{i\phi/2})$. Al actuar sobre $|0\rangle$, solo aparece una fase global; por eso medir inmediatamente en Z no revela la rotación. Sobre una superposición sí cambia la fase **relativa** entre componentes y puede observarse después de una interferencia.

Las puertas $S=\mathrm{diag}(1,i)$ y $T=\mathrm{diag}(1,e^{i\pi/4})$ son rotaciones de fase (equivalentes a $R_z(\pi/2)$ y $R_z(\pi/4)$ salvo fase global). Son diagonales: no cambian las probabilidades en Z de inmediato, pero sí la orientación en el ecuador de Bloch.

### 3. Ángulos, signos e inversas
Para $R_y(\theta)|0\rangle$, las probabilidades son $P(0)=\cos^2(\theta/2)$ y $P(1)=\sin^2(\theta/2)$. El parámetro $\theta$ **es** el ángulo de giro en la esfera de Bloch: $R_y(\theta)|0\rangle$ queda con ángulo polar $\theta$. Es en las **amplitudes** donde aparece la mitad, $\theta/2$. La puerta inversa es $R_y(-\theta)$; en general, sumar $2\pi$ cambia el vector por una fase global $-1$, mientras que $4\pi$ lo devuelve exactamente.

No confundas el ángulo de giro con el que aparece en las amplitudes: el medio ángulo surge porque los vectores de estado representan las rotaciones con un recubrimiento doble (un giro de $2\pi$ devuelve el estado con signo $-1$).

### 4. Forma general de las rotaciones
Las tres rotaciones se escriben igual, $R_x(\theta)=e^{-i\theta X/2}$, $R_y(\theta)=e^{-i\theta Y/2}$ y $R_z(\theta)=e^{-i\theta Z/2}$, y giran el vector de Bloch un ángulo $\theta$ alrededor del eje correspondiente. Por ejemplo:

$$R_x(\theta) = \begin{pmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

Cualquier puerta de un qubit puede escribirse, salvo fase global, como una composición de rotaciones, por ejemplo $R_z(\alpha)R_y(\beta)R_z(\gamma)$. Las puertas de Pauli son casos particulares: $X=iR_x(\pi)$, $Y=iR_y(\pi)$ y $Z=iR_z(\pi)$.`,
      en: String.raw`### 1. Parametric Rotations
Continuous rotation gates move the vector by any angle $\theta \in \mathbb{R}$:

$$R_y(\theta) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

### 2. Z rotations and phase
With the usual convention, $R_z(\phi)=\mathrm{diag}(e^{-i\phi/2},e^{i\phi/2})$. On $|0\rangle$ it adds only a global phase, so an immediate Z measurement cannot reveal it. On a superposition it changes the **relative** phase and can be detected after interference.

The gates $S=\mathrm{diag}(1,i)$ and $T=\mathrm{diag}(1,e^{i\pi/4})$ are phase rotations (equivalent to $R_z(\pi/2)$ and $R_z(\pi/4)$ up to global phase). They are diagonal: they do not immediately change Z probabilities, but they rotate the Bloch vector around its Z axis.

### 3. Angles, signs, and inverses
For $R_y(\theta)|0\rangle$, $P(0)=\cos^2(\theta/2)$ and $P(1)=\sin^2(\theta/2)$. The parameter $\theta$ **is** the rotation angle on the Bloch sphere: $R_y(\theta)|0\rangle$ ends up at polar angle $\theta$. The half angle $\theta/2$ appears in the **amplitudes**. The inverse is $R_y(-\theta)$; adding $2\pi$ changes the state vector by global phase $-1$, while $4\pi$ returns it exactly.

Do not confuse the rotation angle with the one in the amplitudes: the half angle appears because state vectors represent rotations as a double cover (a $2\pi$ turn returns the state with sign $-1$).

### 4. General form of rotations
All three rotations share the same form, $R_x(\theta)=e^{-i\theta X/2}$, $R_y(\theta)=e^{-i\theta Y/2}$, and $R_z(\theta)=e^{-i\theta Z/2}$, and turn the Bloch vector by $\theta$ about the corresponding axis. For example:

$$R_x(\theta) = \begin{pmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

Any single-qubit gate can be written, up to global phase, as a composition of rotations such as $R_z(\alpha)R_y(\beta)R_z(\gamma)$. The Pauli gates are special cases: $X=iR_x(\pi)$, $Y=iR_y(\pi)$, and $Z=iR_z(\pi)$.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 5: Fijar P(|0⟩) = 0.75 con Ry(θ)',
        en: 'Exercise 5: Set P(|0⟩) = 0.75 with Ry(θ)'
      },
      description: {
        es: 'Elige el ángulo θ de Ry(θ) para que, partiendo de |0⟩, la probabilidad de medir 0 sea P(0) = 0.75. Usa P(0) = cos²(θ/2).',
        en: 'Choose the angle θ of Ry(θ) so that, starting from |0⟩, the probability of measuring 0 is P(0) = 0.75. Use P(0) = cos²(θ/2).'
      },
      targetGoal: {
        es: 'Obtener P(|0⟩) = 0.7500 en la consola.',
        en: 'Obtain P(|0⟩) = 0.7500 in output.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 5: Rotación Ry en PennyLane ---
import pennylane as qml
import numpy as np

# TODO: elige θ para obtener P(|0>) = 0.75.
theta = 0

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.RY(theta, wires=0)
    return qml.state()

state = circuit()
p0 = np.abs(state[0])**2
print(f"P(|0>): {p0:.4f}")

_result = f"P0={p0:.4f}"
`,
          en: `# --- EXERCISE 5: Ry Rotation in PennyLane ---
import pennylane as qml
import numpy as np

# TODO: choose θ to get P(|0>) = 0.75.
theta = 0

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def circuit():
    qml.RY(theta, wires=0)
    return qml.state()

state = circuit()
p0 = np.abs(state[0])**2
print(f"P(|0>): {p0:.4f}")

_result = f"P0={p0:.4f}"
`,
        },
      }
    },
    bibliography: [
      {
        title: "Principles of Quantum Computation and Information",
        author: "G. Benenti, G. Casati, G. Strini",
        year: "2004",
        publisher: "World Scientific",
        note: {
          es: "Volumen I: introducción a la mecánica cuántica para computación y puertas de un qubit.",
          en: "Volume I: introductory quantum mechanics for computing and single-qubit gates."
        }
      }
    ]
  },
  {
    id: 'l6',
    slug: 'medida-y-colapso',
    title: {
      es: '6. Medida Cuántica y Colapso del Estado',
      en: '6. Quantum Measurement and State Collapse'
    },
    subtitle: {
      es: 'Transición irreversible y estadísticas por disparos (shots)',
      en: 'Irreversible transition and shot statistics'
    },
    durationMinutes: 25,
    xpReward: 80,
    contentMarkdown: {
      es: String.raw`### 1. Postulado de la Medición Proyectiva
La medición en la base $Z$ proyecta de forma estocástica e irreversible el estado $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ hacia $|0\rangle$ o $|1\rangle$.

### 2. Disparos (Shots)
Para estimar las probabilidades de forma experimental en hardware real, acumulamos repeticiones de medición (*shots*). En cada disparo se prepara el estado, se ejecuta el circuito y se mide; el siguiente disparo comienza de nuevo en el estado inicial.

### 3. Proyectores y colapso condicionado
Los proyectores de la medida Z son $P_0=|0\rangle\langle0|$ y $P_1=|1\rangle\langle1|$. La probabilidad de un resultado es $p_m=\langle\psi|P_m|\psi\rangle$ y, si se observa $m$, el estado posterior ideal es $P_m|\psi\rangle/\sqrt{p_m}$. El resultado concreto es aleatorio; el estado condicionado a ese resultado queda definido.

Decir que la medición es irreversible significa que no podemos recuperar en general la superposición inicial a partir de un solo resultado clásico: se perdió la información de fase. Una medición no selectiva, donde ignoramos el resultado, se describe como una mezcla y no como un único ket colapsado a un valor conocido.

### 4. Disparos y fluctuación estadística
Para una probabilidad real $p$ y $N$ disparos, el conteo esperado de unos es $Np$ y la desviación típica del conteo binomial es $\sqrt{Np(1-p)}$. Por tanto, en 1000 lanzamientos equilibrados se esperan 500 unos, pero resultados como 481 o 516 son normales. Aumentar $N$ mejora la estimación aproximadamente como $1/\sqrt{N}$; no garantiza una frecuencia exacta.

En simuladores de estado, pedir el vector completo puede ser una operación matemática sin muestreo. Para estudiar frecuencias hay que solicitar muestras o conteos con un número explícito de *shots*. En hardware, cada shot implica una nueva preparación física.

### 5. Autovalores y valor esperado
Medir el observable $Z$ devuelve sus **autovalores**: $+1$ para $|0\rangle$ y $-1$ para $|1\rangle$. Por eso ${'`'}qml.sample(qml.PauliZ(0))${'`'} da $\pm1$ y no $0/1$. La media de muchos disparos estima el **valor esperado**:

$$\langle Z\rangle=\langle\psi|Z|\psi\rangle=P(0)-P(1)$$

Para $|+\rangle$, $\langle Z\rangle=0$; para $|0\rangle$, $\langle Z\rangle=1$. Este número es la coordenada $z$ del vector de Bloch.

### 6. Medir en otras bases
El hardware suele medir solo en $Z$. Para medir en otra base se gira antes el estado: **base $X$**, se aplica $H$ y se mide $Z$; **base $Y$**, se aplica $S^\dagger$, después $H$, y se mide $Z$. Así se distinguen $|+\rangle$ y $|+i\rangle$, que en $Z$ dan las mismas probabilidades. Con las tres bases ($X$, $Y$, $Z$) se reconstruye el vector de Bloch completo: es la idea de la **tomografía de estados**.`,
      en: String.raw`### 1. Projective Measurement Postulate
Measurement in the $Z$ basis stochastically projects state $|\psi\rangle$ to either $|0\rangle$ or $|1\rangle$.

### 2. Shot Statistics
Multiple repetitions (*shots*) estimate empirical probabilities. Each shot prepares the state, runs the circuit, and measures; the next shot starts from the initial preparation again.

### 3. Projectors and conditional collapse
The Z projectors are $P_0=|0\rangle\langle0|$ and $P_1=|1\rangle\langle1|$. Outcome probability is $p_m=\langle\psi|P_m|\psi\rangle$. If outcome $m$ is observed, the ideal post-measurement state is $P_m|\psi\rangle/\sqrt{p_m}$. The outcome is random; conditioned on it, the resulting state is definite.

Measurement is irreversible in the sense that the original superposition generally cannot be recovered from one classical result: phase information was lost. A nonselective measurement, where the result is ignored, is described as a mixture rather than one known collapsed ket.

### 4. Shots and statistical fluctuation
For true probability $p$ and $N$ shots, the expected number of ones is $Np$ and the binomial count standard deviation is $\sqrt{Np(1-p)}$. Thus 1000 balanced shots are expected to give 500 ones, but 481 or 516 are ordinary outcomes. Increasing $N$ improves the estimate roughly as $1/\sqrt{N}$; it does not guarantee an exact frequency.

On a statevector simulator, requesting the full vector may be a mathematical calculation without sampling. To study frequencies, request samples or counts with an explicit number of shots. On hardware, every shot requires a new physical preparation.

### 5. Eigenvalues and expectation value
Measuring the observable $Z$ returns its **eigenvalues**: $+1$ for $|0\rangle$ and $-1$ for $|1\rangle$. That is why ${'`'}qml.sample(qml.PauliZ(0))${'`'} returns $\pm1$ rather than $0/1$. The mean over many shots estimates the **expectation value**:

$$\langle Z\rangle=\langle\psi|Z|\psi\rangle=P(0)-P(1)$$

For $|+\rangle$, $\langle Z\rangle=0$; for $|0\rangle$, $\langle Z\rangle=1$. This number is the $z$ coordinate of the Bloch vector.

### 6. Measuring in other bases
Hardware usually measures only in $Z$. To measure in another basis, rotate the state first: **X basis**, apply $H$ then measure $Z$; **Y basis**, apply $S^\dagger$, then $H$, then measure $Z$. This distinguishes $|+\rangle$ from $|+i\rangle$, which give identical $Z$ probabilities. With all three bases ($X$, $Y$, $Z$) you can reconstruct the full Bloch vector: the idea behind **state tomography**.`
    },
    exercise: {
      title: {
        es: 'Ejercicio 6: Simular 1000 Disparos de Medición',
        en: 'Exercise 6: Simulate 1000 Measurement Shots'
      },
      description: {
        es: 'Ejecuta 1000 disparos de un qubit en superposición e imprime el número de ceros y unos.',
        en: 'Run 1000 shots of a qubit in superposition and print counts of 0s and 1s.'
      },
      targetGoal: {
        es: 'Obtener un reparto aproximado de ~500 ceros y ~500 unos.',
        en: 'Obtain approximately ~500 zeros and ~500 ones.'
      },
      starterCode: {
        pennylane: {
          es: `# --- EJERCICIO 6: Medición por Disparos en PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev, shots=1000)
def circuit():
    # TODO: prepara una superposición equiprobable antes de medir.
    return qml.sample(qml.PauliZ(0))

samples = circuit()
counts_0 = sum(1 for s in samples if s == 1)
counts_1 = sum(1 for s in samples if s == -1)

print(f"Muestras de Medición (1000 shots):")
print(f"Conteo |0>: {counts_0}")
print(f"Conteo |1>: {counts_1}")

_result = "Medición por disparos completada"
`,
          en: `# --- EXERCISE 6: Shot-Based Measurement in PennyLane ---
import pennylane as qml

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev, shots=1000)
def circuit():
    # TODO: prepare an equal superposition before measuring.
    return qml.sample(qml.PauliZ(0))

samples = circuit()
counts_0 = sum(1 for s in samples if s == 1)
counts_1 = sum(1 for s in samples if s == -1)

print(f"Measurement samples (1000 shots):")
print(f"Count |0>: {counts_0}")
print(f"Count |1>: {counts_1}")

_result = "Shot-based measurement completed"
`,
        },
      }
    },
    bibliography: [
      {
        title: "Quantum Measurement Theory and its Applications",
        author: "Kurt Jacobs",
        year: "2014",
        publisher: "Cambridge University Press",
        note: {
          es: "Capítulo 1: Projective measurements and density matrix collapse.",
          en: "Chapter 1: Projective measurements and density matrix collapse."
        }
      }
    ]
  }
];

export const QUIZ_BLOCK_1: QuizQuestion[] = [
  {
    id: 1,
    question: {
      es: "Un qubit está en |ψ⟩ = (|0⟩ + |1⟩)/√2. Al medirlo una vez en la base computacional, ¿qué conclusión es correcta?",
      en: "A qubit is in |ψ⟩ = (|0⟩ + |1⟩)/√2. After one computational-basis measurement, which conclusion is correct?"
    },
    options: {
      es: [
        "Se obtiene siempre una cadena 01 porque ambas amplitudes son distintas de cero.",
        "Se obtiene un número real entre 0 y 1 que representa la superposición.",
        "Se obtiene 0 o 1, cada uno con probabilidad 1/2; una ejecución no devuelve ambos valores.",
        "Se obtiene 0 con certeza porque el circuito empezó en |0⟩."
      ],
      en: [
        "The result is always the string 01 because both amplitudes are nonzero.",
        "The result is a real number between 0 and 1 representing the superposition.",
        "The result is 0 or 1, each with probability 1/2; one run does not return both values.",
        "The result is certainly 0 because the circuit started in |0⟩."
      ]
    },
    correctAnswer: 2,
    explanation: {
      es: "Las amplitudes determinan probabilidades, no una lista de valores que se puedan leer simultáneamente. Aquí |1/√2|² = |1/√2|² = 1/2.",
      en: "Amplitudes determine probabilities, not a list of values that can be read simultaneously. Here both squared magnitudes equal 1/2."
    }
  },
  {
    id: 2,
    question: {
      es: "Un estado tiene amplitudes α = 1/2 y β = i√3/2. ¿Cuáles son las probabilidades al medir en Z?",
      en: "A state has amplitudes α = 1/2 and β = i√3/2. What are the probabilities when measured in Z?"
    },
    options: {
      es: ["P(0)=1/2 y P(1)=√3/2", "P(0)=1/4 y P(1)=−3/4", "P(0)=3/4 y P(1)=1/4", "P(0)=1/4 y P(1)=3/4"],
      en: ["P(0)=1/2 and P(1)=√3/2", "P(0)=1/4 and P(1)=−3/4", "P(0)=3/4 and P(1)=1/4", "P(0)=1/4 and P(1)=3/4"]
    },
    correctAnswer: 3,
    explanation: {
      es: "La fase i no cambia el módulo: |i√3/2|²=3/4. Las probabilidades suman 1 y la fase se vuelve relevante en interferencia, no en esta medición directa.",
      en: "The phase i does not change the magnitude: |i√3/2|²=3/4. Probabilities sum to 1; the phase matters in interference, not this direct measurement."
    }
  },
  {
    id: 3,
    question: { es: "Dos vectores representan el mismo estado físico de un qubit salvo una fase global. ¿Cuál pareja cumple eso?", en: "Two vectors represent the same physical qubit state up to a global phase. Which pair does?" },
    options: { es: ["|+⟩ y |−⟩", "|0⟩ y |1⟩", "|+⟩ y |+i⟩", "|+⟩ y −|+⟩"], en: ["|+⟩ and |−⟩", "|0⟩ and |1⟩", "|+⟩ and |+i⟩", "|+⟩ and −|+⟩"] },
    correctAnswer: 3,
    explanation: { es: "Multiplicar todo el ket por −1=e^{iπ} cambia solo la fase global. En |−⟩ cambia el signo relativo entre componentes, lo que sí puede detectarse con interferencia.", en: "Multiplying the whole ket by −1=e^{iπ} changes only global phase. In |−⟩ the relative sign changes, which interference can detect." }
  },
  {
    id: 4,
    question: { es: "Un qubit preparado como |+⟩ recibe Z y después H. ¿Qué estado y probabilidad P(0) se obtienen?", en: "A qubit prepared in |+⟩ receives Z and then H. What state and P(0) result?" },
    options: { es: ["|0⟩, P(0)=1", "|1⟩, P(0)=0", "|+⟩, P(0)=1/2", "|−⟩, P(0)=1/2"], en: ["|0⟩, P(0)=1", "|1⟩, P(0)=0", "|+⟩, P(0)=1/2", "|−⟩, P(0)=1/2"] },
    correctAnswer: 1,
    explanation: { es: "Z|+⟩=|−⟩ y H|−⟩=|1⟩. Las puertas actúan de derecha a izquierda en la notación de productos, pero aquí la secuencia del circuito es Z seguida de H.", en: "Z|+⟩=|−⟩ and H|−⟩=|1⟩. The circuit sequence is Z followed by H." }
  },
  {
    id: 5,
    question: { es: "Se aplica Ry(θ) a |0⟩ y se mide en Z. ¿Qué ángulo produce P(1)=1/4?", en: "Apply Ry(θ) to |0⟩ and measure in Z. Which angle gives P(1)=1/4?" },
    options: { es: ["θ=π/2", "θ=π", "θ=π/3", "θ=2π/3"], en: ["θ=π/2", "θ=π", "θ=π/3", "θ=2π/3"] },
    correctAnswer: 2,
    explanation: { es: "Ry(θ)|0⟩=cos(θ/2)|0⟩+sin(θ/2)|1⟩, por tanto P(1)=sin²(θ/2). Para θ=π/3, sin²(π/6)=1/4.", en: "Ry(θ)|0⟩=cos(θ/2)|0⟩+sin(θ/2)|1⟩, so P(1)=sin²(θ/2). For θ=π/3, sin²(π/6)=1/4." }
  },
  {
    id: 6,
    question: { es: "Tras 400 disparos con P(1)=0.25 se observan 112 unos. ¿Qué interpretación es mejor?", en: "After 400 shots with P(1)=0.25, 112 ones are observed. Which interpretation is best?" },
    options: { es: ["El circuito es necesariamente incorrecto porque no obtuvo exactamente 100.", "La probabilidad del estado cambió después de cada disparo.", "Con 400 disparos debe aparecer siempre la frecuencia exacta.", "Es compatible con fluctuaciones estadísticas; se esperaban 100 unos, no exactamente 100."], en: ["The circuit must be wrong because it did not get exactly 100.", "The state's probability changed after every shot.", "With 400 shots the exact frequency is guaranteed.", "It is compatible with statistical fluctuation; 100 ones were expected, not guaranteed."] },
    correctAnswer: 3,
    explanation: { es: "La probabilidad predice la frecuencia media en muchas repeticiones. Una secuencia finita fluctúa; el error típico de una proporción disminuye aproximadamente como 1/√N.", en: "Probability predicts the long-run frequency. A finite sample fluctuates; typical proportion error decreases roughly as 1/√N." }
  },
  {
    id: 7,
    question: { es: "El vector de un qubit es (0.6, 0.6). ¿Qué debe hacerse antes de interpretarlo como estado válido?", en: "A qubit vector is (0.6, 0.6). What must be done before treating it as a valid state?" },
    options: { es: ["Nada; las amplitudes deben sumar 1.", "Elevar ambas amplitudes al cuadrado y conservar 0.36 como amplitud.", "Cambiar la segunda componente a −0.6.", "Normalizarlo: su norma al cuadrado es 0.72, no 1."], en: ["Nothing; amplitudes must sum to 1.", "Square both amplitudes and keep 0.36 as the amplitude.", "Change the second component to −0.6.", "Normalize it: its squared norm is 0.72, not 1."] },
    correctAnswer: 3,
    explanation: { es: "Para un estado válido, |α|²+|β|²=1. Aquí la norma es √0.72; divide ambas componentes por √0.72 sin cambiar su proporción física.", en: "A valid state requires |α|²+|β|²=1. Its norm is √0.72; divide both components by √0.72 without changing their physical ratio." }
  },
  {
    id: 8,
    question: { es: "Preparas |+i⟩=(|0⟩+i|1⟩)/√2 y lo mides en Z. ¿Cómo distingues experimentalmente |+i⟩ de |+⟩?", en: "Prepare |+i⟩=(|0⟩+i|1⟩)/√2 and measure in Z. How can you distinguish |+i⟩ from |+⟩ experimentally?" },
    options: { es: ["Una medición Z de |+i⟩ siempre da 1.", "No con mediciones Z solas: ambos dan 0 y 1 al 50%; usa otra base, por ejemplo X o Y.", "|+i⟩ da más ceros porque i aumenta la amplitud.", "No se pueden distinguir con ninguna medición."], en: ["A Z measurement of |+i⟩ always gives 1.", "Not with Z measurements alone: both give 0 and 1 equally; use another basis such as X or Y.", "|+i⟩ gives more zeros because i increases the amplitude.", "They cannot be distinguished by any measurement."] },
    correctAnswer: 1,
    explanation: { es: "En Z importan los módulos de las amplitudes y son iguales. La fase relativa se revela al medir en una base sensible a coherencia, como X o Y.", en: "In Z, only amplitude magnitudes matter and they are equal. Relative phase is revealed in a coherence-sensitive basis such as X or Y." }
  },
  {
    id: 9,
    question: { es: "Un compañero afirma que X y H conmutan porque ambos son puertas unitarias. ¿Qué prueba lo refuta?", en: "A classmate claims X and H commute because both are unitary. Which test disproves this?" },
    options: { es: ["La unitariedad sí implica que toda pareja conmuta.", "No existe prueba: el orden de puertas nunca importa.", "Aplicarlas a |0⟩: primero X y luego H da |−⟩; primero H y luego X da |+⟩.", "X no es unitaria."], en: ["Unitarity does imply every pair commutes.", "There is no test: gate order never matters.", "Apply them to |0⟩: X then H gives |−⟩, while H then X gives |+⟩.", "X is not unitary."] },
    correctAnswer: 2,
    explanation: { es: "El orden de aplicación importa: X|0⟩=|1⟩ y luego H produce |−⟩; H|0⟩=|+⟩ y luego X deja |+⟩. Ser unitaria garantiza conservar norma, no conmutar con otras puertas.", en: "Gate order matters: X|0⟩=|1⟩ followed by H gives |−⟩; H|0⟩=|+⟩ followed by X leaves |+⟩. Unitarity preserves norm; it does not guarantee commutation." }
  },
  {
    id: 10,
    question: { es: "Después de medir un qubit en Z y obtener 1, repites inmediatamente la medición Z ideal. ¿Qué esperas?", en: "After measuring a qubit in Z and obtaining 1, you immediately repeat an ideal Z measurement. What do you expect?" },
    options: { es: ["Obtener 0 y 1 con la misma probabilidad, porque el estado original era superposición.", "Obtener siempre el resultado opuesto.", "No se puede predecir ni siquiera la distribución.", "Obtener 1 con certeza, porque la primera medición dejó el estado en |1⟩."], en: ["Obtain 0 and 1 equally because the original state was a superposition.", "Always obtain the opposite result.", "Even the distribution cannot be predicted.", "Obtain 1 with certainty because the first measurement left the state in |1⟩."] },
    correctAnswer: 3,
    explanation: { es: "La medición proyectiva ideal prepara el autoestado asociado al resultado observado. Si no hay una puerta o ruido entre mediciones, repetir la misma medición devuelve el mismo valor.", en: "An ideal projective measurement prepares the eigenstate associated with the observed result. With no intervening gate or noise, repeating the same measurement returns that value." }
  }
];

export const MINI_PROJECT_BLOCK_1: MiniProject = {
  id: 'qrng-biased-dice',
  title: {
    es: 'Mini-Proyecto: Generador de Números Aleatorios Cuánticos Sesgado (Dado Trucado)',
    en: 'Mini-Project: Biased Quantum Random Number Generator (Biased Dice)'
  },
  description: {
    es: String.raw`Construye una función en Python usando PennyLane que prepare un qubit con probabilidad de medir 0 del **75%**, es decir, $P(0)=0.75$.

Elige una rotación $R_y(\theta)$ y calcula el ángulo. Recuerda que $P(0)=\cos^2(\theta/2)$. Comprueba también que $P(1)=0.25$ y que ambas probabilidades suman uno. **Extensión opcional:** simula disparos y explica por qué el conteo de ceros no tiene que ser exactamente tres cuartas partes en cada ejecución.`,
    en: String.raw`Build a Python program with PennyLane that prepares a qubit with a **75%** probability of measuring 0, so $P(0)=0.75$.

Choose an $R_y(\theta)$ rotation and derive the angle. Recall $P(0)=\cos^2(\theta/2)$. Also check that $P(1)=0.25$ and both probabilities sum to one. **Optional extension:** simulate shots and explain why the zero count need not be exactly three quarters in every run.`
  },
  xpReward: 250,
  targetBiasP0: 0.75,
  icon: '🎲',
  shortTitle: { es: 'QRNG', en: 'QRNG' },
  wrongResultHint: {
    es: 'El estado preparado no da P(|0⟩) = 0.75. Revisa el ángulo θ.',
    en: 'The prepared state does not give P(|0⟩) = 0.75. Check the angle θ.',
  },
  starterCode: {
    pennylane: {
      es: `# --- RETO: QRNG Sesgado en PennyLane ---
import pennylane as qml
import numpy as np

# TODO: configura el sesgo pedido: P(|0>) = 0.75.
theta = 0

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def biased_qrng():
    qml.RY(theta, wires=0)
    return qml.state()

state = biased_qrng()
p0 = np.abs(state[0])**2

print(f"Probabilidad P(|0>): {p0:.4f}")

_result = f"P0={p0:.4f}"
`,
      en: `# --- CHALLENGE: Biased QRNG in PennyLane ---
import pennylane as qml
import numpy as np

# TODO: set the requested bias: P(|0>) = 0.75.
theta = 0

dev = qml.device("default.qubit", wires=1)

@qml.qnode(dev)
def biased_qrng():
    qml.RY(theta, wires=0)
    return qml.state()

state = biased_qrng()
p0 = np.abs(state[0])**2

print(f"Probability P(|0>): {p0:.4f}")

_result = f"P0={p0:.4f}"
`,
    },
  }
};

import type { Lesson } from '../../types/block';

/*
 * Block 2 · Entanglement and two-qubit systems.
 * Starter code: ES and EN versions must keep the same lines in the same order (only comments,
 * print texts and _result change), so the editor can switch language without losing work.
 */

const NIELSEN_CHUANG = {
  title: 'Quantum Computation and Quantum Information',
  author: 'Michael A. Nielsen & Isaac L. Chuang',
  year: '2010',
  publisher: 'Cambridge University Press',
};

const PENNYLANE_MEASUREMENTS = {
  title: 'PennyLane documentation: Measurements',
  author: 'Xanadu',
  year: '2025',
  publisher: 'Xanadu',
  link: 'https://docs.pennylane.ai/en/stable/introduction/measurements.html',
};

export const LESSONS_BLOCK_2: Lesson[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: 'b2-l1',
    slug: 'producto-tensorial',
    qubits: 2,
    title: { es: '1. Producto Tensorial y Sistemas de Dos Qubits', en: '1. Tensor Product and Two-Qubit Systems' },
    subtitle: { es: 'Espacio de estados ℂ⁴, orden de los cables y estados producto', en: 'The ℂ⁴ state space, wire order and product states' },
    durationMinutes: 25,
    xpReward: 60,
    contentMarkdown: {
      es: String.raw`### 1. De un qubit a dos
Con dos qubits hay cuatro resultados posibles al medir: $00$, $01$, $10$ y $11$. El estado general es una superposición de los cuatro:

$$|\psi\rangle = c_{00}|00\rangle + c_{01}|01\rangle + c_{10}|10\rangle + c_{11}|11\rangle, \qquad \sum |c_{ab}|^2 = 1$$

El espacio de estados es $\mathbb{C}^4$: con $n$ qubits hacen falta $2^n$ amplitudes. Ese crecimiento exponencial es lo que hace difícil simular ordenadores cuánticos grandes.

### 2. El producto tensorial
Si cada qubit está en su propio estado, el estado conjunto es su **producto tensorial**:

$$(a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle) = ac|00\rangle + ad|01\rangle + bc|10\rangle + bd|11\rangle$$

En forma de vector, $\begin{pmatrix} a \\ b \end{pmatrix}\otimes\begin{pmatrix} c \\ d \end{pmatrix} = (ac, ad, bc, bd)^T$. En numpy es ${'`'}np.kron(u, v)${'`'}.

### 3. Orden de los cables en PennyLane
PennyLane escribe los kets como $|q_0 q_1\rangle$: el cable 0 es el **bit más significativo**. La amplitud de $|q_0 q_1\rangle$ está en la posición $2q_0 + q_1$ del vector ${'`'}state${'`'}. Por ejemplo, aplicar $X$ solo al cable 1 da $|01\rangle$, que está en ${'`'}state[1]${'`'}.

Otras librerías, como Qiskit, usan el orden contrario ($|q_1 q_0\rangle$). Comprueba siempre la convención antes de comparar resultados.

### 4. Puertas sobre un solo qubit
Una puerta $U$ aplicada solo al cable 0 actúa como $U\otimes I$ sobre el sistema completo. Las puertas sobre cables distintos **conmutan**: da igual aplicar primero $H$ en el cable 0 o $X$ en el cable 1. Por eso $H$ en el cable 0 y $X$ en el cable 1 preparan $|+\rangle\otimes|1\rangle$.

### 5. No todo estado es un producto
Un estado de dos qubits es un producto si, y solo si, $c_{00}c_{11} = c_{01}c_{10}$. El estado $(|00\rangle+|11\rangle)/\sqrt{2}$ no lo cumple ($\tfrac{1}{2}\neq 0$): no se puede describir qubit a qubit. Esos estados se llaman **entrelazados** y son el tema de las próximas lecciones.`,
      en: String.raw`### 1. From one qubit to two
With two qubits there are four possible measurement outcomes: $00$, $01$, $10$ and $11$. The general state is a superposition of all four:

$$|\psi\rangle = c_{00}|00\rangle + c_{01}|01\rangle + c_{10}|10\rangle + c_{11}|11\rangle, \qquad \sum |c_{ab}|^2 = 1$$

The state space is $\mathbb{C}^4$: $n$ qubits need $2^n$ amplitudes. That exponential growth is what makes large quantum computers hard to simulate.

### 2. The tensor product
When each qubit has its own state, the joint state is their **tensor product**:

$$(a|0\rangle + b|1\rangle)\otimes(c|0\rangle + d|1\rangle) = ac|00\rangle + ad|01\rangle + bc|10\rangle + bd|11\rangle$$

As vectors, $\begin{pmatrix} a \\ b \end{pmatrix}\otimes\begin{pmatrix} c \\ d \end{pmatrix} = (ac, ad, bc, bd)^T$. In numpy it is ${'`'}np.kron(u, v)${'`'}.

### 3. Wire order in PennyLane
PennyLane writes kets as $|q_0 q_1\rangle$: wire 0 is the **most significant bit**. The amplitude of $|q_0 q_1\rangle$ sits at position $2q_0 + q_1$ of the ${'`'}state${'`'} vector. For example, applying $X$ to wire 1 only gives $|01\rangle$, stored in ${'`'}state[1]${'`'}.

Other libraries, such as Qiskit, use the opposite order ($|q_1 q_0\rangle$). Always check the convention before comparing results.

### 4. Gates on a single qubit
A gate $U$ on wire 0 alone acts as $U\otimes I$ on the whole system. Gates on different wires **commute**: it does not matter whether $H$ on wire 0 or $X$ on wire 1 goes first. That is why $H$ on wire 0 and $X$ on wire 1 prepare $|+\rangle\otimes|1\rangle$.

### 5. Not every state is a product
A two-qubit state is a product if and only if $c_{00}c_{11} = c_{01}c_{10}$. The state $(|00\rangle+|11\rangle)/\sqrt{2}$ fails it ($\tfrac{1}{2}\neq 0$): it cannot be described qubit by qubit. Such states are called **entangled** and are the topic of the next lessons.`,
    },
    exercise: {
      title: { es: 'Ejercicio 1: Preparar |+⟩ ⊗ |1⟩', en: 'Exercise 1: Prepare |+⟩ ⊗ |1⟩' },
      description: {
        es: 'Prepara el estado producto |+⟩ ⊗ |1⟩ = (|01⟩ + |11⟩)/√2: el cable 0 en |+⟩ y el cable 1 en |1⟩. El código ya pone el cable 0 en |+⟩.',
        en: 'Prepare the product state |+⟩ ⊗ |1⟩ = (|01⟩ + |11⟩)/√2: wire 0 in |+⟩ and wire 1 in |1⟩. The code already puts wire 0 in |+⟩.',
      },
      targetGoal: { es: 'Probabilidad 0.5 en |01⟩ y en |11⟩.', en: 'Probability 0.5 on |01⟩ and on |11⟩.' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 1: Estado producto ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: pon el cable 1 en |1>.
    return qml.state()

state = circuit()
for index, amplitude in enumerate(state):
    print(f"|{index:02b}>: {np.round(amplitude, 4)}  P = {abs(amplitude)**2:.3f}")

_result = "Estado producto preparado"
`,
          en: `# --- BLOCK 2 · EXERCISE 1: Product state ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: put wire 1 in |1>.
    return qml.state()

state = circuit()
for index, amplitude in enumerate(state):
    print(f"|{index:02b}>: {np.round(amplitude, 4)}  P = {abs(amplitude)**2:.3f}")

_result = "Product state prepared"
`,
        },
      },
    },
    bibliography: [
      { ...NIELSEN_CHUANG, note: { es: 'Sección 2.1.7: producto tensorial. Sección 1.2.4: múltiples qubits.', en: 'Section 2.1.7: tensor products. Section 1.2.4: multiple qubits.' } },
    ],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: 'b2-l2',
    slug: 'cnot',
    qubits: 2,
    title: { es: '2. Puertas Controladas: CNOT y CZ', en: '2. Controlled Gates: CNOT and CZ' },
    subtitle: { es: 'XOR reversible, linealidad y retroceso de fase', en: 'Reversible XOR, linearity and phase kickback' },
    durationMinutes: 25,
    xpReward: 65,
    contentMarkdown: {
      es: String.raw`### 1. La puerta CNOT
La CNOT (NOT controlada) tiene un qubit de **control** y uno **objetivo**. Si el control es $1$, aplica $X$ al objetivo; si es $0$, no hace nada:

$$\mathrm{CNOT}\,|a, b\rangle = |a,\; a\oplus b\rangle, \qquad \mathrm{CNOT} = \begin{pmatrix} 1&0&0&0\\ 0&1&0&0\\ 0&0&0&1\\ 0&0&1&0 \end{pmatrix}$$

En PennyLane, ${'`'}qml.CNOT(wires=[0, 1])${'`'}: el primer cable es el control. En los diagramas, el control se dibuja con un punto (●) y el objetivo con $\oplus$.

### 2. CNOT como XOR clásico
Sobre estados de la base, la CNOT calcula el XOR del control y el objetivo y lo guarda en el objetivo: $|1,1\rangle \to |1,0\rangle$ porque $1\oplus 1 = 0$. A diferencia de una puerta XOR clásica, es **reversible**: aplicarla dos veces devuelve el estado inicial, porque $\mathrm{CNOT}^2 = I$.

### 3. CNOT sobre superposiciones
Por linealidad, la CNOT actúa sobre cada término de la superposición:

$$\mathrm{CNOT}\,(\alpha|0\rangle+\beta|1\rangle)|0\rangle = \alpha|00\rangle + \beta|11\rangle$$

El resultado ya no es un producto si $\alpha$ y $\beta$ son ambos distintos de cero: la CNOT **crea entrelazamiento**. Es la puerta de dos qubits más usada.

### 4. CZ y el retroceso de fase
La CZ aplica $Z$ al objetivo si el control es $1$: $\mathrm{CZ}=\mathrm{diag}(1,1,1,-1)$. Es **simétrica**: solo cambia el signo de $|11\rangle$, así que control y objetivo son intercambiables. Además, $\mathrm{CNOT} = (I\otimes H)\,\mathrm{CZ}\,(I\otimes H)$.

Una puerta controlada también puede cambiar el **control**. Si el objetivo está en $|-\rangle$ (autoestado de $X$ con valor $-1$), la CNOT devuelve esa fase al control: $\mathrm{CNOT}\,|+\rangle|-\rangle = |-\rangle|-\rangle$. Este **retroceso de fase** (*phase kickback*) es la base de algoritmos como Deutsch-Jozsa.`,
      en: String.raw`### 1. The CNOT gate
The CNOT (controlled NOT) has a **control** qubit and a **target** qubit. If the control is $1$ it applies $X$ to the target; if it is $0$ it does nothing:

$$\mathrm{CNOT}\,|a, b\rangle = |a,\; a\oplus b\rangle, \qquad \mathrm{CNOT} = \begin{pmatrix} 1&0&0&0\\ 0&1&0&0\\ 0&0&0&1\\ 0&0&1&0 \end{pmatrix}$$

In PennyLane, ${'`'}qml.CNOT(wires=[0, 1])${'`'}: the first wire is the control. In diagrams the control is a dot (●) and the target is $\oplus$.

### 2. CNOT as a classical XOR
On basis states, CNOT computes the XOR of control and target and stores it in the target: $|1,1\rangle \to |1,0\rangle$ because $1\oplus 1 = 0$. Unlike a classical XOR gate it is **reversible**: applying it twice gives back the initial state, because $\mathrm{CNOT}^2 = I$.

### 3. CNOT on superpositions
By linearity, CNOT acts on every term of a superposition:

$$\mathrm{CNOT}\,(\alpha|0\rangle+\beta|1\rangle)|0\rangle = \alpha|00\rangle + \beta|11\rangle$$

The result is no longer a product when both $\alpha$ and $\beta$ are nonzero: CNOT **creates entanglement**. It is the most widely used two-qubit gate.

### 4. CZ and phase kickback
CZ applies $Z$ to the target when the control is $1$: $\mathrm{CZ}=\mathrm{diag}(1,1,1,-1)$. It is **symmetric**: it only flips the sign of $|11\rangle$, so control and target are interchangeable. Also, $\mathrm{CNOT} = (I\otimes H)\,\mathrm{CZ}\,(I\otimes H)$.

A controlled gate can also change the **control**. If the target is in $|-\rangle$ (the $X$ eigenstate with eigenvalue $-1$), CNOT kicks that phase back to the control: $\mathrm{CNOT}\,|+\rangle|-\rangle = |-\rangle|-\rangle$. This **phase kickback** underlies algorithms such as Deutsch-Jozsa.`,
    },
    exercise: {
      title: { es: 'Ejercicio 2: XOR reversible con CNOT', en: 'Exercise 2: Reversible XOR with CNOT' },
      description: {
        es: 'Las entradas a = 1 (cable 0) y b = 1 (cable 1) ya están preparadas. Usa una CNOT con el cable 0 como control para guardar a ⊕ b en el cable 1.',
        en: 'Inputs a = 1 (wire 0) and b = 1 (wire 1) are already prepared. Use a CNOT with wire 0 as control to store a ⊕ b in wire 1.',
      },
      targetGoal: { es: 'Estado final |10⟩ (a = 1, a ⊕ b = 0).', en: 'Final state |10⟩ (a = 1, a ⊕ b = 0).' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 2: XOR con CNOT ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.PauliX(wires=0)  # a = 1
    qml.PauliX(wires=1)  # b = 1
    # TODO: calcula a XOR b en el cable 1 con una CNOT (control: cable 0).
    return qml.state()

state = circuit()
outcome = int(np.argmax(np.abs(state)))
print(f"Estado final: |{outcome:02b}>")
print(f"a = {outcome >> 1}, a XOR b = {outcome & 1}")

_result = "XOR calculado"
`,
          en: `# --- BLOCK 2 · EXERCISE 2: XOR with CNOT ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.PauliX(wires=0)  # a = 1
    qml.PauliX(wires=1)  # b = 1
    # TODO: compute a XOR b on wire 1 with a CNOT (control: wire 0).
    return qml.state()

state = circuit()
outcome = int(np.argmax(np.abs(state)))
print(f"Final state: |{outcome:02b}>")
print(f"a = {outcome >> 1}, a XOR b = {outcome & 1}")

_result = "XOR computed"
`,
        },
      },
    },
    bibliography: [
      { ...NIELSEN_CHUANG, note: { es: 'Sección 1.3.2: puertas de varios qubits. Sección 4.3: operaciones controladas.', en: 'Section 1.3.2: multiple-qubit gates. Section 4.3: controlled operations.' } },
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: 'b2-l3',
    slug: 'estados-bell',
    qubits: 2,
    title: { es: '3. Estados de Bell y Entrelazamiento', en: '3. Bell States and Entanglement' },
    subtitle: { es: 'Correlaciones perfectas sin estados individuales', en: 'Perfect correlations without individual states' },
    durationMinutes: 30,
    xpReward: 70,
    contentMarkdown: {
      es: String.raw`### 1. El circuito de Bell
Una Hadamard seguida de una CNOT convierte $|00\rangle$ en un estado entrelazado:

$$|00\rangle \xrightarrow{H\otimes I} \frac{|00\rangle+|10\rangle}{\sqrt{2}} \xrightarrow{\mathrm{CNOT}} \frac{|00\rangle+|11\rangle}{\sqrt{2}} = |\Phi^+\rangle$$

### 2. Los cuatro estados de Bell
$$|\Phi^\pm\rangle = \frac{|00\rangle \pm |11\rangle}{\sqrt{2}}, \qquad |\Psi^\pm\rangle = \frac{|01\rangle \pm |10\rangle}{\sqrt{2}}$$

Forman una **base ortonormal** de dos qubits, igual que $|00\rangle,\dots,|11\rangle$. Se pasa de uno a otro con puertas sobre **un solo** qubit: $X$ cambia $\Phi\leftrightarrow\Psi$ y $Z$ cambia el signo $+\leftrightarrow-$.

### 3. Qué significa estar entrelazado
$|\Phi^+\rangle$ no se puede escribir como (estado del qubit 0) $\otimes$ (estado del qubit 1). Al medir en $Z$, cada qubit por separado da $0$ o $1$ al 50 %, pero los dos resultados **siempre coinciden**. La información no está en los qubits individuales, sino en sus **correlaciones**.

### 4. El estado reducido
Si miramos solo un qubit de un par de Bell, su vector de Bloch tiene longitud $0$: está en el centro de la esfera (estado **máximamente mezclado**). Ninguna medida sobre ese qubit solo revela nada del par. La visualización de esta lección lo muestra: las flechas de los dos qubits se reducen a un punto.

### 5. Correlación no es comunicación
Medir el qubit 0 no cambia las estadísticas del qubit 1 si no se conoce el resultado: para quien mira solo el qubit 1 sigue siendo 50/50. Por eso el entrelazamiento **no permite enviar mensajes** más rápido que la luz (principio de no señalización). Para aprovecharlo hace falta, además, comunicación clásica, como verás en la teleportación.`,
      en: String.raw`### 1. The Bell circuit
A Hadamard followed by a CNOT turns $|00\rangle$ into an entangled state:

$$|00\rangle \xrightarrow{H\otimes I} \frac{|00\rangle+|10\rangle}{\sqrt{2}} \xrightarrow{\mathrm{CNOT}} \frac{|00\rangle+|11\rangle}{\sqrt{2}} = |\Phi^+\rangle$$

### 2. The four Bell states
$$|\Phi^\pm\rangle = \frac{|00\rangle \pm |11\rangle}{\sqrt{2}}, \qquad |\Psi^\pm\rangle = \frac{|01\rangle \pm |10\rangle}{\sqrt{2}}$$

They form an **orthonormal basis** of two qubits, just like $|00\rangle,\dots,|11\rangle$. You move between them with gates on **a single** qubit: $X$ swaps $\Phi\leftrightarrow\Psi$ and $Z$ flips the sign $+\leftrightarrow-$.

### 3. What being entangled means
$|\Phi^+\rangle$ cannot be written as (state of qubit 0) $\otimes$ (state of qubit 1). Measured in $Z$, each qubit alone gives $0$ or $1$ with 50 % probability, but the two results **always agree**. The information is not in the individual qubits but in their **correlations**.

### 4. The reduced state
Looking at just one qubit of a Bell pair, its Bloch vector has length $0$: it sits at the centre of the sphere (a **maximally mixed** state). No measurement on that qubit alone reveals anything about the pair. This lesson's visualization shows it: the arrows of both qubits shrink to a point.

### 5. Correlation is not communication
Measuring qubit 0 does not change the statistics of qubit 1 unless you know the result: for someone looking only at qubit 1 it is still 50/50. That is why entanglement **cannot send messages** faster than light (the no-signalling principle). To exploit it you also need classical communication, as you will see in teleportation.`,
    },
    exercise: {
      title: { es: 'Ejercicio 3: Preparar |Ψ⁺⟩', en: 'Exercise 3: Prepare |Ψ⁺⟩' },
      description: {
        es: 'El circuito de Bell ya prepara |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Añade una sola puerta de un qubit para obtener |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2.',
        en: 'The Bell circuit already prepares |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Add a single one-qubit gate to obtain |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2.',
      },
      targetGoal: { es: 'Probabilidad 0.5 en |01⟩ y en |10⟩, ambas amplitudes positivas.', en: 'Probability 0.5 on |01⟩ and on |10⟩, both amplitudes positive.' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 3: Estados de Bell ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    # TODO: transforma |Phi+> en |Psi+> con una puerta en un solo qubit.
    return qml.state()

state = circuit()
for index, amplitude in enumerate(state):
    print(f"|{index:02b}>: {np.round(amplitude, 4)}")

_result = "Estado de Bell preparado"
`,
          en: `# --- BLOCK 2 · EXERCISE 3: Bell states ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    # TODO: turn |Phi+> into |Psi+> with a gate on a single qubit.
    return qml.state()

state = circuit()
for index, amplitude in enumerate(state):
    print(f"|{index:02b}>: {np.round(amplitude, 4)}")

_result = "Bell state prepared"
`,
        },
      },
    },
    bibliography: [
      { ...NIELSEN_CHUANG, note: { es: 'Sección 1.3.6: estados de Bell (pares EPR).', en: 'Section 1.3.6: Bell states (EPR pairs).' } },
      {
        title: 'Can Quantum-Mechanical Description of Physical Reality Be Considered Complete?',
        author: 'A. Einstein, B. Podolsky, N. Rosen',
        year: '1935',
        publisher: 'Physical Review 47, 777',
        link: 'https://doi.org/10.1103/PhysRev.47.777',
        note: { es: 'El artículo EPR que planteó la paradoja del entrelazamiento.', en: 'The EPR paper that posed the entanglement paradox.' },
      },
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: 'b2-l4',
    slug: 'medida-parcial',
    qubits: 2,
    title: { es: '4. Medida Parcial y Correlaciones', en: '4. Partial Measurement and Correlations' },
    subtitle: { es: 'Medir un qubit de un sistema compuesto', en: 'Measuring one qubit of a composite system' },
    durationMinutes: 30,
    xpReward: 70,
    contentMarkdown: {
      es: String.raw`### 1. Medir solo un qubit
Para medir el qubit 0 se suman las probabilidades de todos los estados con ese valor en el cable 0:

$$P(q_0 = m) = \sum_{b} |c_{mb}|^2$$

Tras observar $m$, el estado conserva solo los términos compatibles y se **renormaliza**: $|\psi'\rangle = \frac{1}{\sqrt{P(m)}}\sum_b c_{mb}|m\,b\rangle$.

### 2. Un ejemplo
Para $|\psi\rangle = (|00\rangle+|01\rangle+|10\rangle)/\sqrt{3}$:
- $P(q_0=0) = 2/3$, y el estado pasa a $(|00\rangle+|01\rangle)/\sqrt{2} = |0\rangle|+\rangle$.
- $P(q_0=1) = 1/3$, y el estado pasa a $|10\rangle$.

Medir un qubit cambia lo que se puede predecir del otro: antes de medir, $P(q_1=1) = 1/3$; si sale $q_0=1$, pasa a ser $0$.

### 3. Correlaciones de un par de Bell
En $|\Phi^+\rangle$, medir $q_0$ fija $q_1$: si sale $0$, el estado pasa a $|00\rangle$; si sale $1$, a $|11\rangle$. Al repetir el experimento, la distribución conjunta solo contiene $00$ y $11$, cada uno con probabilidad $1/2$.

### 4. Muestras de varios qubits en PennyLane
${'`'}qml.sample(wires=[0, 1])${'`'} devuelve una fila de bits por disparo, como ${'`'}[[0, 0], [1, 1], ...]${'`'}. Sin observable devuelve bits $0/1$ y no los autovalores $\pm1$. El número de disparos se fija en la QNode: ${'`'}@qml.qnode(dev, shots=1000)${'`'}.

### 5. Correlación en todas las bases
En $|\Phi^+\rangle$ los resultados también coinciden si **ambos** qubits se miden en la base $X$. Un par de monedas trucadas puede imitar la correlación en una base, pero no en todas a la vez con las mismas probabilidades. Esa diferencia, formalizada por las **desigualdades de Bell**, es la prueba experimental de que el entrelazamiento no es una correlación clásica oculta.`,
      en: String.raw`### 1. Measuring just one qubit
To measure qubit 0, add up the probabilities of every state with that value on wire 0:

$$P(q_0 = m) = \sum_{b} |c_{mb}|^2$$

After observing $m$, the state keeps only the compatible terms and is **renormalized**: $|\psi'\rangle = \frac{1}{\sqrt{P(m)}}\sum_b c_{mb}|m\,b\rangle$.

### 2. An example
For $|\psi\rangle = (|00\rangle+|01\rangle+|10\rangle)/\sqrt{3}$:
- $P(q_0=0) = 2/3$, and the state becomes $(|00\rangle+|01\rangle)/\sqrt{2} = |0\rangle|+\rangle$.
- $P(q_0=1) = 1/3$, and the state becomes $|10\rangle$.

Measuring one qubit changes what can be predicted about the other: before measuring, $P(q_1=1) = 1/3$; if $q_0=1$ comes out, it becomes $0$.

### 3. Correlations of a Bell pair
In $|\Phi^+\rangle$, measuring $q_0$ fixes $q_1$: outcome $0$ leaves $|00\rangle$, outcome $1$ leaves $|11\rangle$. Repeating the experiment, the joint distribution only contains $00$ and $11$, each with probability $1/2$.

### 4. Multi-qubit samples in PennyLane
${'`'}qml.sample(wires=[0, 1])${'`'} returns one row of bits per shot, such as ${'`'}[[0, 0], [1, 1], ...]${'`'}. Without an observable it returns $0/1$ bits, not the $\pm1$ eigenvalues. The number of shots is set on the QNode: ${'`'}@qml.qnode(dev, shots=1000)${'`'}.

### 5. Correlation in every basis
In $|\Phi^+\rangle$ the results also agree when **both** qubits are measured in the $X$ basis. A pair of loaded coins can mimic the correlation in one basis, but not in all of them at once with the same probabilities. That difference, formalized by **Bell inequalities**, is the experimental proof that entanglement is not a hidden classical correlation.`,
    },
    exercise: {
      title: { es: 'Ejercicio 4: Medir un par de Bell 1000 veces', en: 'Exercise 4: Measure a Bell pair 1000 times' },
      description: {
        es: 'El circuito mide los dos qubits en 1000 disparos, pero los resultados aún no están correlacionados. Completa la preparación de |Φ⁺⟩ para que los dos bits coincidan siempre.',
        en: 'The circuit measures both qubits over 1000 shots, but the results are not correlated yet. Complete the preparation of |Φ⁺⟩ so the two bits always agree.',
      },
      targetGoal: { es: 'En todos los disparos q0 = q1, con 00 y 11 cerca del 50 %.', en: 'q0 = q1 in every shot, with 00 and 11 close to 50 %.' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 4: Medida de un par de Bell ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev, shots=1000)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: entrelaza los dos qubits.
    return qml.sample(wires=[0, 1])

samples = circuit()
counts = {}
for row in samples:
    key = f"{int(row[0])}{int(row[1])}"
    counts[key] = counts.get(key, 0) + 1
print("Conteos:", dict(sorted(counts.items())))
print("Coinciden en todos los disparos:", bool(np.all(samples[:, 0] == samples[:, 1])))

_result = "Medida conjunta completada"
`,
          en: `# --- BLOCK 2 · EXERCISE 4: Measuring a Bell pair ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev, shots=1000)
def circuit():
    qml.Hadamard(wires=0)
    # TODO: entangle the two qubits.
    return qml.sample(wires=[0, 1])

samples = circuit()
counts = {}
for row in samples:
    key = f"{int(row[0])}{int(row[1])}"
    counts[key] = counts.get(key, 0) + 1
print("Counts:", dict(sorted(counts.items())))
print("Agree in every shot:", bool(np.all(samples[:, 0] == samples[:, 1])))

_result = "Joint measurement completed"
`,
        },
      },
    },
    bibliography: [
      { ...NIELSEN_CHUANG, note: { es: 'Sección 2.2.3: medidas proyectivas. Sección 2.4.3: el operador densidad reducido.', en: 'Section 2.2.3: projective measurements. Section 2.4.3: the reduced density operator.' } },
      { ...PENNYLANE_MEASUREMENTS, note: { es: 'Muestras, conteos y cómo fijar el número de disparos en una QNode.', en: 'Samples, counts, and setting the number of shots on a QNode.' } },
    ],
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: 'b2-l5',
    slug: 'no-clonacion',
    qubits: 2,
    title: { es: '5. El Teorema de No Clonación', en: '5. The No-Cloning Theorem' },
    subtitle: { es: 'Por qué no se puede copiar un estado cuántico desconocido', en: 'Why an unknown quantum state cannot be copied' },
    durationMinutes: 25,
    xpReward: 70,
    contentMarkdown: {
      es: String.raw`### 1. Enunciado
No existe ninguna operación unitaria $U$ que copie **cualquier** estado desconocido:

$$U\,|\psi\rangle|0\rangle = |\psi\rangle|\psi\rangle \quad \text{para todo } |\psi\rangle \qquad \text{(imposible)}$$

Es una consecuencia directa de la linealidad de la mecánica cuántica (Wootters y Zurek, 1982).

### 2. La demostración en dos líneas
Supón que $U$ copia dos estados, $|\psi\rangle$ y $|\phi\rangle$. Las puertas unitarias conservan el producto interno, así que comparando antes y después:

$$\langle\phi|\psi\rangle = \langle\phi|\psi\rangle^2$$

Solo se cumple si $\langle\phi|\psi\rangle$ vale $0$ o $1$: una misma máquina solo puede copiar estados **iguales u ortogonales**, nunca una superposición arbitraria.

### 3. La CNOT copia bits, no qubits
La CNOT copia los estados de la base: $|0\rangle|0\rangle \to |00\rangle$ y $|1\rangle|0\rangle \to |11\rangle$. Pero con $|+\rangle$:

$$\mathrm{CNOT}\,|+\rangle|0\rangle = \frac{|00\rangle+|11\rangle}{\sqrt{2}} \neq |+\rangle|+\rangle$$

Se obtiene un par de Bell, no dos copias. Su solapamiento con la copia ideal es $|\langle{+}{+}|\Phi^+\rangle|^2 = 1/2$.

### 4. Consecuencias
- **No se pueden leer amplitudes con una sola copia**: si se pudiera clonar, bastaría con hacer muchas copias y medirlas todas.
- **Criptografía cuántica**: un espía no puede copiar los qubits de una clave sin perturbarlos (protocolo BB84).
- **Coherencia con la relatividad**: clonar permitiría usar el entrelazamiento para enviar señales más rápido que la luz.
- **Corrección de errores**: los códigos cuánticos protegen la información repartiéndola entre varios qubits con entrelazamiento, nunca copiándola.`,
      en: String.raw`### 1. Statement
There is no unitary operation $U$ that copies **every** unknown state:

$$U\,|\psi\rangle|0\rangle = |\psi\rangle|\psi\rangle \quad \text{for all } |\psi\rangle \qquad \text{(impossible)}$$

It follows directly from the linearity of quantum mechanics (Wootters and Zurek, 1982).

### 2. The two-line proof
Suppose $U$ copies two states, $|\psi\rangle$ and $|\phi\rangle$. Unitary gates preserve inner products, so comparing before and after:

$$\langle\phi|\psi\rangle = \langle\phi|\psi\rangle^2$$

That only holds when $\langle\phi|\psi\rangle$ is $0$ or $1$: one machine can only copy states that are **equal or orthogonal**, never an arbitrary superposition.

### 3. CNOT copies bits, not qubits
CNOT copies basis states: $|0\rangle|0\rangle \to |00\rangle$ and $|1\rangle|0\rangle \to |11\rangle$. But with $|+\rangle$:

$$\mathrm{CNOT}\,|+\rangle|0\rangle = \frac{|00\rangle+|11\rangle}{\sqrt{2}} \neq |+\rangle|+\rangle$$

You get a Bell pair, not two copies. Its overlap with the ideal copy is $|\langle{+}{+}|\Phi^+\rangle|^2 = 1/2$.

### 4. Consequences
- **Amplitudes cannot be read from a single copy**: if cloning were possible you could make many copies and measure them all.
- **Quantum cryptography**: an eavesdropper cannot copy the qubits of a key without disturbing them (the BB84 protocol).
- **Consistency with relativity**: cloning would let entanglement send signals faster than light.
- **Error correction**: quantum codes protect information by spreading it over several entangled qubits, never by copying it.`,
    },
    exercise: {
      title: { es: 'Ejercicio 5: Intentar clonar |+⟩ con una CNOT', en: 'Exercise 5: Try to clone |+⟩ with a CNOT' },
      description: {
        es: 'El cable 0 está en |+⟩ y el cable 1 en |0⟩. Aplica la "máquina copiadora" CNOT y observa qué estado sale y cuánto se parece a |+⟩|+⟩.',
        en: 'Wire 0 is in |+⟩ and wire 1 in |0⟩. Apply the CNOT "copying machine" and see which state comes out and how close it is to |+⟩|+⟩.',
      },
      targetGoal: { es: 'Solapamiento 1.000 con |Φ⁺⟩: la CNOT entrelaza en vez de copiar (con la copia ideal |+⟩|+⟩ solo 0.500).', en: 'Overlap 1.000 with |Φ⁺⟩: CNOT entangles instead of copying (only 0.500 with the ideal copy |+⟩|+⟩).' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 5: La CNOT no clona ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)  # estado a copiar: |+>
    # TODO: aplica la CNOT que "copia" el cable 0 en el cable 1.
    return qml.state()

state = circuit()
plus = np.array([1, 1]) / np.sqrt(2)
ideal_copy = np.kron(plus, plus)
bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
print("Estado obtenido:", np.round(state, 4))
print(f"Solapamiento con la copia ideal |+>|+>: {abs(np.vdot(ideal_copy, state)) ** 2:.3f}")
print(f"Solapamiento con el par de Bell |Phi+>: {abs(np.vdot(bell, state)) ** 2:.3f}")

_result = "Intento de clonación ejecutado"
`,
          en: `# --- BLOCK 2 · EXERCISE 5: CNOT does not clone ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)  # state to copy: |+>
    # TODO: apply the CNOT that "copies" wire 0 into wire 1.
    return qml.state()

state = circuit()
plus = np.array([1, 1]) / np.sqrt(2)
ideal_copy = np.kron(plus, plus)
bell = np.array([1, 0, 0, 1]) / np.sqrt(2)
print("Resulting state:", np.round(state, 4))
print(f"Overlap with the ideal copy |+>|+>: {abs(np.vdot(ideal_copy, state)) ** 2:.3f}")
print(f"Overlap with the Bell pair |Phi+>: {abs(np.vdot(bell, state)) ** 2:.3f}")

_result = "Cloning attempt executed"
`,
        },
      },
    },
    bibliography: [
      {
        title: 'A single quantum cannot be cloned',
        author: 'W. K. Wootters & W. H. Zurek',
        year: '1982',
        publisher: 'Nature 299, 802',
        link: 'https://doi.org/10.1038/299802a0',
        note: { es: 'El artículo original del teorema de no clonación.', en: 'The original paper of the no-cloning theorem.' },
      },
      { ...NIELSEN_CHUANG, note: { es: 'Recuadro 12.1: el teorema de no clonación.', en: 'Box 12.1: the no-cloning theorem.' } },
    ],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: 'b2-l6',
    slug: 'codificacion-superdensa',
    qubits: 2,
    title: { es: '6. Codificación Superdensa', en: '6. Superdense Coding' },
    subtitle: { es: 'Dos bits clásicos con un solo qubit y un par entrelazado', en: 'Two classical bits with a single qubit and an entangled pair' },
    durationMinutes: 30,
    xpReward: 75,
    contentMarkdown: {
      es: String.raw`### 1. La idea
Alice y Bob comparten un par $|\Phi^+\rangle$: Alice tiene el qubit 0 y Bob el qubit 1. Alice quiere enviar **dos bits** $ab$ y solo puede mandar **un qubit**. Sin entrelazamiento, un qubit no puede transportar más de un bit de información (límite de Holevo). Con el par compartido sí puede enviar dos.

### 2. Codificación de Alice
Alice aplica a **su** qubit una de cuatro operaciones, según el mensaje:

- $00$: nada → $|\Phi^+\rangle$
- $01$: $X$ → $|\Psi^+\rangle$
- $10$: $Z$ → $|\Phi^-\rangle$
- $11$: $X$ y después $Z$ → $|\Psi^-\rangle$ (salvo fase global)

El primer bit decide si aplica $Z$; el segundo, si aplica $X$. Después envía su qubit a Bob.

### 3. Decodificación de Bob
Bob tiene ahora los dos qubits. Aplica CNOT (control 0, objetivo 1) y $H$ al qubit 0, que es el circuito de Bell al revés. Cada estado de Bell vuelve a un estado de la base: $|\Phi^+\rangle\to|00\rangle$, $|\Psi^+\rangle\to|01\rangle$, $|\Phi^-\rangle\to|10\rangle$, $|\Psi^-\rangle\to|11\rangle$. Al medir, Bob lee $ab$ con certeza. Esta operación se llama **medida de Bell**.

### 4. ¿Por qué no es magia?
El protocolo consume el par entrelazado (**1 ebit**), que tuvo que repartirse antes. Si un espía intercepta solo el qubit enviado, no aprende nada: su estado reducido es el mismo para los cuatro mensajes. Superdensa y teleportación son protocolos duales: uno usa entrelazamiento para enviar bits con qubits; el otro, para enviar qubits con bits.`,
      en: String.raw`### 1. The idea
Alice and Bob share a $|\Phi^+\rangle$ pair: Alice holds qubit 0 and Bob qubit 1. Alice wants to send **two bits** $ab$ and can only send **one qubit**. Without entanglement, one qubit cannot carry more than one bit of information (the Holevo bound). With the shared pair it can carry two.

### 2. Alice's encoding
Alice applies one of four operations to **her** qubit, depending on the message:

- $00$: nothing → $|\Phi^+\rangle$
- $01$: $X$ → $|\Psi^+\rangle$
- $10$: $Z$ → $|\Phi^-\rangle$
- $11$: $X$ then $Z$ → $|\Psi^-\rangle$ (up to global phase)

The first bit decides whether to apply $Z$; the second, whether to apply $X$. Then she sends her qubit to Bob.

### 3. Bob's decoding
Bob now holds both qubits. He applies CNOT (control 0, target 1) and $H$ on qubit 0, which is the Bell circuit backwards. Each Bell state goes back to a basis state: $|\Phi^+\rangle\to|00\rangle$, $|\Psi^+\rangle\to|01\rangle$, $|\Phi^-\rangle\to|10\rangle$, $|\Psi^-\rangle\to|11\rangle$. Measuring, Bob reads $ab$ with certainty. This operation is called a **Bell measurement**.

### 4. Why is it not magic?
The protocol consumes the entangled pair (**1 ebit**), which had to be shared beforehand. An eavesdropper who intercepts only the sent qubit learns nothing: its reduced state is the same for all four messages. Superdense coding and teleportation are dual protocols: one uses entanglement to send bits with qubits; the other, to send qubits with bits.`,
    },
    exercise: {
      title: { es: 'Ejercicio 6: Enviar el mensaje 11', en: 'Exercise 6: Send the message 11' },
      description: {
        es: 'El par entrelazado y la decodificación de Bob ya están en el código. Añade la codificación de Alice en el qubit 0 para que Bob reciba el mensaje "11".',
        en: 'The entangled pair and Bob\'s decoding are already in the code. Add Alice\'s encoding on qubit 0 so that Bob receives the message "11".',
      },
      targetGoal: { es: 'Bob obtiene |11⟩ con probabilidad 1.', en: 'Bob obtains |11⟩ with probability 1.' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 6: Codificación superdensa ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    # Par entrelazado compartido: qubit 0 de Alice, qubit 1 de Bob.
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    # TODO: Alice codifica el mensaje "11" en su qubit (cable 0).
    # Bob decodifica con el circuito de Bell al revés.
    qml.CNOT(wires=[0, 1])
    qml.Hadamard(wires=0)
    return qml.state()

state = circuit()
received = int(np.argmax(np.abs(state)))
print(f"Bob recibe: {received:02b} (probabilidad {abs(state[received])**2:.3f})")

_result = f"Mensaje {received:02b}"
`,
          en: `# --- BLOCK 2 · EXERCISE 6: Superdense coding ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev)
def circuit():
    # Shared entangled pair: qubit 0 is Alice's, qubit 1 is Bob's.
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    # TODO: Alice encodes the message "11" on her qubit (wire 0).
    # Bob decodes with the Bell circuit backwards.
    qml.CNOT(wires=[0, 1])
    qml.Hadamard(wires=0)
    return qml.state()

state = circuit()
received = int(np.argmax(np.abs(state)))
print(f"Bob receives: {received:02b} (probability {abs(state[received])**2:.3f})")

_result = f"Message {received:02b}"
`,
        },
      },
    },
    bibliography: [
      {
        title: 'Communication via one- and two-particle operators on Einstein-Podolsky-Rosen states',
        author: 'C. H. Bennett & S. J. Wiesner',
        year: '1992',
        publisher: 'Physical Review Letters 69, 2881',
        link: 'https://doi.org/10.1103/PhysRevLett.69.2881',
        note: { es: 'El artículo que propuso la codificación superdensa.', en: 'The paper that proposed superdense coding.' },
      },
      { ...NIELSEN_CHUANG, note: { es: 'Sección 2.3: codificación superdensa.', en: 'Section 2.3: superdense coding.' } },
    ],
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: 'b2-l7',
    slug: 'teleportacion',
    qubits: 3,
    title: { es: '7. Teleportación Cuántica', en: '7. Quantum Teleportation' },
    subtitle: { es: 'Enviar un qubit desconocido con un par entrelazado y dos bits', en: 'Sending an unknown qubit with an entangled pair and two bits' },
    durationMinutes: 35,
    xpReward: 90,
    contentMarkdown: {
      es: String.raw`### 1. El problema
Alice tiene un qubit en un estado desconocido $|\psi\rangle = \alpha|0\rangle+\beta|1\rangle$ y quiere que lo tenga Bob. No puede medirlo para describirlo (perdería las amplitudes) ni copiarlo (no clonación). La teleportación lo consigue con un par entrelazado compartido y **dos bits clásicos**.

### 2. El protocolo
Usamos tres cables: $q_0 = |\psi\rangle$ (Alice), y un par $|\Phi^+\rangle$ en $q_1$ (Alice) y $q_2$ (Bob).
1. Alice aplica CNOT($q_0 \to q_1$) y $H$ a $q_0$.
2. Alice mide $q_0$ y $q_1$ y obtiene dos bits $m_0 m_1$, que envía a Bob por un canal clásico.
3. Bob aplica $X$ a $q_2$ si $m_1 = 1$, y después $Z$ si $m_0 = 1$. Su qubit queda en $|\psi\rangle$.

### 3. Por qué funciona
Tras el paso 1, el estado de los tres qubits se puede reescribir como

$$\frac{1}{2}\sum_{m_0,m_1} |m_0 m_1\rangle \otimes X^{m_1}Z^{m_0}|\psi\rangle$$

Cada resultado de Alice deja el qubit de Bob en $|\psi\rangle$ con una "corrección pendiente" conocida. Bob la deshace con $Z^{m_0}X^{m_1}$, porque $X^2 = Z^2 = I$.

### 4. Medida diferida
Medir y después aplicar una puerta según el resultado equivale a sustituir la medida por una **puerta controlada** y medir al final (principio de **medida diferida**). Así el protocolo se escribe con puertas: CNOT($q_1 \to q_2$) y CZ($q_0 \to q_2$). Es la versión que simulamos: al final, $q_2$ está en $|\psi\rangle$ y $q_0, q_1$ quedan en $|+\rangle|+\rangle$.

### 5. Lo que la teleportación no hace
- **No es más rápida que la luz**: sin los dos bits clásicos, el qubit de Bob está en un estado completamente mezclado.
- **No copia**: el estado original desaparece del lado de Alice.
- **No transporta materia**: se transfiere el estado cuántico, no el sistema físico.

Es una pieza básica de las redes cuánticas y de la computación distribuida.`,
      en: String.raw`### 1. The problem
Alice has a qubit in an unknown state $|\psi\rangle = \alpha|0\rangle+\beta|1\rangle$ and wants Bob to have it. She cannot measure it to describe it (she would lose the amplitudes) or copy it (no-cloning). Teleportation achieves it with a shared entangled pair and **two classical bits**.

### 2. The protocol
We use three wires: $q_0 = |\psi\rangle$ (Alice), and a $|\Phi^+\rangle$ pair on $q_1$ (Alice) and $q_2$ (Bob).
1. Alice applies CNOT($q_0 \to q_1$) and $H$ to $q_0$.
2. Alice measures $q_0$ and $q_1$, gets two bits $m_0 m_1$ and sends them to Bob over a classical channel.
3. Bob applies $X$ to $q_2$ if $m_1 = 1$, then $Z$ if $m_0 = 1$. His qubit ends in $|\psi\rangle$.

### 3. Why it works
After step 1, the state of the three qubits can be rewritten as

$$\frac{1}{2}\sum_{m_0,m_1} |m_0 m_1\rangle \otimes X^{m_1}Z^{m_0}|\psi\rangle$$

Each of Alice's outcomes leaves Bob's qubit in $|\psi\rangle$ up to a known "pending correction". Bob undoes it with $Z^{m_0}X^{m_1}$, because $X^2 = Z^2 = I$.

### 4. Deferred measurement
Measuring and then applying a gate depending on the result is equivalent to replacing the measurement with a **controlled gate** and measuring at the end (the **deferred measurement** principle). That way the protocol is written with gates: CNOT($q_1 \to q_2$) and CZ($q_0 \to q_2$). This is the version we simulate: at the end, $q_2$ is in $|\psi\rangle$ and $q_0, q_1$ are left in $|+\rangle|+\rangle$.

### 5. What teleportation does not do
- **It is not faster than light**: without the two classical bits, Bob's qubit is in a completely mixed state.
- **It does not copy**: the original state disappears from Alice's side.
- **It does not move matter**: the quantum state is transferred, not the physical system.

It is a basic building block of quantum networks and distributed computing.`,
    },
    exercise: {
      title: { es: 'Ejercicio 7: Teleportar Rᵧ(π/3)|0⟩', en: 'Exercise 7: Teleport Rᵧ(π/3)|0⟩' },
      description: {
        es: 'El código prepara |ψ⟩ = Rᵧ(π/3)|0⟩ en q0, crea el par entrelazado y hace la parte de Alice. Añade las correcciones de Bob en versión de medida diferida para que q2 termine en |ψ⟩.',
        en: 'The code prepares |ψ⟩ = Rᵧ(π/3)|0⟩ on q0, creates the entangled pair and runs Alice\'s part. Add Bob\'s corrections, in deferred-measurement form, so that q2 ends in |ψ⟩.',
      },
      targetGoal: { es: 'q2 con vector de Bloch (0.866, 0, 0.5) y longitud 1.', en: 'q2 with Bloch vector (0.866, 0, 0.5) and length 1.' },
      starterCode: {
        pennylane: {
          es: `# --- BLOQUE 2 · EJERCICIO 7: Teleportación ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def circuit():
    qml.RY(np.pi / 3, wires=0)  # estado a teleportar
    # Par entrelazado entre Alice (q1) y Bob (q2)
    qml.Hadamard(wires=1)
    qml.CNOT(wires=[1, 2])
    # Alice
    qml.CNOT(wires=[0, 1])
    qml.Hadamard(wires=0)
    # TODO: correcciones de Bob con medida diferida (CNOT desde q1 y CZ desde q0 hacia q2).
    return qml.state()

state = circuit()
probabilities = np.abs(state.reshape(2, 2, 2)) ** 2
p0_bob = probabilities[:, :, 0].sum()
print(f"P(q2 = 0) = {p0_bob:.3f}  (objetivo: cos^2(pi/6) = 0.750)")

_result = f"P(q2=0) = {p0_bob:.3f}"
`,
          en: `# --- BLOCK 2 · EXERCISE 7: Teleportation ---
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=3)

@qml.qnode(dev)
def circuit():
    qml.RY(np.pi / 3, wires=0)  # state to teleport
    # Entangled pair between Alice (q1) and Bob (q2)
    qml.Hadamard(wires=1)
    qml.CNOT(wires=[1, 2])
    # Alice
    qml.CNOT(wires=[0, 1])
    qml.Hadamard(wires=0)
    # TODO: Bob's corrections with deferred measurement (CNOT from q1 and CZ from q0 to q2).
    return qml.state()

state = circuit()
probabilities = np.abs(state.reshape(2, 2, 2)) ** 2
p0_bob = probabilities[:, :, 0].sum()
print(f"P(q2 = 0) = {p0_bob:.3f}  (target: cos^2(pi/6) = 0.750)")

_result = f"P(q2=0) = {p0_bob:.3f}"
`,
        },
      },
    },
    bibliography: [
      {
        title: 'Teleporting an unknown quantum state via dual classical and Einstein-Podolsky-Rosen channels',
        author: 'C. H. Bennett, G. Brassard, C. Crépeau, R. Jozsa, A. Peres, W. K. Wootters',
        year: '1993',
        publisher: 'Physical Review Letters 70, 1895',
        link: 'https://doi.org/10.1103/PhysRevLett.70.1895',
        note: { es: 'El artículo que propuso la teleportación cuántica.', en: 'The paper that proposed quantum teleportation.' },
      },
      { ...NIELSEN_CHUANG, note: { es: 'Sección 1.3.7: teleportación. Sección 4.4: principio de medida diferida.', en: 'Section 1.3.7: teleportation. Section 4.4: the deferred measurement principle.' } },
    ],
  },
];

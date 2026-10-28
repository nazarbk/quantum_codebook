"""Runs starter code, a reference solution and a 'cheat' for each exercise
through the same capture logic as src/workers/pyodide.worker.ts."""
import sys, io, json, re, traceback
sys.path.insert(0, sys.argv[2])
import numpy as np
starters = json.load(open(sys.argv[1]))
def run(code):
    out, g, err = io.StringIO(), {}, None
    old = sys.stdout; sys.stdout = out
    try: exec(code, g)
    except Exception: err = traceback.format_exc()
    finally: sys.stdout = old
    st = g.get("state")
    sv = None
    if st is not None:
        a = np.asarray(st).reshape(-1)
        if 2 <= a.size <= 64 and (a.size & (a.size - 1)) == 0: sv = [[float(v.real), float(v.imag)] for v in a]  # same rule as the worker
    smp = g.get("samples")
    smp = np.asarray(smp, dtype=float).tolist() if smp is not None else None  # flat (1 qubit) or rows (several), like the worker
    return {"stdout": out.getvalue(), "error": err, "statevector": sv, "samples": smp}
TODO = lambda code, marker, lines: code.replace(next(l for l in code.split("\n") if marker in l), lines)

def edit(slug, code):
    # Block 2 reference solutions: replace the TODO line with the missing gates.
    if slug == 'producto-tensorial': return TODO(code, "# TODO", "    qml.PauliX(wires=1)")
    if slug == 'cnot': return TODO(code, "# TODO", "    qml.CNOT(wires=[0, 1])")
    if slug == 'estados-bell': return TODO(code, "# TODO", "    qml.PauliX(wires=1)")
    if slug == 'medida-parcial': return TODO(code, "# TODO", "    qml.CNOT(wires=[0, 1])")
    if slug == 'no-clonacion': return TODO(code, "# TODO", "    qml.CNOT(wires=[0, 1])")
    if slug == 'codificacion-superdensa': return TODO(code, "# TODO", "    qml.PauliX(wires=0)\n    qml.PauliZ(wires=0)")
    if slug == 'teleportacion': return TODO(code, "# TODO", "    qml.CNOT(wires=[1, 2])\n    qml.CZ(wires=[0, 2])")
    if slug == '__miniproject_block-2__':
        code = code.replace("theta = 0", "theta = 2.1").replace("phi = 0", "phi = np.pi / 4")
        code = TODO(code, "par entrelazado", "    qml.Hadamard(wires=1)\n    qml.CNOT(wires=[1, 2])")
        code = TODO(code, "operaciones de Alice", "    qml.CNOT(wires=[0, 1])\n    qml.Hadamard(wires=0)")
        return TODO(code, "correcciones de Bob", "    qml.CNOT(wires=[1, 2])\n    qml.CZ(wires=[0, 2])")
    if slug == 'bit-vs-qubit': return code.replace("    qml.PauliX(wires=0)\n", "")
    if slug == 'vector-estado-born': return code.replace("    return qml.state()", "    qml.Hadamard(wires=0)\n    return qml.state()")
    if slug == 'esfera-de-bloch': return code.replace("    return qml.state()", "    qml.S(wires=0)\n    return qml.state()")
    if slug == 'puertas-monoqubit-1': return code.replace("    qml.Hadamard(wires=0)", "    qml.PauliX(wires=0)\n    qml.Hadamard(wires=0)")
    if slug in ('puertas-rotacion-fase', '__miniproject__'): return code.replace("theta = 0", "theta = np.pi/3")
    if slug == 'medida-y-colapso': return code.replace("    return qml.sample", "    qml.Hadamard(wires=0)\n    return qml.sample")
cheats = {
  'producto-tensorial': 'print("|01>: 0.7071  P = 0.500")\nprint("|11>: 0.7071  P = 0.500")',
  'cnot': 'print("Estado final: |10>")',
  'estados-bell': 'print("|01>: 0.7071")\nprint("|10>: 0.7071")',
  'medida-parcial': 'print("Coinciden en todos los disparos: True")',
  'no-clonacion': 'print("Solapamiento con el par de Bell |Phi+>: 1.000")',
  'codificacion-superdensa': 'print("Bob recibe: 11 (probabilidad 1.000)")',
  'teleportacion': 'print("P(q2 = 0) = 0.750")',
  '__miniproject_block-2__': 'theta = 2.1\nphi = 0.8\nprint("Bloch de q2 (Bob): [0.6 0.6 -0.5]")',
  'bit-vs-qubit': 'print("α (|0>): 1")\nprint("β (|1>): 0")',
  'vector-estado-born': 'print("P(|0>): 0.5")',
  'esfera-de-bloch': 'print("+0.7j")',
  'puertas-monoqubit-1': 'print("-0.7")',
  'puertas-rotacion-fase': 'print("P(|0>): 0.75")',
  'medida-y-colapso': 'print("Conteo |0>: 500")\nprint("Conteo |1>: 500")',
  '__miniproject__': 'print("P(|0>): 0.75")',
}
# Wrong-but-accepted cases: physically different state that still passes the regex.
wrong = {
  # Bob prepares the state himself instead of teleporting it: q2 is right but q0, q1 are not |+>.
  'teleportacion': starters['teleportacion'].replace("    qml.RY(np.pi / 3, wires=0)  # estado a teleportar", "    qml.RY(np.pi / 3, wires=2)  # estado a teleportar").replace("    qml.Hadamard(wires=1)\n    qml.CNOT(wires=[1, 2])\n", "").replace("    qml.CNOT(wires=[0, 1])\n    qml.Hadamard(wires=0)\n", ""),
  # Measuring with only H (no CNOT) gives uncorrelated bits.
  'medida-parcial': starters['medida-parcial'],
  # |-i> = (|0> - i|1>)/sqrt2 instead of |->
  'puertas-monoqubit-1': starters['puertas-monoqubit-1'].replace("    qml.Hadamard(wires=0)", "    qml.Hadamard(wires=0)\n    qml.S(wires=0)\n    qml.S(wires=0)\n    qml.S(wires=0)"),
  # correct alternative: theta written as 2*arccos(sqrt(.75)) (structural checker)
  'puertas-rotacion-fase': starters['puertas-rotacion-fase'].replace("theta = 0", "theta = 2*np.arccos(np.sqrt(0.75))"),
}
res = {}
for slug, code in starters.items():
    res[slug] = {"starter": run(code), "solution": run(edit(slug, code)), "cheat": run(cheats[slug])}
    if slug in wrong: res[slug]["variant"] = run(wrong[slug]); res[slug]["variant_code"] = wrong[slug]
    res[slug]["solution_code"] = edit(slug, code)
# --- Multi-qubit programs (Block 2 engine) ---
BELL = """import pennylane as qml
dev = qml.device("default.qubit", wires=2)
@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.state()
state = circuit()
"""
BELL_SAMPLES = """import pennylane as qml
dev = qml.device("default.qubit", wires=2, shots=1000)
@qml.qnode(dev)
def circuit():
    qml.H(0)
    qml.CNOT(wires=[0, 1])
    return qml.sample(wires=[0, 1])
samples = circuit()
"""
PRODUCT = """import pennylane as qml
dev = qml.device("default.qubit", wires=2)
@qml.qnode(dev)
def circuit():
    qml.H(0)
    qml.X(1)
    return qml.state()
state = circuit()
"""
res["__bell__"] = run(BELL)
res["__bell_samples__"] = run(BELL_SAMPLES)
res["__product__"] = run(PRODUCT)
print(json.dumps(res, ensure_ascii=False))

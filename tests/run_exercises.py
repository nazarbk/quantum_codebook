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
        if a.size == 2: sv = [[float(v.real), float(v.imag)] for v in a]
    smp = g.get("samples")
    smp = [float(v) for v in np.asarray(smp, dtype=float).reshape(-1)] if smp is not None else None
    return {"stdout": out.getvalue(), "error": err, "statevector": sv, "samples": smp}
def edit(slug, code):
    if slug == 'bit-vs-qubit': return code.replace("    qml.PauliX(wires=0)\n", "")
    if slug == 'vector-estado-born': return code.replace("    return qml.state()", "    qml.Hadamard(wires=0)\n    return qml.state()")
    if slug == 'esfera-de-bloch': return code.replace("    return qml.state()", "    qml.S(wires=0)\n    return qml.state()")
    if slug == 'puertas-monoqubit-1': return code.replace("    qml.Hadamard(wires=0)", "    qml.PauliX(wires=0)\n    qml.Hadamard(wires=0)")
    if slug in ('puertas-rotacion-fase', '__miniproject__'): return code.replace("theta = 0", "theta = np.pi/3")
    if slug == 'medida-y-colapso': return code.replace("    return qml.sample", "    qml.Hadamard(wires=0)\n    return qml.sample")
cheats = {
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
print(json.dumps(res, ensure_ascii=False))

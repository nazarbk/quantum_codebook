"""Minimal 1-qubit PennyLane stand-in (numpy) used ONLY to exercise the course's
starter code offline. Mimics: device, qnode, PauliX, Hadamard, S, RY, PauliZ,
state, probs, sample, expval. Not a substitute for real PennyLane."""
import numpy as np
__version__ = "fake-0"
_tape = None
class _Dev:
    def __init__(self, name, wires=1, shots=None): self.name, self.wires, self.shots = name, wires, shots
def device(name, wires=1, shots=None): return _Dev(name, wires, shots)
def _apply(m):
    if _tape is None: raise RuntimeError("gate outside qnode")
    _tape.append(np.asarray(m, dtype=complex))
def PauliX(wires=0): _apply([[0,1],[1,0]])
def Hadamard(wires=0): _apply(np.array([[1,1],[1,-1]])/np.sqrt(2))
def S(wires=0): _apply([[1,0],[0,1j]])
def RY(theta, wires=0):
    c, s = np.cos(theta/2), np.sin(theta/2); _apply([[c,-s],[s,c]])
class PauliZ:
    def __init__(self, wires=0): self.wires = wires
class _M:
    def __init__(self, kind, obs=None): self.kind, self.obs = kind, obs
def state(): return _M("state")
def probs(wires=0): return _M("probs")
def sample(obs=None): return _M("sample", obs)
def expval(obs): return _M("expval", obs)
def qnode(dev):
    def deco(fn):
        def run(*a, **k):
            global _tape
            _tape = []
            try: m = fn(*a, **k)
            finally: ops, _tape = _tape, None
            psi = np.array([1, 0], dtype=complex)
            for U in ops: psi = U @ psi
            if m.kind == "state": return psi
            p = np.abs(psi)**2
            if m.kind == "probs": return p
            if m.kind == "expval": return float(p[0]-p[1])
            if dev.shots is None: raise ValueError("sample requires shots")
            return np.where(np.random.default_rng(1).random(dev.shots) < p[0], 1.0, -1.0)
        return run
    return deco

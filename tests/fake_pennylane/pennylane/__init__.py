"""Minimal PennyLane stand-in (numpy statevector) used ONLY to exercise the course's
exercise code offline in tests. Not a substitute for real PennyLane.

Supports: device(wires=N, shots=…), qnode, H/Hadamard, X/PauliX, Y/PauliY, Z/PauliZ, S, T,
RX/RY/RZ, CNOT, CZ, SWAP, state(), probs(wires), sample(obs | wires), expval(PauliZ).
Wire order follows PennyLane: wire 0 is the most significant bit (|q0 q1 ...>).
"""
import numpy as np

__version__ = "fake-1"
_tape = None

_I = np.eye(2, dtype=complex)
_X = np.array([[0, 1], [1, 0]], dtype=complex)
_Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
_Z = np.array([[1, 0], [0, -1]], dtype=complex)
_H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)


class _Dev:
    def __init__(self, name, wires=1, shots=None):
        self.name, self.shots = name, shots
        self.wires = wires if isinstance(wires, int) else len(wires)


def device(name, wires=1, shots=None):
    return _Dev(name, wires, shots)


def _wires(wires):
    return [int(w) for w in (wires if isinstance(wires, (list, tuple)) else [wires])]


def _record(matrix, wires):
    if _tape is None:
        raise RuntimeError("gate outside qnode")
    _tape.append((np.asarray(matrix, dtype=complex), _wires(wires)))


def Hadamard(wires=0): _record(_H, wires)
def PauliX(wires=0): _record(_X, wires)
def PauliY(wires=0): _record(_Y, wires)
def S(wires=0): _record(np.diag([1, 1j]), wires)
def T(wires=0): _record(np.diag([1, np.exp(1j * np.pi / 4)]), wires)
H, X, Y = Hadamard, PauliX, PauliY


def RX(theta, wires=0):
    c, s = np.cos(theta / 2), np.sin(theta / 2)
    _record([[c, -1j * s], [-1j * s, c]], wires)


def RY(theta, wires=0):
    c, s = np.cos(theta / 2), np.sin(theta / 2)
    _record([[c, -s], [s, c]], wires)


def RZ(theta, wires=0):
    _record(np.diag([np.exp(-1j * theta / 2), np.exp(1j * theta / 2)]), wires)


def CNOT(wires):
    m = np.eye(4, dtype=complex)[[0, 1, 3, 2]]
    _record(m, wires)


def CZ(wires):
    _record(np.diag([1, 1, 1, -1]), wires)


def SWAP(wires):
    _record(np.eye(4, dtype=complex)[[0, 2, 1, 3]], wires)


class PauliZ:
    """Gate when called inside a qnode body, observable when passed to a measurement."""
    def __init__(self, wires=0):
        self.wires = _wires(wires)
        self._as_observable = False
        if _tape is not None:
            _tape.append((_Z, self.wires))
            self._index = len(_tape) - 1

    def _mark_observable(self):
        # It was recorded as a gate while being constructed; undo that.
        if _tape is not None and getattr(self, "_index", None) is not None:
            _tape[self._index] = None
        return self


Z = PauliZ


class _M:
    def __init__(self, kind, obs=None, wires=None):
        self.kind, self.obs, self.wires = kind, obs, wires


def state(): return _M("state")
def probs(wires=None): return _M("probs", wires=None if wires is None else _wires(wires))
def sample(obs=None, wires=None):
    if isinstance(obs, PauliZ): obs._mark_observable()
    return _M("sample", obs, None if wires is None else _wires(wires))
def expval(obs):
    if isinstance(obs, PauliZ): obs._mark_observable()
    return _M("expval", obs)


def _apply(psi, matrix, wires, n):
    k = len(wires)
    psi = np.moveaxis(psi.reshape([2] * n), wires, list(range(k)))
    shape = psi.shape
    psi = (matrix @ psi.reshape(2 ** k, -1)).reshape(shape)
    return np.moveaxis(psi, list(range(k)), wires).reshape(-1)


def _marginal(psi, wires, n):
    p = (np.abs(psi) ** 2).reshape([2] * n)
    other = tuple(i for i in range(n) if i not in wires)
    p = p.sum(axis=other) if other else p
    p = np.moveaxis(p, [sorted(wires).index(w) for w in wires], list(range(len(wires)))) if len(wires) > 1 else p
    return p.reshape(-1)


def qnode(dev, shots=None):
    def deco(fn):
        def run(*args, **kwargs):
            global _tape
            _tape = []
            try:
                m = fn(*args, **kwargs)
            finally:
                ops, _tape = [op for op in _tape if op is not None], None
            n = dev.wires
            psi = np.zeros(2 ** n, dtype=complex)
            psi[0] = 1
            for matrix, wires in ops:
                psi = _apply(psi, matrix, wires, n)
            if m.kind == "state":
                return psi
            if m.kind == "probs":
                return _marginal(psi, m.wires or list(range(n)), n)
            if m.kind == "expval":
                p = _marginal(psi, m.obs.wires, n)
                return float(p[0] - p[1])
            n_shots = shots if shots is not None else dev.shots
            if n_shots is None:
                raise ValueError("sample requires shots")
            rng = np.random.default_rng(1)
            if m.obs is not None:  # single-qubit PauliZ eigenvalues ±1
                p = _marginal(psi, m.obs.wires, n)
                return np.where(rng.random(n_shots) < p[0], 1.0, -1.0)
            wires = m.wires or list(range(n))
            p = _marginal(psi, wires, n)
            outcomes = rng.choice(len(p), size=n_shots, p=p / p.sum())
            bits = ((outcomes[:, None] >> np.arange(len(wires) - 1, -1, -1)) & 1).astype(int)
            return bits if len(wires) > 1 else bits[:, 0]
        return run
    return deco

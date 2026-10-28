import { CircuitOperation } from '../components/quantum/CircuitDiagram';

/*
 * Reads the PennyLane operations written in the editor, without running the code, so the
 * "Your circuit" diagram updates while the learner types.
 *
 * Understands:
 *  - short and long gate names: qml.H / qml.Hadamard, qml.X / qml.PauliX, qml.Y, qml.Z, S, T, SX…
 *  - wires given as keyword (wires=0, wires=[1]) or positionally (qml.H(1), qml.RX(0.5, 1))
 *  - several statements on one line, gates split across lines, comments and strings
 *  - rotations whose angle is a number, an expression (np.pi/3, 2*np.arccos(np.sqrt(0.75)))
 *    or a variable defined earlier in the file
 *  - qml.adjoint(qml.S(wires=0)) → S†, two-qubit gates (CNOT, CZ, SWAP) drawn on their first wire
 *  - measurements: qml.sample/expval/probs/counts/var(...) and qml.measure(...)
 * When the code defines a @qml.qnode function, only that function's body (up to its return) is read.
 */

type GateSpec = { label: string; params: number; wires: number };

const GATES: Record<string, GateSpec> = {
  H: { label: 'H', params: 0, wires: 1 }, Hadamard: { label: 'H', params: 0, wires: 1 },
  X: { label: 'X', params: 0, wires: 1 }, PauliX: { label: 'X', params: 0, wires: 1 },
  Y: { label: 'Y', params: 0, wires: 1 }, PauliY: { label: 'Y', params: 0, wires: 1 },
  Z: { label: 'Z', params: 0, wires: 1 }, PauliZ: { label: 'Z', params: 0, wires: 1 },
  S: { label: 'S', params: 0, wires: 1 }, T: { label: 'T', params: 0, wires: 1 },
  SX: { label: '√X', params: 0, wires: 1 },
  RX: { label: 'Rₓ', params: 1, wires: 1 }, RY: { label: 'Rᵧ', params: 1, wires: 1 },
  RZ: { label: 'Rz', params: 1, wires: 1 }, PhaseShift: { label: 'P', params: 1, wires: 1 },
  U1: { label: 'U1', params: 1, wires: 1 },
  CNOT: { label: 'CNOT', params: 0, wires: 2 }, CZ: { label: 'CZ', params: 0, wires: 2 },
  SWAP: { label: 'SWAP', params: 0, wires: 2 },
};
const ROTATIONS = new Set(['RX', 'RY', 'RZ', 'PhaseShift', 'U1']);
const MEASUREMENTS = new Set(['sample', 'expval', 'probs', 'counts', 'var', 'measure']);
/** qml.<name>(...) calls that are not circuit operations. */
const IGNORED = new Set(['device', 'qnode', 'state', 'density_matrix', 'draw', 'draw_mpl', 'specs', 'math', 'numpy', 'Identity', 'I', 'Barrier']);

const ROTATION_ID_NAME: Record<string, string> = { RX: 'RX', RY: 'RY', RZ: 'RZ', PhaseShift: 'P', U1: 'P' };

/** Stable id for a rotation so that equivalent angle expressions compare equal. */
export function rotationId(gate: 'RX' | 'RY' | 'RZ' | 'P', angle: number): string {
  return `${gate}:${(Math.round(angle * 1e4) / 1e4).toFixed(4)}`;
}

/** Pretty angle: π fractions when exact (π/3, 2π/3, −π/2…), otherwise two decimals. */
export function formatAngle(angle: number): string {
  for (let denominator = 1; denominator <= 12; denominator++) {
    const numerator = (angle / Math.PI) * denominator;
    if (Math.abs(numerator - Math.round(numerator)) < 1e-6) {
      const n = Math.round(numerator);
      if (n === 0) return '0';
      const sign = n < 0 ? '−' : '';
      const absN = Math.abs(n);
      const top = absN === 1 ? 'π' : `${absN}π`;
      return denominator === 1 ? `${sign}${top}` : `${sign}${top}/${denominator}`;
    }
  }
  return angle.toFixed(2);
}

export function readPennyLaneCircuit(source: string): CircuitOperation[] {
  const clean = stripCommentsAndStrings(source);
  const variables = collectAssignments(clean);
  const region = qnodeBody(clean);
  const operations: CircuitOperation[] = [];

  const callPattern = /qml\s*\.\s*([A-Za-z_]\w*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = callPattern.exec(region))) {
    const name = match[1];
    const argsStart = match.index + match[0].length;
    const argsEnd = findClosingParen(region, argsStart);
    const args = region.slice(argsStart, argsEnd);

    if (MEASUREMENTS.has(name)) {
      const inner = args.match(/qml\s*\.\s*\w+\s*\(([^)]*)\)/);
      const wire = inner ? readWires(splitArgs(inner[1]), 0)[0] : readWires(splitArgs(args), 0)[0];
      operations.push({ id: 'M', label: 'M', wire: wire ?? 0 });
      callPattern.lastIndex = argsEnd; // do not read the observable (e.g. PauliZ) as a gate
      continue;
    }

    if (name === 'adjoint') {
      const inner = args.match(/^\s*qml\s*\.\s*([A-Za-z_]\w*)\s*(?:\(([^)]*)\))?\s*(?:\)\s*\(([^)]*)\))?/);
      // qml.adjoint(qml.S(wires=0))  or  qml.adjoint(qml.S)(wires=0)
      const after = region.slice(argsEnd + 1).match(/^\s*\(([^)]*)\)/);
      if (inner && GATES[inner[1]]) {
        const gate = GATES[inner[1]];
        const wireArgs = splitArgs(inner[2] ?? after?.[1] ?? '');
        const wire = readWires(wireArgs, gate.params)[0] ?? 0;
        operations.push({ id: `${gate.label}†`, label: `${gate.label}†`, wire });
        callPattern.lastIndex = after ? argsEnd + 1 + after[0].length : argsEnd;
      } else {
        callPattern.lastIndex = argsEnd;
      }
      continue;
    }

    if (IGNORED.has(name)) { callPattern.lastIndex = argsEnd; continue; }

    const parts = splitArgs(args);
    const gate = GATES[name];
    if (!gate) {
      // Unknown operation: still show it if it acts on wires, so nothing silently disappears.
      if (/wires\s*=/.test(args)) {
        const wire = readWires(parts, 0)[0] ?? 0;
        operations.push({ id: name, label: name.length > 6 ? `${name.slice(0, 5)}…` : name, wire });
      }
      callPattern.lastIndex = argsEnd;
      continue;
    }

    const wires = readWires(parts, gate.params);
    const wire = wires[0] ?? 0;
    if (ROTATIONS.has(name)) {
      const rawAngle = parts.find((part) => !/^\s*wires\s*=/.test(part) && !/^\s*id\s*=/.test(part)) ?? '';
      const angle = evaluateExpression(rawAngle.replace(/^\s*phi\s*=|^\s*theta\s*=/, ''), variables);
      const idName = ROTATION_ID_NAME[name] as 'RX' | 'RY' | 'RZ' | 'P';
      if (angle === null) {
        operations.push({ id: `${idName}:?`, label: `${gate.label}(θ)`, wire });
      } else {
        operations.push({ id: rotationId(idName, angle), label: `${gate.label}(${formatAngle(angle)})`, wire });
      }
    } else if (gate.wires === 2) {
      // The diagram draws single-wire boxes, so a two-qubit gate is shown on its first wire.
      operations.push({ id: `${gate.label}:${wires.join(',')}`, label: gate.label, wire });
    } else {
      operations.push({ id: gate.label, label: gate.label, wire });
    }
    callPattern.lastIndex = argsEnd;
  }

  return operations;
}

/* ----------------------------------------------------------------- parsing helpers */

/** Removes comments and blanks string literals (keeping length/lines) so neither is parsed. */
function stripCommentsAndStrings(source: string): string {
  let out = '';
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '#') {
      while (i < source.length && source[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (ch === '"' || ch === "'") {
      const triple = source.startsWith(ch.repeat(3), i);
      const quote = triple ? ch.repeat(3) : ch;
      out += quote.replace(/./g, ' ');
      i += quote.length;
      while (i < source.length && !source.startsWith(quote, i)) {
        if (source[i] === '\\') { out += '  '; i += 2; continue; }
        if (!triple && source[i] === '\n') break;
        out += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (source.startsWith(quote, i)) { out += quote.replace(/./g, ' '); i += quote.length; }
      continue;
    }
    out += ch;
    i++;
  }
  return out.replace(/\r\n?/g, '\n');
}

/** Body of the first function decorated with @qml.qnode, up to and including its return. */
function qnodeBody(source: string): string {
  const lines = source.split('\n');
  const decorator = lines.findIndex((line) => /^\s*@\s*qml\s*\.\s*qnode\b/.test(line));
  if (decorator < 0) return source;
  const defIndex = lines.findIndex((line, index) => index > decorator && /^\s*def\s+\w+/.test(line));
  if (defIndex < 0) return source;
  const indentOf = (line: string) => line.match(/^\s*/)![0].length;
  const defIndent = indentOf(lines[defIndex]);
  let bodyIndent = -1;
  let depth = 0;
  let returning = false;
  const body: string[] = [];
  for (let index = defIndex + 1; index < lines.length; index++) {
    const line = lines[index];
    if (line.trim() && depth === 0) {
      if (indentOf(line) <= defIndent) break;            // function ended
      if (bodyIndent < 0) bodyIndent = indentOf(line);
      if (indentOf(line) === bodyIndent && /^\s*return\b/.test(line)) returning = true;
    }
    body.push(line);
    depth = Math.max(0, depth + (line.match(/[([{]/g) || []).length - (line.match(/[)\]}]/g) || []).length);
    if (returning && depth === 0) break;                  // code after return never runs
  }
  return body.join('\n');
}

function findClosingParen(text: string, start: number): number {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    if ('([{'.includes(text[i])) depth++;
    else if (')]}'.includes(text[i])) { depth--; if (depth === 0) return i; }
  }
  return text.length;
}

/** Splits a call's argument list on top-level commas. */
function splitArgs(args: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of args) {
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Wire indices from `wires=` or from the positional argument that follows `paramCount` parameters. */
function readWires(parts: string[], paramCount: number): number[] {
  const keyword = parts.find((part) => /^wires\s*=/.test(part));
  const raw = keyword ? keyword.replace(/^wires\s*=\s*/, '') : parts.filter((part) => !/^\w+\s*=/.test(part))[paramCount];
  if (!raw) return [];
  return (raw.match(/\d+/g) || []).map(Number);
}

function collectAssignments(source: string): Map<string, string> {
  const variables = new Map<string, string>();
  for (const line of source.split('\n')) {
    const assignment = line.match(/^\s*([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/);
    if (assignment) variables.set(assignment[1], assignment[2].trim());
  }
  return variables;
}

/* ----------------------------------------------------------------- tiny math evaluator */

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt, cos: Math.cos, sin: Math.sin, tan: Math.tan, exp: Math.exp, log: Math.log,
  arccos: Math.acos, acos: Math.acos, arcsin: Math.asin, asin: Math.asin, arctan: Math.atan, atan: Math.atan,
  abs: Math.abs, float: (x) => x, radians: (x) => (x * Math.PI) / 180, deg2rad: (x) => (x * Math.PI) / 180,
};

/** Safely evaluates a numeric Python expression (no eval). Returns null if it cannot. */
export function evaluateExpression(expression: string, variables: Map<string, string> = new Map(), depth = 0): number | null {
  if (depth > 8) return null;
  const tokens = expression
    .replace(/\b(?:np|numpy|pnp|math|qml\.math)\s*\.\s*/g, '')
    .match(/\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?|\*\*|[A-Za-z_]\w*|[-+*/()]/gi);
  if (!tokens || tokens.join('').length === 0) return null;
  let position = 0;
  const peek = () => tokens[position];
  const next = () => tokens[position++];

  const primary = (): number | null => {
    const token = next();
    if (token === undefined) return null;
    if (token === '(') { const value = sum(); if (next() !== ')') return null; return value; }
    if (token === '-') { const value = power(); return value === null ? null : -value; }
    if (token === '+') return power();
    if (/^[\d.]/.test(token)) return Number(token);
    if (token === 'pi') return Math.PI;
    if (FUNCTIONS[token] && peek() === '(') {
      next();
      const value = sum();
      if (next() !== ')' || value === null) return null;
      return FUNCTIONS[token](value);
    }
    const variable = variables.get(token);
    if (variable !== undefined) return evaluateExpression(variable, variables, depth + 1);
    return null;
  };
  const power = (): number | null => {
    const base = primary();
    if (base === null) return null;
    if (peek() === '**') { next(); const exponent = power(); return exponent === null ? null : base ** exponent; }
    return base;
  };
  const product = (): number | null => {
    let value = power();
    while (value !== null && (peek() === '*' || peek() === '/')) {
      const op = next();
      const right = power();
      if (right === null) return null;
      value = op === '*' ? value * right : value / right;
    }
    return value;
  };
  const sum = (): number | null => {
    let value = product();
    while (value !== null && (peek() === '+' || peek() === '-')) {
      const op = next();
      const right = product();
      if (right === null) return null;
      value = op === '+' ? value + right : value - right;
    }
    return value;
  };

  const result = sum();
  return result !== null && position === tokens.length && Number.isFinite(result) ? result : null;
}

/* ----------------------------------------------------------------- comparison */

export interface CircuitProgress {
  matched: number;
  missing: CircuitOperation[];
  extra: CircuitOperation[];
  hasOrderIssue: boolean;
  isComplete: boolean;
}

export function compareCircuit(actual: CircuitOperation[], target: CircuitOperation[]): CircuitProgress {
  const matched = target.filter((operation, index) => actual[index]?.id === operation.id && actual[index]?.wire === operation.wire).length;
  const remainingActual = [...actual];
  const missing = target.filter((operation) => {
    const matchIndex = remainingActual.findIndex((candidate) => candidate.id === operation.id && candidate.wire === operation.wire);
    if (matchIndex < 0) return true;
    remainingActual.splice(matchIndex, 1);
    return false;
  });
  const extra = remainingActual;
  const hasOrderIssue = missing.length === 0 && extra.length === 0 && matched !== target.length;
  return { matched, missing, extra, hasOrderIssue, isComplete: matched === target.length && actual.length === target.length };
}

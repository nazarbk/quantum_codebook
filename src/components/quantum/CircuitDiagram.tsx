import React from 'react';
import { Theme } from '../../types/theme';
import { layoutColumns, spanOf } from '../../utils/circuitLayout';

export interface CircuitOperation {
  id: string;
  label: string;
  /** Wire the operation is drawn on; for a two-qubit gate, its control (first) wire. */
  wire: number;
  /** Two-qubit gates: [control, target] for CNOT/CZ, the swapped pair for SWAP. */
  wires?: [number, number];
}

interface CircuitDiagramProps {
  operations: CircuitOperation[];
  title: string;
  description: string;
  lang?: 'es' | 'en';
  theme?: Theme;
  comparison?: 'current' | 'target';
}

const describe = (operation: CircuitOperation, es: boolean) => operation.wires
  ? `${operation.label} control q${operation.wires[0]} → q${operation.wires[1]}`
  : `${operation.label} ${es ? 'en' : 'on'} q${operation.wire}`;

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({ operations, title, description, lang = 'es', theme = 'dark', comparison = 'current' }) => {
  const wireCount = Math.max(1, ...operations.map((operation) => spanOf(operation)[1] + 1));
  const columns = layoutColumns(operations);
  const columnCount = Math.max(1, ...columns.map((column) => column + 1));
  const width = Math.max(310, 120 + columnCount * 80);
  const height = wireCount * 60 + 22;
  const colors = comparison === 'current'
    ? { gate: '#22d3ee', fill: '#0e7490', text: '#ecfeff' }
    : { gate: '#a78bfa', fill: '#6d28d9', text: '#f5f3ff' };
  const yOf = (wire: number) => 42 + wire * 60;
  const es = lang === 'es';
  const label = operations.length ? operations.map((operation) => describe(operation, es)).join(', ') : es ? 'sin puertas detectadas' : 'no gates detected';

  const drawOperation = (operation: CircuitOperation, x: number, key: string) => {
    if (operation.wires) {
      const [a, b] = operation.wires;
      const line = <line x1={x} y1={yOf(Math.min(a, b))} x2={x} y2={yOf(Math.max(a, b))} stroke={colors.gate} strokeWidth="2" />;
      const dot = (wire: number) => <circle cx={x} cy={yOf(wire)} r="6" fill={colors.gate} />;
      const cross = (wire: number) => <path d={`M ${x - 8} ${yOf(wire) - 8} L ${x + 8} ${yOf(wire) + 8} M ${x + 8} ${yOf(wire) - 8} L ${x - 8} ${yOf(wire) + 8}`} stroke={colors.gate} strokeWidth="2.5" />;
      if (operation.label === 'CNOT') {
        return <g key={key}>{line}{dot(a)}<circle cx={x} cy={yOf(b)} r="13" fill="none" stroke={colors.gate} strokeWidth="2" /><path d={`M ${x - 13} ${yOf(b)} H ${x + 13} M ${x} ${yOf(b) - 13} V ${yOf(b) + 13}`} stroke={colors.gate} strokeWidth="2" /></g>;
      }
      if (operation.label === 'CZ') return <g key={key}>{line}{dot(a)}{dot(b)}</g>;
      return <g key={key}>{line}{cross(a)}{cross(b)}</g>;
    }
    const y = yOf(operation.wire);
    if (operation.id === 'M') {
      return <g key={key}><rect x={x - 18} y={y - 18} width="36" height="36" rx="7" fill={colors.fill} fillOpacity="0.28" stroke={colors.gate} strokeWidth="1.5" /><text x={x} y={y + 5} textAnchor="middle" fill={colors.gate} fontSize="14" fontWeight="700">M</text></g>;
    }
    return <g key={key}><rect x={x - 25} y={y - 20} width="50" height="40" rx="7" fill={colors.fill} fillOpacity="0.7" stroke={colors.gate} strokeWidth="1.5" /><text x={x} y={y + 5} textAnchor="middle" fill={colors.text} fontSize={operation.label.length > 6 ? '11' : '14'} fontWeight="700" fontFamily="monospace">{operation.label}</text></g>;
  };

  return (
  <section className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
      <span className="text-[11px] font-medium" style={{ color: colors.gate }}>
        {comparison === 'current' ? (es ? 'Código actual' : 'Current code') : (es ? 'Referencia' : 'Reference')}
      </span>
    </div>
    <div className={`overflow-x-auto rounded-xl ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <svg className="block min-w-full" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${label}`}>
        {Array.from({ length: wireCount }, (_, wire) => (
          <g key={wire}><text x="14" y={yOf(wire) + 5} fill={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize="12" fontFamily="monospace">q{wire}</text><line x1="50" y1={yOf(wire)} x2={width - 16} y2={yOf(wire)} stroke={theme === 'dark' ? '#475569' : '#94a3b8'} strokeWidth="1.5" /></g>
        ))}
        {operations.map((operation, index) => drawOperation(operation, 80 + columns[index] * 80, `${operation.id}-${index}`))}
      </svg>
    </div>
    <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
  </section>
  );
};

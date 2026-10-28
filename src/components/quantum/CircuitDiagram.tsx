import React from 'react';
import { Theme } from '../../types/theme';

export interface CircuitOperation {
  id: string;
  label: string;
  wire: number;
}

interface CircuitDiagramProps {
  operations: CircuitOperation[];
  title: string;
  description: string;
  lang?: 'es' | 'en';
  theme?: Theme;
  comparison?: 'current' | 'target';
}

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({ operations, title, description, lang = 'es', theme = 'dark', comparison = 'current' }) => {
  const wireCount = Math.max(1, ...operations.map((operation) => operation.wire + 1));
  const width = Math.max(310, 120 + Math.max(operations.length, 1) * 80);
  const height = wireCount * 60 + 22;
  const colors = comparison === 'current'
    ? { gate: '#22d3ee', fill: '#0e7490', text: '#ecfeff' }
    : { gate: '#a78bfa', fill: '#6d28d9', text: '#f5f3ff' };
  const isMeasurement = (operation: CircuitOperation) => operation.id === 'M';

  return (
  <section className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h3>
      <span className="text-[11px] font-medium" style={{ color: colors.gate }}>
        {comparison === 'current' ? (lang === 'es' ? 'Código actual' : 'Current code') : (lang === 'es' ? 'Referencia' : 'Reference')}
      </span>
    </div>
    <div className={`overflow-x-auto rounded-xl ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <svg className="block min-w-full" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${operations.length ? operations.map((operation) => `${operation.label} en q${operation.wire}`).join(', ') : lang === 'es' ? 'sin puertas detectadas' : 'no gates detected'}`}>
        {Array.from({ length: wireCount }, (_, wire) => {
          const y = 42 + wire * 60;
          return <g key={wire}><text x="14" y={y + 5} fill={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize="12" fontFamily="monospace">q{wire}</text><line x1="50" y1={y} x2={width - 16} y2={y} stroke={theme === 'dark' ? '#475569' : '#94a3b8'} strokeWidth="1.5" /></g>;
        })}
        {operations.map((operation, index) => {
          const x = 80 + index * 80;
          const y = 42 + operation.wire * 60;
          return isMeasurement(operation) ? <g key={`${operation.id}-${index}`}><rect x={x - 18} y={y - 18} width="36" height="36" rx="7" fill={colors.fill} fillOpacity="0.28" stroke={colors.gate} strokeWidth="1.5" /><text x={x} y={y + 5} textAnchor="middle" fill={colors.gate} fontSize="14" fontWeight="700">M</text></g> : <g key={`${operation.id}-${index}`}><rect x={x - 25} y={y - 20} width="50" height="40" rx="7" fill={colors.fill} fillOpacity="0.7" stroke={colors.gate} strokeWidth="1.5" /><text x={x} y={y + 5} textAnchor="middle" fill={colors.text} fontSize={operation.label.length > 6 ? '11' : '14'} fontWeight="700" fontFamily="monospace">{operation.label}</text></g>;
        })}
      </svg>
    </div>
    <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
  </section>
  );
};

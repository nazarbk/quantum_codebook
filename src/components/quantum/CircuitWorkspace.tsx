import React from 'react';
import { Language } from '../../types/language';
import { Theme } from '../../types/theme';
import { CircuitOperation, CircuitDiagram } from './CircuitDiagram';
import { CircuitProgress } from '../../utils/pennylaneCircuit';

interface CircuitWorkspaceProps {
  actual: CircuitOperation[];
  target: CircuitOperation[];
  revealTarget: boolean;
  progress: CircuitProgress;
  lang: Language;
  theme: Theme;
}

const formatOperations = (operations: CircuitOperation[]) => operations.map((operation) => `${operation.label} · q${operation.wire}`).join(', ');

export const CircuitWorkspace: React.FC<CircuitWorkspaceProps> = ({ actual, target, revealTarget, progress, lang, theme }) => (
  <div className="space-y-3">
    <CircuitDiagram
      operations={actual}
      title={lang === 'es' ? 'Tu circuito' : 'Your circuit'}
      description={lang === 'es' ? 'Se actualiza al escribir: representa las operaciones PennyLane detectadas en el editor.' : 'Updates while you type: it represents the PennyLane operations detected in the editor.'}
      lang={lang}
      theme={theme}
      comparison="current"
    />

    {!revealTarget ? (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
        {lang === 'es' ? 'Activa «Circuito objetivo» para compararlo automáticamente con las operaciones de tu código.' : 'Enable “Target circuit” to compare it automatically with the operations in your code.'}
      </div>
    ) : (
      <>
        <CircuitDiagram
          operations={target}
          title={lang === 'es' ? 'Circuito objetivo' : 'Target circuit'}
          description={lang === 'es' ? 'Referencia para comparar puertas, orden y qubits.' : 'Reference for comparing gates, order, and qubits.'}
          lang={lang}
          theme={theme}
          comparison="target"
        />
        <div className={`rounded-xl border p-3 text-xs leading-relaxed ${progress.isComplete ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`} aria-live="polite">
          {progress.isComplete ? (
            <span>{lang === 'es' ? '✓ La estructura del circuito coincide con la referencia. Ejecuta el código para comprobar el resultado.' : '✓ The circuit structure matches the reference. Run the code to verify the result.'}</span>
          ) : (
            <div className="space-y-1.5">
              <p className="font-semibold text-cyan-200">{lang === 'es' ? `Progreso estructural: ${progress.matched}/${target.length} operaciones en la posición correcta.` : `Structural progress: ${progress.matched}/${target.length} operations in the correct position.`}</p>
              {progress.missing.length > 0 && <p>{lang === 'es' ? 'Falta: ' : 'Missing: '}<span className="font-mono text-violet-200">{formatOperations(progress.missing)}</span></p>}
              {progress.extra.length > 0 && <p>{lang === 'es' ? 'Revisa o elimina: ' : 'Review or remove: '}<span className="font-mono text-amber-200">{formatOperations(progress.extra)}</span></p>}
              {progress.hasOrderIssue && <p>{lang === 'es' ? 'Las puertas están presentes, pero su orden no coincide con el objetivo.' : 'The gates are present, but their order does not match the target.'}</p>}
            </div>
          )}
        </div>
      </>
    )}
  </div>
);

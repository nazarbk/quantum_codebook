import React from 'react';
import { BlochSphere } from './BlochSphere';
import { Language } from '../../types/language';
import { Theme } from '../../types/theme';
import { BlochCoordinates, ComplexPair, basisLabel, blochLength, probabilities, qubitCount, reducedBlochVector } from '../../utils/quantumMath';

interface MultiQubitStateViewProps {
  state: ComplexPair[];
  lang: Language;
  theme: Theme;
  /** Optional target state, drawn as outlined bars for comparison. */
  target?: ComplexPair[];
}

/** Phase of an amplitude mapped to a hue, so a relative phase is visible next to the probability. */
// Phase 0 maps to the app's cyan accent (hue 190), so a positive amplitude never looks like an error.
const phaseColor = ([re, im]: ComplexPair) => `hsl(${Math.round(((Math.atan2(im, re) * 180) / Math.PI + 190 + 360) % 360)} 70% 50%)`;
const formatPhase = ([re, im]: ComplexPair) => {
  if (Math.hypot(re, im) < 1e-9) return '—';
  const turns = Math.atan2(im, re) / Math.PI;
  const rounded = Math.round(turns * 4) / 4;
  if (Math.abs(turns - rounded) < 1e-3) {
    const map: Record<string, string> = { '0': '0', '0.25': 'π/4', '0.5': 'π/2', '0.75': '3π/4', '1': 'π', '-1': 'π', '-0.25': '−π/4', '-0.5': '−π/2', '-0.75': '−3π/4' };
    return map[String(rounded)] ?? `${rounded}π`;
  }
  return `${turns.toFixed(2)}π`;
};

/**
 * Two complementary views of a state of several qubits:
 *  - probability of every basis state (bar height) with its phase (bar colour);
 *  - one Bloch sphere per qubit using its reduced state. Product states keep length 1;
 *    entanglement shrinks the arrow towards the centre (0 for a Bell state).
 */
export const MultiQubitStateView: React.FC<MultiQubitStateViewProps> = ({ state, lang, theme, target }) => {
  const qubits = qubitCount(state);
  if (qubits === null) return null;
  const es = lang === 'es';
  const probs = probabilities(state);
  const targetProbs = target && target.length === state.length ? probabilities(target) : undefined;
  const reduced: BlochCoordinates[] = Array.from({ length: qubits }, (_, wire) => reducedBlochVector(state, wire));
  const entangled = reduced.some((vector) => blochLength(vector) < 0.99);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100">{es ? 'Probabilidades de medida' : 'Measurement probabilities'}</h3>
          <span className="text-[11px] text-slate-400">{es ? 'Orden de PennyLane: |q0 q1…⟩ · color = fase' : 'PennyLane order: |q0 q1…⟩ · colour = phase'}</span>
        </div>
        <div className="flex items-end gap-2 overflow-x-auto pb-1" role="list" aria-label={es ? 'Probabilidad de cada estado de la base' : 'Probability of each basis state'}>
          {probs.map((probability, index) => (
            <div key={index} role="listitem" className="flex min-w-[44px] flex-1 flex-col items-center gap-1" aria-label={`|${basisLabel(index, qubits)}⟩: ${(probability * 100).toFixed(1)}%`}>
              <span className="text-[10px] font-mono text-slate-300">{(probability * 100).toFixed(probability > 0 && probability < 0.1 ? 1 : 0)}%</span>
              <div className="relative h-28 w-full overflow-hidden rounded-md bg-slate-950">
                {targetProbs && <div className="absolute inset-x-0 bottom-0 border-2 border-dashed border-violet-400/70" style={{ height: `${targetProbs[index] * 100}%` }} />}
                <div className="absolute inset-x-1 bottom-0 rounded-t" style={{ height: `${probability * 100}%`, background: phaseColor(state[index]) }} />
              </div>
              <span className="text-xs font-mono font-bold text-slate-100">|{basisLabel(index, qubits)}⟩</span>
              <span className="text-[10px] font-mono text-slate-500">φ {formatPhase(state[index])}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100">{es ? 'Cada qubit por separado (estado reducido)' : 'Each qubit on its own (reduced state)'}</h3>
          <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${entangled ? 'border-violet-500/40 bg-violet-500/10 text-violet-200' : 'border-slate-700 text-slate-400'}`}>
            {entangled ? (es ? '⚛ Entrelazado' : '⚛ Entangled') : (es ? 'Estado producto' : 'Product state')}
          </span>
        </div>
        <p className="mb-3 text-xs text-slate-400">
          {es
            ? 'Si los qubits están entrelazados, ninguno tiene un estado puro propio: su flecha se acorta hacia el centro de la esfera.'
            : 'When the qubits are entangled, none has a pure state of its own: its arrow shrinks towards the centre of the sphere.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {reduced.map((vector, wire) => (
            <div key={wire} className="flex flex-col items-center">
              <p className="mb-1 text-center text-xs font-mono font-bold text-slate-300">q{wire} · |r| = {blochLength(vector).toFixed(2)}</p>
              <BlochSphere coordinates={vector} size={130} showLabels={false} theme={theme} />
              <p className="mt-1 text-center text-[10px] font-mono text-slate-400">
                x {vector.x.toFixed(2)} · y {vector.y.toFixed(2)} · z {vector.z.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

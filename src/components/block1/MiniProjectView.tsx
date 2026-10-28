import React, { useState } from 'react';
import { MINI_PROJECT_BLOCK_1 } from '../../data/block1Data';
import { QuantumCodeEditor } from '../editor/QuantumCodeEditor';
import { Language } from '../../types/language';
import { MathRenderer } from '../common/MathRenderer';
import { Theme } from '../../types/theme';
import { checkBiasedQrng } from '../../utils/exerciseChecks';

interface MiniProjectViewProps {
  completed: boolean;
  onCompleteMiniProject: (xp: number) => void;
  lang: Language;
  theme: Theme;
}

export const MiniProjectView: React.FC<MiniProjectViewProps> = ({
  completed,
  onCompleteMiniProject,
  lang,
  theme,
}) => {
  const [verified, setVerified] = useState<boolean>(completed);

  const [feedback, setFeedback] = useState<string>('');

  const handleExecutionSuccess = (_output: string, statevector?: [number, number][]) => {
    const check = checkBiasedQrng(MINI_PROJECT_BLOCK_1.targetBiasP0, statevector);
    if (check.passed) {
      setVerified(true);
      setFeedback('');
      onCompleteMiniProject(MINI_PROJECT_BLOCK_1.xpReward);
      return;
    }
    setVerified(completed);
    setFeedback(check.reason === 'missing-state'
      ? (lang === 'es' ? 'No se encontró la variable `state`: guarda el estado del circuito en `state` para verificar el reto.' : 'No `state` variable found: store the circuit state in `state` to verify the challenge.')
      : (lang === 'es' ? `El estado preparado no da P(|0⟩) = ${MINI_PROJECT_BLOCK_1.targetBiasP0}. Revisa el ángulo θ.` : `The prepared state does not give P(|0⟩) = ${MINI_PROJECT_BLOCK_1.targetBiasP0}. Check the angle θ.`));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎲</span>
            <div>
              <h2 className="text-lg font-black text-white">{MINI_PROJECT_BLOCK_1.title[lang]}</h2>
              <span className="text-xs text-amber-400 font-mono font-bold">
                +{MINI_PROJECT_BLOCK_1.xpReward} XP
              </span>
            </div>
          </div>
          <MathRenderer content={MINI_PROJECT_BLOCK_1.description[lang]} className="text-sm" />
          {feedback && <p role="status" className="text-xs text-amber-300">{feedback}</p>}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-3xl">{verified ? '🏆' : '🎯'}</span>
          <span className={`text-xs font-bold font-mono ${verified ? 'text-emerald-400' : 'text-amber-400'}`}>
            {verified ? (lang === 'es' ? '¡RETO SUPERADO!' : 'CHALLENGE PASSED!') : (lang === 'es' ? 'PENDIENTE' : 'PENDING')}
          </span>
        </div>
      </div>

      <div className="h-[500px]">
        <QuantumCodeEditor
          starterCodeMap={MINI_PROJECT_BLOCK_1.starterCode}
          initialSdk="pennylane"
          theme={theme}
          lang={lang}
          onCodeSuccess={handleExecutionSuccess}
        />
      </div>
    </div>
  );
};

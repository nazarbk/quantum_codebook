import React, { useState } from 'react';
import { QuantumCodeEditor } from '../editor/QuantumCodeEditor';
import { Language } from '../../types/language';
import { MathRenderer } from '../common/MathRenderer';
import { Theme } from '../../types/theme';
import type { BlockContent } from '../../types/block';
import type { Samples } from '../../types/worker';
import { CHECK_FEEDBACK } from '../../data/feedback';
import { MultiQubitStateView } from '../quantum/MultiQubitStateView';

interface MiniProjectViewProps {
  block: BlockContent;
  completed: boolean;
  onCompleteMiniProject: () => void;
  lang: Language;
  theme: Theme;
}

export const MiniProjectView: React.FC<MiniProjectViewProps> = ({
  block,
  completed,
  onCompleteMiniProject,
  lang,
  theme,
}) => {
  const project = block.miniProject;
  const [verified, setVerified] = useState<boolean>(completed);
  const [feedback, setFeedback] = useState<string>('');
  const [code, setCode] = useState<string>(project.starterCode.pennylane[lang]);
  const [lastState, setLastState] = useState<[number, number][] | null>(null);
  const es = lang === 'es';

  const handleExecutionSuccess = (_output: string, statevector?: [number, number][], samples?: Samples) => {
    setLastState(statevector && statevector.length > 2 ? statevector : null);
    const check = block.validateMiniProject({ statevector, samples, code });
    if (check.passed) {
      setVerified(true);
      setFeedback('');
      onCompleteMiniProject();
      return;
    }
    setVerified(completed);
    setFeedback(check.reason === 'wrong-result' && project.wrongResultHint ? project.wrongResultHint[lang] : CHECK_FEEDBACK[check.reason][lang]);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{project.icon ?? '🚀'}</span>
            <div>
              <h2 className="text-lg font-black text-white">{project.title[lang]}</h2>
              <span className="text-xs text-amber-400 font-mono font-bold">
                +{project.xpReward} XP
              </span>
            </div>
          </div>
          <MathRenderer content={project.description[lang]} className="text-sm" />
          {feedback && <p role="status" className="text-xs text-amber-300">{feedback}</p>}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-3xl">{verified ? '🏆' : '🎯'}</span>
          <span className={`text-xs font-bold font-mono ${verified ? 'text-emerald-400' : 'text-amber-400'}`}>
            {verified ? (es ? '¡RETO SUPERADO!' : 'CHALLENGE PASSED!') : (es ? 'PENDIENTE' : 'PENDING')}
          </span>
        </div>
      </div>

      <div className="h-[560px]">
        <QuantumCodeEditor
          starterCodeMap={project.starterCode}
          initialSdk="pennylane"
          theme={theme}
          lang={lang}
          onCodeSuccess={handleExecutionSuccess}
          onCodeChange={setCode}
        />
      </div>

      {lastState && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100">{es ? 'Estado tras la última ejecución' : 'State after the last run'}</h3>
          <MultiQubitStateView state={lastState} lang={lang} theme={theme} />
        </section>
      )}
    </div>
  );
};

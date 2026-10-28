import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { QuantumSDK } from '../../types/worker';
import { Theme } from '../../types/theme';
import { SdkSelector } from './SdkSelector';
import { usePyodide } from '../../hooks/usePyodide';
import { Language } from '../../types/language';
import { LocalizedCode } from '../../types/block';
import { Samples, WorkerStatus } from '../../types/worker';
import { translateStarterCode } from '../../utils/localizedCode';

const UI = {
  es: {
    reset: '↺ Reiniciar', resetTitle: 'Restablecer código del ejercicio', running: 'Ejecutando Python...',
    stop: '⏹ Detener', retry: '↻ Reintentar', run: '▶ Ejecutar Código', console: 'Consola de Salida',
    hide: '▼ Ocultar Terminal', show: '▲ Mostrar Terminal',
    placeholder: 'Presiona "▶ Ejecutar Código" para ver la salida del motor cuántico en tiempo real...',
  },
  en: {
    reset: '↺ Reset', resetTitle: 'Restore the exercise code', running: 'Running Python...',
    stop: '⏹ Stop', retry: '↻ Retry', run: '▶ Run Code', console: 'Output Console',
    hide: '▼ Hide Terminal', show: '▲ Show Terminal',
    placeholder: 'Press "▶ Run Code" to see the quantum engine output in real time...',
  },
} as const;

const STATUS_LABEL: Record<WorkerStatus, Record<Language, string>> = {
  idle: { es: 'Iniciando…', en: 'Starting…' },
  loading_pyodide: { es: 'Cargando Python (Pyodide)…', en: 'Loading Python (Pyodide)…' },
  installing_sdk: { es: 'Instalando PennyLane…', en: 'Installing PennyLane…' },
  ready: { es: 'PennyLane listo', en: 'PennyLane ready' },
  executing: { es: 'Ejecutando simulación…', en: 'Running simulation…' },
  error: { es: 'Error del motor Python', en: 'Python engine error' },
};

interface QuantumCodeEditorProps {
  starterCodeMap: Record<string, LocalizedCode>;
  initialSdk?: QuantumSDK;
  lang?: Language;
  theme?: Theme;
  onCodeSuccess?: (output: string, statevector?: [number, number][], samples?: Samples) => void;
  onCodeChange?: (code: string) => void;
}

export const QuantumCodeEditor: React.FC<QuantumCodeEditorProps> = ({
  starterCodeMap,
  initialSdk = 'pennylane',
  theme = 'dark',
  lang = 'es',
  onCodeSuccess,
  onCodeChange,
}) => {
  const [sdk, setSdk] = useState<QuantumSDK>(initialSdk);
  const starterFor = (target: QuantumSDK, language: Language) =>
    (starterCodeMap[target] ?? starterCodeMap.pennylane)?.[language] ?? '';
  const [code, setCode] = useState<string>(() => starterFor(initialSdk, lang));
  const t = UI[lang];
  const langRef = useRef(lang);
  const [showTerminal, setShowTerminal] = useState<boolean>(true);

  const { status, statusMessage, isExecuting, output, error, statevector, samples, runCode, abortExecution } =
    usePyodide(sdk, lang);
  const canRun = status === 'ready' || status === 'error';
  const onCodeSuccessRef = React.useRef(onCodeSuccess);
  const onCodeChangeRef = React.useRef(onCodeChange);

  useEffect(() => { onCodeSuccessRef.current = onCodeSuccess; }, [onCodeSuccess]);
  useEffect(() => { onCodeChangeRef.current = onCodeChange; }, [onCodeChange]);

  // New exercise or SDK: load its starter code in the current language.
  useEffect(() => {
    setCode(starterFor(sdk, langRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterCodeMap, sdk]);

  // Language change: translate the starter comments/texts, keeping any code the learner wrote.
  useEffect(() => {
    const previous = langRef.current;
    if (previous === lang) return;
    langRef.current = lang;
    setCode((current) => translateStarterCode(current, starterFor(sdk, previous), starterFor(sdk, lang)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    onCodeChangeRef.current?.(code);
  }, [code]);

  const handleSdkChange = (newSdk: QuantumSDK) => {
    setSdk(newSdk);
    setCode(starterFor(newSdk, lang));
  };

  const handleResetCode = () => {
    setCode(starterFor(sdk, lang));
  };

  useEffect(() => {
    if (output && !error) {
      onCodeSuccessRef.current?.(output, statevector, samples);
    }
  }, [output, error, statevector, samples]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme('quantum-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C678DD', fontStyle: 'bold' },
        { token: 'string', foreground: '98C379' },
        { token: 'comment', foreground: '5C6370', fontStyle: 'italic' },
        { token: 'number', foreground: 'D19A66' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.lineHighlightBackground': '#1e293b50',
        'editorCursor.foreground': '#6366f1',
        'editor.selectionBackground': '#334155',
      },
    });
    monaco.editor.defineTheme('quantum-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '7653B8', fontStyle: 'bold' },
        { token: 'string', foreground: '16726B' },
        { token: 'comment', foreground: '78869A', fontStyle: 'italic' },
        { token: 'number', foreground: '9B5A23' },
      ],
      colors: {
        'editor.background': '#F7F9FC',
        'editor.foreground': '#24354B',
        'editor.lineHighlightBackground': '#EAF0F7',
        'editorCursor.foreground': '#087F8A',
        'editor.selectionBackground': '#C9D9EE',
      },
    });
  };

  return (
    <div className="flex flex-col h-full border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <SdkSelector selectedSdk={sdk} onSelectSdk={handleSdkChange} disabled={isExecuting} />
          
          <button
            onClick={handleResetCode}
            disabled={isExecuting}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-800"
            title={t.resetTitle}
          >
            {t.reset}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div title={statusMessage} className="flex items-center space-x-2 text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'ready'
                  ? 'bg-emerald-400'
                  : status === 'executing'
                  ? 'bg-amber-400 animate-ping'
                  : status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-indigo-400 animate-pulse'
              }`}
            />
            <span className="text-slate-300">
              {isExecuting ? t.running : STATUS_LABEL[status][lang]}
            </span>
          </div>

          {isExecuting ? (
            <button
              onClick={abortExecution}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
            >
              <span>{t.stop}</span>
            </button>
          ) : (
            <button
              onClick={() => runCode(code, sdk)}
              disabled={!canRun}
              className={`
                flex items-center space-x-1.5 px-5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg
                ${
                  canRun
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }
              `}
            >
              <span>{status === 'error' ? t.retry : t.run}</span>
            </button>
          )}
        </div>
      </div>

      {/* MONACO EDITOR */}
      <div className="flex-1 min-h-[300px] relative">
        <Editor
          height="100%"
          defaultLanguage="python"
          language="python"
          theme={theme === 'dark' ? 'quantum-dark' : 'quantum-light'}
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            smoothScrolling: true,
          }}
        />
      </div>

      {/* CONSOLE / TERMINAL OUTPUT */}
      <div className="border-t border-slate-800 bg-slate-900/95 flex flex-col">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/80 bg-slate-950/50">
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="text-emerald-400">❯_</span> {t.console}
          </span>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="text-[11px] text-slate-400 hover:text-slate-200 font-mono"
          >
            {showTerminal ? t.hide : t.show}
          </button>
        </div>

        {showTerminal && (
          <div className="p-4 h-56 overflow-y-auto overflow-x-auto font-mono text-sm bg-slate-950 text-slate-200 selection:bg-indigo-500 selection:text-white">
            {error ? (
              <pre className="text-rose-400 whitespace-pre-wrap break-words font-mono text-sm leading-6">{error}</pre>
            ) : output ? (
              <pre className="text-emerald-300 whitespace-pre-wrap break-words font-mono text-sm leading-6">{output}</pre>
            ) : (
              <span className="text-slate-600 italic">
                {t.placeholder}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

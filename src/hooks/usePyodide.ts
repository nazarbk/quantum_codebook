import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuantumSDK, Samples, WorkerStatus, WorkerToMainMessage } from '../types/worker';
import type { Language } from '../types/language';

const MESSAGES = {
  es: {
    noPrints: '✓ Código ejecutado correctamente (sin impresiones explícitas).',
    workerFailed: 'No se pudo iniciar el motor Python.',
    workerError: 'Error del worker de Python.',
    cancelled: 'Ejecución cancelada por el usuario.',
  },
  en: {
    noPrints: '✓ Code ran successfully (nothing was printed).',
    workerFailed: 'The Python engine could not start.',
    workerError: 'Python worker error.',
    cancelled: 'Execution cancelled by the user.',
  },
} as const;

let persistentWorker: Worker | null = null;

function getPersistentWorker() {
  if (!persistentWorker) {
    persistentWorker = new Worker(
      new URL('../workers/pyodide.worker.ts', import.meta.url),
      { type: 'module' }
    );
  }
  return persistentWorker;
}

function resetPersistentWorker() {
  persistentWorker?.terminate();
  persistentWorker = null;
}

export function usePyodide(defaultSdk: QuantumSDK = 'pennylane', lang: Language = 'es') {
  const langRef = useRef(lang);
  langRef.current = lang;
  const [status, setStatus] = useState<WorkerStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [statevector, setStatevector] = useState<[number, number][] | undefined>();
  const [samples, setSamples] = useState<Samples | undefined>();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const workerRef = useRef<Worker | null>(null);
  const activeExecutionId = useRef<string | null>(null);
  const selectedSdkRef = useRef(defaultSdk);
  selectedSdkRef.current = defaultSdk;

  const createWorker = useCallback(() => {
    const worker = getPersistentWorker();

    worker.onmessage = (event: MessageEvent<WorkerToMainMessage>) => {
      const msg = event.data;

      switch (msg.type) {
        case 'STATUS_CHANGE':
          setStatus(msg.status);
          if (msg.message) setStatusMessage(msg.message);
          if (msg.status === 'error' && msg.message) setError(msg.message);
          break;

        case 'EXECUTE_SUCCESS':
          if (msg.executionId === activeExecutionId.current) {
            setOutput(msg.result.stdout || MESSAGES[langRef.current].noPrints);
            setStatevector(msg.result.statevector);
            setSamples(msg.result.samples);
            setError(null);
            setIsExecuting(false);
            activeExecutionId.current = null;
          }
          break;

        case 'EXECUTE_ERROR':
          if (msg.executionId === activeExecutionId.current) {
            setError(msg.error);
            setIsExecuting(false);
            activeExecutionId.current = null;
          }
          break;
      }
    };

    worker.onerror = (event) => {
      if (persistentWorker === worker) persistentWorker = null;
      setStatus('error');
      setStatusMessage(MESSAGES[langRef.current].workerFailed);
      setError(event.message || MESSAGES[langRef.current].workerError);
      setIsExecuting(false);
      activeExecutionId.current = null;
    };

    workerRef.current = worker;
    return worker;
  }, []);

  useEffect(() => {
    const worker = createWorker();
    worker.postMessage({ type: 'INIT', targetSdk: selectedSdkRef.current });
    return () => {
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [createWorker]);

  const runCode = useCallback((code: string, sdk: QuantumSDK) => {
    if (!workerRef.current || isExecuting) return;

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    activeExecutionId.current = executionId;

    setIsExecuting(true);
    setOutput('');
    setError(null);
    setStatevector(undefined);
      setSamples(undefined);

    workerRef.current.postMessage({
      type: 'EXECUTE',
      code,
      sdk,
      executionId
    });
  }, [isExecuting]);

  const abortExecution = useCallback(() => {
    if (workerRef.current) {
      resetPersistentWorker();
      activeExecutionId.current = null;
      setIsExecuting(false);
      setStatus('idle');
      setError(MESSAGES[langRef.current].cancelled);
      setOutput('');
      setStatevector(undefined);
      setSamples(undefined);
      const worker = createWorker();
      worker.postMessage({ type: 'INIT', targetSdk: selectedSdkRef.current });
    }
  }, [createWorker]);

  return {
    status,
    statusMessage,
    isExecuting,
    output,
    error,
    statevector,
    samples,
    runCode,
    abortExecution
  };
}

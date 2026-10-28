export type QuantumSDK = 'pennylane';

/** Shots from a user variable named `samples`: flat for 1 qubit, one row of bits per shot for several. */
export type Samples = number[] | number[][];

export type WorkerStatus = 
  | 'idle' 
  | 'loading_pyodide' 
  | 'installing_sdk' 
  | 'ready' 
  | 'executing' 
  | 'error';

export type MainToWorkerMessage =
  | { type: 'INIT'; targetSdk?: QuantumSDK }
  | { type: 'EXECUTE'; code: string; sdk: QuantumSDK; executionId: string }
  | { type: 'TERMINATE' };

export type WorkerToMainMessage =
  | { type: 'STATUS_CHANGE'; status: WorkerStatus; message?: string }
  | { type: 'STDOUT'; executionId: string; text: string }
  | { type: 'STDERR'; executionId: string; text: string }
  | { 
      type: 'EXECUTE_SUCCESS'; 
      executionId: string; 
      result: {
        stdout: string;
        returnedValue?: string;
        statevector?: [number, number][];
        /** Values of a user variable named `samples` (e.g. qml.sample eigenvalues ±1). */
        samples?: Samples;
        circuitSvg?: string;
        executionTimeMs: number;
      }
    }
  | { type: 'EXECUTE_ERROR'; executionId: string; error: string };

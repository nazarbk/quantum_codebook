import type { MainToWorkerMessage, QuantumSDK, WorkerStatus } from '../types/worker';

const PYODIDE_VERSION = '0.29.4';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
interface PyodideInterface {
  loadPackage(packages: string[]): Promise<void>;
  runPythonAsync(source: string): Promise<unknown>;
  pyimport<T = { install: (requirements: string[]) => Promise<unknown> }>(moduleName: string): T;
  globals: { get(name: string): unknown };
}
let pyodide: PyodideInterface | null = null;
let pyodideInitialization: Promise<PyodideInterface> | null = null;
const installedSDKs = new Set<QuantumSDK>();
const sdkInstallations = new Map<QuantumSDK, Promise<void>>();

function postStatus(status: WorkerStatus, message?: string) {
  self.postMessage({ type: 'STATUS_CHANGE', status, message });
}

async function initPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  if (pyodideInitialization) return pyodideInitialization;
  pyodideInitialization = (async () => {
    postStatus('loading_pyodide', `Cargando motor de Python (Pyodide ${PYODIDE_VERSION})...`);

    // Load the JavaScript loader from the same version as the runtime assets.
    // This keeps the loader and indexURL ABI in sync without relying on a stale npm copy.
    const runtime = await import(/* @vite-ignore */ `${PYODIDE_BASE_URL}pyodide.mjs`) as {
      loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
    };
    const instance: PyodideInterface = await runtime.loadPyodide({ indexURL: PYODIDE_BASE_URL });
    pyodide = instance;

    await instance.loadPackage([
      'numpy', 'scipy', 'micropip', 'networkx', 'rustworkx', 'autograd',
      'cachetools', 'packaging', 'requests', 'typing-extensions',
    ]);

    postStatus('ready', 'Entorno Python inicializado.');
    return instance;
  })();

  try {
    return await pyodideInitialization;
  } finally {
    pyodideInitialization = null;
  }
}

async function loadSDK(sdk: QuantumSDK) {
  if (installedSDKs.has(sdk)) return;
  const existingInstallation = sdkInstallations.get(sdk);
  if (existingInstallation) return existingInstallation;

  const installation = (async () => {
    const py = await initPyodide();
    postStatus('installing_sdk', `Instalando librerías para ${sdk.toUpperCase()}...`);

    try {
      if (sdk === 'pennylane') {
        // Install its pure-Python dependencies normally, but skip
        // pennylane-lightning: its native extension has no wheel for this runtime.
        // default.qubit is PennyLane's built-in Python simulator and needs no Lightning.
        await py.runPythonAsync(`
import micropip
await micropip.install(['appdirs', 'autoray==0.8.2', 'tomlkit', 'diastatic-malt'])
await micropip.install('pennylane==0.45.1', deps=False)
import pennylane as qml
qml.device('default.qubit', wires=1)
`);
      } else {
        throw new Error(`El entorno ${sdk} no está soportado en Pyodide. Usa PennyLane.`);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      postStatus('error', `No se pudo instalar ${sdk.toUpperCase()} en Pyodide.`);
      throw new Error(`No se pudo instalar ${sdk} en este navegador: ${detail}`);
    }

    installedSDKs.add(sdk);
    postStatus('ready', `${sdk.toUpperCase()} listo.`);
  })();

  sdkInstallations.set(sdk, installation);
  try {
    await installation;
  } finally {
    sdkInstallations.delete(sdk);
  }
}

async function runPythonCode(code: string, sdk: QuantumSDK, executionId: string) {
  try {
    if (!pyodide) await initPyodide();
    await loadSDK(sdk);
  } catch (err) {
    self.postMessage({
      type: 'EXECUTE_ERROR',
      executionId,
      error: err instanceof Error ? err.message : String(err),
    });
    postStatus('error', err instanceof Error ? err.message : String(err));
    return;
  }
  postStatus('executing', 'Ejecutando simulación cuántica...');

  const startTime = performance.now();

  const pythonWrapperCode = `
import sys
import io

_sys_stdout = sys.stdout
_sys_stderr = sys.stderr
_captured_out = io.StringIO()
_captured_err = io.StringIO()

sys.stdout = _captured_out
sys.stderr = _captured_err

__execution_result__ = None
__execution_error__ = None

try:
    _user_globals = {}
    exec(${JSON.stringify(code)}, _user_globals)
    
    if "_result" in _user_globals:
        __execution_result__ = str(_user_globals["_result"])
except Exception as e:
    import traceback
    __execution_error__ = traceback.format_exc()
finally:
    sys.stdout = _sys_stdout
    sys.stderr = _sys_stderr

_out_str = _captured_out.getvalue()
_err_str = _captured_err.getvalue()
_state_json = None
try:
    import json as _json
    import numpy as _np
    _candidate_state = _user_globals.get('state')
    if _candidate_state is not None:
        _candidate_state = _np.asarray(_candidate_state).reshape(-1)
        if _candidate_state.size == 2 and _np.all(_np.isfinite(_candidate_state)):
            _state_json = _json.dumps([[float(_np.real(v)), float(_np.imag(v))] for v in _candidate_state])
except Exception:
    pass
_samples_json = None
try:
    _candidate_samples = _user_globals.get('samples')
    if _candidate_samples is not None:
        _candidate_samples = _np.asarray(_candidate_samples, dtype=float).reshape(-1)
        if 0 < _candidate_samples.size <= 100000 and _np.all(_np.isfinite(_candidate_samples)):
            _samples_json = _json.dumps(_candidate_samples.tolist())
except Exception:
    pass
`;

  try {
    await pyodide!.runPythonAsync(pythonWrapperCode);

    const error = pyodide!.globals.get('__execution_error__');
    const stdout = pyodide!.globals.get('_out_str');
    const returnedValue = pyodide!.globals.get('__execution_result__');
    const stateJson = pyodide!.globals.get('_state_json');
    const samplesJson = pyodide!.globals.get('_samples_json');
    let samples: number[] | undefined;
    if (typeof samplesJson === 'string') {
      try { samples = JSON.parse(samplesJson) as number[]; } catch { samples = undefined; }
    }
    let statevector: [number, number][] | undefined;
    if (typeof stateJson === 'string') {
      try { statevector = JSON.parse(stateJson) as [number, number][]; } catch { statevector = undefined; }
    }

    const executionTimeMs = performance.now() - startTime;

    if (error) {
      self.postMessage({
        type: 'EXECUTE_ERROR',
        executionId,
        error: String(error)
      });
    } else {
      self.postMessage({
        type: 'EXECUTE_SUCCESS',
        executionId,
        result: {
          stdout: String(stdout || ''),
          returnedValue: returnedValue ? String(returnedValue) : undefined,
          statevector,
          samples,
          executionTimeMs: Math.round(executionTimeMs)
        }
      });
    }
  } catch (err: any) {
    self.postMessage({
      type: 'EXECUTE_ERROR',
      executionId,
      error: err.message || 'Error en tiempo de ejecución de Python.'
    });
  } finally {
    postStatus('ready', `${sdk.toUpperCase()} listo.`);
  }
}

self.onmessage = async (event: MessageEvent<MainToWorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'INIT':
      try {
        await initPyodide();
        if (message.targetSdk) await loadSDK(message.targetSdk);
        // A new editor may attach to an already-initialised worker; tell it the engine is ready.
        postStatus('ready', message.targetSdk ? `${message.targetSdk.toUpperCase()} listo.` : 'Entorno Python inicializado.');
      } catch (err) {
        postStatus('error', err instanceof Error ? err.message : String(err));
      }
      break;
    case 'EXECUTE':
      await runPythonCode(message.code, message.sdk, message.executionId);
      break;
    case 'TERMINATE':
      self.close();
      break;
  }
};

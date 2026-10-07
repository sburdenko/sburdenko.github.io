/**
 * Lazy Pyodide in a worker. The only third-party code on the site, and it loads only when someone presses RUN.
 * runPython(code, { stdin, files, onOutput }) → Promise<{ ok, ms, error }>. A run longer than TIMEOUT_MS kills the worker.
 */
export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
export const TIMEOUT_MS = 5000;

let worker = null, ready = null, nextId = 1;
const pending = new Map();

function spawn() {
  worker = new Worker(new URL('./py-worker.js', import.meta.url));
  ready = new Promise((resolve, reject) => {
    const onMessage = event => {
      const msg = event.data;
      if (msg.type === 'ready') { worker.removeEventListener('message', onMessage); resolve(); }
      if (msg.type === 'fail') { worker.removeEventListener('message', onMessage); reject(new Error(msg.error)); }
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', e => reject(new Error(e.message || 'worker error')));
  });
  worker.addEventListener('message', event => {
    const msg = event.data;
    if (msg.type === 'out') { for (const job of pending.values()) job.onOutput(msg.text, msg.stream); }
    if (msg.type === 'done') { const job = pending.get(msg.id); if (job) { clearTimeout(job.timer); pending.delete(msg.id); job.resolve({ ok: !msg.error, ms: msg.ms, error: msg.error || null }); } }
  });
  worker.postMessage({ type: 'init', url: PYODIDE_URL });
  return ready;
}

/** Resolves when Python is loaded; rejects when the CDN is unreachable. */
export function loadPython() {
  if (!ready) spawn().catch(() => { worker && worker.terminate(); worker = null; ready = null; });
  return ready;
}

export async function runPython(code, { stdin = [], files = {}, onOutput = () => {}, timeoutMs = TIMEOUT_MS } = {}) {
  await loadPython();
  const id = nextId++;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null; ready = null;
      resolve({ ok: false, ms: timeoutMs, error: null, timeout: true });
    }, timeoutMs);
    pending.set(id, { resolve, onOutput, timer });
    worker.postMessage({ type: 'run', id, code, stdin, files });
  });
}

/* Web Worker that hosts Pyodide (CPython compiled to WebAssembly) for the "run it yourself" console.
   Loaded lazily, only after the first click, from the CDN pinned in pyodide-loader.js. */
let pyodide = null;

async function init(url) {
  importScripts(url);
  pyodide = await self.loadPyodide({ indexURL: url.replace(/pyodide\.js$/, '') });
  pyodide.setStdout({ batched: text => self.postMessage({ type: 'out', text: text + '\n', stream: 'stdout' }) });
  pyodide.setStderr({ batched: text => self.postMessage({ type: 'out', text: text + '\n', stream: 'stderr' }) });
}

self.onmessage = async event => {
  const msg = event.data;
  try {
    if (msg.type === 'init') {
      await init(msg.url);
      self.postMessage({ type: 'ready' });
      return;
    }
    if (msg.type === 'run') {
      const lines = [...(msg.stdin || [])];
      pyodide.setStdin({ stdin: () => (lines.length ? lines.shift() : null), isatty: false });
      for (const [name, content] of Object.entries(msg.files || {})) pyodide.FS.writeFile(name, content);
      const started = performance.now();
      try {
        await pyodide.runPythonAsync(msg.code);
        self.postMessage({ type: 'done', id: msg.id, ms: Math.round(performance.now() - started) });
      } catch (e) {
        const text = String(e && e.message ? e.message : e);
        self.postMessage({ type: 'done', id: msg.id, ms: Math.round(performance.now() - started), error: text.replace(/^.*?(Traceback \(most recent call last\):)/s, '$1') });
      }
    }
  } catch (e) {
    self.postMessage({ type: 'fail', error: String(e && e.message ? e.message : e) });
  }
};

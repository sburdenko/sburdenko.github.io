/** "Run it yourself": a small editor with live highlighting, a stdin box and the output of real Python. */
import { $, esc } from '../../assets/vhs.js?v=202610071708';
import { t, onLang } from '../../assets/i18n.js?v=202610071708';
import { highlightPy } from './py-code.js?v=202610071708';
import { runPython, loadPython } from './pyodide-loader.js?v=202610071708';

export function mountRepl(root, { code = '', stdin = [], files = {} } = {}) {
  root.classList.add('repl');
  root.innerHTML = `
    <p class="lbl" data-i18n="py.repl.title">${t('py.repl.title')}</p>
    <div class="ed">
      <pre class="code py hl" aria-hidden="true"></pre>
      <textarea spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Python"></textarea>
    </div>
    <div class="repl-row">
      <button type="button" class="btn primary" data-run>${t('py.repl.run')}</button>
      <button type="button" class="btn" data-reset>${t('py.repl.reset')}</button>
      <label class="stdin"><span class="lbl">${t('py.repl.stdin')}</span><input type="text" spellcheck="false" value="${esc(stdin.join(' | '))}"></label>
      <span class="hint">${t('py.repl.hint')}</span>
    </div>
    <p class="status" aria-live="polite"></p>
    <pre class="con out"></pre>`;
  const ta = $('textarea', root), hl = $('pre.hl', root), status = $('.status', root), out = $('pre.out', root), stdinInput = $('.stdin input', root);
  const original = code;
  ta.value = code;
  const paint = () => { hl.innerHTML = highlightPy(ta.value) + '\n'; sizeToContent(); };
  const sizeToContent = () => { ta.style.height = 'auto'; ta.style.height = `${Math.max(120, ta.scrollHeight + 4)}px`; hl.style.height = ta.style.height; };
  ta.addEventListener('input', paint);
  ta.addEventListener('scroll', () => { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; });
  ta.addEventListener('keydown', event => {
    if (event.key === 'Tab') { event.preventDefault(); const s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); paint(); }
    if (event.key === 'Enter' && event.shiftKey) { event.preventDefault(); run(); }
    if (event.key === 'Enter' && !event.shiftKey) {
      const s = ta.selectionStart, before = ta.value.slice(0, s), line = before.slice(before.lastIndexOf('\n') + 1);
      const indent = (line.match(/^\s*/) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
      event.preventDefault();
      ta.setRangeText('\n' + indent, s, ta.selectionEnd, 'end');
      paint();
    }
  });
  let busy = false;
  async function run() {
    if (busy) return;
    busy = true;
    out.textContent = '';
    status.textContent = t('py.repl.loading');
    try {
      await loadPython();
      status.textContent = t('py.repl.running');
      const lines = stdinInput.value.split('|').map(l => l.trim()).filter(Boolean);
      const result = await runPython(ta.value, { stdin: lines, files, onOutput: (text, stream) => { out.innerHTML += stream === 'stderr' ? `<span class="tb">${esc(text)}</span>` : esc(text); out.scrollTop = out.scrollHeight; } });
      if (result.timeout) status.textContent = t('py.repl.timeout');
      else {
        if (result.error) out.innerHTML += `<span class="tb">${esc(result.error)}</span>`;
        status.textContent = t('py.repl.done', result.ms);
      }
    } catch (e) {
      status.textContent = t('py.repl.offline');
      console.error(e);
    } finally { busy = false; }
  }
  $('[data-run]', root).addEventListener('click', run);
  $('[data-reset]', root).addEventListener('click', () => { ta.value = original; paint(); });
  onLang(() => { $('[data-run]', root).textContent = t('py.repl.run'); $('[data-reset]', root).textContent = t('py.repl.reset'); $('.stdin .lbl', root).textContent = t('py.repl.stdin'); $('.hint', root).textContent = t('py.repl.hint'); $('[data-i18n="py.repl.title"]', root).textContent = t('py.repl.title'); });
  paint();
  ta.focus();
}

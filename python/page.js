/** Stand landing: six cassettes with progress, the overall progress panel and setup notes. */
import { $, esc, bootVhs } from '../assets/vhs.js?v=202610071646';
import { initI18n, t, onLang } from '../assets/i18n.js?v=202610071646';
import { COMMON } from '../assets/i18n-common.js?v=202610071646';
import { SHARED } from './shared/i18n-shared.js?v=202610071646';
import { STAND } from './i18n.js?v=202610071646';
import { CATALOG } from './shared/catalog.js?v=202610071646';
import { summary, onProgress, exportProgress, importProgress, resetProgress } from './shared/progress.js?v=202610071646';

initI18n({ ...COMMON, ...SHARED, ...STAND });
bootVhs();

function cassette(tape) {
  const s = summary(tape.id, tape.totals);
  const total = tape.totals.chapters + (tape.totals.quizzes || 0) + (tape.totals.problems || 0);
  const done = s.chapters + s.quizzes + s.problems;
  const pct = total ? Math.round(100 * done / total) : 0;
  const inner = `
    <div class="spine"><span>PY-${tape.id}</span><span>PYTHON</span></div>
    <div class="reels"><div class="reel"><i></i></div><div class="win"></div><div class="reel"><i></i></div></div>
    <h3>${t(`tape.${tape.id}.title`)}</h3>
    <p>${t(`tape.${tape.id}.desc`)}</p>
    <div class="tags">${tape.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div>
    ${tape.ready ? `<div class="prog-line"><span class="track"><i style="width:${pct}%"></i></span><span>${s.complete ? '★ ' : ''}${pct}%</span></div><span class="go">${t('hub.go')}</span>` : `<span class="go">${t('stand.soon')}</span>`}`;
  return tape.ready ? `<a class="cassette" href="./${tape.dir}/">${inner}</a>` : `<div class="cassette soon">${inner}</div>`;
}

function renderShelf() { $('#pyShelf').innerHTML = CATALOG.map(cassette).join(''); }

function renderProgress() {
  const root = $('#standProgress');
  root.classList.add('prog');
  const rows = CATALOG.filter(tp => tp.ready).map(tp => {
    const s = summary(tp.id, tp.totals);
    const bar = (label, d, n) => (n ? `<div class="pb"><span>PY-${tp.id} · ${label}</span><span class="track"><i style="width:${Math.round(100 * Math.min(1, d / n))}%"></i></span><b>${d} / ${n}</b></div>` : '');
    return bar(t('stand.chapters'), s.chapters, tp.totals.chapters) + bar(t('stand.quizzes'), s.quizzes, tp.totals.quizzes) + bar(t('stand.problems'), s.problems, tp.totals.problems) + (s.complete ? `<span class="sticker">★ PY-${tp.id} · ${t('py.progress.sticker')}</span>` : '');
  }).join('');
  root.innerHTML = `<p class="lbl">${t('py.progress.title')}</p><div class="bars">${rows}</div>
    <div class="acts"><button type="button" class="btn" data-export>${t('py.progress.export')}</button><button type="button" class="btn" data-import>${t('py.progress.import')}</button><button type="button" class="btn" data-reset>${t('py.progress.reset')}</button></div><p class="note">${t('py.progress.local')}</p>`;
}

$('#standProgress').addEventListener('click', async e => {
  if (e.target.closest('[data-export]')) { const json = exportProgress(); try { await navigator.clipboard.writeText(json); alert(t('py.progress.copied')); } catch { prompt('JSON', json); } }
  if (e.target.closest('[data-import]')) { const json = prompt(t('py.progress.importPrompt')); if (json) { try { importProgress(json); } catch { alert(t('py.progress.importBad')); } } }
  if (e.target.closest('[data-reset]') && confirm(t('py.progress.resetConfirm'))) resetProgress();
});

const paint = () => { renderShelf(); renderProgress(); };
onLang(paint);
onProgress(paint);
paint();

/**
 * One call boots a Python tape: language, VHS chrome, chapter map, rigs, quizzes, "got it" buttons and the progress panel.
 * bootTape({ tape, dict, rigs, quizzes, chapters, totals })
 */
import { $, $$, esc, bootVhs } from '../../assets/vhs.js?v=202610071637';
import { initI18n, t, onLang } from '../../assets/i18n.js?v=202610071637';
import { COMMON } from '../../assets/i18n-common.js?v=202610071637';
import { INPUTS } from '../../algorithms/patterns/i18n-inputs.js?v=202610071637';
import { SHARED } from './i18n-shared.js?v=202610071637';
import { FIELD_ERRORS } from './fields.js?v=202610071637';
import { mountRigs } from './stepper.js?v=202610071637';
import { mountQuizzes } from './quiz.js?v=202610071637';
import { pyBlock } from './py-code.js?v=202610071637';
import { markChapter, isChapterDone, summary, onProgress, exportProgress, importProgress, resetProgress } from './progress.js?v=202610071637';

export const TAPES = ['01', '02', '03', '04', '05', '06'];

export function bootTape({ tape, dict, rigs = [], quizzes = [], chapters = [], totals = {} }) {
  initI18n({ ...COMMON, ...INPUTS, ...SHARED, ...FIELD_ERRORS, ...dict });
  bootVhs();
  renderStaticCode();
  mountRigs(document, rigs, { tape });
  mountQuizzes(document, quizzes, { tape });
  mountChapterButtons(tape);
  const total = { chapters: chapters.length, quizzes: quizzes.length, problems: totals.problems || 0, ...totals };
  const paint = () => { renderMap(chapters, tape); renderProgress(tape, total); };
  onLang(paint);
  onProgress(paint);
  paint();
}

/** `<pre data-py>` blocks hold Python in the dictionary under their key; they are rendered highlighted. */
function renderStaticCode() {
  const paint = () => $$('[data-py]', document).forEach(el => { const src = t(el.dataset.py); el.outerHTML = src === el.dataset.py ? el.outerHTML : pyBlock(src).replace('<pre ', `<pre data-py="${el.dataset.py}" `); });
  paint();
  onLang(paint);
}

function mountChapterButtons(tape) {
  $$('.chapter-done', document).forEach(root => {
    const ch = root.dataset.chapter;
    const paint = () => {
      const done = isChapterDone(tape, ch);
      root.innerHTML = `<button type="button" class="btn${done ? ' on' : ''}" data-done>${done ? t('py.ui.doneAlready') : t('py.ui.done')}</button>${done ? `<span class="badge ok">${t('py.ui.chapterDone')}</span>` : ''}`;
    };
    root.addEventListener('click', e => { if (e.target.closest('[data-done]') && !isChapterDone(tape, ch)) markChapter(tape, ch); });
    onProgress(paint);
    onLang(paint);
    paint();
  });
}

function renderMap(chapters, tape) {
  const map = $('#chapterMap');
  if (!map) return;
  map.innerHTML = chapters.map(ch => `<a href="#${ch.id}" class="${isChapterDone(tape, ch.n) ? 'done' : ''}"><span class="n">${ch.n}</span><b>${t(`ch.${ch.id}.h2`)}</b><span class="s">${t(`ch.${ch.id}.short`)}</span></a>`).join('');
}

export function progressHtml(tape, total) {
  const s = summary(tape, total);
  const bar = (label, d, n) => (n ? `<div class="pb"><span>${label}</span><span class="track"><i style="width:${Math.round(100 * Math.min(1, d / n))}%"></i></span><b>${d} / ${n}</b></div>` : '');
  return `<p class="lbl">${t('py.progress.title')}</p><div class="bars">${bar(t('py.progress.chapters', s.chapters, total.chapters).replace(/^[\d/ ]+/, ''), s.chapters, total.chapters)}${bar(t('py.progress.quizzes', s.quizzes, total.quizzes).replace(/^[\d/ ]+/, ''), s.quizzes, total.quizzes)}${bar(t('py.progress.problems', s.problems, total.problems).replace(/^[\d/ ]+/, ''), s.problems, total.problems)}</div>${s.complete ? `<span class="sticker">★ ${t('py.progress.sticker')}</span>` : ''}
    <div class="acts"><button type="button" class="btn" data-export>${t('py.progress.export')}</button><button type="button" class="btn" data-import>${t('py.progress.import')}</button><button type="button" class="btn" data-reset>${t('py.progress.reset')}</button></div><p class="note">${t('py.progress.local')}</p>`;
}

function renderProgress(tape, total) {
  const root = $('#tapeProgress');
  if (!root) return;
  root.classList.add('prog');
  root.innerHTML = progressHtml(tape, total);
  if (!root.dataset.bound) {
    root.dataset.bound = '1';
    root.addEventListener('click', async e => {
      if (e.target.closest('[data-export]')) { const json = exportProgress(); try { await navigator.clipboard.writeText(json); alert(t('py.progress.copied')); } catch { prompt('JSON', json); } }
      if (e.target.closest('[data-import]')) { const json = prompt(t('py.progress.importPrompt')); if (json) { try { importProgress(json); } catch { alert(t('py.progress.importBad')); } } }
      if (e.target.closest('[data-reset]') && confirm(t('py.progress.resetConfirm'))) resetProgress();
    });
  }
}

export { esc };

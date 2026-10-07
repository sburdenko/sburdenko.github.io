/** PY-06 assembly: per chapter, problem tabs that each mount their own rig; plus the sorting race. */
import { $, $$, esc } from '../../assets/vhs.js?v=202610071708';
import { t, onLang } from '../../assets/i18n.js?v=202610071708';
import { bootTape } from '../shared/tape.js?v=202610071708';
import { mountRig } from '../shared/stepper.js?v=202610071708';
import { isProblemDone, onProgress } from '../shared/progress.js?v=202610071708';
import { DICT } from './i18n.js?v=202610071708';
import { PROBLEMS } from './problems.js?v=202610071708';
import { mountRace } from './race.js?v=202610071708';

export const CHAPTERS = [
  { id: 'first', n: '01' }, { id: 'numbers', n: '02' }, { id: 'search', n: '03' }, { id: 'sorting', n: '04' },
  { id: 'strings', n: '05' }, { id: 'stackq', n: '06' }, { id: 'grids', n: '07' }, { id: 'backtrack', n: '08' },
];

const TAPE = '06';

function mountChapter(root) {
  const ch = root.dataset.chapterProblems;
  const problems = PROBLEMS.filter(p => p.ch === ch);
  root.innerHTML = `<div class="ptabs" role="tablist"></div><div class="ppanel panel"></div><div class="prig"></div>`;
  const tabs = $('.ptabs', root), info = $('.ppanel', root), rigRoot = $('.prig', root);
  let selected = 0;

  const renderTabs = () => {
    tabs.innerHTML = problems.map((p, j) => `<button type="button" class="ptab${p.diff === 'Hard' ? ' hard' : ''}" role="tab" id="p06-${p.id}" aria-selected="${j === selected}" tabindex="${j === selected ? 0 : -1}" data-j="${j}">
      <span class="v">#${p.num}${isProblemDone(TAPE, p.id) ? ' · ✓' : ''}</span><span class="nm">${t(`prob.${p.id}.name`)}</span>
      <span class="meta"><i class="diff ${p.diff}">${p.diff}</i>${p.must ? ` · <b class="must">${t('p6.must')}</b>` : ''} · ${t('p6.after', p.after)}</span></button>`).join('');
  };
  const renderInfo = () => {
    const p = problems[selected];
    info.innerHTML = `<div class="pinfo"><h3>${t(`prob.${p.id}.name`)} <span class="lc">#${p.num}</span></h3>
      <dl><div><dt class="lbl">${t('p6.task')}</dt><dd>${t(`prob.${p.id}.task`)}</dd></div>
      <div><dt class="lbl">${t('p6.idea')}</dt><dd>${t(`prob.${p.id}.idea`)}</dd></div>
      <div><dt class="lbl">${t('p6.cx')}</dt><dd class="cx">${t(`prob.${p.id}.cx`)}</dd></div></dl></div>`;
  };
  const select = (j, focus = false) => {
    selected = j;
    renderTabs();
    renderInfo();
    rigRoot.innerHTML = '';
    const slot = document.createElement('div');
    rigRoot.appendChild(slot);
    mountRig(slot, problems[j].rig, { tape: TAPE });
    if (focus) $(`#p06-${problems[j].id}`, root)?.focus();
  };
  tabs.addEventListener('click', e => { const tab = e.target.closest('.ptab'); if (tab) select(Number(tab.dataset.j)); });
  tabs.addEventListener('keydown', e => { const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!step) return; e.preventDefault(); select((selected + step + problems.length) % problems.length, true); });
  onLang(() => { renderTabs(); renderInfo(); });
  onProgress(renderTabs);
  select(0);
}

bootTape({ tape: TAPE, dict: DICT, rigs: [], quizzes: [], chapters: CHAPTERS, totals: { problems: PROBLEMS.length } });
$$('[data-chapter-problems]').forEach(mountChapter);
mountRace($('#race'));

/* Links like #rig-<id> from the map or elsewhere: open the right tab first. */
addEventListener('hashchange', () => {
  const id = location.hash.replace('#rig-', '');
  const p = PROBLEMS.find(x => x.id === id);
  if (!p) return;
  const root = $(`[data-chapter-problems="${p.ch}"]`);
  $(`#p06-${p.id}`, root)?.click();
});
export { esc };

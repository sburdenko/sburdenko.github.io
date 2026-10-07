/** Полка: язык, VHS-эффекты и вторая полка — стенд Python с прогрессом. */
import { $, esc, bootVhs } from './vhs.js?v=202610071637';
import { initI18n, t, onLang } from './i18n.js?v=202610071637';
import { COMMON } from './i18n-common.js?v=202610071637';
import { HUB } from './i18n-hub.js?v=202610071637';
import { TAPE_CARDS } from '../python/i18n.js?v=202610071637';
import { CATALOG } from '../python/shared/catalog.js?v=202610071637';
import { summary } from '../python/shared/progress.js?v=202610071637';

initI18n({ ...COMMON, ...HUB, ...TAPE_CARDS });
bootVhs();

function cassette(tape) {
  const s = summary(tape.id, tape.totals);
  const total = tape.totals.chapters + (tape.totals.quizzes || 0) + (tape.totals.problems || 0);
  const pct = total ? Math.round(100 * (s.chapters + s.quizzes + s.problems) / total) : 0;
  const inner = `<div class="spine"><span>PY-${tape.id}</span><span>PYTHON</span></div>
    <div class="reels"><div class="reel"><i></i></div><div class="win"></div><div class="reel"><i></i></div></div>
    <h3>${t(`tape.${tape.id}.title`)}</h3><p>${t(`tape.${tape.id}.desc`)}</p>
    <div class="tags">${tape.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div>
    ${tape.ready ? `<div class="prog-line"><span class="track"><i style="width:${pct}%"></i></span><span>${pct}%</span></div><span class="go">${t('hub.go')}</span>` : `<span class="go">${t('hub.pySoon')}</span>`}`;
  return tape.ready ? `<a class="cassette" href="./python/${tape.dir}/">${inner}</a>` : `<div class="cassette soon">${inner}</div>`;
}

const paint = () => { const shelf = $('#pyShelf'); if (shelf) shelf.innerHTML = CATALOG.map(cassette).join(''); };
onLang(paint);
paint();

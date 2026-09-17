/** Сборка кассеты «Батчинг в Unity»: язык, заставка, пульт, стенды, шпаргалка, вопросы. */
import { $, bootVhs } from '../assets/vhs.js?v=202609162304';
import { initI18n, t, onLang } from '../assets/i18n.js?v=202609162304';
import { COMMON } from '../assets/i18n-common.js?v=202609162304';
import { DICT } from './i18n.js?v=202609162304';
import { initLanes } from './lanes.js?v=202609162304';
import { initDeck } from './deck.js?v=202609162304';
import { initStaticMini, initDynamicMini, initSrpMini, initInstancingMini, initGrdMini } from './minis.js?v=202609162304';
import { PATHS } from './model.js?v=202609162304';

initI18n({ ...COMMON, ...DICT });
bootVhs();
initLanes();
initDeck();
initStaticMini();
initDynamicMini();
initSrpMini();
initInstancingMini();
initGrdMini();

const pill = p => `<span class="pathpill"><i style="background:${p === 'statsrp' ? 'linear-gradient(90deg,#ffd23f 50%,#a77bff 50%)' : PATHS[p].c}"></i>${PATHS[p].l}</span>`;

function renderCheat() {
  $('#cheatBody').innerHTML = t('cheat.rows')
    .map(([p, name, saves, costs, needs, where]) =>
      `<tr><td>${name}</td><td>${saves}</td><td>${costs}</td><td>${needs}</td><td>${where}</td><td>${pill(p)}</td></tr>`)
    .join('');
}

function renderQa() {
  $('#qa').innerHTML = t('qa.items').map(([q, a], i) =>
    `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${q}</span></summary><div class="a">${a}</div></details>`
  ).join('');
}

renderCheat();
renderQa();
onLang(() => { renderCheat(); renderQa(); });

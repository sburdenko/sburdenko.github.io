/** Стенд «найди баг»: листинг с нажимаемыми строками. Логика — в models-hunt.js. */
import { esc } from '../assets/vhs.js?v=202610101018';
import { drive, act } from './rig-kit.js?v=202610101018';
import { codeHtml } from './code-view.js?v=202610101018';
import { tr } from './i18n.js?v=202610101018';
import { huntAnalyze, huntNeed, huntSummary, huntRig } from './models-hunt.js?v=202610101018';

function hunt(card, host, done) {
  const lines = card.code.split('\n');
  drive(card, host, huntRig, s => {
    const r = huntAnalyze(card, s.flag), need = huntNeed(card);
    const foundLines = new Set(r.found.flatMap(i => card.bugs[i].lines.filter(l => s.flag.includes(l))));
    const showMissed = s.revealed;
    const missedLines = new Set(showMissed ? r.missed.flatMap(i => card.bugs[i].lines) : []);
    const rows = lines.map((line, i) => {
      const flagged = s.flag.includes(i);
      let cls = '';
      if (s.checked || s.revealed) cls = foundLines.has(i) ? ' hit' : flagged ? ' miss' : missedLines.has(i) ? ' pending' : '';
      const html = codeHtml(line || ' ').replace(/^<span class="ln">|<\/span>$/g, '') || ' ';
      return `<button type="button" class="hl${flagged ? ' on' : ''}${cls}" data-act="flag:${i}" aria-pressed="${flagged}"${s.revealed ? ' disabled' : ''}><span class="hn">${i + 1}</span><span class="hc">${html}</span></button>`;
    }).join('');
    const bug = (b, ok) => `<div class="bug ${ok ? 'ok' : 'no'}"><b>${ok ? '✓' : '✗'} ${esc(b.title)}</b><p>${esc(b.why)}</p></div>`;
    const list = (s.checked || s.revealed)
      ? `<div class="vm-note${r.found.length >= need.min && r.falseLines.length <= need.maxFalse ? ' ret' : ''}">${esc(huntSummary(card, s))}</div>`
        + r.found.map(i => bug(card.bugs[i], true)).join('')
        + (s.revealed ? r.missed.map(i => bug(card.bugs[i], false)).join('') : '')
      : '';
    return `<div class="hunt-code" role="group" aria-label="${esc(tr({ ru: 'Код: нажми на строки с багами', en: 'Code: tap the lines with bugs' }))}">${rows}</div>
      <div class="pool-stats two"><div class="counter"><b>${s.flag.length}</b><span>${esc(tr({ ru: 'отмечено строк', en: 'lines flagged' }))}</span></div><div class="counter"><b>${need.min}</b><span>${esc(tr({ ru: 'нужно найти багов', en: 'bugs to find' }))}</span></div></div>
      ${list}
      <div class="btns">${act('check', tr({ ru: 'Проверить', en: 'Check' }), 'btn primary', s.revealed || !s.flag.length)}${act('reveal', tr({ ru: 'Показать все баги', en: 'Show all bugs' }), 'btn', s.revealed)}${act('reset', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>`;
  }, done);
}

export const RIGS_HUNT = { hunt };

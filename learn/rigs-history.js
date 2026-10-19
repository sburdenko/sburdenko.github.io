/** Стенды курса «История .NET»: лента лет и совместимость целевых платформ. */
import { esc } from '../assets/vhs.js?v=202610191154';
import { drive, act } from './rig-kit.js?v=202610191154';
import { codeHtml } from './code-view.js?v=202610191154';
import { tr } from './i18n.js?v=202610191154';
import { FIRST_YEAR, LAST_YEAR, stateAt, yearsRig, TFMS, HOSTS, resolveHost, csprojLine, tfmRig } from './models-history.js?v=202610191154';
import { t as tl, bi } from './ui.js?v=202610191154';

/* ---------- лента лет ---------- */

function years(card, host, done) {
  drive(card, host, yearsRig, s => {
    const st = stateAt(s.year), notYet = tl('r.history.years.1'), yes = tl('r.history.years.2');
    const chips = [];
    for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
      chips.push(act(`year:${y}`, String(y).slice(2), `yr${y === s.year ? ' on' : ''}${s.seen.includes(y) ? ' seen' : ''}`).replace('<button', `<button aria-label="${y}" aria-pressed="${y === s.year}"`));
    }
    const row = (k, v, cls = '') => `<div class="cv-row ${cls}"><span>${esc(k)}</span><span class="cv-m">${esc(v)}</span></div>`;
    return `<div class="yr-strip">${chips.join('')}</div>
      <div class="yr-big">${s.year}</div>
      <div class="roots">
        ${row('.NET Framework', st.framework ?? '—', st.framework ? 'yes' : '')}
        ${row('.NET Core / .NET', st.modern ?? notYet, st.modern ? 'yes' : '')}
        ${row('.NET Standard', st.standard ?? notYet, st.standard ? 'yes' : '')}
        ${row(tl('r.history.years.3'), st.csharp)}
        ${row('Mono', st.mono ? yes : notYet, st.mono ? 'yes' : '')}
        ${row('Unity', st.unity ? yes : notYet, st.unity ? 'yes' : '')}
        <div class="cv-row"><span>${tl('r.history.years.4')}</span><span class="cv-m wrap">${esc(st.platforms.join(', '))}</span></div>
      </div>
      <div class="vm-note">${st.events.length ? st.events.map(e => `<div>• ${esc(e)}</div>`).join('') : tl('r.history.years.5')}</div>`;
  }, done);
}

/* ---------- совместимость TFM ---------- */

const ST = { ok: ['✓', bi('r.history.ST.1')], warn: ['≈', bi('r.history.ST.2')], no: ['✗', bi('r.history.ST.3')] };

function tfm(card, host, done) {
  const hosts = card.hosts ?? Object.keys(HOSTS);
  drive(card, host, tfmRig, s => {
    const rows = hosts.map(h => {
      const r = resolveHost(h, s.targets), H = HOSTS[h];
      const what = r.tfm ? tl('r.history.tfm.1', { name: TFMS[r.tfm].name }) : tl('r.history.tfm.2');
      return `<div class="cv-row ${r.status === 'ok' ? 'yes' : r.status === 'warn' ? 'part' : 'no'}"><span>${esc(tr(H.name))}<small>${esc(tr(H.runtime))} → ${esc(what)}</small></span><span class="cv-m">${ST[r.status][0]} ${esc(tr(ST[r.status][1]))}</span></div>`;
    }).join('');
    const chips = Object.entries(TFMS).map(([k, t]) => act(`tfm:${k}`, `${s.targets.includes(k) ? '✓ ' : ''}${esc(t.name)}`, '').replace('class=""', `aria-pressed="${s.targets.includes(k)}"`)).join('');
    const warn = hosts.some(h => resolveHost(h, s.targets).status === 'warn');
    return `<div class="ctl-group"><span class="ctl-label">${tl('r.history.tfm.3')}</span><div class="seg wrap literal">${chips}</div></div>
      <pre class="code small wrapln">${codeHtml(csprojLine(s.targets), 'xml')}</pre>
      <div class="roots"><div class="colh">${tl('r.history.tfm.4')}</div>${rows}</div>
      ${warn ? `<div class="vm-note">${tl('r.history.tfm.5')}</div>` : ''}
      ${s.targets.length > 1 ? `<div class="vm-note ret">${tl('r.history.tfm.6', { length: s.targets.length })}</div>` : ''}`;
  }, done);
}

export const RIGS_HISTORY = { years, tfm };

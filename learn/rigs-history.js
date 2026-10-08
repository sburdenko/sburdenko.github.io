/** Стенды курса «История .NET»: лента лет и совместимость целевых платформ. */
import { esc } from '../assets/vhs.js?v=202610081359';
import { drive, act } from './rig-kit.js?v=202610081359';
import { codeHtml } from './code-view.js?v=202610081359';
import { FIRST_YEAR, LAST_YEAR, stateAt, yearsRig, TFMS, HOSTS, resolveHost, csprojLine, tfmRig } from './models-history.js?v=202610081359';

/* ---------- лента лет ---------- */

function years(card, host, done) {
  drive(card, host, yearsRig, s => {
    const st = stateAt(s.year);
    const chips = [];
    for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
      chips.push(act(`year:${y}`, String(y).slice(2), `yr${y === s.year ? ' on' : ''}${s.seen.includes(y) ? ' seen' : ''}`).replace('<button', `<button aria-label="${y}" aria-pressed="${y === s.year}"`));
    }
    const row = (k, v, cls = '') => `<div class="cv-row ${cls}"><span>${esc(k)}</span><span class="cv-m">${esc(v)}</span></div>`;
    return `<div class="yr-strip">${chips.join('')}</div>
      <div class="yr-big">${s.year}</div>
      <div class="roots">
        ${row('.NET Framework', st.framework ?? '—', st.framework ? 'yes' : '')}
        ${row('.NET Core / .NET', st.modern ?? 'ещё нет', st.modern ? 'yes' : '')}
        ${row('.NET Standard', st.standard ?? 'ещё нет', st.standard ? 'yes' : '')}
        ${row('Последний C#', st.csharp)}
        ${row('Mono', st.mono ? 'есть' : 'ещё нет', st.mono ? 'yes' : '')}
        ${row('Unity', st.unity ? 'есть' : 'ещё нет', st.unity ? 'yes' : '')}
        <div class="cv-row"><span>Где работает</span><span class="cv-m wrap">${esc(st.platforms.join(', '))}</span></div>
      </div>
      <div class="vm-note">${st.events.length ? st.events.map(e => `<div>• ${esc(e)}</div>`).join('') : 'Громких выпусков в этом году не было.'}</div>`;
  }, done);
}

/* ---------- совместимость TFM ---------- */

const ST = { ok: ['✓', 'загрузит'], warn: ['≈', 'с оговорками'], no: ['✗', 'не загрузит'] };

function tfm(card, host, done) {
  const hosts = card.hosts ?? Object.keys(HOSTS);
  drive(card, host, tfmRig, s => {
    const rows = hosts.map(h => {
      const r = resolveHost(h, s.targets), H = HOSTS[h];
      const what = r.tfm ? `сборку ${TFMS[r.tfm].name}` : 'ни одну сборку';
      return `<div class="cv-row ${r.status === 'ok' ? 'yes' : r.status === 'warn' ? 'part' : 'no'}"><span>${esc(H.name)}<small>${esc(H.runtime)} → ${esc(what)}</small></span><span class="cv-m">${ST[r.status][0]} ${ST[r.status][1]}</span></div>`;
    }).join('');
    const chips = Object.entries(TFMS).map(([k, t]) => act(`tfm:${k}`, `${s.targets.includes(k) ? '✓ ' : ''}${esc(t.name)}`, '').replace('class=""', `aria-pressed="${s.targets.includes(k)}"`)).join('');
    const warn = hosts.some(h => resolveHost(h, s.targets).status === 'warn');
    return `<div class="ctl-group"><span class="ctl-label">Для каких платформ собрать библиотеку</span><div class="seg wrap literal">${chips}</div></div>
      <pre class="code small wrapln">${codeHtml(csprojLine(s.targets), 'xml')}</pre>
      <div class="roots"><div class="colh">Кто сможет загрузить библиотеку</div>${rows}</div>
      ${warn ? '<div class="vm-note">≈ — сборка для .NET Framework грузится через слой совместимости: заработает, только если не трогает API, которых нет на этой платформе. NuGet предупредит (NU1701).</div>' : ''}
      ${s.targets.length > 1 ? `<div class="vm-note ret">Целей: ${s.targets.length}. Из одного проекта соберётся ${s.targets.length} DLL, и каждый хост возьмёт самую подходящую.</div>` : ''}`;
  }, done);
}

export const RIGS_HISTORY = { years, tfm };

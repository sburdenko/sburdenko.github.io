/** Стенды курса «История .NET»: лента лет и совместимость целевых платформ. */
import { esc } from '../assets/vhs.js?v=202610101413';
import { drive, act } from './rig-kit.js?v=202610101413';
import { codeHtml } from './code-view.js?v=202610101413';
import { tr } from './i18n.js?v=202610101413';
import { FIRST_YEAR, LAST_YEAR, stateAt, yearsRig, TFMS, HOSTS, resolveHost, csprojLine, tfmRig } from './models-history.js?v=202610101413';

/* ---------- лента лет ---------- */

function years(card, host, done) {
  drive(card, host, yearsRig, s => {
    const st = stateAt(s.year), notYet = tr({ ru: 'ещё нет', en: 'not yet' }), yes = tr({ ru: 'есть', en: 'yes' });
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
        ${row(tr({ ru: 'Последний C#', en: 'Latest C#' }), st.csharp)}
        ${row('Mono', st.mono ? yes : notYet, st.mono ? 'yes' : '')}
        ${row('Unity', st.unity ? yes : notYet, st.unity ? 'yes' : '')}
        <div class="cv-row"><span>${tr({ ru: 'Где работает', en: 'Runs on' })}</span><span class="cv-m wrap">${esc(st.platforms.join(', '))}</span></div>
      </div>
      <div class="vm-note">${st.events.length ? st.events.map(e => `<div>• ${esc(e)}</div>`).join('') : tr({ ru: 'Громких выпусков в этом году не было.', en: 'No major releases this year.' })}</div>`;
  }, done);
}

/* ---------- совместимость TFM ---------- */

const ST = { ok: ['✓', { ru: 'загрузит', en: 'will load' }], warn: ['≈', { ru: 'с оговорками', en: 'with caveats' }], no: ['✗', { ru: 'не загрузит', en: 'won\'t load' }] };

function tfm(card, host, done) {
  const hosts = card.hosts ?? Object.keys(HOSTS);
  drive(card, host, tfmRig, s => {
    const rows = hosts.map(h => {
      const r = resolveHost(h, s.targets), H = HOSTS[h];
      const what = r.tfm ? tr({ ru: `сборку ${TFMS[r.tfm].name}`, en: `the ${TFMS[r.tfm].name} assembly` }) : tr({ ru: 'ни одну сборку', en: 'no assembly' });
      return `<div class="cv-row ${r.status === 'ok' ? 'yes' : r.status === 'warn' ? 'part' : 'no'}"><span>${esc(tr(H.name))}<small>${esc(tr(H.runtime))} → ${esc(what)}</small></span><span class="cv-m">${ST[r.status][0]} ${esc(tr(ST[r.status][1]))}</span></div>`;
    }).join('');
    const chips = Object.entries(TFMS).map(([k, t]) => act(`tfm:${k}`, `${s.targets.includes(k) ? '✓ ' : ''}${esc(t.name)}`, '').replace('class=""', `aria-pressed="${s.targets.includes(k)}"`)).join('');
    const warn = hosts.some(h => resolveHost(h, s.targets).status === 'warn');
    return `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Для каких платформ собрать библиотеку', en: 'Which platforms to build the library for' })}</span><div class="seg wrap literal">${chips}</div></div>
      <pre class="code small wrapln">${codeHtml(csprojLine(s.targets), 'xml')}</pre>
      <div class="roots"><div class="colh">${tr({ ru: 'Кто сможет загрузить библиотеку', en: 'Who can load the library' })}</div>${rows}</div>
      ${warn ? `<div class="vm-note">${tr({ ru: '≈ — сборка для .NET Framework грузится через слой совместимости: заработает, только если не трогает API, которых нет на этой платформе. NuGet предупредит (NU1701).', en: '≈ means the .NET Framework assembly loads through a compatibility shim: it works only if it doesn\'t touch APIs missing on that platform. NuGet will warn you (NU1701).' })}</div>` : ''}
      ${s.targets.length > 1 ? `<div class="vm-note ret">${tr({ ru: `Целей: ${s.targets.length}. Из одного проекта соберётся ${s.targets.length} DLL, и каждый хост возьмёт самую подходящую.`, en: `Targets: ${s.targets.length}. One project builds ${s.targets.length} DLLs, and each host picks the best match.` })}</div>` : ''}`;
  }, done);
}

export const RIGS_HISTORY = { years, tfm };

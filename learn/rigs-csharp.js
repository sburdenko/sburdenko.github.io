/** Стенды курса «C# глубже»: дженерики, замыкания, LINQ, выделения, копии структур, switch. */
import { esc } from '../assets/vhs.js?v=202610101341';
import { drive, act, refColor } from './rig-kit.js?v=202610101341';
import { codeHtml } from './code-view.js?v=202610101341';
import { tr, getLang } from './i18n.js?v=202610101341';
import {
  GEN_TYPES, GEN_CONSTRAINTS, GEN_OPS, genConflicts, genFits, genWhere, genRig,
  CLOSURE_CODE, closureRig,
  linqCode, linqRig,
  PARSE, allocRig,
  PASS, copies, copyRig,
  ARMS, SHAPES, switchHits, unreachable, switchRig
} from './models-csharp.js?v=202610101341';

const seg = (items, cur, prefix) => `<div class="seg wrap literal">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(tr(label)), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;
const row = (ok, text, sub = '') => `<div class="cv-row ${ok ? 'yes' : 'no'}"><span>${text}${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="cv-m">${ok ? '✓' : '✗'}</span></div>`;

/* ---------- ограничения дженериков ---------- */

function generics(card, host, done) {
  drive(card, host, genRig, s => {
    const bad = genConflicts(s.cs);
    const sig = `${card.sig}${genWhere(s.cs)}\n{\n${card.ops.map(o => `    ${GEN_OPS[o].code}`).join('\n')}\n}`;
    const ops = card.ops.map(o => row(GEN_OPS[o].ok(s.cs), `<code>${esc(GEN_OPS[o].code)}</code>`, GEN_OPS[o].ok(s.cs) ? '' : tr(GEN_OPS[o].why))).join('');
    const want = new Set(card.goal.allow ?? []), deny = new Set(card.goal.deny ?? []);
    const types = Object.keys(GEN_TYPES).map(t => {
      const fit = genFits(t, s.cs);
      const tag = want.has(t) ? tr({ ru: ' — должен подходить', en: ' — must fit' }) : deny.has(t) ? tr({ ru: ' — не должен подходить', en: ' — must not fit' }) : '';
      return row(fit, `T = ${esc(GEN_TYPES[t].name)}${tag}`);
    }).join('');
    const chips = Object.entries(GEN_CONSTRAINTS).map(([k, name]) => act(`c:${k}`, `${s.cs.includes(k) ? '✓ ' : ''}${esc(name)}`, '').replace('class=""', `aria-pressed="${s.cs.includes(k)}"`)).join('');
    return `<pre class="code small wrapln">${codeHtml(sig)}</pre>
      ${bad.length ? `<div class="vm-note err">${tr({ ru: 'Не скомпилируется', en: 'Won\'t compile' })}: ${bad.map(esc).join('; ')}.</div>` : ''}
      <div class="roots"><div class="colh">${tr({ ru: 'Код внутри метода', en: 'Code inside the method' })}</div>${ops}</div>
      <div class="roots"><div class="colh">${tr({ ru: 'Какие T подойдут', en: 'Which T will fit' })}</div>${types}</div>
      <div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Ограничения where', en: 'where constraints' })}</span><div class="seg wrap literal">${chips}</div></div>`;
  }, done);
}

/* ---------- замыкания ---------- */

function closures(card, host, done) {
  drive(card, host, closureRig, s => {
    const fr = s.frames[s.f];
    const lines = tr(CLOSURE_CODE[s.variant]).split('\n').map((l, i) => `<span class="ln${i === fr.line ? ' cur' : ''}">${codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '')}</span>`).join('');
    const boxes = fr.boxes.map(b => `<div class="cl-box" style="--c:${refColor(b.id)}"><span>${tr({ ru: `объект №${b.id}`, en: `object #${b.id}` })}</span><b>${b.v} = ${b.val}</b></div>`).join('') || `<span class="empty">${tr({ ru: 'пока нет', en: 'none yet' })}</span>`;
    const lams = fr.lambdas.map((id, i) => `<span class="cl-lam" style="--c:${refColor(id)}">λ${i + 1} → ${tr({ ru: '№', en: '#' })}${id}</span>`).join('') || `<span class="empty">${tr({ ru: 'пока нет', en: 'none yet' })}</span>`;
    const last = s.f === s.frames.length - 1;
    const variants = card.variants ?? Object.keys(CLOSURE_CODE);
    return `${variants.length > 1 ? `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Вариант кода', en: 'Code variant' })}</span>${seg(variants.map(v => [v, { for: 'for', copy: tr({ ru: 'for + копия', en: 'for + copy' }), foreach: 'foreach' }[v]]), s.variant, 'variant')}</div>` : ''}
      <pre class="code small sm">${lines}</pre>
      <div class="roots"><div class="colh">${tr({ ru: 'Скрытые объекты замыканий', en: 'Hidden closure objects' })}</div><div class="cl-row">${boxes}</div><div class="colh">${tr({ ru: 'Лямбды в списке', en: 'Lambdas in the list' })}</div><div class="cl-row">${lams}</div></div>
      <div class="pool-stats two"><div class="counter${last ? ' good' : ''}"><b>${fr.out.join(' ') || '—'}</b><span>${tr({ ru: 'на экране', en: 'on screen' })}</span></div><div class="counter"><b>${s.f + 1}/${s.frames.length}</b><span>${tr({ ru: 'шаг', en: 'step' })}</span></div></div>
      <div class="vm-note">${esc(fr.note)}</div>
      <div class="btns">${act('step', tr({ ru: 'Шаг ►', en: 'Step ►' }), 'btn primary', last)}${act('end', tr({ ru: 'До конца ►►', en: 'To the end ►►' }), 'btn', last)}${act('reset', tr({ ru: 'Сначала ↺', en: 'Start over ↺' }))}</div>`;
  }, done);
}

/* ---------- LINQ ---------- */

function linq(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, linqRig, s => {
    const shown = s.ev.slice(0, s.f);
    const last = s.f === s.ev.length;
    const tg = (k, on, off) => lock.has(k) ? '' : act(k, s.o[k] ? `✓ ${on}` : off, 'btn sm');
    const cnt = { read: 0, where: 0, select: 0 };
    // счётчики по уже показанным событиям
    const readMark = tr({ ru: 'читаем', en: 'read ' });
    shown.forEach(e => { if (e.startsWith(readMark)) cnt.read++; if (e.startsWith('Where(')) cnt.where++; if (e.includes('Select →')) cnt.select++; });
    return `<pre class="code small">${codeHtml(linqCode(s.o))}</pre>
      <div class="btns">${tg('orderBy', 'OrderBy', tr({ ru: 'Добавить OrderBy', en: 'Add OrderBy' }))}${tg('toList', 'ToList', tr({ ru: 'Добавить ToList', en: 'Add ToList' }))}${tg('twice', tr({ ru: 'Перебор дважды', en: 'Iterate twice' }), tr({ ru: 'Перебрать дважды', en: 'Iterate twice' }))}</div>
      <div class="pool-stats"><div class="counter"><b>${cnt.read}</b><span>${tr({ ru: 'прочитано из источника', en: 'read from the source' })}</span></div><div class="counter"><b>${cnt.where}</b><span>${tr({ ru: 'вызовов Where', en: 'Where calls' })}</span></div><div class="counter"><b>${cnt.select}</b><span>${tr({ ru: 'вызовов Select', en: 'Select calls' })}</span></div><div class="counter${last ? ' good' : ''}"><b>${s.f}/${s.ev.length}</b><span>${tr({ ru: 'событий', en: 'events' })}</span></div></div>
      <div class="log">${shown.length ? shown.map(e => `<div>${esc(e)}</div>`).join('') : `<div class="empty">${tr({ ru: 'Пока ничего не выполнено: запрос только описан. Нажми «Шаг».', en: 'Nothing has run yet: the query is only described. Press “Step”.' })}</div>`}</div>
      <div class="btns">${act('step', tr({ ru: 'Шаг ►', en: 'Step ►' }), 'btn primary', last)}${act('end', tr({ ru: 'До конца ►►', en: 'To the end ►►' }), 'btn', last)}${act('reset', tr({ ru: 'Сначала ↺', en: 'Start over ↺' }))}</div>`;
  }, done);
}

/* ---------- выделения памяти ---------- */

function allocs(card, host, done) {
  drive(card, host, allocRig, s => {
    const p = PARSE[s.way], n = p.allocs(s.n);
    return `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Как разбираем line = "12,34,56"', en: 'How we parse line = "12,34,56"' })}</span>${seg(Object.entries(PARSE).map(([k, v]) => [k, v.name]), s.way, 'way')}</div>
      <pre class="code small">${codeHtml(p.code)}</pre>
      <div class="pool-stats two"><div class="counter${n === 0 ? ' good' : ''}"><b>${n}</b><span>${tr({ ru: 'объектов в куче на строку', en: 'heap objects per line' })}</span></div><div class="counter${n === 0 ? ' good' : ''}"><b>${(n * 1e6).toLocaleString(getLang() === 'en' ? 'en-US' : 'ru-RU')}</b><span>${tr({ ru: 'на миллион строк', en: 'per million lines' })}</span></div></div>
      <div class="vm-note${n === 0 ? ' ret' : ''}">${tr({ ru: 'Создаётся', en: 'Allocated' })}: ${esc(p.what(s.n))}.${n ? tr({ ru: ' Всё это потом убирает сборщик мусора.', en: ' The garbage collector cleans all of it up later.' }) : ''}</div>`;
  }, done);
}

/* ---------- защитные копии ---------- */

function copiesRig(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, copyRig, s => {
    const c = copies(s.pass, s.ro);
    const mod = s.pass === 'value' ? '' : `${s.pass} `;
    const code = `public ${s.ro ? 'readonly ' : ''}struct Matrix   // ${tr({ ru: '64 байта', en: '64 bytes' })}\n{\n    public float Det() { … }\n    public float Trace() { … }\n}\n\nfloat Measure(${mod}Matrix m) => m.Det() + m.Trace();`;
    return `<pre class="code small">${codeHtml(code)}</pre>
      <div class="pool-stats two"><div class="counter${c.n === 0 ? ' good' : ''}"><b>${c.n}</b><span>${tr({ ru: 'копий по 64 байта на вызов', en: '64-byte copies per call' })}</span></div><div class="counter${c.mutable ? '' : ' good'}"><b class="word">${c.mutable ? tr({ ru: 'может', en: 'can' }) : tr({ ru: 'не может', en: 'cannot' })}</b><span>${tr({ ru: 'метод изменить чужую матрицу', en: 'the method modify the caller\'s matrix' })}</span></div></div>
      <div class="vm-note${c.n === 0 && !c.mutable ? ' ret' : c.mutable ? ' err' : ''}">${esc(c.why)}.</div>
      <div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Как передать параметр', en: 'How to pass the parameter' })}</span>${seg(Object.entries(PASS), s.pass, 'pass')}</div>
      ${lock.has('ro') ? '' : `<div class="btns">${act('ro', s.ro ? '✓ readonly struct' : tr({ ru: 'Сделать readonly struct', en: 'Make it a readonly struct' }), 'btn sm')}</div>`}`;
  }, done);
}

/* ---------- switch ---------- */

function patterns(card, host, done) {
  drive(card, host, switchRig, s => {
    const dead = unreachable(s.order), hits = switchHits(s.order);
    const arms = s.order.map((id, i) => `<div class="sw-arm${dead.includes(id) ? ' dead' : ''}"><code>${esc(ARMS[id].pat)} => ${esc(tr(ARMS[id].res))},</code>${dead.includes(id) ? `<small>${tr({ ru: 'CS8510: ветку не достичь — всё уже поймано выше', en: 'CS8510: this arm is unreachable — everything is already caught above' })}</small>` : ''}${i ? act(`up:${id}`, '▲', 'btn sm') : ''}</div>`).join('');
    const rows = SHAPES.map((sh, i) => {
      const ok = hits[i] === sh.want;
      return `<div class="cv-row ${ok ? 'yes' : 'no'}"><span>${esc(sh.label)}<small>→ ${esc(tr(ARMS[hits[i]].res))}${ok ? '' : `${tr({ ru: ', а нужно ', en: ', but should be ' })}${esc(tr(ARMS[sh.want].res))}`}</small></span><span class="cv-m">${ok ? '✓' : '✗'}</span></div>`;
    }).join('');
    return `<div class="sw"><code class="sw-h">string Describe(Shape? s) =&gt; s switch {</code>${arms}<code class="sw-h">};</code></div>
      ${dead.length ? `<div class="vm-note err">${tr({ ru: 'Компилятор такое не соберёт. Ниже — что получилось бы, если бы собрал.', en: 'The compiler won\'t build this. Below is what would happen if it did.' })}</div>` : ''}
      <div class="roots"><div class="colh">${tr({ ru: 'Что вернёт Describe', en: 'What Describe returns' })}</div>${rows}</div>`;
  }, done);
}

export const RIGS_CSHARP = { generics, closures, linq, allocs, copies: copiesRig, patterns };

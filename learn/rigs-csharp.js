/** Стенды курса «C# глубже»: дженерики, замыкания, LINQ, выделения, копии структур, switch. */
import { esc } from '../assets/vhs.js?v=202610092124';
import { drive, act, refColor } from './rig-kit.js?v=202610092124';
import { codeHtml } from './code-view.js?v=202610092124';
import {
  GEN_TYPES, GEN_CONSTRAINTS, GEN_OPS, genConflicts, genFits, genWhere, genRig,
  CLOSURE_CODE, closureRig,
  linqCode, linqRig,
  PARSE, allocRig,
  PASS, copies, copyRig,
  ARMS, SHAPES, switchHits, unreachable, switchRig
} from './models-csharp.js?v=202610092124';

const seg = (items, cur, prefix) => `<div class="seg wrap literal">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(label), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;
const row = (ok, text, sub = '') => `<div class="cv-row ${ok ? 'yes' : 'no'}"><span>${text}${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="cv-m">${ok ? '✓' : '✗'}</span></div>`;

/* ---------- ограничения дженериков ---------- */

function generics(card, host, done) {
  drive(card, host, genRig, s => {
    const bad = genConflicts(s.cs);
    const sig = `${card.sig}${genWhere(s.cs)}\n{\n${card.ops.map(o => `    ${GEN_OPS[o].code}`).join('\n')}\n}`;
    const ops = card.ops.map(o => row(GEN_OPS[o].ok(s.cs), `<code>${esc(GEN_OPS[o].code)}</code>`, GEN_OPS[o].ok(s.cs) ? '' : GEN_OPS[o].why)).join('');
    const want = new Set(card.goal.allow ?? []), deny = new Set(card.goal.deny ?? []);
    const types = Object.keys(GEN_TYPES).map(t => {
      const fit = genFits(t, s.cs);
      const tag = want.has(t) ? ' — должен подходить' : deny.has(t) ? ' — не должен подходить' : '';
      return row(fit, `T = ${esc(GEN_TYPES[t].name)}${tag}`);
    }).join('');
    const chips = Object.entries(GEN_CONSTRAINTS).map(([k, name]) => act(`c:${k}`, `${s.cs.includes(k) ? '✓ ' : ''}${esc(name)}`, '').replace('class=""', `aria-pressed="${s.cs.includes(k)}"`)).join('');
    return `<pre class="code small wrapln">${codeHtml(sig)}</pre>
      ${bad.length ? `<div class="vm-note err">Не скомпилируется: ${bad.map(esc).join('; ')}.</div>` : ''}
      <div class="roots"><div class="colh">Код внутри метода</div>${ops}</div>
      <div class="roots"><div class="colh">Какие T подойдут</div>${types}</div>
      <div class="ctl-group"><span class="ctl-label">Ограничения where</span><div class="seg wrap literal">${chips}</div></div>`;
  }, done);
}

/* ---------- замыкания ---------- */

function closures(card, host, done) {
  drive(card, host, closureRig, s => {
    const fr = s.frames[s.f];
    const lines = CLOSURE_CODE[s.variant].split('\n').map((l, i) => `<span class="ln${i === fr.line ? ' cur' : ''}">${codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '')}</span>`).join('');
    const boxes = fr.boxes.map(b => `<div class="cl-box" style="--c:${refColor(b.id)}"><span>объект №${b.id}</span><b>${b.v} = ${b.val}</b></div>`).join('') || '<span class="empty">пока нет</span>';
    const lams = fr.lambdas.map((id, i) => `<span class="cl-lam" style="--c:${refColor(id)}">λ${i + 1} → №${id}</span>`).join('') || '<span class="empty">пока нет</span>';
    const last = s.f === s.frames.length - 1;
    const variants = card.variants ?? Object.keys(CLOSURE_CODE);
    return `${variants.length > 1 ? `<div class="ctl-group"><span class="ctl-label">Вариант кода</span>${seg(variants.map(v => [v, { for: 'for', copy: 'for + копия', foreach: 'foreach' }[v]]), s.variant, 'variant')}</div>` : ''}
      <pre class="code small sm">${lines}</pre>
      <div class="roots"><div class="colh">Скрытые объекты замыканий</div><div class="cl-row">${boxes}</div><div class="colh">Лямбды в списке</div><div class="cl-row">${lams}</div></div>
      <div class="pool-stats two"><div class="counter${last ? ' good' : ''}"><b>${fr.out.join(' ') || '—'}</b><span>на экране</span></div><div class="counter"><b>${s.f + 1}/${s.frames.length}</b><span>шаг</span></div></div>
      <div class="vm-note">${esc(fr.note)}</div>
      <div class="btns">${act('step', 'Шаг ►', 'btn primary', last)}${act('end', 'До конца ►►', 'btn', last)}${act('reset', 'Сначала ↺')}</div>`;
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
    shown.forEach(e => { if (e.startsWith('читаем')) cnt.read++; if (e.startsWith('Where(')) cnt.where++; if (e.includes('Select →')) cnt.select++; });
    return `<pre class="code small">${codeHtml(linqCode(s.o))}</pre>
      <div class="btns">${tg('orderBy', 'OrderBy', 'Добавить OrderBy')}${tg('toList', 'ToList', 'Добавить ToList')}${tg('twice', 'Перебор дважды', 'Перебрать дважды')}</div>
      <div class="pool-stats"><div class="counter"><b>${cnt.read}</b><span>прочитано из источника</span></div><div class="counter"><b>${cnt.where}</b><span>вызовов Where</span></div><div class="counter"><b>${cnt.select}</b><span>вызовов Select</span></div><div class="counter${last ? ' good' : ''}"><b>${s.f}/${s.ev.length}</b><span>событий</span></div></div>
      <div class="log">${shown.length ? shown.map(e => `<div>${esc(e)}</div>`).join('') : '<div class="empty">Пока ничего не выполнено: запрос только описан. Нажми «Шаг».</div>'}</div>
      <div class="btns">${act('step', 'Шаг ►', 'btn primary', last)}${act('end', 'До конца ►►', 'btn', last)}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- выделения памяти ---------- */

function allocs(card, host, done) {
  drive(card, host, allocRig, s => {
    const p = PARSE[s.way], n = p.allocs(s.n);
    return `<div class="ctl-group"><span class="ctl-label">Как разбираем line = "12,34,56"</span>${seg(Object.entries(PARSE).map(([k, v]) => [k, v.name]), s.way, 'way')}</div>
      <pre class="code small">${codeHtml(p.code)}</pre>
      <div class="pool-stats two"><div class="counter${n === 0 ? ' good' : ''}"><b>${n}</b><span>объектов в куче на строку</span></div><div class="counter${n === 0 ? ' good' : ''}"><b>${(n * 1e6).toLocaleString('ru-RU')}</b><span>на миллион строк</span></div></div>
      <div class="vm-note${n === 0 ? ' ret' : ''}">Создаётся: ${esc(p.what(s.n))}.${n ? ' Всё это потом убирает сборщик мусора.' : ''}</div>`;
  }, done);
}

/* ---------- защитные копии ---------- */

function copiesRig(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, copyRig, s => {
    const c = copies(s.pass, s.ro);
    const mod = s.pass === 'value' ? '' : `${s.pass} `;
    const code = `public ${s.ro ? 'readonly ' : ''}struct Matrix   // 64 байта\n{\n    public float Det() { … }\n    public float Trace() { … }\n}\n\nfloat Measure(${mod}Matrix m) => m.Det() + m.Trace();`;
    return `<pre class="code small">${codeHtml(code)}</pre>
      <div class="pool-stats two"><div class="counter${c.n === 0 ? ' good' : ''}"><b>${c.n}</b><span>копий по 64 байта на вызов</span></div><div class="counter${c.mutable ? '' : ' good'}"><b class="word">${c.mutable ? 'может' : 'не может'}</b><span>метод изменить чужую матрицу</span></div></div>
      <div class="vm-note${c.n === 0 && !c.mutable ? ' ret' : c.mutable ? ' err' : ''}">${esc(c.why)}.</div>
      <div class="ctl-group"><span class="ctl-label">Как передать параметр</span>${seg(Object.entries(PASS), s.pass, 'pass')}</div>
      ${lock.has('ro') ? '' : `<div class="btns">${act('ro', s.ro ? '✓ readonly struct' : 'Сделать readonly struct', 'btn sm')}</div>`}`;
  }, done);
}

/* ---------- switch ---------- */

function patterns(card, host, done) {
  drive(card, host, switchRig, s => {
    const dead = unreachable(s.order), hits = switchHits(s.order);
    const arms = s.order.map((id, i) => `<div class="sw-arm${dead.includes(id) ? ' dead' : ''}"><code>${esc(ARMS[id].pat)} => ${esc(ARMS[id].res)},</code>${dead.includes(id) ? '<small>CS8510: ветку не достичь — всё уже поймано выше</small>' : ''}${i ? act(`up:${id}`, '▲', 'btn sm') : ''}</div>`).join('');
    const rows = SHAPES.map((sh, i) => {
      const ok = hits[i] === sh.want;
      return `<div class="cv-row ${ok ? 'yes' : 'no'}"><span>${esc(sh.label)}<small>→ ${esc(ARMS[hits[i]].res)}${ok ? '' : `, а нужно ${esc(ARMS[sh.want].res)}`}</small></span><span class="cv-m">${ok ? '✓' : '✗'}</span></div>`;
    }).join('');
    return `<div class="sw"><code class="sw-h">string Describe(Shape? s) =&gt; s switch {</code>${arms}<code class="sw-h">};</code></div>
      ${dead.length ? '<div class="vm-note err">Компилятор такое не соберёт. Ниже — что получилось бы, если бы собрал.</div>' : ''}
      <div class="roots"><div class="colh">Что вернёт Describe</div>${rows}</div>`;
  }, done);
}

export const RIGS_CSHARP = { generics, closures, linq, allocs, copies: copiesRig, patterns };

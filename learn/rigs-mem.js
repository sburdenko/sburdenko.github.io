/** Стенды раздела про память: стек и куча, сборщик мусора, дескрипторы файлов. */
import { esc } from '../assets/vhs.js?v=202610081343';
import { codeHtml } from './code-view.js?v=202610081343';
import { drive, act, refColor } from './rig-kit.js?v=202610081343';
import { memRig, memVariants, memProgram, memReachable, gcRig, gcReach, fileRig } from './models-mem.js?v=202610081343';

const VARIANT = { struct: 'struct Point', class: 'class Point', main: '' };

/* ---------- стек и куча ---------- */

const chip = id => id == null
  ? '<span class="ref null">null</span>'
  : `<span class="ref" style="--rc:${refColor(id)}">→ #${id}</span>`;

function value(v) {
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return `<b>${v}</b>`;
  if (typeof v === 'string') return `<b>"${esc(v)}"</b>`;
  if ('ref' in v) return chip(v.ref);
  return '{ ' + Object.entries(v).map(([k, x]) => `${esc(k)} = ${value(x)}`).join(', ') + ' }';
}

function varRow(v, frames, key, changed) {
  let shown;
  if (v.kind === 'int') shown = value(v.value);
  else if (v.kind === 'val') shown = `<span class="inline-struct">${value(v.value)}</span>`;
  else if (v.kind === 'ref') shown = chip(v.value);
  else shown = `<span class="ref alias">ref → ${esc(v.value.name)} из ${esc(frames[v.value.frame].fn)}</span>`;
  return `<div class="var${changed.includes(key) ? ' chg' : ''}"><span class="nm">${esc(v.type)} ${esc(v.name)}</span><span class="vl">${shown}</span></div>`;
}

function heapObj(o, live, changed) {
  const garbage = !live.has(o.id);
  let body;
  if (o.type === 'string') body = `<div class="fld"><b>"${esc(o.text)}"</b></div>`;
  else body = Object.entries(o.fields).map(([k, x]) => `<div class="fld"><span>${/^\d+$/.test(k) ? `[${k}]` : esc(k)}</span>${value(x)}</div>`).join('') || '<div class="fld"><span>пусто</span></div>';
  const badge = o.box ? '<span class="badge-s">упаковка</span>' : '';
  return `<div class="obj${garbage ? ' garbage' : ''}${changed.includes(`h:${o.id}`) ? ' chg' : ''}" style="--rc:${refColor(o.id)}">
    <div class="oh"><span class="oid">#${o.id}</span><span>${esc(o.type)}</span>${badge}</div>${body}
    ${garbage ? '<div class="gtag">мусор: на объект никто не ссылается</div>' : ''}</div>`;
}

function memory(card, host, done) {
  drive(card, host, memRig, s => {
    const fr = s.frames[s.f], prog = memProgram(card, s.variant);
    const live = memReachable(fr.s);
    const lines = prog.code.split('\n');
    const seg = card.variants
      ? `<div class="seg vseg" role="group" aria-label="Вариант программы">${memVariants(card).map(v => act(`variant:${v}`, esc(VARIANT[v] ?? v), '', false).replace('class=""', `aria-pressed="${v === s.variant}"`)).join('')}</div>`
      : '';
    const code = `<pre class="code mem-code">${lines.map((l, i) => {
      const html = codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '');
      return `<span class="ln${i === fr.line ? ' cur' : ''}">${html}</span>`;
    }).join('')}</pre>`;
    const stack = [...fr.s.frames.keys()].reverse().map(fi => {
      const f = fr.s.frames[fi];
      return `<div class="frame"><div class="fh">${esc(f.fn)}()</div>${f.vars.map(v => varRow(v, fr.s.frames, `v:${fi}:${v.name}`, fr.changed)).join('') || '<div class="var empty">нет переменных</div>'}</div>`;
    }).join('');
    const heap = fr.s.heap.map(o => heapObj(o, live, fr.changed)).join('') || '<div class="empty">куча пуста</div>';
    const last = s.f === s.frames.length - 1;
    const other = card.variants && last ? memVariants(card).find(v => !s.finished.includes(v)) : null;
    return `${seg}${code}
      <div class="mem"><div class="col"><div class="colh">Стек</div>${stack}</div><div class="col"><div class="colh">Куча</div><div class="heap">${heap}</div></div></div>
      <div class="vm-note${last ? ' ret' : ''}">${esc(fr.note)}${other ? ` Теперь переключись на «${esc(VARIANT[other])}» и сравни.` : ''}</div>
      <div class="btns">${act('step', 'Шаг ►', 'btn primary', last)}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- сборщик мусора ---------- */

function gc(card, host, done) {
  const hasFin = card.objects.some(o => o.fin);
  const hasBig = card.objects.some(o => o.big);
  drive(card, host, gcRig, s => {
    const reach = gcReach(s);
    const objHtml = id => {
      const o = s.objs[id];
      const garbage = !reach.has(id);
      const tags = [o.fin && !o.finalized ? '<span class="badge-s">есть финализатор</span>' : '', o.queued ? '<span class="badge-s warn">в очереди финализации</span>' : '', o.finalized ? '<span class="badge-s">финализатор отработал</span>' : ''].join('');
      return `<div class="gobj${garbage ? ' garbage' : ''}"><div class="oh"><span class="oid">${esc(id)}</span>${tags}</div>
        <div class="fld">${o.refs.length ? '→ ' + o.refs.map(esc).join(', ') : 'ни на кого не ссылается'}</div>
        ${garbage ? '<div class="gtag">недостижим</div>' : ''}</div>`;
    };
    const cols = [0, 1, 2].map(g => {
      const ids = s.order.filter(id => s.objs[id].alive && s.objs[id].gen === g && !s.objs[id].big);
      return `<div class="gen"><div class="colh">Gen ${g}</div>${ids.map(objHtml).join('') || '<div class="empty">пусто</div>'}</div>`;
    });
    if (hasBig) {
      const ids = s.order.filter(id => s.objs[id].alive && s.objs[id].big);
      cols.push(`<div class="gen loh"><div class="colh">LOH</div>${ids.map(objHtml).join('') || '<div class="empty">пусто</div>'}</div>`);
    }
    const dead = s.order.filter(id => !s.objs[id].alive);
    const roots = s.roots.map(r => `<div class="root"><span class="nm">${esc(r.name)}</span>${r.to ? `<span class="ref">→ ${esc(r.to)}</span>` : '<span class="ref null">null</span>'}${r.to ? act(`root:${r.name}`, esc(r.btn ?? '= null'), 'btn sm') : ''}</div>`).join('');
    const cuts = (card.cuts ?? []).filter(c => s.objs[c.from].alive && s.objs[c.from].refs.includes(c.to)).map(c => act(`cut:${c.from}>${c.to}`, esc(c.label), 'btn sm')).join('');
    return `<div class="roots"><div class="colh">Корни: переменные в стеке и статические поля</div>${roots}${cuts ? `<div class="btns">${cuts}</div>` : ''}</div>
      <div class="gens${hasBig ? ' four' : ''}">${cols.join('')}</div>
      ${dead.length ? `<div class="dead">Удалены: ${dead.map(esc).join(', ')}</div>` : ''}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li>Сборок ещё не было. Пунктиром обведены объекты, до которых нельзя дойти от корней.</li>'}</ul>
      <div class="btns">${act('gc:0', 'GC: поколение 0', 'btn primary')}${card.gen1 ? act('gc:1', 'GC: поколения 0–1') : ''}${act('gc:2', 'Полная сборка')}${hasFin ? act('fin', 'Запустить финализаторы') : ''}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- дескрипторы файлов ---------- */

function files(card, host, done) {
  const allow = new Set(card.buttons ?? ['open', 'dispose', 'forget', 'gc', 'fin']);
  drive(card, host, fileRig, s => {
    const vars = s.vars.map(v => {
      const o = s.objs[v.id];
      return `<div class="root"><span class="nm">FileStream ${esc(v.name)}</span><span class="ref">${o.disposed ? 'закрыт' : 'открыт'}</span>
        ${allow.has('dispose') ? act(`dispose:${v.name}`, `${esc(v.name)}.Dispose()`, 'btn sm', o.disposed) : ''}${allow.has('forget') ? act(`forget:${v.name}`, `${esc(v.name)} = null`, 'btn sm') : ''}</div>`;
    }).join('') || '<div class="empty">переменных нет</div>';
    const handles = Object.values(s.objs).map(o => `<div class="hrow"><b>${o.handle}</b><span>log.txt</span><span class="st ${o.handleOpen ? 'open' : 'closed'}">${o.handleOpen ? 'ОТКРЫТ' : 'закрыт'}</span>
      <span>${o.queued ? 'объект — мусор, ждёт финализатора' : !o.alive ? 'объект удалён' : s.vars.some(v => v.id === o.id) ? `держит ${esc(o.name)}` : 'объект — мусор'}</span></div>`).join('');
    return `<div class="roots"><div class="colh">Переменные программы</div>${vars}</div>
      <div class="htable"><div class="colh">Дескрипторы ОС</div>${handles || '<div class="empty">ОС ещё ничего не выдавала</div>'}</div>
      ${s.error ? `<div class="vm-note err">${esc(s.error)}</div>` : ''}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li>Открой файл. Пока дескриптор открыт, второй раз его открыть не дадут.</li>'}</ul>
      <div class="btns">${allow.has('open') ? act('open', 'new FileStream("log.txt")', 'btn primary') : ''}${allow.has('using') ? act('using', 'using (new FileStream(…)) { … }', 'btn primary') : ''}${allow.has('gc') ? act('gc', 'GC.Collect()') : ''}${allow.has('fin') ? act('fin', 'Запустить финализаторы') : ''}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

export const MEM_RIGS = { memory, gc, files };

/** Стенды раздела про память: стек и куча, сборщик мусора, дескрипторы файлов. */
import { esc } from '../assets/vhs.js?v=202610262045';
import { codeHtml } from './code-view.js?v=202610262045';
import { drive, act, refColor } from './rig-kit.js?v=202610262045';
import { memRig, memVariants, memProgram, memReachable, gcRig, gcReach, fileRig } from './models-mem.js?v=202610262045';
import { tr } from './i18n.js?v=202610262045';
import { t as tl } from './ui.js?v=202610262045';

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
  else shown = `<span class="ref alias">ref → ${esc(v.value.name)} ${tl('r.mem.varRow.1')} ${esc(frames[v.value.frame].fn)}</span>`;
  return `<div class="var${changed.includes(key) ? ' chg' : ''}"><span class="nm">${esc(v.type)} ${esc(v.name)}</span><span class="vl">${shown}</span></div>`;
}

function heapObj(o, live, changed) {
  const garbage = !live.has(o.id);
  let body;
  if (o.type === 'string') body = `<div class="fld"><b>"${esc(o.text)}"</b></div>`;
  else body = Object.entries(o.fields).map(([k, x]) => `<div class="fld"><span>${/^\d+$/.test(k) ? `[${k}]` : esc(k)}</span>${value(x)}</div>`).join('') || `<div class="fld"><span>${tl('r.mem.heapObj.1')}</span></div>`;
  const badge = o.box ? `<span class="badge-s">${tl('r.mem.heapObj.2')}</span>` : '';
  return `<div class="obj${garbage ? ' garbage' : ''}${changed.includes(`h:${o.id}`) ? ' chg' : ''}" style="--rc:${refColor(o.id)}">
    <div class="oh"><span class="oid">#${o.id}</span><span>${esc(o.type)}</span>${badge}</div>${body}
    ${garbage ? `<div class="gtag">${tl('r.mem.heapObj.3')}</div>` : ''}</div>`;
}

function memory(card, host, done) {
  drive(card, host, memRig, s => {
    const fr = s.frames[s.f], prog = memProgram(card, s.variant);
    const live = memReachable(fr.s);
    const lines = prog.code.split('\n');
    const seg = card.variants
      ? `<div class="seg vseg" role="group" aria-label="${tl('r.mem.memory.1')}">${memVariants(card).map(v => act(`variant:${v}`, esc(VARIANT[v] ?? v), '', false).replace('class=""', `aria-pressed="${v === s.variant}"`)).join('')}</div>`
      : '';
    const code = `<pre class="code mem-code">${lines.map((l, i) => {
      const html = codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '');
      return `<span class="ln${i === fr.line ? ' cur' : ''}">${html}</span>`;
    }).join('')}</pre>`;
    const stack = [...fr.s.frames.keys()].reverse().map(fi => {
      const f = fr.s.frames[fi];
      return `<div class="frame"><div class="fh">${esc(f.fn)}()</div>${f.vars.map(v => varRow(v, fr.s.frames, `v:${fi}:${v.name}`, fr.changed)).join('') || `<div class="var empty">${tl('r.mem.memory.2')}</div>`}</div>`;
    }).join('');
    const heap = fr.s.heap.map(o => heapObj(o, live, fr.changed)).join('') || `<div class="empty">${tl('r.mem.memory.3')}</div>`;
    const last = s.f === s.frames.length - 1;
    const other = card.variants && last ? memVariants(card).find(v => !s.finished.includes(v)) : null;
    return `${seg}${code}
      <div class="mem"><div class="col"><div class="colh">${tl('r.mem.memory.4')}</div>${stack}</div><div class="col"><div class="colh">${tl('r.mem.memory.5')}</div><div class="heap">${heap}</div></div></div>
      <div class="vm-note${last ? ' ret' : ''}">${esc(fr.note)}${other ? tl('r.mem.memory.6', { v1: esc(VARIANT[other]) }) : ''}</div>
      <div class="btns">${act('step', tl('r.mem.memory.7'), 'btn primary', last)}${act('reset', tl('r.mem.memory.8'))}</div>`;
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
      const tags = [
        o.fin && !o.finalized ? `<span class="badge-s">${tl('r.mem.gc.1')}</span>` : '',
        o.queued ? `<span class="badge-s warn">${tl('r.mem.gc.2')}</span>` : '',
        o.finalized ? `<span class="badge-s">${tl('r.mem.gc.3')}</span>` : ''
      ].join('');
      return `<div class="gobj${garbage ? ' garbage' : ''}"><div class="oh"><span class="oid">${esc(id)}</span>${tags}</div>
        <div class="fld">${o.refs.length ? '→ ' + o.refs.map(esc).join(', ') : tl('r.mem.gc.4')}</div>
        ${garbage ? `<div class="gtag">${tl('r.mem.gc.5')}</div>` : ''}</div>`;
    };
    const cols = [0, 1, 2].map(g => {
      const ids = s.order.filter(id => s.objs[id].alive && s.objs[id].gen === g && !s.objs[id].big);
      return `<div class="gen"><div class="colh">Gen ${g}</div>${ids.map(objHtml).join('') || `<div class="empty">${tl('r.mem.gc.6')}</div>`}</div>`;
    });
    if (hasBig) {
      const ids = s.order.filter(id => s.objs[id].alive && s.objs[id].big);
      cols.push(`<div class="gen loh"><div class="colh">LOH</div>${ids.map(objHtml).join('') || `<div class="empty">${tl('r.mem.gc.7')}</div>`}</div>`);
    }
    const dead = s.order.filter(id => !s.objs[id].alive);
    const roots = s.roots.map(r => `<div class="root"><span class="nm">${esc(r.name)}</span>${r.to ? `<span class="ref">→ ${esc(r.to)}</span>` : '<span class="ref null">null</span>'}${r.to ? act(`root:${r.name}`, esc(r.btn ?? '= null'), 'btn sm') : ''}</div>`).join('');
    const cuts = (card.cuts ?? []).filter(c => s.objs[c.from].alive && s.objs[c.from].refs.includes(c.to)).map(c => act(`cut:${c.from}>${c.to}`, esc(c.label), 'btn sm')).join('');
    return `<div class="roots"><div class="colh">${tl('r.mem.gc.8')}</div>${roots}${cuts ? `<div class="btns">${cuts}</div>` : ''}</div>
      <div class="gens${hasBig ? ' four' : ''}">${cols.join('')}</div>
      ${dead.length ? `<div class="dead">${tl('r.mem.gc.9')}: ${dead.map(esc).join(', ')}</div>` : ''}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tl('r.mem.gc.10')}</li>`}</ul>
      <div class="btns">${act('gc:0', tl('r.mem.gc.11'), 'btn primary')}${card.gen1 ? act('gc:1', tl('r.mem.gc.12')) : ''}${act('gc:2', tl('r.mem.gc.13'))}${hasFin ? act('fin', tl('r.mem.gc.14')) : ''}${act('reset', tl('r.mem.gc.15'))}</div>`;
  }, done);
}

/* ---------- дескрипторы файлов ---------- */

function files(card, host, done) {
  const allow = new Set(card.buttons ?? ['open', 'dispose', 'forget', 'gc', 'fin']);
  drive(card, host, fileRig, s => {
    const vars = s.vars.map(v => {
      const o = s.objs[v.id];
      return `<div class="root"><span class="nm">FileStream ${esc(v.name)}</span><span class="ref">${o.disposed ? tl('r.mem.files.1') : tl('r.mem.files.2')}</span>
        ${allow.has('dispose') ? act(`dispose:${v.name}`, `${esc(v.name)}.Dispose()`, 'btn sm', o.disposed) : ''}${allow.has('forget') ? act(`forget:${v.name}`, `${esc(v.name)} = null`, 'btn sm') : ''}</div>`;
    }).join('') || `<div class="empty">${tl('r.mem.files.3')}</div>`;
    const handles = Object.values(s.objs).map(o => `<div class="hrow"><b>${o.handle}</b><span>log.txt</span><span class="st ${o.handleOpen ? 'open' : 'closed'}">${o.handleOpen ? tl('r.mem.files.4') : tl('r.mem.files.5')}</span>
      <span>${o.queued ? tl('r.mem.files.6')
        : !o.alive ? tl('r.mem.files.7')
        : s.vars.some(v => v.id === o.id) ? tl('r.mem.files.8', { v1: esc(o.name) })
        : tl('r.mem.files.9')}</span></div>`).join('');
    return `<div class="roots"><div class="colh">${tl('r.mem.files.10')}</div>${vars}</div>
      <div class="htable"><div class="colh">${tl('r.mem.files.11')}</div>${handles || `<div class="empty">${tl('r.mem.files.12')}</div>`}</div>
      ${s.error ? `<div class="vm-note err">${esc(s.error)}</div>` : ''}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tl('r.mem.files.13')}</li>`}</ul>
      <div class="btns">${allow.has('open') ? act('open', 'new FileStream("log.txt")', 'btn primary') : ''}${allow.has('using') ? act('using', 'using (new FileStream(…)) { … }', 'btn primary') : ''}${allow.has('gc') ? act('gc', 'GC.Collect()') : ''}${allow.has('fin') ? act('fin', tl('r.mem.files.14')) : ''}${act('reset', tl('r.mem.files.15'))}</div>`;
  }, done);
}

export const MEM_RIGS = { memory, gc, files };

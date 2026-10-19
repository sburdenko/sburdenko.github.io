/** Стенды курса «Async/await до дна»: таймлайн потоков, машина состояний, комбинаторы задач. */
import { esc } from '../assets/vhs.js?v=202610191133';
import { codeHtml } from './code-view.js?v=202610191133';
import { tr, plural } from './i18n.js?v=202610191133';
import { drive, act } from './rig-kit.js?v=202610191133';
import { CTX, IO_TICKS, timelineRig, SM_SOURCE, SM_MOVENEXT, smRig, TASKS, combine, combineRig } from './models-async.js?v=202610191133';
import { t as tl, tp } from './ui.js?v=202610191133';

const seg = (items, cur, prefix) => `<div class="seg wrap">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(label), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;

/* ---------- таймлайн потоков ---------- */

function timelineCode(o, api) {
  const cfa = o.cfa ? '.ConfigureAwait(false)' : '';
  const tail = api ? (o.ctx === 'unity' ? tl('r.async.timelineCode.1') : tl('r.async.timelineCode.2')) : '    return Parse(json);';
  const inner = o.call === 'sync'
    ? `string GetData()\n{\n    var json = http.GetString(url);   // ${tl('r.async.timelineCode.3')}\n    return Parse(json);\n}`
    : `async Task<string> GetDataAsync()\n{\n    var json = await http.GetStringAsync(url)${cfa};\n${tail}\n}`;
  const handlerName = o.ctx === 'unity' ? 'Start' : o.ctx === 'console' ? 'Handle' : 'OnClick';
  const handler = o.call === 'sync' ? `void ${handlerName}()\n{\n    Show(GetData());\n}`
    : o.call === 'result' ? `void ${handlerName}()\n{\n    var r = GetDataAsync().Result;   // ${tl('r.async.timelineCode.4')}\n    Show(r);\n}`
    : `async ${o.ctx === 'console' ? 'Task' : 'void'} ${handlerName}()\n{\n    var r = await GetDataAsync();\n    Show(r);\n}`;
  return `${handler}\n\n${inner}`;
}

const laneChip = x => !x ? `<span class="job idle">${tl('r.async.laneChip.1')}</span>`
  : `<span class="job ${x.kind === 'blocked' ? 'blocked' : x.kind === 'idle' ? 'idle' : x.cont ? 'cont' : 'cpu'}">${esc(x.label)}</span>`;

function timeline(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, timelineRig, s => {
    const fr = s.frames[s.f], ctx = CTX[s.o.ctx], ctxName = tr(ctx.name);
    const last = s.f === s.frames.length - 1;
    const banner = fr.status === 'deadlock' ? `<div class="vm-note err">${tl('r.async.timeline.2')}</div>`
      : fr.status === 'error' ? `<div class="vm-note err">${tl('r.async.timeline.3')}</div>`
      : fr.status === 'done' && last ? `<div class="vm-note ret">${tl('r.async.timeline.4')} ${fr.t} ${tp('r.async.timeline.1', fr.t)}.${fr.clickAt ? tl('r.async.timeline.5', { clickAt: fr.clickAt }) : ''}</div>` : '';
    const controls = [
      lock.has('ctx') ? '' : `<div class="ctl-group"><span class="ctl-label">${tl('r.async.timeline.6')}</span>${seg(Object.entries(CTX).map(([k, c]) => [k, tr(c.name)]), s.o.ctx, 'ctx')}</div>`,
      lock.has('call') ? '' : `<div class="ctl-group"><span class="ctl-label">${tl('r.async.timeline.7')}</span>${seg([['sync', tl('r.async.timeline.8')], ['result', '.Result'], ['await', 'await']], s.o.call, 'call')}</div>`,
      lock.has('cfa') || s.o.call === 'sync' ? '' : `<div class="btns">${act('cfa', s.o.cfa ? '✓ ConfigureAwait(false)' : tl('r.async.timeline.9'), 'btn sm')}</div>`
    ].join('');
    return `<pre class="code small">${codeHtml(timelineCode(s.o, card.api))}</pre>
      ${controls}
      <div class="tl">
        <div class="tl-h"><span class="colh">${tl('r.async.timeline.10')} ${fr.t}</span><span class="colh">${esc(ctxName)}</span></div>
        <div class="lane-t"><span class="tn">${esc(tr(ctx.main))}</span>${laneChip(fr.main)}</div>
        ${ctx.loop ? `<div class="lane-t lq"><span class="tn">${tl('r.async.timeline.11')}</span><span class="qline">${fr.mainQ.map((x, i) => `<span class="qi ${fr.mainQKind[i] === 'click' ? '' : 'cont'}">${esc(x)}</span>`).join('') || `<span class="empty">${tl('r.async.timeline.12')}</span>`}</span></div>` : ''}
        <div class="lane-t"><span class="tn">${tl('r.async.timeline.13')}</span>${laneChip(fr.pool)}</div>
        <div class="lane-t lq"><span class="tn">${tl('r.async.timeline.14')}</span><span class="qline">${fr.io != null ? `<span class="qi net">${tl('r.async.timeline.15', { io: fr.io, IO_TICKS })}</span>` : fr.t === 0 ? '<span class="empty">—</span>' : `<span class="empty">${tl('r.async.timeline.16')}</span>`}</span></div>
      </div>
      <div class="vm-note${fr.status === 'deadlock' || fr.status === 'error' ? ' err' : ''}">${esc(fr.note)}</div>
      ${banner}
      <div class="btns">${act('tick', tl('r.async.timeline.17'), 'btn primary', last)}${act('end', tl('r.async.timeline.18'), 'btn', last)}${act('restart', tl('r.async.timeline.19'))}</div>`;
  }, done);
}

/* ---------- машина состояний ---------- */

function statemachine(card, host, done) {
  drive(card, host, smRig, s => {
    const fr = s.frames[s.f];
    const pane = (src, cur) => `<pre class="code small sm">${src.split('\n').map((l, i) => `<span class="ln${i === cur ? ' cur' : ''}">${codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '')}</span>`).join('')}</pre>`;
    const fields = Object.entries(fr.fields).map(([k, v]) => `<div class="fld"><span>${k}</span><b>${esc(String(v))}</b></div>`).join('');
    const last = s.f === s.frames.length - 1;
    return `<div class="btns">${act('cached', s.cached ? tl('r.async.statemachine.1') : tl('r.async.statemachine.2'), 'btn sm')}</div>
      <div class="sm-panes"><div><div class="colh">${tl('r.async.statemachine.3')}</div>${pane(SM_SOURCE, fr.src)}</div><div><div class="colh">${tl('r.async.statemachine.4')}</div>${pane(SM_MOVENEXT, fr.mn)}</div></div>
      <div class="pool-stats">
        <div class="counter"><b>${fr.fields.state}</b><span>state</span></div>
        <div class="counter"><b>${fr.calls}</b><span>${tl('r.async.statemachine.5')}</span></div>
        <div class="counter"><b>${fr.pauses}</b><span>${tl('r.async.statemachine.6')}</span></div>
        <div class="counter${fr.suspended ? ' good' : ''}"><b class="word">${fr.suspended ? tl('r.async.statemachine.7') : fr.done ? tl('r.async.statemachine.8') : tl('r.async.statemachine.9')}</b><span>${tl('r.async.statemachine.10')}</span></div>
      </div>
      <div class="roots"><div class="colh">${tl('r.async.statemachine.11')}</div>${fields}</div>
      <div class="vm-note${fr.done ? ' ret' : ''}">${esc(fr.note)}</div>
      <div class="btns">${act('step', tl('r.async.statemachine.12'), 'btn primary', last)}${act('reset', tl('r.async.statemachine.13'))}</div>`;
  }, done);
}

/* ---------- комбинаторы задач ---------- */

function combinators(card, host, done) {
  drive(card, host, combineRig, s => {
    const r = combine(s.mode, s.fails);
    const max = 1000, ms = tl('r.async.combinators.1');
    const code = s.mode === 'seq'
      ? tl('r.async.combinators.2')
      : s.mode === 'all'
        ? 'var tA = GetProfileAsync();\nvar tB = GetOrdersAsync();\nvar tC = GetBalanceAsync();\nawait Task.WhenAll(tA, tB, tC);'
        : 'var first = await Task.WhenAny(tA, tB, tC);';
    const bars = r.bars.map(b => `<div class="lane">
        <div class="hd"><span>${b.id} — ${esc(b.name)}</span><span class="t">${b.state === 'skip' ? tl('r.async.combinators.3') : `${b.start}–${b.end} ${ms}`}</span></div>
        <div class="rbar">${b.state === 'skip' ? '' : `<i class="gap" style="width:${b.start / max * 100}%"></i><i class="${b.state === 'fail' ? 'jit' : 'run'}" style="width:${(b.end - b.start) / max * 100}%"></i>`}</div></div>`).join('');
    const outcome = r.thrown
      ? tl('r.async.combinators.4', { thrown: r.thrown }) + (s.mode === 'all' && r.inner.length > 1 ? tl('r.async.combinators.5', { length: r.inner.length, v1: r.inner.join(', ') }) : '')
      : tl('r.async.combinators.6', { result: r.result });
    return `<pre class="code small">${codeHtml(code)}</pre>
      <div class="ctl-group"><span class="ctl-label">${tl('r.async.combinators.7')}</span>${seg([['seq', tl('r.async.combinators.8')], ['all', 'Task.WhenAll'], ['any', 'Task.WhenAny']], s.mode, 'mode')}</div>
      <div class="btns">${TASKS.map(x => act(`fail:${x.id}`, s.fails.includes(x.id) ? tl('r.async.combinators.9', { id: x.id }) : tl('r.async.combinators.10', { id: x.id }), 'btn sm')).join('')}</div>
      <div class="race">${bars}</div>
      <div class="pool-stats two"><div class="counter${s.mode !== 'seq' ? ' good' : ''}"><b>${r.total} ${ms}</b><span>${tl('r.async.combinators.11')}</span></div><div class="counter"><b>${r.inner.length}</b><span>${tl('r.async.combinators.12')}</span></div></div>
      <div class="vm-note${r.thrown ? ' err' : ' ret'}">${esc(outcome)}</div>`;
  }, done);
}

export const RIGS_ASYNC = { timeline, statemachine, combinators };

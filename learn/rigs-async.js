/** Стенды курса «Async/await до дна»: таймлайн потоков, машина состояний, комбинаторы задач. */
import { esc } from '../assets/vhs.js?v=202610092124';
import { codeHtml } from './code-view.js?v=202610092124';
import { drive, act } from './rig-kit.js?v=202610092124';
import { CTX, IO_TICKS, timelineRig, SM_SOURCE, SM_MOVENEXT, smRig, TASKS, combine, combineRig } from './models-async.js?v=202610092124';

const seg = (items, cur, prefix) => `<div class="seg wrap">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(label), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;

/* ---------- таймлайн потоков ---------- */

function timelineCode(o, api) {
  const cfa = o.cfa ? '.ConfigureAwait(false)' : '';
  const tail = api ? (o.ctx === 'unity' ? '    transform.position = Parse(json);   // трогаем Unity API' : '    label.Text = json;   // трогаем контрол окна') : '    return Parse(json);';
  const inner = o.call === 'sync'
    ? `string GetData()\n{\n    var json = http.GetString(url);   // блокирует поток\n    return Parse(json);\n}`
    : `async Task<string> GetDataAsync()\n{\n    var json = await http.GetStringAsync(url)${cfa};\n${tail}\n}`;
  const handlerName = o.ctx === 'unity' ? 'Start' : o.ctx === 'console' ? 'Handle' : 'OnClick';
  const handler = o.call === 'sync' ? `void ${handlerName}()\n{\n    Show(GetData());\n}`
    : o.call === 'result' ? `void ${handlerName}()\n{\n    var r = GetDataAsync().Result;   // ждём синхронно\n    Show(r);\n}`
    : `async ${o.ctx === 'console' ? 'Task' : 'void'} ${handlerName}()\n{\n    var r = await GetDataAsync();\n    Show(r);\n}`;
  return `${handler}\n\n${inner}`;
}

const laneChip = x => !x ? '<span class="job idle">свободен</span>'
  : `<span class="job ${x.kind === 'blocked' ? 'blocked' : x.kind === 'idle' ? 'idle' : x.label.includes('продолжение') || x.label.includes('после await') ? 'cont' : 'cpu'}">${esc(x.label)}</span>`;

function timeline(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, timelineRig, s => {
    const fr = s.frames[s.f], ctx = CTX[s.o.ctx];
    const last = s.f === s.frames.length - 1;
    const banner = fr.status === 'deadlock' ? '<div class="vm-note err">DEADLOCK — программа зависла навсегда.</div>'
      : fr.status === 'error' ? '<div class="vm-note err">Исключение — продолжение выполнилось не в том потоке.</div>'
      : fr.status === 'done' && last ? `<div class="vm-note ret">Готово за ${fr.t} тиков.${fr.clickAt ? ` Клик пользователя обработан на тике ${fr.clickAt}.` : ''}</div>` : '';
    const controls = [
      lock.has('ctx') ? '' : `<div class="ctl-group"><span class="ctl-label">Где работает программа</span>${seg(Object.entries(CTX).map(([k, c]) => [k, c.name]), s.o.ctx, 'ctx')}</div>`,
      lock.has('call') ? '' : `<div class="ctl-group"><span class="ctl-label">Как обработчик ждёт результат</span>${seg([['sync', 'синхронный метод'], ['result', '.Result'], ['await', 'await']], s.o.call, 'call')}</div>`,
      lock.has('cfa') || s.o.call === 'sync' ? '' : `<div class="btns">${act('cfa', s.o.cfa ? '✓ ConfigureAwait(false)' : 'Добавить ConfigureAwait(false)', 'btn sm')}</div>`
    ].join('');
    return `<pre class="code small">${codeHtml(timelineCode(s.o, card.api))}</pre>
      ${controls}
      <div class="tl">
        <div class="tl-h"><span class="colh">тик ${fr.t}</span><span class="colh">${esc(ctx.name)}</span></div>
        <div class="lane-t"><span class="tn">${esc(ctx.main)}</span>${laneChip(fr.main)}</div>
        ${ctx.loop ? `<div class="lane-t lq"><span class="tn">очередь</span><span class="qline">${fr.mainQ.map(x => `<span class="qi ${x.includes('клик') ? '' : 'cont'}">${esc(x)}</span>`).join('') || '<span class="empty">пусто</span>'}</span></div>` : ''}
        <div class="lane-t"><span class="tn">пул потоков</span>${laneChip(fr.pool)}</div>
        <div class="lane-t lq"><span class="tn">сеть</span><span class="qline">${fr.io != null ? `<span class="qi net">ждём ответ: ещё ${fr.io} из ${IO_TICKS} — ни один поток не занят</span>` : fr.t === 0 ? '<span class="empty">—</span>' : '<span class="empty">ответ получен</span>'}</span></div>
      </div>
      <div class="vm-note${fr.status === 'deadlock' || fr.status === 'error' ? ' err' : ''}">${esc(fr.note)}</div>
      ${banner}
      <div class="btns">${act('tick', 'Тик ►', 'btn primary', last)}${act('end', 'До конца ►►', 'btn', last)}${act('restart', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- машина состояний ---------- */

function statemachine(card, host, done) {
  drive(card, host, smRig, s => {
    const fr = s.frames[s.f];
    const pane = (src, cur) => `<pre class="code small sm">${src.split('\n').map((l, i) => `<span class="ln${i === cur ? ' cur' : ''}">${codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '')}</span>`).join('')}</pre>`;
    const fields = Object.entries(fr.fields).map(([k, v]) => `<div class="fld"><span>${k}</span><b>${esc(String(v))}</b></div>`).join('');
    const last = s.f === s.frames.length - 1;
    return `<div class="btns">${act('cached', s.cached ? '✓ Ответы уже готовы (IsCompleted = true)' : 'Ответы ещё в пути (IsCompleted = false)', 'btn sm')}</div>
      <div class="sm-panes"><div><div class="colh">Твой код</div>${pane(SM_SOURCE, fr.src)}</div><div><div class="colh">Что сгенерировал компилятор (упрощённо)</div>${pane(SM_MOVENEXT, fr.mn)}</div></div>
      <div class="pool-stats">
        <div class="counter"><b>${fr.fields.state}</b><span>state</span></div>
        <div class="counter"><b>${fr.calls}</b><span>вызовов MoveNext</span></div>
        <div class="counter"><b>${fr.pauses}</b><span>приостановок</span></div>
        <div class="counter${fr.suspended ? ' good' : ''}"><b class="word">${fr.suspended ? 'свободен' : fr.done ? 'готово' : 'работает'}</b><span>поток</span></div>
      </div>
      <div class="roots"><div class="colh">Поля машины состояний</div>${fields}</div>
      <div class="vm-note${fr.done ? ' ret' : ''}">${esc(fr.note)}</div>
      <div class="btns">${act('step', 'Шаг ►', 'btn primary', last)}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- комбинаторы задач ---------- */

function combinators(card, host, done) {
  drive(card, host, combineRig, s => {
    const r = combine(s.mode, s.fails);
    const max = 1000;
    const code = s.mode === 'seq'
      ? 'var a = await GetProfileAsync();   // 300 мс\nvar b = await GetOrdersAsync();    // 500 мс\nvar c = await GetBalanceAsync();   // 200 мс'
      : s.mode === 'all'
        ? 'var tA = GetProfileAsync();\nvar tB = GetOrdersAsync();\nvar tC = GetBalanceAsync();\nawait Task.WhenAll(tA, tB, tC);'
        : 'var first = await Task.WhenAny(tA, tB, tC);';
    const bars = r.bars.map(b => `<div class="lane">
        <div class="hd"><span>${b.id} — ${esc(b.name)}</span><span class="t">${b.state === 'skip' ? 'не запущена' : `${b.start}–${b.end} мс`}</span></div>
        <div class="rbar">${b.state === 'skip' ? '' : `<i class="gap" style="width:${b.start / max * 100}%"></i><i class="${b.state === 'fail' ? 'jit' : 'run'}" style="width:${(b.end - b.start) / max * 100}%"></i>`}</div></div>`).join('');
    const outcome = r.thrown
      ? `await бросил исключение задачи ${r.thrown}.${s.mode === 'all' && r.inner.length > 1 ? ` А в tAll.Exception.InnerExceptions лежат все ${r.inner.length}: ${r.inner.join(', ')}.` : ''}`
      : `Результат: ${r.result}.`;
    return `<pre class="code small">${codeHtml(code)}</pre>
      <div class="ctl-group"><span class="ctl-label">Как ждать</span>${seg([['seq', 'по очереди'], ['all', 'Task.WhenAll'], ['any', 'Task.WhenAny']], s.mode, 'mode')}</div>
      <div class="btns">${TASKS.map(x => act(`fail:${x.id}`, s.fails.includes(x.id) ? `✗ ${x.id} падает` : `${x.id} работает`, 'btn sm')).join('')}</div>
      <div class="race">${bars}</div>
      <div class="pool-stats two"><div class="counter${s.mode !== 'seq' ? ' good' : ''}"><b>${r.total} мс</b><span>общее время</span></div><div class="counter"><b>${r.inner.length}</b><span>исключений</span></div></div>
      <div class="vm-note${r.thrown ? ' err' : ' ret'}">${esc(outcome)}</div>`;
  }, done);
}

export const RIGS_ASYNC = { timeline, statemachine, combinators };

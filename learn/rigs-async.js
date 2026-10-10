/** Стенды курса «Async/await до дна»: таймлайн потоков, машина состояний, комбинаторы задач. */
import { esc } from '../assets/vhs.js?v=202610100756';
import { codeHtml } from './code-view.js?v=202610100756';
import { tr, plural } from './i18n.js?v=202610100756';
import { drive, act } from './rig-kit.js?v=202610100756';
import { CTX, IO_TICKS, timelineRig, SM_SOURCE, SM_MOVENEXT, smRig, TASKS, combine, combineRig } from './models-async.js?v=202610100756';

const seg = (items, cur, prefix) => `<div class="seg wrap">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(label), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;

/* ---------- таймлайн потоков ---------- */

function timelineCode(o, api) {
  const cfa = o.cfa ? '.ConfigureAwait(false)' : '';
  const tail = api ? (o.ctx === 'unity' ? tr({ ru: '    transform.position = Parse(json);   // трогаем Unity API', en: '    transform.position = Parse(json);   // touching the Unity API' }) : tr({ ru: '    label.Text = json;   // трогаем контрол окна', en: '    label.Text = json;   // touching a window control' })) : '    return Parse(json);';
  const inner = o.call === 'sync'
    ? `string GetData()\n{\n    var json = http.GetString(url);   // ${tr({ ru: 'блокирует поток', en: 'blocks the thread' })}\n    return Parse(json);\n}`
    : `async Task<string> GetDataAsync()\n{\n    var json = await http.GetStringAsync(url)${cfa};\n${tail}\n}`;
  const handlerName = o.ctx === 'unity' ? 'Start' : o.ctx === 'console' ? 'Handle' : 'OnClick';
  const handler = o.call === 'sync' ? `void ${handlerName}()\n{\n    Show(GetData());\n}`
    : o.call === 'result' ? `void ${handlerName}()\n{\n    var r = GetDataAsync().Result;   // ${tr({ ru: 'ждём синхронно', en: 'waiting synchronously' })}\n    Show(r);\n}`
    : `async ${o.ctx === 'console' ? 'Task' : 'void'} ${handlerName}()\n{\n    var r = await GetDataAsync();\n    Show(r);\n}`;
  return `${handler}\n\n${inner}`;
}

const laneChip = x => !x ? `<span class="job idle">${tr({ ru: 'свободен', en: 'free' })}</span>`
  : `<span class="job ${x.kind === 'blocked' ? 'blocked' : x.kind === 'idle' ? 'idle' : x.cont ? 'cont' : 'cpu'}">${esc(x.label)}</span>`;

function timeline(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, timelineRig, s => {
    const fr = s.frames[s.f], ctx = CTX[s.o.ctx], ctxName = tr(ctx.name);
    const last = s.f === s.frames.length - 1;
    const banner = fr.status === 'deadlock' ? `<div class="vm-note err">${tr({ ru: 'DEADLOCK — программа зависла навсегда.', en: 'DEADLOCK: the program is stuck forever.' })}</div>`
      : fr.status === 'error' ? `<div class="vm-note err">${tr({ ru: 'Исключение — продолжение выполнилось не в том потоке.', en: 'Exception: the continuation ran on the wrong thread.' })}</div>`
      : fr.status === 'done' && last ? `<div class="vm-note ret">${tr({ ru: 'Готово за', en: 'Done in' })} ${fr.t} ${plural(fr.t, ['тик', 'тика', 'тиков'], ['tick', 'ticks'])}.${fr.clickAt ? tr({ ru: ` Клик пользователя обработан на тике ${fr.clickAt}.`, en: ` The user click was handled on tick ${fr.clickAt}.` }) : ''}</div>` : '';
    const controls = [
      lock.has('ctx') ? '' : `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Где работает программа', en: 'Where the program runs' })}</span>${seg(Object.entries(CTX).map(([k, c]) => [k, tr(c.name)]), s.o.ctx, 'ctx')}</div>`,
      lock.has('call') ? '' : `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Как обработчик ждёт результат', en: 'How the handler waits for the result' })}</span>${seg([['sync', tr({ ru: 'синхронный метод', en: 'synchronous method' })], ['result', '.Result'], ['await', 'await']], s.o.call, 'call')}</div>`,
      lock.has('cfa') || s.o.call === 'sync' ? '' : `<div class="btns">${act('cfa', s.o.cfa ? '✓ ConfigureAwait(false)' : tr({ ru: 'Добавить ConfigureAwait(false)', en: 'Add ConfigureAwait(false)' }), 'btn sm')}</div>`
    ].join('');
    return `<pre class="code small">${codeHtml(timelineCode(s.o, card.api))}</pre>
      ${controls}
      <div class="tl">
        <div class="tl-h"><span class="colh">${tr({ ru: 'тик', en: 'tick' })} ${fr.t}</span><span class="colh">${esc(ctxName)}</span></div>
        <div class="lane-t"><span class="tn">${esc(tr(ctx.main))}</span>${laneChip(fr.main)}</div>
        ${ctx.loop ? `<div class="lane-t lq"><span class="tn">${tr({ ru: 'очередь', en: 'queue' })}</span><span class="qline">${fr.mainQ.map((x, i) => `<span class="qi ${fr.mainQKind[i] === 'click' ? '' : 'cont'}">${esc(x)}</span>`).join('') || `<span class="empty">${tr({ ru: 'пусто', en: 'empty' })}</span>`}</span></div>` : ''}
        <div class="lane-t"><span class="tn">${tr({ ru: 'пул потоков', en: 'thread pool' })}</span>${laneChip(fr.pool)}</div>
        <div class="lane-t lq"><span class="tn">${tr({ ru: 'сеть', en: 'network' })}</span><span class="qline">${fr.io != null ? `<span class="qi net">${tr({ ru: `ждём ответ: ещё ${fr.io} из ${IO_TICKS} — ни один поток не занят`, en: `waiting for the response: ${fr.io} of ${IO_TICKS} left, no thread is busy` })}</span>` : fr.t === 0 ? '<span class="empty">—</span>' : `<span class="empty">${tr({ ru: 'ответ получен', en: 'response received' })}</span>`}</span></div>
      </div>
      <div class="vm-note${fr.status === 'deadlock' || fr.status === 'error' ? ' err' : ''}">${esc(fr.note)}</div>
      ${banner}
      <div class="btns">${act('tick', tr({ ru: 'Тик ►', en: 'Tick ►' }), 'btn primary', last)}${act('end', tr({ ru: 'До конца ►►', en: 'To the end ►►' }), 'btn', last)}${act('restart', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>`;
  }, done);
}

/* ---------- машина состояний ---------- */

function statemachine(card, host, done) {
  drive(card, host, smRig, s => {
    const fr = s.frames[s.f];
    const pane = (src, cur) => `<pre class="code small sm">${src.split('\n').map((l, i) => `<span class="ln${i === cur ? ' cur' : ''}">${codeHtml(l || ' ').replace(/^<span class="ln">|<\/span>$/g, '')}</span>`).join('')}</pre>`;
    const fields = Object.entries(fr.fields).map(([k, v]) => `<div class="fld"><span>${k}</span><b>${esc(String(v))}</b></div>`).join('');
    const last = s.f === s.frames.length - 1;
    return `<div class="btns">${act('cached', s.cached ? tr({ ru: '✓ Ответы уже готовы (IsCompleted = true)', en: '✓ Results are ready (IsCompleted = true)' }) : tr({ ru: 'Ответы ещё в пути (IsCompleted = false)', en: 'Results still on their way (IsCompleted = false)' }), 'btn sm')}</div>
      <div class="sm-panes"><div><div class="colh">${tr({ ru: 'Твой код', en: 'Your code' })}</div>${pane(SM_SOURCE, fr.src)}</div><div><div class="colh">${tr({ ru: 'Что сгенерировал компилятор (упрощённо)', en: 'What the compiler generated (simplified)' })}</div>${pane(SM_MOVENEXT, fr.mn)}</div></div>
      <div class="pool-stats">
        <div class="counter"><b>${fr.fields.state}</b><span>state</span></div>
        <div class="counter"><b>${fr.calls}</b><span>${tr({ ru: 'вызовов MoveNext', en: 'MoveNext calls' })}</span></div>
        <div class="counter"><b>${fr.pauses}</b><span>${tr({ ru: 'приостановок', en: 'suspensions' })}</span></div>
        <div class="counter${fr.suspended ? ' good' : ''}"><b class="word">${fr.suspended ? tr({ ru: 'свободен', en: 'free' }) : fr.done ? tr({ ru: 'готово', en: 'done' }) : tr({ ru: 'работает', en: 'busy' })}</b><span>${tr({ ru: 'поток', en: 'thread' })}</span></div>
      </div>
      <div class="roots"><div class="colh">${tr({ ru: 'Поля машины состояний', en: 'State machine fields' })}</div>${fields}</div>
      <div class="vm-note${fr.done ? ' ret' : ''}">${esc(fr.note)}</div>
      <div class="btns">${act('step', tr({ ru: 'Шаг ►', en: 'Step ►' }), 'btn primary', last)}${act('reset', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>`;
  }, done);
}

/* ---------- комбинаторы задач ---------- */

function combinators(card, host, done) {
  drive(card, host, combineRig, s => {
    const r = combine(s.mode, s.fails);
    const max = 1000, ms = tr({ ru: 'мс', en: 'ms' });
    const code = s.mode === 'seq'
      ? tr({ ru: 'var a = await GetProfileAsync();   // 300 мс\nvar b = await GetOrdersAsync();    // 500 мс\nvar c = await GetBalanceAsync();   // 200 мс', en: 'var a = await GetProfileAsync();   // 300 ms\nvar b = await GetOrdersAsync();    // 500 ms\nvar c = await GetBalanceAsync();   // 200 ms' })
      : s.mode === 'all'
        ? 'var tA = GetProfileAsync();\nvar tB = GetOrdersAsync();\nvar tC = GetBalanceAsync();\nawait Task.WhenAll(tA, tB, tC);'
        : 'var first = await Task.WhenAny(tA, tB, tC);';
    const bars = r.bars.map(b => `<div class="lane">
        <div class="hd"><span>${b.id} — ${esc(b.name)}</span><span class="t">${b.state === 'skip' ? tr({ ru: 'не запущена', en: 'not started' }) : `${b.start}–${b.end} ${ms}`}</span></div>
        <div class="rbar">${b.state === 'skip' ? '' : `<i class="gap" style="width:${b.start / max * 100}%"></i><i class="${b.state === 'fail' ? 'jit' : 'run'}" style="width:${(b.end - b.start) / max * 100}%"></i>`}</div></div>`).join('');
    const outcome = r.thrown
      ? tr({ ru: `await бросил исключение задачи ${r.thrown}.`, en: `await threw the exception of task ${r.thrown}.` }) + (s.mode === 'all' && r.inner.length > 1 ? tr({ ru: ` А в tAll.Exception.InnerExceptions лежат все ${r.inner.length}: ${r.inner.join(', ')}.`, en: ` And tAll.Exception.InnerExceptions holds all ${r.inner.length}: ${r.inner.join(', ')}.` }) : '')
      : tr({ ru: `Результат: ${r.result}.`, en: `Result: ${r.result}.` });
    return `<pre class="code small">${codeHtml(code)}</pre>
      <div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Как ждать', en: 'How to wait' })}</span>${seg([['seq', tr({ ru: 'по очереди', en: 'one by one' })], ['all', 'Task.WhenAll'], ['any', 'Task.WhenAny']], s.mode, 'mode')}</div>
      <div class="btns">${TASKS.map(x => act(`fail:${x.id}`, s.fails.includes(x.id) ? tr({ ru: `✗ ${x.id} падает`, en: `✗ ${x.id} fails` }) : tr({ ru: `${x.id} работает`, en: `${x.id} works` }), 'btn sm')).join('')}</div>
      <div class="race">${bars}</div>
      <div class="pool-stats two"><div class="counter${s.mode !== 'seq' ? ' good' : ''}"><b>${r.total} ${ms}</b><span>${tr({ ru: 'общее время', en: 'total time' })}</span></div><div class="counter"><b>${r.inner.length}</b><span>${tr({ ru: 'исключений', en: 'exceptions' })}</span></div></div>
      <div class="vm-note${r.thrown ? ' err' : ' ret'}">${esc(outcome)}</div>`;
  }, done);
}

export const RIGS_ASYNC = { timeline, statemachine, combinators };

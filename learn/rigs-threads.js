/** Стенды раздела про потоки: гонка данных, взаимная блокировка, пул потоков. */
import { esc, fmtI } from '../assets/vhs.js?v=202610100741';
import { drive, act } from './rig-kit.js?v=202610100741';
import {
  raceRig, raceCan, raceFinished, raceDone, RACE_STEPS, RACE_CODE,
  lockRig, lockCan, lockFinished, lockStatus,
  poolRig, poolBlocked, poolAvgWait
} from './models-threads.js?v=202610100741';
import { tr } from './i18n.js?v=202610100741';

/* ---------- гонка данных ---------- */

function datarace(card, host, done) {
  drive(card, host, raceRig, s => {
    const steps = RACE_STEPS[s.mode];
    const col = t => {
      const th = s.th[t];
      const waiting = !raceFinished(s, t) && !raceCan(s, t);
      return `<div class="thr"><div class="colh">${tr({ ru: 'Поток', en: 'Thread' })} ${t}</div>
        <div class="prog">${steps.map((op, i) => `<div class="${i < th.pc ? 'done' : i === th.pc ? 'cur' : ''}"><span class="pc">${i + 1}</span><span>${esc(RACE_CODE[op])}</span></div>`).join('')}</div>
        <div class="reg">${tr({ ru: 'регистр tmp', en: 'register tmp' })}: <b>${th.tmp ?? '—'}</b></div>
        ${act(`step:${t}`, waiting ? tr({ ru: `${t} ждёт lock…`, en: `${t} waits for lock…` })
          : raceFinished(s, t) ? tr({ ru: `${t} закончил`, en: `${t} finished` })
          : tr({ ru: `Шаг потока ${t} ►`, en: `Step thread ${t} ►` }), 'btn primary', !raceCan(s, t))}</div>`;
    };
    let verdict = '';
    if (raceDone(s)) verdict = s.count === 2
      ? `<div class="vm-note ret">${tr({ ru: 'Оба потока прибавили по единице: count = 2. Всё верно.', en: 'Each thread added one: count = 2. All correct.' })}</div>`
      : `<div class="vm-note err">${tr({ ru: 'Два потока сделали count++, а count = 1. Одно увеличение потеряно: оба прочитали 0 до того, как кто-то записал 1.', en: 'Two threads did count++, yet count = 1. One increment is lost: both read 0 before either wrote 1.' })}</div>`;
    const runs = s.runs?.length
      ? `<div class="runs">${s.runs.map(r => `<span class="${r === 2000 ? 'ok' : 'bad'}">${fmtI(r)} ${tr({ ru: 'из 2 000', en: 'of 2,000' })}</span>`).join('')}</div>` : '';
    return `<div class="shared"><span>${tr({ ru: 'общая переменная в памяти', en: 'shared variable in memory' })}</span><b>count = ${s.count}</b></div>
      <div class="threads2">${col('A')}${col('B')}</div>${verdict}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tr({ ru: 'Ты — планировщик: решай, какой поток делает следующий шаг.', en: 'You are the scheduler: decide which thread takes the next step.' })}</li>`}</ul>
      ${runs}
      <div class="btns">${card.random ? act('random', tr({ ru: 'Запустить: 2 потока × 1 000 раз count++', en: 'Run: 2 threads × 1,000 times count++' })) : ''}${act('reset', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>`;
  }, done);
}

/* ---------- взаимная блокировка ---------- */

const lockLabel = op => op === 'work' ? tr({ ru: '  работа с общими данными', en: '  work with shared data' })
  : op.startsWith('unlock') ? tr({ ru: `} // отпустить ${op.slice(7)}`, en: `} // release ${op.slice(7)}` }) : `lock (${op.slice(5)}) {`;

function deadlock(card, host, done) {
  drive(card, host, lockRig, s => {
    const st = lockStatus(s);
    const col = t => `<div class="thr"><div class="colh">${tr({ ru: 'Поток', en: 'Thread' })} ${t}</div>
      <div class="prog">${s.plan[t].map((op, i) => `<div class="${i < s.pc[t] ? 'done' : i === s.pc[t] ? (st === 'deadlock' ? 'err' : 'cur') : ''}"><span class="pc">${i + 1}</span><span>${esc(lockLabel(op))}</span></div>`).join('')}</div>
      ${act(`step:${t}`, lockFinished(s, t) ? tr({ ru: `${t} закончил`, en: `${t} finished` })
        : lockCan(s, t) ? tr({ ru: `Шаг потока ${t} ►`, en: `Step thread ${t} ►` })
        : tr({ ru: `${t} ждёт замок…`, en: `${t} waits for the lock…` }), 'btn primary', !lockCan(s, t))}</div>`;
    const locks = ['L1', 'L2'].map(l => `<div class="lockbox${s.owner[l] ? ' held' : ''}"><b>${l}</b><span>${s.owner[l] ? tr({ ru: `держит ${s.owner[l]}`, en: `held by ${s.owner[l]}` }) : tr({ ru: 'свободен', en: 'free' })}</span></div>`).join('');
    const banner = st === 'deadlock'
      ? `<div class="vm-note err">${tr({ ru: 'DEADLOCK. A держит L1 и ждёт L2, B держит L2 и ждёт L1. Никто не уступит — программа зависла навсегда.', en: 'DEADLOCK. A holds L1 and waits for L2, B holds L2 and waits for L1. Neither will give way: the program hangs forever.' })}</div>`
      : st === 'done' ? `<div class="vm-note ret">${tr({ ru: 'Оба потока закончили работу.', en: 'Both threads finished their work.' })}</div>` : '';
    return `<div class="locks">${locks}</div><div class="threads2">${col('A')}${col('B')}</div>${banner}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tr({ ru: 'Шагай потоками в любом порядке.', en: 'Step the threads in any order.' })}</li>`}</ul>
      <div class="btns">${card.toggle ? act('fix', s.fixed ? tr({ ru: 'Вернуть разный порядок', en: 'Back to different orders' }) : tr({ ru: 'Брать замки в одном порядке', en: 'Take locks in the same order' }), 'btn') : ''}${act('reset', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>`;
  }, done);
}

/* ---------- пул потоков ---------- */

const ADD = {
  block: ['add:block:8', { ru: '+8 запросов с .Result', en: '+8 requests with .Result' }],
  async: ['add:async:8', { ru: '+8 запросов с await', en: '+8 requests with await' }],
  cpu: ['add:cpu:8', { ru: '+8 задач на CPU', en: '+8 CPU tasks' }]
};

function jobChip(j) {
  if (!j) return `<span class="job idle">${tr({ ru: 'свободен', en: 'idle' })}</span>`;
  const { req } = j;
  if (req.phase === 'cont') return `<span class="job cont">#${req.id} ${tr({ ru: 'продолжение после await', en: 'continuation after await' })}</span>`;
  if (req.kind === 'block' && j.ran >= 1) return `<span class="job blocked">#${req.id} ${tr({ ru: '.Result — стоит и ждёт сеть', en: '.Result: stuck waiting for the network' })}</span>`;
  if (req.kind === 'async') return `<span class="job cont">#${req.id} ${tr({ ru: 'старт, дальше await', en: 'start, then await' })}</span>`;
  return `<span class="job cpu">#${req.id} ${tr({ ru: 'работает', en: 'working' })}</span>`;
}

function pool(card, host, done) {
  let timer = null;
  const ctl = drive(card, host, poolRig, s => {
    const busy = s.queue.length || s.io.length || s.threads.some(Boolean);
    const avg = k => (s.done.some(x => x.kind === k) ? poolAvgWait(s, k).toFixed(1) : '—');
    const kinds = card.adds ?? ['block', 'async'];
    return `<div class="pool-stats">
        <div class="counter"><b>${s.tick}</b><span>${tr({ ru: 'тик', en: 'tick' })}</span></div>
        <div class="counter"><b>${s.threads.length}</b><span>${tr({ ru: `потоков (было ${s.min})`, en: `threads (started with ${s.min})` })}</span></div>
        <div class="counter"><b>${s.queue.length}</b><span>${tr({ ru: 'в очереди', en: 'queued' })}</span></div>
        <div class="counter"><b>${s.done.length}</b><span>${tr({ ru: 'выполнено', en: 'done' })}</span></div>
      </div>
      <div class="pool-lanes">${s.threads.map((j, i) => `<div class="lane-t"><span class="tn">${tr({ ru: 'поток', en: 'thread' })} ${i + 1}</span>${jobChip(j)}</div>`).join('')}</div>
      <div class="pool-q"><span class="colh">${tr({ ru: 'Очередь пула', en: 'Pool queue' })}</span>${s.queue.slice(0, 24).map(r => `<span class="qi ${r.phase === 'cont' ? 'cont' : r.kind}">#${r.id}</span>`).join('')}${s.queue.length > 24 ? `<span class="qi more">+${s.queue.length - 24}</span>` : ''}${s.queue.length ? '' : `<span class="empty">${tr({ ru: 'пусто', en: 'empty' })}</span>`}</div>
      <div class="pool-io">${tr({
        ru: `Ждут ответа сети, не занимая поток: <b>${s.io.length}</b> · заблокировано потоков: <b>${poolBlocked(s)}</b> · среднее ожидание: .Result — <b>${avg('block')}</b>, await — <b>${avg('async')}</b> тиков`,
        en: `Waiting for the network without holding a thread: <b>${s.io.length}</b> · blocked threads: <b>${poolBlocked(s)}</b> · average wait: .Result <b>${avg('block')}</b>, await <b>${avg('async')}</b> ticks`
      })}</div>
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tr({ ru: 'Добавь запросы и запусти время. Пул начинает с одного потока на ядро.', en: 'Add requests and start the clock. The pool begins with one thread per core.' })}</li>`}</ul>
      <div class="btns">${kinds.map(k => act(ADD[k][0], tr(ADD[k][1]), 'btn')).join('')}${act('tick:1', tr({ ru: 'Тик ►', en: 'Tick ►' }), 'btn')}<button type="button" class="btn primary" data-run>${timer ? tr({ ru: '⏸ Пауза', en: '⏸ Pause' }) : tr({ ru: '▶ Пуск', en: '▶ Run' })}</button>${act('reset', tr({ ru: 'Сначала ↺', en: 'Restart ↺' }))}</div>
      ${busy ? '' : ''}`;
  }, done, box => {
    box.querySelector('[data-run]').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; ctl.set(ctl.get()); return; }
      timer = setInterval(() => {
        if (!box.isConnected) { clearInterval(timer); timer = null; return; }
        const s = ctl.get();
        if (!s.queue.length && !s.io.length && !s.threads.some(Boolean)) { clearInterval(timer); timer = null; ctl.set(s); return; }
        ctl.set(poolRig.act(card, s, 'tick:1'));
      }, 320);
      ctl.set(ctl.get());
    };
  });
}

export const THREAD_RIGS = { datarace, deadlock, pool };

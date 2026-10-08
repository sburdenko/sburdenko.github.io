/** Стенды раздела про потоки: гонка данных, взаимная блокировка, пул потоков. */
import { esc, fmtI } from '../assets/vhs.js?v=202610081028';
import { drive, act } from './rig-kit.js?v=202610081028';
import {
  raceRig, raceCan, raceFinished, raceDone, RACE_STEPS, RACE_CODE,
  lockRig, lockCan, lockFinished, lockStatus,
  poolRig, poolBlocked, poolAvgWait
} from './models-threads.js?v=202610081028';

/* ---------- гонка данных ---------- */

function datarace(card, host, done) {
  drive(card, host, raceRig, s => {
    const steps = RACE_STEPS[s.mode];
    const col = t => {
      const th = s.th[t];
      const waiting = !raceFinished(s, t) && !raceCan(s, t);
      return `<div class="thr"><div class="colh">Поток ${t}</div>
        <div class="prog">${steps.map((op, i) => `<div class="${i < th.pc ? 'done' : i === th.pc ? 'cur' : ''}"><span class="pc">${i + 1}</span><span>${esc(RACE_CODE[op])}</span></div>`).join('')}</div>
        <div class="reg">регистр tmp: <b>${th.tmp ?? '—'}</b></div>
        ${act(`step:${t}`, waiting ? `${t} ждёт lock…` : raceFinished(s, t) ? `${t} закончил` : `Шаг потока ${t} ►`, 'btn primary', !raceCan(s, t))}</div>`;
    };
    let verdict = '';
    if (raceDone(s)) verdict = s.count === 2
      ? '<div class="vm-note ret">Оба потока прибавили по единице: count = 2. Всё верно.</div>'
      : '<div class="vm-note err">Два потока сделали count++, а count = 1. Одно увеличение потеряно: оба прочитали 0 до того, как кто-то записал 1.</div>';
    const runs = s.runs?.length
      ? `<div class="runs">${s.runs.map(r => `<span class="${r === 2000 ? 'ok' : 'bad'}">${fmtI(r)} из 2 000</span>`).join('')}</div>` : '';
    return `<div class="shared"><span>общая переменная в памяти</span><b>count = ${s.count}</b></div>
      <div class="threads2">${col('A')}${col('B')}</div>${verdict}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li>Ты — планировщик: решай, какой поток делает следующий шаг.</li>'}</ul>
      ${runs}
      <div class="btns">${card.random ? act('random', 'Запустить: 2 потока × 1 000 раз count++') : ''}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- взаимная блокировка ---------- */

const lockLabel = op => op === 'work' ? '  работа с общими данными'
  : op.startsWith('unlock') ? `} // отпустить ${op.slice(7)}` : `lock (${op.slice(5)}) {`;

function deadlock(card, host, done) {
  drive(card, host, lockRig, s => {
    const st = lockStatus(s);
    const col = t => `<div class="thr"><div class="colh">Поток ${t}</div>
      <div class="prog">${s.plan[t].map((op, i) => `<div class="${i < s.pc[t] ? 'done' : i === s.pc[t] ? (st === 'deadlock' ? 'err' : 'cur') : ''}"><span class="pc">${i + 1}</span><span>${esc(lockLabel(op))}</span></div>`).join('')}</div>
      ${act(`step:${t}`, lockFinished(s, t) ? `${t} закончил` : lockCan(s, t) ? `Шаг потока ${t} ►` : `${t} ждёт замок…`, 'btn primary', !lockCan(s, t))}</div>`;
    const locks = ['L1', 'L2'].map(l => `<div class="lockbox${s.owner[l] ? ' held' : ''}"><b>${l}</b><span>${s.owner[l] ? `держит ${s.owner[l]}` : 'свободен'}</span></div>`).join('');
    const banner = st === 'deadlock'
      ? '<div class="vm-note err">DEADLOCK. A держит L1 и ждёт L2, B держит L2 и ждёт L1. Никто не уступит — программа зависла навсегда.</div>'
      : st === 'done' ? '<div class="vm-note ret">Оба потока закончили работу.</div>' : '';
    return `<div class="locks">${locks}</div><div class="threads2">${col('A')}${col('B')}</div>${banner}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li>Шагай потоками в любом порядке.</li>'}</ul>
      <div class="btns">${card.toggle ? act('fix', s.fixed ? 'Вернуть разный порядок' : 'Брать замки в одном порядке', 'btn') : ''}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- пул потоков ---------- */

const ADD = {
  block: ['add:block:8', '+8 запросов с .Result'],
  async: ['add:async:8', '+8 запросов с await'],
  cpu: ['add:cpu:8', '+8 задач на CPU']
};

function jobChip(j) {
  if (!j) return '<span class="job idle">свободен</span>';
  const { req } = j;
  if (req.phase === 'cont') return `<span class="job cont">#${req.id} продолжение после await</span>`;
  if (req.kind === 'block' && j.ran >= 1) return `<span class="job blocked">#${req.id} .Result — стоит и ждёт сеть</span>`;
  if (req.kind === 'async') return `<span class="job cont">#${req.id} старт, дальше await</span>`;
  return `<span class="job cpu">#${req.id} работает</span>`;
}

function pool(card, host, done) {
  let timer = null;
  const ctl = drive(card, host, poolRig, s => {
    const busy = s.queue.length || s.io.length || s.threads.some(Boolean);
    const avg = k => (s.done.some(x => x.kind === k) ? poolAvgWait(s, k).toFixed(1) : '—');
    const kinds = card.adds ?? ['block', 'async'];
    return `<div class="pool-stats">
        <div class="counter"><b>${s.tick}</b><span>тик</span></div>
        <div class="counter"><b>${s.threads.length}</b><span>потоков (было ${s.min})</span></div>
        <div class="counter"><b>${s.queue.length}</b><span>в очереди</span></div>
        <div class="counter"><b>${s.done.length}</b><span>выполнено</span></div>
      </div>
      <div class="pool-lanes">${s.threads.map((j, i) => `<div class="lane-t"><span class="tn">поток ${i + 1}</span>${jobChip(j)}</div>`).join('')}</div>
      <div class="pool-q"><span class="colh">Очередь пула</span>${s.queue.slice(0, 24).map(r => `<span class="qi ${r.phase === 'cont' ? 'cont' : r.kind}">#${r.id}</span>`).join('')}${s.queue.length > 24 ? `<span class="qi more">+${s.queue.length - 24}</span>` : ''}${s.queue.length ? '' : '<span class="empty">пусто</span>'}</div>
      <div class="pool-io">Ждут ответа сети, не занимая поток: <b>${s.io.length}</b> · заблокировано потоков: <b>${poolBlocked(s)}</b> · среднее ожидание: .Result — <b>${avg('block')}</b>, await — <b>${avg('async')}</b> тиков</div>
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || '<li>Добавь запросы и запусти время. Пул начинает с одного потока на ядро.</li>'}</ul>
      <div class="btns">${kinds.map(k => act(ADD[k][0], ADD[k][1], 'btn')).join('')}${act('tick:1', 'Тик ►', 'btn')}<button type="button" class="btn primary" data-run>${timer ? '⏸ Пауза' : '▶ Пуск'}</button>${act('reset', 'Сначала ↺')}</div>
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

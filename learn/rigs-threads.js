/** Стенды раздела про потоки: гонка данных, взаимная блокировка, пул потоков. */
import { esc, fmtI } from '../assets/vhs.js?v=202610191219';
import { drive, act } from './rig-kit.js?v=202610191219';
import {
  raceRig, raceCan, raceFinished, raceDone, RACE_STEPS, RACE_CODE,
  lockRig, lockCan, lockFinished, lockStatus,
  poolRig, poolBlocked, poolAvgWait
} from './models-threads.js?v=202610191219';
import { tr } from './i18n.js?v=202610191219';
import { t as tl, bi } from './ui.js?v=202610191219';

/* ---------- гонка данных ---------- */

function datarace(card, host, done) {
  drive(card, host, raceRig, s => {
    const steps = RACE_STEPS[s.mode];
    const col = t => {
      const th = s.th[t];
      const waiting = !raceFinished(s, t) && !raceCan(s, t);
      return `<div class="thr"><div class="colh">${tl('r.threads.datarace.1')} ${t}</div>
        <div class="prog">${steps.map((op, i) => `<div class="${i < th.pc ? 'done' : i === th.pc ? 'cur' : ''}"><span class="pc">${i + 1}</span><span>${esc(RACE_CODE[op])}</span></div>`).join('')}</div>
        <div class="reg">${tl('r.threads.datarace.2')}: <b>${th.tmp ?? '—'}</b></div>
        ${act(`step:${t}`, waiting ? tl('r.threads.datarace.3', { t })
          : raceFinished(s, t) ? tl('r.threads.datarace.4', { t })
          : tl('r.threads.datarace.5', { t }), 'btn primary', !raceCan(s, t))}</div>`;
    };
    let verdict = '';
    if (raceDone(s)) verdict = s.count === 2
      ? `<div class="vm-note ret">${tl('r.threads.datarace.6')}</div>`
      : `<div class="vm-note err">${tl('r.threads.datarace.7')}</div>`;
    const runs = s.runs?.length
      ? `<div class="runs">${s.runs.map(r => `<span class="${r === 2000 ? 'ok' : 'bad'}">${fmtI(r)} ${tl('r.threads.datarace.8')}</span>`).join('')}</div>` : '';
    return `<div class="shared"><span>${tl('r.threads.datarace.9')}</span><b>count = ${s.count}</b></div>
      <div class="threads2">${col('A')}${col('B')}</div>${verdict}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tl('r.threads.datarace.10')}</li>`}</ul>
      ${runs}
      <div class="btns">${card.random ? act('random', tl('r.threads.datarace.11')) : ''}${act('reset', tl('r.threads.datarace.12'))}</div>`;
  }, done);
}

/* ---------- взаимная блокировка ---------- */

const lockLabel = op => op === 'work' ? tl('r.threads.lockLabel.1')
  : op.startsWith('unlock') ? tl('r.threads.lockLabel.2', { v1: op.slice(7) }) : `lock (${op.slice(5)}) {`;

function deadlock(card, host, done) {
  drive(card, host, lockRig, s => {
    const st = lockStatus(s);
    const col = t => `<div class="thr"><div class="colh">${tl('r.threads.deadlock.1')} ${t}</div>
      <div class="prog">${s.plan[t].map((op, i) => `<div class="${i < s.pc[t] ? 'done' : i === s.pc[t] ? (st === 'deadlock' ? 'err' : 'cur') : ''}"><span class="pc">${i + 1}</span><span>${esc(lockLabel(op))}</span></div>`).join('')}</div>
      ${act(`step:${t}`, lockFinished(s, t) ? tl('r.threads.deadlock.2', { t })
        : lockCan(s, t) ? tl('r.threads.deadlock.3', { t })
        : tl('r.threads.deadlock.4', { t }), 'btn primary', !lockCan(s, t))}</div>`;
    const locks = ['L1', 'L2'].map(l => `<div class="lockbox${s.owner[l] ? ' held' : ''}"><b>${l}</b><span>${s.owner[l] ? tl('r.threads.deadlock.5', { v1: s.owner[l] }) : tl('r.threads.deadlock.6')}</span></div>`).join('');
    const banner = st === 'deadlock'
      ? `<div class="vm-note err">${tl('r.threads.deadlock.7')}</div>`
      : st === 'done' ? `<div class="vm-note ret">${tl('r.threads.deadlock.8')}</div>` : '';
    return `<div class="locks">${locks}</div><div class="threads2">${col('A')}${col('B')}</div>${banner}
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tl('r.threads.deadlock.9')}</li>`}</ul>
      <div class="btns">${card.toggle ? act('fix', s.fixed ? tl('r.threads.deadlock.10') : tl('r.threads.deadlock.11'), 'btn') : ''}${act('reset', tl('r.threads.deadlock.12'))}</div>`;
  }, done);
}

/* ---------- пул потоков ---------- */

const ADD = {
  block: ['add:block:8', bi('r.threads.ADD.1')],
  async: ['add:async:8', bi('r.threads.ADD.2')],
  cpu: ['add:cpu:8', bi('r.threads.ADD.3')]
};

function jobChip(j) {
  if (!j) return `<span class="job idle">${tl('r.threads.jobChip.1')}</span>`;
  const { req } = j;
  if (req.phase === 'cont') return `<span class="job cont">#${req.id} ${tl('r.threads.jobChip.2')}</span>`;
  if (req.kind === 'block' && j.ran >= 1) return `<span class="job blocked">#${req.id} ${tl('r.threads.jobChip.3')}</span>`;
  if (req.kind === 'async') return `<span class="job cont">#${req.id} ${tl('r.threads.jobChip.4')}</span>`;
  return `<span class="job cpu">#${req.id} ${tl('r.threads.jobChip.5')}</span>`;
}

function pool(card, host, done) {
  let timer = null;
  const ctl = drive(card, host, poolRig, s => {
    const busy = s.queue.length || s.io.length || s.threads.some(Boolean);
    const avg = k => (s.done.some(x => x.kind === k) ? poolAvgWait(s, k).toFixed(1) : '—');
    const kinds = card.adds ?? ['block', 'async'];
    return `<div class="pool-stats">
        <div class="counter"><b>${s.tick}</b><span>${tl('r.threads.pool.1')}</span></div>
        <div class="counter"><b>${s.threads.length}</b><span>${tl('r.threads.pool.2', { min: s.min })}</span></div>
        <div class="counter"><b>${s.queue.length}</b><span>${tl('r.threads.pool.3')}</span></div>
        <div class="counter"><b>${s.done.length}</b><span>${tl('r.threads.pool.4')}</span></div>
      </div>
      <div class="pool-lanes">${s.threads.map((j, i) => `<div class="lane-t"><span class="tn">${tl('r.threads.pool.5')} ${i + 1}</span>${jobChip(j)}</div>`).join('')}</div>
      <div class="pool-q"><span class="colh">${tl('r.threads.pool.6')}</span>${s.queue.slice(0, 24).map(r => `<span class="qi ${r.phase === 'cont' ? 'cont' : r.kind}">#${r.id}</span>`).join('')}${s.queue.length > 24 ? `<span class="qi more">+${s.queue.length - 24}</span>` : ''}${s.queue.length ? '' : `<span class="empty">${tl('r.threads.pool.7')}</span>`}</div>
      <div class="pool-io">${tl('r.threads.pool.8', { length: s.io.length, v1: poolBlocked(s), v2: avg('block'), v3: avg('async') })}</div>
      <ul class="log">${s.log.map(t => `<li>${esc(t)}</li>`).join('') || `<li>${tl('r.threads.pool.9')}</li>`}</ul>
      <div class="btns">${kinds.map(k => act(ADD[k][0], tr(ADD[k][1]), 'btn')).join('')}${act('tick:1', tl('r.threads.pool.10'), 'btn')}<button type="button" class="btn primary" data-run>${timer ? tl('r.threads.pool.11') : tl('r.threads.pool.12')}</button>${act('reset', tl('r.threads.pool.13'))}</div>
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

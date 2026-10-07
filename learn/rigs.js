/** Виды стендов. Вся логика — в models.js; здесь только отрисовка и кнопки. */
import { esc, RM } from '../assets/vhs.js?v=202610072257';
import { runIL, jitInit, jitCall, compiledCount, RACE, raceTotal, raceWinner } from './models.js?v=202610072257';

const h = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
};
const button = (text, cls, onclick) => {
  const b = h('button', cls, text);
  b.type = 'button';
  b.onclick = onclick;
  return b;
};

/* ---------- стековая машина ---------- */
function stack(card, host, done) {
  const run = runIL(card.program, card.args);
  let f = 0, reached = false;
  const vm = h('div', 'vm');
  const left = h('div', '');
  const args = h('div', 'args');
  args.innerHTML = card.args.map((a, i) => `<span>arg ${i}: ${esc(a.name)} = ${a.value}</span>`).join('');
  const prog = h('div', 'prog');
  left.append(prog);
  const right = h('div', '');
  const st = h('div', 'stack');
  right.append(h('div', 'stack-h', 'Стек ↑ вершина'), st);
  vm.append(left, right);
  const note = h('div', 'vm-note');
  const step = button('Шаг ►', 'btn primary', () => { if (f < run.frames.length - 1) { f++; draw(); } });
  const reset = button('Сначала ↺', 'btn', () => { f = 0; draw(); });
  const btns = h('div', 'btns');
  btns.append(step, reset);
  host.append(args, vm, note, btns);

  function draw() {
    const fr = run.frames[f];
    prog.innerHTML = card.program.map((line, i) => {
      const cls = i === fr.pc ? (fr.error ? 'err' : 'cur') : i < fr.pc ? 'done' : '';
      return `<div class="${cls}"><span class="pc">${i}</span><span>${esc(line)}</span></div>`;
    }).join('');
    st.innerHTML = fr.stack.length ? fr.stack.map(v => `<div class="cell">${v}</div>`).join('') : '<div class="empty">пусто</div>';
    note.className = 'vm-note' + (fr.error ? ' err' : fr.ret !== undefined ? ' ret' : '');
    note.textContent = fr.note;
    const last = f === run.frames.length - 1;
    step.disabled = last;
    if (last && !reached) {
      const hit = card.goal === 'error' ? Boolean(fr.error) : fr.ret !== undefined;
      if (hit) { reached = true; done(); }
    }
  }
  draw();
}

/* ---------- JIT ---------- */
const STATE = { stub: 'заглушка', native: 'машинный код', tier0: 'Tier 0', tier1: 'Tier 1' };

function jit(card, host, done) {
  let s = jitInit(card.methods, { tiered: card.tiered });
  let reached = false;
  const counters = h('div', 'counters');
  const list = h('div', 'methods');
  const log = h('ul', 'log');
  host.classList.add('jit');
  host.append(counters, list, log);

  function call(name, times) {
    const before = Object.fromEntries(s.order.map(n => [n, s.m[n].state]));
    s = jitCall(s, name, times);
    draw(before);
  }
  function draw(before = {}) {
    counters.innerHTML = `<div class="counter"><b>${s.jits}</b><span>раз сработал JIT</span></div>`
      + `<div class="counter"><b>${compiledCount(s)} из ${s.order.length}</b><span>методов скомпилировано</span></div>`;
    list.replaceChildren(...s.order.map(n => {
      const m = s.m[n];
      const row = h('div', 'm');
      const info = h('div', '');
      const changed = before[n] && before[n] !== m.state;
      info.innerHTML = `<div class="nm">${esc(n)}()</div>`
        + (m.deps.length ? `<div class="deps">вызывает ${m.deps.map(esc).join(', ')}</div>` : '')
        + `<div class="row"><span class="chip-s ${m.state}${changed ? ' flash' : ''}">${STATE[m.state]}</span><span class="calls">вызовов: ${m.calls}</span></div>`;
      const btns = h('div', 'btns');
      btns.append(button('Вызвать', 'btn', () => call(n, 1)));
      if (s.tiered) btns.append(button('×10', 'btn', () => call(n, 10)));
      row.append(info, btns);
      return row;
    }));
    log.innerHTML = s.log.length
      ? s.log.map(e => `<li class="${e.kind}">${esc(e.text)}</li>`).join('')
      : '<li>Пока ничего не вызывали. У всех методов — заглушки.</li>';
    if (!reached && goal(card.goal, s)) { reached = true; done(); }
  }
  draw();
}

function goal(g, s) {
  const m = s.m[g.name];
  if (g.kind === 'calls') return m.calls >= g.min;
  if (g.kind === 'state') return m.state === g.state;
  return false;
}

/* ---------- гонка старта ---------- */
function race(card, host, done) {
  const UNIT = RM ? 0 : 28;   // мс на условную единицу
  const box = h('div', 'race');
  host.append(box);
  const legend = h('div', 'legend-s', '<span>Время в условных единицах: это модель, а не замер.</span><span><i style="background:#6c5ba8"></i>запуск хоста и CLR</span><span><i style="background:var(--cpu)"></i>работа JIT</span><span><i style="background:var(--ok)"></i>программа печатает 42</span>');
  const max = Math.max(...RACE.map(raceTotal));
  const lanes = RACE.map(l => {
    const lane = h('div', 'lane');
    lane.innerHTML = `<div class="hd"><span>${esc(l.name)}</span><span class="t">—</span></div>`;
    const bar = h('div', 'rbar');
    const segs = l.phases.map(([kind]) => { const i = h('i', kind); bar.append(i); return i; });
    lane.append(bar, h('ul', '', l.traits.map(t => `<li>${esc(t)}</li>`).join('')));
    box.append(lane);
    return { l, segs, t: lane.querySelector('.t') };
  });
  const startBtn = button('Старт ►', 'btn primary', go);
  const btns = h('div', 'btns');
  btns.append(startBtn);
  host.append(legend, btns);
  let timers = [];
  function go() {
    timers.forEach(clearTimeout); timers = [];
    startBtn.disabled = true;
    lanes.forEach(({ segs, t }) => { segs.forEach(i => { i.style.transition = 'none'; i.style.width = '0'; }); t.textContent = '…'; t.classList.remove('win'); });
    void box.offsetWidth;
    const win = raceWinner();
    lanes.forEach(({ l, segs, t }) => {
      let at = 0;
      l.phases.forEach(([, len], k) => {
        timers.push(setTimeout(() => {
          segs[k].style.transition = '';
          segs[k].style.setProperty('--d', `${len * UNIT}ms`);
          segs[k].style.width = `${len / max * 100}%`;
        }, at * UNIT));
        at += len;
      });
      timers.push(setTimeout(() => {
        t.textContent = `${raceTotal(l)} ед.`;
        if (l.id === win) t.classList.add('win');
      }, at * UNIT));
    });
    timers.push(setTimeout(() => { startBtn.disabled = false; startBtn.textContent = 'Ещё раз ↺'; done(); }, max * UNIT + 50));
  }
}

const RIGS = { stack, jit, race };

export function mountRig(card, host, done) {
  RIGS[card.rig](card, host, done);
}

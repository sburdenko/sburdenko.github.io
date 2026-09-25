/** CH.05 Command, CH.06 State, CH.07 Observer, CH.09 Strategy. */
import { $, $$, fitCanvas, RM } from '../assets/vhs.js?v=202609241230';
import { t } from '../assets/i18n.js?v=202609241230';
import { bindSeg, tile, visibleLoop } from '../assets/lab.js?v=202609241230';
import { renderCode } from '../assets/code.js?v=202609241230';
import { SNIPPETS } from './snippets.js?v=202609241230';
import {
  MAZE_SIZE, MAZE_WALLS, createCommandState, executeMove, undoMove, redoMove, replayPath,
  createPlayer, tickPlayer, createSubject, setSubscribed, destroyObserver, raise,
  ABILITIES, abilityForStreak, addAbilityCost,
} from './model-behavior.js?v=202609241230';

const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' };

/* ---------------- Command ---------------- */
export function initCommand() {
  const maze = $('#commandMaze'), limit = $('#commandLimit');
  let state = createCommandState(+limit.value), hint = 'command.hintStart', ghost = null, timers = [];

  function render(bump = false) {
    const trail = new Set(replayPath(state).map(p => `${p.x},${p.y}`));
    const shown = ghost ?? state.pos;
    maze.innerHTML = Array.from({ length: MAZE_SIZE * MAZE_SIZE }, (_, i) => {
      const x = i % MAZE_SIZE, y = Math.floor(i / MAZE_SIZE), key = `${x},${y}`;
      const cls = [
        MAZE_WALLS.has(key) ? 'wall' : '',
        trail.has(key) ? 'trail' : '',
        state.start.x === x && state.start.y === y ? 'start' : '',
        shown.x === x && shown.y === y ? 'player' + (bump ? ' bump' : '') : '',
      ].join(' ');
      return `<i role="gridcell" class="${cls}">${shown.x === x && shown.y === y ? 'P' : ''}</i>`;
    }).join('');
    const stackHtml = list => list.map((cmd, i) => `<span>${ARROWS[cmd.direction]} MoveCommand${i === list.length - 1 ? ' ◀ top' : ''}</span>`).join('');
    $('#commandUndoStack').innerHTML = stackHtml(state.undo);
    $('#commandRedoStack').innerHTML = stackHtml(state.redo);
    $('#commandUndo').disabled = !state.undo.length || !!ghost;
    $('#commandRedo').disabled = !state.redo.length || !!ghost;
    $('#commandLimitOut').textContent = state.limit;
    $('#commandHint').innerHTML = t(hint, state.dropped);
  }

  $$('.move-pad button').forEach(button => button.onclick = () => {
    if (ghost) return;
    const result = executeMove(state, button.dataset.dir);
    hint = result.created ? (result.state.dropped > state.dropped ? 'command.hintDropped' : 'command.hintMove') : 'command.hintBlocked';
    state = result.state;
    render(!result.created);
  });
  $('#commandUndo').onclick = () => { state = undoMove(state); hint = 'command.hintUndo'; render(); };
  $('#commandRedo').onclick = () => { state = redoMove(state); hint = 'command.hintRedo'; render(); };
  $('#commandReset').onclick = () => { timers.forEach(clearTimeout); ghost = null; state = createCommandState(+limit.value); hint = 'command.hintStart'; render(); };
  $('#commandReplay').onclick = () => {
    timers.forEach(clearTimeout);
    const path = replayPath(state);
    const delay = RM ? 0 : 260;
    hint = 'command.hintReplay';
    path.forEach((pos, i) => timers.push(setTimeout(() => { ghost = pos; render(); }, i * delay)));
    timers.push(setTimeout(() => { ghost = null; render(); }, path.length * delay + 50));
  };
  limit.addEventListener('input', () => {
    timers.forEach(clearTimeout); ghost = null;
    state = createCommandState(+limit.value); hint = 'command.hintStart'; render();
  });
  const redoLines = SNIPPETS.command.split('\n').flatMap((line, i) => (line.includes('redoStack') ? [i + 1] : []));
  renderCode($('#commandCode'), SNIPPETS.command, redoLines);
  render();
  return () => render();
}

/* ---------------- State ---------------- */
const NODES = { idle: [62, 44], walk: [238, 44], jump: [150, 150] };
const EDGES = [['idle', 'walk'], ['walk', 'idle'], ['idle', 'jump'], ['walk', 'jump'], ['jump', 'idle'], ['jump', 'walk']];

function edgePath([from, to]) {
  const [x1, y1] = NODES[from], [x2, y2] = NODES[to];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const nx = -dy / len * 7, ny = dx / len * 7;
  const sx = x1 + dx / len * 42 + nx, sy = y1 + dy / len * 20 + ny;
  const ex = x2 - dx / len * 44 + nx, ey = y2 - dy / len * 22 + ny;
  return `M${sx.toFixed(1)},${sy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`;
}

export function initState() {
  const canvas = $('#stateCanvas'), svg = $('#stateFsm');
  let player = createPlayer(), log = [], hot = null, hotUntil = 0, clock = 0;
  const held = { left: false, right: false };
  let jumpQueued = false;

  svg.innerHTML = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#40316a"/></marker></defs>`
    + EDGES.map(edge => `<path class="edge" data-e="${edge.join('-')}" d="${edgePath(edge)}"/>`).join('')
    + Object.entries(NODES).map(([name, [x, y]]) =>
      `<g class="node" data-s="${name}"><rect x="${x - 42}" y="${y - 18}" width="84" height="36" rx="4"/><text x="${x}" y="${y}">${name.toUpperCase()}</text></g>`).join('');

  const hold = (button, key) => {
    const on = e => { e.preventDefault(); held[key] = true; };
    const off = () => { held[key] = false; };
    button.addEventListener('pointerdown', on);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => button.addEventListener(type, off));
  };
  hold($('#stateLeft'), 'left');
  hold($('#stateRight'), 'right');
  $('#stateJump').onclick = () => { jumpQueued = true; };

  let inView = false;
  const lab = $('#stateLab');
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { threshold: 0.4 }).observe(lab);
  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  addEventListener('keydown', event => {
    if (!inView || event.target.closest('input, textarea')) return;
    if (keyMap[event.code]) { held[keyMap[event.code]] = true; event.preventDefault(); }
    if (event.code === 'Space') { jumpQueued = true; event.preventDefault(); }
  });
  addEventListener('keyup', event => { if (keyMap[event.code]) held[keyMap[event.code]] = false; });

  function step(dt) {
    clock += dt;
    if (dt) {
      const input = { move: (held.right ? 1 : 0) - (held.left ? 1 : 0), jump: jumpQueued };
      jumpQueued = false;
      const result = tickPlayer(player, input, dt);
      if (result.changed) {
        hot = `${player.state}-${result.player.state}`;
        hotUntil = clock + 0.8;
        log = [...result.calls.map((text, i) => ({ text, kind: i ? 'ok' : 'dim' })), ...log].slice(0, 12);
        renderSide();
      }
      player = { ...result.player, x: Math.max(-5, Math.min(5, result.player.x)) };
    }
    draw();
    if (hot && clock > hotUntil) { hot = null; renderSide(); }
  }

  const STATE_COLORS = { idle: '#8a4dff', walk: '#26e3ea', jump: '#ffd23f' };

  function draw() {
    const { c, w, h } = fitCanvas(canvas, 260);
    const ground = h - 50, scale = w / 12;
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b1231'; c.fillRect(0, ground, w, h - ground);
    c.strokeStyle = '#40316a'; c.beginPath(); c.moveTo(0, ground); c.lineTo(w, ground); c.stroke();
    const px = w / 2 + player.x * scale, py = ground - player.y * scale;
    c.fillStyle = 'rgba(0,0,0,.4)';
    c.beginPath(); c.ellipse(px, ground + 4, 18 - Math.min(10, player.y * 3), 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = STATE_COLORS[player.state];
    c.beginPath(); c.roundRect(px - 16, py - 64, 32, 64, 16); c.fill();
    c.fillStyle = STATE_COLORS[player.state]; c.font = '600 12px JetBrains Mono'; c.textAlign = 'center';
    c.fillText(`${player.state.toUpperCase()}STATE`, px, Math.max(40, py - 74));
    c.fillStyle = '#8c82b0'; c.font = '10px JetBrains Mono';
    c.fillText(`velocity ${player.vx.toFixed(1)}, ${player.vy.toFixed(1)} · grounded ${player.grounded}`, w / 2, h - 16);
    c.textAlign = 'left';
  }

  function renderSide() {
    $('#stateLabel').textContent = player.state.toUpperCase();
    $$('.node', svg).forEach(node => node.classList.toggle('on', node.dataset.s === player.state));
    $$('.edge', svg).forEach(edge => edge.classList.toggle('hot', edge.dataset.e === hot));
    $('#stateLog').innerHTML = log.length
      ? log.map(line => `<div class="${line.kind}">${line.text}</div>`).join('')
      : `<div class="dim">${t('state.logEmpty')}</div>`;
  }

  visibleLoop(canvas, step);
  renderCode($('#stateSwitchCode'), SNIPPETS.stateSwitch);
  renderCode($('#statePatternCode'), SNIPPETS.statePattern);
  renderSide();
  draw();
  return renderSide;
}

/* ---------------- Observer ---------------- */
const OBSERVERS = ['AudioObserver', 'ParticleSystemObserver', 'AnimObserver'];

export function initObserver() {
  let subject = createSubject(OBSERVERS), log = [], flash = {};
  const list = $('#observerList');

  function render() {
    list.innerHTML = subject.observers.map(o => {
      const status = !o.alive ? t('observer.dead') : o.subscribed ? t('observer.on') : t('observer.off');
      return `<div class="observer ${o.alive ? '' : 'dead'} ${flash[o.name] ?? ''}" data-o="${o.name}">
        <b>${o.name}</b><span class="count">${t('observer.count', o.received)} · ${status}</span>
        <div class="ctl-row">
          <button class="chip" data-act="toggle" aria-pressed="${o.subscribed}" ${o.alive ? '' : 'disabled'}>${o.subscribed ? 'OnDisable() −=' : 'OnEnable() +='}</button>
          <button class="btn" data-act="destroy" ${o.alive ? '' : 'disabled'}>${t('observer.destroy')}</button>
          <button class="btn" data-act="leak" ${o.alive ? '' : 'disabled'}>${t('observer.leak')}</button>
        </div></div>`;
    }).join('');
    $('#observerLog').innerHTML = log.map(line => `<div class="${line.kind}">${line.text}</div>`).join('');
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-act]');
    if (!button) return;
    const name = button.closest('[data-o]').dataset.o;
    const observer = subject.observers.find(o => o.name === name);
    if (button.dataset.act === 'toggle') subject = setSubscribed(subject, name, !observer.subscribed);
    if (button.dataset.act === 'destroy') {
      subject = destroyObserver(subject, name, true);
      log = [{ kind: 'ok', text: t('observer.logDestroy', name) }, ...log];
    }
    if (button.dataset.act === 'leak') {
      subject = destroyObserver(subject, name, false);
      log = [{ kind: 'warn', text: t('observer.logLeak', name) }, ...log];
    }
    render();
  });

  $('#observerRaise').onclick = () => {
    const result = raise(subject);
    subject = result.subject;
    flash = Object.fromEntries(result.results.map(r => [r.name, r.outcome === 'handled' ? 'hit' : 'missing']));
    const lines = result.results.length
      ? result.results.map(r => ({ kind: r.outcome === 'handled' ? 'ok' : 'bad', text: t(`observer.log.${r.outcome}`, r.name) }))
      : [{ kind: 'dim', text: t('observer.logNobody') }];
    log = [{ kind: 'dim', text: 'ThingHappened?.Invoke()' }, ...lines, ...log].slice(0, 16);
    render();
    setTimeout(() => { flash = {}; render(); }, RM ? 0 : 600);
  };
  $('#observerReset').onclick = () => { subject = createSubject(OBSERVERS); log = []; render(); };
  renderCode($('#observerCode'), SNIPPETS.observer);
  render();
  return render;
}

/* ---------------- Strategy ---------------- */
export function initStrategy() {
  const canvas = $('#strategyCanvas');
  let design = 'strategy', streak = 0, installed = ['radar', 'firstAid', 'airSupport'], effect = null, clock = 0, log = [];
  bindSeg($('#strategyDesign'), value => { design = value; render(); });

  function current() {
    return abilityForStreak(streak, installed);
  }

  function render() {
    const ability = current();
    $('#strategyStats').innerHTML = [tile('streak', streak), tile('currentAbility', ABILITIES[ability].asset)].join('');
    $('#strategyAsset').textContent = `${ABILITIES[ability].asset}.asset`;
    $('#strategyUse').textContent = design === 'strategy' ? 'currentAbility.Use(gameObject)' : 'ActivateAbility(currentAbility)';
    $('#strategyAdd').disabled = installed.includes('shield');
    $('#strategyLog').innerHTML = log.map(line => `<div class="${line.kind}">${line.text}</div>`).join('');
    renderCode($('#strategyCode'), design === 'strategy' ? SNIPPETS.strategy : SNIPPETS.strategySwitch);
  }

  $('#strategyPickup').onclick = () => { streak += 1; render(); };
  $('#strategyHit').onclick = () => { streak = 0; render(); };
  $('#strategyUse').onclick = () => {
    const ability = current();
    effect = { ability, born: clock };
    log = [{ kind: 'ok', text: t(`strategy.use.${ability}`) }, ...log].slice(0, 8);
    render();
  };
  $('#strategyAdd').onclick = () => {
    const cost = addAbilityCost(design);
    installed = [...installed, 'shield'];
    const lines = [
      ...cost.edited.map(item => ({ kind: 'bad', text: t('strategy.edited', item) })),
      ...cost.added.map(item => ({ kind: 'ok', text: t('strategy.added', item) })),
    ];
    log = [...lines, ...log].slice(0, 8);
    render();
  };

  function draw() {
    const { c, w, h } = fitCanvas(canvas, 300);
    c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const enemies = [[.2, .25], [.8, .3], [.15, .75], [.85, .8], [.6, .15]];
    const age = effect ? clock - effect.born : 99;
    enemies.forEach(([ex, ey]) => {
      const revealed = effect?.ability === 'radar' && Math.hypot(ex * w - cx, ey * h - cy) < age * 260;
      c.fillStyle = revealed ? '#ff5c6c' : '#241842';
      c.beginPath(); c.arc(ex * w, ey * h, 7, 0, Math.PI * 2); c.fill();
    });
    c.fillStyle = '#ff3ea5'; c.beginPath(); c.arc(cx, cy, 12, 0, Math.PI * 2); c.fill();
    if (!effect || age > 2.2) return;
    const fade = 1 - age / 2.2;
    c.globalAlpha = fade;
    if (effect.ability === 'radar') {
      c.strokeStyle = '#26e3ea'; c.lineWidth = 2;
      c.beginPath(); c.arc(cx, cy, age * 260, 0, Math.PI * 2); c.stroke();
    } else if (effect.ability === 'firstAid') {
      c.fillStyle = '#5dfc9a';
      for (let i = 0; i < 6; i++) {
        const x = cx - 50 + i * 20, y = cy - age * 70 - (i % 2) * 14;
        c.fillRect(x - 2, y - 7, 4, 14); c.fillRect(x - 7, y - 2, 14, 4);
      }
    } else if (effect.ability === 'airSupport') {
      c.fillStyle = '#ffd23f';
      enemies.forEach(([ex, ey], i) => {
        const fall = Math.min(1, Math.max(0, age * 2 - i * 0.2));
        c.fillRect(ex * w - 3, ey * h * fall - 12, 6, 12);
        if (fall >= 1) { c.beginPath(); c.arc(ex * w, ey * h, 16 * fade + 4, 0, Math.PI * 2); c.fill(); }
      });
    } else {
      c.strokeStyle = '#a77bff'; c.lineWidth = 3;
      c.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = i / 6 * Math.PI * 2, r = 30 + Math.min(1, age * 3) * 30;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  visibleLoop(canvas, dt => { clock += dt; draw(); });
  render();
  draw();
  return render;
}

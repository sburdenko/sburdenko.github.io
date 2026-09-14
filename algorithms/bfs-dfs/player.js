/** Плеер ленты событий: шаг вперёд/назад, перемотка, автопрогон с заданной скоростью. */
import { clamp, RM } from '../../assets/vhs.js';

export function createPlayer(onChange) {
  let run = null, index = 0, playing = false, sps = 6, acc = 0, last = 0, raf = 0;

  const total = () => run ? run.events.length : 0;
  const emit = () => onChange({ index, playing, run, total: total() });

  function stop() {
    playing = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function frame(t) {
    if (!playing) return;
    const dt = Math.min(200, t - last);
    last = t;
    acc += dt * sps / 1000;
    let moved = false;
    while (acc >= 1) {
      acc -= 1;
      if (index >= total() - 1) { stop(); moved = true; break; }
      index++; moved = true;
    }
    if (moved) emit();
    if (playing) raf = requestAnimationFrame(frame);
  }

  return {
    load(newRun, keepIndex = false) {
      stop();
      run = newRun;
      index = keepIndex ? clamp(index, 0, total() - 1) : 0;
      emit();
    },
    seek(i) { stop(); index = clamp(i, 0, total() - 1); emit(); },
    step(d = 1) { stop(); index = clamp(index + d, 0, total() - 1); emit(); },
    toEnd() { stop(); index = total() - 1; emit(); },
    play() {
      if (!run || index >= total() - 1) index = 0;
      playing = true; acc = 0; last = performance.now();
      raf = requestAnimationFrame(frame);
      emit();
    },
    pause() { stop(); emit(); },
    toggle() { playing ? this.pause() : this.play(); },
    speed(v) { sps = RM ? Math.min(v, 4) : v; },
    get index() { return index; },
    get playing() { return playing; },
    get run() { return run; },
    get total() { return total(); }
  };
}

/** Подключает кнопки перемотки и ползунок скорости к плееру. */
export function bindTransport(root, player) {
  const btn = k => root.querySelector(`[data-t="${k}"]`);
  const spd = root.querySelector('input[type=range]');
  const sps = btn('sps'), pos = btn('pos'), play = btn('play');
  btn('first').onclick = () => player.seek(0);
  btn('back').onclick = () => player.step(-1);
  btn('fwd').onclick = () => player.step(1);
  btn('end').onclick = () => player.toEnd();
  play.onclick = () => player.toggle();
  const applySpeed = () => { player.speed(+spd.value); sps.textContent = spd.value; };
  spd.oninput = applySpeed;
  applySpeed();
  return ({ index, playing, total }) => {
    play.textContent = playing ? '❚❚ ПАУЗА' : '► ПУСК';
    pos.textContent = `ШАГ ${index + 1} / ${total}`;
  };
}

/** Small helpers shared by the interactive rigs of the Unity tapes. */
import { $$, onVisible, RM } from './vhs.js?v=202609252015';

export const isPressed = button => button?.getAttribute('aria-pressed') === 'true';

export function setPressed(button, value) {
  button?.setAttribute('aria-pressed', value ? 'true' : 'false');
}

export function togglePressed(button) {
  const next = !isPressed(button);
  setPressed(button, next);
  return next;
}

/** Wires a segmented control: exactly one pressed button, `onChange(value)` on click. */
export function bindSeg(root, onChange) {
  const buttons = $$('button', root);
  const value = () => (buttons.find(isPressed) ?? buttons[0])?.dataset.v;
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || !buttons.includes(button)) return;
    buttons.forEach(candidate => setPressed(candidate, candidate === button));
    onChange(button.dataset.v);
  });
  return value;
}

export const tile = (label, value, detail = '', cls = '') =>
  `<div class="tile ${cls}"><span class="lbl">${label}</span><span class="val">${value}</span><span class="d">${detail}</span></div>`;

/**
 * requestAnimationFrame loop that only runs while the element is on screen.
 * `step(dt)` receives seconds, clamped so a background tab does not jump the simulation.
 */
export function visibleLoop(element, step) {
  let visible = false, running = false, last = 0;
  const frame = time => {
    if (!visible) { running = false; return; }
    const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
    last = time;
    step(dt);
    requestAnimationFrame(frame);
  };
  onVisible(element, isVisible => {
    visible = isVisible;
    if (visible && !running) { running = true; last = 0; requestAnimationFrame(frame); }
  });
}

export const reducedMotion = RM;

/** Resolves CSS custom properties for canvas drawing. */
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

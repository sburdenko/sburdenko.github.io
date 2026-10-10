/**
 * Движок урока: очередь карточек, проверка ответов, итог. Без DOM — покрыт тестами.
 *
 * Урок — это массив карточек. Карточки с ответом (choice, multi, order, blanks, tapline)
 * при ошибке уходят в конец очереди, как в Duolingo: урок кончается, когда на всё
 * ответили верно. Карточки без ответа (learn, rig) просто пролистываются. В match ошибки
 * видны сразу на карточке, поэтому она считается ошибочной, но повторно не ставится.
 */
import { rng } from '../assets/rand.js?v=202610101649';

export const GRADED = new Set(['choice', 'multi', 'order', 'blanks', 'tapline']);
export const TYPES = new Set([...GRADED, 'learn', 'rig', 'match']);

/** Перемешивание Фишера–Йетса по seed: один seed — один порядок. */
export function shuffle(list, seed) {
  const r = rng(seed), a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Порядок показа, который заведомо не совпадает с ответом (иначе order и match решены сразу). */
export function scramble(n, seed) {
  const idx = [...Array(n).keys()];
  if (n < 2) return idx;
  for (let s = seed; ; s++) {
    const out = shuffle(idx, s);
    if (out.some((v, i) => v !== i)) return out;
  }
}

const sameList = (a, b) => Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && b.every(v => a.includes(v));

/**
 * Проверка ответа. input — в исходных индексах карточки, не в индексах показа:
 * choice/tapline — число, multi — массив индексов, order — массив индексов items
 * в том порядке, как их расставил человек, blanks — массив строк по пропускам.
 */
export function check(card, input) {
  switch (card.t) {
    case 'choice': case 'tapline': return input === card.answer;
    case 'multi': return sameSet(input, card.answer);
    case 'order': return sameList(input, card.items.map((_, i) => i));
    case 'blanks': return sameList(input, card.answer);
    default: return true;
  }
}

/** Сколько пропусков ___ в шаблоне кода. */
export const blankCount = code => code.split('___').length - 1;

export function start(lesson) {
  return {
    queue: lesson.cards.map((_, i) => i),
    pos: 0,
    total: lesson.cards.length,
    seen: new Set(),       // карточки, на которые уже ответили хотя бы раз
    missed: new Set(),     // карточки, где была ошибка
    cleared: new Set(),    // карточки, которые закрыты насовсем
    firstTry: 0,           // верно с первой попытки (только карточки с ответом)
    graded: lesson.cards.filter(c => GRADED.has(c.t) || c.t === 'match').length,
    done: false
  };
}

export const current = (state, lesson) => lesson.cards[state.queue[state.pos]];
export const currentIndex = state => state.queue[state.pos];

/** Доля пройденного для полосы прогресса: повторы ошибок её не откатывают. */
export const progress = state => state.cleared.size / state.total;

/**
 * Записывает результат текущей карточки. ok — верно ли; для match ok=false означает,
 * что по пути были неверные пары (повтора не будет).
 */
export function answer(state, lesson, ok) {
  const i = currentIndex(state), card = lesson.cards[i];
  const first = !state.seen.has(i);
  state.seen.add(i);
  if (ok && first && (GRADED.has(card.t) || card.t === 'match')) state.firstTry++;
  if (!ok) state.missed.add(i);
  if (!ok && GRADED.has(card.t)) state.queue.push(i);
  else state.cleared.add(i);
  return state;
}

export function next(state) {
  state.pos++;
  if (state.pos >= state.queue.length) state.done = true;
  return state;
}

/** Очки за урок: 10 за прохождение, +1 за каждый верный ответ с первой попытки, +5 без ошибок. */
export function result(state, ms = 0) {
  const mistakes = state.missed.size;
  const accuracy = state.graded ? Math.round(state.firstTry / state.graded * 100) : 100;
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const xp = 10 + state.firstTry + (mistakes === 0 ? 5 : 0);
  return { mistakes, accuracy, stars, xp, ms };
}

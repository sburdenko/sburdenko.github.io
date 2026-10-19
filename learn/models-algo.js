/**
 * Стенд «алгоритм по шагам»: задача кассеты 06 «Паттерны алгоритмов» внутри урока Bathys.
 * Трасса, вид и тексты шагов берутся из algorithms/patterns/ как есть: здесь только реестр задач
 * и модель листания { init, act, goal } без DOM — тесты проходят задание теми же действиями, что кнопки.
 *
 * Карточка: { t: 'rig', rig: 'algo', problem: '<id задачи>', input?: { поле: значение }, task, goal?, solve }
 *   problem — id из ALGO (совпадает с id стенда кассеты: twoSum, longest, islands, coin, …)
 *   input   — входные данные поверх примера кассеты; проверяются теми же правилами, что поля на её странице
 *   goal    — { step: 'end' | номер шага } или { event: '<ключ события>' }: куда нужно дойти (по умолчанию — до конца);
 *             goal.asks — вопросы «что будет дальше?» по порядку трассы (goal.ask или goal.predict — один вопрос):
 *             { at: <номер события или ключ>, options: [вариант, …], answer: n, q?, explain? }
 *             at — событие, которое нужно предсказать: стенд встаёт на шаг перед ним и пускает дальше
 *             после верного ответа. Вариант — строка, { ru, en } или { event: '<ключ>', label }; если все
 *             варианты с event, answer можно не писать — верным считается вариант с ключом события at.
 *             q, explain и label переводятся (в данных урока это строки из i18n), остальное — общее.
 * Действия: next, prev, reset (в начало), end (в конец или до вопроса), pick:N.
 *   Если первый вопрос стоит на at: 1, стенд уже на нём (шаг 0) — solve начинается с pick:N, а не с end.
 */
import { RIGS as TAPE_RIGS, runWithInput } from '../algorithms/patterns/rigs.js?v=202610191240';
import { PROBLEMS, NAMES } from '../algorithms/patterns/problems.js?v=202610191240';
import { DICT } from '../algorithms/patterns/i18n.js?v=202610191240';
import { formatField } from '../algorithms/patterns/inputs.js?v=202610191240';
import { tr } from './i18n.js?v=202610191240';

/** Строка кассеты на текущем языке: значение — строка или функция от аргументов события. */
export function tapeText(key, args = []) {
  const entry = DICT[key];
  if (!entry) return key;
  const v = tr(entry);
  return typeof v === 'function' ? v(...args) : v;
}

/** Поле из текстов задачи кассеты ({pattern}.p — массив по задачам главы) на обоих языках. */
const problemText = (pattern, j, field) => ({ en: DICT[`${pattern}.p`].en[j][field], ru: DICT[`${pattern}.p`].ru[j][field] });

/**
 * Реестр задач: id → { trace, view, vars, example, fields, title, i18n, … }, собранный из модулей кассеты.
 * trace(params) — полная трасса (run.events — снимки состояния, у каждого key и args);
 * view(run, event) — SVG-строка; vars(run, event) — [[ключ подписи, html]];
 * i18n — { variant, task, idea, why, cx }, каждое { ru, en }.
 */
export const ALGO = Object.fromEntries(Object.entries(PROBLEMS).flatMap(([pattern, list]) => list.map((p, j) => {
  const rig = TAPE_RIGS[p.rig];
  return [p.rig, {
    id: p.rig, pattern, patternName: NAMES[pattern], title: p.name, num: p.num, slug: p.slug, diff: p.diff, must: p.must,
    fields: rig.fields, example: rig.example, trace: rig.run, view: rig.view, vars: rig.vars, check: rig.check, rig,
    i18n: Object.fromEntries(['variant', 'task', 'idea', 'why', 'cx'].map(f => [f, problemText(pattern, j, f)])),
  }];
})));

export const ALGO_IDS = Object.keys(ALGO);

/** Задача карточки или ошибка с понятным текстом для автора урока. */
export function algoProblem(card) {
  const p = ALGO[card.problem];
  if (!p) throw new Error(`algo: нет задачи «${card.problem}» (есть: ${ALGO_IDS.join(', ')})`);
  return p;
}

const runs = new WeakMap();

/** Трасса карточки: пример кассеты, поверх него card.input. Ввод проверяется правилами полей кассеты. */
export function algoRun(card) {
  if (runs.has(card)) return runs.get(card);
  const p = algoProblem(card);
  const params = { ...p.example, ...(card.input ?? {}) };
  const texts = Object.fromEntries(p.fields.map(f => [f.key, formatField(params[f.key], f)]));
  const r = runWithInput(p.rig, texts);
  if (r.error) throw new Error(`algo ${card.problem}: ввод не подходит${r.field ? ` (${r.field})` : ''}: ${tapeText(r.error[0], r.error.slice(1))}`);
  runs.set(card, r.run);
  return r.run;
}

/** Разбирает один вопрос: { at, pause, options, answer, q, explain }. */
function parseAsk(card, ask, events) {
  const at = typeof ask.at === 'string' ? events.findIndex(e => e.key === ask.at) : ask.at;
  if (!Number.isInteger(at) || at < 1 || at >= events.length) throw new Error(`algo ${card.problem}: ask.at «${ask.at}» вне трассы (событий ${events.length}, первое предсказать нельзя)`);
  const options = ask.options ?? [];
  if (options.length < 2 || options.length > 4) throw new Error(`algo ${card.problem}: вариантов должно быть 2–4`);
  const byEvent = options.every(o => o && typeof o === 'object' && 'event' in o);
  const real = byEvent ? options.findIndex(o => o.event === events[at].key) : -1;
  const answer = ask.answer ?? real;
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) throw new Error(`algo ${card.problem}: нет верного варианта`);
  if (byEvent && answer !== real) throw new Error(`algo ${card.problem}: answer ${answer}, а по трассе на шаге ${at} событие ${events[at].key}`);
  return { at, pause: at - 1, options, answer, q: ask.q, explain: ask.explain };
}

const asksCache = new WeakMap();

/** Все вопросы карточки по порядку трассы (пустой массив, если вопросов нет). */
export function algoAsks(card) {
  if (asksCache.has(card)) return asksCache.get(card);
  const g = card.goal ?? {};
  const raw = g.asks ?? [g.ask ?? g.predict].filter(Boolean);
  const events = algoRun(card).events;
  const asks = raw.map(a => parseAsk(card, a, events));
  asks.forEach((a, k) => { if (k && a.at <= asks[k - 1].at) throw new Error(`algo ${card.problem}: вопросы должны идти по трассе — at ${a.at} не позже ${asks[k - 1].at}`); });
  asksCache.set(card, asks);
  return asks;
}

/** Первый вопрос карточки или null. */
export const algoAsk = card => algoAsks(card)[0] ?? null;

/** Вопрос, на который ещё нужно ответить, или null. */
export const algoCurrent = (card, s) => algoAsks(card)[s.done ?? 0] ?? null;

/** Вопрос, который стоит на текущем шаге (отвеченный или нет), и его номер. */
export function algoAskAt(card, s) {
  const k = algoAsks(card).findIndex(a => a.pause === s.i);
  return k < 0 ? null : { ask: algoAsks(card)[k], k, answered: k < (s.done ?? 0) };
}

/** Подпись варианта ответа на текущем языке. */
export const optionLabel = o => tr(o && typeof o === 'object' && 'label' in o ? o.label : o);

/** Шаг, до которого нужно дойти. */
export function algoTarget(card) {
  const events = algoRun(card).events, g = card.goal ?? {}, asks = algoAsks(card);
  if (g.event) {
    const i = events.findIndex(e => e.key === g.event);
    if (i < 0) throw new Error(`algo ${card.problem}: в трассе нет события ${g.event}`);
    return i;
  }
  if (Number.isInteger(g.step)) {
    if (g.step < 0 || g.step >= events.length) throw new Error(`algo ${card.problem}: шага ${g.step} нет (событий ${events.length})`);
    return g.step;
  }
  return asks.length && g.step !== 'end' ? asks[asks.length - 1].at : events.length - 1;
}

/** Стенд стоит на вопросе и не пускает дальше. */
export const algoBlocked = (card, s) => {
  const ask = algoCurrent(card, s);
  return Boolean(ask && s.i === ask.pause);
};

/** Можно ли нажать кнопку действия — так её показывает стенд. */
export function algoCan(card, s, a) {
  const last = algoRun(card).events.length - 1, ask = algoCurrent(card, s);
  const [k, v] = a.split(':');
  if (k === 'next' || k === 'end') return s.i < last && !algoBlocked(card, s);
  if (k === 'prev' || k === 'reset') return s.i > 0;
  if (k === 'pick') return algoBlocked(card, s) && !s.wrong.includes(Number(v)) && Number(v) < ask.options.length;
  return false;
}

const seen = (s, i) => ({ ...s, i, max: Math.max(s.max, i) });

export const algoRig = {
  /** done — сколько вопросов отвечено, solved — отвечены все, wrong — промахи на текущем вопросе. */
  init: card => { algoRun(card); const n = algoAsks(card).length; return { i: 0, max: 0, done: 0, solved: n === 0, wrong: [] }; },
  act(card, s, a) {
    const [k, v] = a.split(':');
    const last = algoRun(card).events.length - 1, ask = algoCurrent(card, s);
    if (!['next', 'prev', 'reset', 'end', 'pick'].includes(k)) throw new Error(`неизвестное действие ${a}`);
    if (!algoCan(card, s, a)) return s;
    if (k === 'next') return seen(s, s.i + 1);
    if (k === 'prev') return { ...s, i: s.i - 1 };
    if (k === 'reset') return { ...s, i: 0 };
    if (k === 'end') return seen(s, ask && s.i < ask.pause ? ask.pause : last);
    const n = Number(v);
    if (n !== ask.answer) return { ...s, wrong: [...s.wrong, n] };
    const done = s.done + 1;
    return { ...s, done, solved: done === algoAsks(card).length, wrong: [] };
  },
  goal(card, s) {
    return s.max >= algoTarget(card) && s.done === algoAsks(card).length;
  },
};

/**
 * Прогресс: очки, серия дней, звёзды по урокам. Чистые функции + обёртка над localStorage.
 *
 * Хранилище может быть недоступно (приватный режим, запрет cookies) — тогда всё работает
 * в памяти до перезагрузки, а страница показывает, что прогресс не сохранится.
 */
const KEY = 'learn.v1';

export const empty = () => ({ v: 1, xp: 0, streak: { days: 0, last: null }, lessons: {} });

/** Локальная дата YYYY-MM-DD: серия считается по календарю человека, а не по UTC. */
export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const dayNum = s => Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5);

/** Серия: тот же день — без изменений, следующий — +1, пропуск — начинаем с 1. */
export function bumpStreak(streak, day) {
  if (streak.last === day) return streak;
  const gap = streak.last ? dayNum(day) - dayNum(streak.last) : Infinity;
  return { days: gap === 1 ? streak.days + 1 : 1, last: day };
}

/** Серия на экране: если вчера и сегодня ничего не было, она уже сгорела. */
export function liveStreak(streak, day) {
  if (!streak.last) return 0;
  return dayNum(day) - dayNum(streak.last) <= 1 ? streak.days : 0;
}

/** Записывает пройденный урок; в зачёт идут лучшие звёзды, очки — за каждое прохождение. */
export function record(state, id, res, day) {
  const prev = state.lessons[id];
  return {
    ...state,
    xp: state.xp + res.xp,
    streak: bumpStreak(state.streak, day),
    lessons: {
      ...state.lessons,
      [id]: { stars: Math.max(prev?.stars ?? 0, res.stars), runs: (prev?.runs ?? 0) + 1, last: day }
    }
  };
}

export const isDone = (state, id) => Boolean(state.lessons[id]);

/** Урок открыт, если это первый урок или предыдущий пройден. */
export const isOpen = (state, ids, i) => i === 0 || isDone(state, ids[i - 1]);

/** Разбирает сохранённое; повреждённый JSON или чужой формат дают пустой прогресс. */
export function parse(raw) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || typeof s.xp !== 'number' || typeof s.lessons !== 'object') return empty();
    return { ...empty(), ...s, streak: { ...empty().streak, ...s.streak } };
  } catch {
    return empty();
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return { state: raw ? parse(raw) : empty(), saved: true };
  } catch {
    return { state: empty(), saved: false };
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* хранилище недоступно — сбрасывать нечего */ }
  return empty();
}

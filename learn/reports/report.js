/**
 * Жалобы на карточки: категории, сборка и проверка отчёта. Без DOM и без Firebase —
 * тесты проверяют ровно то, что уйдёт в базу. Правила Firestore (см. firestore.rules)
 * повторяют эти ограничения на стороне сервера.
 */

/** Категории проблем. Порядок — порядок в окне. */
export const CATEGORIES = [
  { id: 'wrong-answer', ru: 'Неверный ответ засчитан или верный не принят', en: 'Wrong answer accepted, or a correct one rejected' },
  { id: 'unclear', ru: 'Непонятно объяснение или вопрос', en: 'The explanation or question is unclear' },
  { id: 'typo', ru: 'Опечатка или ошибка в тексте', en: 'Typo or mistake in the text' },
  { id: 'fact', ru: 'Неточный или устаревший факт', en: 'Inaccurate or outdated fact' },
  { id: 'translation', ru: 'Плохой перевод', en: 'Bad translation' },
  { id: 'rig', ru: 'Стенд не работает или ведёт себя странно', en: 'The rig is broken or behaves oddly' },
  { id: 'ui', ru: 'Не нажимается или съехала вёрстка', en: 'Cannot tap it, or the layout is broken' },
  { id: 'difficulty', ru: 'Слишком сложно или слишком просто', en: 'Too hard or too easy' },
  { id: 'idea', ru: 'Идея: чего не хватает', en: 'Idea: what is missing' },
  { id: 'other', ru: 'Другое', en: 'Something else' }
];

export const CATEGORY_IDS = CATEGORIES.map(c => c.id);
export const MAX_TEXT = 1000;
export const MAX_SNIPPET = 300;

/** Заголовок карточки для отчёта: вопрос, задание или название. */
export const cardSnippet = card => String(card.q ?? card.task ?? card.title ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET);

/**
 * Собирает отчёт. Бросает Error('empty'), если нет ни категории, ни текста.
 * ctx: { lang, courseId, lessonId, cardIndex, card, uid?, ver?, answered? }; form: { categories, text }
 */
export function buildReport(ctx, form) {
  const categories = [...new Set(form.categories ?? [])].filter(c => CATEGORY_IDS.includes(c));
  const text = String(form.text ?? '').trim().slice(0, MAX_TEXT);
  if (!categories.length && !text) throw new Error('empty');
  return {
    courseId: String(ctx.courseId),
    lessonId: String(ctx.lessonId),
    cardIndex: ctx.cardIndex,
    cardType: String(ctx.card.t),
    snippet: cardSnippet(ctx.card),
    lang: ctx.lang,
    categories,
    text,
    uid: ctx.uid ?? null,
    ver: String(ctx.ver ?? ''),
    wasWrong: Boolean(ctx.answered === false)
  };
}

/** Проверка формы отчёта, той же, что делают правила Firestore. */
export function isValidReport(r) {
  return Boolean(r)
    && typeof r.courseId === 'string' && r.courseId.length > 0 && r.courseId.length <= 40
    && typeof r.lessonId === 'string' && r.lessonId.length > 0 && r.lessonId.length <= 40
    && Number.isInteger(r.cardIndex) && r.cardIndex >= 0 && r.cardIndex < 100
    && typeof r.cardType === 'string' && r.cardType.length <= 20
    && typeof r.snippet === 'string' && r.snippet.length <= MAX_SNIPPET
    && (r.lang === 'ru' || r.lang === 'en')
    && Array.isArray(r.categories) && r.categories.length <= CATEGORIES.length && r.categories.every(c => CATEGORY_IDS.includes(c))
    && typeof r.text === 'string' && r.text.length <= MAX_TEXT
    && (r.categories.length > 0 || r.text.length > 0);
}

/* ---------- очередь на случай, когда сеть недоступна ---------- */
const QUEUE_KEY = 'bathys-report-queue';
const MAX_QUEUE = 20;

export function loadQueue(store = globalThis.localStorage) {
  try { const q = JSON.parse(store.getItem(QUEUE_KEY) ?? '[]'); return Array.isArray(q) ? q.filter(isValidReport) : []; } catch { return []; }
}
export function saveQueue(q, store = globalThis.localStorage) {
  try { store.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE))); } catch { /* хранилище недоступно */ }
}

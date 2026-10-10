/**
 * Отправка жалоб без привязки к сервису. Приложение вызывает только submit(report);
 * куда это уходит — решает адаптер (сейчас Firestore). Если отправить не вышло,
 * отчёт ждёт в localStorage и уходит при следующем запуске.
 *
 * Адаптер — модуль с createSink(settings) → { add(report) }, как у входа (learn/auth).
 */
import { AUTH_CONFIG } from '../auth/config.js?v=202610101341';
import { isValidReport, loadQueue, saveQueue } from './report.js?v=202610101341';

const SINKS = { firebase: () => import('./firestore.js?v=202610101341') };
const PROVIDER = AUTH_CONFIG.provider;   // тот же проект, что и вход
/** Сколько ждать ответа сервера. Firestore без базы или без сети не падает, а ждёт бесконечно. */
export const SEND_TIMEOUT_MS = 8000;

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);

let sinkPromise = null;
const sink = () => (sinkPromise ??= (async () => {
  const settings = AUTH_CONFIG[PROVIDER];
  if (!settings || !SINKS[PROVIDER]) throw new Error('reports-disabled');
  return (await SINKS[PROVIDER]()).createSink(settings);
})());

export const reportsEnabled = Boolean(AUTH_CONFIG[PROVIDER] && SINKS[PROVIDER]);

/** Отправить отчёт. Возвращает 'sent' или 'queued'; на неверный отчёт бросает Error('invalid'). */
export async function submit(report) {
  if (!isValidReport(report)) throw new Error('invalid');
  try {
    await withTimeout((async () => (await sink()).add(report))(), SEND_TIMEOUT_MS);
    return 'sent';
  } catch (e) {
    saveQueue([...loadQueue(), report]);
    return 'queued';
  }
}

/** Дослать отложенные отчёты — вызывается при запуске. */
export async function flushQueue() {
  const q = loadQueue();
  if (!q.length || !reportsEnabled) return 0;
  const left = [];
  let sent = 0;
  try {
    const s = await withTimeout(sink(), SEND_TIMEOUT_MS);
    for (const r of q) { try { await withTimeout(s.add(r), SEND_TIMEOUT_MS); sent++; } catch { left.push(r); } }
  } catch { return 0; }
  saveQueue(left);
  return sent;
}

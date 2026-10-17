/**
 * «Сначала объясни, потом спрашивай». Для каждого понятия из словаря курса проверяем: первое
 * появление в теории (learn-карточка: заголовок, текст, код, схема — но не свёрнутый блок «Глубже»)
 * стоит не позже, чем первое появление в вопросе, вариантах, разборе ответа или задании стенда.
 * Порядок — порядок курса: раздел, урок, карточка. Проверяются разделы из CHECKED; остальные
 * добавляются, когда их переработают.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCourseFromSource } from '../learn/content.js';

const CHECKED = { async: ['u1', 'u2', 'u3', 'u4'] };

/** Понятие → шаблон. Шаблоны ловят API и устойчивые термины, а не имена из примеров кода. */
const CONCEPTS = {
  async: {
    'Task.Run': /Task\.Run\b/,
    '.Result': /\.Result\b/,
    '.Wait()': /\.Wait\(\)/,
    'GetAwaiter().GetResult()': /GetAwaiter\(\)\.GetResult/,
    'WhenAll': /\bWhenAll\b/,
    'WhenAny': /\bWhenAny\b/,
    'WaitAsync': /\bWaitAsync\b/,
    'CancellationToken': /\bCancellationToken(Source)?\b/,
    'ConfigureAwait': /\bConfigureAwait\b/,
    'SynchronizationContext': /\bSynchronizationContext\b/,
    'ValueTask': /\bValueTask\b/,
    'async void': /\basync void\b/,
    'AggregateException': /\bAggregateException\b/,
    'UnobservedTaskException': /\bUnobservedTaskException\b/,
    'TaskCompletionSource': /\bTaskCompletionSource\b|\bTCS\b/,
    'SetResult': /\bSetResult\b/,
    'AwaitUnsafeOnCompleted': /\bAwait(Unsafe)?OnCompleted\b/,
    'INotifyCompletion': /\bI?(Critical)?NotifyCompletion\b/,
    'GetAwaiter': /\bGetAwaiter\b/,
    'Task.Yield': /\bTask\.Yield\b|\bYield\(\)/,
    'Awaitable': /\bAwaitable\b/,
    'ExecutionContext': /\bExecutionContext\b/,
    'AsyncLocal': /\bAsyncLocal\b/,
    'ThreadPool.SetMinThreads': /\bSetMinThreads\b/,
    'LongRunning': /\bLongRunning\b/,
    'ContinueWith': /\bContinueWith\b/,
    'IAsyncEnumerable': /\bIAsyncEnumerable\b|await foreach/,
    'await using': /await using|IAsyncDisposable/,
    'Channel': /\bChannel(<|\.Create)/,
    'SemaphoreSlim': /\bSemaphoreSlim\b/,
    'Parallel.ForEachAsync': /\bForEachAsync\b/
  }
};

const html = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const teaching = c => (c.t === 'learn' ? [c.title, c.body, c.code, ...(c.flow ?? [])] : []).map(html).join('\n');
const testing = c => (c.t === 'learn' ? [] : [c.q, c.task, c.code, c.explain, ...(c.options ?? []), ...(c.items ?? []), ...(c.pairs ?? []).flat(), ...(c.tiles ?? []), ...Object.values(c.wrong ?? {})]).map(html).join('\n');

for (const [courseId, units] of Object.entries(CHECKED)) {
  test(`${courseId}: понятия объясняются раньше, чем о них спрашивают (${units.join(', ')})`, async () => {
    const course = await loadCourseFromSource(courseId, 'ru');
    const taught = new Map(), problems = [];
    for (const u of course.units) {
      if (u.soon) continue;
      const check = units.includes(u.id);
      for (const l of u.lessons) for (const [i, card] of l.cards.entries()) {
        const at = `${l.id} #${i + 1} (${card.t})`;
        const tt = teaching(card), qq = testing(card);
        for (const [name, re] of Object.entries(CONCEPTS[courseId])) {
          if (re.test(tt) && !taught.has(name)) taught.set(name, at);
          if (check && re.test(qq) && !taught.has(name)) problems.push(`${at}: «${name}» — в вопросе раньше, чем в теории`);
        }
      }
    }
    assert.deepEqual([...new Set(problems)], [], problems.slice(0, 20).join('\n'));
  });
}

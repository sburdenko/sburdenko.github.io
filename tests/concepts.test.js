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

const CHECKED = { async: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u8'] };

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
    'Parallel.ForEachAsync': /\bForEachAsync\b/,
    'Writer.Complete': /Writer\.Complete\b|\.Complete\(\)/,
    'BoundedChannel': /CreateBounded|BoundedChannel/,
    'ReadAllAsync': /\bReadAllAsync\b/,
    'TrySetResult': /\bTrySet(Result|Exception|Canceled)\b/,
    'RunContinuationsAsynchronously': /\bRunContinuationsAsynchronously\b/,
    'Dispatcher': /\bDispatcher(\.|SynchronizationContext\b)/,
    'WindowsFormsSynchronizationContext': /\bWindowsFormsSynchronizationContext\b/,
    'UnitySynchronizationContext': /\bUnitySynchronizationContext\b/,
    'BeginInvoke': /\bBeginInvoke\b/,
    'IProgress': /\bI?Progress<\w+>/,
    'UnityException': /\bUnityException\b/,
    'MissingReferenceException': /\bMissingReferenceException\b/,
    'Awaitable.NextFrameAsync': /\bNextFrameAsync\b/,
    'Awaitable.WaitForSecondsAsync': /\bWaitForSecondsAsync\b/,
    'Awaitable.BackgroundThreadAsync': /\bBackgroundThreadAsync\b|\bMainThreadAsync\b/,
    'destroyCancellationToken': /\bdestroyCancellationToken\b/,
    'UniTask': /\bUniTask\b/,
    'BackgroundService': /\bBackgroundService\b|\bIHostedService\b/,
    'Volatile.Read/Write': /\bVolatile\.(Read|Write)\b/,
    'volatile': /\bvolatile\b/,
    'acquire/release': /\b(acquire|release)\b/,
    'полный барьер': /полн\S* барьер|\bMemoryBarrier\b/,
    'CS0677': /\bCS0677\b/,
    'Interlocked': /\bInterlocked\b/,
    'Interlocked.Exchange': /Interlocked\.Exchange\b/,
    'CompareExchange': /\bCompareExchange\b|\bCAS\b/,
    'Interlocked.Read': /Interlocked\.Read\b/,
    'ImmutableInterlocked': /\bImmutableInterlocked\b/,
    'SpinWait': /\bSpinWait\b|\bSpinOnce\b|\bSpinUntil\b/,
    'SpinLock': /\bSpinLock\b/,
    'lockTaken': /\blockTaken\b|ref bool/,
    'защитная копия': /защитн\S* копи/,
    'LockRecursionException': /\bLockRecursionException\b/,
    'WaitHandle': /\bWaitHandle\b|\bWaitOne\b|\bWaitAny\b|\bWaitAll\b/,
    'Mutex': /\bMutex\b|\bReleaseMutex\b/,
    'AbandonedMutexException': /\bAbandonedMutexException\b/,
    'Semaphore': /\bSemaphore\b/,
    'AutoResetEvent': /\bAutoResetEvent\b/,
    'ManualResetEvent': /\bManualResetEvent(Slim)?\b/,
    'PlatformNotSupportedException': /\bPlatformNotSupportedException\b/,
    'Monitor': /\bMonitor\b/,
    'Monitor.Wait/Pulse': /Monitor\.Wait\b|\bPulse(All)?\b/,
    'Thread.Abort': /\bThread\.?Abort\b|\bThreadAbortException\b/,
    'Monitor.TryEnter': /\bTryEnter\b/,
    'sync block': /\bsync block\b/,
    'Lock.EnterScope': /\bEnterScope\b/,
    'CS9216': /\bCS9216\b/,
    'ReaderWriterLockSlim': /\bReaderWriterLock(Slim)?\b|\bupgradeable\b/,
    'Lazy<T>': /\bLazy\b/,
    'LazyThreadSafetyMode': /\b(LazyThreadSafetyMode|ExecutionAndPublication|PublicationOnly)\b/,
    'LazyInitializer': /\bLazyInitializer\b|\bEnsureInitialized\b/,
    'двойная проверка': /двойн\S* проверк|double-checked/,
    'ConcurrentDictionary': /\bConcurrentDictionary\b/,
    'GetOrAdd': /\bGetOrAdd\b|\bAddOrUpdate\b/,
    'ConcurrentQueue/Stack/Bag': /\bConcurrent(Queue|Stack|Bag)\b/,
    'BlockingCollection': /\bBlockingCollection\b/
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

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

const CHECKED = { async: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'] };

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
    'TaskScheduler.Current': /\bTaskScheduler\.Current\b/,
    'TaskScheduler.Default': /\bTaskScheduler\.Default\b/,
    'FromCurrentSynchronizationContext': /\bFromCurrentSynchronizationContext\b/,
    'Task.Factory.StartNew': /\bStartNew\b/,
    'TaskContinuationOptions': /\bTaskContinuationOptions\b/,
    'OnlyOn/NotOn': /\b(OnlyOn|NotOn)(RanToCompletion|Faulted|Canceled)\b/,
    'ExecuteSynchronously': /\bExecuteSynchronously\b/,
    'LazyCancellation': /\bLazyCancellation\b/,
    'TaskCanceledException': /\bTaskCanceledException\b/,
    'Unwrap': /\bUnwrap\b/,
    'TaskCreationOptions': /\bTaskCreationOptions\b/,
    'PreferFairness': /\bPreferFairness\b/,
    'AttachedToParent': /\bAttachedToParent\b/,
    'DenyChildAttach': /\bDenyChildAttach\b/,
    'HideScheduler': /\bHideScheduler\b/,
    'ConcurrentExclusiveSchedulerPair': /\bConcurrentExclusiveSchedulerPair\b/,
    'очереди пула': /локальн\S* очеред|глобальн\S* очеред/i,
    'кража работы': /краж\S* работы|work stealing/i,
    'Parallel.For/ForEach': /\bParallel\.(For|ForEach)\b/,
    'Parallel.Invoke': /\bParallel\.Invoke\b/,
    'ParallelLoopState': /\bParallelLoopState\b|\.Break\(\)|LowestBreakIteration/,
    'MaxDegreeOfParallelism': /\bMaxDegreeOfParallelism\b/,
    'Environment.ProcessorCount': /\bProcessorCount\b/,
    'localInit/localFinally': /\blocal(Init|Finally)\b/,
    'Interlocked': /\bInterlocked\b/,
    'count++ гонка': /\bcount\+\+/,
    'ложное разделение': /ложн\S* разделени|false sharing|кэш-лини/i,
    'PLINQ AsParallel': /\bAsParallel\b|\bPLINQ\b/,
    'AsOrdered': /\bAsOrdered\b/,
    'WithDegreeOfParallelism': /\bWithDegreeOfParallelism\b/,
    'ForAll': /\bForAll\b/,
    'Timer.Change': /\bTimeout\.Infinite\b|\.Change\(/,
    'System.Timers.Timer': /\bSystem\.Timers\.Timer\b|\bElapsed\b|\bAutoReset\b/,
    'PeriodicTimer': /\bPeriodicTimer\b|\bWaitForNextTickAsync\b/,
    'IsBackground': /\bIsBackground\b|фонов\S* пот/i,
    'Thread.Join': /\bJoin\(\)/,
    'Thread.Abort': /\bThread\.Abort\b|\bThreadAbortException\b/,
    'CancellationToken.Register': /\.Register\(|\bCancellationTokenRegistration\b/,
    'CreateLinkedTokenSource': /\bCreateLinkedTokenSource\b/,
    'CancelAfter': /\bCancelAfter\b/
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

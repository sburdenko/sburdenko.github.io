/** Async, unit "Tasks without await", lesson 1: ContinueWith and its traps. */
export default {
  id: 'as.u7.l1',
  title: 'ContinueWith and its traps',
  sub: 'Continuations by hand: scheduler, exceptions, options and Unwrap',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'A continuation by hand',
      body: '<p>Before <code>await</code> there was <code>ContinueWith</code> (.NET 4.0). It hangs a delegate on a task: when the antecedent task finishes — <b>in any way</b>: success, failure or cancellation — the delegate is queued to a scheduler.</p><p><code>ContinueWith</code> itself immediately returns a <b>new task</b> — the continuation task. It completes once the delegate has run.</p>',
      code: 'Task<string> load = File.ReadAllTextAsync("a.txt");\n\n// a continuation: t is load itself, already completed\nTask<int> len = load.ContinueWith(t => t.Result.Length);\n\n// the same with await\nint n = (await load).Length;',
      deep: '<p>A task has a field for continuations (<code>m_continuationObject</code>): it holds one object or a list. When the task completes, it walks that field. For <code>ContinueWith</code> the entry is a wrapper that queues a new <code>Task</code> to the scheduler.</p><p><code>await</code> uses the same field but puts the state machine box there (as in the "Under the hood" unit). Hence the cost difference: each <code>ContinueWith</code> is a new task and a delegate (plus a closure), while an async method gets by with one box for the whole method.</p>'
    },
    {
      t: 'choice',
      q: 'load completed with an error. What happens to the continuation load.ContinueWith(t => Log("done"))?',
      options: ['It runs: without options a continuation runs on any outcome', 'It does not run: the antecedent failure cancels the continuation', 'It throws AggregateException on the thread that called ContinueWith', 'It runs, but only after an explicit load.Wait()'],
      answer: 0,
      explain: 'By default (TaskContinuationOptions.None) a continuation does not care how the antecedent ended. Dealing with the error is its own job.',
      wrong: { 1: 'Only a continuation with OnlyOnRanToCompletion or NotOnFaulted behaves like that.' }
    },
    {
      t: 'learn',
      title: 'Trap 1: TaskScheduler.Current',
      body: '<p>Where does the continuation run? <code>ContinueWith</code> without an explicit scheduler takes <code>TaskScheduler.Current</code> — the scheduler of the task <b>whose code is running right now</b> on this thread. Outside any task that is <code>TaskScheduler.Default</code>, i.e. the pool.</p><p>But inside a task started on a UI scheduler, <code>Current</code> is the UI scheduler. A "background" continuation or <code>Task.Factory.StartNew</code> from there silently moves to the UI thread. The window freezes even though no UI appears anywhere in the code.</p><p>The rule: always pass the scheduler explicitly to <code>ContinueWith</code> and <code>StartNew</code>. Analyzer <b>CA2008</b> warns you if you forget.</p>',
      deep: '<p><code>await</code> works differently: it first looks at <code>SynchronizationContext.Current</code>, and only when there is no context does it look at <code>TaskScheduler.Current</code>, and only if that is not Default. That is why after <code>await</code> in UI code you come back to the UI thread through the context, not through a scheduler.</p><p><code>TaskScheduler.FromCurrentSynchronizationContext()</code> bridges the two worlds: a scheduler that hands tasks to the current <code>SynchronizationContext</code> via <code>Post</code>.</p>'
    },
    {
      t: 'choice',
      q: 'This code runs on the WPF UI thread. Which thread runs Heavy()?',
      code: 'var ui = TaskScheduler.FromCurrentSynchronizationContext();\n\nTask.Factory.StartNew(() =>\n{\n    status.Text = "Working…";\n    Task.Factory.StartNew(() => Heavy());\n}, CancellationToken.None, TaskCreationOptions.None, ui);',
      options: ['The UI thread', 'A thread-pool thread', 'A new dedicated thread', 'The pool, if it has a free thread'],
      answer: 0,
      explain: 'The inner StartNew without a scheduler takes TaskScheduler.Current. The outer task runs on the UI scheduler, so Current is that scheduler, and Heavy() goes to the UI thread too. The fix is TaskScheduler.Default or Task.Run.'
    },
    {
      t: 'learn',
      title: 'Trap 2: exceptions',
      body: '<p>A continuation receives the antecedent as is. If it failed, <code>t.Result</code> throws <code>AggregateException</code> — like <code>.Result</code> in unit 2, only now inside the continuation.</p><p>That exception faults the <b>continuation task</b>. And usually nobody waits for it: the result of <code>ContinueWith</code> was thrown away. The outcome is silence: no error dialog, no log line. With <code>await</code> the exception would have reached the caller.</p><p>So check the outcome yourself in a continuation: <code>t.IsFaulted</code>, <code>t.IsCanceled</code>, <code>t.Exception</code>.</p>',
      code: 'Download().ContinueWith(t =>\n{\n    if (t.IsFaulted)\n        Log(t.Exception!.InnerException);   // the real error inside the Aggregate\n    else if (!t.IsCanceled)\n        Show(t.Result);\n}, TaskScheduler.Default);',
      deep: '<p>What happens to an unobserved error: when the garbage collector collects a faulted task whose exception nobody read, the runtime raises <code>TaskScheduler.UnobservedTaskException</code>.</p><p><b>Then and now:</b> in .NET 4.0 the process crashed after that. Since .NET 4.5 nothing happens by default (the <code>ThrowUnobservedTaskExceptions</code> setting could bring the crash back). In .NET Core and .NET 5+ there is only the event. So a lost error does not crash the app — it just vanishes, which is worse for debugging.</p>'
    },
    {
      t: 'tapline',
      q: 'LoadAsync failed. On which line is the exception thrown and lost without a trace?',
      code: 'void Refresh()\n{\n    LoadAsync().ContinueWith(t =>\n    {\n        var items = t.Result;\n        Render(items);\n    }, TaskScheduler.FromCurrentSynchronizationContext());\n}',
      answer: 4,
      explain: 't.Result on a faulted task throws AggregateException. It faults the continuation task, and nobody waits for it: Refresh did not even keep it. Render is never called, and nobody finds out.'
    },
    {
      t: 'learn',
      title: 'TaskContinuationOptions',
      body: '<p>Options refine when and how a continuation runs:</p><ul><li><code>OnlyOnRanToCompletion</code>, <code>OnlyOnFaulted</code>, <code>OnlyOnCanceled</code>, <code>NotOnFaulted</code> and so on — run only on the matching outcome;</li><li><code>ExecuteSynchronously</code> — run right on the thread that completed the antecedent, without a queue. Only for short continuations;</li><li><code>RunContinuationsAsynchronously</code> — do not run the continuation\'s own continuations synchronously;</li><li><code>LazyCancellation</code> — when the token is cancelled, do not complete until the antecedent finishes.</li></ul><p>The trap: if an <code>OnlyOn…</code> condition is not met, the continuation task becomes <b>Canceled</b>. Wait for it and you get <code>TaskCanceledException</code>.</p>',
      code: 'var ok = load.ContinueWith(t => Show(t.Result),\n    TaskContinuationOptions.OnlyOnRanToCompletion);\nvar err = load.ContinueWith(t => Log(t.Exception!),\n    TaskContinuationOptions.OnlyOnFaulted);\n\nawait err;   // what happens if load succeeds?',
      deep: '<p><code>ExecuteSynchronously</code> is a request, not an order. If the antecedent has already completed when <code>ContinueWith</code> is called, the continuation runs right on the calling thread. A long chain of such continuations could dive deep into the stack, so the runtime watches the remaining stack and queues the continuation anyway when an overflow threatens. The scheduler may also refuse inlining.</p>'
    },
    {
      t: 'choice',
      q: 'In the code above load completed successfully. What happens at await err?',
      options: ['TaskCanceledException', 'Completes instantly without an error', 'Waits forever', 'NullReferenceException from t.Exception!'],
      answer: 0,
      explain: 'The OnlyOnFaulted condition was not met, the delegate never ran, and err moved to Canceled. Awaiting a cancelled task throws TaskCanceledException.',
      wrong: { 3: 'The delegate never ran — it never got to t.Exception.', 2: 'err does not hang: it was moved to Canceled right away.' }
    },
    {
      t: 'learn',
      title: 'A task inside a task: Unwrap',
      body: '<p>If the continuation is itself asynchronous and returns a <code>Task</code>, <code>ContinueWith</code> returns <code>Task&lt;Task&gt;</code>. The outer task completes as soon as the lambda has <b>returned</b> the inner one — that is, at the first real <code>await</code> inside. You will not wait for the end of the work that way.</p><p><code>Unwrap()</code> builds a proxy task: it completes together with the inner task — with its result, error or cancellation. <code>Task.Factory.StartNew</code> with an async lambda has the same story, mentioned in unit 1.</p>',
      code: 'Task<Task> nested = load.ContinueWith(t => SaveAsync(t.Result),\n    TaskScheduler.Default);\nawait nested;   // waited only for SaveAsync to start\n\nTask saved = load.ContinueWith(t => SaveAsync(t.Result),\n    TaskScheduler.Default).Unwrap();\nawait saved;    // waited for SaveAsync to finish',
      deep: '<p><code>Unwrap</code> is an extension method from <code>TaskExtensions</code>, available for <code>Task&lt;Task&gt;</code> and <code>Task&lt;Task&lt;T&gt;&gt;</code>. It blocks nothing: the proxy subscribes to the outer task, then to the inner one. If the outer task failed or was cancelled, the proxy takes that outcome.</p><p><code>Task.Run</code> with a <code>Func&lt;Task&gt;</code> does this unwrapping internally. <code>await await nested</code> also works, but reads worse.</p>'
    },
    {
      t: 'blanks',
      q: 'Run SaveAsync after load on the pool and get a task that completes together with the save',
      code: 'Task saved = load\n    .ContinueWith(t => SaveAsync(t.Result), TaskScheduler.___)\n    .___();',
      tiles: ['Default', 'Current', 'Unwrap', 'Wait', 'GetAwaiter'],
      answer: ['Default', 'Unwrap'],
      explain: 'Default is the pool, no matter who called the code. Unwrap turns Task<Task> into a task that waits for the save itself, not just for its start.'
    },
    {
      t: 'learn',
      title: 'When ContinueWith still fits',
      body: '<p><code>await</code> does all of that and more: it returns to the context, unwraps the exception and does not create a task per step. So <code>await</code> is the default.</p><p><code>ContinueWith</code> remains for narrow cases:</p><ul><li>hanging a cheap handler without making the method async — for example, logging the error of a task nobody awaits;</li><li>hot library code: the overload with <code>state</code> and a <code>static</code> lambda avoid a closure;</li><li>old code from the .NET 4.0 days.</li></ul>',
      code: 'static void LogIfFaulted(this Task task, ILogger log) =>\n    task.ContinueWith(static (t, s) =>\n            ((ILogger)s!).LogError(t.Exception, "Background task failed"),\n        log, CancellationToken.None,\n        TaskContinuationOptions.OnlyOnFaulted |\n        TaskContinuationOptions.ExecuteSynchronously,\n        TaskScheduler.Default);'
    },
    {
      t: 'multi',
      q: 'What is true about ContinueWith? Select all.',
      options: ['Without options a continuation runs on any outcome of the antecedent', 'Without an explicit scheduler it takes TaskScheduler.Current', 'An exception in the continuation reaches whoever called ContinueWith', 'A continuation with OnlyOnFaulted moves to Canceled after a success', 'Unwrap blocks the thread until the inner task ends'],
      answer: [0, 1, 3],
      explain: 'A continuation\'s exception stays in the continuation task — only whoever waits for it will see it. Unwrap blocks nothing; it builds a proxy task.'
    },
    {
      t: 'match',
      q: 'Match the setting to what it does',
      pairs: [
        ['OnlyOnFaulted', 'Run only if the antecedent failed'],
        ['NotOnCanceled', 'Skip if the antecedent was cancelled'],
        ['ExecuteSynchronously', 'Run on the thread that completed the antecedent'],
        ['LazyCancellation', 'Do not complete before the antecedent ends'],
        ['TaskScheduler.Default', 'The thread pool, wherever it is called from']
      ]
    }
  ]
};

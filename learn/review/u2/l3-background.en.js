/** Code review, unit 2, lesson 3: timers, background tasks, cancellation (TileLoader). English version. */
export default {
  id: 'rv.u2.l3',
  title: 'Timers, background tasks, cancellation',
  sub: 'Timer and the GC, StartNew(async), the decoy token',
  minutes: 12,
  cards: [
    {
      t: 'learn',
      title: 'An alarm clock with no owner',
      body: '<p>You set an alarm clock and hide it in a drawer nobody knows about. Two outcomes are possible: the cleaner throws the drawer out and the alarm goes silent, or it rings forever and nobody can switch it off.</p><p>That is exactly what the loader constructor does: <code>var timer = new Timer(…)</code>. The variable is <b>local</b>, and nothing else references the timer. In .NET (Framework and modern) the garbage collector may collect it, and the progress bar stops updating "at some random moment", with no error. In Mono, which Unity runs on, the scheduler itself holds active timers, so the timer does not die, but nothing can stop it either: it keeps calling <code>ReportProgress</code> even after a scene change. Both outcomes are bad.</p>'
    },
    {
      t: 'choice',
      q: 'What does the .NET documentation say about a System.Threading.Timer that nothing references any more?',
      options: [
        'The GC may collect it and the callback stops: keep a reference for as long as you need the timer',
        'The timer keeps running until Dispose is called, in every implementation',
        'The GC collects it exactly when the constructor returns',
        'The callback of such a timer moves to the main thread'
      ],
      answer: 0,
      explain: 'The documentation explicitly says to keep a reference to the Timer. When exactly it gets collected depends on when a garbage collection happens. In Mono (Unity) the scheduler holds active timers, but that is an implementation detail, not a promise, and such a timer still cannot be stopped.',
      wrong: { 1: 'That is how Mono behaves, but the .NET documentation does not promise it: in .NET Framework and modern .NET an unreferenced timer is collected.', 2: 'Collection timing is not deterministic: the object becomes unreachable, but it is collected at some later garbage collection.' }
    },
    {
      t: 'learn',
      title: 'What else is wrong with the timer',
      body: '<p>A <code>Timer</code> callback runs on a <b>thread-pool</b> thread, not on the main thread. Yet it writes <code>_progressBar.value</code>, which calls Unity API. That is only allowed on the main thread.</p><p>Also: <code>dueTime = 0</code> fires the first call immediately, in parallel with the rest of the constructor. That is harmless here, but the callback may see any field assigned after the timer is created as still empty. And after a scene change the <code>Slider</code> is destroyed while the timer (if alive) keeps writing to it.</p><p>The right way: keep the timer in a field, call <code>Dispose</code> when stopping, and simply store the progress value in a field that <code>Update</code> reads on the main thread.</p>',
      deep: 'In Unity, writing to a UI object from the pool often "just does not crash", and sometimes throws <code>UnityException</code> ("can only be called from the main thread"): it depends on the specific API and version. So the rule is strict: do not touch Unity API from background threads; hand results to the main thread (through a field plus Update, or through a captured UnitySynchronizationContext). About the GC: in .NET an unreferenced timer is stopped at some garbage collection (its finalizer shuts it down), so it "lives" for a random time. In Mono (and IL2CPP, which uses the same class libraries) an active timer sits in a static scheduler list and is not collected. Rely on neither.'
    },
    {
      t: 'blanks',
      q: 'Fix the timer: keep it in a field and dispose it.',
      code: 'private readonly Timer _timer; // a field, not a local variable\n\npublic TileLoader(Slider bar)\n{\n    _progressBar = bar;\n    _timer = ___ Timer(_ => ReportProgress(), null, 1000, 1000);\n}\n\npublic void Stop() => _timer.___();',
      tiles: ['new', 'Dispose', 'static', 'Abort'],
      answer: ['new', 'Dispose'],
      explain: 'The field keeps the timer alive as long as the loader lives. Dispose stops it and frees its resources. (In real code the callback also must not touch the Slider directly.)'
    },
    {
      t: 'learn',
      title: 'Task.Factory.StartNew(async …) is a "Task in a Task"',
      body: '<p>An <code>async</code> lambda returns a <code>Task</code>. <code>StartNew</code> wraps that result in one more task, so you get a <code>Task&lt;Task&gt;</code>. The outer task counts as finished as soon as the lambda reaches its first <code>await</code>, which is almost immediately.</p><p>The inner task (the loop with <code>Compact</code>) lives on its own. If an exception happens in it, nobody sees it: nobody watches the inner task. The fix is one word: <code>Task.Run</code> unwraps the nested task automatically.</p>',
      code: 'Task t1 = Task.Factory.StartNew(async () => { await Task.Delay(1000); });\n// really a Task<Task>: t1 finishes almost immediately\n\nTask t2 = Task.Run(async () => { await Task.Delay(1000); });\n// t2 finishes when the lambda itself finishes',
      lang: 'csharp',
      deep: 'The second StartNew trap: without an explicit scheduler it uses <code>TaskScheduler.Current</code>, not the pool. Call it from inside a task running on a custom scheduler (say, a "main-thread scheduler") and the background work lands there too. <code>Task.Run</code> is <code>StartNew</code> with <code>TaskScheduler.Default</code>, <code>DenyChildAttach</code> and an automatic <code>Unwrap</code>.'
    },
    {
      t: 'choice',
      q: 'What type does Task.Factory.StartNew(async () => { … }) return without Unwrap?',
      options: ['Task<Task>', 'Task', 'void', 'Task<T> for the T in the lambda body'],
      answer: 0,
      explain: 'StartNew runs the delegate and wraps its result in a Task. The result of an async lambda is itself a Task, so the type is nested. Task.Run or .Unwrap() turn it into a plain Task.'
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: 'Find four problems in the constructor, the preload and the background loop. Tap the lines, then press Check.',
      code: 'public TileLoader(Slider progressBar)\n{\n    _progressBar = progressBar;\n    var timer = new Timer(_ => ReportProgress(), null, 0, 1000);\n}\n\npublic void PreloadAll(IEnumerable<int> ids)\n{\n    foreach (var id in ids)\n        GetTileAsync(id,\n            CancellationToken.None);\n}\n\npublic void StartBackgroundCompaction(CancellationToken ct)\n{\n    Task.Factory.StartNew(async () =>\n    {\n        while (!ct.IsCancellationRequested)\n        {\n            Compact();\n            await Task.Delay(1000);\n        }\n    });\n}',
      bugs: [
        { lines: [3], title: 'Timer in a local variable', why: 'Nothing references the timer: in .NET the GC collects it and progress quietly freezes, while in Mono (Unity) it cannot be stopped at all. Use a field and Dispose.' },
        { lines: [8, 9], title: 'Fire-and-forget in PreloadAll', why: 'The returned Tasks are ignored: errors go unobserved and nobody can wait for the result. And the factory with its blocking Wait() runs right inside this loop: from the fifth id on, PreloadAll blocks the calling thread.' },
        { lines: [10], title: 'CancellationToken.None instead of a token', why: 'It looks like a neatly passed token, but cancellation is switched off completely: nobody can stop the load from outside.' },
        { lines: [15, 20], title: 'StartNew(async) and Delay without a token', why: 'You get a Task<Task> and exceptions in the loop are lost. And Task.Delay(1000) without ct is not interrupted on stop and holds the loop until the pause ends.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:3', 'flag:8', 'flag:10', 'flag:15', 'check']
    },
    {
      t: 'learn',
      title: 'A token that only looks like cancellation',
      body: '<p>The method takes a <code>CancellationToken ct</code> and then <b>never uses it</b>: not in <code>GetByteArrayAsync</code>, not in <code>Delay</code>. It is an "exit" sign above a locked door. And <code>PreloadAll</code> passes <code>CancellationToken.None</code>, a token that can never be cancelled.</p><p>One more trap. Everyone who asks for the same tile shares one task. The factory closes over the <code>ct</code> of the <b>first</b> caller. If that caller cancels, the cancellation hits everyone else too.</p>',
      deep: 'The usual scheme: the shared work gets the loader\'s own token (a <code>CancellationTokenSource</code> on the object), and each caller cancels only its own wait with <code>task.WaitAsync(ct)</code> (available in .NET 6+) or <code>Task.WhenAny</code> with a cancellation task. A version caveat: <code>Task.WaitAsync</code> and the <code>HttpClient.GetByteArrayAsync(url, ct)</code> overload only arrived in .NET 6 and .NET 5. Unity (the .NET Standard 2.1 and .NET Framework profiles) has neither: pass the token through <code>GetAsync(url, ct)</code> or <code>SendAsync(request, ct)</code>, and build a cancellable wait with <code>Task.WhenAny</code>.'
    },
    {
      t: 'tapline',
      q: 'The token is passed everywhere except one line. Tap it.',
      code: 'await _throttle.WaitAsync(ct);\ntry\n{\n    var resp = await Http.GetAsync(url);\n    resp.EnsureSuccessStatusCode();\n    await Task.Delay(50, ct);\n}',
      answer: 3,
      explain: 'GetAsync(url) without a token: cancellation will not interrupt the network request, which runs to the end. It should be Http.GetAsync(url, ct).'
    },
    {
      t: 'learn',
      title: 'PreloadAll: fire and forget',
      body: '<p>The loop calls <code>GetTileAsync</code> and throws the task away. An exception inside such a task is never seen, and you cannot tell when everything is ready.</p><p>Worse, the "fire and forget" is an illusion. The factory and <code>Wait()</code> run synchronously, right inside this loop. From the fifth id on, the loop blocks in <code>Wait()</code> until a spot frees up, and <code>PreloadAll</code> turns into a long blocking call. On the Unity main thread that is the deadlock from lesson 1. And if hundreds of pool tasks call <code>GetTileAsync</code> at once, every waiter holds a <b>whole thread</b>: the pool starves and even unrelated tasks start to lag.</p><p>The fix: return a <code>Task</code>, wait with <code>await</code>, and let an asynchronous <code>WaitAsync</code> inside the load enforce the "at most 4" limit.</p>',
      code: 'public Task PreloadAllAsync(IEnumerable<int> ids, CancellationToken ct)\n{\n    var tasks = ids.Select(id => GetTileAsync(id, ct)).ToList();\n    return Task.WhenAll(tasks);\n}',
      lang: 'csharp'
    },
    {
      t: 'choice',
      q: 'What makes PreloadAllAsync from the example better than PreloadAll that ignores the tasks?',
      options: [
        'It returns a Task: you can await completion, see exceptions and pass a token',
        'It loads tiles faster because it uses more threads',
        'It replaces the semaphore, so no limiter is needed'
      ],
      answer: 0,
      explain: 'The tasks are gathered in WhenAll, so exceptions and completion are observable. Speed and threads have nothing to do with it, and the limiter is still needed, just a non-blocking one.',
      wrong: { 2: 'Task.WhenAll limits nothing: the limit still comes from WaitAsync inside the load.' }
    },
    {
      t: 'multi',
      q: 'What is true about background tasks and timers in this loader?',
      options: [
        'A System.Threading.Timer callback runs on a thread-pool thread, not the Unity main thread',
        'Task.Run unwraps an async lambda, while StartNew(async) does not',
        'An ignored Task guarantees that exceptions are shown in the Unity console',
        'A CancellationToken is a better way to stop a background loop than a flag'
      ],
      answer: [0, 1, 3],
      explain: 'The first, second and fourth are true. An ignored task does the opposite: it hides exceptions. At best they surface in the TaskScheduler.UnobservedTaskException event once the GC gets to the task.'
    }
  ]
};

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
      body: '<p>You set an alarm clock and put it in a drawer nobody can find. Some time later the cleaner throws out the drawer, alarm clock and all. It just goes silent.</p><p>That is exactly what the loader constructor does: <code>var timer = new Timer(…)</code>. The variable is <b>local</b>, and nothing else references the timer. The garbage collector may take it, and the progress bar silently stops updating "at some random time", with no error and no message. It works while debugging and stops after a minute on a device.</p>'
    },
    {
      t: 'choice',
      q: 'The progress bar updates at first, then freezes after about three minutes. There are no exceptions in the log. What is the top suspect?',
      options: [
        'A System.Threading.Timer kept in a local variable was collected by the GC',
        'The timer interval is too small (1000 ms)',
        'HttpClient is declared static'
      ],
      answer: 0,
      explain: 'The documentation says to keep a reference to a Timer as long as you need it. Without one, the GC collects it on its own schedule and the callback simply stops being called.',
      wrong: { 2: 'A static HttpClient is the right practice: you create it once.' }
    },
    {
      t: 'learn',
      title: 'What else is wrong with the timer',
      body: '<p>A <code>Timer</code> callback runs on a <b>thread-pool</b> thread, not on the main thread. Yet it writes <code>_progressBar.value</code>, which calls Unity API. That is only allowed on the main thread.</p><p>Also: <code>dueTime = 0</code> fires the callback immediately, possibly before the constructor finishes, and by then the <code>Slider</code> may be destroyed (a scene change).</p><p>The right way: keep the timer in a field, call <code>Dispose</code> when stopping, and simply store the progress value in a field that <code>Update</code> reads on the main thread.</p>',
      deep: 'In Unity, writing to a UI object from the pool often "just does not crash", and sometimes throws <code>UnityException</code> ("can only be called from the main thread"): it depends on the specific API and version. So the rule is strict: do not touch Unity API from background threads; hand results to the main thread (through a field plus Update, or through a captured UnitySynchronizationContext). A caveat about the GC: how soon the object is collected depends on the runtime and build (Release JIT collects earlier than Debug), but the documentation only guarantees "keep a reference".'
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
      lang: 'csharp'
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
        { lines: [3], title: 'Timer in a local variable', why: 'Nothing references the timer, so the GC will collect it and progress quietly stops updating. Use a field and Dispose.' },
        { lines: [8, 9], title: 'Fire-and-forget in PreloadAll', why: 'The returned Tasks are ignored: errors go unobserved and nobody can wait for the result. With thousands of ids, every blocking Wait ties up a thread.' },
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
      deep: 'The usual scheme: the shared work gets the loader\'s own token (a <code>CancellationTokenSource</code> on the object), and each caller cancels only its own wait with <code>task.WaitAsync(ct)</code> (available in .NET 6+) or <code>Task.WhenAny</code> with a cancellation task. A caveat: the <code>HttpClient.GetByteArrayAsync(url, ct)</code> overload exists in .NET 5+; on older profiles (for example .NET Standard 2.0 in Unity) pass the token through <code>SendAsync(request, ct)</code>.'
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
      body: '<p>The loop calls <code>GetTileAsync</code> and throws the task away. An exception inside such a task is never seen. You cannot tell when everything is ready. And if the semaphore also blocks (<code>Wait()</code>), every waiter holds a <b>whole thread</b>. A thousand ids and the thread pool is used up ("thread-pool starvation"): even unrelated tasks in the program start to lag.</p><p>The fix: return a <code>Task</code>, wait with <code>await</code>, and let an asynchronous <code>WaitAsync</code> inside the load enforce the "at most 4" limit.</p>',
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
      explain: 'The first, second and fourth are true. An ignored task does the opposite: it hides exceptions, which stay "unobserved".'
    }
  ]
};

/** Code review, unit 2, lesson 2: shared state and races (TileLoader). English version. */
export default {
  id: 'rv.u2.l2',
  title: 'Shared state and races',
  sub: 'GetOrAdd, counters, Dictionary and the stop flag',
  minutes: 12,
  cards: [
    {
      t: 'learn',
      title: 'One notebook for everyone',
      body: '<p>Imagine a single notebook shared by everybody. While one person writes a number, another is already reading that line, and a third is erasing the line next to it. The result is a mess. That is a <b>data race</b>: the outcome depends on who got there first.</p><p>The loader has four shared "notebooks": the task map <code>_loading</code>, the finished-tile map <code>_loaded</code>, the counter <code>_pending</code> and the flag <code>_stopRequested</code>. Each one is handled carelessly.</p><p>For example, a <code>Dictionary</code> is safe if it is only read. But reading while another thread writes is not allowed: you can get garbage or an exception.</p>'
    },
    {
      t: 'learn',
      title: 'GetOrAdd: "one value" does not mean "one factory call"',
      body: '<p><code>ConcurrentDictionary.GetOrAdd(key, factory)</code> guarantees that the dictionary ends up with <b>one</b> value for the key. But the factory is <b>not under a lock</b>. If two threads both miss the key at the same time, both call the factory. One result wins and the other is simply thrown away.</p><p>For a harmless factory ("create an object") that is fine. But our factory calls <code>LoadAsync</code>, which has <b>already started</b>: it took a semaphore spot, incremented <code>_pending</code> and went to the network. The discarded Task is not cancelled; it keeps running. The tile is downloaded twice.</p>',
      code: '// threads A and B ask for tile 7 at the same time\n// A: no key -> call factory -> LoadAsync(7) started\n// B: no key -> call factory -> LoadAsync(7) started\n// only A\'s task goes into the dictionary, but B\'s task is\n// downloading too and has incremented _pending as well',
      lang: 'csharp'
    },
    {
      t: 'choice',
      q: 'What is true about ConcurrentDictionary.GetOrAdd(key, valueFactory)?',
      options: [
        'There will be one value for the key, but valueFactory may run on several threads',
        'valueFactory runs under a lock, exactly once per key',
        'valueFactory is always called twice',
        'If the factory is slow, the dictionary blocks for all keys'
      ],
      answer: 0,
      explain: 'The documentation says it: the factory runs outside the dictionary\'s internal locks, so it can run in parallel, and only one value is stored. The other results are discarded.',
      wrong: { 1: 'That is exactly what GetOrAdd does not promise. If you need exactly one run, wrap the value in Lazy.' }
    },
    {
      t: 'learn',
      title: 'The fix: Lazy',
      body: '<p>Put a <b>recipe</b> in the dictionary instead of a running task: a <code>Lazy&lt;Task&lt;Tile&gt;&gt;</code>. You can create as many recipes as you like; they start nothing. The work starts on the first access to <code>.Value</code>, and by default <code>Lazy</code> guarantees the recipe runs once.</p>',
      code: 'private readonly ConcurrentDictionary<int, Lazy<Task<Tile>>> _loading =\n    new ConcurrentDictionary<int, Lazy<Task<Tile>>>();\n\npublic Task<Tile> GetTileAsync(int id, CancellationToken ct)\n{\n    return _loading.GetOrAdd(\n        id,\n        _ => new Lazy<Task<Tile>>(() => LoadAsync(id, ct))).Value;\n}',
      lang: 'csharp',
      deep: 'The default mode of <code>Lazy&lt;T&gt;</code> is <code>ExecutionAndPublication</code>: the factory runs once under a lock. But <code>.Value</code> starts <code>LoadAsync</code> right away on the caller\'s thread (until the first await), so the blocking <code>Wait()</code> from lesson 1 still has to go. One more detail: if the Lazy factory throws synchronously, in this mode the exception is cached and rethrown on every access.'
    },
    {
      t: 'blanks',
      q: 'Complete GetTileAsync so that each tile is loaded exactly once.',
      code: 'return _loading.GetOrAdd(\n    id,\n    _ => new ___<Task<Tile>>(() => LoadAsync(id, ct))).___;',
      tiles: ['Lazy', 'Value', 'Result', 'Task', 'Func'],
      answer: ['Lazy', 'Value'],
      explain: 'Lazy delays the start of LoadAsync until .Value is read and makes sure it starts once. The Lazy wrapper that lost the GetOrAdd race is never unwrapped, so it starts nothing.'
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: 'Find four races on shared state. Tap the lines, then press Check.',
      code: 'private readonly ConcurrentDictionary<int, Task<Tile>> _loading = new ConcurrentDictionary<int, Task<Tile>>();\nprivate readonly Dictionary<int, Tile> _loaded = new Dictionary<int, Tile>();\nprivate bool _stopRequested;\nprivate int _pending;\n\npublic Task<Tile> GetTileAsync(int id, CancellationToken ct)\n{\n    return _loading.GetOrAdd(id, _ => LoadAsync(id, ct));\n}\n\n// at the end of LoadAsync, after Release():\nif (--_pending == 0)\n    _allLoaded.SetResult(true);\n\npublic Tile TryGetLoaded(int id) =>\n    _loaded.TryGetValue(id, out var tile) ? tile : null;\n\nwhile (!_stopRequested) // background cache compaction loop\n{\n    Compact();\n    await Task.Delay(1000);\n}',
      bugs: [
        { lines: [11, 12], title: 'Non-atomic counter and SetResult', why: '--_pending loses updates under a race, and the count can hit zero between two tiles: waiters think everything is loaded. A second SetResult throws InvalidOperationException.' },
        { lines: [7], title: 'GetOrAdd with a side effect in the factory', why: 'The factory can run on two threads at once: the tile loads twice and _pending and the semaphore are touched twice. Use Lazy<Task<Tile>>.' },
        { lines: [14, 15, 1], title: 'Reading a Dictionary without a lock', why: 'Other threads write to _loaded under a lock, but this code reads without one. Reading during a write gives garbage or an exception.' },
        { lines: [2, 17], title: 'Stop flag without synchronization', why: 'A plain bool shared across threads gives no visibility guarantee. Stop through a CancellationToken (or at least volatile).' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:11', 'flag:7', 'flag:14', 'flag:2', 'check']
    },
    {
      t: 'learn',
      title: 'The counter that hit zero at the wrong time',
      body: '<p>A scenario. Tile A took a spot, raised <code>_pending</code> to 1, downloaded, dropped it to 0 and announced: "everything is loaded!". But tile B was still waiting in the semaphore queue and had not incremented yet. The announcement came <b>too early</b>.</p><p>When B finishes, the counter hits 0 again, and a second <code>SetResult</code> throws <code>InvalidOperationException</code>. That happens after <code>Release</code>, so a tile that loaded fine returns an error. The fix: count at the point where work <b>appears</b> (in <code>GetTileAsync</code>), use <code>Interlocked</code>, and complete with <code>TrySetResult</code>.</p>',
      deep: 'One more subtlety: a <code>TaskCompletionSource</code> created without <code>TaskCreationOptions.RunContinuationsAsynchronously</code> runs the waiters\' continuations <b>synchronously inside SetResult</b>. So foreign code after <code>await WhenAllLoaded()</code> starts running on the loading thread, inside our <code>LoadAsync</code> and possibly inside someone else\'s locks. That is why a TCS is almost always created with this flag.'
    },
    {
      t: 'order',
      q: 'Put in order the events that make the counter hit zero too early.',
      items: [
        'Tile A gets a semaphore spot, _pending becomes 1',
        'Tile B is already requested but waits in the semaphore queue and has not touched the counter',
        'Tile A finishes, _pending becomes 0, SetResult(true): "all done"',
        'Tile B gets a spot, _pending goes to 1 and back to 0, and the second SetResult throws'
      ],
      explain: 'The counter only counts loads that passed the semaphore, not loads that were already requested. So zero is possible while work still remains.'
    },
    {
      t: 'choice',
      q: 'Which fix for _pending and _allLoaded is the most reliable?',
      options: [
        'Interlocked.Increment when a tile is queued, Interlocked.Decrement in finally, complete with TrySetResult',
        'Replace --_pending with _pending -= 1',
        'Declare _pending volatile and keep --_pending',
        'Wrap SetResult in try/catch and swallow the exception'
      ],
      answer: 0,
      explain: 'You need three things together: count at the right moment (when work appears), do it atomically, and survive a repeated completion.',
      wrong: { 2: 'volatile gives visibility, not atomicity: --_pending is still a read, a subtract and a write.', 1: 'That is the same non-atomic code in different words.' }
    },
    {
      t: 'learn',
      title: 'A failed task stays in the dictionary',
      body: '<p>While a Task sits in <code>_loading</code>, every later <code>GetTileAsync(id)</code> receives <b>that same</b> Task. If it ended with an error (or was cancelled), it stays that way. The network drops for one second and the tile is now "broken" until restart: nobody retries.</p><p>Failed entries must be removed. Cache success, not failure.</p>',
      code: 'try\n{\n    return await DownloadAndParse(id, ct);\n}\ncatch\n{\n    _loading.TryRemove(id, out _); // allow a retry\n    throw;\n}',
      lang: 'csharp',
      deep: 'A subtlety: if the error happens synchronously, before <code>GetOrAdd</code> returns and the entry is in the dictionary, <code>TryRemove</code> does nothing, and the entry is added afterwards anyway. It is safer to remove in a continuation outside, once the task is already in the dictionary. Be careful with cancellation too: a task cancelled because of someone else\'s token must not stay in the cache forever either.'
    },
    {
      t: 'choice',
      q: 'The tile server answered 503 for tile 42, then recovered. The player requests tile 42 again. What does the loader from this lesson return?',
      options: [
        'The same failed Task: the error was cached',
        'A fresh, successful load',
        'null'
      ],
      answer: 0,
      explain: 'The dictionary stores a Task per key and never replaces it. Later calls get the same failed task until the entry is removed.'
    },
    {
      t: 'multi',
      q: 'Which of these is a data race in the loader?',
      options: [
        'Reading _loaded.Count in the timer while another thread writes under a lock',
        'Two threads calling GetOrAdd for different keys at the same time',
        'A bool _stopRequested written on one thread and read in another thread\'s loop',
        'Reading the id variable inside the factory lambda'
      ],
      answer: [0, 2],
      explain: 'The first and the third: shared data, one thread writes, the other has no synchronization. ConcurrentDictionary is designed to be thread-safe for different keys, and id is a local, immutable parameter.'
    }
  ]
};

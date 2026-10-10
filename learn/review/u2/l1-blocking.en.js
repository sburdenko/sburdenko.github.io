/** Code review, unit 2, lesson 1: blocking inside async (TileLoader). English version. */
export default {
  id: 'rv.u2.l1',
  title: 'Blocking inside async',
  sub: 'Wait, Sleep and the Unity context deadlock',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'A ticket office with four windows',
      body: '<p>A map tile loader downloads small pieces of a map. To avoid flooding the server, it lets at most <b>four</b> tiles download at once. Think of a ticket office with four windows: the fifth person waits until a window frees up.</p><p>In C# this "office" is a <code>SemaphoreSlim(4)</code>. You take a spot with <code>Wait</code> and give it back with <code>Release</code>. You are reviewing a method that uses it inside <code>async</code>. It has three problems at once.</p>'
    },
    {
      t: 'learn',
      title: 'async does not mean "on another thread"',
      body: '<p>An <code>async</code> method runs as <b>plain code</b> on the caller\'s thread, right up to the first <code>await</code> that has not already finished. Only there does the method step aside and release the thread.</p><p>So everything before the first <code>await</code>, including a blocking <code>Wait()</code>, runs on whichever thread called the method. If the method is called from a <code>GetOrAdd</code> factory, the factory runs on that same thread too.</p>',
      code: 'public Task<Tile> GetTileAsync(int id, CancellationToken ct)\n{\n    // the factory runs right here, on the caller\'s thread\n    return _loading.GetOrAdd(id, _ => LoadAsync(id, ct));\n}\n\nprivate async Task<Tile> LoadAsync(int id, CancellationToken ct)\n{\n    _throttle.Wait(); // still the caller\'s thread!\n    ...',
      lang: 'csharp'
    },
    {
      t: 'choice',
      q: 'Game code on the Unity main thread calls GetTileAsync(7, ct). All 4 semaphore spots are taken. Which thread will block in _throttle.Wait()?',
      options: ['The Unity main thread: it made the call', 'A thread-pool thread: async always moves to the pool', 'A new thread created by the semaphore'],
      answer: 0,
      explain: 'Until the first unfinished await, the method runs synchronously on the caller\'s thread. The GetOrAdd factory is also called synchronously. So Wait() blocks the main thread and the game freezes.',
      wrong: { 1: 'async by itself moves nothing to the pool. That is what Task.Run does.' }
    },
    {
      t: 'learn',
      title: 'The deadlock through the Unity context',
      body: '<p>The Unity main thread has its own <code>SynchronizationContext</code>. When an <code>await</code> runs there, it remembers that context. The continuation after the <code>await</code> is later posted through it <b>back to the main thread</b> and runs there during the frame processing.</p><p>Now the picture: four loads hold the spots, and their continuations (where <code>Release</code> lives) wait for the main thread. The main thread is stuck in <code>Wait()</code>, waiting for a spot to free up. Each waits for the other. That is a <b>deadlock</b>.</p>',
      deep: 'The context is captured only if <code>SynchronizationContext.Current</code> is not null where the <code>await</code> runs. In Unity that is the main thread. From a thread-pool thread the load would resume in the pool and there would be no deadlock (just wasted threads). That is why this bug is "sometimes there, sometimes not": it depends on who called.'
    },
    {
      t: 'order',
      q: 'Put the deadlock steps in order.',
      items: [
        'Four loads take all semaphore spots and wait for the network',
        'The main thread calls GetTileAsync and blocks in Wait(): no spots left',
        'A network reply arrives; the continuation (with Release) is queued to the main thread',
        'The main thread never drains its queue: it is blocked in Wait()',
        'Release never runs, no spot is freed, Wait never wakes up'
      ],
      explain: 'A closed loop: the main thread waits for Release, and only the main thread can run Release.'
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: 'Find three problems: a blocked thread, a spot that may never be released, and a needless thread stall. Tap the lines, then press Check.',
      code: 'private async Task<Tile> LoadAsync(int id, CancellationToken ct)\n{\n    _throttle.Wait();\n    Interlocked.Increment(ref _pending);\n\n    var bytes = await Http.GetByteArrayAsync($"https://cdn.example.com/tiles/{id}");\n    Thread.Sleep(50); // do not hammer the CDN\n    var tile = Tile.Parse(bytes);\n\n    lock (_sync)\n    {\n        _loaded[id] = tile;\n    }\n\n    _throttle.Release();\n\n    if (--_pending == 0)\n        _allLoaded.SetResult(true);\n\n    return tile;\n}',
      bugs: [
        { lines: [2], title: 'Synchronous Wait() in an async method', why: 'It blocks the calling thread. On the Unity main thread that freezes the game and deadlocks: the continuations that call Release are waiting for this very thread.' },
        { lines: [6], title: 'Thread.Sleep in an async method', why: 'It blocks the whole thread (and in the continuation that is the Unity main thread again). Use await Task.Delay(50, ct), which holds no thread.' },
        { lines: [14], title: 'Release outside try/finally', why: 'If the network or Parse throws, the code never reaches Release. After four such errors all spots are lost for good and every load hangs.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:2', 'flag:6', 'flag:14', 'check']
    },
    {
      t: 'learn',
      title: 'The spot nobody returned',
      body: '<p>Picture a cloakroom with 4 hooks. A person hangs a coat, trips on the way out and never comes back. That hook is taken <b>forever</b>. After four such people the cloakroom is closed to everyone.</p><p>That is <code>Release</code> without <code>finally</code>. One network error and a spot is gone. <code>_pending</code> is not decremented either, so <code>_allLoaded</code> never fires. A single failure shuts down the whole loader, and with no message in the log: loads just "hang".</p>',
      deep: 'One detail when fixing it: open the <code>try</code> <b>after</b> the spot is acquired. If <code>WaitAsync(ct)</code> throws <code>OperationCanceledException</code> (cancellation), the <code>finally</code> must not call <code>Release</code>: you never took a spot, and the semaphore count would grow above the original 4.'
    },
    {
      t: 'choice',
      q: 'The loader has no try/finally. Four loads in a row fail (the server returns errors). What happens to a fifth, perfectly healthy load?',
      options: ['It hangs waiting for a spot: all 4 spots are lost', 'It works; the semaphore recovers by itself', 'It throws immediately'],
      answer: 0,
      explain: 'A semaphore only remembers how many spots are free. A load that failed never returned its spot, and the semaphore does not know. After four losses there are zero free spots, permanently.',
      wrong: { 1: 'SemaphoreSlim does not track who took what. It cannot recover on its own.' }
    },
    {
      t: 'blanks',
      q: 'Build the correct "ticket office": it waits without blocking and returns the spot in every case.',
      code: 'await _throttle.___(ct);\ntry\n{\n    var bytes = await Http.GetByteArrayAsync(url);\n    await Task.___(50, ct);\n    return Tile.Parse(bytes);\n}\n___\n{\n    _throttle.___();\n}',
      tiles: ['WaitAsync', 'Delay', 'finally', 'Release', 'Wait', 'Sleep', 'catch'],
      answer: ['WaitAsync', 'Delay', 'finally', 'Release'],
      explain: 'WaitAsync holds no thread and Task.Delay does not block one. finally runs on success and on error, and the Release inside it returns the spot.'
    },
    {
      t: 'multi',
      q: 'What is true about ConfigureAwait(false) in this loader?',
      options: [
        'The continuation after await goes to the thread pool, not the Unity main thread',
        'The heavy Tile.Parse then no longer slows down frames',
        'Right after it you can safely touch Unity scene objects',
        'By itself it removes the blocking Wait()'
      ],
      answer: [0, 1],
      explain: 'ConfigureAwait(false) means "do not return to the captured context". Parsing leaves the main thread. But you must not call Unity API after it, and it does not cure Wait(), which runs before the first await.'
    },
    {
      t: 'match',
      q: 'Match the symptom to its cause.',
      pairs: [
        ['The game stutters for a second while the map loads', 'Thread.Sleep or Wait on the main thread'],
        ['After a few network errors no tiles load at all', 'Release is not in finally'],
        ['Loading hangs while the CPU sits idle', 'Deadlock: the continuation waits for the blocked main thread'],
        ['Thread-pool load grows with sleeps in a loop', 'A blocking pause instead of Task.Delay']
      ]
    }
  ]
};

/** Code review, unit 2, boss: full TileLoader listing. English version. */
export default {
  id: 'rv.u2.boss',
  title: "Final: the whole TileLoader",
  sub: "Find every bug in the tile loader",
  minutes: 14,
  boss: true,
  cards: [
    {
      t: 'learn',
      title: "The exit review",
      body: "<p>Here is the whole tile loader. You have seen it in pieces: blocking, races, timers and cancellation. Now find everything yourself. There are more than ten bugs, and they are linked: one hides another.</p><p>A hint on the order: first scan the <b>threads</b> (who runs which line), then the <b>shared data</b> (who writes and who reads), then the <b>lifetimes</b> (who holds a reference, who will stop what).</p>"
    },
    {
      t: 'rig',
      rig: 'hunt',
      task: "Find all bugs in TileLoader. Tap the problem lines, then press Check. There are 12 in total.",
      code: "public class TileLoader\n{\n    private static readonly HttpClient Http = new HttpClient();\n\n    private readonly ConcurrentDictionary<int, Task<Tile>> _loading = new ConcurrentDictionary<int, Task<Tile>>();\n    private readonly Dictionary<int, Tile> _loaded = new Dictionary<int, Tile>();\n    private readonly object _sync = new object();\n    private readonly SemaphoreSlim _throttle = new SemaphoreSlim(4);\n    private readonly TaskCompletionSource<bool> _allLoaded = new TaskCompletionSource<bool>();\n    private readonly Slider _progressBar;\n\n    private bool _stopRequested;\n    private int _pending;\n\n    public TileLoader(Slider progressBar)\n    {\n        _progressBar = progressBar;\n        var timer = new Timer(_ => ReportProgress(), null, 0, 1000);\n    }\n\n    public Task<Tile> GetTileAsync(int id, CancellationToken ct)\n    {\n        return _loading.GetOrAdd(id, _ => LoadAsync(id, ct));\n    }\n\n    private async Task<Tile> LoadAsync(int id, CancellationToken ct)\n    {\n        _throttle.Wait();\n        Interlocked.Increment(ref _pending);\n\n        var bytes = await Http.GetByteArrayAsync($\"https://cdn.example.com/tiles/{id}\");\n        Thread.Sleep(50); // do not hammer the CDN\n        var tile = Tile.Parse(bytes);\n\n        lock (_sync)\n        {\n            _loaded[id] = tile;\n        }\n\n        _throttle.Release();\n\n        if (--_pending == 0)\n            _allLoaded.SetResult(true);\n\n        return tile;\n    }\n\n    public void PreloadAll(IEnumerable<int> ids)\n    {\n        foreach (var id in ids)\n            GetTileAsync(id, CancellationToken.None);\n    }\n\n    public Task WhenAllLoaded() => _allLoaded.Task;\n\n    public Tile TryGetLoaded(int id) =>\n        _loaded.TryGetValue(id, out var tile) ? tile : null;\n\n    public void StartBackgroundCompaction()\n    {\n        Task.Factory.StartNew(async () =>\n        {\n            while (!_stopRequested)\n            {\n                Compact();\n                await Task.Delay(1000);\n            }\n        });\n    }\n\n    public void Stop() => _stopRequested = true;\n\n    private void Compact()\n    {\n        lock (_sync)\n        {\n            foreach (var id in _loaded.Keys.ToList())\n            {\n                if (_loaded[id].IsStale)\n                {\n                    _loaded.Remove(id);\n                    _loading.TryRemove(id, out _);\n                }\n            }\n        }\n    }\n\n    private void ReportProgress()\n    {\n        _progressBar.value = _loaded.Count;\n    }\n}",
      bugs: [
        { lines: [27], title: "Synchronous Wait() in an async method", why: "The GetOrAdd factory runs on the caller's thread. On the Unity main thread that means a freeze and a deadlock: Release sits in a continuation that Unity posts back to the same blocked thread. Use await _throttle.WaitAsync(ct)." },
        { lines: [39], title: "Release and counter outside try/finally", why: "Any network or Parse error leaves the spot taken. After four errors the semaphore is exhausted for good, and _pending is not decremented, so _allLoaded never fires." },
        { lines: [31], title: "Thread.Sleep in an async method", why: "It blocks a thread (after the await that is the Unity main thread again). Use await Task.Delay(50, ct). The continuations should also leave the main thread via ConfigureAwait(false)." },
        { lines: [30, 50], title: "The token is never used, and PreloadAll passes None", why: "GetByteArrayAsync is called without a token, and None disables cancellation entirely. Besides, the factory captures the first caller's token, so their cancellation hits everyone sharing the task." },
        { lines: [41, 42, 8], title: "Non-atomic counter and TCS", why: "--_pending loses updates, and zero is possible between tiles, so \"all loaded\" fires too early. A second SetResult throws. Use Interlocked, TrySetResult and RunContinuationsAsynchronously." },
        { lines: [22], title: "GetOrAdd starts LoadAsync in the factory", why: "The factory may run on two threads: the tile loads twice and the counter and semaphore are hit twice. Store a Lazy<Task<Tile>>." },
        { lines: [4], title: "Failed tasks stay in the cache forever", why: "A repeated GetTileAsync returns the same failed or cancelled Task, with no retry. Failed entries must be removed." },
        { lines: [55, 56, 89], title: "Reading _loaded without a lock", why: "Other threads write to the Dictionary under a lock, while TryGetLoaded and ReportProgress read it without one. A read during a write yields garbage or an exception." },
        { lines: [17], title: "Timer in a local variable", why: "Nothing references the timer, so the GC collects it and progress quietly stops. Also the callback runs on the pool and writes to the Slider: Unity API is main-thread only." },
        { lines: [60, 65], title: "StartNew(async) and Delay without a token", why: "You get a Task<Task> and loop exceptions are lost. Task.Delay(1000) is not interrupted by Stop(). Use Task.Run and a token." },
        { lines: [11, 62, 70], title: "Stop flag without synchronization", why: "A plain bool across threads gives no visibility guarantee, and Stop() does not wait for the loop to end. Use a CancellationTokenSource." },
        { lines: [47, 49], title: "PreloadAll: fire-and-forget", why: "The tasks are discarded: errors are invisible and nobody can wait. For thousands of ids every blocking Wait holds a thread and the pool starves. Return a Task instead." }
      ],
      goal: { min: 10, maxFalse: 3 },
      solve: ['flag:27', 'flag:39', 'flag:31', 'flag:30', 'flag:41', 'flag:22', 'flag:4', 'flag:55', 'flag:17', 'flag:60', 'flag:11', 'flag:47', 'check']
    },
    {
      t: 'choice',
      q: "When does the Wait() in LoadAsync cause a deadlock?",
      options: [
        "GetTileAsync is called from the Unity main thread while all 4 spots are taken",
        "Only if the call comes from a thread-pool thread",
        "Only if the tile server is unreachable",
        "On any call, even when spots are free"
      ],
      answer: 0,
      explain: "Both conditions are needed: Wait() really blocks (no free spots) and it blocks the main thread that Unity wants to return the Release continuations to. While spots are free, Wait passes instantly.",
      wrong: { 3: "With a free spot Wait() returns at once; nothing blocks." }
    },
    {
      t: 'multi',
      q: "Which changes in LoadAsync are actually needed?",
      options: [
        "await _throttle.WaitAsync(ct) instead of Wait()",
        "Release and the counter decrement in finally",
        "Replace lock (_sync) with a Mutex",
        "await Task.Delay(50, ct) instead of Thread.Sleep(50)"
      ],
      answer: [0, 1, 3],
      explain: "The lock around the dictionary write is fine here and short. A Mutex is heavier, thread-affine and fixes nothing. The other three changes remove the blocking and the lost spot."
    },
    {
      t: 'blanks',
      q: "Replace the stop flag with a token: complete the background loop.",
      code: 'private readonly CancellationTokenSource _cts = new ___();\n\npublic void StartBackgroundCompaction()\n{\n    Task.___(async () =>\n    {\n        while (!_cts.Token.IsCancellationRequested)\n        {\n            Compact();\n            await Task.Delay(1000, _cts.Token);\n        }\n    });\n}\n\npublic void Stop() => _cts.___();',
      tiles: ['CancellationTokenSource', 'Run', 'Cancel', 'StartNew', 'Dispose'],
      answer: ['CancellationTokenSource', 'Run', 'Cancel'],
      explain: "Task.Run unwraps the async lambda, and Cancel signals both the loop and the Delay. Task.Delay throws on cancellation, so in real code you catch OperationCanceledException."
    },
    {
      t: 'order',
      q: "Put the correct LoadAsync outline in order.",
      items: [
        "await _throttle.WaitAsync(ct): wait for a spot without blocking",
        "try {",
        "Download and parse the tile, passing ct",
        "Write the result into _loaded under a lock",
        "} finally { Release; Interlocked.Decrement }"
      ],
      explain: "Take the spot before the try (otherwise a cancelled wait would release a spot we never took) and give it back in finally in every case."
    },
    {
      t: 'match',
      q: "Match each bug to its consequence.",
      pairs: [
        ["Release outside finally", "After four errors every load hangs"],
        ["Timer in a local variable", "Progress freezes after a random time"],
        ["StartNew(async) without Unwrap", "Errors in the background loop are lost"],
        ["GetOrAdd starting work in the factory", "The tile loads twice"],
        ["A repeated SetResult", "InvalidOperationException inside LoadAsync"]
      ]
    },
    {
      t: 'choice',
      q: "A player reports: after a few network failures the map stops loading even though the network is back, and the game does not lag. What is the most likely cause?",
      options: [
        "The semaphore spot is not returned on error (no finally)",
        "The Timer was collected by the GC",
        "Thread.Sleep freezes the main thread",
        "ConfigureAwait(false) is missing"
      ],
      answer: 0,
      explain: "The symptom \"quietly stopped loading after errors, no lag\" is an exhausted semaphore. A frozen main thread would show as lag, and a collected Timer would only affect the progress bar."
    }
  ]
};

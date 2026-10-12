/** Async/await to the bottom, unit "Synchronization in depth", lesson 5: double-checked locking, Lazy<T> and concurrent collections. */
export default {
  id: 'as.u8.l5',
  title: 'Lazy and concurrent collections',
  sub: 'Double-checked locking, Lazy<T> modes, ConcurrentDictionary.GetOrAdd',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Double-checked locking',
      body: '<p>The object is expensive, it must be created once, and it is read all the time. Taking a <code>lock</code> on every read feels wasteful. Hence <b>double-checked locking</b>:</p><ul><li>the first check is without a lock: the object exists — return it right away;</li><li>it does not — take the lock and check <b>again</b>: while we waited for the lock, another thread may have created the object.</li></ul><p>Does this work without <code>volatile</code>? Under the general ECMA spec — no. In CoreCLR — yes: storing an object reference is a release, and a read through a reference honors data dependency (lesson 1). But only if the object is fully ready <b>before</b> the reference is written to the field.</p>',
      code: 'private static Settings? _inst;\nprivate static readonly object _gate = new();\n\npublic static Settings Instance\n{\n    get\n    {\n        if (_inst == null)                 // 1: without the lock\n        {\n            lock (_gate)\n            {\n                if (_inst == null)         // 2: under the lock\n                    _inst = Settings.Load();\n            }\n        }\n        return _inst;\n    }\n}',
      deep: '<p>For a singleton you usually need no double check at all. <code>static readonly Settings Instance = Settings.Load();</code> — and the CLR itself guarantees the type initializer runs exactly once, under its own internal lock. The price is less control over when creation happens: without a static constructor the type is marked <code>beforefieldinit</code>, and initialization may happen before the first access.</p>'
    },
    {
      t: 'tapline',
      q: 'Another thread sometimes gets Settings with empty fields. Which line lets the object out before it is ready?',
      code: 'if (_inst == null)\n{\n    lock (_gate)\n    {\n        if (_inst == null)\n        {\n            _inst = new Settings();\n            _inst.LoadFromDisk();\n        }\n    }\n}\nreturn _inst;',
      answer: 6,
      explain: 'After this line the field is no longer null, and the first check in another thread lets it past the lock — to an object that is not loaded yet. Create and set up the object in a local variable, and write it to the field as the very last step.'
    },
    {
      t: 'learn',
      title: 'Lazy<T>: double-checked locking written for you',
      body: '<p><code>Lazy&lt;T&gt;</code> stores a factory and calls it on the first access to <code>Value</code>. How it behaves under contention is set by <code>LazyThreadSafetyMode</code>:</p><ul><li><b>ExecutionAndPublication</b> (the default) — the factory runs under a lock, <b>exactly once</b>, other threads wait for the result;</li><li><b>PublicationOnly</b> — no lock: several threads may run the factory at the same time, the first finished result lands in the field (via CompareExchange), the rest are thrown away;</li><li><b>None</b> — no synchronization, for single-threaded objects. The fastest.</li></ul>',
      code: 'private static readonly Lazy<Settings> _settings =\n    new(() => Settings.Load());                          // ExecutionAndPublication\n\nprivate static readonly Lazy<Parser> _parser =\n    new(() => new Parser(), LazyThreadSafetyMode.PublicationOnly);\n\npublic static Settings Settings => _settings.Value;'
    },
    {
      t: 'match',
      q: 'Match the lazy initialization option with its behavior',
      pairs: [
        ['ExecutionAndPublication', 'Factory under a lock, exactly one run'],
        ['PublicationOnly', 'The factory may run several times, the first result wins'],
        ['LazyThreadSafetyMode.None', 'No synchronization — single thread only'],
        ['LazyInitializer.EnsureInitialized', 'No Lazy object: a field and CompareExchange']
      ]
    },
    {
      t: 'learn',
      title: 'Exceptions in the factory and LazyInitializer',
      body: '<p>A non-obvious behavior: if the factory throws in <b>ExecutionAndPublication</b> mode (or None), <code>Lazy</code> <b>remembers</b> the exception. Every later access to <code>Value</code> throws the same exception, and the factory is never called again. A network glitch at startup — and the object is "broken" until restart.</p><p>In <b>PublicationOnly</b> mode exceptions are not cached: the next access tries again.</p><p>If you do not want a separate <code>Lazy</code> object per field, there is <code>LazyInitializer.EnsureInitialized(ref field, factory)</code>. Without an explicit lock it behaves like PublicationOnly: it checks the field for null and publishes the result via CompareExchange — just like the code from the Interlocked lesson.</p>',
      code: 'private Report? _report;\n\npublic Report Report =>\n    LazyInitializer.EnsureInitialized(ref _report, () => BuildReport());'
    },
    {
      t: 'choice',
      q: 'A Lazy<HttpConfig> in the default mode. On the first Value the factory threw HttpRequestException: the network was down. A minute later the network is up. What does the next Value access give?',
      options: ['The same HttpRequestException: the exception is cached', 'The factory runs again and returns the config', 'null', 'InvalidOperationException: the Lazy is in a faulted state'],
      answer: 0,
      explain: 'ExecutionAndPublication caches the factory exception forever. If the failure can be transient — use PublicationOnly, your own retry code, or recreate the Lazy.',
      wrong: { 1: 'Only PublicationOnly behaves like that. The default mode remembers the exception.' }
    },
    {
      t: 'learn',
      title: 'ConcurrentDictionary inside out',
      body: '<p><code>ConcurrentDictionary</code> is not a regular dictionary under a single <code>lock</code>.</p><ul><li><b>Reads</b> (<code>TryGetValue</code>, the indexer) take <b>no locks</b>: buckets are published so that a reader always sees a consistent state.</li><li><b>Writes</b> take only the lock of their stripe (striped locking): an array of locks, each covering part of the buckets. Writers in different stripes do not interfere.</li><li>Operations over the <b>whole</b> dictionary — <code>Count</code>, <code>Keys</code>, <code>Values</code>, <code>ToArray</code> — take <b>all</b> locks at once. Calling them in a hot loop means stopping every writer.</li><li>A <code>foreach</code> is safe during concurrent changes, but it is not a snapshot: you may see some of the changes made during the enumeration.</li></ul>'
    },
    {
      t: 'learn',
      title: 'GetOrAdd and a factory that runs several times',
      body: '<p><code>GetOrAdd(key, factory)</code> looks atomic, but the dictionary calls the factory <b>outside the lock</b> — so that slow or reentrant foreign code does not hold a stripe. Therefore:</p><ul><li>several threads that miss the key at the same time <b>will all run the factory</b>;</li><li>one value ends up in the dictionary, and <b>everyone</b> gets exactly that one;</li><li>the other created values are simply thrown away — without <code>Dispose</code>.</li></ul><p>For a cheap factory it does not matter. For an expensive one or one with side effects (a connection, a file, a paid request) you store not the value but a <code>Lazy&lt;T&gt;</code>. Extra <code>Lazy</code> objects cost next to nothing, and the factory inside the winning one runs once.</p>',
      code: 'var cache = new ConcurrentDictionary<string, Connection>();\n\n// 10 threads at once — the factory may run up to 10 times\nvar c = cache.GetOrAdd("db", key => Connection.Open(key));',
      deep: '<p>Same with <code>AddOrUpdate</code>: the dictionary also calls the update function outside the lock and repeats it on a race — it is a CAS loop over the value. So it must not contain side effects. There are <code>GetOrAdd&lt;TArg&gt;(key, factory, arg)</code> overloads: the argument is passed explicitly, the lambda captures nothing — no closure allocation per call.</p>'
    },
    {
      t: 'choice',
      q: '10 threads call GetOrAdd with the same new key at the same time. What is true?',
      options: ['The factory may run 1 to 10 times, but all threads get the same value', 'The factory runs exactly once: GetOrAdd is atomic', 'Each thread gets its own value, the dictionary keeps the last one', 'Nine threads get an exception: the key was already added'],
      answer: 0,
      explain: 'The factory is outside the lock, so its runs are not limited. The insertion is under the stripe lock: the first insertion wins, the other threads see the key on the re-check and return the winner\'s value.'
    },
    {
      t: 'blanks',
      q: 'Make the expensive connection open only once per key',
      code: 'var cache = new ConcurrentDictionary<string, Lazy<Connection>>();\n\nvar conn = cache\n    .GetOrAdd(key, k => new ___<Connection>(() => Connection.Open(k)))\n    .___;',
      tiles: ['Lazy', 'Value', 'Task', 'Result', 'Func'],
      answer: ['Lazy', 'Value'],
      explain: 'Several threads may each create a Lazy object, but only one ends up in the dictionary, and everyone calls Value on it. The default ExecutionAndPublication mode guarantees a single Connection.Open. Remember the exception cache: a failed open stays in the dictionary — remove it with TryRemove.'
    },
    {
      t: 'learn',
      title: 'The other collections and the check-then-act trap',
      body: '<ul><li><b>ConcurrentQueue</b> — no locks on the common path, array segments; the best choice for FIFO between threads.</li><li><b>ConcurrentStack</b> — a linked list on a CAS loop, like the stack from the Interlocked lesson.</li><li><b>ConcurrentBag</b> — each thread has its own list; it pays off when the same thread both adds and takes. As a general-purpose queue it is slower than ConcurrentQueue.</li><li><b>BlockingCollection</b> — a blocking wrapper with a bounded capacity. In async code <code>Channel</code> replaces it.</li></ul><p>The main trap: <b>each operation</b> is thread-safe, but their combination is not. <code>if (!d.ContainsKey(k)) d[k] = v;</code> — another thread gets in between the check and the write. You need one operation: <code>TryAdd</code>, <code>GetOrAdd</code>, <code>AddOrUpdate</code>, <code>TryRemove</code>, <code>TryUpdate</code>.</p>'
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['Reading from a ConcurrentDictionary takes no locks', 'Count on a ConcurrentDictionary is cheap: it reads one field', 'Lazy in the default mode remembers the factory exception', 'The GetOrAdd factory is called under the stripe lock', 'ContainsKey followed by the indexer is not atomic, even on a ConcurrentDictionary'],
      answer: [0, 2, 4],
      explain: 'Count takes all the dictionary locks. The dictionary calls the GetOrAdd factory outside the lock on purpose, so it may run several times. Only a single operation is atomic, not a sequence of them.'
    }
  ]
};

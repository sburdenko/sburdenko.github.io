/** Memory in .NET, unit 2, lesson 3: hunting a leak — snapshots, comparison, the path to a root, the usual culprits. */
export default {
  id: 'mem.u2.l3',
  title: 'Hunting a leak',
  sub: 'Two snapshots, the difference and the path to a root',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'The method: two snapshots and a diff',
      body: '<p>A leak in .NET is not "forgot to free" but "someone still holds a reference". The GC will not collect an object while there is a path to it from a root. The job is to find <b>what grows</b> and <b>who holds it</b>.</p><ul><li>Make sure it is a leak: the floor of the sawtooth rises under steady load (lesson 1).</li><li>Warm the service up so caches and the JIT have done their work, and take <b>snapshot A</b>.</li><li>Run a known number of operations: say, 1000 requests.</li><li>Take <b>snapshot B</b> and compare it with A.</li><li>Pick a type whose instance count grew by about 1000 or a multiple of it, and find the path from a root to any of its instances.</li></ul>',
      deep: 'Pick a round, noticeable number of operations so the growth is recognizable: +1000 objects for 1000 requests is clearly "one per request". A dotnet-gcdump snapshot performs a full collection itself, so garbage does not get into the diff. A full dump keeps the garbage, so in dotnet-dump count with dumpheap -stat -live — reachable objects only.'
    },
    {
      t: 'order',
      q: 'Put the steps of a leak hunt in order',
      items: [
        'See in the counters that the heap after full collections keeps growing',
        'Warm the service up and take the first snapshot',
        'Run 1000 identical requests',
        'Take the second snapshot and compare it with the first',
        'For the type that grew, find the path to a root',
        'Fix it and repeat the same snapshots'
      ],
      explain: 'First you confirm the problem, then you get a diff under a known load, then you look for who holds it. The last step is the same measurement after the fix: the growth should be gone.'
    },
    {
      t: 'learn',
      title: 'How to read a diff',
      body: '<p>In a snapshot comparison (Visual Studio, PerfView) every type has a growth in instance count and in size.</p><ul><li>Look at the <b>count</b>, not only the size. At the top by size there are almost always <code>string</code> and <code>byte[]</code> — they are leaves; something holds them.</li><li>Look for <b>your own types</b>: <code>OrderSnapshot</code>, <code>Session</code>, <code>ViewModel</code>. They are closer to the cause than the strings inside them.</li><li>Tell an object’s <b>own</b> size (exclusive) from its <b>retained</b> size (inclusive) — everything that would die along with it. A small dictionary can retain a gigabyte.</li></ul>',
      deep: 'Retained size is computed from the dominator tree: object X dominates Y if every path from the roots to Y goes through X. PerfView and Visual Studio build this tree approximately — the heap graph is reduced to a spanning tree, and an object reachable by two paths has its size attributed to one of them. That is why "inclusive" can differ between tools.'
    },
    {
      t: 'choice',
      q: 'After 1000 requests the snapshot diff is: +1000 OrderSnapshot, +3000 string, +1000 byte[], and one List<OrderSnapshot> grew. Where do you start?',
      options: [
        'With OrderSnapshot: find the path to a root and see whose list it is',
        'With string: there are the most of them',
        'With byte[]: the arrays take the most space',
        'Nowhere: 1000 objects is just warm-up'
      ],
      answer: 0,
      explain: 'The strings and arrays are most likely fields of OrderSnapshot: three strings and an array per order snapshot. Your own type growing by exactly one per request plus a growing list is direct evidence. Warm-up was done before the first snapshot.'
    },
    {
      t: 'learn',
      title: 'Roots and the retention path',
      body: '<p>Roots (GC roots) are where the collector starts its walk:</p><ul><li><b>static fields</b> — alive as long as their type, usually the whole life of the process;</li><li><b>local variables and arguments</b> on thread stacks that will still be used;</li><li><b>GC handles</b>: strong, pinned — created by <code>GCHandle.Alloc</code>, the runtime and libraries;</li><li><b>the finalization queue</b> — objects waiting for a finalizer are temporarily alive.</li></ul><p>The <b>retention path</b> is the chain of references from a root to the object. <code>gcroot</code> in dotnet-dump and the paths view in Visual Studio and PerfView give it to you. Read top to bottom and look for a link that should not be there.</p>',
      deep: 'An event subscription is a reference from the publisher to the subscriber: the delegate stores in its _target field the object whose method will be called. So a long-lived publisher holds everyone who subscribed and never unsubscribed. System.Threading.Timer is a special case: the runtime’s timer queue holds the callback, but not the Timer object itself. If nothing references the Timer, it gets collected and stops; the leaking timer is one kept in a long-lived place and never stopped. An async method awaiting a task that never completes holds its state machine through that task’s continuation.'
    },
    {
      t: 'tapline',
      q: 'The OrderWindow was closed long ago, but gcroot shows it is alive. Which link should not be there?',
      code: 'HandleTable:\n    000001F2A0011388 (pinned handle)\n    -> 000001F2B4C01000 System.Object[]\n    -> 000001F2B4C2A3D0 MyApp.PriceFeed\n    -> 000001F2B4C2A460 System.EventHandler<MyApp.PriceChangedEventArgs>\n    -> 000001F2B4D88E10 MyApp.Views.OrderWindow\n    -> 000001F2B4D99000 MyApp.Views.OrderViewModel',
      answer: 4,
      explain: 'PriceFeed is a long-lived service; it is supposed to live. But its event holds a delegate, and the delegate holds the closed window: the window subscribed to PriceChanged and did not unsubscribe on close. The fix is to unsubscribe in Closed or Dispose.'
    },
    {
      t: 'learn',
      title: 'The usual culprits',
      body: '<ul><li><b>Events.</b> A short-lived object subscribed to an event of a long-lived one and never unsubscribed.</li><li><b>Static collections and caches without eviction.</b> A <code>static Dictionary</code> as a "cache" that is only ever added to. Or a <code>MemoryCache</code> without a <code>SizeLimit</code> and expirations.</li><li><b>Timers.</b> A timer in a long-lived object that nobody stopped: it holds the callback, and the callback holds <code>this</code>.</li><li><b>Closures.</b> A lambda stored for a long time holds everything it captured — sometimes the whole object via <code>this</code>.</li><li><b>Registrations on a long-lived token.</b> <code>token.Register(...)</code> on an application-wide token without disposing the registration.</li></ul>',
      deep: 'A closure captures variables, not values, and the compiler puts all captured variables of a method into one closure object. If two lambdas in a method captured different variables and one of them lives long, it holds both. Another old source is thread-local data ([ThreadStatic], ThreadLocal<T>) on thread-pool threads: the threads live long, and the data lives with them.'
    },
    {
      t: 'multi',
      q: 'Which of these causes a leak in a long-running service? Select all.',
      options: [
        'static readonly Dictionary<string, Report> Cache that is only ever added to',
        'A request handler subscribes to an event of a singleton service and never unsubscribes',
        'A local List<T> inside a method, filled with a million items',
        'Every request adds a lambda that captured this to a static List<Action>',
        'An array rented from ArrayPool and given back with Return'
      ],
      answer: [0, 1, 3],
      explain: 'The static dictionary, the singleton’s event and the static callback list outlive the request and hold everything they reference: a lambda with this holds the whole handler. The local list dies when the method returns, and the pooled array went back to the pool — that is reuse, not a leak.'
    },
    {
      t: 'learn',
      title: 'Less obvious culprits',
      body: '<ul><li><b>A stuck finalizer thread.</b> Finalizers run on a single thread. If someone’s finalizer waits on a lock or goes to the network, the queue grows, and objects with finalizers — and everything they hold — are not freed. The sign: <code>finalizequeue</code> shows thousands of objects ready for finalization.</li><li><b>Fragmentation.</b> Few live objects, but a big heap: buffers pinned for a long time prevent compaction. Look at <code>FragmentedBytes</code> and <code>gchandles</code>.</li><li><b>Native memory behind small wrappers</b> — lesson 1.</li></ul>',
      deep: 'You can see the finalizer thread in a dump: clrthreads shows it marked Finalizer, and clrstack for it shows where it is stuck. Finalizers must not block, and resources are better released through Dispose than left to a finalizer. Long pinning is a typical trace of old code with fixed or GCHandle.Alloc(..., Pinned) held for the whole run; for long-lived buffers .NET 5+ has the POH: GC.AllocateArray<T>(n, pinned: true).'
    },
    {
      t: 'choice',
      q: 'The heap grows. In a dump, finalizequeue shows 400,000 objects ready for finalization, and the finalizer thread’s stack is sitting in Monitor.Enter. What is going on?',
      options: [
        'Some finalizer is waiting on a lock, and the whole finalization queue is stuck',
        'The garbage collector is turned off',
        'The objects have too many fields',
        'This is expected: finalizers always run at process exit'
      ],
      answer: 0,
      explain: 'There is one finalizer thread. While it waits on a lock, new objects pile up in the queue and stay alive with everything they hold. The fix is to remove the lock from the finalizer and release resources through Dispose.'
    },
    {
      t: 'learn',
      title: 'Fixed it? Prove it',
      body: '<p>After the fix, repeat the same measurement: warm-up, snapshot, 1000 requests, snapshot. The growth of your type should drop to zero.</p><p>To keep the leak from coming back, write a test. Create the object in a separate method, hand back a <b>weak reference</b> (WeakReference), run a collection and check that the object is dead.</p><p>The separate method with <code>NoInlining</code> matters: in a Debug build the JIT extends the lifetime of locals to the end of the method, and an object created in the test itself may survive the collection.</p>',
      code: '[MethodImpl(MethodImplOptions.NoInlining)]\nstatic WeakReference OpenAndClose(PriceFeed feed)\n{\n    var w = new OrderWindow(feed);\n    w.Close();\n    return new WeakReference(w);\n}',
      deep: 'Put GC.WaitForPendingFinalizers() between two GC.Collect() calls: the first collection finds the garbage, the finalizers run, the second removes what finalizable objects were holding. Do not run such tests in parallel with others that allocate heavily — the result gets flaky. There are libraries with memory assertions too, but their mechanism is the same.'
    },
    {
      t: 'blanks',
      q: 'Finish the test: a closed window must not stay in memory',
      code: 'var wr = OpenAndClose(feed);\nGC.___();\nGC.WaitForPendingFinalizers();\nGC.Collect();\nAssert.False(wr.___);',
      tiles: ['Collect', 'IsAlive', 'Target', 'KeepAlive', 'SuppressFinalize'],
      answer: ['Collect', 'IsAlive'],
      explain: 'A collection, waiting for finalizers, another collection — then check IsAlive. Target would return the object itself, while Assert.False expects a bool. KeepAlive would do the opposite and extend the object’s life.'
    }
  ]
};

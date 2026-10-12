/** Async/await to the bottom, unit "Synchronization in depth", lesson 4: hybrid locks — Monitor, Lock, the Slim primitives. */
export default {
  id: 'as.u8.l4',
  title: 'Hybrid locks',
  sub: 'Monitor inside out, Wait/Pulse, the Lock type in .NET 9 and the Slim family',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'The best of spinning and of the kernel',
      body: '<p>Pure spinning burns the CPU, a kernel object is expensive even without contention. A <b>hybrid</b> lock takes the best of both and goes through three stages:</p><ul><li><b>the fast path</b>: the lock is free — one atomic CompareExchange and you are in. No kernel, no allocations, tens of nanoseconds;</li><li><b>a short spin</b>: the lock is taken — spin a little, maybe the owner is about to leave;</li><li><b>sleep</b>: did not make it — sleep on a kernel object until the owner wakes you on exit.</li></ul><p>That is how <code>lock</code> (<code>Monitor</code>), the new <code>Lock</code>, <code>SemaphoreSlim</code>, <code>ManualResetEventSlim</code> and <code>ReaderWriterLockSlim</code> work. The Slim suffix means exactly this: a lightweight hybrid version with no kernel handle on the fast path.</p>'
    },
    {
      t: 'learn',
      title: 'Monitor inside out',
      body: '<p>Where does <code>lock (obj)</code> keep its state? In the <b>object header</b> — the word in front of the type pointer. While there is no contention it holds a "thin lock": the owner thread\'s id and a recursion count. Taking it is one CAS on the header.</p><p>When a second thread finds the lock taken, it spins a little. If that does not help, the lock <b>inflates</b>: the CLR creates a <b>sync block</b> for the object — an entry in a separate table with a queue of waiters and a kernel event to sleep on. The sync block index is written into the header.</p><p>The compiler expands the statement itself like this (since C# 4):</p>',
      code: 'bool lockTaken = false;\ntry\n{\n    Monitor.Enter(_gate, ref lockTaken);\n    // the lock body\n}\nfinally\n{\n    if (lockTaken) Monitor.Exit(_gate);\n}',
      deep: '<p>The header is small, and the thin lock shares it with the default hash code. If the non-overridden <code>GetHashCode</code> was already called on the object, the hash sits in the header and <code>lock</code> goes straight through a sync block — and vice versa. That is why sync blocks exist at all: they hold whatever did not fit — the hash, the lock, COM interop data.</p><p>A sync block lives as long as the object. Hence the advice to lock on a dedicated private object: foreign code that does <code>lock</code> on your <code>this</code> or on <code>typeof(...)</code> shares the very same lock with you.</p>'
    },
    {
      t: 'choice',
      q: 'Why does Monitor.Enter take a ref bool lockTaken parameter, when people used to write just Monitor.Enter(obj) before try?',
      options: ['An exception could hit between taking the lock and entering try, and the lock would stay taken forever', 'So that Enter can return false on a timeout', 'To make lock reentrant', 'So that the JIT does not hoist Enter out of a loop'],
      answer: 0,
      explain: 'In .NET Framework an asynchronous exception (ThreadAbortException) could arrive between Enter and try. The lock is taken, and finally never runs. With lockTaken, Enter itself is inside try, and finally knows for sure whether to release. TryEnter is for timeouts, and Monitor is reentrant anyway.'
    },
    {
      t: 'learn',
      title: 'Wait and Pulse: waiting for a condition under a lock',
      body: '<p><code>Monitor</code> is not just a lock but also a <b>condition variable</b>. A thread under the lock sees it is too early to continue (the queue is empty) and calls <code>Monitor.Wait</code>. That atomically <b>releases the lock</b> and puts the thread to sleep in the object\'s waiting queue.</p><p>Another thread takes the lock, changes the state and calls <code>Pulse</code> — moving one waiter to the ready queue (<code>PulseAll</code> moves all). The woken thread re-acquires the lock and only then returns from <code>Wait</code>.</p><p>Both methods may be called <b>only while holding the lock</b> on that object, otherwise you get <code>SynchronizationLockException</code>.</p>',
      code: 'class SimpleQueue<T>\n{\n    private readonly Queue<T> _items = new();\n    private readonly object _gate = new();\n\n    public void Put(T item)\n    {\n        lock (_gate)\n        {\n            _items.Enqueue(item);\n            Monitor.Pulse(_gate);        // wake one waiter\n        }\n    }\n\n    public T Take()\n    {\n        lock (_gate)\n        {\n            while (_items.Count == 0)\n                Monitor.Wait(_gate);     // release the lock and sleep\n            return _items.Dequeue();\n        }\n    }\n}'
    },
    {
      t: 'order',
      q: 'Put the events in order: a consumer waits, a producer adds an item',
      items: ['The consumer takes the lock and sees an empty queue', 'Wait releases the lock, the consumer falls asleep', 'The producer takes the lock and adds an item', 'Pulse moves the consumer to the ready queue', 'The producer leaves the lock', 'The consumer re-acquires the lock and re-checks the condition'],
      explain: 'Pulse does not hand over the lock by itself: the consumer really wakes only when the producer leaves the lock. And between these moments a third thread can grab the lock.'
    },
    {
      t: 'tapline',
      q: 'Two consumers. Sometimes Dequeue throws InvalidOperationException: the queue is empty. Which line is to blame?',
      code: 'public T Take()\n{\n    lock (_gate)\n    {\n        if (_items.Count == 0)\n            Monitor.Wait(_gate);\n        return _items.Dequeue();\n    }\n}',
      answer: 4,
      explain: 'Between Pulse and re-acquiring the lock, the second consumer can walk into the lock "from the street" and take the item. The first one wakes up, no longer checks the condition and reaches into an empty queue. The condition after Wait is always re-checked in a while loop.'
    },
    {
      t: 'learn',
      title: 'The Lock type in .NET 9',
      body: '<p>Since .NET 9 and C# 13 there is a dedicated <code>System.Threading.Lock</code> type. The lock state lives in the fields of the <code>Lock</code> object itself, not in the header of an arbitrary object and not in the sync block table. The docs recommend it for new locks as the fastest option.</p><p>The compiler recognizes the type: <code>lock</code> on a <code>Lock</code> becomes not <code>Monitor.Enter</code> but <code>using (_gate.EnterScope())</code>. <code>EnterScope</code> returns a <code>ref struct</code> whose <code>Dispose</code> releases the lock.</p><p>The catch: cast the <code>Lock</code> to <code>object</code> — and <code>lock</code> silently becomes the old header-based Monitor. The compiler warns: <b>CS9216</b>. And <code>Lock</code> has no <code>Wait</code>/<code>Pulse</code>: for condition variables you still need <code>Monitor</code>.</p>',
      code: 'private readonly Lock _gate = new();\n\npublic void Add(int x)\n{\n    lock (_gate)          // the compiler calls _gate.EnterScope()\n    {\n        _sum += x;\n    }\n}\n\nobject o = _gate;\nlock (o) { }              // CS9216: this is Monitor again'
    },
    {
      t: 'blanks',
      q: 'Write what the C# 13 compiler turns a lock on the new type into',
      code: 'private readonly ___ _gate = new();\n\npublic void Add(int x)\n{\n    using (_gate.___())\n    {\n        _sum += x;\n    }\n}',
      tiles: ['Lock', 'EnterScope', 'object', 'Enter', 'SpinLock', 'Monitor'],
      answer: ['Lock', 'EnterScope'],
      explain: 'EnterScope takes the lock and returns a Scope struct, and using guarantees its Dispose — leaving the lock — even on an exception. With a field of type object the compiler would generate Monitor.Enter/Exit.'
    },
    {
      t: 'learn',
      title: 'The Slim family and ReaderWriterLockSlim',
      body: '<ul><li><b>SemaphoreSlim</b> — a user-mode counter. You know the main thing from the pitfalls unit: it has <code>WaitAsync</code>, and it is not tied to a thread.</li><li><b>ManualResetEventSlim</b> — spins first, then waits through <code>Monitor</code>. It creates a real kernel event only if you ask for the <code>WaitHandle</code> property.</li><li><b>ReaderWriterLockSlim</b> — many readers <b>or</b> one writer. There is an "upgradeable read" mode: you read and, if needed, upgrade the lock to a write. While a writer is waiting, new readers are held back — so the writer does not starve.</li></ul><p>ReaderWriterLockSlim has <b>its own cost</b> for all that: tracking readers is more expensive than a plain <code>lock</code>. It wins only when reads vastly outnumber writes and each read takes noticeably longer than entering the lock.</p>',
      deep: '<p>By default ReaderWriterLockSlim is created with <code>LockRecursionPolicy.NoRecursion</code>: re-entering on the same thread throws <code>LockRecursionException</code>. Only one thread at a time may hold an upgradeable read — otherwise two "upgrading" readers would wait for each other. The object is <code>IDisposable</code>.</p><p>The old <code>ReaderWriterLock</code> from .NET Framework 1.x is slower and has known problems — new code does not need it. All Slim primitives, like <code>Monitor</code>, work only inside one process.</p>'
    },
    {
      t: 'choice',
      q: 'A reference data cache: 99% of calls are a 100 ns dictionary lookup, reloads are rare. What does replacing lock with ReaderWriterLockSlim give you?',
      options: ['Most likely nothing, or a slowdown: tracking readers costs about as much as the read itself', 'A speedup by the number of cores: readers do not get in each other\'s way', 'A deadlock on the first reload', 'Nothing changes: inside it is the same Monitor'],
      answer: 0,
      explain: 'Every reader entry is atomic operations on a shared counter, and its cache line bounces between cores just like with lock. With short reads there is no gain. Better here is an immutable snapshot of the data: readers take the reference without a lock, a reload swaps it via Volatile.Write or Interlocked.Exchange.'
    },
    {
      t: 'match',
      q: 'Match the task with the primitive',
      pairs: [
        ['A short critical section in .NET 9', 'lock on a field of type Lock'],
        ['Wait for a condition under a lock', 'Monitor.Wait / Pulse'],
        ['Limit parallelism, waiting via await', 'SemaphoreSlim'],
        ['Long frequent reads, rare writes', 'ReaderWriterLockSlim'],
        ['One thread opens the gate for many', 'ManualResetEventSlim']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['A free lock is taken without entering the kernel', 'Monitor.Wait can be called without holding the lock on that object', 'A Lock cast to object behaves like Monitor in a lock statement', 'SemaphoreSlim can be released from another thread', 'System.Threading.Lock has Wait and Pulse'],
      answer: [0, 2, 3],
      explain: 'Wait without the lock throws SynchronizationLockException. Lock is mutual exclusion only, it has no condition variables. Casting to object throws away the whole point of the new type — that is what warning CS9216 is about.'
    }
  ]
};

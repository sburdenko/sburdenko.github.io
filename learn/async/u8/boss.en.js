/** Async/await to the bottom, unit "Synchronization in depth": the unit and course final. */
export default {
  id: 'as.u8.boss',
  title: 'Course final',
  sub: 'From memory fences to async locks',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A background thread spins while (!_stop) { … } on a plain bool field. In Release it sometimes does not stop after _stop = true. Which fix is reliable?',
      options: ['Read the flag with Volatile.Read(ref _stop)', 'Add Thread.Sleep(0) to the loop body', 'Wrap only the _stop = true write in a lock', 'Make the _stop field static'],
      answer: 0,
      explain: 'The JIT may read a plain field once and hoist the read out of the loop. Volatile.Read (or volatile on the field) forbids that. A call inside the loop merely gets in the way of one particular optimization and guarantees nothing, and a lock on one side only does not order the reads on the other.'
    },
    {
      t: 'multi',
      q: 'Code ran for years on x64 servers and started breaking after moving to ARM64. What could have shown up for the first time? Select all.',
      options: ['Two plain writes became visible to another core in reverse order', 'Two plain reads of different fields executed in reverse order', 'An aligned int write stopped being atomic', 'Interlocked.CompareExchange stopped being a full fence'],
      answer: [0, 1],
      explain: 'x64 reorders only write→read, ARM64 reorders all four pairs. Atomicity of aligned writes up to pointer size and the full fence of Interlocked are guaranteed on both architectures.'
    },
    {
      t: 'tapline',
      q: 'Add returns right away, but the total does not change. Which line is to blame?',
      code: 'static void Add(int amount)\n{\n    int current = Volatile.Read(ref _total);\n    while (true)\n    {\n        int seen = Interlocked.CompareExchange(ref _total, current, current + amount);\n        if (seen == current) return;\n        current = seen;\n    }\n}',
      answer: 5,
      explain: 'The arguments are swapped: the new value comes first, then the expected one. Here the CAS expects current + amount in the field, which is not there — nothing is written, current is returned, and the method thinks it succeeded. Correct: CompareExchange(ref _total, current + amount, current).'
    },
    {
      t: 'order',
      q: 'Put in order the path of a thread that hit a taken lock',
      items: ['Try to take the lock with one CAS', 'Spin briefly in user mode', 'Sleep on a kernel object', 'The owner leaves the lock and wakes a waiter', 'The woken thread tries to take the lock again'],
      explain: 'All hybrid locks work this way: a fast path without the kernel, a little spinning, and only then an expensive sleep. A woken thread does not get the lock automatically — it competes for it again.'
    },
    {
      t: 'tapline',
      q: 'Which line will not compile?',
      code: 'private readonly Lock _gate = new();\n\npublic async Task SaveAsync(Data d)\n{\n    lock (_gate)\n    {\n        await File.WriteAllTextAsync(PathToFile, d.ToJson());\n    }\n}',
      answer: 6,
      explain: 'CS1996: await inside a lock body is forbidden — both with Monitor and with the new Lock. The lock belongs to a thread, and after await the method may continue on another one. The async lock is SemaphoreSlim with WaitAsync and Release in finally.'
    },
    {
      t: 'multi',
      q: 'Which primitives can be released from another thread, and so survive an await between acquire and release? Select all.',
      options: ['SemaphoreSlim', 'Semaphore', 'Monitor (lock)', 'Mutex', 'System.Threading.Lock'],
      answer: [0, 1],
      explain: 'Semaphores have no owner — only a counter. Monitor, Mutex and Lock remember the owning thread and are released only by it. But only SemaphoreSlim fits async code: Semaphore has no WaitAsync, its WaitOne blocks the thread.'
    },
    {
      t: 'match',
      q: 'Match the task with the tool',
      pairs: [
        ['A request counter from many threads', 'Interlocked.Increment'],
        ['One instance of the program per machine', 'A named Mutex'],
        ['A critical section with await inside', 'SemaphoreSlim.WaitAsync'],
        ['An expensive per-key factory in a cache', 'ConcurrentDictionary with Lazy<T>'],
        ['Producer and consumer in async code', 'Channel<T>']
      ]
    },
    {
      t: 'choice',
      q: 'WPF, a button handler calls LoadAsync().Result, and LoadAsync contains an await without ConfigureAwait(false). The window froze forever. Why?',
      options: ['The continuation after await waits for the UI thread, and the UI thread is blocked in .Result waiting for the continuation', 'The thread pool is exhausted, and the continuation has nowhere to run', '.Result threw an AggregateException, and the window stopped processing messages', 'A Task created on the UI thread cannot be awaited from the UI thread'],
      answer: 0,
      explain: 'The classic synchronization context deadlock: two parties wait for each other, like two threads taking locks in opposite order. The cure is async all the way up; ConfigureAwait(false) in a library is the second line of defense.'
    },
    {
      t: 'choice',
      q: 'Which order of picking a synchronization tool makes sense?',
      options: ['Ready-made high-level tools (Channel, Concurrent collections, Lazy), then lock, and only after measuring — Interlocked and volatile', 'volatile on every shared field first: it is the cheapest way, everything else only when needed', 'A named Mutex wherever there is shared data: it works even across processes', 'SpinLock instead of lock throughout the code: it never enters the kernel and so is always faster'],
      answer: 0,
      explain: 'The lower the level, the more ways to get it wrong: volatile does not make ++ atomic, a CAS loop is easy to get backwards, SpinLock breaks when copied. High-level tools are already debugged, and an uncontended lock costs tens of nanoseconds.'
    }
  ]
};

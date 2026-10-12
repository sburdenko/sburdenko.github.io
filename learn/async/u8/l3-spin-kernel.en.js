/** Async/await to the bottom, unit "Synchronization in depth", lesson 3: spin locks vs kernel objects. */
export default {
  id: 'as.u8.l3',
  title: 'Spin or sleep',
  sub: 'SpinWait and SpinLock vs Mutex, Semaphore and kernel events',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Two ways to wait',
      body: '<p>The lock is taken. What should a thread do?</p><ul><li><b>Spin</b>: check in a loop whether it was released. The thread stays in user mode, keeps its quantum and reacts within nanoseconds. But all that time it <b>burns a CPU core</b> for nothing.</li><li><b>Sleep in the OS kernel</b>: ask the scheduler to take the thread off the CPU and wake it on a signal. The core is free for others. But the switch to kernel mode and back, the context switch and the wake-up cost <b>a few microseconds</b>, and the woken thread still waits for its turn.</li></ul><p>Hence the rule: spinning pays off only if the wait will be <b>shorter than the cost of falling asleep and waking up</b>, and there is a second core on which the lock owner is running right now.</p>'
    },
    {
      t: 'choice',
      q: 'When is pure spinning worse than sleeping in the kernel?',
      options: ['The lock owner was preempted and is not running: the waiter burns its quantum until it comes back', 'The lock is held for 50 nanoseconds on a 16-core machine', 'The critical section is a single assignment', 'There is almost no contention'],
      answer: 0,
      explain: 'While the owner is not running, nobody can release the lock — spinning is guaranteed to be useless. On a single core it is the worst case: the spinning thread itself keeps the owner from getting the CPU. The other options are exactly the good cases for spinning.'
    },
    {
      t: 'learn',
      title: 'SpinWait: a spin that knows when to stop',
      body: '<p>Writing <code>while (!flag) { }</code> by hand is bad: endless starvation on one core, extra heat and interference with the sibling hyperthread on many. The <code>SpinWait</code> struct does it right:</p><ul><li>the first <code>SpinOnce()</code> calls really spin, with a hint instruction to the CPU (<code>pause</code> on x64) and a growing iteration count;</li><li>after about ten calls it starts <b>yielding</b> the CPU: <code>Thread.Yield</code>, <code>Sleep(0)</code>, sometimes <code>Sleep(1)</code>;</li><li>on a single-core machine it yields right away.</li></ul><p><code>NextSpinWillYield</code> tells you it is time to switch to a real wait. A ready-made wrapper is <code>SpinWait.SpinUntil(condition, timeout)</code>.</p>',
      code: 'var spinner = new SpinWait();\nwhile (!Volatile.Read(ref _ready))\n{\n    spinner.SpinOnce();   // spins first, then yields\n}\n\n// or in one line, with a timeout in milliseconds\nbool ok = SpinWait.SpinUntil(() => Volatile.Read(ref _ready), 100);'
    },
    {
      t: 'learn',
      title: 'SpinLock — a struct with sharp edges',
      body: '<p><code>SpinLock</code> is a lock that spins under contention using that same <code>SpinWait</code>. It allocates no objects and never touches the kernel, so it suits critical sections of a few instructions that are taken <b>very often</b>.</p><p>The sharp edges:</p><ul><li>it is a <b>struct</b>: a copy is a separate lock. Do not pass it by value and do not keep it in a <code>readonly</code> field;</li><li>it is <b>not reentrant</b>: re-entering on the same thread throws <code>LockRecursionException</code> with owner tracking, and spins forever without it;</li><li>the <code>Enter(ref bool lockTaken)</code> signature is the same as <code>Monitor</code>\'s, for a reliable <code>finally</code>.</li></ul><p>Rule: start with <code>lock</code>. Move to <code>SpinLock</code> only if the profiler showed that this particular lock is hot.</p>',
      code: 'private SpinLock _spin = new(enableThreadOwnerTracking: false);\n\nbool taken = false;\ntry\n{\n    _spin.Enter(ref taken);\n    _items[_count++] = item;\n}\nfinally\n{\n    if (taken) _spin.Exit();\n}'
    },
    {
      t: 'tapline',
      q: 'Under load items get lost, even though every write is under the SpinLock. Which line is to blame?',
      code: 'class Buffer\n{\n    private readonly SpinLock _spin = new(false);\n    private int _count;\n\n    public void Add()\n    {\n        bool taken = false;\n        try { _spin.Enter(ref taken); _count++; }\n        finally { if (taken) _spin.Exit(); }\n    }\n}',
      answer: 2,
      explain: 'Calling a method on a struct in a readonly field works on a defensive copy: each Enter takes its own temporary lock, and there is no mutual exclusion. Remove readonly — then Enter changes the field itself.'
    },
    {
      t: 'learn',
      title: 'Kernel objects: WaitHandle',
      body: '<p><code>Mutex</code>, <code>Semaphore</code>, <code>EventWaitHandle</code> (and its children <code>AutoResetEvent</code>, <code>ManualResetEvent</code>) wrap OS objects. All of them derive from <code>WaitHandle</code> and hold a kernel handle.</p><ul><li><b>The cost</b>: on Windows every <code>WaitOne</code>, <code>Set</code>, <code>Release</code> is a system call, even when there was nothing to wait for. On Linux and macOS the runtime emulates these objects in its own layer, with no system call on a free object, but the path is still long. Either way it is tens of times more expensive than entering a free <code>lock</code>.</li><li><b>The strength</b>: an object can have a <b>name</b>, and then other processes see it. Plus <code>WaitHandle.WaitAny/WaitAll</code> — wait on several objects at once.</li></ul><p>Cross-process synchronization is the main reason to use them today. Inside one process there is almost always a lightweight replacement: <code>lock</code>, <code>SemaphoreSlim</code>, <code>ManualResetEventSlim</code>.</p>',
      deep: '<p>Names behave differently. On Windows all three types can be named; the <code>Global\\</code> prefix makes a name visible across all sessions, <code>Local\\</code> (the default) only within your own. On Linux and macOS the runtime emulates only the named <code>Mutex</code>; a name on a <code>Semaphore</code> or <code>EventWaitHandle</code> there leads to <code>PlatformNotSupportedException</code>.</p><p>In .NET Framework WaitHandle derived from MarshalByRefObject and also served to synchronize across AppDomains. Modern .NET has no application domains.</p>'
    },
    {
      t: 'match',
      q: 'Match the primitive with its trait',
      pairs: [
        ['Mutex', 'Tied to the owning thread, can be cross-process'],
        ['Semaphore', 'A counter in the kernel, any thread may release it'],
        ['AutoResetEvent', 'Set lets one waiter through and closes'],
        ['ManualResetEvent', 'After Set it is open for everyone until Reset'],
        ['SpinLock', 'A struct, waits in user mode']
      ]
    },
    {
      t: 'learn',
      title: 'Mutex: the owner and the abandoned lock',
      body: '<p>A <code>Mutex</code> remembers its <b>owning thread</b>. Only the thread that took it may release it: <code>ReleaseMutex</code> from another thread throws <code>ApplicationException</code>. So, as with <code>lock</code>, an <code>await</code> between acquire and release is a bug.</p><p>It is <b>reentrant</b>: the owner may take it again, but must release it the same number of times.</p><p>If the owning thread or process died without releasing the mutex, the OS hands it to the next waiter, who gets an <code>AbandonedMutexException</code>. The lock is already theirs, but the data under it may be half-modified.</p><p>The classic use is "only one instance of the program":</p>',
      code: 'using var mutex = new Mutex(true, @"Global\\MyApp.SingleInstance", out bool createdNew);\nif (!createdNew)\n{\n    Console.WriteLine("The program is already running");\n    return;\n}\nRunApp();   // the mutex lives as long as the using'
    },
    {
      t: 'blanks',
      q: 'Prevent a second instance of the program from starting',
      code: 'using var gate = new ___(true, @"Global\\Exporter", out bool ___);\nif (!isFirst)\n    return;',
      tiles: ['Mutex', 'isFirst', 'SemaphoreSlim', 'Monitor', 'lockTaken'],
      answer: ['Mutex', 'isFirst'],
      explain: 'You need an object other processes can see — a named Mutex. The last parameter tells whether we created it (the first instance) or opened an existing one. SemaphoreSlim and Monitor live only inside one process.'
    },
    {
      t: 'choice',
      q: 'Three threads wait in WaitOne() on one AutoResetEvent. Another thread calls Set() once. What happens?',
      options: ['One thread wakes up, the event closes again', 'All three wake up', 'One wakes up, the event stays open', 'None: Set has no effect without Reset'],
      answer: 0,
      explain: 'AutoResetEvent is a turnstile: one pass per Set. ManualResetEvent is a gate: after Set everyone passes until someone calls Reset.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['On Windows every WaitOne on a Mutex is a system call, even if the mutex is free', 'A Semaphore can be released from another thread', 'SpinLock is reentrant, like lock', 'SpinWait on a single-core machine yields the CPU right away', 'A named Semaphore works on Linux the same way as on Windows'],
      answer: [0, 1, 3],
      explain: 'SpinLock is not reentrant — unlike Monitor and Mutex. On Linux and macOS only mutexes can be named; for Semaphore and EventWaitHandle names are supported on Windows only.'
    }
  ]
};

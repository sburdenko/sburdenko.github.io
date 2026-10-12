/** Async/await to the bottom, unit "Synchronization in depth", lesson 1: the .NET memory model and volatile. */
export default {
  id: 'as.u8.l1',
  title: 'The memory model and volatile',
  sub: 'Which reorderings are possible, x64 vs ARM64, Volatile.Read/Write',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Order in code is not order in memory',
      body: '<p>In the threads unit the race was easy to picture: two threads take turns doing the steps of <code>count++</code>. There is a subtler problem. Even without shared counters, another thread can see your writes <b>in a different order</b> than you wrote them.</p><p>Three parties change the order:</p><ul><li><b>the C# compiler</b> — almost never, it does little optimization;</li><li><b>the JIT</b> — merges reads, keeps a field in a register, reorders independent operations;</li><li><b>the CPU</b> — executes instructions out of order and queues writes in a store buffer before they reach the cache.</li></ul><p>All three promise one thing: <b>within one thread</b> the result is as if the code ran strictly in order. They promise nothing about other threads — except what the rules of the memory model guarantee.</p>'
    },
    {
      t: 'learn',
      title: 'The loop that never stops',
      body: '<p>A classic. One thread spins until a flag is raised, another thread raises it.</p><p>The JIT sees that nothing inside the loop changes <code>_stop</code>. So it may read it <b>once</b> before the loop and keep testing a register. For a single thread that is a fair optimization. For two threads it is an endless loop: the other thread did write to memory, but this thread never looks at memory again.</p>',
      code: 'class Worker\n{\n    private bool _stop;              // a plain field\n\n    public void Run()\n    {\n        long n = 0;\n        while (!_stop) n++;          // the JIT may read _stop only once\n    }\n\n    public void Stop() => _stop = true;\n}',
      deep: '<p>In a Debug build and at tier 0 of tiered compilation the JIT barely optimizes, and the code "works". Once a hot method is recompiled at tier 1 (or replaced mid-loop through OSR, on-stack replacement), the read is hoisted out of the loop and the program hangs. That is why the bug shows up "only in Release and only sometimes".</p><p>The memory model spec in the dotnet/runtime repository allows this explicitly: adjacent ordinary reads of the same location can be coalesced into one.</p>'
    },
    {
      t: 'choice',
      q: 'Release build, Run() spins in one thread, a second later another thread calls Stop(). What happens?',
      code: 'var w = new Worker();\nvar t = new Thread(w.Run);\nt.Start();\nThread.Sleep(1000);\nw.Stop();\nt.Join();\nConsole.WriteLine("done");',
      options: ['It may hang forever: the read of _stop was hoisted out of the loop', 'It always prints "done": a bool is written atomically', 'It throws InvalidOperationException', 'It prints "done", but only after a scheduler quantum'],
      answer: 0,
      explain: 'Atomicity is not the issue: writing a bool is indeed indivisible. The problem is visibility — the Run thread no longer reads the field from memory. The fix is Volatile.Read(ref _stop) or volatile on the field.',
      wrong: { 1: 'Atomic means "you will not read half a value". It does not promise the read happens at all.' }
    },
    {
      t: 'learn',
      title: 'Four reorderings: x64 vs ARM64',
      body: '<p>Take two operations on <b>different</b> memory locations. The pairs are: read→read, read→write, write→write, write→read. Which of them the CPU can "swap" as seen from another core depends on the architecture.</p><ul><li><b>x64</b> has a strong model (TSO). Only one reordering is visible: <b>a write followed by a read</b> of another location. The write is still sitting in the buffer while the read already went to the cache.</li><li><b>ARM64</b> has a weak model. <b>All four</b> are possible. That is Apple M-series, Graviton, Ampere, phones.</li></ul><p>Hence a nasty class of bugs: code ran for years on x64 servers, and after moving to ARM64 it starts seeing "impossible" states once a day. And the JIT may reorder on its own, on any architecture.</p>',
      deep: 'TSO is total store order: all cores see writes in a single common order, and a core reads its own not-yet-flushed writes from the buffer (store forwarding). That is why write→read is the only hardware reordering on x64, and only a full fence fixes it: the mfence instruction or any lock-prefixed instruction.'
    },
    {
      t: 'choice',
      q: 'Which reordering of operations on different locations can an x64 CPU show to another core?',
      options: ['A write, then a read: the read overtakes the write', 'Two writes swap places', 'Two reads swap places', 'A read, then a write: the write overtakes the read'],
      answer: 0,
      explain: 'The write waits in the store buffer while the next read of another location has already executed. x64 does not do the other three — ARM64 does all four.'
    },
    {
      t: 'learn',
      title: 'Publishing through a flag',
      body: '<p>Thread A prepares data and raises a flag. Thread B sees the flag and reads the data. On ARM64, B can see <code>_ready == true</code> but a stale <code>_data == 0</code>: A\'s writes became visible in reverse order, or B\'s reads executed in reverse order.</p><p>Two promises are needed:</p><ul><li>the flag write is a <b>release</b>: everything A did before it becomes visible no later than the flag;</li><li>the flag read is an <b>acquire</b>: everything B does after it will not run earlier.</li></ul><p>That is exactly <code>Volatile.Write</code> and <code>Volatile.Read</code>.</p>',
      code: 'int _data;\nbool _ready;\n\n// thread A\n_data = 42;\nVolatile.Write(ref _ready, true);   // release\n\n// thread B\nif (Volatile.Read(ref _ready))      // acquire\n    Console.WriteLine(_data);       // guaranteed to be 42'
    },
    {
      t: 'blanks',
      q: 'Fix the loop from the start of the lesson without changing the field declaration',
      code: 'public void Run()\n{\n    long n = 0;\n    while (!Volatile.___(ref _stop)) n++;\n}\n\npublic void Stop() => Volatile.___(ref _stop, true);',
      tiles: ['Read', 'Write', 'Exchange', 'MemoryBarrier'],
      answer: ['Read', 'Write'],
      explain: 'Volatile.Read cannot be merged with neighboring reads or hoisted out of the loop — the thread looks at memory every time. Volatile.Write makes the write a release. Exchange and MemoryBarrier would also work, but they are full fences — more expensive and not needed here.'
    },
    {
      t: 'learn',
      title: 'The volatile keyword and what it does not give you',
      body: '<p><code>volatile</code> on a field turns <b>every</b> read into <code>Volatile.Read</code> and every write into <code>Volatile.Write</code>. Convenient, but it is easy to forget that the promises end there:</p><ul><li><b>no atomicity for compound operations</b>: <code>_count++</code> on a volatile field is still three steps, increments still get lost;</li><li><b>no write→read ordering</b>: a release write and a following acquire read of another location can still swap.</li></ul><p>The second one breaks "raise my flag, check the other flag" algorithms. You need a full fence: <code>Interlocked</code> or <code>Thread.MemoryBarrier()</code>.</p>',
      code: 'volatile int _x, _y;\n\n// thread A         // thread B\n_x = 1;             _y = 1;\nint r1 = _y;        int r2 = _x;\n\n// r1 == 0 && r2 == 0 is possible even on x64',
      deep: '<p><code>volatile</code> is not allowed on every type: references, pointers, integers up to 32 bits, <code>bool</code>, <code>char</code>, <code>float</code>, <code>IntPtr</code>/<code>nint</code> and enums based on them. On <code>long</code> and <code>double</code> you get error CS0677: on a 32-bit platform writing them is not atomic. <code>Volatile.Read(ref long)</code> does exist, and per the memory model spec it is atomic even on 32 bits.</p><p>The old <code>Thread.VolatileRead/VolatileWrite</code> from .NET Framework issued a full fence — they are slower and no longer needed: the <code>Volatile</code> class arrived in .NET Framework 4.5.</p>'
    },
    {
      t: 'choice',
      q: 'In the code above both fields are volatile. Can you get r1 == 0 and r2 == 0?',
      options: ['Yes: volatile does not stop a read from overtaking an earlier write', 'No: volatile forbids all reorderings', 'Only on ARM64, never on x64', 'No, if the threads run on different cores'],
      answer: 0,
      explain: 'A release write holds back what came before it, an acquire read holds back what comes after it. The pair "write, then read" is covered by neither. On x64 it is exactly the one reordering the hardware does. A fence between the lines (Interlocked.Exchange instead of the write, or Thread.MemoryBarrier) rules this outcome out.',
      wrong: { 2: 'The opposite: write→read is exactly what x64 reorders by itself through the store buffer.' }
    },
    {
      t: 'learn',
      title: 'What the .NET memory model guarantees',
      body: '<p>ECMA-335 promises little. The real runtime (CoreCLR) gives more, and it is written down in the memory model spec in dotnet/runtime:</p><ul><li>aligned reads and writes up to pointer size are <b>atomic</b> — you never see half a value;</li><li>a volatile read is an acquire, a volatile write is a release;</li><li><b>storing an object reference</b> to a shared location is a release: whoever reads the reference sees the object\'s fields initialized, without an extra fence;</li><li>ordering honors <b>data dependency</b>: a read through a reference does not happen before reading the reference itself;</li><li><code>Interlocked</code>, <code>Thread.MemoryBarrier</code> and entering/leaving a <code>lock</code> are fences (Interlocked and MemoryBarrier are full ones).</li></ul>',
      deep: '<p>The cost differs by CPU. On x64 a volatile read or write is a plain <code>mov</code>: the hardware already gives acquire/release, the JIT just does not reorder or merge them. On ARM64 the JIT emits <code>ldar</code>/<code>stlr</code> (load-acquire / store-release) or a <code>dmb</code> barrier — the choice depends on the JIT version and the spot. A full fence on x64 is a <code>lock</code> instruction or <code>mfence</code>, on ARM64 it is <code>dmb ish</code>.</p><p>Note: the "storing a reference is a release" guarantee does not order two independent ordinary writes. If order matters, say so explicitly with <code>Volatile</code>.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about volatile in C#? Select all.',
      options: ['A long field cannot be declared volatile', '_count++ on a volatile field becomes atomic', 'A read of a volatile field cannot be hoisted out of a loop', 'A volatile write and a following volatile read of another field can swap places', 'On x64 every volatile read is a separate fence instruction'],
      answer: [0, 2, 3],
      explain: 'long is forbidden (CS0677). ++ is still three steps — you need Interlocked. Hoisting is not allowed: every volatile read is real. The write→read pair is not ordered. On x64 a volatile read is a plain mov, the constraints apply to the JIT only.'
    },
    {
      t: 'match',
      q: 'Match the operation with what it promises',
      pairs: [
        ['Volatile.Read', 'Acquire: later operations will not move earlier'],
        ['Volatile.Write', 'Release: earlier operations will not move later'],
        ['Interlocked.Exchange', 'A full fence in both directions'],
        ['Plain field read', 'May be merged with a neighbor and hoisted out of a loop'],
        ['Storing a reference to a new object', 'The reader sees the fields initialized']
      ]
    }
  ]
};

/** Memory in .NET, unit "How a collection works", lesson 2: suspending threads — thread modes, safepoints, hijacking and GC polls. */
export default {
  id: 'mem.u5.l2',
  title: 'Suspending threads',
  sub: 'Cooperative and preemptive mode, safepoints and hijacking',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Why the program has to stop',
      body: '<p>The collector reads references and moves objects. If a managed thread runs at the same time, it may write a reference into an object that was already scanned, or hold in a register an address the GC is about to change. The result is a lost live object or a pointer into nowhere.</p><p>So before a blocking collection the runtime <b>suspends the execution engine</b> (Suspend EE): all managed threads freeze, the collection runs, then the threads are released (Restart EE). Even a background collection needs short pauses at its start and end.</p>',
      flow: ['Suspend EE', 'Collection', 'Restart EE']
    },
    {
      t: 'learn',
      title: 'Two thread modes',
      body: '<p>Every thread that has ever entered managed code has a mode flag.</p><ul><li><b>Cooperative</b>: the thread runs managed code and may touch the heap. A collection cannot start while it is in this mode: it has to be brought to a stop.</li><li><b>Preemptive</b>: the thread is in native code, waiting in the kernel, or sleeping. It has promised not to touch the managed heap, and the GC does not wait for it.</li></ul><p>It works like a lock on the heap: cooperative mode holds it, preemptive mode has released it. Entering cooperative mode again checks whether a collection is in progress, and if so, the thread waits for it to end.</p>',
      deep: '<p>In CoreCLR the mode is kept in the thread field <code>m_fPreemptiveGCDisabled</code>, and the "suspension in progress" flag in the global <code>g_TrapReturningThreads</code>. Every switch to cooperative mode checks it: returning from P/Invoke, entering from native code through a callback, leaving a wait. See the "Threading" document of the Book of the Runtime in the dotnet/runtime repository.</p>'
    },
    {
      t: 'multi',
      q: 'Which threads does the collector not need to wait for? Select all.',
      options: [
        'A thread in Thread.Sleep(5000)',
        'A thread waiting in Monitor.Wait',
        'A thread inside a P/Invoke call to ReadFile',
        'A thread spinning a managed addition loop',
        'A thread currently executing new List<int>()'
      ],
      answer: [0, 1, 2],
      explain: 'Sleeping, waiting and native calls happen in preemptive mode: such threads do not touch the heap. A thread in managed code is in cooperative mode: it has to be brought to a safepoint.'
    },
    {
      t: 'learn',
      title: 'Safepoint: where a thread can be stopped',
      body: '<p>Stopping a thread at an arbitrary instruction is not enough: the GC must know exactly which registers and stack slots hold references at that moment. In the middle of a computation a reference may sit in a register nothing is recorded about.</p><p>Places where this information exists are <b>safepoints</b>. The JIT defines them when it writes the GC info for a method:</p><ul><li><b>partially interruptible</b> code: only call sites to other methods and GC poll checks are safe;</li><li><b>fully interruptible</b> code: almost every instruction is safe, except the prolog and epilog.</li></ul><p>Full interruptibility costs space: the GC info gets bigger. The JIT picks the mode with heuristics: for example, it usually makes a method with a call-free loop fully interruptible, otherwise a thread in such a loop could not be stopped.</p>'
    },
    {
      t: 'choice',
      q: 'Why not just freeze a thread through the OS and start collecting right away?',
      options: [
        'At an arbitrary point the GC does not know which registers and stack slots hold references',
        'The OS cannot suspend threads',
        'A frozen thread holds the heap lock forever',
        'Suspending through the OS takes seconds'
      ],
      answer: 0,
      explain: 'The OS can stop a thread, and the runtime uses that. But then it needs an exact map of references for the current instruction, and that exists only at safepoints.'
    },
    {
      t: 'learn',
      title: 'How a thread is brought to a safepoint',
      body: '<p>The thread that started the collection sets a global "suspension in progress" flag and goes through all threads in cooperative mode:</p><ul><li><b>Interruption</b>. The thread is paused with OS facilities and inspected. If it is in fully interruptible code, it is redirected to a stub that switches it to preemptive mode and waits for the collection to end.</li><li><b>Return address hijacking</b>. If the code is partially interruptible, the runtime replaces the return address of the top frame. The method finishes, "returns" into the stub and stops there.</li><li><b>GC poll</b>. In partially interruptible code the JIT may insert a check of the flag. When it sees the flag, the thread enters the runtime by itself and stops.</li></ul><p>The runtime repeats the pass until nobody is left in cooperative mode.</p>',
      deep: '<p>On Windows the thread is paused with <code>SuspendThread</code>, and on newer Windows versions the runtime can step in through a special user-mode APC. Linux and macOS have no SuspendThread: the thread is interrupted with a signal, and the signal handler does the same check.</p>'
    },
    {
      t: 'order',
      q: 'Put the suspension steps in order',
      items: [
        'The initiating thread sets the "suspension in progress" flag',
        'It finds threads in cooperative mode',
        'It interrupts them or replaces their return address',
        'Each reaches a safepoint and waits in preemptive mode',
        'The collection runs',
        'Restart EE: the flag is cleared, threads are released'
      ],
      explain: 'While even one thread is in cooperative mode, the collection does not start. Threads in native code will see the flag only when they try to return to managed code.'
    },
    {
      t: 'learn',
      title: 'Why native code does not get in the way',
      body: '<p>Before a P/Invoke call the stub records a <b>transition frame</b>, marking where the managed part of the stack ends, and switches the thread to preemptive mode. While the native function runs, the managed frames below it are frozen: the GC walks them calmly and updates references in them.</p><p>Native code must not hold "raw" addresses of movable objects. That is why the marshaller pins arrays and strings for the duration of the call.</p><p>On the way back the stub switches the thread to cooperative mode and checks the flag. If a collection is running, the thread waits. Native code that calls a managed method through a callback waits the same way.</p>',
      code: '[DllImport("libc")]\nstatic extern int usleep(uint usec);\n\nusleep(5_000_000);  // 5 s in native code:\n                    // collections run without waiting for this thread'
    },
    {
      t: 'choice',
      q: 'A thread sleeps in usleep(5_000_000) through P/Invoke. Another thread starts a collection. What happens?',
      options: [
        'The collection runs at once; if usleep returns during it, the thread waits for it to end',
        'The collection waits 5 seconds until usleep returns',
        'The runtime interrupts usleep to collect garbage',
        'The collection scans only the stacks of the other threads'
      ],
      answer: 0,
      explain: 'A thread in P/Invoke is in preemptive mode, the GC does not wait for it. Its managed frames are frozen and get walked as usual. The thread can get back into managed code only after Restart EE.',
      wrong: { 3: 'The managed frames below the native call hold roots too. The GC walks them, starting from the transition frame.' }
    },
    {
      t: 'learn',
      title: 'SuppressGCTransition: the flip side',
      body: '<p>Switching to preemptive mode and back costs little, but for a tiny native function called millions of times it is a noticeable share. For such cases there is the <code>[SuppressGCTransition]</code> attribute: a call without the transition.</p><p>The price: the thread stays in <b>cooperative</b> mode while the native function runs. If the function is long, collections in the whole process wait for it to finish. If it blocks or calls managed code, you can get a hang or corrupted state.</p><p>The rule from the documentation: only for very short functions that do not block, do not throw and do not call into the runtime.</p>',
      code: '[LibraryImport("native")]\n[SuppressGCTransition]\ninternal static partial long ReadCounter();  // a few instructions'
    },
    {
      t: 'tapline',
      q: 'Which call can hold up collections in the whole process for a full second?',
      code: '[DllImport("libc")]\nstatic extern int usleep(uint usec);\n\n[DllImport("libc", EntryPoint = "usleep"), SuppressGCTransition]\nstatic extern int usleep_fast(uint usec);\n\nusleep(1_000_000);\nThread.Sleep(1000);\nusleep_fast(1_000_000);',
      answer: 8,
      explain: 'With SuppressGCTransition the thread stays cooperative for the whole second of sleep, and any collection in the process waits for it. usleep and Thread.Sleep go into preemptive mode and do not get in the way.'
    },
    {
      t: 'learn',
      title: 'The cost of suspension',
      body: '<p>A GC pause is suspending threads, the GC work and restarting threads. Usually suspension is a small share of the pause, but there are exceptions:</p><ul><li>many threads in cooperative mode: each has to be brought to a safepoint;</li><li>a thread in a long call with <code>SuppressGCTransition</code>;</li><li>a thread without a CPU: an overloaded machine or CPU throttling in a container. Until the thread gets CPU time, it will not reach the stub.</li></ul><p>In a trace this shows up as the <code>GCSuspendEEBegin</code>/<code>GCSuspendEEEnd</code> events; PerfView shows suspension time as a separate column in its table of collections. If the pause is long but the collection itself is short, look for the problem in suspension.</p>'
    },
    {
      t: 'match',
      q: 'Match the term and its meaning',
      pairs: [
        ['Cooperative mode', 'A thread in managed code, the GC waits for it'],
        ['Preemptive mode', 'A thread in native code or a wait, the GC does not wait for it'],
        ['Safepoint', 'A point where it is known where references are'],
        ['Return address hijacking', 'Replacing the return address of the top frame'],
        ['GC poll', 'A flag check inserted into code by the JIT']
      ]
    }
  ]
};

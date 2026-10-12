/** Memory in .NET, unit "Object lifetime", lesson 1: finalization inside out: two queues, the finalizer thread, the cost. */
export default {
  id: 'mem.u7.l1',
  title: 'Finalization inside out',
  sub: 'Two queues, the finalizer thread and the extra collection',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'The bookkeeping starts at new',
      body: '<p>You already know from ".NET inside out" that a finalizer is a fallback and costs an extra collection. Now let us see how it works.</p><p>A type with a finalizer is a type that overrides <code>Object.Finalize</code> (in C#, the <code>~Name()</code> syntax). <code>Object.Finalize</code> itself is empty, and the runtime ignores it.</p><p>When an object of such a type is created, the runtime immediately records a reference to it in the <b>finalization queue</b>. This is not a queue of dead objects: it holds every <b>live</b> object whose finalizer will have to run some day. The record is made on every <code>new</code>, even if the object is later released properly through <code>Dispose</code>.</p>',
      code: 'class Native\n{\n    ~Native() { /* close the handle */ }\n}\n\nvar a = new Native();   // object + a finalization queue entry\nvar b = new object();   // just the object',
      deep: '<p>Because of the registration, allocating such an object does not take the fastest path: for types with a finalizer the JIT usually picks the general allocation helper instead of the inline pointer bump.</p><p>In CoreCLR both queues are a single array inside the collector (the <code>CFinalize</code> class in <code>gc.cpp</code>), split into segments: per generation for registered objects, plus separate segments for those already ready for finalization. In a dump the SOS command <code>!finalizequeue</code> shows them: how many objects are registered in each generation and how many are "Ready for finalization".</p>'
    },
    {
      t: 'multi',
      q: 'Which of these objects get a finalization queue entry when created? Select all.',
      code: 'class A { ~A() { } }\nclass B : A { }\nclass C : IDisposable { public void Dispose() { } }\n\nnew A(); new B(); new C(); new string(\'x\', 3);',
      options: ['new A()', 'new B()', 'new C()', 'new string(\'x\', 3)'],
      answer: [0, 1],
      explain: 'B inherits the finalizer from A: what matters to the runtime is that Finalize is overridden somewhere in the chain. IDisposable has nothing to do with finalization: it is just an interface with a method. string has no finalizer.'
    },
    {
      t: 'learn',
      title: 'What a collection does: the second queue',
      body: '<p>A garbage collection goes like this:</p><ul><li>the GC marks everything it reaches from the roots;</li><li>then it scans the finalization queue. Entries for <b>unmarked</b> objects move to another queue, the <b>f-reachable queue</b> (ready for finalization);</li><li>this second queue is a <b>root</b>. The GC marks again: the objects themselves and everything they reference;</li><li>whatever is marked survives and is promoted to the next generation, like any live object;</li><li>the GC wakes the finalizer thread.</li></ul><p>The result: an object that is already dead to your program is "alive" again for this collection, along with its whole graph.</p>',
      deep: '<p>The f in the name stands for finalization: the object is reachable only through this queue. While it sits there, it is a root for everything it references.</p><p>Without a dump you can check <code>GC.GetGCMemoryInfo().FinalizationPendingCount</code>: how many objects the last collection sent to finalization.</p>'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'F has a finalizer and holds Child, which has none. Null out f and get both removed. Watch which generation Child ends up in.',
      objects: [{ id: 'F', fin: true, refs: ['Child'] }, { id: 'Child' }],
      roots: [{ name: 'f', to: 'F' }],
      gen1: true,
      goal: { kind: 'dead', ids: ['F', 'Child'] },
      solve: ['root:f', 'gc:0', 'fin', 'gc:1']
    },
    {
      t: 'order',
      q: 'Put the life of a finalizable object in order',
      items: [
        'new: an entry in the finalization queue',
        'The last reference from the program goes away',
        'A collection moves the entry to the f-reachable queue and marks the object graph',
        'The finalizer thread calls Finalize',
        'The next collection of its generation frees the memory'
      ],
      explain: 'Between "became garbage" and "memory is free" there are at least two collections and a call on a separate thread. And after the first collection the object is already in an older generation, so the second one has to collect that generation.'
    },
    {
      t: 'learn',
      title: 'The cost: the whole graph gets promoted',
      body: '<p>The expensive part is not calling the finalizer but promotion. An object in Gen 0 moves to Gen 1 after the first collection, and a Gen 0 collection can no longer free it. If it does not make it to a Gen 1 collection, it moves to Gen 2 and waits for a full one.</p><p>Everything it references goes along: buffers, lists, strings. Hence the rule: <b>a finalizable object should be small and a leaf</b>. Keep only the handle in it, and big data in a class without a finalizer. That is exactly how <code>SafeHandle</code> is built: it holds just the handle number and a counter.</p>',
      code: 'class Image          // no finalizer\n{\n    byte[] _pixels;    // data: nobody extra keeps it alive\n    SafeHandle _gpu;   // a small object with a finalizer\n}'
    },
    {
      t: 'choice',
      q: 'A Bitmap class holds a 64 KB byte[] in a field and has its own finalizer that frees a native texture. What happens when a forgotten Bitmap becomes garbage?',
      options: [
        'The array survives at least one more collection and most likely moves to an older generation along with Bitmap',
        'The array is freed right away: it has no finalizer of its own',
        'The array is freed, and Bitmap stays until its finalizer runs',
        'The GC removes the array before the finalizer runs to save memory'
      ],
      answer: 0,
      explain: 'Bitmap in the f-reachable queue is a root, and the array is reachable through it, so it survives and gets promoted. Had the array been over 85,000 bytes, it would be in the LOH and wait for a full collection anyway. Better to move the texture into a small SafeHandle and drop the finalizer from Bitmap.',
      wrong: { 1: 'It does not need a finalizer to survive: it is referenced by an object that is currently a root.', 3: 'The collector does not break references: a finalizer is allowed to read its own object\'s fields.' }
    },
    {
      t: 'learn',
      title: 'One finalizer thread per process',
      body: '<p>All finalizers are called by <b>one</b> dedicated thread with raised priority. It takes entries from the f-reachable queue one at a time and calls <code>Finalize</code>. Three consequences:</p><ul><li>a finalizer runs <b>not</b> on the thread that created the object: no <code>SynchronizationContext</code>, no UI;</li><li>if a finalizer <b>hangs</b> (waiting for a lock, a task\'s <code>.Result</code>, the network), the whole queue stops. Objects pile up in it, and memory grows for no visible reason;</li><li>an unhandled exception in a finalizer <b>crashes the process</b>, like on any other thread.</li></ul><p><code>GC.WaitForPendingFinalizers()</code> blocks the calling thread until the queue is empty. Useful in tests and measurements, almost never in production code.</p>',
      deep: '<p>A growing queue shows up in <code>FinalizationPendingCount</code> and in a dump: lots of "Ready for finalization" while the finalizer thread\'s stack sits in a wait. The .NET Framework classic is a COM wrapper finalizer that needs an STA thread busy with something else.</p><p>The rule for a finalizer: nothing longer than a couple of system calls, no locks, no waits, no touching other managed objects.</p>'
    },
    {
      t: 'choice',
      q: 'A service slowly grows in memory. The dump shows thousands of objects "Ready for finalization", and the finalizer thread is stuck in Monitor.Enter. What is going on?',
      options: [
        'One finalizer is waiting for a lock, and the whole finalization queue is stalled',
        'The GC cannot keep up, Server GC is needed',
        'Finalizers run in parallel and get in each other\'s way',
        'The objects were resurrected and are never freed again'
      ],
      answer: 0,
      explain: 'There is only one finalizer thread. While it waits in Monitor.Enter, nobody calls the other finalizers, so the objects and their graphs just hang in memory. The fix is in the finalizer: no locks and no waits inside.'
    },
    {
      t: 'learn',
      title: 'Order is not guaranteed',
      body: '<p>Say A references B, both have finalizers, and both became garbage in the same collection. Both go to the f-reachable queue, and the finalizer thread calls them <b>in any order</b>. The reference graph does not set the order.</p><p>So inside <code>~A</code> the object B is still in memory (A holds it), but its finalizer may have <b>already</b> run: the file is closed, the buffer flushed, the native memory freed. Touching it means an <code>ObjectDisposedException</code> or, worse, working with a released resource.</p><p>The rule from ".NET inside out" follows from this: in a finalizer, touch only your own unmanaged resource.</p>',
      code: 'class A\n{\n    B _b;            // B has a finalizer too\n    ~A()\n    {\n        _b.Flush();  // B may already be finalized\n    }\n}'
    },
    {
      t: 'choice',
      q: 'In the example above A and B became garbage at the same time. What is guaranteed while ~A runs?',
      options: [
        'The _b object is still in memory, but its finalizer may have already run',
        '_b is null: the collector clears references to dead objects',
        '~B runs strictly after ~A, since A references B',
        'The _b object is already freed, touching it is an AccessViolation'
      ],
      answer: 0,
      explain: 'While A is in the f-reachable queue, it is a root for B, so B\'s memory is intact. But the finalizer queue keeps no order. Only CriticalFinalizerObject has a weak ordering guarantee; more on it in the next lesson.'
    },
    {
      t: 'learn',
      title: 'Process exit: then and now',
      body: '<p><b>.NET Framework</b>, on a normal process shutdown, ran the finalizers of the remaining objects (with a time limit).</p><p><b>.NET Core and .NET 5+</b> do not: finalizers are <b>not called</b> on exit. An object that flushed its buffer to a file only in the finalizer simply loses the data on exit.</p><p>What to do: release explicitly (<code>using</code>, <code>Dispose</code>), and for "at the very end" logic subscribe to <code>AppDomain.CurrentDomain.ProcessExit</code> or, in a hosted app, to <code>IHostApplicationLifetime.ApplicationStopping</code>. The OS closes the process handles itself, but it will not flush your buffers for you.</p>',
      code: 'AppDomain.CurrentDomain.ProcessExit += (_, _) =>\n{\n    Log.Flush();   // no finalizer will come on exit\n};'
    },
    {
      t: 'multi',
      q: 'What is true about finalizers in .NET 8? Select all.',
      options: [
        'A finalizer runs on a different thread than the one that created the object',
        'An unhandled exception in a finalizer terminates the process',
        'On a normal process exit, the finalizers of the remaining objects are called',
        'If A references B, the finalizer of A runs before the finalizer of B'
      ],
      answer: [0, 1],
      explain: 'Finalizers are called by a dedicated thread, and an exception on it crashes the process. On process exit .NET Core and later do not run finalizers; only .NET Framework did. Order between objects is not guaranteed.'
    }
  ]
};

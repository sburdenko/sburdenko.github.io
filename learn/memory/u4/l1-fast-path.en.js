/** Memory in .NET, unit "Allocation", lesson 1: the fast path — bumping a pointer in the thread's allocation context. */
export default {
  id: 'mem.u4.l1',
  title: 'The fast path: bumping a pointer',
  sub: 'Allocation context, 8 KB chunks and zeroing in advance',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'What new actually does',
      body: '<p>In C#, <code>new Order()</code> is one line. The compiler turns it into the IL instruction <code>newobj</code>, and the JIT turns that into a call to a runtime allocation helper followed by the constructor.</p><p>The helper does three things:</p><ul><li>finds room of the right size;</li><li>makes sure that room is zeroed;</li><li>writes the type pointer (MethodTable) at the start of the object.</li></ul><p>Only then does the constructor run. This whole lesson is about why the first two steps cost almost nothing in .NET.</p>',
      code: '// C#\nvar o = new Order(42);\n\n// IL\nldc.i4.s   42\nnewobj     instance void Order::.ctor(int32)\nstloc.0'
    },
    {
      t: 'learn',
      title: 'The thread\'s allocation context',
      body: '<p>Every thread has an <b>allocation context</b> — two pointers into the generation 0 heap: <code>alloc_ptr</code> is where free space begins, <code>alloc_limit</code> is where it ends. Between them lies a chunk of memory the collector handed to this thread in advance, usually about <b>8 KB</b>.</p><p>Allocating an object means moving <code>alloc_ptr</code> forward by its size. If the move did not cross <code>alloc_limit</code>, the job is done. This is called <b>bump pointer</b> allocation.</p>',
      code: 'class AllocContext\n{\n    public nint Ptr;    // alloc_ptr: start of free space\n    public nint Limit;  // alloc_limit: end of the chunk\n\n    public nint TryAlloc(int size)\n    {\n        nint end = Ptr + size;\n        if (end > Limit) return 0;  // does not fit: slow path\n        nint obj = Ptr;\n        Ptr = end;                  // the entire "search for room"\n        return obj;\n    }\n}',
      deep: 'In the dotnet/runtime sources this is the <code>gc_alloc_context</code> struct (gcinterface.h). Besides the two pointers it holds the counters <code>alloc_bytes</code> and <code>alloc_bytes_uoh</code> — how many bytes the thread allocated on the SOH and on the large heaps. The chunk size comes from the <code>CLR_SIZE</code> constant in gc.cpp — 8 KB plus a small margin. If an object is bigger than a chunk but below the LOH threshold, the collector hands out a chunk sized for it.'
    },
    {
      t: 'choice',
      q: 'Why does every thread get its own allocation context instead of one shared pointer for the whole heap?',
      options: [
        'Bumping your own pointer needs neither a lock nor an atomic operation',
        'So that objects from different threads cannot reference each other',
        'So that the collector can collect each thread\'s heap separately',
        'The memory model requires it: a write to a shared pointer is invisible to other cores'
      ],
      answer: 0,
      explain: 'A shared pointer would have to be bumped with Interlocked or under a lock, and every thread would fight over one cache line. A thread-local pointer is touched only by its own thread: plain reads and writes. Synchronization is needed only when the chunk runs out and the thread goes to the collector for a new one.',
      wrong: { 1: 'Objects from different chunks reference each other freely: there is one heap, chunks are just a way to hand it out.', 2: 'Collection works by generations and regions, not by threads. Chunks of different threads live in the same generation 0.' }
    },
    {
      t: 'learn',
      title: 'Zeros in advance, in bulk',
      body: '<p>The spec promises that the fields of a new object are <code>default</code>. If the runtime zeroed each object separately, every <code>new</code> would pay for an extra loop.</p><p>Instead the collector zeroes <b>the whole chunk at once</b> when it hands it to a thread. After that the fast path cleans nothing: the memory under the pointer is already zero. All that is left is writing the type pointer — and the object is ready, even if the constructor is empty.</p><p>That is why <code>new int[1000]</code> does not walk 1000 elements: the zeros were laid down earlier, with one <code>memset</code> per chunk.</p>',
      deep: 'Zeroing cannot be skipped for objects with references: the collector must see either null or a real address in those fields. Arrays of primitives have a loophole — <code>GC.AllocateUninitializedArray&lt;T&gt;</code> (.NET 5+): memory is not zeroed if the type contains no references. The gain shows only on large arrays: for an array under 2 KB the method simply calls <code>new T[]</code>. This is, for example, how <code>ArrayPool</code> allocates new buffers of primitive types.'
    },
    {
      t: 'order',
      q: 'Put the fast-path steps for new Order() in order',
      items: [
        'Read alloc_ptr from the thread\'s context',
        'Add the object size',
        'Compare the result with alloc_limit',
        'Store the new alloc_ptr',
        'Write the type pointer',
        'Call the constructor'
      ],
      explain: 'First check that the object fits, then bump the pointer, then write the MethodTable into already zeroed memory. The constructor is called by JIT-generated code after the helper returns.'
    },
    {
      t: 'learn',
      title: 'What it costs',
      body: '<p>The fast path is on the order of ten machine instructions: a load, an add, a compare, two stores. No free-block search like a classic <code>malloc</code>, no locks.</p><p>So <code>new</code> in .NET is cheap <b>at the moment of the call</b>. You pay later:</p><ul><li>every few megabytes of allocations a generation 0 collection runs;</li><li>the collector copies survivors into an older generation.</li></ul><p>Hence the rule: short-lived garbage is nearly free; what costs is lots of allocations in a hot loop (frequent collections) and objects that live "a bit longer than needed" (copying).</p>',
      deep: 'Then and now: bump pointer allocation has been in the CLR since version one, .NET Framework allocated the same way. The surroundings changed: in .NET 7 the heap moved to regions, and chunks are carved from generation 0 regions rather than an ephemeral segment. In .NET 9–10 the JIT sometimes skips the allocator altogether: an object that never leaves the method can be placed on the stack (escape analysis). Do not rely on it in code — it is an optimization, not a guarantee.'
    },
    {
      t: 'choice',
      q: 'A thread creates three small objects in a row. Where do they most likely live?',
      code: 'var a = new Node();\nvar b = new Node();\nvar c = new Node();',
      options: [
        'Right next to each other in this thread\'s chunk',
        'In random spots of the heap wherever a free hole was found',
        'In three different regions, one per object',
        'On the thread\'s stack until a field references them'
      ],
      answer: 0,
      explain: 'Each new bumps the same alloc_ptr, so the objects land back to back. That is free locality: objects created together are usually read together, and neighbors share cache lines (see the cache lesson in the unit "Memory through the OS’s eyes"). A compacting collection preserves their order.'
    },
    {
      t: 'learn',
      title: 'When the chunk runs out',
      body: '<p>If an object does not fit in what is left of the chunk, the fast path reports failure and the thread takes the <b>slow path</b> — to the collector for a new chunk.</p><p>The tail of the old chunk where the object did not fit is not silently lost: the collector marks it as a <b>free object</b> — a dummy object that fills the hole so the heap can be walked object by object.</p><p>With an 8 KB chunk and objects of 30–100 bytes, the slow path fires roughly once per hundred allocations. The rest of the time it is a pointer bump.</p>',
      deep: 'The heap must be "walkable": the collector and the debugger step through it, reading each object\'s type pointer and computing its size. So every unused hole is dressed up as an object of the special Free type with a length. In a dump (for example, <code>!dumpheap -stat</code> in SOS) they show up as the Free row — that is heap fragmentation.'
    },
    {
      t: 'blanks',
      q: 'Complete the fast-path model',
      code: 'nint end = ctx.Ptr + size;\nif (end > ctx.___)\n    return SlowPath(size);\nnint obj = ctx.___;\nctx.Ptr = ___;\nreturn obj;',
      tiles: ['Limit', 'Ptr', 'end', 'size', 'obj', 'Free'],
      answer: ['Limit', 'Ptr', 'end'],
      explain: 'Check that the new end did not cross the chunk boundary; the object starts at the old Ptr; the new Ptr is its end. No zeroing needed: the chunk is already zero.'
    },
    {
      t: 'multi',
      q: 'What is true about the allocation context? Select all.',
      options: [
        'Each thread has its own',
        'Its memory is zeroed in advance, when the chunk is handed out',
        'Every new takes a global heap lock',
        'An object that does not fit in the rest of the chunk takes the slow path',
        'The chunk covers the whole of generation 0 at once'
      ],
      answer: [0, 1, 3],
      explain: 'Only the slow path takes a lock, and not for every object. A chunk is about 8 KB: if a thread got all of generation 0, other threads would have nowhere to allocate and the collector could not track its budget precisely.'
    },
    {
      t: 'match',
      q: 'Match the term and its meaning',
      pairs: [
        ['alloc_ptr', 'Where the next object will start'],
        ['alloc_limit', 'End of the thread\'s chunk'],
        ['~8 KB chunk', 'A piece of generation 0 given to a thread'],
        ['Free object', 'A placeholder for the unused tail'],
        ['newobj', 'IL instruction that allocates and calls the constructor']
      ]
    }
  ]
};

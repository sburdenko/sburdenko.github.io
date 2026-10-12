/** Memory in .NET, unit "Allocation", lesson 2: the slow path, the generation 0 budget and LOH allocation. */
export default {
  id: 'mem.u4.l2',
  title: 'The slow path and the LOH',
  sub: 'When a pointer bump is not enough and who starts a collection',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'When the fast path will not do',
      body: '<p>Pointer bumping works for most objects. But in some cases the JIT or the fast path itself sends the allocation to the collector — down the <b>slow path</b>:</p><ul><li><b>the chunk ran out</b> — the object did not fit in what was left;</li><li><b>the object is large</b> — 85,000 bytes or more, it belongs in the LOH, not generation 0;</li><li><b>the type has a finalizer</b> — the object must also be registered in the finalization queue.</li></ul><p>The first case is decided at allocation time. A finalizer and the size of an ordinary object are visible to the JIT in advance: for such types it calls the slow helper right away. The size of an array is known only at run time, so a large array is sent down the slow path by the helper itself.</p>',
      code: 'var a = new Point();          // fast path (almost always)\nvar b = new byte[200_000];    // slow: LOH\nvar c = new FileStream(path, FileMode.Open);\n// slow: FileStream has a finalizer',
      deep: 'You can see this in <code>CEEInfo::getNewHelperStatic</code> (jitinterface.cpp): the slow helper <code>CORINFO_HELP_NEWFAST</code> is the default, and the fast <code>CORINFO_HELP_NEWSFAST</code> is chosen only if the type has no finalizer, is not a COM object and is smaller than <code>LARGE_OBJECT_SIZE</code>. For arrays the size is known only at run time, so the helper itself checks the threshold.'
    },
    {
      t: 'multi',
      q: 'Which allocations always take the slow path? Select all.',
      code: 'new Plain();\nnew WithFinalizer();\nnew Person("Ann");\nnew double[20_000];\nnew string(\'x\', 10);\n\nclass Plain { public int X; }\nclass WithFinalizer { ~WithFinalizer() { } }\nrecord Person(string Name);',
      options: ['new Plain()', 'new WithFinalizer()', 'new Person("Ann")', 'new double[20_000]', 'new string(\'x\', 10)'],
      answer: [1, 3],
      explain: 'A finalizer is a reason for the slow path, and a double[20,000] weighs over 160,000 bytes and goes to the LOH. A record is an ordinary class without a finalizer. A 10-character string is a small object, fast path.'
    },
    {
      t: 'learn',
      title: 'What the slow path does',
      body: '<p>The slow path is a collector function whose job is to give the thread a new chunk. Roughly in this order it:</p><ul><li>takes the heap lock — chunks are handed out to all threads from a shared place;</li><li>checks the generation 0 <b>budget</b>: how much more can be allocated before the next collection;</li><li>looks for room: a free block left over from the last collection (the free list), or an untouched part of a generation 0 region, and if there is none — takes a new region;</li><li>zeroes the chunk, turns the tail of the old chunk into a free object and updates the thread\'s <code>alloc_ptr</code>/<code>alloc_limit</code>.</li></ul><p>That is hundreds or thousands of instructions, but it happens once per many allocations.</p>',
      deep: 'In Server GC each core has its own heap, and the slow path can move a thread to another, less loaded heap (balancing). Small and large objects use different locks: <code>more_space_lock_soh</code> and <code>more_space_lock_uoh</code> in gc.cpp. So a thread allocating large arrays does not get in the way of threads with small objects — but threads with large arrays do get in each other\'s way.'
    },
    {
      t: 'order',
      q: 'Put the slow-path steps in order',
      items: [
        'The object did not fit in the rest of the chunk',
        'Take the heap lock',
        'Check the generation 0 budget',
        'Find a free piece and zero it',
        'Give the thread a new alloc_ptr and alloc_limit',
        'Retry the fast path'
      ],
      explain: 'The slow path starts with a fast-path miss and ends with the thread getting a fresh chunk, where the object is allocated with an ordinary bump. If the budget is exhausted, a collection happens between the third and fourth steps.'
    },
    {
      t: 'learn',
      title: 'The budget: new starts the collection',
      body: '<p>The collector does not watch the clock. Generation 0 has an <b>allocation budget</b> — how many bytes may be allocated before the next collection. Every chunk handed out is charged against it.</p><p>When the budget is exhausted, the slow path starts a collection <b>right on this thread</b>, and a <code>new</code> that normally costs nanoseconds waits for the collection to finish. All other managed threads are stopped meanwhile.</p><p>The key consequence: collection frequency is proportional to the <b>allocation rate</b>. Half the garbage per second means half as many generation 0 collections.</p>',
      deep: 'The budget is not fixed: the collector recomputes it after every collection — based on how many objects survived — within a lower and an upper bound. The initial size of generation 0 depends on the CPU cache size (L3), and is larger for Server GC. Besides allocation, collections are triggered by an explicit <code>GC.Collect</code>, a low-memory signal from the OS and some internal events — more on triggers in the unit "How a collection works".'
    },
    {
      t: 'choice',
      q: 'A service allocates 2 GB of short-lived objects per second, and almost all die in generation 0. What will you see in the counters?',
      options: [
        'Many generation 0 collections per second with a small heap',
        'A heap growing by 2 GB per second until OutOfMemoryException',
        'Rare but long full collections',
        'Nothing: the collector does not account for short-lived objects'
      ],
      answer: 0,
      explain: 'Every few megabytes of budget there is a generation 0 collection. Dead objects cost nothing to mark, so collections are short and the heap does not grow. The price is frequent thread suspensions: cut them down and the gain shows immediately.',
      wrong: { 1: 'Garbage does not pile up: each generation 0 collection reclaims its memory.', 2: 'Full collections are triggered by older generations and the LOH filling up, and almost nothing reaches them here.' }
    },
    {
      t: 'learn',
      title: 'The LOH: large objects apart',
      body: '<p>An object of <b>85,000 bytes</b> or more — the whole object counts, header included — is allocated not in generation 0 but in the <b>LOH</b> (large object heap). In practice it is almost always an array, or a long string: a string of 50,000 characters weighs over 100,000 bytes.</p><p>How such an allocation works:</p><ul><li>always the slow path, through its own lock;</li><li>room is found among the LOH free blocks, and the whole object is zeroed — for a megabyte array that is noticeable work;</li><li>the LOH has its own budget. Once it is exhausted, a <b>generation 2</b> collection runs — that is, a full one.</li></ul><p>The structure of the LOH itself is covered in the unit "Inside the heap".</p>',
      deep: 'The threshold can be changed with the <code>System.GC.LOHThreshold</code> setting in runtimeconfig.json (since .NET Core 3.0) — only upward from 85,000. By default the LOH is not compacted; free blocks are reused via a list, so alternating arrays of different sizes cause fragmentation; a one-off compaction is enabled with <code>GCSettings.LargeObjectHeapCompactionMode</code>. Then and now: in 32-bit .NET Framework, <code>double</code> arrays of 1000 elements or more went to the LOH below the threshold — for 8-byte alignment.'
    },
    {
      t: 'choice',
      q: 'Which of these objects lands in the LOH (64-bit process)?',
      options: [
        'new string(\'a\', 50_000)',
        'new int[20_000]',
        'new object[10_000]',
        'new List<long>(5_000)'
      ],
      answer: 0,
      explain: 'A char takes 2 bytes, so a 50,000-character string is over 100,000 bytes. int[20,000] is about 80,000 bytes, object[10,000] is 10,000 references of 8 bytes, also about 80,000. List<long>(5,000) is a small object plus an internal array of 40,000 bytes. All three are below the threshold.',
      wrong: { 2: 'A reference in a 64-bit process is 8 bytes: 80,000 bytes plus the header, the 85,000 threshold is not reached.', 3: 'The List itself is a small object, and its long[5,000] array is about 40,000 bytes.' }
    },
    {
      t: 'learn',
      title: 'A temporary large buffer is an expensive habit',
      body: '<p>A common sight in services: every request allocates a one-megabyte buffer, which is garbage a millisecond later. From the code\'s point of view, no big deal. From the collector\'s point of view:</p><ul><li>every buffer is a slow path plus zeroing a megabyte;</li><li>the buffers quickly eat the LOH budget;</li><li>each time it runs out — a full collection that walks the whole heap, not just young objects.</li></ul><p>In the counters this shows up as frequent generation 2 collections while hardly any old objects are added. The cure is reusing the buffer — a pool (lesson 4).</p>'
    },
    {
      t: 'tapline',
      q: 'A service runs several full collections per second. Which line is the prime suspect?',
      code: 'async Task HandleAsync(HttpRequest request)\n{\n    var headers = new Dictionary<string, string>();\n    var name = request.Path.ToString();\n    var buffer = new byte[1024 * 1024];\n    int read = await request.Body.ReadAsync(buffer);\n    Process(name, headers, buffer.AsSpan(0, read));\n}',
      answer: 4,
      explain: 'A megabyte per request is the LOH: slow path, zeroing and fast exhaustion of the LOH budget, after which a generation 2 collection runs. The dictionary and the string are small short-lived objects that die in generation 0.'
    },
    {
      t: 'match',
      q: 'Match the event and its consequence',
      pairs: [
        ['The thread\'s chunk ran out', 'The slow path hands out a new one'],
        ['Generation 0 budget exhausted', 'A generation 0 collection right inside new'],
        ['LOH budget exhausted', 'A full collection'],
        ['A type with a finalizer', 'Registered in the finalization queue on creation'],
        ['A 200,000-byte array', 'Straight to the LOH, bypassing generation 0']
      ]
    }
  ]
};

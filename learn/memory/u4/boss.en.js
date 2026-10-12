/** Memory in .NET, final of the unit "Allocation". */
export default {
  id: 'mem.u4.boss',
  title: 'Final: allocation',
  sub: 'Fast and slow paths, hidden objects, pools and measurements',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'The profiler says each new takes nanoseconds, yet the process spends 30% of its time in GC. What do you cut first?',
      options: [
        'The volume of allocations in hot code',
        'The number of threads, so there are fewer allocation contexts',
        'The size of the allocation context chunk',
        'Nothing — call GC.Collect() at the start of every request'
      ],
      answer: 0,
      explain: 'new itself is cheap, but every few megabytes exhaust the generation 0 budget and start a collection. Fewer bytes per second means fewer collections. A manual GC.Collect only adds collections.'
    },
    {
      t: 'multi',
      q: 'When does new take the slow path? Select all.',
      options: [
        'The thread\'s chunk has no room left for the object',
        'The object weighs 85,000 bytes or more',
        'The type has a finalizer',
        'The class is sealed',
        'The object is created inside a loop'
      ],
      answer: [0, 1, 2],
      explain: 'A new chunk, the LOH and registration in the finalization queue all need the collector. sealed and loops do not affect the allocation path.'
    },
    {
      t: 'choice',
      q: 'Which array ends up in the LOH (64-bit process)?',
      options: ['new long[11_000]', 'new long[10_000]', 'new byte[80_000]', 'new string(\'x\', 40_000)'],
      answer: 0,
      explain: 'long[11,000] is 88,000 bytes of data plus a header, above the 85,000 threshold. long[10,000] and byte[80,000] are about 80,000 bytes. A string of 40,000 two-byte characters is also about 80,000.'
    },
    {
      t: 'choice',
      q: 'Logging is almost always off, yet every call creates a closure object. How do you get rid of it?',
      code: 'void Handle(Request r)\n{\n    if (_logger.IsEnabled)\n        _logger.Log(() => $"Handle {r.Id}");\n    Process(r);\n}',
      options: [
        'Move the branch with the lambda into a separate method that takes r as a parameter',
        'Mark the lambda static',
        'Move the IsEnabled check inside the lambda',
        'Replace the lambda with a local function that captures r'
      ],
      answer: 0,
      explain: 'The parameter r is captured, so the closure is created on entry to Handle, before the check. In a separate method the closure is created only when that method is called. static will not compile — the lambda captures r. A local function converted to a delegate also needs a heap closure.',
      wrong: { 1: 'static forbids capture, and there is a capture here — a compile error.', 3: 'While a local function is called directly, its state can live in a struct on the stack. But here it is converted to a delegate for Log, and the state needs the heap.' }
    },
    {
      t: 'tapline',
      q: 'The loop runs a million times. On which line is a heap object created on every iteration?',
      code: 'long Total(IEnumerable<Order> orders)\n{\n    long sum = 0;\n    foreach (var o in orders)\n        sum += o.Amount;\n    return sum;\n}\n\nvar list = LoadOrders();  // List<Order>\nlong total = 0;\nfor (int i = 0; i < 1_000_000; i++)\n    total += Total(list);',
      answer: 3,
      explain: 'foreach over IEnumerable<Order> calls the interface GetEnumerator, and the List<Order>.Enumerator struct gets boxed. A parameter of type List<Order>, or IReadOnlyList<Order> with a for loop, would remove the allocation.'
    },
    {
      t: 'blanks',
      q: 'Measure how many bytes one call to Parse allocates on this thread',
      code: 'Parse(input);  // warm-up\nlong before = GC.___();\nParse(input);\nlong bytes = GC.GetAllocatedBytesForCurrentThread() - ___;',
      tiles: ['GetAllocatedBytesForCurrentThread', 'before', 'GetTotalMemory', 'Collect', 'bytes'],
      answer: ['GetAllocatedBytesForCurrentThread', 'before'],
      explain: 'The thread counter is monotonic and exact to the object, and the "after minus before" difference is the bytes of one call. GetTotalMemory shows the live heap, not what was allocated, and changes with collections.'
    },
    {
      t: 'choice',
      q: 'A method almost always completes synchronously and returns a number from a cache, usually in the hundreds. What does switching Task<int> to ValueTask<int> give you?',
      options: [
        'It removes the task allocation on the synchronous path',
        'It removes the state machine from the stack',
        'Nothing: Task<int> is cached for any value',
        'It speeds up awaiting incomplete operations'
      ],
      answer: 0,
      explain: 'Without an await the state machine lives on the stack anyway, but a Task<int> for a value like 300 is created anew — the cache covers only a few small numbers. ValueTask<int> carries the result inside. On the asynchronous path there is almost no difference.'
    },
    {
      t: 'choice',
      q: 'ArrayPool<byte>.Shared.Rent(1000) — what array length will you most likely get?',
      options: ['1024', '1000', '16', '4096'],
      answer: 0,
      explain: 'The shared pool sorts arrays into power-of-two buckets and hands out the smallest that fits — 1024. That is why you then work with buf.AsSpan(0, 1000), not the whole array.'
    },
    {
      t: 'match',
      q: 'Match the tool and what it shows',
      pairs: [
        ['GC.GetAllocatedBytesForCurrentThread', 'Bytes allocated by the current thread'],
        ['GC.GetTotalAllocatedBytes', 'Bytes allocated by the whole process'],
        ['Allocated in MemoryDiagnoser', 'Bytes per operation'],
        ['Gen0 in MemoryDiagnoser', 'Generation 0 collections per 1000 operations'],
        ['Allocation rate in dotnet-counters', 'Allocation speed in a running service']
      ]
    }
  ]
};

/** Memory in .NET, unit "Allocation", lesson 4: measuring allocations and removing them — pools, the stack, string.Create, cached delegates. */
export default {
  id: 'mem.u4.l4',
  title: 'Measure, then stop allocating',
  sub: 'Bytes per call, MemoryDiagnoser, ArrayPool, stackalloc and string.Create',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Measure first',
      body: '<p>Before removing allocations, find out how many there are. The most precise counter at hand is <code>GC.GetAllocatedBytesForCurrentThread()</code>: how many bytes the <b>current thread</b> has allocated over its lifetime. The runtime keeps it in the same allocation context, so the call is cheap and the "after minus before" difference is exact to the object.</p><p>Two rules:</p><ul><li>warm the code up with one call first: the first call pulls in the JIT, static constructors, lazy caches;</li><li>the counter is per thread: if the work moves to another thread (<code>Task.Run</code>, the thread pool), it will not see it.</li></ul>',
      code: 'static long BytesPerCall(Action action)\n{\n    action();  // warm-up: JIT, static constructors\n    long before = GC.GetAllocatedBytesForCurrentThread();\n    action();\n    return GC.GetAllocatedBytesForCurrentThread() - before;\n}\n\nConsole.WriteLine(BytesPerCall(() => "12,34,56".Split(\',\')));',
      deep: 'The counter is the allocation context\'s <code>alloc_bytes</code> plus <code>alloc_bytes_uoh</code> minus the unused remainder of the current chunk — which is why it is exact even though chunks are handed out 8 KB at a time. .NET Framework did not have this method; there you had to look at <code>AppDomain.MonitoringTotalAllocatedMemorySize</code> or at performance counters.'
    },
    {
      t: 'choice',
      q: 'The measurement shows 0 bytes, although the profiler sees thousands of objects per call. Why?',
      code: 'long before = GC.GetAllocatedBytesForCurrentThread();\nawait Task.Run(() => ProcessBatch(items));\nlong after = GC.GetAllocatedBytesForCurrentThread();',
      options: [
        'The work ran on a pool thread, and the counter only counts the current thread',
        'The counter ignores objects the GC has already collected',
        'Without a warm-up the counter always returns 0',
        'GetAllocatedBytesForCurrentThread counts only the LOH'
      ],
      answer: 0,
      explain: 'ProcessBatch ran on another thread, so its bytes went into that thread\'s context. This kind of measurement needs GC.GetTotalAllocatedBytes — the sum over all threads. The counter is monotonic: collections never decrease it.',
      wrong: { 1: 'The counter counts what was allocated, not what is alive: collected objects are not subtracted from it.' }
    },
    {
      t: 'learn',
      title: 'All threads and BenchmarkDotNet',
      body: '<p><code>GC.GetTotalAllocatedBytes(precise)</code> (.NET Core 3.0+) is how much the whole process has allocated. With <code>precise: false</code> the result may miss the remainders of the threads\' current chunks; <code>true</code> is more exact but noticeably more expensive.</p><p>To compare code variants, use BenchmarkDotNet with the <code>[MemoryDiagnoser]</code> attribute. The table gains columns:</p><ul><li><b>Allocated</b> — bytes per operation;</li><li><b>Gen0</b>, <b>Gen1</b>, <b>Gen2</b> — how many collections of each generation happened per <b>1000 operations</b>.</li></ul><p>In a running service, watch the allocation rate: the allocation rate counter in <code>dotnet-counters</code> (covered in the unit "How to measure").</p>',
      code: '[MemoryDiagnoser]\npublic class ParseBench\n{\n    private readonly string _line = "12,34,56";\n\n    [Benchmark(Baseline = true)]\n    public int Split() => _line.Split(\',\').Sum(int.Parse);\n\n    [Benchmark]\n    public int Span() => SumBySpan(_line);\n}'
    },
    {
      t: 'choice',
      q: 'MemoryDiagnoser reports for a method: Allocated = 160 B, Gen0 = 0.0153. What does it mean?',
      options: [
        'Each call allocates 160 bytes; there are about 0.015 generation 0 collections per 1000 calls',
        'Each call allocates 160 bytes and triggers 0.0153 collections',
        'The method keeps 160 bytes alive, 1.5% of which survive generation 0',
        'The whole run allocated 160 bytes, with almost no collections'
      ],
      answer: 0,
      explain: 'Allocated is bytes per operation, the GenN columns are collections per 1000 operations. That is one generation 0 collection per roughly 65,000 calls: 160 bytes × 65,000 ≈ 10 MB — the order of a generation 0 budget.',
      wrong: { 1: 'The number in the Gen0 column is per 1000 operations, not per one.' }
    },
    {
      t: 'learn',
      title: 'ArrayPool<T>: rent and return',
      body: '<p>A temporary buffer does not have to be allocated anew. <code>ArrayPool&lt;T&gt;.Shared</code> is a shared pool of arrays:</p><ul><li><code>Rent(n)</code> hands out an array of length <b>at least</b> n — usually the next power of two, so always remember your own length;</li><li><code>Return(array)</code> gives it back; by default the contents are not cleared, for secrets there is <code>clearArray: true</code>;</li><li>after <code>Return</code> the array is no longer yours.</li></ul><p>Inside, the pool has a per-thread cache and sets of arrays per core, so <code>Rent</code> and <code>Return</code> almost always avoid locks. For the buffers from the LOH lesson this is the cure: a megabyte is allocated once and lives in generation 2 instead of being created for every request.</p>',
      code: 'byte[] buf = ArrayPool<byte>.Shared.Rent(64 * 1024);\ntry\n{\n    int read = await stream.ReadAsync(buf);\n    Process(buf.AsSpan(0, read));\n}\nfinally\n{\n    ArrayPool<byte>.Shared.Return(buf);\n}',
      deep: 'The shared pool keeps arrays from 16 to 2³⁰ elements long, one bucket per power of two; for a bigger request it allocates a plain array and drops it on return. Under memory pressure the pool trims unused arrays by itself. Failing to return an array is not a leak — the GC collects it, the pool just does not help. A custom pool with other limits is <code>ArrayPool&lt;T&gt;.Create(maxArrayLength, maxArraysPerBucket)</code>.'
    },
    {
      t: 'tapline',
      q: 'The checksum sometimes does not match. Which line is wrong?',
      code: 'uint Hash(Stream stream, int count)\n{\n    byte[] buf = ArrayPool<byte>.Shared.Rent(count);\n    try\n    {\n        stream.ReadExactly(buf, 0, count);\n        return Checksum(buf);\n    }\n    finally\n    {\n        ArrayPool<byte>.Shared.Return(buf);\n    }\n}',
      answer: 6,
      explain: 'Rent(count) returned an array of at least count elements, usually more. Checksum(buf) also covers the tail, which holds the previous renter\'s data. It should be Checksum(buf.AsSpan(0, count)).'
    },
    {
      t: 'learn',
      title: 'stackalloc + Span: small things go on the stack',
      body: '<p><code>Span&lt;T&gt;</code> and <code>stackalloc</code> themselves are covered in the unit "Performance" of the "Deeper C#" course. Here is a working pattern for memory: a small buffer comes from the stack, a large one from the pool.</p><p>Keep the threshold small — usually hundreds of bytes, up to a couple of kilobytes: the thread stack is limited (the stack lesson in the unit "Memory through the OS’s eyes"), and an overflow cannot be caught. Never pass a size taken from input to <code>stackalloc</code> without a check.</p>',
      code: 'char[]? rented = null;\nSpan<char> buf = len <= 256\n    ? stackalloc char[256]\n    : (rented = ArrayPool<char>.Shared.Rent(len));\ntry\n{\n    Fill(buf[..len]);\n}\nfinally\n{\n    if (rented != null) ArrayPool<char>.Shared.Return(rented);\n}',
      deep: '<code>stackalloc</code> zeroes the buffer: locals in .NET are zero-initialized (the <code>localsinit</code> flag in IL). The <code>[SkipLocalsInit]</code> attribute (C# 9, requires <code>AllowUnsafeBlocks</code>) turns it off for a method or a type — then the buffer holds garbage and must not be read before it is written. The gain shows on buffers of hundreds of bytes in hot methods.'
    },
    {
      t: 'blanks',
      q: 'Complete the "small on the stack, large from the pool" pattern',
      code: 'byte[]? rented = null;\nSpan<byte> buf = size <= 512\n    ? ___ byte[512]\n    : (rented = ArrayPool<byte>.Shared.___(size));\n// ... work with buf[..size] ...\nif (rented != null) ArrayPool<byte>.Shared.___(rented);',
      tiles: ['stackalloc', 'Rent', 'Return', 'new', 'Create', 'Clear'],
      answer: ['stackalloc', 'Rent', 'Return'],
      explain: 'The stackalloc branch does not touch the heap; the pool branch rents an array and must return it. new byte[512] would work, but it would allocate a heap object on every call.'
    },
    {
      t: 'learn',
      title: 'string.Create: a string without an intermediate buffer',
      body: '<p>If the length of the final string is known up front, you can fill it in place. <code>string.Create(length, state, action)</code> allocates a string of the needed length and hands you its characters as a <code>Span&lt;char&gt;</code>. One allocation — the string itself, no <code>StringBuilder</code> and no temporary <code>char[]</code>.</p><p>The state is passed as an argument and the lambda is marked <code>static</code>: that way it captures nothing and the compiler caches the delegate.</p>',
      code: 'string id = string.Create(9, (Prefix: \'U\', N: 42), static (span, s) =>\n{\n    span[0] = s.Prefix;\n    s.N.TryFormat(span[1..], out _, "D8");\n});\n// "U00000042"',
      deep: 'Strings are immutable for everyone who can see them — but inside <code>string.Create</code> nobody has seen the string yet, so writing to it is safe. Do not keep the span beyond the lambda: after it returns, the string becomes an ordinary immutable one. Interpolation <code>$"..."</code> since C# 10 often gives a comparable result with no manual work; <code>string.Create</code> is for when the format is unusual or you need the exact length.'
    },
    {
      t: 'learn',
      title: 'Delegates: cache and static',
      body: '<p>The compiler caches a non-capturing lambda by itself. So the task is to get rid of the capture. Good APIs take the state as a separate argument for this: <code>ConcurrentDictionary.GetOrAdd</code>, <code>string.Create</code>, <code>ThreadPool.QueueUserWorkItem</code>, <code>CancellationToken.Register</code>.</p><p>The <code>static</code> keyword before a lambda (C# 9) turns "I hope there is no capture here" into a compiler check. If the delegate does carry state but is always the same, create it once and keep it in a field.</p>',
      code: '// captures this: a new delegate on every call\n_cache.GetOrAdd(key, k => Load(k, _options));\n\n// state as an argument: the delegate is cached\n_cache.GetOrAdd(key, static (k, opt) => Load(k, opt), _options);'
    },
    {
      t: 'choice',
      q: 'The code returned an array to the pool and kept reading from it. What happens?',
      code: 'var buf = ArrayPool<byte>.Shared.Rent(1024);\nint n = Fill(buf);\nArrayPool<byte>.Shared.Return(buf);\nSend(buf.AsSpan(0, n));',
      options: [
        'Usually it works, but sometimes it sends someone else\'s data: the array may already belong to another renter',
        'An ObjectDisposedException when the array is accessed',
        'Nothing bad: Return only marks the array while references to it exist',
        'The GC collects the array and Send reads freed memory'
      ],
      answer: 0,
      explain: 'The pool does not know you still hold a reference and checks nothing. The next Rent on this or another thread may get the same array and write to it while your Send runs. The bug does not crash, it silently corrupts data — which is why Return goes in finally, after the last use.',
      wrong: { 3: 'The array is an ordinary managed object: while a reference to it exists, the GC leaves it alone. The problem is different — shared ownership.' }
    },
    {
      t: 'match',
      q: 'Match the task and the tool',
      pairs: [
        ['A temporary buffer of hundreds of KB', 'ArrayPool<T>.Shared'],
        ['A 128-byte buffer in a hot method', 'stackalloc + Span<T>'],
        ['A string of known length built from parts', 'string.Create'],
        ['A GetOrAdd factory in hot code', 'A static lambda with state as an argument'],
        ['Comparing two variants by bytes', 'MemoryDiagnoser']
      ]
    }
  ]
};

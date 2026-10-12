/** Memory in .NET, unit "Inside the heap", lesson 4: SOH, LOH, POH, regions and the frozen heap. */
export default {
  id: 'mem.u3.l4',
  title: 'SOH, LOH, POH and regions',
  sub: 'Where an object lands and how the heap is built physically',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'The managed heap is several heaps',
      body: '<p>You saw generations 0, 1 and 2 in the .NET under the hood course. Physically, different heaps with different rules stand behind them:</p><ul><li><b>SOH</b> (small object heap) — ordinary objects, generations 0–2. The collector compacts it, sliding live objects together;</li><li><b>LOH</b> (large object heap) — objects of 85,000 bytes and more. Collected only together with generation 2, not compacted by default;</li><li><b>POH</b> (pinned object heap, .NET 5) — objects that never move;</li><li>the <b>non-GC heap</b> (.NET 8) — objects the collector never collects at all.</li></ul><p>Your code allocates in generation 0, in the LOH or in the POH. Objects get into generations 1 and 2 only by surviving a collection.</p>',
      deep: '<p>In the GC sources the LOH and POH together are called the <b>UOH</b> (user old heap): objects there are "old" from birth and are collected together with generation 2. That is why <code>GC.GetGeneration</code> returns 2 for them right away. In the internal numbering the LOH is generation 3 and the POH is 4.</p>'
    },
    {
      t: 'learn',
      title: 'The threshold is the object size, not the length',
      body: '<p>An object goes to the LOH when its <b>full size</b> — header, type pointer and length included — is at least 85,000 bytes. For a <code>byte[]</code> the bookkeeping is 24 bytes, so the boundary is a length of 84,976:</p><ul><li><code>new byte[84_976]</code> — exactly 85,000 bytes → LOH;</li><li><code>new byte[84_975]</code> — 84,999 → SOH;</li><li><code>new string(\'x\', 50_000)</code> — 22 + 100,000 → LOH.</li></ul><p>With collections it is often not the object itself that is large but its internal array: a <code>List&lt;int&gt;</code> is small, but its <code>int[]</code> of 30,000 elements is already in the LOH.</p>',
      code: 'Console.WriteLine(GC.GetGeneration(new byte[84_975])); // 0: SOH\nConsole.WriteLine(GC.GetGeneration(new byte[84_976])); // 2: straight to the LOH',
      deep: '<p>The threshold is configurable: <code>System.GC.LOHThreshold</code> in runtimeconfig.json (.NET Core 3.0+), and only upwards from the default. The effective value is visible in <code>GC.GetConfigurationVariables()</code> under the name <code>LOHThreshold</code>. The number 85,000 came from performance tuning, it is not a power of two.</p>'
    },
    {
      t: 'multi',
      q: 'What goes straight to the LOH? Select all.',
      options: ['new byte[84_990]', 'new int[20_000]', 'new string(\'x\', 45_000)', 'new long[10_000]', 'The internal array of new List<int>(30_000)'],
      answer: [0, 2, 4],
      explain: 'byte[84_990] is 85,014 bytes. A 45,000-character string is 90,022. The list\'s array is an int[30,000], 120,024 bytes. But int[20,000] and long[10,000] are 80,024 bytes each — that is the SOH.'
    },
    {
      t: 'learn',
      title: 'The LOH is not compacted — by default',
      body: '<p>Moving objects of a hundred kilobytes and more is expensive, so in the LOH the collector does a <b>sweep</b>: dead objects become free blocks, and a free list is built from them. A new large object looks for a fitting gap there. If the gaps are smaller than needed, memory grows even though there is plenty of free space in total. That is <b>fragmentation</b>.</p><p>You can compact the LOH on demand: <code>GCSettings.LargeObjectHeapCompactionMode = CompactOnce</code>. The next blocking generation 2 collection compacts the LOH, and the mode switches back to <code>Default</code> by itself.</p>',
      code: 'GCSettings.LargeObjectHeapCompactionMode =\n    GCLargeObjectHeapCompactionMode.CompactOnce;\nGC.Collect();  // a full blocking collection compacts the LOH\n// now the mode is Default again',
      deep: '<p>The mode appeared in .NET Framework 4.5.1. The runtime may also compact the LOH on its own: for example, when <code>System.GC.ConserveMemory</code> is set (.NET 6+, values 1–9) and fragmentation is too high. But the best remedy is not to create large temporary arrays: rent them from <code>ArrayPool&lt;T&gt;</code>. More on that in the "Allocation" unit.</p>'
    },
    {
      t: 'blanks',
      q: 'Ask for the LOH to be compacted at the next full collection, and run it',
      code: 'GCSettings.___ =\n    GCLargeObjectHeapCompactionMode.___;\nGC.___();',
      tiles: ['LargeObjectHeapCompactionMode', 'CompactOnce', 'Collect', 'Default', 'LatencyMode', 'AlwaysCompact'],
      answer: ['LargeObjectHeapCompactionMode', 'CompactOnce', 'Collect'],
      explain: 'The enum has only two values: Default and CompactOnce. There is no "always compact" — the mode is one-shot and resets after the collection.'
    },
    {
      t: 'learn',
      title: 'POH: a heap for pinned objects',
      body: '<p>Native code and devices need a buffer address that will not move. You can pin an object in the SOH — <code>fixed</code> or <code>GCHandle.Alloc(..., Pinned)</code> — but it becomes a rock in the middle of generation 0: the collector cannot move it or compact the memory around it.</p><p>The <b>POH</b> (.NET 5) solves this: objects there never move, so there is no need to pin them. To allocate an array in the POH — <code>GC.AllocateArray&lt;T&gt;(length, pinned: true)</code>, or <code>GC.AllocateUninitializedArray&lt;T&gt;(length, pinned: true)</code> without zeroing.</p><p>The POH is collected together with generation 2 and is not compacted. It suits long-lived I/O buffers, not short-lived temporary ones.</p>',
      code: 'byte[] buf = GC.AllocateArray<byte>(4096, pinned: true);\nunsafe\n{\n    fixed (byte* p = buf) { }  // the address will never change\n}\nConsole.WriteLine(GC.GetGeneration(buf)); // 2',
      deep: '<p>In .NET 5–7, with <code>pinned: true</code> the type <code>T</code> could not be a reference type or contain references; since .NET 8 the restriction is gone. The API offers arrays only — you cannot allocate an ordinary object in the POH. A separate POH limit under a hard heap limit is set with <code>System.GC.HeapHardLimitPOH</code>.</p>'
    },
    {
      t: 'choice',
      q: 'A 4 KB buffer lives for the whole lifetime of a service, and its address is constantly passed to native I/O. How should you allocate it?',
      options: ['GC.AllocateArray<byte>(4096, pinned: true)', 'new byte[4096] and GCHandle.Alloc(buf, GCHandleType.Pinned) forever', 'new byte[100_000] so it lands in the LOH — nothing moves there', 'stackalloc byte[4096] in Main'],
      answer: 0,
      explain: 'The POH was made exactly for this: the object never moves and does not get in the way of compacting generation 0.',
      wrong: { 1: 'It works, but a pinned object in the SOH gets in the way of compaction and fragments the young generations until it is promoted to generation 2.', 2: 'The LOH is not compacted only by default: CompactOnce or ConserveMemory can move it. Only pinning or the POH guarantee an object stays put.', 3: 'The stack does not outlive the method, and you cannot hand it to asynchronous I/O.' }
    },
    {
      t: 'learn',
      title: 'Segments and regions',
      body: '<p>Before .NET 7 the heap was made of <b>segments</b> — large chunks of address space. Generations 0 and 1 lived together in one "ephemeral" segment, generation 2 and the LOH in their own. Free space inside a segment could not be given to another generation. A segment went back to the OS only when it became completely empty; otherwise only the tail after the last live object was released.</p><p>Since .NET 7, on 64-bit Windows and Linux the heap is made of <b>regions</b>: small blocks, by default <b>4 MB</b> for the SOH and <b>32 MB</b> for the LOH and POH. Each region belongs to one generation. Regions that survived a collection can be "promoted" to an older generation as a whole, and empty ones go back to a shared list to be given to any generation or to the OS.</p><p>As in the "Memory through the OS’s eyes" unit: at startup the GC <b>reserves</b> a large address range for regions — 256 GB by default — but commits memory only as needed.</p>',
      deep: '<p>The range is visible in <code>GC.GetConfigurationVariables()</code> as <code>GCRegionRange</code>; with a hard heap limit it is smaller — five times the limit. The region size is changed with <code>DOTNET_GCRegionSize</code> (.NET 7+) or <code>System.GC.RegionSize</code> in runtimeconfig.json (.NET 10). An object larger than a region gets a region of its own size. In .NET 7 the old segments implementation shipped as a separate clrgc library that could be plugged in with <code>DOTNET_GCName</code> in case of regressions.</p>'
    },
    {
      t: 'choice',
      q: 'A .NET 8 service on Linux without memory limits. top shows a VIRT of over 256 GB for the process, while RES is 300 MB. What is it?',
      options: ['The GC reserved an address range for regions — this is not used memory', 'A leak in the LOH', 'The service allocated 256 GB in the POH', 'The process\'s swap file'],
      answer: 0,
      explain: 'A reservation of addresses costs nothing physically, as we covered in the "Memory through the OS’s eyes" unit. Used memory is RES and committed pages, not VIRT.',
      wrong: { 1: 'A leak would grow RES and the heap size, not just the virtual address space.' }
    },
    {
      t: 'learn',
      title: 'The non-GC heap: frozen segments in .NET 8',
      body: '<p>Some objects live until the process ends and hold no references the GC needs to know about. In .NET 8 the runtime puts them on the <b>non-GC heap</b> (also called frozen): the collector neither collects nor moves it. It holds:</p><ul><li>string literals;</li><li>the <code>Type</code> objects returned by <code>typeof(T)</code>;</li><li>empty arrays from <code>Array.Empty&lt;T&gt;()</code>;</li><li>the boxes of static struct fields without references.</li></ul><p>The win is in machine code: the address of such an object never changes, and the JIT bakes it right into the instruction, without a read through an intermediate cell.</p>',
      code: 'Console.WriteLine(GC.GetGeneration("hello"));        // 2147483647\nConsole.WriteLine(GC.GetGeneration(typeof(string))); // 2147483647\nConsole.WriteLine(GC.GetGeneration(new object()));   // 0',
      deep: '<p>This is a documented .NET 8 change: <code>GC.GetGeneration</code> may return <code>int.MaxValue</code> for objects on the non-GC heap — do not use the result as an array index. What exactly goes there is an implementation detail: for example, <code>typeof</code> for a type from a collectible context does not, otherwise the type could never be unloaded. The idea grew out of Native AOT\'s frozen segments, where such objects are prepared at build time.</p>'
    },
    {
      t: 'match',
      q: 'Where does the object land in .NET 8+?',
      pairs: [
        ['new byte[100]', 'SOH, generation 0'],
        ['new byte[100_000]', 'LOH'],
        ['GC.AllocateArray<byte>(100, pinned: true)', 'POH'],
        ['The string literal "ok"', 'Non-GC heap']
      ]
    },
    {
      t: 'tapline',
      q: 'Which line prints 2147483647 on .NET 8+?',
      code: 'var a = new byte[10];\nvar b = new byte[100_000];\nvar c = GC.AllocateArray<byte>(10, pinned: true);\nstring d = "literal";\nConsole.WriteLine(GC.GetGeneration(a));\nConsole.WriteLine(GC.GetGeneration(b));\nConsole.WriteLine(GC.GetGeneration(c));\nConsole.WriteLine(GC.GetGeneration(d));',
      answer: 7,
      explain: 'a is 0, b (LOH) and c (POH) are 2: these heaps are collected together with generation 2. The literal lives on the non-GC heap, and GetGeneration returns int.MaxValue for it.'
    }
  ]
};

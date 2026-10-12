/** Memory in .NET, unit 2, lesson 1: which memory numbers the OS and the GC report and how they relate. */
export default {
  id: 'mem.u2.l1',
  title: 'Memory numbers',
  sub: 'Task Manager, top and what the GC itself knows',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Numbers nested like dolls',
      body: '<p>In unit 1 you saw that a process has several numbers for "used" memory. For .NET add one more layer — what the garbage collector knows. From the inside out:</p><ul><li><b>live objects</b> — what the roots can reach;</li><li><b>the managed heap</b> — live objects, plus garbage not yet collected, plus gaps between objects (fragmentation);</li><li><b>the GC commit</b> — memory the GC has committed for the heap, with headroom for new allocations;</li><li><b>private bytes</b> of the whole process — the heap plus everything unmanaged: thread stacks, JIT-compiled code, runtime structures, native library buffers.</li></ul><p>The working set sits to the side: it is the part of all this that is in RAM right now.</p>',
      deep: 'Typical orders of magnitude for a service: hundreds of megabytes of live objects, a slightly larger heap, a GC commit noticeably larger than the heap (especially with Server GC, where every core has its own heap and its own budget), and tens or hundreds of megabytes of unmanaged memory between private bytes and the GC commit. If that gap grows, the leak is not in the managed heap.'
    },
    {
      t: 'choice',
      q: 'A service has 2 GB of private bytes, while the GC reports a 300 MB managed heap. Where is the rest?',
      options: [
        'In unmanaged memory: native libraries, stacks, runtime structures',
        'In objects the GC has not counted yet',
        'In the reserved address range of the heap',
        'In the page file, so it does not matter'
      ],
      answer: 0,
      explain: 'Private bytes are the commit of the whole process, and the heap is only part of it. A reservation is not counted in private bytes, and the heap already includes uncollected garbage. 1.7 GB outside the heap is a reason to look for a native leak.',
      wrong: { 2: 'A reservation is just addresses. It grows virtual size, not private bytes.' }
    },
    {
      t: 'learn',
      title: 'What Task Manager and top show',
      body: '<p><b>Task Manager</b> shows the private working set in its "Memory" column: the process’s pages in RAM, minus shared ones. It is neither the heap size nor the commit. On the "Details" tab you can enable a commit size column — that is closer to private bytes.</p><p><b>top</b> on Linux:</p><ul><li><code>VIRT</code> — all of the process’s addresses; for .NET that is hundreds of gigabytes of reservation;</li><li><code>RES</code> — resident memory (RSS), shared pages included;</li><li><code>SHR</code> — the part of RES the process may share with others: libraries, mapped files.</li></ul><p>None of these tools knows what a managed heap is.</p>',
      deep: 'In a container there is one more number — what the cgroup counts (memory.current in cgroup v2). It also includes the page cache of files the process has read, so it can be larger than RSS. The .NET runtime sees the cgroup limit and derives its heap limit from it. For a precise breakdown of RSS on Linux, look at /proc/PID/smaps_rollup, as in unit 1.'
    },
    {
      t: 'match',
      q: 'Match the column with what it counts',
      pairs: [
        ['top: VIRT', 'All addresses, including the heap reservation'],
        ['top: RES', 'The process’s pages in RAM, shared ones included'],
        ['top: SHR', 'Pages that can be shared with other processes'],
        ['Task Manager: "Memory"', 'The private working set']
      ]
    },
    {
      t: 'learn',
      title: 'GC.GetTotalMemory: cheap but approximate',
      body: '<p><code>GC.GetTotalMemory(false)</code> returns the managed heap size <b>excluding fragmentation</b>. Dead objects that have not been collected yet are included: after a burst of temporary allocations the number grows, after a collection it drops.</p><p><code>GC.GetTotalMemory(true)</code> first lets the collector collect garbage and run finalizers — it triggers full collections until the number stops changing noticeably. You get close to "live only", but at the price of a full blocking collection, which on a large heap is a long pause.</p><p>Rule: <code>false</code> for metrics and logs, <code>true</code> only in tests and experiments.</p>',
      deep: 'The documentation used to call the result "the number of bytes currently thought to be allocated". The wording is more precise now: the heap size minus fragmentation, that is, minus free objects. The gc-heap-size counter of the old EventCounters was computed exactly through GetTotalMemory(false). How much has been allocated over the life of the process is a different question, answered by GC.GetTotalAllocatedBytes() (since .NET Core 3.0).'
    },
    {
      t: 'tapline',
      q: 'Which line can stop all threads for a full garbage collection?',
      code: 'long approx = GC.GetTotalMemory(false);\nlong settled = GC.GetTotalMemory(true);\nvar info = GC.GetGCMemoryInfo();\nlong total = GC.GetTotalAllocatedBytes();\nlong ws = Environment.WorkingSet;',
      answer: 1,
      explain: 'GetTotalMemory(true) triggers full collections itself and waits for finalizers. The other calls only read counters: GetGCMemoryInfo returns data about a past collection, GetTotalAllocatedBytes without precise does not stop threads, WorkingSet asks the OS.'
    },
    {
      t: 'learn',
      title: 'GC.GetGCMemoryInfo: a snapshot of the last collection',
      body: '<p>Since .NET Core 3.0 you can ask the GC for details, and since .NET 5 you can choose which collection: <code>GCKind.Any</code>, <code>Ephemeral</code>, <code>FullBlocking</code>, <code>Background</code>. All numbers are <b>as of that collection</b>, not now.</p><ul><li><code>HeapSizeBytes</code> — the heap size, fragmentation included;</li><li><code>FragmentedBytes</code> — free gaps inside the heap;</li><li><code>TotalCommittedBytes</code> — how much memory the GC has committed;</li><li><code>PromotedBytes</code> — how much survived that collection;</li><li><code>GenerationInfo[i]</code> — size and fragmentation of each generation before and after the collection;</li><li><code>PauseDurations</code>, <code>PauseTimePercentage</code> — how long threads were stopped.</li></ul>',
      code: 'var full = GC.GetGCMemoryInfo(GCKind.FullBlocking);\nlong live = full.HeapSizeBytes - full.FragmentedBytes;\nConsole.WriteLine($"#{full.Index}: about {live >> 20} MB live, " +\n                  $"commit {full.TotalCommittedBytes >> 20} MB");',
      deep: 'GenerationInfo is indexed like this: 0, 1, 2 are the generations, 3 is the LOH, 4 is the POH. Index is the sequence number of the collection; if it has not changed between two calls, you are looking at the same collection. There is also memory pressure data: MemoryLoadBytes, HighMemoryLoadThresholdBytes, TotalAvailableMemoryBytes — the GC uses them to decide when to compact more aggressively. In a container TotalAvailableMemoryBytes reflects the limit.'
    },
    {
      t: 'blanks',
      q: 'Estimate the volume of live objects from the last full blocking collection',
      code: 'var info = GC.GetGCMemoryInfo(GCKind.___);\nlong live = info.___ - info.___;',
      tiles: ['FullBlocking', 'HeapSizeBytes', 'FragmentedBytes', 'TotalCommittedBytes', 'Ephemeral', 'PromotedBytes'],
      answer: ['FullBlocking', 'HeapSizeBytes', 'FragmentedBytes'],
      explain: 'After a full blocking collection all garbage is gone, and the heap is live objects plus free gaps. Subtract fragmentation from the heap size. TotalCommittedBytes includes headroom, and an ephemeral collection did not touch generation 2.'
    },
    {
      t: 'learn',
      title: 'A big heap is not yet a leak',
      body: '<p>The collector does not remove garbage immediately. It runs when a generation has used up its allocation <b>budget</b>. Until then the garbage stays in the heap and is counted in every number.</p><p>That is why a heap graph under load is a <b>sawtooth</b>: growth, a collection, a drop. The height of the teeth says little. A leak looks different: the <b>floor</b> of the sawtooth grows — the heap size after full collections, from one to the next, under steady load.</p><p>Also: Server GC keeps a separate heap and a separate budget per core, so gigabytes of heap on a 32-core machine can be normal.</p>',
      deep: 'Since .NET 9, DATAS is on by default for Server GC: the number of heaps and the budgets adapt to the load, and a lightly loaded service no longer inflates its heap across all cores. In .NET 8 DATAS existed but had to be enabled by a setting. The GC may not return memory to the OS right after a spike — decommit follows its own rules too.'
    },
    {
      t: 'choice',
      q: 'Which sign points most strongly to a leak in the managed heap?',
      options: [
        'The heap size after each full collection grows from one to the next under steady load',
        'Under load the heap saws between 200 MB and 900 MB',
        'The process virtual size is 260 GB',
        'The working set grew in the first minute after startup and then stays flat'
      ],
      answer: 0,
      explain: 'A sawtooth is the collector working normally, a huge virtual size is an address reservation, growth at startup is warm-up. A leak shows as a rising floor: what survives full collections gets bigger every time.'
    },
    {
      t: 'learn',
      title: 'Managed or native leak',
      body: '<p>Compare two graphs: the process’s private bytes and the GC heap.</p><ul><li><b>They grow together</b> — the leak is in the managed heap. Heap snapshots show it, and the rest is technique (lesson 3).</li><li><b>The heap is flat, private bytes grow</b> — memory goes around the GC: <code>Marshal.AllocHGlobal</code> without a free, a native library, unreleased OS handles, multiplying threads. A managed heap snapshot shows almost nothing here.</li><li><b>The heap grows, but there are few live objects</b> — fragmentation: look at <code>FragmentedBytes</code> and pinned objects.</li></ul>',
      deep: 'A common hybrid: a small managed wrapper object holds a big native buffer. The heap snapshot shows thousands of 32-byte objects, and behind them gigabytes of native memory. The hint is a type with a finalizer or a SafeHandle whose count keeps growing. The native memory itself is hunted with native tools: on Linux, for example, heaptrack; on Windows, OS heap tracing via ETW.'
    },
    {
      t: 'multi',
      q: 'What increases the process’s private bytes but not the managed heap? Select all.',
      options: [
        'Marshal.AllocHGlobal in a loop without FreeHGlobal',
        'A native image-decoding library does not free its buffers',
        'A static List<byte[]> that keeps getting new arrays',
        'Short-lived objects subscribing to an event of a long-lived one',
        'String concatenation in a loop'
      ],
      answer: [0, 1],
      explain: 'AllocHGlobal and native buffers take memory around the GC. The static list and the event subscription are leaks, but in the managed heap. Concatenation produces garbage the GC will collect.'
    }
  ]
};

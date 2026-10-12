/** Memory in .NET, unit "GC modes", lesson 1: Workstation and Server GC. */
export default {
  id: 'mem.u6.l1',
  title: 'Workstation and Server',
  sub: 'One heap or a heap per core, whose thread collects and what it costs',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'One collector, two modes',
      body: '<p>.NET has one garbage collector, but it comes in two main flavors: <b>Workstation</b> and <b>Server</b>. The algorithm is shared — generations, marking, compaction. What differs is how many heaps there are, which threads collect, and how freely the collector spends memory to gain speed.</p><p>The flavor is picked <b>once, at process startup</b>, and never changes afterwards. You can see which one you got from code:</p>',
      code: 'using System.Runtime;\n\nConsole.WriteLine(GCSettings.IsServerGC);      // True or False\nConsole.WriteLine(GCSettings.LatencyMode);     // Interactive — see lesson 2\nConsole.WriteLine(Environment.ProcessorCount); // how many cores the process sees',
      deep: '<p>Each flavor also comes as <b>background</b> (the default) or <b>non-concurrent</b> — a second, independent switch covered in the next lesson. That makes four combinations.</p><p>Inside the runtime these are literally two builds of the same <code>gc.cpp</code> code: with the <code>MULTIPLE_HEAPS</code> macro (Server) and without it (Workstation). At startup the runtime picks the matching implementation of the <code>IGCHeap</code> interface.</p>'
    },
    {
      t: 'learn',
      title: 'Workstation: whoever allocated, collects',
      body: '<p>In Workstation mode the process has a single managed heap. A collection runs <b>right on the thread</b> whose allocation triggered it: the thread asked for room for an object, the gen0 budget ran out — and that same thread suspends the others and collects.</p><p>It keeps its normal priority, like the other user threads, so the collection competes with them for CPU. In exchange there are no extra threads and no extra heaps — the memory footprint is minimal.</p><p>This is the default for an ordinary console or desktop app.</p>',
      deep: '<p>"Suspends the others" means stopping managed threads at safepoints, covered in the unit "How a collection works". Threads running native code at that moment (P/Invoke) are not suspended in either mode: they are simply not allowed back into managed code until the collection ends.</p><p>With background GC on, Workstation gets one more dedicated thread — for background gen2 collections. If it has nothing to do for a while, that thread exits and is created again for the next background collection.</p>'
    },
    {
      t: 'choice',
      q: 'A console app runs Workstation GC (non-concurrent). Thread A allocated an object and the gen0 budget is exhausted. Which thread performs the collection?',
      options: ['Thread A', 'A dedicated high-priority GC thread', 'A thread pool thread', 'The finalizer thread'],
      answer: 0,
      explain: 'In Workstation GC the collection runs on the thread that triggered it, at that thread\'s normal priority. Dedicated GC threads are a Server GC feature.',
      wrong: { 1: 'That is how Server GC works: each heap has its own GC thread.', 3: 'The finalizer thread only runs finalizers after a collection; it does not collect garbage itself.' }
    },
    {
      t: 'learn',
      title: 'Server: a heap and a thread per core',
      body: '<p>In Server mode the collector creates <b>one heap per logical processor</b> and, for each heap, a <b>dedicated GC thread</b>. On 16 cores that is 16 heaps and 16 GC threads. On Windows these threads run at <code>THREAD_PRIORITY_HIGHEST</code>.</p><p>An application thread allocates in "its own" heap — usually the one tied to its core. So 16 threads can allocate in parallel without crowding around one pointer. References across heaps are allowed: an object in heap 3 can point to an object in heap 7.</p><p>When a collection is needed, <b>all</b> GC threads wake up and collect <b>all</b> heaps at once, each its own.</p>',
      deep: '<p>Each heap has its own generations, its own SOH and LOH (and POH). The collector balances allocations: if one heap is overloaded, a thread may start allocating in a neighbor. By default GC threads are pinned to cores (affinitized); <code>System.GC.NoAffinitize</code> turns that off and <code>System.GC.HeapAffinitizeMask</code> limits the set of cores.</p><p>Note that GC threads do not "live" in the background collecting all the time. A collection still stops the application — the pause is just shorter because N threads share the work.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about Server GC? Select all.',
      options: [
        'Every logical processor gets its own heap and its own GC thread',
        'An object in one heap can reference an object in another',
        'A collection does not suspend application threads',
        'During a collection the heaps are collected in parallel',
        'The number of heaps can be changed from code at run time'
      ],
      answer: [0, 1, 3],
      explain: 'Application threads are still suspended for a blocking collection — Server GC shortens the pause, it does not remove it. The heap count is set at startup (only the collector itself changes it at run time, in DATAS mode — lesson 3).'
    },
    {
      t: 'learn',
      title: 'The price of Server GC: memory and CPU',
      body: '<p>Server GC assumes the process is <b>the main one on the machine</b>. It allows more allocation before the next collection: the gen0 budget is per heap, and there are many heaps. Fewer collections and higher throughput — but a noticeably bigger heap. The same service on 4 cores and on 64 cores can take very different amounts of memory.</p><p>The second bill is CPU. Twelve Server GC processes on a four-core machine: if they collect at the same time, each core gets twelve high-priority GC threads. They get in each other\'s way and everyone else\'s.</p><p>That is why, for many small processes on one machine, the documentation recommends Workstation, sometimes with background GC turned off — fewer threads and context switches.</p>',
      deep: '<p>A middle ground is Server GC with a capped heap count: <code>System.GC.HeapCount</code>. For example, 4 heaps on a 32-core machine that runs several services. Since .NET 9, DATAS largely solves this — the collector picks the heap count itself (lesson 3).</p><p>Then and now: in .NET Framework 4.0 and earlier, Server GC was non-concurrent only; background GC for Server arrived in 4.5. In .NET (Core), Server GC is background by default.</p>'
    },
    {
      t: 'choice',
      q: 'One 8-core VM runs 30 small background services on .NET 8, each holding tens of megabytes. Which GC mode makes the most sense?',
      options: [
        'Workstation — each process has one heap and no eight GC threads',
        'Server — more GC threads, so everyone gets shorter pauses',
        'Server with LowLatency — fewer pauses',
        'It does not matter: the mode affects only speed, not memory'
      ],
      answer: 0,
      explain: 'Thirty Server GC processes means 240 high-priority GC threads and 240 heaps with their own budgets. For small services that is wasted memory and CPU contention. Workstation is the natural choice here.',
      wrong: { 1: 'If the services collect at the same time, their GC threads will preempt each other on the same eight cores.', 2: 'LowLatency does not apply to Server GC at all — it is a Workstation-only mode (lesson 2).', 3: 'The mode strongly affects memory: Server GC has more heaps and bigger budgets.' }
    },
    {
      t: 'learn',
      title: 'Who picks the default',
      body: '<p>The runtime itself defaults to <b>Workstation</b>. Server is turned on by whoever builds the app:</p><ul><li><b>ASP.NET Core</b> — a project on <code>Microsoft.NET.Sdk.Web</code>: that SDK sets the <code>ServerGarbageCollection</code> property to <code>true</code> unless you set it yourself. That is why web apps run on Server GC out of the box.</li><li>Console, WPF, WinForms, MAUI, plain <code>Microsoft.NET.Sdk</code> — Workstation.</li></ul><p>The MSBuild property only writes <code>"System.GC.Server": true</code> into the <code>app.runtimeconfig.json</code> file next to the assembly — that is what the runtime reads.</p><p>One exception to every rule: if the process has <b>a single</b> logical processor available, Server GC does not turn on — Workstation runs instead.</p>',
      code: '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net9.0</TargetFramework>\n    <!-- The Web SDK already sets true; false brings back Workstation -->\n    <ServerGarbageCollection>false</ServerGarbageCollection>\n  </PropertyGroup>\n</Project>',
      deep: '<p>There are two ways to check what actually made it into the build: open <code>bin/.../app.runtimeconfig.json</code> and look at <code>configProperties</code>, or call <code>GC.GetConfigurationVariables()</code> (.NET 7+) inside the process — a dictionary of the collector\'s effective settings, including <code>ServerGC</code>.</p><p>In .NET Framework the choice lived in <code>app.config</code> (<code>&lt;gcServer enabled="true"/&gt;</code>), and for ASP.NET under IIS the host decided. In modern ASP.NET Core in-process under IIS, the app\'s <code>runtimeconfig.json</code> still decides.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line does not compile?',
      code: 'using System.Runtime;\n\nbool server = GCSettings.IsServerGC;\nConsole.WriteLine(server ? "Server" : "Workstation");\nGCSettings.IsServerGC = !server;\nConsole.WriteLine(GCSettings.LatencyMode);',
      answer: 4,
      explain: 'IsServerGC is read-only: the mode is chosen at process startup and cannot be changed in-process. Error CS0200. You can switch modes only in configuration, followed by a restart.'
    },
    {
      t: 'learn',
      title: 'Why Server is faster on the same heap',
      body: '<p>Take a 4 GB heap. In Workstation one thread marks and compacts it. In Server on 16 cores, 16 threads share the same work: each walks its own heap, and cross-heap references are handled during marking. The pause of a full blocking collection gets several times shorter.</p><p>The second reason is allocation. With Workstation all threads live in one heap, and when their allocation contexts need a new chunk they take turns getting it. With Server the heaps are separate, so the line is shorter.</p><p>Bottom line: Server GC is about <b>throughput</b> and short pauses on big heaps; Workstation is about <b>saving</b> memory and CPU.</p>',
      deep: '<p>Parallelism is not free: GC threads synchronize at phase boundaries (mark → plan → relocate), and the slowest one holds up everybody. If live data is spread unevenly, some threads sit idle. The collector can steal marking work from neighbors (mark stealing) to smooth out the imbalance.</p>'
    },
    {
      t: 'match',
      q: 'Match the trait with the mode',
      pairs: [
        ['Collects on the thread that allocated', 'Workstation'],
        ['GC thread at the highest priority on Windows', 'Server'],
        ['Turned on by Microsoft.NET.Sdk.Web', 'ServerGarbageCollection = true'],
        ['The only mode on a single core', 'Workstation, even if Server was requested'],
        ['Find out the mode from code', 'GCSettings.IsServerGC']
      ]
    },
    {
      t: 'choice',
      q: 'A service moved from a 4-core machine to a 64-core one, same load, .NET 8, Server GC. The managed heap grew several times over. What happened?',
      options: [
        'There are now 64 heaps, each with its own gen0 budget — the collector allows more allocation before a GC',
        'A memory leak: objects live longer on a big machine',
        'On 64 cores Server GC turns off compaction',
        'The heap did not grow, it is a counter bug'
      ],
      answer: 0,
      explain: 'Server GC sizes its budget for throughput and heap count, not for the amount of live data. More cores means more heaps and more memory. This is exactly the problem DATAS solves — opt-in in .NET 8, on by default in .NET 9 (lesson 3). Without DATAS, System.GC.HeapCount or Workstation helps.'
    }
  ]
};

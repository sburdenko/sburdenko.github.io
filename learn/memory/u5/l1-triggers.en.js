/** Memory in .NET, unit "How a collection works", lesson 1: when a GC starts — budgets, GC.Collect, low memory. */
export default {
  id: 'mem.u5.l1',
  title: 'When a collection starts',
  sub: 'Generation budgets, GC.Collect and low-memory signals',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Allocations trigger collections',
      body: '<p>The garbage collector does not run on a timer, and it does not watch for objects becoming garbage. Most of the time a collection is triggered by an <b>allocation</b>.</p><p>Every generation has an <b>allocation budget</b>: how many bytes may be allocated in it before the next collection. Every <code>new</code> spends the Gen 0 budget. Once the budget is gone, the next allocation triggers a collection.</p><p>The check is not in every <code>new</code>. A thread allocates by bumping a pointer inside its own allocation context, and it looks at the budget only on the <b>slow path</b>, when the context is used up and it needs a new chunk. The unit "Allocation" covers this in detail.</p>',
      deep: '<p>The runtime derives the starting Gen 0 budget from the CPU cache size: the Workstation GC sources take 4/5 of the largest cache per logical processor (no less than 256 KB) and then multiply the result by 5/8, so the minimum budget ends up at about half of that cache. After that the budget is tuned after every collection. You can set it by hand with the <code>GCgen0size</code> setting, and DATAS mode (unit "GC modes") deliberately keeps Gen 0 small.</p><p>Why the cache: if Gen 0 fits in the cache, freshly allocated objects are still hot when the collector walks them.</p>'
    },
    {
      t: 'choice',
      q: 'At what moment does a thread check whether it is time to start a collection?',
      options: [
        'When its allocation context runs out and it goes to get a new chunk of memory',
        'On every new, before bumping the pointer',
        'On a runtime timer, roughly every 100 ms',
        'When the last reference to an object is set to null'
      ],
      answer: 0,
      explain: 'The fast path of new is a pointer bump with no checks. The budget is checked on the slow path, when the thread asks the heap for a new chunk for its allocation context.',
      wrong: { 3: 'The GC does not count references and does not know when an object became garbage. That only comes out during marking.' }
    },
    {
      t: 'learn',
      title: 'The budget is alive: it is recomputed after every collection',
      body: '<p>A budget is not a constant. After a collection the GC looks at the generation\'s <b>survival rate</b>: what share of objects survived.</p><ul><li>Few survived: the collection was productive, the budget can stay small.</li><li>Many survived: the collection freed almost nothing. The budget grows: collecting often is pointless, let more garbage pile up.</li></ul><p>A key detail: the budgets of older generations are spent not by <code>new</code> but by <b>promotion</b>. Survivors of a Gen 0 collection move to Gen 1 and spend its budget. Survivors of a Gen 1 collection spend the Gen 2 budget. Large objects spend the LOH budget directly.</p>',
      deep: '<p>In the GC sources this is the generation\'s "dynamic data": <code>dd_new_allocation</code> goes down on allocation or promotion, and when it reaches zero or below, the budget counts as exhausted. The new budget is computed from survival and clamped between the generation\'s minimum and maximum. The limits depend on the mode (Workstation or Server), the version and settings, so do not trust specific numbers from articles without measuring.</p>'
    },
    {
      t: 'match',
      q: 'Whose budget does this event spend?',
      pairs: [
        ['new Order(): a small object', 'The Gen 0 budget'],
        ['An object survived a Gen 0 collection', 'The Gen 1 budget'],
        ['An object survived a Gen 1 collection', 'The Gen 2 budget'],
        ['new byte[200_000]', 'The LOH budget']
      ]
    },
    {
      t: 'learn',
      title: 'A collection is triggered: which generation to collect?',
      body: '<p>The trigger is almost always "the Gen 0 budget ran out". But the collector may go deeper. First it decides which generation to <b>condemn</b>:</p><ul><li>it checks the budgets of older generations: Gen 1 budget exhausted, it collects 0 and 1; Gen 2 budget exhausted, a full collection;</li><li>LOH budget exhausted: also a full collection, because LOH is only collected together with Gen 2;</li><li>it adds heuristics: low memory, heavy fragmentation, expensive cross-generation references.</li></ul><p>So a thread that allocated a small object may end up starting a full collection: Gen 0 was the last straw, but everything gets collected.</p>',
      deep: '<p>In gc.cpp this is the function <code>generation_to_condemn</code>. With background GC enabled, a full collection usually becomes a background one: Gen 2 is marked while the program keeps running. The unit "GC modes" covers this.</p>'
    },
    {
      t: 'choice',
      q: 'A loop allocates byte[200_000] arrays, and each becomes garbage right away. Which collections will happen?',
      options: [
        'Full collections: an exhausted LOH budget leads to a Gen 2 collection',
        'Only Gen 0 collections: the array became garbage immediately',
        'None: LOH is never collected',
        'Gen 1 collections: large objects start in Gen 1'
      ],
      answer: 0,
      explain: '200,000 bytes is above the LOH threshold. Such arrays spend the LOH budget, and only a Gen 2 collection can free LOH. Temporary large arrays are a classic source of frequent full collections; the fix is a pool (ArrayPool).',
      wrong: { 1: 'A Gen 0 collection does not touch LOH: it only looks at the youngest generation.' }
    },
    {
      t: 'learn',
      title: 'GC.Collect: a collection on demand',
      body: '<p><code>GC.Collect()</code> is an induced collection. Without arguments it is a full blocking collection. The overloads let you choose:</p><ul><li><b>generation</b>: collect generations 0 up to the given one;</li><li><b>mode</b>: <code>Forced</code> (same as <code>Default</code>) collects now; <code>Optimized</code> lets the GC decline if the collection would be unproductive; <code>Aggressive</code> (.NET 7+) compacts everything and returns as much memory to the OS as possible;</li><li><b>blocking</b>: <code>false</code> allows a background collection;</li><li><b>compacting</b>: <code>true</code> demands compaction. Without it the GC decides between sweep and compact itself.</li></ul><p>Legitimate reasons: tests and measurements, the end of a one-off heavy phase (data loaded, moving on to work), before the app goes idle. Otherwise the collector knows better when to collect.</p>',
      code: 'GC.Collect();   // full, blocking\nGC.Collect(0);  // Gen 0 only\nGC.Collect(2, GCCollectionMode.Optimized, blocking: false);\nGC.Collect(2, GCCollectionMode.Aggressive, blocking: true, compacting: true);',
      deep: '<p><code>Aggressive</code> is strict about arguments: only for the oldest generation, only with <code>blocking: true</code> and <code>compacting: true</code>, otherwise <code>ArgumentException</code>. The overload without <code>compacting</code> fills it in for you.</p><p><code>GCCollectionMode.Default</code> currently equals <code>Forced</code>. An induced collection is counted in <code>GC.CollectionCount</code> like any other, and in a trace it has its own reason, <code>Induced</code>, so stray <code>GC.Collect</code> calls in someone else\'s library are easy to find.</p>'
    },
    {
      t: 'blanks',
      q: 'The app has finished loading and wants to return as much memory as possible to the OS. Fill in the call',
      code: 'GC.Collect(2, GCCollectionMode.___, blocking: true, compacting: ___);',
      tiles: ['Aggressive', 'true', 'Optimized', 'false', 'Forced'],
      answer: ['Aggressive', 'true'],
      explain: 'Aggressive (.NET 7+) does a full blocking compacting collection and gives the freed memory back to the OS. With compacting: false this mode throws ArgumentException.'
    },
    {
      t: 'learn',
      title: 'Low memory: three signals',
      body: '<p>Besides budgets, the state of the machine also pushes collections.</p><ul><li><b>OS notification</b>. On Windows the runtime subscribes to the "memory is low" signal (memory resource notification). The finalizer thread waits for it and, once it arrives, starts a collection with reason LowMemory right away. Linux has no such notification.</li><li><b>Memory load</b>. At the start of every collection the GC checks what share of physical memory is in use, taking a container limit into account. Above a threshold (90% by default) it does full compacting collections more often.</li><li><b>Heap hard limit</b>. In a container with a memory limit, the heap is limited to 75% of that limit by default (but no less than 20 MB). Near the limit the GC collects more aggressively.</li></ul><p>And the last line of defense: if memory cannot be allocated, the GC runs a full compacting collection and only after that throws <code>OutOfMemoryException</code>.</p>',
      deep: '<p>The load threshold is changed by <code>GCHighMemPercent</code>, the heap limit by <code>GCHeapHardLimit</code> or <code>GCHeapHardLimitPercent</code> in runtimeconfig.json or <code>DOTNET_</code> variables. The "out of space" reasons appear in a trace as OutOfSpaceSOH and OutOfSpaceLOH. A collection on the OS notification is requested as a Gen 0 collection with a "low memory" flag, and the GC picks the depth itself based on memory load.</p>'
    },
    {
      t: 'choice',
      q: 'An app with no GC settings runs in a container with a 1 GB memory limit. What limit will the managed heap have?',
      options: [
        'About 750 MB: 75% of the container limit',
        'Exactly 1 GB: the whole container limit',
        'All of the host RAM: the GC knows nothing about containers',
        'None: the heap grows until the kernel kills the process'
      ],
      answer: 0,
      explain: 'In a container with a memory limit the runtime sets a heap hard limit itself, 75% of the limit, to leave room for native memory, stacks and code. You can change it with GCHeapHardLimit or GCHeapHardLimitPercent.'
    },
    {
      t: 'learn',
      title: 'How to find out why a collection happened',
      body: '<p>Every collection begins with a <code>GCStart</code> event, and it has a <b>Reason</b> field. The main values: <code>AllocSmall</code> (SOH budget), <code>AllocLarge</code> (LOH budget), <code>Induced</code> (<code>GC.Collect</code>), <code>LowMemory</code>, <code>OutOfSpaceSOH</code>/<code>OutOfSpaceLOH</code>. <code>dotnet-trace</code> collects it, and PerfView shows it in its table of collections.</p><p>Without tracing, a lot is visible from code: <code>GC.CollectionCount(n)</code> is how many collections of a generation happened, <code>GC.GetGCMemoryInfo()</code> gives data about the last collection.</p>',
      code: 'var info = GC.GetGCMemoryInfo();\nConsole.WriteLine(info.Index);              // collection number\nConsole.WriteLine(info.Generation);         // which generation was collected\nConsole.WriteLine(info.Compacted);          // whether it compacted\nConsole.WriteLine(info.PauseDurations[0]);  // the pause'
    },
    {
      t: 'order',
      q: 'Put in order: from new to work resuming',
      items: [
        'new does not fit in the allocation context',
        'Slow path: the Gen 0 budget is exhausted',
        'The GC picks a generation by the older budgets',
        'Collection: survivors are promoted and spend older budgets',
        'New budgets from survival rates',
        'The allocation proceeds'
      ],
      explain: 'The trigger is the Gen 0 budget; the depth is chosen from the budgets of older generations. After the collection the budgets are recomputed, and the thread gets its memory.'
    }
  ]
};

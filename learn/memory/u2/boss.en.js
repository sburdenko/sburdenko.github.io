/** Final of unit 2 of Memory in .NET: measuring memory and finding leaks. */
export default {
  id: 'mem.u2.boss',
  title: 'Final: measuring',
  sub: 'Numbers, tools and leaks',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A week under steady load: private bytes grew from 1 to 4 GB, while dotnet.gc.last_collection.heap.size stays around 400 MB the whole time. What next?',
      options: [
        'Look for a leak outside the managed heap: native libraries, AllocHGlobal, handles, threads',
        'Take two .gcdump snapshots and compare: the leak is in the managed heap',
        'Nothing: that is Server GC keeping headroom',
        'Call GC.Collect() once a minute'
      ],
      answer: 0,
      explain: 'The heap is flat while the process commit grows — so memory is taken around the GC. Managed heap snapshots will not show it. Server GC headroom shows up in the GC commit, not in 3 GB on top of the heap.',
      wrong: { 1: 'The snapshots will show the same 400 MB as the counter: it is not the heap that grows.' }
    },
    {
      t: 'match',
      q: 'Match the API with what it returns',
      pairs: [
        ['Environment.WorkingSet', 'The process’s pages in RAM'],
        ['GC.GetTotalMemory(false)', 'The heap minus fragmentation, uncollected garbage included'],
        ['GCMemoryInfo.TotalCommittedBytes', 'How much memory the GC has committed'],
        ['GC.GetTotalAllocatedBytes()', 'How much was allocated over the life of the process'],
        ['Process.PrivateMemorySize64', 'The process’s private committed memory']
      ]
    },
    {
      t: 'blanks',
      q: 'A service on .NET 9. Watch the heap size by generation after each collection',
      code: 'dotnet-counters monitor -n Shop --counters System.Runtime[___]',
      tiles: ['dotnet.gc.last_collection.heap.size', 'dotnet.gc.heap.total_allocated', 'dotnet.process.memory.working_set', 'dotnet.gc.pause.time'],
      answer: ['dotnet.gc.last_collection.heap.size'],
      explain: 'last_collection.heap.size is broken down by gen0, gen1, gen2, loh and poh. total_allocated is cumulative allocations, working_set is the process’s RAM, pause.time is pauses.'
    },
    {
      t: 'multi',
      q: 'What is true about the tools? Select all.',
      options: [
        'dotnet-gcdump collect triggers a full generation 2 collection',
        'dotnet-dump collect without --type writes a Full dump',
        'A .gcdump shows the values of string fields',
        'A Mini dump is suitable for hunting a heap leak',
        'dotnet-trace with the gc-verbose profile records sampled allocations with stacks'
      ],
      answer: [0, 1, 4],
      explain: 'A heap snapshot is built during an induced full collection, dotnet-dump takes Full by default, gc-verbose gives AllocationTick with stacks. A .gcdump has no field values, and a Mini dump has no heap.'
    },
    {
      t: 'tapline',
      q: 'A dotnet-dump analyze session. Which command explains why an object is still alive?',
      code: '> dumpheap -stat -live\n> dumpheap -mt 00007ffa1c2b4a10\n> dumpobj 000001f2b4d88e10\n> gcroot 000001f2b4d88e10\n> finalizequeue',
      answer: 3,
      explain: 'gcroot prints the path from a root to the object — that is the answer to "who holds it". dumpheap finds objects, dumpobj shows fields, finalizequeue shows the finalization queue.'
    },
    {
      t: 'order',
      q: 'Put the steps of verifying a fixed leak in order',
      items: [
        'Warm the service up',
        'Take a heap snapshot',
        'Run 1000 requests',
        'Take a second snapshot',
        'Confirm that the growth of your type is near zero'
      ],
      explain: 'The same measurement as during the hunt: warm-up, snapshot, a known load, snapshot, comparison. Using the same method guarantees the vanished growth is thanks to the fix.'
    },
    {
      t: 'choice',
      q: 'Snapshot diff after 1000 requests: +1000 RequestContext, +1000 <>c__DisplayClass5_0, +1000 Action, and the invocation list of the static event AppEvents.Reloaded keeps growing. The most likely explanation?',
      options: [
        'Every request subscribes a lambda that captured RequestContext to the static event and never unsubscribes',
        'RequestContext is a struct and gets boxed',
        'The compiler creates a DisplayClass on every call of any method',
        'It is garbage the collector has not collected yet'
      ],
      answer: 0,
      explain: 'DisplayClass is the closure object, Action is a delegate over it, and a growing invocation list means delegates pile up in it. The static event is a root: it holds the delegate, the delegate holds the closure, the closure holds RequestContext. And garbage does not get into heap snapshots: a snapshot is built during a full collection.'
    },
    {
      t: 'choice',
      q: 'Server GC, 32 cores. Under steady load the heap saws up to 6 GB, and after full collections it has stayed around 1.5 GB for a week. Is it a leak?',
      options: [
        'No: the floor of the sawtooth is not rising; the height comes from the collector’s budgets',
        'Yes: 6 GB is too much for a service',
        'Yes: the heap should return to zero after a collection',
        'Impossible to say without a full dump'
      ],
      answer: 0,
      explain: 'The sign of a leak is a growing heap size after full collections. It stays put. The tall teeth are the generation budget, which is large with Server GC. If memory matters more, look at DATAS (default for Server GC since .NET 9) or the GCConserveMemory setting.'
    }
  ]
};

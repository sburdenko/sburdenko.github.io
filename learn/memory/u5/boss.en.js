/** Memory in .NET, final of the unit "How a collection works". */
export default {
  id: 'mem.u5.boss',
  title: 'Final: a collection from the inside',
  sub: 'Budgets, suspension, marking, the plan and cleanup',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A service allocates almost no large objects, yet the trace shows many full collections with reason AllocSmall. How is that possible?',
      options: [
        'The trigger is the Gen 0 budget, but the GC went deeper: the Gen 2 budget, spent by promoted survivors, was exhausted',
        'AllocSmall means a call to GC.Collect()',
        'Full collections are always labeled AllocSmall',
        'This is how low memory shows up on Linux'
      ],
      answer: 0,
      explain: 'The reason answers "what triggered it", while the depth is chosen by the budgets of older generations. Many survivors, many promotions, the Gen 2 budget runs out, a full collection, even though the trigger was a small allocation.',
      wrong: { 1: 'GC.Collect() gives the reason Induced.' }
    },
    {
      t: 'rig', rig: 'gc',
      task: 'Cache in Gen 2 holds Entry. Make a Gen 0 collection remove Entry while Cache stays alive.',
      objects: [{ id: 'Cache', gen: 2, refs: ['Entry'] }, { id: 'Entry' }],
      roots: [{ name: 'cache', to: 'Cache' }],
      cuts: [{ from: 'Cache', to: 'Entry', label: 'cache.Entry = null' }],
      goal: { kind: 'dead', ids: ['Entry'], keep: ['Cache'] },
      solve: ['cut:Cache>Entry', 'gc:0']
    },
    {
      t: 'multi',
      q: 'What is true about suspending threads? Select all.',
      options: [
        'A thread in a P/Invoke call is in preemptive mode and does not delay the collection',
        'A native call with [SuppressGCTransition] keeps the thread cooperative',
        'A thread in a call-free managed loop is stopped by interruption: such a method is usually fully interruptible',
        'A thread returning from native code during a collection keeps running alongside it',
        'A safepoint is any instruction at which the OS managed to pause the thread'
      ],
      answer: [0, 1, 2],
      explain: 'Returning from native code checks the flag and waits for the collection to end. A safepoint is only a place where the GC info describes references exactly; the OS can pause a thread anywhere, but that is not yet a safepoint.'
    },
    {
      t: 'order',
      q: 'Assemble a whole blocking compacting Gen 0 collection',
      items: [
        'The Gen 0 budget runs out on the allocation slow path',
        'Threads are brought to safepoints',
        'Mark from roots and marked cards',
        'Plan: plugs, new addresses, the decision to compact',
        'Relocate: references rewritten',
        'Compact: plugs copied',
        'Restart EE'
      ],
      explain: 'Trigger, suspension, marking, plan, rewrite references, copy, release threads. Had the plan decided to sweep, a single sweep would replace the two phases before Restart EE.'
    },
    {
      t: 'tapline',
      q: 'Which line marks a card in the card table, if items has long been in Gen 2?',
      code: 'int[] counts = new int[16];\nItem[] items = cache.Items;\ncounts[3] = 5;\nItem fresh = new Item();\nitems[3] = fresh;\nitems[4] = null;',
      answer: 4,
      explain: 'items[3] = fresh writes a reference to a young object into an element of a Gen 2 array: the write barrier marks the card. Writing a number or null needs no barrier, and assignments to local variables do not write into the heap.'
    },
    {
      t: 'choice',
      q: 'Why does a Gen 0 collection not check whether the Gen 2 object whose card holds the reference is alive?',
      options: [
        'That would require marking Gen 2, exactly what generations are meant to avoid',
        'Gen 2 objects are always alive',
        'The card table also stores whether the object is alive',
        'The write barrier does that check at store time'
      ],
      answer: 0,
      explain: 'Cards are a conservative approximation: "there may be a reference into a young generation here". The price is that dead Gen 2 objects hold young ones until a full collection.'
    },
    {
      t: 'match',
      q: 'Match the situation and what the plan will choose',
      pairs: [
        ['GC.Collect(2, GCCollectionMode.Forced, true, compacting: true)', 'Compaction: it was demanded'],
        ['A Gen 0 region where 95% survived (.NET 8)', 'The whole region is promoted, no copying'],
        ['LOH with no settings and no heap limit', 'Sweep: large objects are not moved'],
        ['POH', 'Never compacted']
      ]
    },
    {
      t: 'choice',
      q: 'A Span<int> points into the middle of an array. A collection compacted the generation and moved the array. What about the Span?',
      options: [
        'It is valid: the GC info flags the interior pointer, and the GC shifted it along with the array',
        'The Span now points at the old place; fixed is needed',
        'The array could not move: the Span pins it',
        'The Span became empty'
      ],
      answer: 0,
      explain: 'The GC knows interior pointers on the stack and rewrites them during relocate. Pinning is needed only when the address goes somewhere the GC cannot see it: into native code or a void*.',
      wrong: { 2: 'A Span does not pin. The array under it moves freely, and the Span itself is updated.' }
    }
  ]
};

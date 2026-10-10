/** Unit 3, lesson 2: generations and the large object heap. */
export default {
  id: 'dotnet.w3.l2',
  title: 'Generations',
  sub: 'Gen 0, 1, 2 and the large object heap',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Most objects die young',
      body: '<p>Temporary strings, per-request objects, iterators: they live for a fraction of a second. That\'s why the heap is split into <b>generations</b>:</p><p><b>Gen 0</b>: new objects.<br><b>Gen 1</b>: survived one collection.<br><b>Gen 2</b>: long-lived objects.</p><p>A Gen 0 collection is frequent and fast: it only looks at the young.</p>',
      deep: 'So a Gen 0 collection doesn\'t have to walk the whole heap, the CLR marks spots in older generations that got a reference to a young object in a "card table". A write barrier sets the mark on every assignment to a reference field.'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'The temporary objects Temp1 and Temp2 should go away, while Cache makes it to Gen 2.',
      objects: [{ id: 'Cache' }, { id: 'Temp1' }, { id: 'Temp2' }],
      roots: [{ name: 'cache', to: 'Cache' }, { name: 't1', to: 'Temp1' }, { name: 't2', to: 'Temp2' }],
      gen1: true,
      goal: { kind: 'gen', id: 'Cache', gen: 2, dead: ['Temp1', 'Temp2'] },
      solve: ['root:t1', 'root:t2', 'gc:0', 'gc:1']
    },
    {
      t: 'choice',
      q: 'An object is in Gen 1. A Gen 0 collection runs. What happens to it?',
      options: ['Nothing: a Gen 0 collection doesn\'t even look at it', 'It\'s removed', 'It moves to Gen 2'],
      answer: 0,
      explain: 'A collection of generation N covers generations 0 through N. It doesn\'t touch older ones.'
    },
    {
      t: 'learn',
      title: 'The LOH: the large object heap',
      body: '<p>Objects of 85,000 bytes or more, usually big arrays, go straight to a separate heap, the <b>LOH</b> (large object heap).</p><p>It\'s collected only together with Gen 2 and isn\'t compacted by default: moving big chunks of memory is expensive.</p>',
      deep: 'That\'s why big temporary arrays are a common cause of full collections and fragmentation. The cure is ArrayPool&lt;T&gt;.Shared: rent a buffer and return it. Since .NET 5 there\'s also the POH, a heap for pinned objects.'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'Clear both references and get both objects removed. Which collection can handle Buffer?',
      objects: [{ id: 'Buffer', big: true }, { id: 'Small' }],
      roots: [{ name: 'buf', to: 'Buffer' }, { name: 's', to: 'Small' }],
      goal: { kind: 'dead', ids: ['Buffer', 'Small'] },
      solve: ['root:buf', 'root:s', 'gc:0', 'gc:2']
    },
    {
      t: 'choice',
      q: 'A byte[100_000] became garbage. Who cleans it up?',
      options: ['Only a full collection (Gen 2)', 'The next Gen 0 collection', 'Nobody: the LOH is never cleaned'],
      answer: 0,
      explain: '100,000 bytes is above the 85,000 threshold, so the array is on the LOH. And the LOH is collected together with Gen 2.'
    },
    {
      t: 'multi',
      q: 'What is true about generations? Select all that apply.',
      options: ['New objects go to Gen 0', 'Survive a collection and you move to the next generation', 'A Gen 2 collection is the most expensive', 'Objects in Gen 2 are never removed', 'Every collection checks every object'],
      answer: [0, 1, 2],
      explain: 'Gen 2 objects do get removed, but only by a full collection, which is rare.'
    },
    {
      t: 'choice',
      q: 'Why doesn\'t a huge cache that lives for the whole program slow down frequent collections?',
      options: ['It quickly lands in Gen 2, and frequent Gen 0 collections don\'t walk it', 'The GC skips objects named Cache', 'The cache lives on the stack'],
      answer: 0,
      explain: 'A long-lived object moves to Gen 2 and from then on costs frequent collections almost nothing.'
    },
    {
      t: 'choice',
      q: 'Is calling GC.Collect() "to clean up memory" a good idea?',
      options: ['Usually not: a full collection is expensive and also promotes live objects', 'Yes, it speeds the program up', 'Yes, it makes the GC do less work'],
      answer: 0,
      explain: 'The GC knows when to collect. A forced collection pauses threads and makes live objects "older", which makes them more expensive to clean up later.'
    }
  ]
};

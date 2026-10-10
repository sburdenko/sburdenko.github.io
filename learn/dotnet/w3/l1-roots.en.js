/** Unit 3, lesson 1: how the garbage collector finds garbage: roots and reachability. */
export default {
  id: 'dotnet.w3.l1',
  title: 'How the GC finds garbage',
  sub: 'Roots, reachability and cycles',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Nobody writes delete',
      body: '<p>In C# you create objects with <code>new</code> but never delete them by hand. The <b>garbage collector</b> (GC) does that: every so often it finds objects nobody needs anymore and frees their memory.</p>'
    },
    {
      t: 'learn',
      title: 'Roots and reachability',
      body: '<p>The GC starts from <b>roots</b>: local variables of running methods and static fields. From there it follows references. Everything it can reach is alive. The rest is garbage.</p><p>Think of a bunch of balloons: cut the string in your hand, and every balloon tied to it floats away.</p>',
      deep: 'CPU registers, GC handles (pinned objects, for example) and the finalization queue also count as roots. The JIT knows where a variable is last used: in a Release build an object can become garbage before the method ends. That\'s what GC.KeepAlive is for: it extends the lifetime up to a given line.'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'Get rid of Log while keeping Order, Item and Price.',
      objects: [{ id: 'Order', refs: ['Item'] }, { id: 'Item', refs: ['Price'] }, { id: 'Price' }, { id: 'Log' }],
      roots: [{ name: 'order', to: 'Order' }, { name: 'log', to: 'Log' }],
      goal: { kind: 'dead', ids: ['Log'], keep: ['Order', 'Item', 'Price'] },
      solve: ['root:log', 'gc:0']
    },
    {
      t: 'choice',
      q: 'order = null. What happens to Order → Item → Price?',
      options: ['All three become garbage', 'Only Order is removed', 'Nothing: their references to each other keep them alive'],
      answer: 0,
      explain: 'Item and Price are reachable only through Order. No path from a root means the whole chain is garbage.'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'A and B reference each other. Clear the root and run a collection. Are they removed?',
      objects: [{ id: 'A', refs: ['B'] }, { id: 'B', refs: ['A'] }],
      roots: [{ name: 'a', to: 'A' }],
      goal: { kind: 'dead', ids: ['A', 'B'] },
      solve: ['root:a', 'gc:0']
    },
    {
      t: 'choice',
      q: 'Why doesn\'t the A ⇄ B cycle bother the collector?',
      options: ['The GC looks for what is reachable from roots; it doesn\'t count references', 'The GC breaks cycles on a timer', 'It does bother it: that\'s a memory leak'],
      answer: 0,
      explain: 'Cycles are a problem where memory is freed by reference counting (like ARC in Swift). Tracing from roots simply never reaches them, so they get removed.'
    },
    {
      t: 'learn',
      title: 'What the GC does next',
      body: '<p>After freeing the garbage, the GC slides live objects closer together. That\'s <b>compaction</b>. New objects are then allocated back to back, very quickly.</p><p>Program threads are usually paused briefly during a collection.</p>',
      deep: 'Allocation in .NET is just bumping a pointer in the thread\'s "allocation context", so new is very cheap. What\'s expensive is surviving collections. There are Workstation and Server GC modes, background Gen 2 collection and GCSettings.LatencyMode.'
    },
    {
      t: 'multi',
      q: 'What counts as a GC root? Select all that apply.',
      options: ['A local variable of a running method', 'A static field', 'A field of an object nobody references', 'Any object older than a minute'],
      answer: [0, 1],
      explain: 'Roots are things that are definitely in use right now: thread stacks and static fields. A field of an unreachable object is not a root.'
    },
    {
      t: 'choice',
      q: 'When does a garbage collection run?',
      options: ['When the runtime decides, usually when Gen 0 fills up', 'As soon as an object becomes garbage', 'Only when GC.Collect() is called', 'Exactly once per second'],
      answer: 0,
      explain: 'Garbage can sit around for a while. The GC kicks in once enough new memory has been allocated. More on that in the next lesson.'
    }
  ]
};

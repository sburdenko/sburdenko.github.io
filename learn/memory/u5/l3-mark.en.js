/** Memory in .NET, unit "How a collection works", lesson 3: marking — roots, GC info, the card table and the write barrier. */
export default {
  id: 'mem.u5.l3',
  title: 'Marking',
  sub: 'Roots, precise collection, the card table and the write barrier',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'The mark phase: find everything alive',
      body: '<p>Threads are stopped, and <b>marking</b> begins. The collector takes each root and follows references, marking every object it reaches. You saw how reachability works in ".NET inside out"; here is how it is built internally.</p><ul><li><b>Where the mark lives.</b> Not in a separate table but in the object itself: the GC sets the lowest bit of the type pointer (MethodTable). Pointers are aligned, that bit is always zero, so it is free.</li><li><b>How the walk goes.</b> Not by recursion but with its own <b>mark stack</b>: take an object, mark it, push its unmarked neighbors.</li><li><b>Where the walk stops.</b> Only condemned generations are marked. In a Gen 0 collection, Gen 2 objects are neither walked nor marked.</li></ul>',
      deep: '<p>In gc.cpp the mark is set by <code>set_marked</code>: <code>MethodTable | 1</code>, and the bit is cleared after the collection. The pinned flag is kept elsewhere, in a bit of the object header. If the mark stack overflows, the GC remembers an "overflow" address range and rescans it later, so even a very deep chain does not crash the collector.</p>'
    },
    {
      t: 'learn',
      title: 'Roots: the full list',
      body: '<p>Where the walk starts:</p><ul><li><b>Thread stacks</b>: the stack slots and registers of every managed frame that currently hold live references.</li><li><b>Static fields</b>: the CLR keeps them in its own structures and reports them to the collector as roots.</li><li><b>GC handles</b>: strong and pinned ones (<code>GCHandle.Alloc</code>, <code>Normal</code> and <code>Pinned</code>). Weak handles are not roots: they are cleared if the object is not marked.</li><li><b>The finalization queue</b>: objects ready for their finalizer are kept alive until it has run.</li><li><b>Older generations</b>: when collecting younger ones, references from Gen 2 into Gen 0 also act as roots. More on that below.</li></ul>',
      deep: '<p>A trace shows this breakdown literally: the <code>GCMarkWithType</code> event reports how many bytes were marked from each root type: Stack, Finalizer, Handle, Older (references from older generations) and others. It shows what keeps survivors alive: for example, a huge Older next to a small Stack means Gen 0 is being held by references from Gen 2.</p>'
    },
    {
      t: 'multi',
      q: 'What keeps an object alive during a collection? Select all.',
      options: [
        'A local variable that will still be read later in the method',
        'A static field',
        'GCHandle.Alloc(obj, GCHandleType.Weak)',
        'The finalization queue: the finalizer has not run yet',
        'A WeakReference<T> to the object'
      ],
      answer: [0, 1, 3],
      explain: 'A live local, a static and the finalization queue are roots. Weak handles and WeakReference built on them do not hold the object: after marking they are cleared if it is not marked.'
    },
    {
      t: 'learn',
      title: 'GC info: precise collection',
      body: '<p>How does the GC know a stack slot holds a reference and not the number 140 billion? The JIT tells it.</p><ul><li>For every method the JIT writes <b>GC info</b>: which registers and frame slots hold live references at each safepoint. Interior pointers (<code>ref</code>, <code>Span</code>), which point into the middle of an object, are flagged separately.</li><li>The runtime unwinds the stack frame by frame and, for each frame, asks the GC info about the current instruction address.</li><li>For heap objects the type knows the same: the MethodTable holds a <b>GCDesc</b>, the offsets of reference fields.</li></ul><p>This is a <b>precise</b> collector. It never mistakes a number for a reference, so it can move objects and rewrite references. A <b>conservative</b> collector treats anything that looks like an address as a reference and cannot move such objects: it might have been a number.</p>',
      deep: '<p>GC info explains what you saw in ".NET inside out": in optimized code a variable lives only until its last use, and an object may become garbage before the method ends. In Debug the JIT extends lifetimes to the end of the method. Slots whose address is taken and leaks out are marked "untracked" by the JIT: they count as live for the whole method. The CoreCLR sources also have an undocumented conservative stack scanning mode (<code>gcConservative</code>), but by default collection is precise.</p>'
    },
    {
      t: 'choice',
      q: 'Why can a precise collector move an object referenced from the stack, while a conservative one cannot?',
      options: [
        'The precise one knows the slot is a reference and can rewrite it; the conservative one does not, it might be a number',
        'A conservative collector cannot copy memory',
        'A precise collector does not look at the stack at all',
        'A conservative collector works only with LOH'
      ],
      answer: 0,
      explain: 'To move an object, every reference to it must be rewritten. You cannot rewrite a "maybe reference": if it was a number, the program breaks. So conservative collectors pin everything the stack "seems" to point at.'
    },
    {
      t: 'learn',
      title: 'The problem: references from old to young',
      body: '<p>A Gen 0 collection is cheap because it does not walk Gen 2. But a Gen 2 object may reference a new object:</p><p><code>cache.Add(key, new Entry())</code>: the cache has long been in Gen 2, the <code>Entry</code> was just created. No root points at <code>Entry</code> directly. Without looking into Gen 2, <code>Entry</code> would be counted as garbage.</p><p>Walking all of Gen 2 would throw away the whole point of generations. The solution is the <b>card table</b>: the heap is split into small areas, "cards", and each has a bit meaning "there is a reference into a younger generation here". A Gen 0 collection looks only at objects in marked cards and treats the references found there as roots.</p>',
      deep: '<p>On a 64-bit platform a card covers 256 bytes of heap, and card bits are packed into 32-bit words. Above the cards there is one more level, card bundles: a bit per group of words, so a collection can quickly skip large clean areas.</p>'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'Cache has long been in Gen 2 and holds a new Entry. Make Temp get removed while Entry survives a Gen 0 collection and moves to Gen 1.',
      objects: [{ id: 'Cache', gen: 2, refs: ['Entry'] }, { id: 'Entry' }, { id: 'Temp' }],
      roots: [{ name: 'cache', to: 'Cache' }, { name: 'temp', to: 'Temp' }],
      goal: { kind: 'gen', id: 'Entry', gen: 1, dead: ['Temp'] },
      solve: ['root:temp', 'gc:0']
    },
    {
      t: 'learn',
      title: 'The write barrier: who marks the cards',
      body: '<p>The program\'s own code marks the cards. Every store of a reference <b>into the heap</b>, into an object field or an array element, is turned by the JIT into a call to the <b>write barrier</b> helper. It stores the reference, checks whether it points into the younger generations, and if so marks the card that contains the field\'s address.</p><ul><li>A store into a local variable needs no barrier: the stack is scanned in full anyway.</li><li>Neither does storing <code>null</code> or a number: the JIT inserts no barrier.</li><li>A struct with references copied into an object field also goes through the barrier, once for each reference field.</li></ul><p>The price is a few instructions and a conditional branch on every reference store. That is why writing a reference field is slightly more expensive than writing an <code>int</code>.</p>',
      code: 'class Node { public Node? Next; public int Value; }\n\nn.Value = 5;      // a plain store\nn.Next = other;   // store + write barrier\nn.Next = null;    // null: no barrier needed',
      deep: '<p>The classic x64 barrier only checks that the new value falls into the younger generations\' range, and marks a whole byte of the table: eight cards, 2 KB of heap. With regions (.NET 7+) there are barrier variants that compare the generations of the source and destination regions and can set a single bit. The runtime patches the barrier code on the fly: the younger generation bounds and the table address are baked into the instructions. If the JIT is not sure the store goes into the heap (for example, through a <code>ref</code>), it calls a "checked" barrier that first looks whether it is the heap.</p>'
    },
    {
      t: 'tapline',
      q: 'On which line will the JIT insert a write barrier call?',
      code: 'int count = 0;\nvar head = new Node();\ncount = 42;\nhead.Value = 7;\nhead.Next = new Node();\nNode? local = head.Next;',
      answer: 4,
      explain: 'Only head.Next = new Node() writes a reference into a field of a heap object. var head = new Node() and the last line write a reference into a local variable; the rest write numbers.'
    },
    {
      t: 'learn',
      title: 'The cost of cards and a side effect',
      body: '<p>When collecting younger generations, the GC goes through the marked cards: for each object in such a card it looks at its references, and everything that points into the condemned generations is marked live. If a card has no young references left, its mark is cleared.</p><p>Two consequences:</p><ul><li><b>A dead old object keeps young ones alive.</b> A Gen 2 object may have become garbage long ago, but a Gen 0 collection does not check that: Gen 2 is not marked. Its references, through the cards, hold the young objects until the next full collection.</li><li><b>Many cards make Gen 0 collections expensive.</b> A large Gen 2 array that keeps receiving fresh objects marks cards along its whole length. Gen 0 collections start spending time scanning them.</li></ul>',
      deep: '<p>The GC tracks how productive the card scan was and takes it into account when deciding whether to collect Gen 1 right away: then fewer references end up "older" than the young objects. The usual fix is in the data: do not keep a long-lived collection that young objects keep pouring into, or store value types in it instead of references.</p>'
    },
    {
      t: 'choice',
      q: 'Object Old in Gen 2 is already unreachable but references Young in Gen 0. A Gen 0 collection runs. What happens to Young?',
      options: [
        'It survives and moves to Gen 1: a reference from a marked card counts as a root',
        'It is removed: Young cannot be reached from the roots',
        'It is removed together with Old',
        'The Gen 0 collection first checks whether Old is alive'
      ],
      answer: 0,
      explain: 'A Gen 0 collection does not mark Gen 2 and does not know Old is dead. Old\'s card is marked, and the reference to Young from it acts as a root. Only a full collection frees both.',
      wrong: { 3: 'To check that, it would have to mark Gen 2, exactly what a Gen 0 collection avoids.' }
    },
    {
      t: 'match',
      q: 'Where does the GC learn where references are?',
      pairs: [
        ['A method\'s local variables', 'GC info written by the JIT'],
        ['Fields of a heap object', 'GCDesc in the MethodTable'],
        ['References from Gen 2 into Gen 0', 'The card table'],
        ['An object pinned through GCHandle', 'The handle table']
      ]
    }
  ]
};

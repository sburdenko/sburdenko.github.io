/** Course "Memory in .NET", unit 1, lesson 3: the thread stack and its limit, CPU caches and data locality. */
const ARR = 'var pts = new Point[3];\npts[0] = new Point(1, 1);\npts[1] = new Point(2, 2);\npts[2] = new Point(3, 3);';

export default {
  id: 'mem.u1.l3',
  title: 'The stack and CPU caches',
  sub: 'The stack limit, cache lines and locality',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'A thread’s stack is a range claimed in advance',
      body: '<p>Every thread has its own stack. It’s a reserved range of addresses that gets committed bit by bit as the stack grows (it grows downward, toward lower addresses). Allocating on the stack just moves the stack pointer, which makes it almost free.</p><p>The size is set up front and doesn’t change:</p><ul><li>for the main thread of a Windows program it’s usually <b>1 MB</b>, a value written into the exe header;</li><li>for the main thread on Linux it follows <code>ulimit -s</code>, usually <b>8 MB</b>;</li><li>for threads created by .NET the runtime picks the default, and it depends on the OS and the version. Need a different one? Pass it to the constructor: <code>new Thread(work, maxStackSize)</code>.</li></ul>',
      deep: 'Check the exact defaults for new threads on your own platform: on Linux the runtime doesn’t inherit the main thread’s 8 MB but sets its own size, around one and a half megabytes. On Linux and macOS the DOTNET_DefaultStackSize environment variable changes it (a hexadecimal number of bytes). The thread pool creates its threads with the default size, so deep recursion inside a request handler runs into exactly that limit.'
    },
    {
      t: 'learn',
      title: 'What goes into a stack frame',
      body: '<p>Every method call adds a <b>frame</b>. It holds:</p><ul><li>the return address and saved registers;</li><li>arguments that didn’t fit into registers;</li><li>local value types: <code>int</code>, <code>double</code>, whole structs;</li><li>local references, 8 bytes of address, while the object itself is on the heap;</li><li><code>stackalloc</code> buffers.</li></ul><p>What isn’t on the stack: class instances, variables captured by a lambda (they move into a closure object on the heap), and locals of an async method that live across an <code>await</code> (they become fields of the state machine).</p>',
      deep: 'This is a model, not a promise: the JIT can keep a local only in a register and never touch the stack, and it can spread the fields of a small struct across registers. The opposite happens too: in .NET 9–10 the JIT learned to place objects that never leave the method on the stack in some cases (escape analysis). "Classes live on the heap" is still the right model, but the JIT chooses the actual location.'
    },
    {
      t: 'multi',
      q: 'What ends up in the stack frame of Draw? Select all that apply.',
      code: 'void Draw()\n{\n    var p = new Vector2(1, 2);           // struct\n    var list = new List<int>();\n    Span<byte> buf = stackalloc byte[64];\n}',
      options: ['The whole struct p', 'The reference list, 8 bytes', 'The List<int> object itself', 'The 64 bytes of buf', 'The list’s internal array'],
      answer: [0, 1, 3],
      explain: 'The List<int> object and its internal array are on the heap; the stack holds only the reference to the list. The struct and the stackalloc buffer sit right in the frame, unless the JIT moved something into registers.'
    },
    {
      t: 'learn',
      title: 'The guard page and StackOverflowException',
      body: '<p>Just below the committed part of the stack sits a <b>guard page</b>. Touch it and the OS commits the next page and moves the guard further down. That’s how the stack grows on demand.</p><p>When the stack reaches the end of its reservation, there’s nowhere left to grow: a <b>stack overflow</b>. In .NET a StackOverflowException can’t be caught: the runtime terminates the process immediately. Neither catch nor finally runs.</p><p>Typical causes: infinite recursion, recursion over deep data (a long chain, a degenerate tree), a huge <code>stackalloc</code>. The rule: if recursion depth depends on input, rewrite the traversal with an explicit <code>Stack&lt;T&gt;</code> or check the headroom with <code>RuntimeHelpers.EnsureSufficientExecutionStack()</code>.</p>',
      deep: 'EnsureSufficientExecutionStack throws InsufficientExecutionStackException when little stack is left; that’s an ordinary exception you can catch. There’s also a version without an exception: TryEnsureSufficientExecutionStack. Recursive parsers and expression compilers protect themselves this way. On Linux the guard page is a protected area: touching it raises SIGSEGV, the runtime recognizes the overflow, prints a message and terminates the process.'
    },
    {
      t: 'tapline',
      q: 'A chain of 10 million nodes. Which line won’t work the way the author intended?',
      code: 'int Depth(Node? n)\n{\n    if (n == null) return 0;\n    try\n    {\n        return 1 + Depth(n.Next);\n    }\n    catch (StackOverflowException)\n    {\n        return -1;\n    }\n}',
      answer: 7,
      explain: 'Ten million nested calls won’t fit on the stack, and StackOverflowException can’t be caught: the process will terminate. Walk the chain with a loop instead.'
    },
    {
      t: 'learn',
      title: 'Caches: memory is far, the cache is near',
      body: '<p>The CPU works faster than RAM can answer, so caches sit between them. Orders of magnitude for latency (exact numbers depend on the CPU):</p><ul><li><b>L1</b>: about 1 ns, tens of KB per core;</li><li><b>L2</b>: a few ns, from hundreds of KB to a couple of MB per core;</li><li><b>L3</b>: on the order of 10 ns, tens of MB shared by all cores;</li><li><b>RAM</b>: on the order of 100 ns.</li></ul><p>Memory arrives in the cache not byte by byte but in <b>cache lines</b> of <b>64 bytes</b>. Read one <code>int</code> and the 15 next to it come along. And if you read sequentially, the prefetcher spots the pattern and pulls in the next lines ahead of time.</p>',
      deep: 'In cycles at 3–4 GHz: L1 is 4–5 cycles, L2 around 12–15, L3 a few dozen, RAM hundreds. 64 bytes is the line size on x86-64 and most ARM CPUs; on Apple M-series chips it’s 128 bytes. Address translation is cached too, in the TLB, and scattered access over a large amount of memory misses both caches at once.'
    },
    {
      t: 'order',
      q: 'Order these from fastest to slowest',
      items: ['CPU register', 'L1 cache', 'L3 cache', 'Main memory', 'Soft page fault', 'Hard page fault from an SSD'],
      explain: 'A register is a fraction of a nanosecond, L1 about 1 ns, L3 on the order of 10 ns, RAM on the order of 100 ns, a soft fault on the order of a microsecond, a hard fault from an SSD tens to hundreds of microseconds.'
    },
    {
      t: 'learn',
      title: 'An array of structs versus an array of references',
      body: '<p>If <code>Point</code> is a struct of two <code>int</code>s, a <code>Point[]</code> stores the points back to back, 8 bytes each: 8 points per cache line, and a traversal walks straight through memory.</p><p>If <code>Point</code> is a class, the array stores only references. Each point is a separate object: 16 bytes of overhead (the header and the type pointer) plus 8 bytes of data. To read <code>pts[i].X</code> you have to load the reference and follow it. Freshly created objects often sit next to each other, but after the program has run for a while and collections have happened, that’s not guaranteed.</p><p>For a million points: structs are about 8 MB read sequentially; classes are 8 MB of references plus about 24 MB of objects, and each hop can cost a cache miss.</p>',
      deep: 'The next step is a "struct of arrays": if a loop reads only X, keep X in one array and Y in another, and every cache line carries 16 useful numbers instead of 8. ECS engines and vectorization with Vector&lt;T&gt; are built on this. The price is less convenient code, so it’s done only in hot loops, after measuring.'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through both versions: where do the points lie in one block, and where do you have to follow a reference to each?',
      goal: 'both',
      variants: {
        struct: {
          code: ARR,
          steps: [
            { line: 0, note: 'An array of structs is one object. Room for all three points is right inside it, back to back.', ops: [{ op: 'arr', name: 'pts', elem: 'Point', kind: 'val', items: [{ X: 0, Y: 0 }, { X: 0, Y: 0 }, { X: 0, Y: 0 }] }] },
            { line: 1, note: 'The point is written straight into the slot. Neighboring slots are neighboring bytes, in the same cache line.', ops: [{ op: 'set', target: 'pts', field: '0', value: { X: 1, Y: 1 } }] },
            { line: 2, note: 'No new objects: a traversal reads memory strictly in sequence.', ops: [{ op: 'set', target: 'pts', field: '1', value: { X: 2, Y: 2 } }] },
            { line: 3, note: 'One object in total: 24 bytes of points in one block.', ops: [{ op: 'set', target: 'pts', field: '2', value: { X: 3, Y: 3 } }] }
          ]
        },
        class: {
          code: ARR,
          steps: [
            { line: 0, note: 'An array of classes stores only references, 8 bytes each. All null for now.', ops: [{ op: 'arr', name: 'pts', elem: 'Point', kind: 'ref', items: [null, null, null] }] },
            { line: 1, note: 'Each point is a separate object with its own header. The array holds just the address.', ops: [{ op: 'newin', target: 'pts', field: '0', type: 'Point', fields: { X: 1, Y: 1 } }] },
            { line: 2, note: 'To read X, the CPU first reads the reference and then follows it: a second memory access.', ops: [{ op: 'newin', target: 'pts', field: '1', type: 'Point', fields: { X: 2, Y: 2 } }] },
            { line: 3, note: 'Four objects in total. Where the points end up after collections is not the array’s call.', ops: [{ op: 'newin', target: 'pts', field: '2', type: 'Point', fields: { X: 3, Y: 3 } }] }
          ]
        }
      },
      solve: ['step', 'step', 'step', 'step', 'variant:class', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Why is this traversal several times slower than with the loops swapped?',
      code: 'var m = new int[4096, 4096];\nlong sum = 0;\nfor (int j = 0; j < 4096; j++)\n    for (int i = 0; i < 4096; i++)\n        sum += m[i, j];',
      options: [
        'Elements adjacent in i are 16 KB apart: every read is a new cache line',
        'A multidimensional array checks bounds twice',
        'Adding longs is slower than adding ints',
        'It isn’t: loop order doesn’t matter'
      ],
      answer: 0,
      explain: 'In C# an int[,] is stored row by row: m[i, j] and m[i, j + 1] are neighbors. A row is 4096 × 4 bytes = 16 KB. The last index should change in the inner loop; then the traversal is sequential and one cache line serves 16 reads.'
    },
    {
      t: 'learn',
      title: 'False sharing: threads get in each other’s way without sharing data',
      body: '<p>Two threads each count into their own slot: the first writes to <code>counts[0]</code>, the second to <code>counts[1]</code>. There’s no race and the result is correct. Yet it runs slower than a single thread.</p><p>The reason: the slots are adjacent and sit in the same cache line. To write, a core must own the line exclusively. Every write by one core takes the line away from the other, and it bounces between their caches. This is <b>false sharing</b>.</p><p>Remedies: accumulate in a local variable and write once at the end; keep hot fields at least 64 bytes apart; give each thread its own data.</p>',
      deep: 'Core caches coordinate through a coherence protocol (the MESI family): only one core can hold a line it writes to in modified state. Some Intel CPUs fetch lines in pairs, which is why hot fields are sometimes spaced 128 bytes apart. The .NET libraries do this themselves, for example in ConcurrentQueue: the head and tail of the queue are separated by padding.'
    },
    {
      t: 'blanks',
      q: 'Each thread gets its own counter. Spread the array’s counters across different cache lines',
      code: '[StructLayout(LayoutKind.Explicit, Size = ___)]\nstruct PaddedCounter\n{\n    [FieldOffset(0)] public long Value;\n}\n\nvar counters = new PaddedCounter[Environment.ProcessorCount];',
      tiles: ['64', '8', '16', '0'],
      answer: ['64'],
      explain: 'With a 64-byte element, the Value fields of neighboring elements are 64 bytes apart and never land in the same cache line. Size = 8 would give you a plain long array, with eight counters per line.'
    }
  ]
};

/** Memory in .NET, unit "How a collection works", lesson 5: sweep and the free list, compact — relocation and copying, interior pointers. */
export default {
  id: 'mem.u5.l5',
  title: 'Sweep and compact',
  sub: 'The free list, moving objects and updating references',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Sweep: holes go to the free list',
      body: '<p>If the plan decided to sweep, live objects stay where they are. The GC walks the gaps between plugs:</p><ul><li>neighboring dead objects merge into one chunk;</li><li>the chunk is formatted as a <b>free object</b>: a fake object with a special "Free" type and a length;</li><li>large enough chunks go onto the generation\'s <b>free list</b>, sorted by size.</li></ul><p>Space is later taken from that list: when promoting survivors in the next collection, when allocating in LOH.</p><p>The cost of sweep is walking the generation. No copying, no rewriting references. The price of being cheap is <b>fragmentation</b>.</p>',
      deep: '<p>Free objects are visible in a dump: <code>!dumpheap -stat</code> in SOS shows a <code>Free</code> row with the count and total size of the chunks. In the .NET 8 sources a chunk smaller than two minimum object sizes (48 bytes on a 64-bit platform) does not go onto the list: it stays a "Free" object, but cannot be used until the next compaction.</p>'
    },
    {
      t: 'choice',
      q: 'Why format a free chunk as a fake "Free" object instead of leaving the dead objects there?',
      options: [
        'The heap is walked in order, stepping by object size: the chunk must look like an object with a length, and neighboring dead ones must merge into one',
        'This is how the GC zeroes memory for security',
        'Otherwise the finalizers of dead objects would run again',
        'The free object keeps references to its neighbors for the card table'
      ],
      answer: 0,
      explain: 'The plan, sweep, the debugger and dumps walk the heap object by object. A free object with type Free and a length keeps the heap walkable, and merging gives one big chunk instead of a scatter of small ones.'
    },
    {
      t: 'learn',
      title: 'Fragmentation',
      body: '<p>After a sweep, free memory is scattered in chunks between live objects. An object bigger than the largest chunk will not fit, even if there is plenty free in total. Then the heap needs new memory, and the process grows while the heap is "empty".</p><p>This hits LOH especially: by default it is only swept, and the objects there are large.</p><p>How much memory sits in chunks is visible from code:</p>',
      code: 'var info = GC.GetGCMemoryInfo();\nConsole.WriteLine(info.FragmentedBytes);  // total in free chunks\nvar loh = info.GenerationInfo[3];         // 0, 1, 2, LOH, POH\nConsole.WriteLine(loh.FragmentationAfterBytes);'
    },
    {
      t: 'choice',
      q: 'LOH has 50 free chunks of 1 MB each. The program allocates a 3 MB array. What happens?',
      options: [
        'No chunk fits: LOH takes new memory even though 50 MB is free',
        'The GC glues three neighboring chunks together and puts the array there',
        'The array is cut into three 1 MB parts',
        'OutOfMemoryException is thrown'
      ],
      answer: 0,
      explain: 'An array must be one contiguous piece. The chunks are separated by live objects, and only compaction can join them. Without it LOH grows, and the 50 MB of holes stay holes.',
      wrong: { 1: 'If the chunks are separated by live objects, they cannot be joined without moving those objects.' }
    },
    {
      t: 'learn',
      title: 'Compact: references first, then objects',
      body: '<p>If the plan chose compaction, two phases follow.</p><p><b>Relocate</b>: rewrite references. The GC again goes through every place that may hold references into the condemned generations: roots on stacks (using the same GC info), handles, marked cards of older generations, fields of the survivors themselves. For each reference the new address is found through the brick table: find the plug, add its relocation distance.</p><p><b>Compact</b>: copy the plugs to their new places, in address order. Plugs slide toward the start, so copying works like <code>memmove</code> and does not overwrite anything not yet copied.</p><p>After that the allocation pointer sits right after the last survivor, and everything beyond it is one solid free area.</p>',
      flow: ['Relocate: rewrite references', 'Compact: copy plugs', 'New boundaries']
    },
    {
      t: 'order',
      q: 'Put the steps of a compacting Gen 0 collection in order',
      items: [
        'Mark the living from roots and cards',
        'Split into plugs and compute new addresses',
        'Rewrite references to the new addresses',
        'Copy the plugs',
        'Put the allocation pointer after the last survivor',
        'Release the threads'
      ],
      explain: 'References are rewritten before copying: while objects are still in their old places, the plan in the gaps and the brick table are intact and tell the new addresses.'
    },
    {
      t: 'learn',
      title: 'Interior pointers',
      body: '<p>A <code>ref</code> variable, a <code>Span&lt;T&gt;</code>, a reference to an array element point not at the start of an object but into its middle. These are <b>interior pointers</b>.</p><p>GC info flags them specially. When it finds one, the GC uses the brick table to find the start of the object it points into, marks that object, and during compaction shifts the pointer by the same distance as the object. That is why a <code>Span</code> over an array needs no pinning.</p><p>Finding an object\'s start from an arbitrary address is not cheap. That is one of the reasons interior pointers live only on the stack: <code>ref</code> fields exist only in a <code>ref struct</code>, and a <code>Span</code> cannot be stored in a class field.</p>',
      code: 'int[] arr = new int[100];\nref int r = ref arr[50];\nSpan<int> s = arr.AsSpan(10, 20);\n// after compaction r and s point into the new address of arr'
    },
    {
      t: 'multi',
      q: 'What will the GC rewrite in the relocate phase if array arr moved? Select all.',
      options: [
        'The local variable int[] a = arr on the stack',
        'A reference field to arr in a surviving object',
        'ref int r = ref arr[5]',
        'The value of arr.GetHashCode() saved in a variable',
        'A long addr into which the address of arr was written earlier via unsafe'
      ],
      answer: [0, 1, 2],
      explain: 'The GC rewrites what it knows to be references: stack slots from GC info, fields by GCDesc, interior pointers. The hash code does not depend on the address, and a long is just a number to the GC.'
    },
    {
      t: 'learn',
      title: 'Why moving does not break the hash code',
      body: '<p>If objects move, an address is no good either for a hash or for identity. So the default hash code (<code>RuntimeHelpers.GetHashCode</code>) is not an address: on the first call the runtime generates a pseudo-random number and stores it in the object header or in the sync block. The object moves, and the hash moves with it.</p><p>But anything you derived from an address yourself lies after compaction. An address from <code>Unsafe.AsPointer</code> without pinning may, one collection later, point at someone else\'s object or at a free chunk.</p>',
      deep: '<p>This ties to the lesson on <code>System.Object</code> in "Deeper C#": the object header is shared by the hash code, the <code>lock</code> bits and the sync block index. If an object needs both a hash and a "fat" lock, the data moves to a sync block, and the header keeps only its index.</p>'
    },
    {
      t: 'choice',
      q: 'What can happen with this code?',
      code: 'var arr = new int[10];\nvoid* p = Unsafe.AsPointer(ref arr[0]);  // no pinning\nGC.Collect();\n*(int*)p = 42;',
      options: [
        'The write may corrupt another object or free memory: arr may have moved',
        'The GC will update p, just as it updates a ref',
        'An AccessViolationException is guaranteed',
        'It will not compile: AsPointer is forbidden for arrays'
      ],
      answer: 0,
      explain: 'To the GC, a void* is not a reference, and it is not in the GC info. If the collection compacted the generation, p points at the old place of arr, which now holds another object or a free chunk. The bug is silent: memory gets corrupted without an exception.',
      wrong: { 1: 'Only places the JIT flagged as references or interior pointers are updated. A void* is not one of them.' }
    },
    {
      t: 'learn',
      title: 'Which is cheaper',
      body: '<ul><li><b>Sweep</b>: the cost is proportional to the size of the generation: walk it. Objects do not move, references are not touched. Holes remain.</li><li><b>Compact</b>: the cost is proportional to the survivors: copy their bytes and rewrite references to them. No holes, allocation is a pointer bump again, objects keep their relative order and sit tightly (good for the cache).</li></ul><p>So for Gen 0, where few survive, compaction is cheap and frequent. Compacting a large Gen 2 is expensive, so it is swept more often (and a background collection only ever sweeps, see "GC modes").</p><p>After compaction, emptied regions return to the common pool, and over time the GC gives surplus memory back to the OS (decommit): the very difference between reserve and commit from the first unit.</p>',
      deep: '<p>If you care more about memory than CPU, there is the <code>GCConserveMemory</code> setting (values 0 to 9, .NET 6+): the higher the number, the more willingly the GC compacts Gen 2 and LOH to reduce fragmentation. With regions (.NET 7+) survivors can be compacted into other regions too, not only toward the start of the same one, and empty regions go back to the free pool whole.</p>'
    },
    {
      t: 'match',
      q: 'Match the phase and its job',
      pairs: [
        ['Mark', 'Tags every reachable object'],
        ['Plan', 'Computes new addresses and picks the cleanup method'],
        ['Relocate', 'Rewrites references to the new addresses'],
        ['Compact', 'Copies plugs to their new places'],
        ['Sweep', 'Turns holes into the free list']
      ]
    }
  ]
};

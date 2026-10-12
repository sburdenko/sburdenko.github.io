/** Memory in .NET, unit "Inside the heap", lesson 1: the object header, the sync block and the MethodTable. */
export default {
  id: 'mem.u3.l1',
  title: 'Header and MethodTable',
  sub: 'What sits before the fields and how much an object weighs',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'A reference does not point at the start of the object',
      body: '<p>In the Deeper C# course you saw two bookkeeping words in front of an object\'s fields. Now more precisely, for x64:</p><ul><li><b>−8</b>: the object header — 8 bytes, of which 4 are used and the other 4 are padding;</li><li><b>0</b>: the MethodTable pointer — 8 bytes. This is where the reference points;</li><li><b>+8</b>: the instance fields.</li></ul><p>The reference targets the type pointer because it is needed most often: a virtual call, a cast, <code>GetType</code> — one read at the reference address. The header is rarely needed, and it is one step back, at −8.</p>',
      code: '// new Order() in memory, x64:\n// address      contents\n// ref - 8      header: 4 bytes of data + 4 bytes of padding\n// ref + 0      pointer to the MethodTable of Order\n// ref + 8      first field\n// ...          the other fields',
      deep: '<p>In the runtime sources this is <code>ObjHeader</code> (file <code>src/coreclr/vm/syncblk.h</code>): on a 64-bit platform it has a padding field <code>m_alignpad</code> and a 32-bit <code>m_SyncBlockValue</code>. On x86 the header and the type pointer are 4 bytes each, and the minimum object is 12 bytes.</p><p>The header formally belongs to the object but sits "before" it. That is why the allocator zeroes memory ahead: the header of the next object is already zero when it gets allocated.</p>'
    },
    {
      t: 'choice',
      q: 'What does the reference Order o point at in a 64-bit process?',
      options: ['The word holding the MethodTable pointer inside the object', 'The object header', 'The first field of Order', 'Directly at the MethodTable of Order'],
      answer: 0,
      explain: 'A reference is the address of the type-pointer word. The header is 8 bytes earlier, the fields 8 bytes later. The MethodTable itself is a separate structure, one per type.',
      wrong: { 1: 'The header sits at a negative offset: ref − 8.', 3: 'There is one MethodTable per type, and it lives outside the object heap. The object holds only a pointer to it.' }
    },
    {
      t: 'learn',
      title: '32 header bits: one of three things',
      body: '<p>The top bits of the header are flags, and the rest of the space holds <b>one</b> of three things:</p><ul><li>a <b>thin lock</b>: the owning thread id (16 bits) and the recursion depth (6 bits). This is how <code>lock</code> works while there is no contention;</li><li>the default <b>hash code</b> — 26 bits, written by <code>RuntimeHelpers.GetHashCode</code> (and by a non-overridden <code>GetHashCode</code>);</li><li>a <b>sync block index</b> — the number of an entry in the sync block table, a separate structure in native memory.</li></ul><p>If an object needs more than fits in 32 bits — say, both a hash and a lock — the CLR gives it a <b>sync block</b>: it moves the hash and the monitor state there and writes the index into the header.</p>',
      deep: '<p>The constants are in <code>syncblk.h</code>: <code>BIT_SBLK_IS_HASH_OR_SYNCBLKINDEX</code> says the low 26 bits hold a hash or an index, <code>BIT_SBLK_IS_HASHCODE</code> tells them apart. The <code>BIT_SBLK_FINALIZER_RUN</code> flag is set by <code>GC.SuppressFinalize</code>, and the collector uses <code>BIT_SBLK_GC_RESERVE</code> while it works, with all threads stopped.</p><p>The monitor also needs a sync block in its "heavy" state: threads waiting for the lock, a call to <code>Monitor.Wait</code>. The <code>System.Threading.Lock</code> type from .NET 9 does not touch another object\'s header: <code>lock</code> on it calls methods of the <code>Lock</code> object itself.</p>'
    },
    {
      t: 'match',
      q: 'What the header contents mean',
      pairs: [
        ['All bits are zero', 'Nobody locked the object or took its hash'],
        ['Thin lock', 'Owning thread id and recursion depth'],
        ['Hash code', 'The result of RuntimeHelpers.GetHashCode'],
        ['Sync block index', 'An entry number in a separate table']
      ]
    },
    {
      t: 'tapline',
      q: 'After which line will the object definitely have a sync block?',
      code: 'var o = new object();\nlock (o) { }\nint h = o.GetHashCode();\nlock (o) { }',
      answer: 3,
      explain: 'The first lock is a thin lock in the header, released on exit. GetHashCode writes the hash into the now free header. The second lock has no room left: the CLR moves the hash into a sync block and writes the index into the header.'
    },
    {
      t: 'learn',
      title: 'MethodTable is the type\'s passport',
      body: '<p>There is one MethodTable per type: a million <code>Order</code> objects hold a million pointers to the same structure. It lives not in the GC heap but in loader memory (the loader heap). It contains:</p><ul><li><b>BaseSize</b> — the instance size in bytes, header included;</li><li><b>ComponentSize</b> — the element size for arrays and strings;</li><li>flags: does it have a finalizer, does it contain references, is it an array;</li><li>the parent, the interface map, the virtual method slots.</li></ul><p>The collector needs the MethodTable all the time. From it, it learns the object size to step to the next object, and where the references inside are that must be traced.</p>',
      deep: '<p>The description of references — the <b>GCDesc</b> — sits right before the MethodTable, at negative offsets: a list of "series", ranges of the object where references follow one another. Rarely needed type data (field descriptors, links to metadata) is moved out to a separate EEClass structure. You can look at all of this in a debugger with the SOS extension: <code>!dumpobj</code>, <code>!dumpmt</code>. Each closed generic has its own MethodTable: <code>List&lt;int&gt;</code> and <code>List&lt;string&gt;</code> are different types.</p>'
    },
    {
      t: 'choice',
      q: 'The collector walks the heap object by object. How does it know where the current object ends?',
      options: ['From the MethodTable: BaseSize, plus length × ComponentSize for arrays and strings', 'The object size is stored in its header', 'The GC keeps a separate table with the sizes of all objects', 'Objects in the heap are separated by zero markers'],
      answer: 0,
      explain: 'The size is not stored in the object: it follows from the type. For a plain object it is BaseSize; for an array or a string it is BaseSize plus the length times the element size, rounded up to 8 bytes.',
      wrong: { 1: 'The header has only 32 bits of flags, hash and lock — no size.' }
    },
    {
      t: 'learn',
      title: 'What is not in the object',
      body: '<p>Each instance holds only the header, the type pointer and the <b>instance fields</b>. Everything shared by the type is stored once:</p><ul><li><b>static fields</b> — in separate per-type memory, not in every object;</li><li><b>method code</b> — machine code from the JIT, one per type;</li><li><b>the virtual method table</b> — in the MethodTable.</li></ul><p>So methods and statics do not make objects heavier. A million instances of a class with a hundred methods weigh the same as a million instances of a class with one method and the same fields.</p>',
      deep: '<p>Exactly how the runtime lays out statics has changed from version to version. One detail will be useful later: CoreCLR keeps a static struct field in a separate box — one box per field for the whole lifetime, and writes change its contents. In .NET 8 such boxes for structs without references moved to the non-GC heap — more on it in lesson 4.</p>'
    },
    {
      t: 'multi',
      q: 'What is stored in every instance of Order? Select all.',
      code: 'class Order\n{\n    public static int Count;\n    public int Id;\n    public string? Note;\n    public virtual decimal Total() => 0;\n}',
      options: ['The object header', 'The MethodTable pointer', 'The fields Id and Note', 'The field Count', 'The slot of the virtual method Total'],
      answer: [0, 1, 2],
      explain: 'Count is a static field, there is one per type. The Total slot is in the MethodTable, not in the object. The instance holds 8 bytes of header, 8 bytes of type pointer, an int and a reference — 32 bytes in total.'
    },
    {
      t: 'learn',
      title: 'How much an object weighs: the arithmetic',
      body: '<p>The formula for a plain object on x64: <b>16 bytes</b> (header and type pointer) <b>+ fields</b> with alignment, the total rounded up to 8 and no less than <b>24 bytes</b>.</p><ul><li><code>new object()</code> — 24: no fields, but nothing goes below the minimum;</li><li>a class with one <code>int</code> — 24: 16 + 4, rounded to 24;</li><li>a boxed <code>int</code> or <code>long</code> — 24;</li><li>a class with three <code>int</code> fields — 32: 16 + 12 = 28, rounded to 32.</li></ul><p>You can check it with the thread\'s allocation counter: it counts bytes exactly.</p>',
      code: 'static long SizeOf(Func<object> make)\n{\n    make();  // warm-up: JIT and first allocations\n    long before = GC.GetAllocatedBytesForCurrentThread();\n    object o = make();\n    long after = GC.GetAllocatedBytesForCurrentThread();\n    GC.KeepAlive(o);\n    return after - before;\n}\n\nSizeOf(() => new object());  // 24\nSizeOf(() => (object)42L);   // 24: a boxed long',
      deep: '<p>The 24-byte minimum is defined in the runtime as <code>MIN_OBJECT_SIZE</code> = two pointers + the header. One reason: in place of dead objects the collector leaves a "free object" — a fake array with its own type pointer and length, and it must fit into any gap.</p><p>Do not confuse this with <code>Unsafe.SizeOf&lt;T&gt;()</code>: for a class it returns 8 — the size of a reference, not of the object. For a struct it returns the size of its fields without a header.</p>'
    },
    {
      t: 'choice',
      q: 'How many bytes does an object of this class take on the x64 heap?',
      code: 'class Rgb\n{\n    public int R, G, B;\n}',
      options: ['32', '28', '24', '40'],
      answer: 0,
      explain: '16 bytes of bookkeeping plus 12 bytes of fields is 28. Objects are aligned to 8 bytes, so it is 32.',
      wrong: { 1: 'That is before alignment. On x64 an object size is always a multiple of 8.', 2: '24 is 16 + 8. Three ints need 12 bytes.' }
    },
    {
      t: 'blanks',
      q: 'Measure how many bytes new Order() allocates',
      code: 'long before = GC.___();\nvar o = new Order();\nlong after = GC.___();\nGC.___(o);\nConsole.WriteLine(after - before);',
      tiles: ['GetAllocatedBytesForCurrentThread', 'GetAllocatedBytesForCurrentThread', 'KeepAlive', 'GetTotalMemory', 'Collect'],
      answer: ['GetAllocatedBytesForCurrentThread', 'GetAllocatedBytesForCurrentThread', 'KeepAlive'],
      explain: 'The thread counter grows by exactly the allocated size. GetTotalMemory shows an approximate heap size and depends on collections. KeepAlive stops the JIT from treating the object as unused — in .NET 9–10 it can place objects that never leave the method on the stack, and then the counter would show zero.'
    }
  ]
};

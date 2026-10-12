/** Memory in .NET, unit "Advanced", lesson 1: pinning (fixed, GCHandle, Memory.Pin), fragmentation and the POH. */
export default {
  id: 'mem.u8.l1',
  title: 'Pinning and the POH',
  sub: 'fixed, GCHandle, Memory.Pin and the pinned object heap',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Why stop the collector from moving an object',
      body: '<p>During compaction the collector slides surviving objects and rewrites every reference to them. Managed code never notices: references are updated and everything works.</p><p>But native code — an OS function, a C library, a network card driver — holds a <b>raw address</b>. The collector cannot see it and will not update it. If the object has moved, native code writes its data over someone else’s object.</p><p>So before handing an address out, you <b>pin</b> the object: you tell the collector "do not move this one". A pinned object stays put until the pin is released.</p>',
      code: '// The OS writes straight into the buffer while the read runs\nbyte[] buffer = new byte[4096];\nint read = await socket.ReceiveAsync(buffer);\n// The runtime pinned buffer for you for the duration',
      deep: '<p>The P/Invoke marshaller pins blittable arrays and strings by itself for the duration of a synchronous call — you write nothing extra. The trouble starts when native code <b>remembers</b> the address for longer than one call: asynchronous I/O, callbacks, driver ring buffers. Then the lifetime of the pin is your job.</p>'
    },
    {
      t: 'learn',
      title: 'fixed: a pin for the length of a block',
      body: '<p>The cheapest way is the <code>fixed</code> statement in <code>unsafe</code> code. It gives you a pointer to the data and pins the object until the end of the block.</p><p>The mechanism: the compiler puts the reference into a local variable marked <b>pinned</b>. There is no runtime call at all. Only if a collection happens during the block does the collector, walking the stack, see the mark and leave the object in place.</p><p>The cost is close to zero when no collection happened. The limitation: the pointer is valid only inside the block; after the <code>}</code> the object may move again.</p>',
      code: 'static unsafe void Fill(byte[] data, byte value)\n{\n    fixed (byte* p = data)   // data is pinned\n    {\n        for (int i = 0; i < data.Length; i++)\n            p[i] = value;\n    }                        // pin released\n}',
      deep: '<p>In IL this is a local like <code>uint8&amp; pinned</code>: a managed pointer to the first element. The JIT records in the method’s GC info that the slot is pinned, and the collector learns it while walking frames. For <code>string</code>, <code>Span&lt;T&gt;</code> and your own types, <code>fixed</code> works through the <code>GetPinnableReference()</code> pattern (C# 7.3).</p><p>If the array is empty or null, <code>fixed</code> gives a null pointer rather than an exception.</p>'
    },
    {
      t: 'tapline',
      q: 'The method keeps the pointer it got from fixed. Which line writes to where the array may no longer be?',
      code: 'static unsafe void Fill(int[] data)\n{\n    int* saved;\n    fixed (int* p = data)\n    {\n        p[0] = 1;\n        saved = p;\n    }\n    GC.Collect();\n    saved[1] = 2;\n}',
      answer: 9,
      explain: 'Copying the pointer inside the block is allowed, but after leaving fixed there is no pin. A compacting collection may move data, and the write through saved corrupts someone else’s memory. The compiler does not catch it: to the compiler a pointer is just a number.'
    },
    {
      t: 'learn',
      title: 'GCHandle: a pin without a scope',
      body: '<p>When you need the address for longer than one method, use <code>GCHandle.Alloc(obj, GCHandleType.Pinned)</code>. The runtime creates an entry in the <b>handle table</b>: the collector walks it as roots and does not move pinned objects.</p><ul><li><code>AddrOfPinnedObject()</code> returns the address of the data;</li><li>the pin holds until you call <code>Free()</code>. Forget it and the object is pinned forever and never collected;</li><li>you can only pin an object without references inside: an array of primitives, a string, a class made of numbers. Otherwise — <code>ArgumentException</code>.</li></ul>',
      code: 'var buffer = new byte[64 * 1024];\nvar handle = GCHandle.Alloc(buffer, GCHandleType.Pinned);\ntry\n{\n    IntPtr address = handle.AddrOfPinnedObject();\n    native.StartRead(address, buffer.Length);\n}\nfinally\n{\n    handle.Free();   // only once native code is done\n}',
      deep: '<p>The rule comes from marshalling: only blittable data, which looks the same in the native world, is handed out. References inside an object are useless to native code, and writing to them behind the write barrier’s back would break the collector’s bookkeeping. So the runtime checks the type when pinning.</p><p>.NET 10 added typed wrappers <code>GCHandle&lt;T&gt;</code>, <code>PinnedGCHandle&lt;T&gt;</code> and <code>WeakGCHandle&lt;T&gt;</code> with <code>Dispose</code> instead of <code>Free</code> — handy to keep in a <code>using</code>.</p>'
    },
    {
      t: 'choice',
      q: 'What does this code do?',
      code: 'var list = new List<int> { 1, 2, 3 };\nvar h = GCHandle.Alloc(list, GCHandleType.Pinned);',
      options: [
        'Throws ArgumentException',
        'Pins the list and its inner array',
        'Pins only the List<int> object',
        'Does not compile'
      ],
      answer: 0,
      explain: 'List<int> holds a reference to its _items array, and objects with references cannot be pinned. You can pin the int[] itself — but the list will replace it with a new one when it grows.',
      wrong: { 1: 'Pinning does not follow references: each object is pinned on its own.', 3: 'The signature takes object; the compiler does not check whether it can be pinned — the runtime does.' }
    },
    {
      t: 'learn',
      title: 'Memory<T>.Pin: pinning for async',
      body: '<p><code>Span&lt;T&gt;</code> lives only on the stack and cannot cross an <code>await</code>. In async code a buffer travels as <code>Memory&lt;T&gt;</code>, and you get its address through <code>Pin()</code>.</p><p><code>Pin()</code> returns a <code>MemoryHandle</code> with a <code>Pointer</code> field. Until the handle is released with <code>Dispose()</code>, the data does not move. Under the hood, for an ordinary array it is the same <code>GCHandle</code>; for native memory there is nothing to pin, and <code>Pin</code> is almost free.</p>',
      code: 'async Task SendAsync(Memory<byte> data)\n{\n    using MemoryHandle pin = data.Pin();\n    unsafe   // in an async method — since C# 13\n    {\n        native.Send((IntPtr)pin.Pointer, data.Length);\n    }\n    await native.WaitAsync();   // the buffer is still pinned\n}',
      deep: '<p>If the array already lives in the POH, an extra <code>GCHandle</code> is not needed: <code>MemoryMarshal.CreateFromPinnedArray</code> creates a <code>Memory&lt;T&gt;</code> flagged as "already pinned", and <code>Pin()</code> then just computes the address. For your own <code>MemoryManager&lt;T&gt;</code> you define what <code>Pin</code> does.</p>'
    },
    {
      t: 'match',
      q: 'Match the task with the way to pin',
      pairs: [
        ['A pointer loop over an array inside one method', 'fixed'],
        ['A native library keeps a buffer address between calls', 'GCHandle.Alloc(..., Pinned)'],
        ['Sending a Memory<byte> buffer asynchronously', 'Memory<T>.Pin()'],
        ['A buffer for the whole lifetime of the process', 'GC.AllocateArray(..., pinned: true)'],
        ['A synchronous P/Invoke call with a byte[] array', 'Nothing: the marshaller pins it']
      ]
    },
    {
      t: 'learn',
      title: 'The cost: holes in the heap',
      body: '<p>Compaction slides survivors to the start, freeing one contiguous area. A pinned object stands like a rock: it cannot be moved, and a gap is left in front of it. Many such gaps add up to <b>fragmentation</b>.</p><ul><li>free memory exists, but in pieces: new objects and allocation chunks do not always fit;</li><li>the heap takes more than the live data;</li><li>worst of all are many small pins scattered across <b>generation 0</b>: that is the generation the collector most wants to compact cleanly.</li></ul><p>A short pin during which no collection happened costs nothing. Long pins on fresh objects are what hurts.</p>',
      deep: '<p>The collector fights back: gaps in front of pinned objects become free blocks used for new chunks, and pinned objects from a young generation may stay in it (demotion) instead of being dragged into gen 2. But that is a workaround. You can see the problem in <code>GC.GetGCMemoryInfo()</code>: the <code>PinnedObjectsCount</code> and <code>FragmentedBytes</code> fields, and in a dump with the SOS command <code>!gchandles</code>.</p>'
    },
    {
      t: 'choice',
      q: 'A server creates a byte[8192] per connection and keeps it pinned while the connection is open (minutes). What is wrong with that?',
      options: [
        'Thousands of fresh pinned arrays riddle the young generations, and compaction cannot remove the holes',
        'Pinned arrays are not freed even after Free',
        'Every pin suspends all threads',
        'Nothing: 8 KB is a small object'
      ],
      answer: 0,
      explain: 'The buffers are born in generation 0 among other objects and stay pinned for a long time. Each one has a gap around it that compaction cannot close. The cure is a pool of buffers allocated up front, ideally in the POH.',
      wrong: { 2: 'Pinning itself is cheap: fixed is a mark on the stack, GCHandle is an entry in a table. Threads are suspended by a collection, not by a pin.' }
    },
    {
      t: 'learn',
      title: 'The POH: a heap where nothing moves',
      body: '<p>Since .NET 5 the collector has a <b>pinned object heap</b> (POH). Objects in it never move, so they need no pinning and leave no holes in the SOH.</p><ul><li>allocate an array with <code>GC.AllocateArray&lt;T&gt;(length, pinned: true)</code> or <code>GC.AllocateUninitializedArray&lt;T&gt;(length, pinned: true)</code> — without zeroing;</li><li>the POH is collected together with generation 2, that is, rarely;</li><li>allocating there is slower than usual: a free list instead of a pointer bump.</li></ul><p>Takeaway: the POH is for long-lived buffers allocated once, such as a pool for sockets. Putting temporary arrays there is a bad idea.</p>',
      code: '// A buffer pool for native I/O\nbyte[] block = GC.AllocateUninitializedArray<byte>(\n    64 * 1024, pinned: true);\n\n// in unsafe code fixed (byte* p = block) is a formality:\n// the object does not move anyway',
      deep: '<p>Only arrays go to the POH. In .NET 5–7 the element type could not contain references (<code>ArgumentException</code>); .NET 8 lifted that restriction. Before the POH, pools of pinned buffers were made large (≥ 85,000 bytes) so they landed in the LOH, which is not compacted by default. Kestrel in ASP.NET Core keeps its memory blocks in the POH.</p>'
    },
    {
      t: 'blanks',
      q: 'Allocate the array straight in the pinned object heap',
      code: 'byte[] ring = GC.___<byte>(1 << 20, pinned: ___);',
      tiles: ['AllocateArray', 'true', 'false', 'Allocate', 'Pin'],
      answer: ['AllocateArray', 'true'],
      explain: 'GC.AllocateArray with pinned: true puts the array in the POH. With pinned: false it is an ordinary array in the SOH or LOH — like new byte[n].'
    },
    {
      t: 'multi',
      q: 'What is true about the POH? Select all.',
      options: [
        'The collector never moves objects in the POH',
        'The POH is collected together with generation 2',
        'Any object can go into the POH, not just arrays',
        'Allocating in the POH is cheaper than in generation 0',
        'The POH removes the SOH fragmentation that long pins would cause'
      ],
      answer: [0, 1, 4],
      explain: 'The POH accepts only arrays via GC.AllocateArray and GC.AllocateUninitializedArray. Allocation there goes through a free list and costs more than a pointer bump, so the POH is for rare, long-lived buffers.'
    }
  ]
};

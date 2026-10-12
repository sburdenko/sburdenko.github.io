/** Memory in .NET, unit "Advanced", lesson 2: unsafe and pointers, NativeMemory, Unsafe and MemoryMarshal. */
export default {
  id: 'mem.u8.l2',
  title: 'unsafe and pointers',
  sub: 'Pointers, native memory, Unsafe and MemoryMarshal',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What unsafe unlocks',
      body: '<p>The <code>unsafe</code> keyword unlocks pointers: <code>T*</code>, taking an address with <code>&amp;</code>, dereferencing with <code>*</code>, <code>-&gt;</code> and arithmetic. The project has to allow it explicitly: <code>&lt;AllowUnsafeBlocks&gt;true&lt;/AllowUnsafeBlocks&gt;</code>.</p><p>A pointer can only point to an <b>unmanaged</b> type: numbers, <code>bool</code>, <code>char</code>, enums, other pointers and structs made of them. You cannot take a pointer to a class or a string.</p><p>What goes away: bounds checks, type checks and — most importantly — the collector’s involvement. To the GC a pointer is just a number.</p>',
      code: 'static unsafe long Sum(int[] data)\n{\n    long sum = 0;\n    fixed (int* start = data)\n    {\n        int* p = start;\n        int* end = start + data.Length;\n        while (p < end)\n            sum += *p++;\n    }\n    return sum;\n}',
      deep: '<p><code>unsafe</code> does not change the IL much: pointer arithmetic is plain <code>add</code> and <code>ldind</code>/<code>stind</code>. What changes is that the code becomes <b>unverifiable</b>: memory safety is now your guarantee. In .NET Framework this mattered for partial trust (CAS); .NET Core has no partial trust, and <code>unsafe</code> is just a compiler flag.</p>'
    },
    {
      t: 'learn',
      title: 'The collector sees ref, not pointers',
      body: '<p>.NET has two kinds of "address":</p><ul><li>A <b>managed pointer</b> — <code>ref T</code>, and what sits inside a <code>Span&lt;T&gt;</code>. The JIT tells the collector where such references live. If the object moves, the collector updates even a reference into its middle. No pinning needed.</li><li>An <b>unmanaged pointer</b> — <code>T*</code>, <code>nint</code>, <code>IntPtr</code>. The collector knows nothing about it. You may hold one to a heap object only while the object is pinned.</li></ul><p>Hence the rule: for managed memory use <code>ref</code> and <code>Span</code>. Pointers are for memory the collector does not move: the stack, <code>stackalloc</code>, native memory, the POH.</p>',
      deep: '<p>A pointer to an unpinned heap object is the classic "GC hole". The code works thousands of times until a compacting collection lands exactly between taking the address and writing through it. Such bugs barely reproduce under a debugger. To hunt them the runtime has a debug mode, GC Stress, which triggers a collection at every point where one is possible. It is used mostly by the CLR developers themselves.</p>'
    },
    {
      t: 'choice',
      q: 'You need a local "address" of the fifth element of a heap array and to write through it. What is safe without pinning?',
      options: ['ref int', 'int*', 'IntPtr', 'nint'],
      answer: 0,
      explain: 'ref int is a managed pointer: the collector knows about it and moves it along with the array during compaction. int*, IntPtr and nint are just numbers; once the array moves they point to nowhere.'
    },
    {
      t: 'learn',
      title: 'NativeMemory: memory the collector never sees',
      body: '<p>Since .NET 6 native memory comes from <code>NativeMemory</code>: <code>Alloc</code>, <code>AllocZeroed</code>, <code>Realloc</code>, <code>Free</code>, and the aligned <code>AlignedAlloc</code> and <code>AlignedFree</code>. It is a thin wrapper over the C library’s <code>malloc</code>/<code>free</code>.</p><p>What matters:</p><ul><li>the collector does not see this memory: it is not part of the heap size, and the GC will not free it;</li><li>forget <code>Free</code> and you have a leak that only private bytes reveals (as in the "How to measure" unit);</li><li>free it in a <code>finally</code>, or via a <code>SafeHandle</code> if the memory lives as long as an object.</li></ul>',
      code: 'unsafe\n{\n    nuint size = 1024 * 1024;\n    byte* p = (byte*)NativeMemory.Alloc(size);\n    try\n    {\n        var span = new Span<byte>(p, (int)size);\n        span.Fill(0xFF);\n    }\n    finally\n    {\n        NativeMemory.Free(p);\n    }\n}',
      deep: '<p>Before .NET 6 people used <code>Marshal.AllocHGlobal</code>: <code>LocalAlloc</code> on Windows, <code>malloc</code> on Unix. .NET 7 added <code>NativeMemory.Clear</code>, <code>Copy</code> and <code>Fill</code>. When memory runs out, <code>Alloc</code> throws <code>OutOfMemoryException</code> rather than returning null. The most convenient way to work with such memory is through <code>Span&lt;T&gt;</code>: it puts bounds checks on top of the raw pointer.</p>'
    },
    {
      t: 'blanks',
      q: 'Take a native buffer and make sure it is returned',
      code: 'byte* buf = (byte*)NativeMemory.___(4096);\ntry\n{\n    Process(buf, 4096);\n}\nfinally\n{\n    NativeMemory.___(buf);\n}',
      tiles: ['Alloc', 'Free', 'Clear', 'Release', 'Realloc'],
      answer: ['Alloc', 'Free'],
      explain: 'Alloc allocates, Free returns the memory to the C library heap. Clear only zeroes the bytes, Realloc resizes, and NativeMemory has no Release method.'
    },
    {
      t: 'learn',
      title: 'Unsafe: unsafe without the unsafe keyword',
      body: '<p>The <code>System.Runtime.CompilerServices.Unsafe</code> class does what pointers do, but through <code>ref</code> — and needs no <code>unsafe</code> in your code. The collector sees the references, but types and bounds are on you.</p><ul><li><code>Unsafe.As&lt;T&gt;(object)</code> — treat a reference as a reference to T without a type check;</li><li><code>Unsafe.Add(ref x, n)</code> — move a ref by n elements without a bounds check;</li><li><code>Unsafe.SizeOf&lt;T&gt;()</code>, <code>ReadUnaligned</code>, <code>SkipInit</code>;</li><li><code>Unsafe.BitCast&lt;TFrom, TTo&gt;</code> (.NET 8) — reinterpret the bits of a value.</li></ul>',
      code: 'int[] arr = { 1, 2, 3, 4 };\nref int first = ref MemoryMarshal.GetArrayDataReference(arr);\nref int fourth = ref Unsafe.Add(ref first, 3);   // no bounds check\n\nobject o = "hello";\nstring s = Unsafe.As<string>(o);                 // no type check\nfloat one = Unsafe.BitCast<int, float>(0x3F800000);   // 1.0f',
      deep: '<p><code>Unsafe</code> methods are JIT intrinsics: most compile to one or two instructions or vanish entirely. In the CoreLib sources many of them have a stub body with the IL in a comment, and the JIT substitutes the real implementation. The .NET libraries use them heavily in the inner loops of <code>Span</code>, strings and collections.</p>'
    },
    {
      t: 'learn',
      title: 'MemoryMarshal: Span without ceremony',
      body: '<p><code>System.Runtime.InteropServices.MemoryMarshal</code> lifts the restrictions on <code>Span</code>:</p><ul><li><code>GetReference(span)</code> and <code>GetArrayDataReference(array)</code> — a ref to the first element with no bounds check;</li><li><code>Cast&lt;TFrom, TTo&gt;(span)</code> — see bytes as <code>int</code>s or structs without copying;</li><li><code>AsBytes</code>, <code>Read&lt;T&gt;</code>, <code>Write&lt;T&gt;</code> — read and write structs in a byte buffer;</li><li><code>CreateSpan(ref x, length)</code> — make a Span from a single ref.</li></ul><p>The typical case is parsing a binary format right in the buffer, with no copies and no allocations.</p>',
      code: 'ReadOnlySpan<byte> bytes = File.ReadAllBytes("data.bin");\nint count = MemoryMarshal.Read<int>(bytes);          // first 4 bytes\nReadOnlySpan<int> ints = MemoryMarshal.Cast<byte, int>(bytes[4..]);\n// ints — the same bytes, no copy',
      deep: '<p><code>Cast</code> and <code>Read</code> work only with types without references — otherwise <code>ArgumentException</code>: turning bytes into a reference would mean forging an object address. Byte order is the machine’s (little-endian on x64 and ARM64); for portable formats use <code>BinaryPrimitives.ReadInt32LittleEndian</code>. Unaligned reads work on x64 and ARM64.</p>'
    },
    {
      t: 'match',
      q: 'Match the API with what it does',
      pairs: [
        ['Unsafe.As<T>(obj)', 'A reference to another type, unchecked'],
        ['Unsafe.Add(ref x, n)', 'Moves a ref without a bounds check'],
        ['MemoryMarshal.Cast<byte, int>(span)', 'The same bytes as another type'],
        ['NativeMemory.Alloc(n)', 'Memory the collector does not see'],
        ['MemoryMarshal.GetArrayDataReference(arr)', 'A ref to the first array element']
      ]
    },
    {
      t: 'learn',
      title: 'How it ends',
      body: '<p>A bug in unsafe code rarely crashes right away. The typical story:</p><ul><li>a write past the end of an array overwrites the header or type pointer of the neighbouring object;</li><li>the program keeps running — until the next collection;</li><li>during marking the collector follows the corrupted type pointer and crashes. The process dies with an internal CLR error, and the stack shows the GC, not your code.</li></ul><p>So the rules are simple: unsafe code only in hot spots, after measuring; small isolated methods; tests at the boundaries; and <code>Span</code> with its checks wherever you can.</p>',
      deep: '<p>In a dump you hunt such corruption with the SOS command <code>!verifyheap</code>: it walks the heap and reports the first corrupted object. The neighbour right before it is the first suspect. <code>Unsafe.As</code> with the wrong type does the same more subtly: a virtual call through the "wrong" type pointer jumps through someone else’s method table.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line holds the bug that makes the code write past the end of the array?',
      code: 'int[] a = new int[4];\nref int first = ref MemoryMarshal.GetArrayDataReference(a);\nfor (int i = 0; i <= a.Length; i++)\n    Unsafe.Add(ref first, i) = i;',
      answer: 2,
      explain: 'The condition i <= a.Length gives five iterations for four elements. Ordinary indexing would throw IndexOutOfRangeException, but Unsafe.Add silently writes the number into the memory after the array — most likely into the next object’s header.'
    },
    {
      t: 'choice',
      q: 'A loop was rewritten from a[i] to Unsafe.Add to remove bounds checks. The benchmark showed no difference. Why?',
      code: 'for (int i = 0; i < a.Length; i++)\n    sum += a[i];',
      options: [
        'The JIT already removes the bounds check in a loop from 0 to a.Length',
        'Unsafe.Add checks bounds too',
        'Bounds checks only run in Debug',
        'Adding to a long is slower than any check'
      ],
      answer: 0,
      explain: 'The JIT proves that i is always within the array and emits no check (bounds check elimination). So a simple loop over an array or Span is already fast. Unsafe pays off where the JIT cannot prove it: strided walks, indices taken from another array.',
      wrong: { 2: 'Bounds checks exist in Release too: they are part of memory safety, not a debugging feature.' }
    },
    {
      t: 'multi',
      q: 'When is unsafe code justified? Select all.',
      options: [
        'A hot loop where measurement showed that bounds checks cost noticeably',
        'A buffer for a native library that the collector must not see',
        'Parsing a binary protocol in a buffer without copying',
        'To speed up any code "just in case"',
        'To get around an InvalidCastException'
      ],
      answer: [0, 1, 2],
      explain: 'Unsafe code is a tool for bottlenecks and for talking to the native world. Without a measurement it only adds risk, and Unsafe.As in place of an honest cast turns a clear exception into memory corruption.'
    }
  ]
};

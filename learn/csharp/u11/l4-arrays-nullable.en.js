/** Deeper C#, unit "Strings, enums, arrays", lesson 4: arrays inside and Nullable<T>. */
export default {
  id: 'cs.u11.l4',
  title: 'Arrays and Nullable<T>',
  sub: 'The cost of covariance, jagged versus multidimensional, InlineArray, collection expressions and boxing int?',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'Array covariance costs a check',
      body: '<p>You saw the trap <code>object[] arr = new string[2]; arr[0] = 42;</code> in the unit "Generics". Now let us see what it costs. Since an <code>object[]</code> may hide a <code>string[]</code>, the CLR has to check <b>every reference store</b> into an array of a reference type. The IL instruction <code>stelem.ref</code> calls a runtime helper: it compares the value\'s type with the element type of the actual array and throws <code>ArrayTypeMismatchException</code> on a mismatch.</p><p>The JIT drops the check when it can prove it is not needed: the value is <code>null</code>, the element type is <code>sealed</code> (<code>string[]</code> has no derived element types), or the exact array type is known. Otherwise it is an extra call on every assignment.</p>',
      code: 'void Fill(Animal[] arr, Animal a)\n{\n    for (int i = 0; i < arr.Length; i++)\n        arr[i] = a;   // check: what if arr is really a Cat[]?\n}',
      deep: '<p>Arrays of value types are not covariant in C#: <code>object[] o = new int[3]</code> does not compile. But the CLR treats integer arrays of the same size as compatible: <code>(uint[])(object)new int[1]</code> succeeds at run time, as does an enum array to an array of its underlying type. In hot loops the store check is avoided with a wrapper struct (<code>struct Ref { public Animal Value; }</code> and a <code>Ref[]</code> array) — a value type has no covariance, so there is nothing to check.</p>'
    },
    {
      t: 'choice',
      q: 'What happens on the second line?',
      code: 'object[] arr = new string[2];\nSpan<object> span = arr;\nspan[0] = 42;',
      options: ['ArrayTypeMismatchException when the Span is created', 'Nothing: the exception comes on the third line', 'A compile error', 'The Span copies the elements into a new object[]'],
      answer: 0,
      explain: 'Span<T> does not check every store — for speed. So it checks once, in the constructor: if an array of a reference type is not actually a T[], it throws ArrayTypeMismatchException right away.',
      wrong: { 1: 'A store through a Span is a plain memory write without stelem.ref. To keep it safe, the check was moved to the moment the Span is created.' }
    },
    {
      t: 'learn',
      title: 'Jagged and multidimensional',
      body: '<p>A <b>jagged</b> array <code>int[][]</code> is an array of references to separate arrays. Each row is its own heap object with its own length. 1000 rows means 1001 allocations, and <code>a[i][j]</code> means two pointer hops and two bounds checks.</p><p>A <b>multidimensional</b> <code>int[,]</code> is one object with the data laid out as a rectangle. But for the CLR it is built differently from <code>int[]</code>. A single-dimension zero-based array (an SZ array) has its own IL instructions: <code>newarr</code>, <code>ldelem</code>, <code>stelem</code>. A multidimensional one does not: creation is <code>newobj</code>, access is calls to <code>Get</code>/<code>Set</code>/<code>Address</code> methods the runtime provides for the array type.</p><p>Historically that made <code>int[,]</code> slower than jagged. Since .NET 7 the JIT expands these calls into direct access, and the gap has shrunk a lot. But multidimensional arrays still get fewer of the SZ-array optimizations (bounds-check removal in loops, vectorization, Span).</p>',
      code: 'int[][] jag = new int[3][];   // three nulls, rows come later\njag[0] = new int[5];\n\nint[,] grid = new int[3, 5];  // one object for 15 elements\ngrid[1, 2] = 7;               // IL: call int32[,]::Set(...)',
      deep: '<p>A common fast option is a one-dimensional array with a manual index: <code>data[row * width + col]</code>. One object, contiguous data, every SZ-array optimization and a <code>Span</code> over the whole table. The CLR also has single-dimension arrays with a non-zero lower bound (via <code>Array.CreateInstance</code>); their type is written <code>int[*]</code>, and such an array cannot be cast to <code>int[]</code>.</p>'
    },
    {
      t: 'match',
      q: 'Match the declaration with how it is built',
      pairs: [
        ['int[]', 'Single dimension from zero: its own newarr and ldelem'],
        ['int[,]', 'One object, accessed through Get and Set methods'],
        ['int[][]', 'An array of references to separate rows'],
        ['[InlineArray(8)] struct', 'Eight elements right inside the struct'],
        ['ReadOnlySpan<int> s = [1, 2, 3]', 'A view over assembly data, no allocation']
      ]
    },
    {
      t: 'learn',
      title: 'InlineArray (C# 12, .NET 8)',
      body: '<p>Sometimes you need a fixed-size buffer <b>inside</b> a struct — without a separate heap array. Before, the only tool was <code>fixed int buf[8]</code>: it needs <code>unsafe</code>, works only with primitives and does not check bounds.</p><p>The <code>[InlineArray(N)]</code> attribute tells the runtime: repeat the struct\'s single field N times in a row. Since C# 12 the language lets you index such a struct, iterate it with <code>foreach</code> and convert it to a <code>Span&lt;T&gt;</code>. The code is safe, the element type can be anything including references, and bounds are checked.</p>',
      code: '[InlineArray(8)]\nstruct Buffer8<T>\n{\n    private T _first;   // exactly one field\n}\n\nvar buf = new Buffer8<int>();\nbuf[0] = 42;\nSpan<int> span = buf;   // 8 elements, on the stack',
      deep: '<p>The struct size is N × the field size, so a large InlineArray in a local variable eats stack. The C# compiler uses the feature itself: for <code>params Span&lt;T&gt;</code> (C# 13) and collection expressions targeting <code>Span</code> it may generate a hidden inline struct on the stack instead of an array. Inside the runtime, InlineArray has replaced many places that used to have <code>fixed</code> buffers or hand-written fields <code>_e0</code>, <code>_e1</code>…</p>'
    },
    {
      t: 'choice',
      q: 'Why is [InlineArray(8)] better than fixed int buf[8]?',
      options: ['No unsafe needed, elements can be of any type, bounds are checked', 'It lives on the heap and takes no stack', 'It is faster because it skips bounds checks', 'It can be resized at run time'],
      answer: 0,
      explain: 'Both live inside the struct. But a fixed buffer is an unchecked pointer and only for primitives, while an InlineArray is an ordinary safe type that converts to a Span.',
      wrong: { 3: 'The size is set in the attribute and fixed: it is part of the struct layout.' }
    },
    {
      t: 'learn',
      title: 'Collection expressions: what the compiler generates',
      body: '<p>You saw the <code>[1, 2, 3]</code> syntax (C# 12) in the unit "Modern C#". What is more interesting is underneath: the compiler picks the code <b>by the target type</b>.</p><ul><li><code>int[] a = [1, 2, 3]</code> — a new array, like <code>new[] { … }</code>;</li><li><code>int[] e = []</code> — <code>Array.Empty&lt;int&gt;()</code>, a shared empty array with no new allocation;</li><li><code>ReadOnlySpan&lt;int&gt; s = [1, 2, 3]</code> from constants — a view over assembly data, zero allocations;</li><li><code>List&lt;int&gt; l = [1, 2, 3]</code> — a list with the right capacity up front;</li><li><code>IEnumerable&lt;int&gt; x = [1, 2]</code> — the compiler chooses the type, often a hidden read-only class.</li></ul><p><code>..</code> (spread) inserts the elements of another collection; if the lengths are known, the compiler computes the final size in advance.</p>',
      deep: '<p>Your own type plugs into collection expressions through the <code>[CollectionBuilder]</code> attribute — that is how <code>ImmutableArray&lt;T&gt;</code> and other immutable collections work. For interfaces the compiler does not promise a concrete type: do not rely on <code>IEnumerable&lt;int&gt; x = [..]</code> being an array or a list, and do not cast it back.</p>'
    },
    {
      t: 'multi',
      q: 'Which lines do not allocate a new heap object? Select all.',
      options: ['int[] a = [];', 'ReadOnlySpan<byte> b = [1, 2, 3];', 'List<int> c = [1, 2];', 'int[] d = [1, 2, 3];'],
      answer: [0, 1],
      explain: 'The empty array is the shared Array.Empty<int>(). A ReadOnlySpan of constants points at assembly data. The List and the non-empty array are new heap objects.'
    },
    {
      t: 'learn',
      title: 'Nullable<T> is an ordinary struct',
      body: '<p><code>int?</code> is <code>Nullable&lt;int&gt;</code>: a struct with two fields, <code>bool hasValue</code> and <code>T value</code>. No reference and no heap: an <code>int?</code> takes 8 bytes (1 byte of flag, padding and 4 bytes of number), a <code>long?</code> takes 16.</p><p>The <code>where T : struct</code> constraint excludes Nullable itself, so there is no <code>int??</code>.</p><p>Operators are "lifted": if any operand is null, arithmetic gives null, and the comparisons <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> give <b>false</b>. The compiler turns <code>x == null</code> into <code>!x.HasValue</code>.</p>',
      code: 'int? a = null;\nint? sum = a + 1;        // null\nbool gt = a > 0;         // false\nbool le = a <= 0;        // false too!\nint v = a.GetValueOrDefault(); // 0, no check\nint w = a.Value;         // InvalidOperationException',
      deep: '<p><code>GetValueOrDefault()</code> just reads the <code>value</code> field, while <code>.Value</code> checks the flag first. <code>bool?</code> with the <code>&amp;</code> and <code>|</code> operators follows three-valued logic: <code>null &amp; false</code> is false, <code>null | true</code> is true, and <code>null &amp; true</code> is null. In an <code>int?[]</code> array every element is 8 bytes versus 4 in <code>int[]</code>: the flag doubles the size.</p>'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'int? a = null;\nConsole.WriteLine(a > 0 || a <= 0);',
      options: ['False', 'True', 'Throws InvalidOperationException', 'Does not compile'],
      answer: 0,
      explain: 'With null every ordering comparison is false, so "greater than zero or not greater" is false too. The familiar "one of the two" law does not hold for Nullable.'
    },
    {
      t: 'learn',
      title: 'How int? is boxed',
      body: '<p>For <code>Nullable&lt;T&gt;</code> the CLR makes an exception in the <code>box</code> instruction:</p><ul><li>if there is no value, the result is <b>null</b>, not a box;</li><li>if there is one, <b>T</b> itself is boxed. A box holding a <code>Nullable&lt;int&gt;</code> does not exist — there is only a box holding an <code>int</code>.</li></ul><p>Consequences: <code>object o = (int?)null</code> is truly null. A box with an <code>int</code> can be unboxed into both <code>int</code> and <code>int?</code>. And <code>x.GetType()</code> on an <code>int?</code> is called through boxing and returns <code>System.Int32</code> — or throws <code>NullReferenceException</code> when there is no value.</p>',
      code: 'int? x = 5;\nobject o = x;               // a box with Int32\nConsole.WriteLine(o.GetType()); // System.Int32\nint? back = (int?)o;        // unboxing into int? is allowed\n\nint? none = null;\nobject n = none;            // null, not a box',
      deep: '<p>This rule arrived shortly before .NET 2.0 shipped: in the beta versions a boxed empty <code>int?</code> was a non-null object, and <code>o == null</code> gave false. The runtime was changed, not just C#, so that null stays null in every language. Interfaces also go through boxing T: <code>IComparable c = (int?)5</code> is a box with an <code>int</code>. To find out that a type is Nullable, use <code>Nullable.GetUnderlyingType(typeof(int?))</code>: the object itself loses that information.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line throws an exception?',
      code: 'int? a = 5;\nint? b = null;\nobject oa = a;\nobject ob = b;\nConsole.WriteLine(oa.GetType());\nConsole.WriteLine(ob == null);\nConsole.WriteLine(b.GetType());',
      answer: 6,
      explain: 'GetType is a non-virtual method of object, and calling it boxes b. An empty int? boxes to null — hence NullReferenceException. oa.GetType() prints System.Int32, and ob == null prints True.'
    }
  ]
};

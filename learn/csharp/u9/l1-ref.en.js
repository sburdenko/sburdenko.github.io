/** Deeper C#, unit "Parameters, properties, tuples", lesson 1: ref, out, in, ref readonly and ref returns. */
export default {
  id: 'cs.u9.l1',
  title: 'ref inside out',
  sub: 'Managed pointers, ref readonly and ref returns',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'One pointer, four keywords',
      body: '<p>You saw the basics — a copy, <code>ref</code>, <code>out</code>, <code>in</code> — in the lesson "Passing to a method" of the ".NET inside out" course. Now let us look underneath.</p><p>To the CLR, all four by-reference forms are one and the same type: a <b>managed pointer</b>, written <code>int32&amp;</code> in IL. The differences are just flags and attributes in the parameter metadata. The C# compiler reads them, the runtime does not.</p><p>Hence the rule: you cannot overload a method on <code>ref</code>/<code>out</code>/<code>in</code> alone — in IL such methods have the same signature. That is error <b>CS0663</b>. A by-value plus by-reference pair is fine: <code>int</code> and <code>int&amp;</code> are different types.</p>',
      code: '// C#                  →  IL parameter signature\nvoid A(ref int x)       // int32& x\nvoid B(out int x)       // [out] int32& x\nvoid C(in int x)        // [in] int32& x + IsReadOnlyAttribute\nvoid D(ref readonly int x) // [in] int32& x + RequiresLocationAttribute',
      deep: '<p>Only the C# compiler checks that an <code>out</code> parameter is assigned (the definite assignment rules). The CLR does not: a method written in another language or in IL can return without writing anything. The <code>[out]</code> flag matters mostly to the marshaler when calling native code.</p><p>A managed pointer can point inside an object — at a field or an array element. The garbage collector knows about such interior pointers: while a reference to <code>arr[5]</code> is alive, the whole array stays alive, and when the heap is compacted the pointer moves along with it.</p>'
    },
    {
      t: 'choice',
      q: 'Which set of overloads will not compile?',
      options: [
        'void M(ref int x) and void M(out int x)',
        'void M(int x) and void M(ref int x)',
        'void M(int x) and void M(in int x)',
        'void M(ref int x) and void M(ref long x)'
      ],
      answer: 0,
      explain: 'ref and out are the same int32& in IL; only a flag differs. The signatures collide and the compiler reports CS0663. A by-value plus by-reference pair is legal: int and int& are different types.',
      wrong: { 2: 'It compiles. A call M(x) with no modifier picks the by-value version, M(in x) picks the in one.' }
    },
    {
      t: 'learn',
      title: 'in accepts anything',
      body: '<p><code>in</code> was designed for speed: pass a big struct by address instead of copying it. That is why it is so accommodating:</p><ul><li>you may omit the modifier at the call site: <code>Print(p)</code>;</li><li>you may pass a value instead of a variable — <code>Print(new Point(1, 2))</code>. The compiler silently creates a hidden local and passes a reference to it.</li></ul><p>For "just read it" this is convenient. But if the method wants to <b>remember the address</b> (build a span over it, compare addresses), a reference to a temporary copy is a quiet bug: each call gets its own copy, and it lives for one expression.</p><p>Defensive copies when calling methods on an <code>in</code> struct are covered in the "Performance" unit.</p>',
      code: 'static void Print(in Point p) => Console.WriteLine(p.X);\n\nvar p = new Point(1, 2);\nPrint(in p);              // a reference to p\nPrint(p);                 // the same, the modifier is optional\nPrint(new Point(3, 4));   // a reference to a hidden temporary copy'
    },
    {
      t: 'learn',
      title: 'ref readonly (C# 12): I need an address, I will not write',
      body: '<p>A <code>ref readonly</code> parameter is read-only like <code>in</code>, but it requires a <b>real location in memory</b>:</p><ul><li>the call site writes <code>ref</code> or <code>in</code>;</li><li>no modifier — a warning;</li><li>a value instead of a variable — a warning (a temporary is still created);</li><li><code>out</code> — an error.</li></ul><p>Why: libraries had methods that need an address but never write to it. Some took <code>ref</code> — and rejected <code>readonly</code> fields. Others took <code>in</code> — and quietly accepted temporaries. The single-element constructor of <code>ReadOnlySpan&lt;T&gt;</code> was one of them.</p>',
      code: 'static ref readonly int Larger(ref readonly int a, ref readonly int b)\n{\n    if (a >= b) return ref a;\n    return ref b;\n}\n\nint[] arr = [1, 7];\nref readonly int big = ref Larger(ref arr[0], in arr[1]);  // points at arr[1]\nLarger(in arr[0], 5);   // warning: 5 is not a variable',
      deep: '<p>In metadata a <code>ref readonly</code> parameter is <code>[in] T&amp;</code> with <code>RequiresLocationAttribute</code>; virtual methods also get <code>modreq(InAttribute)</code>. It has no <code>IsReadOnlyAttribute</code>, so an older compiler sees a plain <code>ref</code>.</p><p>The "version 2" scenario: changing <code>ref</code> to <code>ref readonly</code> in a library is source-safe for callers: <code>ref x</code> at the call site is still allowed. And in C# 12 passing a <code>ref</code> argument to an <code>in</code> parameter became a warning instead of an error — also to ease this kind of migration.</p>'
    },
    {
      t: 'match',
      q: 'Match the parameter modifier to what it allows at the call site',
      pairs: [
        ['ref', 'Only a writable variable, ref at the call site is required'],
        ['out', 'The variable may be unassigned, the method must write it'],
        ['in', 'Any value, a temporary copy is made for it'],
        ['ref readonly', 'A variable, even readonly; a value gives a warning'],
        ['no modifier', 'The method gets its own copy']
      ]
    },
    {
      t: 'tapline',
      q: 'Peek takes a ref readonly int. Which line will not compile?',
      code: 'static int Peek(ref readonly int x) => x;\n\nint v = 1;\nPeek(ref v);\nPeek(in v);\nPeek(v);\nPeek(out v);',
      answer: 6,
      explain: 'You cannot pass out to a ref readonly parameter: the method does not promise to write a value. Peek(v) with no modifier compiles, with a warning; ref and in are allowed.'
    },
    {
      t: 'learn',
      title: 'A ref return: the method hands out a location, not a value',
      body: '<p>A method can return not a value but a <b>reference to a variable</b>: an array element, a field of an object, a parameter that came in by reference. The caller then has a choice:</p><ul><li><code>ref int m = ref FindMax(a);</code> — a <b>ref local</b>, an alias of the element. Writing to <code>m</code> changes the array;</li><li><code>int m = FindMax(a);</code> — without <code>ref</code> at the call site the value is simply copied.</li></ul><p>Since C# 7.3 a ref local can be re-pointed: <code>m = ref other;</code>. A plain <code>m = 5</code> writes to wherever it points.</p>',
      code: 'static ref int FindMax(int[] a)\n{\n    int best = 0;\n    for (int i = 1; i < a.Length; i++)\n        if (a[i] > a[best]) best = i;\n    return ref a[best];\n}\n\nint[] a = [3, 9, 4];\nref int m = ref FindMax(a);\nm = 0;                     // a == [3, 0, 4]'
    },
    {
      t: 'choice',
      q: 'FindMax returns ref int, as above. What ends up in the array?',
      code: 'int[] a = [3, 9, 4];\nint m = FindMax(a);\nm = 0;\nConsole.WriteLine(string.Join(",", a));',
      options: ['3,9,4', '3,0,4', '0,9,4', 'Does not compile: ref is required'],
      answer: 0,
      explain: 'Without ref at the call site and on the variable, the returned reference is dereferenced right away: m is an ordinary copy of the number 9. The array does not change.',
      wrong: { 3: 'It compiles: a ref return can be read as an ordinary value. You need ref only if you want an alias.' }
    },
    {
      t: 'learn',
      title: 'Where ref returns already work for you',
      body: '<p><b>Arrays</b>: <code>arr[i]</code> is the variable itself, so <code>arr[i].X = 5</code> changes the struct right inside the array.<br><b>Span&lt;T&gt;</b>: the indexer returns <code>ref T</code> — the same behavior.<br><b>List&lt;T&gt;</b>: the indexer is an ordinary property and returns a <b>copy</b>. <code>list[i].X = 5</code> on a struct does not compile (CS1612): you would change a copy and throw it away.</p><p>For hot code there is <code>CollectionsMarshal</code>: <code>AsSpan(list)</code> gives a span over the list\'s internal array, and <code>GetValueRefOrAddDefault(dict, key, out exists)</code> gives a <code>ref</code> to the value in a dictionary in <b>one</b> hash lookup instead of the two of a <code>TryGetValue</code> + write pair.</p>',
      deep: '<p>The price is guarantees. The span from <code>AsSpan</code> looks at the current internal array: add elements, the list moves to a new array, and the span stays on the old one. The reference from <code>GetValueRefOrAddDefault</code> is valid only while the dictionary is not modified: an insert can rebuild its storage. That is why both methods live in <code>System.Runtime.InteropServices</code> — "I know what I am doing".</p>'
    },
    {
      t: 'tapline',
      q: 'Point is a mutable struct with a field X. Which line will not compile?',
      code: 'var arr = new Point[1];\nvar list = new List<Point> { new Point() };\narr[0].X = 5;\nCollectionsMarshal.AsSpan(list)[0].X = 5;\nlist[0].X = 5;',
      answer: 4,
      explain: 'The List<T> indexer returns a copy of the struct, so changing its field is pointless — CS1612. An array element and a span element are variables (ref), so the write goes in place.'
    },
    {
      t: 'learn',
      title: 'What a ref return cannot do',
      body: '<p>You can return a reference only to something that <b>outlives the method</b>: an array element, a field of a heap object, a parameter that came in by <code>ref</code>. A reference to your own local is forbidden (<b>CS8168</b>): the stack frame will be gone and the reference would dangle.</p><p>More limits: a ref local lives only on the stack. A lambda cannot capture it, a class field cannot hold it. Async methods and iterators allow ref locals since C# 13, but not across <code>await</code> and <code>yield</code>.</p>',
      code: 'static ref int Bad()\n{\n    int x = 5;\n    return ref x;      // CS8168: x dies with the frame\n}\n\nstatic ref int Ok(ref int x) => ref x;   // lives in the caller',
      deep: '<p>The compiler tracks this with the ref safety rules: every reference has a "how far it may escape" — to the caller, or only inside the method. The <code>scoped</code> keyword (C# 11) narrows a parameter to "inside only", and then it cannot be returned. Only a <code>ref struct</code> may store a ref in a field (ref fields, C# 11) — that is how <code>Span&lt;T&gt;</code> itself is built.</p>'
    },
    {
      t: 'blanks',
      q: 'A word counter with a single dictionary lookup',
      code: 'var counts = new Dictionary<string, int>();\nforeach (var word in words)\n{\n    ___ int c = ___ CollectionsMarshal.GetValueRefOrAddDefault(counts, word, ___ _);\n    c++;\n}',
      tiles: ['ref', 'ref', 'out', 'in', 'var'],
      answer: ['ref', 'ref', 'out'],
      explain: 'The method returns a ref int to the value in the dictionary (a new key gets 0). ref on the left and ref at the call make c an alias of that value, and c++ writes straight into the dictionary. The last parameter is out bool exists, which we discard.'
    },
    {
      t: 'choice',
      q: 'Why does return ref x not compile when x is a local variable of the method?',
      options: [
        'The method frame disappears on return, so the reference would point at dead memory',
        'You can return ref only to class fields',
        'Locals always live in registers and have no address',
        'The variable has to be marked scoped'
      ],
      answer: 0,
      explain: 'A local lives in the stack frame, and the frame is released on return. You can return a ref to something that outlives the method: an array element, an object field, a ref parameter.',
      wrong: { 1: 'An array element and a ref parameter work too.', 3: 'scoped does the opposite: it forbids returning the reference.' }
    }
  ]
};

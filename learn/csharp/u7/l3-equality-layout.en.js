/** Deeper C#, unit "Value types all the way", lesson 3: ValueType.Equals, IEquatable<T>, struct size and layout. */
export default {
  id: 'cs.u7.l3',
  title: 'Equality and layout',
  sub: 'ValueType.Equals, IEquatable<T>, record struct and the bytes of a struct',
  minutes: 11,
  cards: [
    {
      t: 'learn',
      title: 'How ValueType.Equals works',
      body: '<p>A struct without its own <code>Equals</code> is compared by value — <code>ValueType.Equals(object)</code> does it. It does not know your fields in advance and goes like this:</p><ul><li>the argument is null or of another type (checked via <code>GetType</code>) — false;</li><li>if the struct can be compared <b>byte by byte</b> — it compares the memory of both values as byte arrays. That is fast;</li><li>otherwise — <b>reflection</b>: it gets the list of fields via <code>GetFields</code> and calls <code>FieldInfo.GetValue</code> on both values for each one. Every value-type field gets boxed along the way, then compared with <code>Equals</code>.</li></ul><p>The slow path is several times, even an order of magnitude, slower than a hand-written comparison and allocates on every call.</p>',
      deep: '<p>Sources: <code>ValueType.cs</code> in dotnet/runtime (CoreLib) and the <code>CanCompareBitsOrUseFastGetHashCode</code> check in the runtime. The check result is cached in the type data (MethodTable), so the "fast or slow" decision is made once per type.</p>'
    },
    {
      t: 'learn',
      title: 'When the comparison is bytewise',
      body: '<p>The fast path kicks in only if every condition holds:</p><ul><li>the struct has <b>no references</b>: two different strings with the same text are different addresses, the bytes will not match;</li><li>the struct is <b>tightly packed</b> — no alignment gaps. Gaps can hold anything, their bytes are undefined;</li><li>no <code>float</code> or <code>double</code> fields: <code>0.0</code> and <code>-0.0</code> are equal but have different bytes; NaN is the other way round;</li><li>neither the struct nor its field types override <code>Equals</code> or <code>GetHashCode</code>.</li></ul><p>Break even one — reflection.</p>',
      code: 'struct Fast { public int X, Y; }            // bytes\nstruct Slow1 { public int Id; public string Name; } // a reference\nstruct Slow2 { public byte Flag; public int Value; } // a 3-byte gap\nstruct Slow3 { public double X, Y; }        // double',
      deep: '<p>The <code>float</code>/<code>double</code> check was not there from the start: in older runtime versions a struct with a <code>double</code> was compared bytewise, and <code>new S(0.0).Equals(new S(-0.0))</code> returned false even though the fields are equal. Reflection compares fields via <code>double.Equals</code>, for which <code>0.0</code> and <code>-0.0</code> are equal and NaN equals NaN.</p>'
    },
    {
      t: 'multi',
      q: 'Which structs will ValueType.Equals compare bytewise in modern .NET? None of them overrides anything. Select all.',
      options: [
        'struct A { int X; int Y; }',
        'struct B { int Id; string Name; }',
        'struct C { float X; float Y; }',
        'struct D { byte Flag; int Value; }',
        'struct E { long Ticks; int Kind; int Extra; }'
      ],
      answer: [0, 4],
      explain: 'A is 8 bytes with no gaps. E is 8 + 4 + 4 = 16 bytes, aligned with no holes. B has a reference, C has floats, and D has three alignment bytes after the byte before the int: all three go through reflection.'
    },
    {
      t: 'learn',
      title: 'ValueType.GetHashCode: a hash of one field',
      body: '<p>The default hash also has two paths. The fast one (same conditions) hashes all the bytes of the struct. The slow one hashes <b>only one field</b>: the first one that is not null. The other fields do not go into the hash at all.</p><p>Equals still compares every field, so the contract is formally kept. But if the first field is the same for many keys, they all land in one dictionary bucket. Lookup turns from O(1) into walking a chain.</p>',
      code: 'struct Key { public string Region; public int Id; }\n\n// Region is "EU" everywhere → every key has the same hash\nvar map = new Dictionary<Key, Order>();',
      deep: '<p>The slow path picks the field at run time (<code>GetHashCodeStrategy</code>): a reference — its <code>GetHashCode</code>, <code>double</code>/<code>float</code> — their hash, a nested struct — recursively by the same rules. The struct type is always mixed into the hash. .NET Framework had the same "first field" rule, so the advice "override GetHashCode on a struct key" is not outdated.</p>'
    },
    {
      t: 'choice',
      q: 'A dictionary holds a million Key { Region, Id } keys, Region is "EU" in all of them. Equals and GetHashCode are not overridden. What happens to lookups?',
      options: [
        'Every key is in one bucket: each lookup is a long walk with comparisons via reflection',
        'Business as usual: the hash includes Id too',
        'The dictionary throws when a duplicate hash is inserted',
        'Lookups are fast but eat a lot of memory for boxes'
      ],
      answer: 0,
      explain: 'The slow-path hash comes from the first non-null field — the string "EU". All keys got the same hash, one bucket. Each comparison along the chain is ValueType.Equals via reflection with boxed fields.',
      wrong: { 2: 'Equal hashes are an ordinary collision, and Dictionary is ready for it. It just becomes slow.' }
    },
    {
      t: 'learn',
      title: 'IEquatable<T>: why collections need it',
      body: '<p><code>Dictionary</code>, <code>HashSet</code>, <code>List.Contains</code>, <code>Array.IndexOf</code>, <code>Distinct</code> compare through <code>EqualityComparer&lt;T&gt;.Default</code>. It picks an implementation once per type:</p><ul><li>if <code>T : IEquatable&lt;T&gt;</code> — it calls <code>Equals(T)</code>: no boxes, an ordinary method that can be inlined;</li><li>if not — it calls <code>Equals(object)</code>: the argument is boxed, and without an override it goes on to <code>ValueType.Equals</code>.</li></ul><p>The full set for a struct: <code>IEquatable&lt;T&gt;</code>, an <code>Equals(object)</code> that calls it, <code>GetHashCode</code> over the same fields, and the <code>==</code>/<code>!=</code> operators.</p>',
      code: 'readonly struct Key : IEquatable<Key>\n{\n    public readonly string Region; public readonly int Id;\n    public bool Equals(Key o) => Region == o.Region && Id == o.Id;\n    public override bool Equals(object? o) => o is Key k && Equals(k);\n    public override int GetHashCode() => HashCode.Combine(Region, Id);\n}',
      deep: '<p>For a value-type <code>T</code> the JIT knows the exact type of <code>EqualityComparer&lt;T&gt;.Default</code> and since .NET Core 2.1 devirtualizes the call: <code>Dictionary&lt;int, …&gt;</code> compares keys almost like hand-written code. That is why <code>Dictionary</code> even has a separate code branch for value-type keys without a custom comparer.</p>'
    },
    {
      t: 'blanks',
      q: 'Complete equality with no boxes and no reflection',
      code: 'struct Point : ___<Point>\n{\n    public int X, Y;\n    public bool Equals(Point o) => X == o.X && Y == o.Y;\n    public override bool Equals(object? o) => o is Point p && ___(p);\n    public override int GetHashCode() => HashCode.Combine(X, Y);\n}',
      tiles: ['IEquatable', 'Equals', 'IComparable', 'ReferenceEquals', 'IEqualityComparer'],
      answer: ['IEquatable', 'Equals'],
      explain: 'IEquatable<Point> gives collections Equals(Point) without boxing. Equals(object) just delegates to it so the two methods never diverge. ReferenceEquals is always false for a struct: two boxes are two objects.'
    },
    {
      t: 'learn',
      title: 'record struct writes it for you',
      body: '<p>Since C# 10 a <code>record struct</code> generates everything from the previous card: <code>IEquatable&lt;T&gt;</code>, <code>Equals(T)</code> over all fields via <code>EqualityComparer&lt;TField&gt;.Default</code>, <code>Equals(object)</code>, <code>GetHashCode</code>, <code>==</code>, <code>!=</code> and a <code>ToString</code> that shows the contents. No reflection, no boxes.</p><p>The difference from a plain struct shows at once: a plain struct <b>has no == operator</b>, and <code>a == b</code> does not compile (CS0019). The compiler does not try to guess what value equality means.</p><p>Remember: the positional properties of a <code>record struct</code> are mutable (<code>get; set;</code>). The immutable flavor is <code>readonly record struct</code>.</p>',
      code: 'public readonly record struct Key(string Region, int Id);\n\nvar a = new Key("EU", 1);\nvar b = new Key("EU", 1);\nConsole.WriteLine(a == b);   // True — the generated ==',
      deep: '<p>The generated equality compares <code>double</code> fields via <code>double.Equals</code>, not via <code>==</code>. So two records with a <code>double.NaN</code> field are equal (<code>a == b</code> is True), even though <code>NaN == NaN</code> is false. This is by design: otherwise such a record could never be found in a dictionary.</p>'
    },
    {
      t: 'choice',
      q: 'P is a plain struct with fields X and Y and no operators. What happens?',
      code: 'var a = new P { X = 1, Y = 2 };\nvar b = new P { X = 1, Y = 2 };\nConsole.WriteLine(a == b);',
      options: ['Compile error CS0019', 'True', 'False', 'True, but via boxing'],
      answer: 0,
      explain: 'A struct has no == operator until you write one (or declare a record struct). Equals is always there — ValueType provides it — but the operator is not.',
      wrong: { 2: 'False for two different objects is what == on a class would give — it compares references. A struct simply has no ==.' }
    },
    {
      t: 'learn',
      title: 'Layout: fields get aligned',
      body: '<p>For structs the C# compiler emits <code>[StructLayout(LayoutKind.Sequential)]</code>: fields go in declaration order. But each field is aligned to its size: a <code>long</code> to an address that is a multiple of 8, an <code>int</code> to 4. And the size of the whole struct is rounded up to the strictest alignment, so that every element in an array is aligned too.</p><p>Field order changes the size. To find it out without <code>unsafe</code> — <code>Unsafe.SizeOf&lt;T&gt;()</code>.</p>',
      code: 'struct Loose { byte A; long B; byte C; }   // 1 + 7 gap + 8 + 1 + 7 gap\nstruct Tight { long B; byte A; byte C; }   // 8 + 1 + 1 + 6 gap\n\nUnsafe.SizeOf<Loose>();   // 24\nUnsafe.SizeOf<Tight>();   // 16',
      deep: '<p>The numbers are for x64. An empty struct takes 1 byte: every value must have its own address. <code>sizeof(T)</code> for your own structs requires an <code>unsafe</code> context in C#, <code>Unsafe.SizeOf&lt;T&gt;</code> does not — it is a JIT intrinsic.</p>'
    },
    {
      t: 'order',
      q: 'Arrange the struct fields so that Sequential layout leaves no gaps between them: from largest to smallest',
      items: ['long Ticks', 'int Count', 'short Code', 'byte Flag'],
      explain: '8 + 4 + 2 + 1 = 15 bytes of data, each field already at an aligned address. The size rounds up to 16 — one gap at the end. Largest to smallest is a simple way not to lose bytes.'
    },
    {
      t: 'learn',
      title: 'StructLayout, references and marshaling',
      body: '<ul><li><code>LayoutKind.Auto</code> — the runtime reorders fields itself, usually more tightly. But such a struct cannot be passed to unmanaged code.</li><li><code>Pack = 1</code> — no alignment: <code>Loose</code> becomes 10 bytes, but reading an unaligned <code>long</code> may cost more.</li><li><code>LayoutKind.Explicit</code> + <code>[FieldOffset]</code> — a field at an exact offset, fields may overlap.</li></ul><p>An important caveat from the docs: if a struct has <b>references</b>, Sequential does not control its layout in managed memory — the runtime lays such fields out as Auto. Sequential then only affects marshaling.</p><p>And the link back to the start of the lesson: alignment gaps disable the bytewise <code>ValueType.Equals</code>.</p>',
      deep: '<p><code>Marshal.SizeOf&lt;T&gt;()</code> is the size when marshaled, not in .NET memory. For <code>struct { bool A; bool B; }</code> <code>Unsafe.SizeOf</code> is 2, while <code>Marshal.SizeOf</code> is 8: by default <code>bool</code> is marshaled as a 4-byte Win32 BOOL.</p><p>The "version 2" scenario: reorder the fields of a Sequential struct that goes to P/Invoke or is written to a file as bytes, and native code and old files now read the wrong fields. For such structs the field order is part of the contract.</p>'
    },
    {
      t: 'match',
      q: 'Match each tool with what it gives you',
      pairs: [
        ['Unsafe.SizeOf<T>()', 'The size in managed memory'],
        ['Marshal.SizeOf<T>()', 'The size when passed to unmanaged code'],
        ['[StructLayout(LayoutKind.Auto)]', 'The runtime picks the field order'],
        ['[StructLayout(LayoutKind.Sequential, Pack = 1)]', 'Fields back to back with no alignment'],
        ['[FieldOffset(8)]', 'A field at an exact offset']
      ]
    }
  ]
};

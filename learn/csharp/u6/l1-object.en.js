/** Deeper C#, unit "How a type is built", lesson 1: System.Object and what every object has. */
export default {
  id: 'cs.u6.l1',
  title: 'System.Object inside out',
  sub: 'Six methods, the object header and the Equals/GetHashCode contract',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'What every type inherits',
      body: '<p>Every type in .NET — class, struct, record, array — ultimately derives from <code>System.Object</code>. That is why every value has the same set of methods:</p><p><b>Public:</b> <code>Equals</code>, <code>GetHashCode</code>, <code>ToString</code> — virtual, you can override them; <code>GetType</code> — not virtual.<br><b>Protected:</b> <code>MemberwiseClone</code> — a shallow copy; <code>Finalize</code> — called by the garbage collector.<br><b>Static:</b> <code>ReferenceEquals</code> and <code>Equals(a, b)</code>.</p>',
      code: 'class Order { }\n\nvar o = new Order();\no.ToString();     // "Shop.Order" — the full type name\no.GetHashCode();  // a number, different for each object\no.Equals(o);      // true: compares references\no.GetType();      // typeof(Order)'
    },
    {
      t: 'learn',
      title: 'An object on the heap: two hidden words',
      body: '<p>When you write <code>new Order()</code>, the heap gets more than room for the fields. Two bookkeeping words sit in front of them:</p><p><b>The object header</b> — bits for <code>lock</code>, the default hash code and a link to a sync block if one was needed.<br><b>The type pointer</b> (MethodTable) — the address of the structure where the CLR keeps everything about the type: size, parent, interfaces, the virtual method table.</p><p>A reference in a variable points exactly at the type pointer. <code>GetType</code>, casts and virtual calls all work through it.</p>',
      flow: ['header', 'type pointer', 'fields'],
      deep: '<p>On a 64-bit platform the header and the type pointer take 8 bytes each. The header sits at a negative offset: the reference points at the MethodTable word, and the header is 8 bytes before it. Even an empty class has a minimum object size of <b>24 bytes</b>: the collector needs room for at least one pointer-sized field.</p><p>A struct on the stack or inside another object has neither word — just its fields. They appear when the struct is <b>boxed</b>: the box is an ordinary heap object with its own header and type pointer.</p>'
    },
    {
      t: 'choice',
      q: 'How many bytes does an instance of an empty class Empty { } take on the heap in a 64-bit process?',
      options: ['24', '0', '8', '16'],
      answer: 0,
      explain: '8 bytes of header, 8 bytes of type pointer and the minimum room for one pointer-sized field. On x64 no object is smaller than 24 bytes.',
      wrong: { 1: 'There are no fields, but every object has the bookkeeping words.', 3: '16 is just the header and the type pointer. The CLR still reserves room for one more word.' }
    },
    {
      t: 'learn',
      title: 'Why GetType cannot be overridden',
      body: '<p><code>GetType</code> computes nothing: it takes the type pointer from the object itself and returns the matching <code>Type</code>. If the method were virtual, a class could lie: "I am a <code>string</code>." And all of type safety rests on that pointer telling the truth: casts, <code>is</code>, calling the right method.</p><p>So <code>GetType</code> is not virtual. You can hide it with <code>new</code>, but code that looks through <code>object</code> still gets the real type.</p>',
      code: 'class Liar\n{\n    public new Type GetType() => typeof(string);\n}\n\nvar l = new Liar();\nl.GetType();            // string — Liar\'s method is called\n((object)l).GetType();  // Liar — the real type',
      deep: '<p>The difference from <code>typeof(T)</code>: <code>typeof</code> is the type known to the compiler, <code>GetType()</code> is the type of a particular object at run time. With <code>Animal a = new Cat()</code> the static type is Animal, but <code>a.GetType()</code> returns Cat.</p><p>A <code>Nullable</code> twist: <code>int? x = 5; x.GetType()</code> returns <code>System.Int32</code>. The call goes through boxing, and a boxed <code>int?</code> is simply a boxed <code>int</code>. If <code>x</code> is null, you get a <code>NullReferenceException</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Which System.Object methods can you override with override? Select all.',
      options: ['ToString', 'Equals', 'GetHashCode', 'GetType', 'MemberwiseClone'],
      answer: [0, 1, 2],
      explain: 'GetType and MemberwiseClone are not virtual. Finalize is virtual too, but in C# you write it with finalizer syntax ~Name() rather than override.'
    },
    {
      t: 'learn',
      title: 'How a dictionary finds a key',
      body: '<p><code>Dictionary</code> and <code>HashSet</code> search in two steps: <b>GetHashCode</b> picks a bucket, and <b>Equals</b> compares against the entries in that bucket. Hence the contract:</p><p>1. If <code>a.Equals(b)</code>, their hashes <b>must</b> match. The reverse is not required: equal hashes for different objects are an ordinary collision.<br>2. While an object is a dictionary key, its hash must not change.<br>3. Equals is reflexive, symmetric, transitive and returns false for null.</p><p>By default a class compares references in Equals, and GetHashCode is different for every object. Override only Equals and you break rule 1. The compiler warns you: <b>CS0659</b>.</p>',
      code: 'class Point\n{\n    public int X, Y;\n    public override bool Equals(object? o) =>\n        o is Point p && p.X == X && p.Y == Y;\n    // GetHashCode forgotten → warning CS0659\n}'
    },
    {
      t: 'choice',
      q: 'Point overrides only Equals. What does this code print?',
      code: 'var set = new HashSet<Point> { new Point { X = 1, Y = 2 } };\nConsole.WriteLine(set.Contains(new Point { X = 1, Y = 2 }));',
      options: ['Almost always False', 'True', 'It throws', 'It does not compile'],
      answer: 0,
      explain: 'Two different objects have different default hashes. The lookup goes to the wrong bucket (or is filtered out by the hash mismatch) and never reaches Equals. True is only possible on an accidental hash match.',
      wrong: { 3: 'CS0659 is a warning, not an error. The code builds and quietly works wrong.' }
    },
    {
      t: 'tapline',
      q: 'Point now overrides both Equals and GetHashCode using X and Y. Which line prints False?',
      code: 'var p = new Point { X = 1, Y = 2 };\nvar set = new HashSet<Point> { p };\nConsole.WriteLine(set.Contains(p));\np.X = 10;\nConsole.WriteLine(set.Contains(p));',
      answer: 4,
      explain: 'After p.X = 10 the hash changed, but the object sits in the bucket computed from the old hash. The set looks in the new bucket and finds nothing — even though it is the very same object. Dictionary keys should be immutable.'
    },
    {
      t: 'blanks',
      q: 'Complete the pair of methods so the contract holds',
      code: 'public override bool Equals(object? o) =>\n    o ___ Point p && p.X == X && p.Y == Y;\n\npublic override int GetHashCode() => ___.Combine(X, Y);',
      tiles: ['is', 'HashCode', 'as', 'Object', 'RuntimeHelpers'],
      answer: ['is', 'HashCode'],
      explain: 'The pattern is Point p checks the type and rules out null at the same time. HashCode.Combine mixes the field hashes. Even simpler is a record: the compiler writes Equals and GetHashCode over all fields for you.'
    },
    {
      t: 'learn',
      title: 'MemberwiseClone and Finalize: what they cost',
      body: '<p><b>MemberwiseClone</b> creates a new object of the same type and copies the fields bit by bit. No constructor runs, and reference fields are copied as references: the original and the copy share the same list. The method is protected — outside code cannot copy an object this way, only the type itself can.</p><p><b>Finalize</b> is written in C# as <code>~Name()</code>. It is not a destructor in the C++ sense: the garbage collector decides when it runs. Such an object is more expensive to create (it is registered in the finalization queue), and it survives an extra garbage collection.</p>',
      code: 'class Doc\n{\n    public List<string> Tags = new();\n    public Doc Copy() => (Doc)MemberwiseClone();\n}\n\nvar a = new Doc();\nvar b = a.Copy();\nb.Tags.Add("x");   // a.Tags contains "x" too',
      deep: '<p>The compiler turns a finalizer into <code>protected override void Finalize()</code> that calls <code>base.Finalize()</code> in a <code>finally</code>. In modern .NET finalizers <b>do not run at process exit</b> (in .NET Framework they did), so you cannot rely on them even "at the very end". For resources use <code>IDisposable</code> and <code>SafeHandle</code>.</p><p>The <code>with</code> expression on records does not use <code>MemberwiseClone</code>: the compiler generates a copy constructor and a hidden clone method. The copy is still shallow.</p>'
    },
    {
      t: 'match',
      q: 'Match the method to what it does',
      pairs: [
        ['ReferenceEquals(a, b)', 'Is it the very same object?'],
        ['MemberwiseClone()', 'A shallow copy without a constructor'],
        ['GetType()', 'Reads the type pointer'],
        ['Default ToString()', 'The full type name'],
        ['Finalize()', 'Called by the garbage collector']
      ]
    },
    {
      t: 'choice',
      q: 'What does object.ReferenceEquals(42, 42) return?',
      options: ['False', 'True', 'It does not compile', 'It depends on the JIT'],
      answer: 0,
      explain: 'ReferenceEquals takes object, so each 42 is boxed into its own box. Two different boxes are two different references. For value types ReferenceEquals is always false.'
    }
  ]
};

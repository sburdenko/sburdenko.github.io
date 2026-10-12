/** Deeper C#, unit "How a type is built", lesson 3: primitives, overflow and dynamic. */
export default {
  id: 'cs.u6.l3',
  title: 'Primitives, checked and dynamic',
  sub: 'int is System.Int32, overflow is silent by default, and dynamic pays on every call',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'int is just another name',
      body: '<p>C# keywords are aliases for library types: <code>int</code> is <code>System.Int32</code>, <code>long</code> is <code>System.Int64</code>, <code>string</code> is <code>System.String</code>, <code>object</code> is <code>System.Object</code>. A compiled assembly has no "int" in it — only Int32.</p><p>The size does not depend on the platform: an int is always 32 bits. The exception is <code>nint</code> and <code>nuint</code>: these are <b>pointer-sized</b> integers, 32 bits in a 32-bit process and 64 in a 64-bit one.</p>',
      code: 'int a = 5;\nSystem.Int32 b = a;        // the same type, not a conversion\nConsole.WriteLine(a.GetType());   // System.Int32\n\nnint p = 0;                // System.IntPtr\nConsole.WriteLine(IntPtr.Size);   // 8 in a 64-bit process',
      deep: '<p><code>nint</code> and <code>nuint</code> arrived in C# 9 as separate keywords on top of <code>IntPtr</code>/<code>UIntPtr</code>, with arithmetic. Since C# 11 and .NET 7 they are full aliases: <code>nint</code> and <code>IntPtr</code> are the same thing, operators included. They are for interop and low-level code: indexes into native memory, buffer lengths, offsets.</p>'
    },
    {
      t: 'match',
      q: 'Match the C# keyword to the CLR type',
      pairs: [
        ['long', 'System.Int64'],
        ['float', 'System.Single'],
        ['char', 'System.Char'],
        ['nint', 'System.IntPtr'],
        ['decimal', 'System.Decimal']
      ]
    },
    {
      t: 'learn',
      title: 'What "primitive" means to the CLR',
      body: '<p>To the CLR, a primitive is a type that has <b>its own IL instructions</b>. Adding two ints is the <code>add</code> instruction, and the JIT turns it into a single machine instruction.</p><p><code>decimal</code> looks the same — it has literals like <code>1.5m</code> and operators. But to the CLR it is an ordinary 16-byte struct. For decimal, <code>a + b</code> compiles to a call to the <code>op_Addition</code> method, and the arithmetic is done in software. That is why decimal is noticeably slower than double — you pay for an exact decimal fraction.</p>',
      code: 'int x = a + b;       // IL: add\ndouble y = c + d;    // IL: add\ndecimal z = m + n;   // IL: call Decimal.op_Addition',
      deep: '<p><code>Type.IsPrimitive</code> returns true for Boolean, Byte, SByte, Int16, UInt16, Int32, UInt32, Int64, UInt64, IntPtr, UIntPtr, Char, Single and Double. For <code>decimal</code> and <code>string</code> it returns false. A <code>const decimal</code> is allowed in C#, but the metadata does not store it as an ordinary literal constant — it uses the <code>DecimalConstantAttribute</code> attribute instead.</p>'
    },
    {
      t: 'choice',
      q: 'What does typeof(decimal).IsPrimitive return?',
      options: ['False', 'True', 'It depends on the platform', 'It does not compile'],
      answer: 0,
      explain: 'decimal has no IL instructions of its own: its operators are ordinary static methods of the Decimal struct.'
    },
    {
      t: 'learn',
      title: 'Overflow is silent by default',
      body: '<p>For integers the compiler emits the <code>add</code> instruction by default. It does not check for overflow: the high bits are simply dropped. <code>int.MaxValue + 1</code> gives <code>int.MinValue</code> — no exception.</p><p>In a <code>checked</code> context the compiler emits <code>add.ovf</code>, and overflow throws <code>OverflowException</code>. The same goes for an explicit narrowing: <code>(int)someLong</code> cuts off the high bits when unchecked and throws when checked.</p><p>The cost of the check is a compare and a conditional jump after the operation. Usually that is pennies, but in tight loops it can get in the way of JIT optimizations.</p>',
      code: 'int max = int.MaxValue;\nint a = max + 1;              // -2147483648, silently\nint b = checked(max + 1);     // OverflowException\n\nchecked\n{\n    int c = max * 2;          // OverflowException\n}'
    },
    {
      t: 'tapline',
      q: 'A project with default settings. Which line throws OverflowException?',
      code: 'int max = int.MaxValue;\nint a = max + 1;\nlong big = 5_000_000_000;\nint b = (int)big;\nint c = checked(max + 1);',
      answer: 4,
      explain: 'The default context is unchecked: a becomes int.MinValue, and b gets the low 32 bits (705032704). The exception only happens where checked is written explicitly.'
    },
    {
      t: 'learn',
      title: 'Constants, the project flag and where checked ends',
      body: '<p><b>Constants</b> are evaluated by the compiler itself and are always checked: <code>int x = int.MaxValue + 1;</code> is error <b>CS0220</b>. When overflow is intended (in a hash function, say), write <code>unchecked(...)</code>.</p><p><b>The project flag</b> <code>&lt;CheckForOverflowUnderflow&gt;true&lt;/CheckForOverflowUnderflow&gt;</code> makes checked the default context for the whole project. It is often turned on in Debug to catch overflows during tests.</p><p><b>Boundaries</b>: checked only affects code written inside the block. Methods called from there are compiled by their own rules.</p><p><b>Other numbers</b>: decimal always throws <code>OverflowException</code>, double and float never throw — they go to infinity.</p>',
      code: 'int x = int.MaxValue + 1;             // error CS0220\nint y = unchecked(int.MaxValue + 1);  // allowed: -2147483648\n\nchecked { Helper(); }  // inside Helper — its own context',
      deep: '<p>Since C# 11 a numeric type of your own can declare two versions of an operator: the regular one and <code>operator checked +</code>. The compiler calls the checked version in a checked context. That is how the built-in types in generic math work, for example <code>Int128</code>.</p>'
    },
    {
      t: 'multi',
      q: 'What throws OverflowException without any checked? Select all.',
      options: ['d + 1m, where d = decimal.MaxValue', 'i + 1, where i = int.MaxValue', 'x * 2, where x = double.MaxValue', 'Convert.ToInt32(5_000_000_000L)'],
      answer: [0, 3],
      explain: 'decimal always checks for overflow, and so do the Convert methods. An int silently wraps when unchecked, and a double becomes infinity.'
    },
    {
      t: 'learn',
      title: 'dynamic: the type is resolved at run time',
      body: '<p>To the CLR, <code>dynamic</code> is <code>object</code> with a marker. The compiler does not check whether the value has the method; instead, at every operation it creates a <b>call site</b> — an object that picks the method at run time.</p><p>On the first call, the <b>runtime binder</b> from the Microsoft.CSharp assembly looks at the actual types of the arguments and finds the method using C# rules. It compiles the result into a rule — "if the types are these, call that" — and puts it in the call site cache. Later calls with the same types go straight through the ready rule.</p><p>No method found — <code>RuntimeBinderException</code> at run time, not a compile error.</p>',
      code: 'dynamic d = "text";\nint n = d.Length;   // 4: Length is found at run time\nd = 42;             // the int is boxed: dynamic is object\nd.Foo();            // RuntimeBinderException',
      deep: '<p>A call site is a <code>CallSite&lt;T&gt;</code> with a <code>Target</code> delegate. The cache has several levels: the rule in the delegate itself, a set of recent rules for this call site and a shared binder cache. If one place receives a string one time and a List the next, the rules multiply, and with frequently changing types the cost of the check grows too.</p><p>What dynamic cannot do: extension methods (the binder does not look for them), and lambdas as arguments without an explicit delegate type. It also does not get along well with trimming and Native AOT: the binder relies on reflection and on generating code at run time.</p>'
    },
    {
      t: 'order',
      q: 'Put in order what happens on the first call to d.Foo(1)',
      items: ['The compiler has already created a call site for this operation', 'The call site cache is empty — the call goes to the runtime binder', 'The binder looks at the actual types of d and the argument', 'It picks the Foo method using C# rules', 'It compiles a rule and puts it in the cache', 'The next call with the same types uses the cached rule'],
      explain: 'Only the first pass is expensive: binding and compiling the rule. After that it is a type check and a call through a delegate.'
    },
    {
      t: 'choice',
      q: 'dynamic d = new List<int>(); d.Sum(); — what happens?',
      options: ['RuntimeBinderException at run time', 'It returns 0', 'A compile error', 'It returns null'],
      answer: 0,
      explain: 'Sum is an extension method from System.Linq. The binder only looks at the type\'s own methods, so it does not find it. This works: Enumerable.Sum((List<int>)d).',
      wrong: { 2: 'With dynamic the compiler checks nothing — the error only shows up at run time.' }
    },
    {
      t: 'multi',
      q: 'What is true about the cost of dynamic? Select all.',
      options: ['The first call at each call site is expensive', 'Value types in dynamic are boxed', 'Type errors only show up at run time', 'After the first call it is as fast as a regular call'],
      answer: [0, 1, 2],
      explain: 'Even from the cache, the call goes through a delegate with a type check — slower than a direct call. dynamic fits COM, schemaless JSON and scripting, not hot code.'
    }
  ]
};

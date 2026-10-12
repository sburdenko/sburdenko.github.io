/** Deeper C#, unit "Parameters, properties, tuples", lesson 2: optional and named arguments, params and overload resolution. */
export default {
  id: 'cs.u9.l2',
  title: 'Arguments: defaults and params',
  sub: 'Where a default value lives and which overload wins',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'A default value lives in the caller',
      body: '<p>An optional parameter looks like part of the method. In fact the method knows almost nothing about it. In metadata the parameter carries an <code>[opt]</code> flag and a constant — the default value.</p><p>When you write <code>Retry()</code>, the compiler of <b>your</b> project reads that constant from the library metadata and puts it into the call. Your assembly\'s IL holds an ordinary call with the argument <code>3</code>. The method itself always receives the argument explicitly.</p>',
      code: '// The library\npublic static void Retry(int times = 3) { /* ... */ }\n\n// Your code\nRetry();\n\n// Your assembly\'s IL: the constant is baked in here\nldc.i4.3\ncall void Lib::Retry(int32)',
      deep: '<p>In the library IL this is <code>.method ... Retry([opt] int32 times)</code> plus the line <code>.param [1] = int32(3)</code>. <code>[CallerMemberName]</code>, <code>[CallerLineNumber]</code> and <code>[CallerArgumentExpression]</code> work the same way: the compiler inserts the string or the number at the call site, at compile time.</p><p>The value must be a compile-time constant, <code>default</code>, or <code>new S()</code> for a struct. <code>DateTime.Now</code> is not allowed — there is no way to write it into metadata. For <code>decimal</code> the compiler records the value with a <code>DecimalConstantAttribute</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Library v1: Retry(int times = 3). In v2 the author changed the default to 5. The app was not rebuilt, only the DLL was replaced. What does Retry receive for the call Retry()?',
      options: ['3', '5', 'MissingMethodException', '0'],
      answer: 0,
      explain: 'The 3 was baked into the app\'s IL at compile time. The new DLL never sees it: the method receives the argument 3. The 5 appears only after the app is rebuilt.',
      wrong: { 2: 'The signature did not change — Retry(int32) is still there, the method is found.' }
    },
    {
      t: 'learn',
      title: 'Version 2: adding an optional parameter breaks binaries',
      body: '<p>Another trap from the same mechanism. In v2 you added a parameter: <code>Retry(int times = 3, bool log = false)</code>. Callers\' source compiles as before. But an old compiled assembly references <code>Retry(int32)</code>, and that method no longer exists — the call throws <b>MissingMethodException</b>.</p><p>Hence the rules for public libraries:</p><ul><li>do not change a default value after release — treat it as part of the contract, like a <code>const</code>;</li><li>add a new parameter as a <b>new overload</b>, keep the old one and let it call the new one.</li></ul>',
      code: '// v2: the old signature stays for already compiled clients\npublic static void Retry(int times) => Retry(times, log: false);\npublic static void Retry(int times = 3, bool log = false) { /* ... */ }',
      deep: '<p>A twist with interfaces and inheritance: the default is taken from the <b>static type</b> the call goes through, not from the actual object. If the interface declares <code>level = 1</code> and the class declares <code>level = 2</code>, a call through the interface inserts 1 and a call through the class inserts 2. The virtual call lands in the same method, but with different arguments.</p>'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'var log = new Log();\nILog ilog = log;\nlog.Write("a");\nilog.Write("b");\n\ninterface ILog { void Write(string s, int level = 1); }\nclass Log : ILog\n{\n    public void Write(string s, int level = 2) => Console.Write(level);\n}',
      options: ['21', '22', '11', '12'],
      answer: 0,
      explain: 'The compiler takes the default from the type of the expression at the call: log is a Log, so it inserts 2; ilog is an ILog, so it inserts 1. The very same method runs, with different arguments.'
    },
    {
      t: 'learn',
      title: 'Named arguments',
      body: '<p>Named arguments are also compile-time only. The compiler matches a name to a parameter and puts the arguments in their places. IL has no names at all.</p><p>Consequences:</p><ul><li><b>Evaluation order</b> follows the call site, left to right, not the parameter order. If the orders differ, the compiler stores values in temporaries and then lays them out.</li><li><b>Renaming a parameter</b> in a public API breaks the source of everyone who called it by name. Binaries are fine: names play no part in IL.</li><li>Since C# 7.2 a named argument may appear before positional ones if it is in its own position.</li></ul>',
      code: 'Send(to: "ann@x.io", subject: "Hi", urgent: true);\nSend("ann@x.io", subject: "Hi", true);   // C# 7.2+: the name is in its own position'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'int n = 0;\nint Next() => ++n;\nvoid M(int a, int b) => Console.Write($"{a}{b}");\n\nM(b: Next(), a: Next());',
      options: ['21', '12', '11', '22'],
      answer: 0,
      explain: 'Arguments are evaluated in the order they are written at the call: b gets 1 first, then a gets 2. M prints a, then b — "21".'
    },
    {
      t: 'learn',
      title: 'params T[]: an array per call',
      body: '<p><code>params int[] values</code> is syntactic sugar at the call site. The compiler turns <code>Sum(1, 2, 3)</code> into <code>Sum(new[] { 1, 2, 3 })</code>: <b>a new heap array on every call</b>.</p><ul><li>With no arguments: <code>Sum()</code> → <code>Sum(Array.Empty&lt;int&gt;())</code>, a shared empty array, no allocation.</li><li>Pass an existing array and it goes as is, with no copy. The method can change it, and you will see that.</li><li><code>Sum(null)</code> passes <code>null</code>, not an array with one null.</li></ul>',
      code: 'static int Sum(params int[] values) { /* ... */ }\n\nSum(1, 2, 3);     // new int[] { 1, 2, 3 } — an allocation\nSum();            // Array.Empty<int>() — no allocation\nSum(myArray);     // the same array, no copy'
    },
    {
      t: 'learn',
      title: 'params collections (C# 13)',
      body: '<p>Since C# 13 <code>params</code> accepts not only an array but any type a collection expression can build: <code>Span&lt;T&gt;</code>, <code>ReadOnlySpan&lt;T&gt;</code>, <code>IEnumerable&lt;T&gt;</code>, <code>IReadOnlyList&lt;T&gt;</code>, <code>List&lt;T&gt;</code> and others.</p><p>The key one is <code>params ReadOnlySpan&lt;T&gt;</code>: the compiler can lay the arguments out in a buffer <b>on the stack</b> and pass a span over it. No heap array.</p><p>In .NET 9 the libraries gained such overloads for common methods: <code>string.Join</code>, <code>string.Concat</code>, <code>Path.Combine</code>, <code>Task.WhenAll</code> and others. Rebuild your project for .NET 9 and the same lines of code start calling the new overloads and allocate less.</p>',
      code: 'static int Sum(params ReadOnlySpan<int> values)\n{\n    int s = 0;\n    foreach (var v in values) s += v;\n    return s;\n}\n\nSum(1, 2, x);   // a buffer on the stack, no heap',
      deep: '<p>Exactly how the compiler builds the span is an implementation detail: on .NET 8+ it uses a synthesized struct with the <code>[InlineArray]</code> attribute in the caller\'s frame, and for constants of primitive types the span can come straight from the assembly\'s static data. A <code>params</code> parameter of a <code>ref struct</code> type is implicitly <code>scoped</code>: the method cannot store it or return it — otherwise it would outlive the buffer.</p><p><code>params List&lt;T&gt;</code> or <code>params IEnumerable&lt;T&gt;</code> save nothing: the collection is still created on the heap on every call.</p>'
    },
    {
      t: 'choice',
      q: 'A class has two overloads: Sum(params int[]) and Sum(params ReadOnlySpan<int>). Which one does Sum(1, 2, 3) pick?',
      options: ['ReadOnlySpan<int>', 'int[]', 'Error: ambiguous call', 'The one declared first'],
      answer: 0,
      explain: 'Both apply only in their expanded form, and then the C# 13 rule prefers the span. No heap array is created.',
      wrong: { 2: 'There is no ambiguity: C# 13 added an explicit rule for this case — a span beats an array.' }
    },
    {
      t: 'learn',
      title: 'How overload resolution picks among params',
      body: '<p>Roughly in this order; the first rule that tells candidates apart decides:</p><ul><li>applicable without expansion wins: with <code>M(int x)</code> and <code>M(params int[] xs)</code> the call <code>M(5)</code> goes to <code>M(int)</code>;</li><li>an exact type match beats a conversion: <code>Sum(arr)</code> with <code>int[] arr</code> picks <code>params int[]</code>, not the span;</li><li>non-generic beats generic;</li><li>if both apply only in expanded form, <code>ReadOnlySpan&lt;T&gt;</code> and <code>Span&lt;T&gt;</code> beat an array and other collections.</li></ul><p>The "version 2" scenario: a library adds a span overload next to the array one. Old assemblies keep working — the array method is still there. Rebuilt clients quietly move to the span. If the two overloads behave differently, the client gets the surprise.</p>',
      deep: '<p>C# 14 had a similar effect with implicit array-to-span conversions: <code>array.Contains(x)</code> may bind to <code>MemoryExtensions.Contains</code> instead of <code>Enumerable.Contains</code>. In ordinary code that is faster, but expression trees (for example, in ORM queries) cannot use spans, so such spots are worth checking after a language upgrade.</p>'
    },
    {
      t: 'match',
      q: 'Match the call to what it costs',
      pairs: [
        ['params int[], three arguments', 'A new heap array on every call'],
        ['params int[], zero arguments', 'The shared Array.Empty, no allocation'],
        ['params ReadOnlySpan<int>', 'A buffer in the caller\'s frame'],
        ['params List<int>', 'A new List on the heap on every call'],
        ['An optional parameter', 'A constant baked into the caller\'s code']
      ]
    },
    {
      t: 'blanks',
      q: 'A logging method without an array per call',
      code: 'public static void Log(string format, ___ ___<object?> args)\n{\n    // ...\n}',
      tiles: ['params', 'ReadOnlySpan', 'List', 'in', 'IEnumerable'],
      answer: ['params', 'ReadOnlySpan'],
      explain: 'params ReadOnlySpan<object?> (C# 13) puts the arguments in a buffer on the stack. List and IEnumerable still create a collection on the heap. The argument objects themselves, if they are boxed numbers, stay on the heap — only the array is saved.'
    }
  ]
};

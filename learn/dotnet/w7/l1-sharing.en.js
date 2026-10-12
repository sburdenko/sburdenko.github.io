/** .NET inside out, unit "Generics and reflection inside out", lesson 1: shared generic code, dictionaries and static fields. */
export default {
  id: 'dotnet.w7.l1',
  title: 'How the JIT shares generic code',
  sub: '__Canon for reference T, a copy per value type, the generic dictionary and statics per instantiation',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'One body of code or many copies',
      body: '<p>The generics unit of the Deeper C# course gave the rule: reference T share machine code, value types get their own. Now for how it actually works.</p><p>When the JIT compiles a generic method, it first reduces the instantiation to its <b>canonical form</b>. Every reference type argument is replaced with the internal type <code>System.__Canon</code>; value types stay as they are. Code is compiled once per canonical form.</p><p>So <code>List&lt;string&gt;</code> and <code>List&lt;Uri&gt;</code> run the very same <code>List&lt;__Canon&gt;</code> code, while <code>List&lt;int&gt;</code> and <code>List&lt;long&gt;</code> each get their own.</p>',
      code: 'var a = new List<int>();     // own code: List<int>\nvar b = new List<long>();    // own code: List<long>\nvar c = new List<string>();  // shared code: List<__Canon>\nvar d = new List<Uri>();     // the same shared code',
      deep: '<p>It already worked this way in .NET Framework 2.0, and Native AOT does the same: ahead of time it compiles one canonical version for all reference T and a separate one for every value type it finds in the program.</p><p>You can see it yourself: in .NET 7+ the environment variable <code>DOTNET_JitDisasm="Echo"</code> prints a method\'s machine code. For <code>Echo&lt;T&gt;</code> called with <code>int</code> and <code>string</code> the output has two headers: <code>Echo[int](int):int</code> and <code>Echo[System.__Canon](System.__Canon):System.__Canon</code>.</p>'
    },
    {
      t: 'choice',
      q: 'A program uses Dictionary<string, int>, Dictionary<object, int>, Dictionary<int, string> and Dictionary<int, object>. How many machine code versions of TryGetValue will the JIT produce?',
      options: ['2', '4', '1', '3'],
      answer: 0,
      explain: 'The canonical forms are Dictionary<__Canon, int> for the first two and Dictionary<int, __Canon> for the last two. Each reference argument is replaced on its own; value types stay.',
      wrong: { 1: 'Reference arguments become __Canon, so string and object in the same position give the same form.', 2: 'The value type sits in a different position: <__Canon, int> and <int, __Canon> are two different forms.' }
    },
    {
      t: 'learn',
      title: 'Why value types cannot do this',
      body: '<p>Every reference is 8 bytes of address (on x64), and the garbage collector walks it the same way no matter what it points to. Code that copies, stores and compares references does not care whether it holds a <code>string</code> or a <code>Uri</code>.</p><p>Value types differ in substance:</p><ul><li><b>size</b>: <code>int</code> is 4 bytes, <code>decimal</code> is 16, your own struct is whatever it is;</li><li><b>reference map</b> (GC info): a struct may contain references, and the collector has to know where;</li><li><b>operations</b>: comparing two <code>int</code> values is one instruction, comparing two structs is a call to their method.</li></ul><p>Shared code for them would have to go through boxing. Instead the JIT makes a separate copy, and in that copy it can inline the methods of T and skip boxing entirely.</p>',
      deep: '<p>The price of copies is code size: every value type instantiation means new methods in memory and more JIT time. That is why libraries with a huge number of structs inside generics take noticeably longer to warm up.</p><p>The canonical form is built recursively. A generic struct over reference types is canonicalized too: <code>KeyValuePair&lt;string, int&gt;</code> and <code>KeyValuePair&lt;object, int&gt;</code> both reduce to <code>KeyValuePair&lt;__Canon, int&gt;</code>, and a <code>List</code> of such pairs shares code in CoreCLR. But now it is a value type with shared code, so it needs the same exact-type lookup that reference types use.</p>'
    },
    {
      t: 'multi',
      q: 'Which instantiations share the machine code of Add with List<string>? Select all.',
      options: ['List<object>', 'List<int[]>', 'List<int?>', 'List<DateTime>', 'List<Action>'],
      answer: [0, 1, 4],
      explain: 'An array and a delegate are reference types, so they also become __Canon. int? is Nullable<int>, a struct, and DateTime is a struct: each gets its own copy.'
    },
    {
      t: 'learn',
      title: 'The generic dictionary: where shared code finds T',
      body: '<p>Shared code does not know which T it is running for. Yet sometimes the exact type is needed: to create a <code>T[]</code>, to check <code>o is T</code>, to evaluate <code>typeof(T)</code>, to create a <code>new List&lt;T&gt;()</code>, to touch a static field.</p><p>For that every exact instantiation has a <b>generic dictionary</b>: a table of slots holding handles of the types and methods it needs. How shared code reaches it:</p><ul><li><b>an instance method of a class</b> goes through <code>this</code>: the object type pointer leads to its MethodTable, and the dictionary hangs off it;</li><li><b>a static method</b> of a generic type and a method of a generic struct receive a <b>hidden parameter</b> from the JIT with the MethodTable of the exact type;</li><li><b>a generic method</b> <code>M&lt;T&gt;</code> receives a hidden parameter with the handle of that particular method instantiation.</li></ul>',
      code: 'class Box<T>\n{\n    public T[] Make(int n) => new T[n];      // needs the exact type T[]\n    public bool Check(object o) => o is T;   // needs the exact T\n    public static Type Who() => typeof(T);   // static: T arrives as a hidden parameter\n}',
      deep: '<p>The CoreCLR docs describe this in "Shared generics" (Book of the Runtime): for generic methods the hidden argument is an InstantiatedMethodDesc, for static methods and struct methods it is a MethodTable.</p><p>Slots are filled lazily. The first lookup goes into the runtime through a JIT helper function, which finds the type and writes it into the slot. After that it is a few memory loads and a null check. If the slots run out, the runtime can grow the dictionary, so the fast path may also include a size check.</p><p>Where the exact type is not needed there is no lookup: <code>default(T)</code> for a reference T is just null, and so are null checks, copying a T and passing it on.</p>'
    },
    {
      t: 'order',
      q: 'The shared code of Box<__Canon>.Check(o) executes o is T. Put the steps in order',
      items: ['Take the type pointer from this', 'Use the MethodTable to find this instantiation dictionary', 'Read the slot with the handle of T', 'If the slot is empty, call a runtime helper once to fill it', 'Compare the type of o with the T that was found'],
      explain: 'Box<string> and Box<Uri> run the same code, but they have different MethodTables and different dictionaries. Going through this is how the code learns which T it has right now.'
    },
    {
      t: 'learn',
      title: 'typeof(T) == typeof(int) costs nothing',
      body: '<p>In a copy for a value type the JIT knows T exactly. So it evaluates <code>typeof(T) == typeof(int)</code> at compile time and throws away the branches that can never run.</p><p>The .NET libraries build fast paths on this: the code of <code>Span</code>, <code>MemoryExtensions</code> and the numeric types is full of <code>typeof(T) == typeof(byte)</code> checks. The machine code for <code>byte</code> keeps only the right branch; for everything else, only the general one.</p><p>Shared code for reference T cannot do this: the type is found at run time through the dictionary, and the check stays a real comparison.</p>',
      code: 'static int Size<T>()\n{\n    if (typeof(T) == typeof(int)) return 4;    // for int the JIT keeps only this branch\n    if (typeof(T) == typeof(long)) return 8;   // for long, only this one\n    return -1;\n}',
      deep: '<p>This happens in optimized code (Tier 1 and full optimization). Tier 0 compiles quickly and folds very little. Even costlier than usual are <b>generic virtual methods</b> (<code>virtual void M&lt;T&gt;()</code>): the exact target depends on both the object type and T, so the call goes through a runtime lookup with a cache instead of a simple method table slot. Keep them out of hot code.</p>'
    },
    {
      t: 'choice',
      q: 'What is left in the optimized machine code of Size<long>()?',
      options: ['Only return 8', 'Both typeof checks and return 8', 'A helper call to look T up in the dictionary', 'Boxing T and comparing Type objects'],
      answer: 0,
      explain: 'long is a value type, so Size<long> has its own copy. typeof(long) == typeof(int) is known to be false, typeof(long) == typeof(long) is true. The JIT folds both checks, and the method becomes a single return of a constant.',
      wrong: { 2: 'Only shared code needs the dictionary. In a copy for a value type T is known at compile time.' }
    },
    {
      t: 'learn',
      title: 'Static fields belong to each instantiation',
      body: '<p>Code can be shared, data cannot. <code>Counter&lt;string&gt;</code> and <code>Counter&lt;object&gt;</code> run shared code, but they are <b>different types</b>: each has its own MethodTable, its own block of static fields and its own static constructor, which runs separately for every instantiation.</p><p>Shared code finds the right statics block through the generic dictionary as well: it is just another slot.</p>',
      code: 'class Counter<T> { public static int Count; }\n\nCounter<string>.Count++;\nCounter<object>.Count++;\nCounter<int>.Count++;\nConsole.WriteLine(Counter<string>.Count);   // 1, not 2',
      deep: '<p>This is the basis of the "static cache per type" trick: <code>static class TypeCache&lt;T&gt; { public static readonly string Name = typeof(T).Name; }</code>. The value is computed once per type, and reading it is a field load with no hashing, unlike a <code>Dictionary&lt;Type, …&gt;</code>. <code>EqualityComparer&lt;T&gt;.Default</code> and <code>Array.Empty&lt;T&gt;()</code> work this way.</p><p>A bonus: if the class is already initialized by the time a method is recompiled at Tier 1, the JIT can embed the value of a primitive <code>static readonly</code> field as a constant.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line prints 0?',
      code: 'class Registry<T> { public static int Hits; }\n\nRegistry<string>.Hits = 5;\nRegistry<object>.Hits = 7;\nConsole.WriteLine(Registry<string>.Hits);\nConsole.WriteLine(Registry<Uri>.Hits);\nConsole.WriteLine(Registry<object>.Hits);',
      answer: 5,
      explain: 'Registry<Uri> is a separate type with its own field, and nobody wrote to it. The fact that all three instantiations run the shared Registry<__Canon> code has no effect on statics.'
    },
    {
      t: 'learn',
      title: 'constrained.: an interface call on T without boxing',
      body: '<p>The method <code>Less&lt;T&gt;</code> calls <code>CompareTo</code> on a value of type T. If T is a struct, a plain interface call would require boxing: an interface call works on an object in the heap.</p><p>So the C# compiler puts the <code>constrained.</code> prefix in front of <code>callvirt</code>. It tells the JIT: "the call is made on a value of type T". In the copy for <code>int</code> the JIT calls <code>Int32.CompareTo</code> directly and usually inlines it: no boxing, no virtual call. In shared code for a reference T it is an ordinary interface call.</p>',
      code: 'static bool Less<T>(T a, T b) where T : IComparable<T>\n    => a.CompareTo(b) < 0;\n\n// IL:\n// ldarga.s   a\n// ldarg.1\n// constrained. !!T\n// callvirt   instance int32 class System.IComparable`1<!!T>::CompareTo(!0)',
      deep: '<p>The prefix arrived together with generics in .NET Framework 2.0 for exactly this reason: the same IL has to work with reference T (a reference needs no boxing) and with value T (boxing must be avoided). If the struct does not override the method and it is inherited from <code>object</code> (for example <code>ToString</code>), boxing still happens, just as in the boxing lesson.</p>'
    },
    {
      t: 'match',
      q: 'Match each concept with what it means',
      pairs: [
        ['System.__Canon', 'Stands in for a reference T in shared code'],
        ['Generic dictionary', 'Slots with exact types for shared code'],
        ['constrained.', 'Interface call on T without boxing'],
        ['Counter<string>.Count', 'A separate field per instantiation'],
        ['typeof(T) == typeof(int)', 'A constant in the copy for a value T']
      ]
    }
  ]
};

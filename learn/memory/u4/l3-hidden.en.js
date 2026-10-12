/** Memory in .NET, unit "Allocation", lesson 3: hidden allocations — closures, boxing, iterators, params, strings, async. */
export default {
  id: 'mem.u4.l3',
  title: 'Hidden allocations',
  sub: 'Where no new is written, yet an object appears',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'The new you cannot see',
      body: '<p>The most expensive allocations in hot code are not the ones written out. The C# compiler and the libraries create objects for you: for a lambda, for a boxed number, for an iterator, for an argument array.</p><p>How to find them:</p><ul><li>look at what the compiler turned the code into — a decompiler to IL or to "lowered" C#;</li><li>measure bytes per call — that is lesson 4;</li><li>in an allocation profiler, look at which types get created: <code>&lt;&gt;c__DisplayClass</code>, <code>Box</code>, <code>&lt;Where&gt;d__</code> — the names of compiler-generated classes give the culprit away.</li></ul>',
      deep: 'The compiler picks names with angle brackets so that they cannot be written in C#: <code>&lt;&gt;c__DisplayClass0_0</code> is a closure, <code>&lt;&gt;c</code> is the singleton for non-capturing lambdas, <code>&lt;Read&gt;d__3</code> is the state machine of an iterator or async method named Read. These are Roslyn implementation details and may change, but they have stayed this way for years.'
    },
    {
      t: 'learn',
      title: 'Closures and delegates',
      body: '<p>How a lambda captures variables is covered in the unit "Delegates, events and closures" of the "Deeper C#" course. Here — only the cost:</p><ul><li><b>no capture</b> — the delegate is created once and cached in a static field, free after that;</li><li><b>capturing this</b> — a new delegate every time the lambda expression is evaluated;</li><li><b>capturing a local or a parameter</b> — a closure object (display class) plus a delegate.</li></ul><p>The trap: the closure is created <b>on entry to the scope</b> of the captured variable, not where the lambda is written. If a parameter is captured — on entry to the method, even if the branch with the lambda never runs.</p>',
      code: 'items.Where(x => x > 0);       // cached delegate\nitems.Where(x => x > _min);    // a delegate per call\nitems.Where(x => x > limit);   // closure + delegate',
      deep: 'Method groups: <code>items.Select(Parse)</code> with a static <code>Parse</code> created a new delegate on every call before C# 11; starting with C# 11 the compiler caches it like a non-capturing lambda. An instance method group (<code>items.Select(this.Parse)</code>) always produces a new delegate: it is bound to a specific object.'
    },
    {
      t: 'choice',
      q: 'How many heap objects does the call Find(list, 10, fast: true) create?',
      code: 'int Find(List<int> items, int limit, bool fast)\n{\n    if (fast)\n        return items.Count;\n    return items.FindIndex(x => x > limit);\n}',
      options: ['One — the closure', 'Zero — the lambda was never reached', 'Two — the closure and the delegate', 'One — the delegate'],
      answer: 0,
      explain: 'limit is a parameter, so its storage moves into the closure object, which is created on entry to the method: from then on the parameter lives only there. The delegate is created when the lambda expression is evaluated, and the fast branch never gets there. The fix is to move the branch with the lambda into a separate method.'
    },
    {
      t: 'learn',
      title: 'Boxing',
      body: '<p>A value type that ends up where an <code>object</code> or an interface is expected gets boxed: a heap object with a header, a type pointer and a copy of the value. For an <code>int</code> that is 24 bytes for the sake of 4.</p><p>Where it hides:</p><ul><li>old APIs taking <code>object</code>: <code>string.Format("{0}", n)</code>, <code>ArrayList</code>, <code>Hashtable</code>;</li><li>a struct passed as an interface: <code>IComparable c = point</code>;</li><li>calling non-overridden <code>ToString</code>, <code>Equals</code>, <code>GetHashCode</code> on a struct — they are declared in <code>ValueType</code>.</li></ul><p>Generics (<code>List&lt;int&gt;</code>, <code>IEquatable&lt;T&gt;</code>) work without boxing: the JIT generates separate code for each value type.</p>',
      deep: '<code>Enum.HasFlag</code> used to box its argument; since .NET Core 2.1 the JIT expands it into a bit test. Interpolation <code>$"{n}"</code> with C# 10 on .NET 6+ goes through <code>DefaultInterpolatedStringHandler</code> with the generic <code>AppendFormatted&lt;T&gt;</code> — no boxing. But <code>string.Format</code> with numeric arguments still boxes today.'
    },
    {
      t: 'multi',
      q: 'n is an int, list is a List<int>. Where does boxing happen (C# 12, .NET 8)? Select all.',
      options: [
        'object o = n;',
        'IComparable c = n;',
        'list.Add(n);',
        'string.Format("{0}", n);',
        'var s = $"{n}";'
      ],
      answer: [0, 1, 3],
      explain: 'object and an interface are explicit boxing. string.Format takes object — boxing too. List<int> stores an int as is. Interpolation since C# 10 calls the generic AppendFormatted<int> and writes the number straight into a buffer; the only allocation is the final string.'
    },
    {
      t: 'learn',
      title: 'Iterators, LINQ and foreach over an interface',
      body: '<p>The compiler turns a method with <code>yield return</code> into an iterator class, and every call of the method is a new object. Every LINQ operator is such an object plus a delegate; details are in the unit "LINQ and its cost" of the "Deeper C#" course.</p><p>Less visible is <code>foreach</code>. On <code>List&lt;T&gt;</code>, <code>GetEnumerator()</code> returns a <b>struct</b> <code>List&lt;T&gt;.Enumerator</code>: iteration without a single allocation. But if the list is passed as <code>IEnumerable&lt;T&gt;</code>, the interface method is called, it returns <code>IEnumerator&lt;T&gt;</code> — and the struct gets boxed.</p>',
      code: 'List<int> list = GetList();\nforeach (var x in list) { }    // struct Enumerator, 0 bytes\n\nIEnumerable<int> seq = list;\nforeach (var x in seq) { }     // boxed Enumerator',
      deep: 'An iterator saves one object: it implements both IEnumerable and IEnumerator, and the first GetEnumerator on the same thread returns <code>this</code>. A second enumeration of the same sequence creates a copy. In .NET 10 the JIT learned, in some cases (primarily arrays behind <code>IEnumerable&lt;T&gt;</code>), to devirtualize the enumeration and avoid the heap enumerator — but it is an optimization you cannot rely on in an API.'
    },
    {
      t: 'choice',
      q: 'All three methods are called with a List<int>. Which one creates a heap object on every call?',
      code: 'int Sum1(List<int> xs)\n{ int s = 0; foreach (var x in xs) s += x; return s; }\n\nint Sum2(IEnumerable<int> xs)\n{ int s = 0; foreach (var x in xs) s += x; return s; }\n\nint Sum3(IReadOnlyList<int> xs)\n{ int s = 0; for (int i = 0; i < xs.Count; i++) s += xs[i]; return s; }',
      options: ['Sum2', 'Sum1', 'Sum3', 'All three'],
      answer: 0,
      explain: 'Sum2 enumerates through IEnumerable<int>.GetEnumerator(), and the struct enumerator gets boxed. Sum1 sees the concrete List<int> and takes the struct. Sum3 calls Count and the indexer through the interface — interface calls, but not allocations.',
      wrong: { 2: 'An interface call costs an indirect jump but creates no object: Count and the indexer return int.' }
    },
    {
      t: 'learn',
      title: 'params and strings',
      body: '<p><code>params object[]</code> means a new array on every call (an empty one is the shared <code>Array.Empty</code>), and value-type arguments get boxed on top. Since C# 13 there is <code>params ReadOnlySpan&lt;T&gt;</code>: the compiler puts the arguments in a stack buffer, no heap needed. In .NET 9 such overloads were added to, for example, <code>string.Join</code>, <code>string.Concat</code>, <code>Path.Combine</code> — recompiling is enough.</p><p>Strings are immutable, every change is a new string:</p><ul><li><code>a + b + c</code> — one call to <code>string.Concat</code>, one string;</li><li><code>s += x</code> in a loop — a new string on every iteration, each copying everything accumulated so far;</li><li>interpolation <code>$"..."</code> (C# 10+) builds the text in a rented buffer and creates one final string.</li></ul>',
      deep: 'For <code>params ReadOnlySpan&lt;T&gt;</code> the compiler generates a struct with the <code>[InlineArray]</code> attribute in the stack frame; if all the arguments are primitive constants, the data comes straight from the metadata section. The span overload wins overload resolution over the array one, so an old call <code>string.Join(",", a, b, c)</code> quietly stops creating an array after moving to .NET 9.'
    },
    {
      t: 'tapline',
      q: 'A report of 10,000 lines takes minutes to build. Which line is to blame?',
      code: 'string BuildReport(List<Order> orders)\n{\n    string result = "";\n    foreach (var o in orders)\n    {\n        var line = $"{o.Id};{o.Total}";\n        result += line + "\\n";\n    }\n    return result;\n}',
      answer: 6,
      explain: 'result += creates a new string and copies the whole report so far into it. For n lines that is n copies of growing length, O(n²) bytes; the long intermediate strings also end up in the LOH. The interpolation in the var line = … line is one short string per order. The cure is a StringBuilder or writing to a stream.'
    },
    {
      t: 'learn',
      title: 'async: the state machine moves to the heap',
      body: '<p>The compiler turns an async method into a struct — a state machine (in a Release build; in Debug it is a class and is always allocated on the heap). While the method runs synchronously, it lives on the stack. The cost depends on how the method finishes:</p><ul><li><b>finished without waiting</b> — the machine stayed on the stack. A non-generic <code>Task</code> comes ready-made from a cache; a <code>Task&lt;T&gt;</code> is created anew (except for cached <code>bool</code>, small <code>int</code> and <code>null</code>); a <code>ValueTask&lt;T&gt;</code> carries the result inside — zero allocations;</li><li><b>the first real await</b> of an incomplete operation — the state machine is copied to the heap.</li></ul><p>The mechanics are covered in detail in the course "Async/await in depth".</p>',
      deep: 'Since .NET Core 2.1 the state machine is copied into an <code>AsyncStateMachineBox&lt;TStateMachine&gt;</code> object, which itself derives from <code>Task&lt;TResult&gt;</code>: one allocation instead of several in .NET Framework (the task, the boxed machine, the continuation delegate). The <code>Task&lt;int&gt;</code> cache covers values from -1 to 8 — an implementation detail, not a contract.'
    },
    {
      t: 'choice',
      q: 'The value is in the cache and the method returns it without awaiting. How many heap objects does the call create?',
      code: 'async ValueTask<Item> GetAsync(string key)\n{\n    if (_cache.TryGetValue(key, out var item))\n        return item;\n    item = await LoadAsync(key);\n    _cache[key] = item;\n    return item;\n}',
      options: ['Zero', 'One — a Task<Item>', 'One — the state machine', 'Two — the state machine and a task'],
      answer: 0,
      explain: 'The method never reached await, so the state machine stayed a struct on the stack, and the ValueTask<Item> holds the result right inside. With Task<Item> there would be one new task object on every cache hit.'
    },
    {
      t: 'match',
      q: 'Match the construct and what it creates on the heap',
      pairs: [
        ['x => x > limit (limit is a local)', 'A closure and a delegate'],
        ['Calling a method with yield return', 'An iterator object'],
        ['foreach over a List<T> as IEnumerable<T>', 'A boxed enumerator'],
        ['string.Format("{0}", n)', 'A boxed int'],
        ['await on an incomplete task', 'The state machine on the heap']
      ]
    }
  ]
};

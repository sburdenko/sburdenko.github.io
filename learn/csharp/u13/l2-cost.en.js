/** Deeper C#, unit "Attributes and reflection", lesson 2: the cost of reflection and faster ways to call a method. */
export default {
  id: 'cs.u13.l2',
  title: 'The cost of reflection',
  sub: 'Invoke, delegates, Expression, UnsafeAccessor and Activator',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Reflection: a type as data',
      body: '<p><b>Reflection</b> is the API that hands you metadata as objects: <code>Type</code>, <code>MethodInfo</code>, <code>PropertyInfo</code>, <code>FieldInfo</code>. Through them you can find a member by name, read and write a value, call a method, create an object.</p><p>The cost has two parts. <b>Lookup</b>: <code>GetMethod("WithTax")</code> compares strings and checks <code>BindingFlags</code>. <b>The call</b>: the compiler does not know the types, so the arguments travel in an <code>object[]</code> and the runtime checks them on every call.</p>',
      code: 'Type t = typeof(Order);                // known to the compiler: cheap\nType? u = Type.GetType("Shop.Order");  // by string: a lookup at run time\n\nMethodInfo m = t.GetMethod("WithTax")!;\nPropertyInfo p = t.GetProperty("Total")!;\n\nobject o = Activator.CreateInstance(t)!;\np.SetValue(o, 100m);                    // 100m is boxed into object\nvar r = (decimal)m.Invoke(o, new object[] { 0.2m })!;',
      deep: '<p>The runtime caches <code>MethodInfo</code> objects inside the type, so a repeated <code>GetMethod</code> is cheaper than the first, but the string lookup and flag checks remain. How these caches and metadata tokens work is covered in the ".NET inside out" course.</p><p><code>typeof(Order)</code> compiles to loading the type token and calling <code>Type.GetTypeFromHandle</code>; the JIT usually folds that into a constant.</p>'
    },
    {
      t: 'choice',
      q: 'Shop.Order lives in Shop.dll, which is already loaded. Code in App.dll calls Type.GetType("Shop.Order"). What comes back?',
      options: ['null', 'The Shop.Order type', 'TypeLoadException', 'It depends on the assembly load order'],
      answer: 0,
      explain: 'Without an assembly name, Type.GetType searches only the calling assembly and System.Private.CoreLib. For a type from another assembly you need an assembly-qualified name: "Shop.Order, Shop". You get an exception only if you pass throwOnError: true.',
      wrong: { 3: 'Whether Shop.dll is loaded does not matter: without an assembly name it is simply not searched.' }
    },
    {
      t: 'learn',
      title: 'Five ways to call a method',
      body: '<p>Orders of magnitude for calling a small method on a typical x64 machine (exact numbers depend on the hardware and version — measure with BenchmarkDotNet):</p><ul><li><b>a direct call</b> — about a nanosecond or less: the JIT can inline the method;</li><li><b>UnsafeAccessor</b> (.NET 8) — like a direct call, even to a private member;</li><li><b>a delegate</b> from <code>CreateDelegate</code> or a compiled <code>Expression</code> — a few nanoseconds: an indirect call with no inlining;</li><li><b>MethodInfo.Invoke</b> — tens of nanoseconds plus allocations on every call;</li><li><b>GetMethod + Invoke</b> on every iteration — more still.</li></ul><p>The gap is orders of magnitude, not percent. You notice it in a hot loop; for a couple of calls at startup you do not.</p>'
    },
    {
      t: 'order',
      q: 'Order from fastest to slowest. The method is small, everything is prepared in advance, the call is in a hot loop.',
      items: ['A direct call o.WithTax(r)', 'Calling a delegate from CreateDelegate', 'MethodInfo.Invoke with a cached MethodInfo', 'GetMethod by name and Invoke on every iteration'],
      explain: 'The JIT can inline a direct call. A delegate is an indirect call. Invoke boxes arguments, allocates an array and checks types. A lookup by name adds string comparison on top.'
    },
    {
      t: 'learn',
      title: 'Why Invoke is expensive',
      body: '<p>On every <code>MethodInfo.Invoke</code> call:</p><ul><li>an <code>object[]</code> is allocated for the arguments;</li><li>value-type arguments and the result are boxed;</li><li>the runtime checks the number and types of the arguments and the method\'s accessibility;</li><li>an exception from the method is wrapped in <code>TargetInvocationException</code>, the real one sits in <code>InnerException</code>.</li></ul><p>None of this is needed when the signature is known in advance: then you use reflection once — to get a delegate.</p>',
      deep: '<p>Since .NET 7, after the first calls the runtime generates an IL stub for the method, and Invoke became much faster than in .NET Framework. .NET 8 added <code>MethodInvoker</code> and <code>ConstructorInvoker</code>: arguments are passed without an <code>object[]</code>, though value types are still boxed.</p><p>The <code>BindingFlags.DoNotWrapExceptions</code> flag turns the wrapping off: the method\'s exception propagates as is.</p>'
    },
    {
      t: 'choice',
      q: 'The Pay method throws InvalidOperationException. What does this code print?',
      code: 'try\n{\n    typeof(Order).GetMethod("Pay")!.Invoke(order, null);\n}\ncatch (InvalidOperationException)\n{\n    Console.WriteLine("A");\n}\ncatch (Exception e)\n{\n    Console.WriteLine("B " + e.GetType().Name);\n}',
      options: ['B TargetInvocationException', 'A', 'B InvalidOperationException', 'B AmbiguousMatchException'],
      answer: 0,
      explain: 'Invoke wraps the called method\'s exception in TargetInvocationException, so the first catch does not match. The original exception is in e.InnerException. To skip the wrapper, use BindingFlags.DoNotWrapExceptions.',
      wrong: { 1: 'That is what a direct call would do. Invoke puts its own wrapper between you and the method.' }
    },
    {
      t: 'learn',
      title: 'CreateDelegate: reflection once',
      body: '<p>If the signature is known at compile time, turn the <code>MethodInfo</code> into a delegate. You pay once, at creation; after that it is an ordinary delegate call: no array, no boxing, no checks.</p><p>An <b>open</b> delegate takes the instance as its first parameter: one delegate for all objects. A <b>closed</b> one is bound to a single object: <code>m.CreateDelegate&lt;Func&lt;decimal, decimal&gt;&gt;(order)</code>.</p><p>A property is a pair of methods: build the delegate from <code>p.GetMethod</code> or <code>p.SetMethod</code>.</p>',
      code: 'MethodInfo m = typeof(Order).GetMethod("WithTax")!;\n\n// open delegate: the instance is the first parameter\nvar withTax = m.CreateDelegate<Func<Order, decimal, decimal>>();\n\ndecimal sum = 0;\nforeach (var o in orders)\n    sum += withTax(o, 0.2m);   // an ordinary delegate call',
      deep: '<p>The generic <code>CreateDelegate&lt;T&gt;()</code> arrived in .NET 5; before that you wrote <code>(Func&lt;…&gt;)Delegate.CreateDelegate(typeof(Func&lt;…&gt;), m)</code>.</p><p>The delegate type must match the signature exactly, allowing for variance of reference types. For a struct method, an open delegate takes the instance by reference — you need your own delegate type with a <code>ref</code> parameter.</p>'
    },
    {
      t: 'blanks',
      q: 'Build a fast getter for the Total property',
      code: 'PropertyInfo p = typeof(Order).GetProperty("Total")!;\nvar get = p.___!.CreateDelegate<___<Order, decimal>>();\ndecimal t = get(order);',
      tiles: ['GetMethod', 'Func', 'SetMethod', 'Action', 'GetValue', 'Predicate'],
      answer: ['GetMethod', 'Func'],
      explain: 'The getter is the get_Total method; its MethodInfo is in p.GetMethod. It takes an Order (an open delegate) and returns a decimal — that is Func<Order, decimal>. GetValue is the same slow path through object.'
    },
    {
      t: 'learn',
      title: 'Expression.Compile: when the types are known only at run time',
      body: '<p>A serializer or a mapper needs a getter for <b>any</b> property, and the type is known only at run time. Then a <code>Func&lt;object, object?&gt;</code> is built from an expression tree and compiled.</p><p><code>Compile()</code> generates IL through <code>DynamicMethod</code>, and the JIT turns it into machine code. It is expensive: from hundreds of microseconds to milliseconds. But the call afterwards costs as much as a delegate call. So the result must be cached, for example by <code>PropertyInfo</code>.</p>',
      code: 'static Func<object, object?> Getter(PropertyInfo p)\n{\n    var obj = Expression.Parameter(typeof(object));\n    var body = Expression.Convert(\n        Expression.Property(Expression.Convert(obj, p.DeclaringType!), p),\n        typeof(object));\n    return Expression.Lambda<Func<object, object?>>(body, obj).Compile();\n}',
      deep: '<p>Where code cannot be generated at run time — Native AOT, iOS — <code>Compile()</code> does not fail; it returns a delegate over a tree <b>interpreter</b>. It works, but many times slower, and the win over Invoke is gone.</p><p>A value-type property is boxed when such a getter returns <code>object</code> — that is the price of the universal signature, not of reflection.</p>'
    },
    {
      t: 'learn',
      title: 'UnsafeAccessor: private access without reflection',
      body: '<p>.NET 8 introduced <code>[UnsafeAccessor]</code>. You declare an <code>extern static</code> method, say which member it accesses, and the runtime generates the body itself. Kinds: <code>Constructor</code>, <code>Method</code>, <code>StaticMethod</code>, <code>Field</code>, <code>StaticField</code>.</p><p>The cost is that of a direct call: the JIT can inline it. The member is named statically, so it works with trimming and Native AOT.</p><p>Downsides: the name is a string. A typo surfaces on the first call as <code>MissingFieldException</code> or <code>MissingMethodException</code>. And you depend on private details of someone else\'s type — the next version may rename them.</p>',
      code: 'static class ListAccess\n{\n    // access to the private field List<int>._size\n    [UnsafeAccessor(UnsafeAccessorKind.Field, Name = "_size")]\n    public static extern ref int Size(List<int> list);\n}\n\nvar list = new List<int> { 1, 2, 3 };\nListAccess.Size(list) = 1;   // list.Count is now 1',
      deep: '<p>For a field the method returns a <code>ref</code> — you can both read and write. The first parameter is the instance (for static members too: its value is ignored, and its type says where to look).</p><p>.NET 9 added generics support: declare the method in a generic class with the same type parameters. .NET 10 added <code>[UnsafeAccessorType]</code> for when the type itself is not accessible at compile time.</p>'
    },
    {
      t: 'match',
      q: 'Match the approach with when you pay for it',
      pairs: [
        ['MethodInfo.Invoke', 'Allocations and checks on every call'],
        ['CreateDelegate', 'Once at creation, signature known'],
        ['Expression.Compile', 'Expensive compilation, then a delegate-speed call'],
        ['UnsafeAccessor', 'Almost nothing: access like a direct call'],
        ['GetMethod("Name")', 'Looking up a member by string']
      ]
    },
    {
      t: 'learn',
      title: 'Activator and new T()',
      body: '<p><code>Activator.CreateInstance(Type)</code> creates an object with the parameterless constructor. For <code>new T()</code> in a generic method with the <code>new()</code> constraint the compiler emits a call to <code>Activator.CreateInstance&lt;T&gt;()</code> — there is no dedicated IL instruction for it.</p><p>In modern .NET the runtime caches the constructor it found, and the cost is close to a plain <code>new</code> plus a few nanoseconds. In .NET Framework the gap was much larger — hence the old advice to "cache a factory via Expression".</p><p>The expensive variant is <code>CreateInstance(type, args)</code> with arguments: matching a constructor by argument types, plus an array and boxing on every call.</p>',
      code: 'object a = Activator.CreateInstance(typeof(Order))!;   // by Type\nOrder b = Activator.CreateInstance<Order>();           // by T\n\n// in IL: call Activator.CreateInstance<T>()\nstatic T Make<T>() where T : new() => new T();'
    },
    {
      t: 'choice',
      q: 'What does the compiler turn new T() into in Make<T>() where T : new()?',
      options: ['A call to Activator.CreateInstance<T>()', 'A newobj instruction for T', 'A constructor lookup through GetConstructor', 'A call to a static method T.New()'],
      answer: 0,
      explain: 'newobj needs a concrete constructor, and T has none until run time: for reference types the JIT even shares one body across all of them. So the compiler calls Activator.CreateInstance<T>(), which finds and caches the constructor of the actual type.'
    }
  ]
};

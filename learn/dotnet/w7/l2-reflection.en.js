/** .NET inside out, unit "Generics and reflection inside out", lesson 2: metadata tokens, handles, MethodInfo and the cost of Invoke. */
export default {
  id: 'dotnet.w7.l2',
  title: 'Reflection inside out',
  sub: 'Metadata tokens, RuntimeTypeHandle, MethodInfo caches and what Invoke really costs',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'IL has no names, only tokens',
      body: '<p>Assembly metadata is a set of tables: types, methods, fields, references to members elsewhere. An IL instruction never contains a method name. It contains a <b>metadata token</b>, 4 bytes:</p><ul><li><b>the high byte</b> is the table number: <code>0x02</code> TypeDef, <code>0x06</code> MethodDef, <code>0x0A</code> MemberRef, <code>0x01</code> TypeRef, <code>0x70</code> string literal;</li><li><b>the low three bytes</b> are the row number in that table, starting at one.</li></ul><p>The names shown by ildasm and ILSpy are looked up by those tools from the metadata using the token.</p>',
      code: '// C#: Console.WriteLine(Add(2, 3));\nIL_0000: ldc.i4.2\nIL_0001: ldc.i4.3\nIL_0002: call int32 Program::Add(int32, int32)        // token 0x06000002: MethodDef, row 2\nIL_0007: call void [System.Console]System.Console::WriteLine(int32)   // 0x0A00000C: MemberRef\nIL_000c: ret',
      deep: '<p>The row numbers in the example are made up; they depend on the assembly. <b>MethodDef</b> is a method defined in this very assembly. <b>MemberRef</b> is a reference by name: a parent (a TypeRef for a foreign type, or a TypeSpec), a name and a signature blob. Calling a method on a generic instantiation such as <code>List&lt;int&gt;.Add</code> is a MemberRef whose parent is a TypeSpec (<code>0x1B</code>), and calling a generic method <code>Foo&lt;int&gt;()</code> uses a <b>MethodSpec</b> token (<code>0x2B</code>).</p><p>From code you can see a token as <code>MemberInfo.MetadataToken</code>, and <code>Module.ResolveMethod</code> turns it back into an object. The tables and their codes are defined in the ECMA-335 standard.</p>'
    },
    {
      t: 'match',
      q: 'Match the high byte of a token with its table',
      pairs: [
        ['0x02', 'TypeDef: a type from this assembly'],
        ['0x06', 'MethodDef: a method from this assembly'],
        ['0x0A', 'MemberRef: a reference to a member by name and signature'],
        ['0x01', 'TypeRef: a reference to a type in another assembly'],
        ['0x70', 'A string literal from the #US heap']
      ]
    },
    {
      t: 'learn',
      title: 'How the JIT turns a token into a method',
      body: '<p>While compiling a method, the JIT meets a <code>call</code> with a token and asks the runtime: what is this?</p><ul><li><b>MethodDef</b> is a row of its own table; the runtime finds the method descriptor (MethodDesc) right away.</li><li><b>MemberRef</b> takes longer: follow the AssemblyRef to find and load the assembly, find the type in it by name, and find the method in the type by name <b>and signature</b>.</li></ul><p>The result is remembered in the module tables, so resolution happens once. But the mechanism implies a "version 2" scenario: the signature in a MemberRef includes the parameter types and the <b>return type</b>. Change them in a library and a consumer built against the old version will find no match.</p>',
      deep: '<p>The error does not show up when the assembly loads, but when the JIT compiles the method containing the call: <code>MissingMethodException</code> (or <code>MissingFieldException</code> for fields). So old code may run happily for a long time until it reaches the branch with the stale call.</p><p>Hence the rule for library authors: never change signatures in a public API, add an overload next to the old one. Even an optional parameter changes the signature: the default value is inserted by the calling compiler, while in metadata the method simply has one more parameter.</p>'
    },
    {
      t: 'choice',
      q: 'In version 2 of a library, public int Count() became public long Count(). The app was not rebuilt; the new dll was dropped in. What happens?',
      options: ['MissingMethodException when the JIT compiles the calling method', 'It works: the long gets truncated to int', 'An error when the library assembly loads', 'The new method is called and returns a long'],
      answer: 0,
      explain: 'The app MemberRef records the signature "() returning int32". The new assembly has no method with that signature: the return type is part of the signature. The runtime cannot find the method when resolving the token.',
      wrong: { 2: 'The assembly loads fine. The error comes later, when that particular MemberRef is resolved.' }
    },
    {
      t: 'learn',
      title: 'Handles are runtime pointers',
      body: '<p>Inside the runtime a type is a MethodTable, a method is a MethodDesc, a field is a FieldDesc. Managed code sees them through handle wrappers:</p><ul><li><code>RuntimeTypeHandle</code> points to a MethodTable;</li><li><code>RuntimeMethodHandle</code> to a MethodDesc;</li><li><code>RuntimeFieldHandle</code> to a FieldDesc.</li></ul><p><code>typeof(X)</code> compiles to <code>ldtoken</code> (token to handle) plus a call to <code>Type.GetTypeFromHandle</code>. The JIT recognizes the pair and replaces it with a constant. There is exactly one <code>Type</code> object (really a <code>RuntimeType</code>) per type: the runtime creates it the first time it is needed and hands out the same one afterwards.</p>',
      code: 'Type t = typeof(string);\n// IL:\n// ldtoken    [System.Runtime]System.String\n// call       class System.Type System.Type::GetTypeFromHandle(valuetype System.RuntimeTypeHandle)\n\nIntPtr mt = typeof(string).TypeHandle.Value;   // the MethodTable address',
      deep: '<p>The check <code>obj.GetType() == typeof(Circle)</code> in optimized code creates no <code>Type</code> objects at all: the JIT compares the MethodTable pointer from the object with a constant. When you need the exact type without subclasses, this is cheaper than <code>is Circle</code> on an unsealed class: no walk up the hierarchy.</p><p>Since .NET 8 <code>RuntimeType</code> objects usually live on the non-moving NonGC heap, so the JIT can embed their address directly in machine code.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about typeof in optimized code? Select all.',
      options: ['obj.GetType() == typeof(X) becomes a comparison of MethodTable pointers', 'Every typeof(X) looks the type up by name in metadata', 'There is one RuntimeType object per type, and typeof returns that same object', 'typeof(X) creates a new Type object on every call'],
      answer: [0, 2],
      explain: 'The token in ldtoken is resolved once, when the method is compiled; there is no lookup by name on each call. And a type has a single Type object, so typeof(X) == typeof(X) can be compared by reference.'
    },
    {
      t: 'learn',
      title: 'MethodInfo and the reflection caches',
      body: '<p><code>GetMethod("Parse")</code> goes to the <b>type cache</b> (RuntimeTypeCache) that a <code>RuntimeType</code> creates on its first reflection request. On the first lookup the cache walks the methods of the MethodTable, creates <code>RuntimeMethodInfo</code> objects (each holding a RuntimeMethodHandle) and stores them.</p><p>A repeated lookup is cheaper, but not free: comparing names, filtering by <code>BindingFlags</code>, picking an overload by parameter types. And <code>GetMethods()</code> returns a fresh copy of the array every time.</p><p>The rule: look the <code>MethodInfo</code> up once and keep it in a <code>static readonly</code> field.</p>',
      code: 'static readonly MethodInfo s_parse =\n    typeof(int).GetMethod("Parse", [typeof(string)])!;\n\n// bad: a lookup by name on every call\nint Slow(string s) =>\n    (int)typeof(int).GetMethod("Parse", [typeof(string)])!.Invoke(null, [s])!;',
      deep: '<p><code>RuntimeType</code> holds its cache through a weak reference (a GC handle), so under memory pressure the collector may drop it and the next request rebuilds everything. That is another reason to keep the <code>MethodInfo</code> objects you need yourself instead of hoping a repeated <code>GetMethod</code> returns the same object.</p><p>Then and now: in .NET Framework this path also ran Code Access Security checks. Modern .NET has no CAS, but the visibility and argument checks on invocation are still there.</p>'
    },
    {
      t: 'order',
      q: 'Put in order what happens on mi.Invoke(obj, [42]) for a method void Set(int v)',
      items: ['42 is boxed into an object and placed in an object[] array', 'Check: obj has a suitable type and the argument count matches', 'Check each argument type and unbox 42 into an int', 'Call the method through a stub', 'Return the result as object (null here)'],
      explain: 'One call costs an array, a boxed argument, checks and an indirect call. If the method throws, Invoke wraps the exception in TargetInvocationException.'
    },
    {
      t: 'learn',
      title: 'The cost of Invoke: then and now',
      body: '<p>The ways to call a method through reflection are covered in the Attributes and reflection unit of the Deeper C# course; here is what happens inside. Before .NET 7 every <code>Invoke</code> went down a generic path inside the runtime: parse the signature, unpack the arguments from the array, call. In <b>.NET 7</b> Invoke became several times faster: after the first call the runtime generates an IL stub for the method that unpacks arguments like ordinary code.</p><p><b>.NET 8</b> added <code>MethodInvoker</code> and <code>ConstructorInvoker</code>: up to four arguments are passed without an array, and there is no Invoke-compatible handling of default values. Value type arguments are still boxed, since the parameters are <code>object?</code>.</p><p>The fastest option is <code>CreateDelegate</code>: build a delegate once, and from then on a call costs as much as a delegate call.</p>',
      code: 'MethodInfo mi = typeof(Calc).GetMethod(nameof(Calc.Add))!;\n\nobject? r1 = mi.Invoke(calc, [2, 3]);           // array + 2 boxes + boxed result\n\nMethodInvoker inv = MethodInvoker.Create(mi);   // .NET 8\nobject? r2 = inv.Invoke(calc, 2, 3);            // no array, still boxing\n\nvar add = mi.CreateDelegate<Func<Calc, int, int, int>>();\nint r3 = add(calc, 2, 3);                       // like any delegate call',
      deep: '<p>In .NET 7+ the first call takes the old path without code generation: for a one-off call, building a stub costs more than calling slowly. Where code generation is impossible (Native AOT, <code>RuntimeFeature.IsDynamicCodeSupported == false</code>), a path without emission is used. <code>Invoke</code> wraps exceptions from the called method in <code>TargetInvocationException</code>; the <code>BindingFlags.DoNotWrapExceptions</code> flag turns that off.</p><p><code>CreateDelegate</code> for an instance method with no target gives an "open" delegate: the object comes as the first parameter. The exact cost of each option depends on the version and the signature, so measure with BenchmarkDotNet.</p>'
    },
    {
      t: 'choice',
      q: 'The method is known in advance, but it has to be called through reflection a million times. What do you pick?',
      options: ['CreateDelegate once, then call the delegate', 'MethodInfo.Invoke with a cached MethodInfo', 'MethodInvoker from .NET 8', 'dynamic: the call site cache will speed it up'],
      answer: 0,
      explain: 'Once created, a delegate neither checks nor boxes its arguments: it is an ordinary indirect call. Invoke and MethodInvoker pay for checks and for boxing value type arguments on every call.',
      wrong: { 2: 'MethodInvoker is faster than Invoke because there is no array, but value type arguments are still boxed and the checks remain.' }
    },
    {
      t: 'learn',
      title: 'UnsafeAccessor inside: the runtime writes the body',
      body: '<p>How to use <code>[UnsafeAccessor]</code> (.NET 8) is covered in the Attributes and reflection unit of the Deeper C# course. Inside, it is a relative of MemberRef: you declare a <code>static extern</code> method with no body. When the JIT reaches it, the runtime looks the target member up by the name from the attribute and by the accessor signature, once, just like resolving a token, and generates the body itself: IL with a direct <code>ldflda</code> or <code>call</code>.</p><p>From then on it is ordinary code: it can be inlined, with no <code>MethodInfo</code>, no array and no boxing. And since the body is known before the app runs, Native AOT compiles it ahead of time.</p>',
      code: 'class Account { private decimal _balance; }\n\n[UnsafeAccessor(UnsafeAccessorKind.Field, Name = "_balance")]\nstatic extern ref decimal Balance(Account a);\n\nvar acc = new Account();\nBalance(acc) = 100m;   // writes straight into the private field',
      deep: '<p>The member is found by name and signature when the accessor method is compiled; if it is missing you get <code>MissingFieldException</code> or <code>MissingMethodException</code>. The kinds are <code>Constructor</code>, <code>Method</code>, <code>StaticMethod</code>, <code>Field</code>, <code>StaticField</code>. Generic support in accessors arrived in .NET 9. The price is fragility: a private member can be renamed in any release.</p>'
    },
    {
      t: 'blanks',
      q: 'Find the method once and turn it into a delegate',
      code: 'static ___ Func<Calc, int, int, int> s_add =\n    typeof(Calc).GetMethod("Add")!\n        .___<Func<Calc, int, int, int>>();\n\nint r = s_add(calc, 2, 3);',
      tiles: ['readonly', 'CreateDelegate', 'Invoke', 'MakeGenericMethod', 'const', 'volatile'],
      answer: ['readonly', 'CreateDelegate'],
      explain: 'static readonly means the lookup and the delegate creation happen once, when the type is initialized. CreateDelegate<TDelegate>() gives an open delegate whose first parameter is the Calc object. Invoke would return object and pay for checks on every call.'
    }
  ]
};

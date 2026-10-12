/** Deeper C#, unit "Interfaces", lesson 1: explicit implementation, boxing a struct and how the CLR calls an interface method. */
export default {
  id: 'cs.u10.l1',
  title: 'Explicit implementation and boxing',
  sub: 'Interface-only methods, a struct in a box and calls through a stub',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Implicit and explicit implementation',
      body: '<p>A class implements an interface method in one of two ways.</p><p><b>Implicitly</b> — an ordinary public method with the same name and signature. It is visible both through the class and through the interface.</p><p><b>Explicitly</b> — the name is prefixed with the interface and there is no access modifier. You cannot call such a method through a class variable, only through an interface reference.</p>',
      code: 'class Connection : IDisposable\n{\n    void IDisposable.Dispose() => Console.WriteLine("closed");\n}\n\nvar c = new Connection();\n// c.Dispose();              // error CS1061: Connection has no Dispose\n((IDisposable)c).Dispose();  // works\nusing (c) { }                // so does this: using calls through the interface',
      deep: '<p>In IL an implicit implementation is a public method flagged <code>virtual final newslot</code>. The compiler makes it virtual so it gets a slot in the method table, and seals it unless you wrote <code>virtual</code> yourself.</p><p>An explicit implementation is a <b>private</b> method named <code>System.IDisposable.Dispose</code> with an <code>.override</code> directive (a MethodImpl record) that binds it to the interface method. You cannot write a dotted name in C#, so it never clashes with ordinary methods.</p><p>An explicit implementation cannot be <code>virtual</code> or <code>abstract</code>. If a derived class needs to change the behavior, the explicit method simply calls a protected virtual one — that is how the classic Dispose pattern works.</p>'
    },
    {
      t: 'tapline',
      q: 'Report implements IExportable.Export() explicitly. Which line does not compile?',
      code: 'var r = new Report();\nIExportable e = r;\ne.Export();\nr.Export();\n((IExportable)r).Export();',
      answer: 3,
      explain: 'An explicitly implemented method is not among the public members of the class. Through a variable of type Report it is invisible — error CS1061. Through the interface (a variable or a cast) it is fine.'
    },
    {
      t: 'learn',
      title: 'Why hide a method',
      body: '<p>Three typical reasons:</p><ul><li><b>A name clash.</b> Two interfaces require a method with the same signature but different meaning. Explicit implementation gives each its own code.</li><li><b>An old untyped method.</b> <code>IEnumerable&lt;T&gt;</code> inherits the non-generic <code>IEnumerable</code>. The generic <code>GetEnumerator</code> is made public, and the one returning plain <code>IEnumerator</code> is made explicit so it stays out of the way.</li><li><b>A member nobody needs day to day.</b> <code>List&lt;T&gt;</code> implements <code>ICollection&lt;T&gt;.IsReadOnly</code> explicitly: for a list it is always false and would only be noise in IntelliSense.</li></ul>',
      code: 'class Numbers : IEnumerable<int>\n{\n    private readonly int[] _items = [1, 2, 3];\n\n    public IEnumerator<int> GetEnumerator() =>\n        ((IEnumerable<int>)_items).GetEnumerator();\n\n    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\n}'
    },
    {
      t: 'choice',
      q: 'A class implements IPrinter and IPlotter, and both require void Print(). Through IPrinter it must print text, through IPlotter it must draw a chart. How?',
      options: ['Implement at least one of the methods explicitly', 'Write two public Print() methods in one class', 'You cannot: these interfaces are incompatible in one class', 'Mark one of the methods with new'],
      answer: 0,
      explain: 'A single public Print() would satisfy both interfaces at once, but with one behavior. An explicit void IPlotter.Print() gives the second interface its own code, while the public Print() stays for IPrinter and for calls through the class.',
      wrong: { 1: 'Two methods with the same signature in one class is error CS0111.', 2: 'They are compatible: identical signatures in different interfaces are common, and explicit implementation exists for exactly that.' }
    },
    {
      t: 'learn',
      title: 'Explicit implementation on a struct: only through a box',
      body: '<p>As in the "Value types all the way" unit: an interface is a reference type, and a struct converted to it is <b>boxed</b>. A method called through the interface changes the box, not the original variable.</p><p>Explicit implementation makes this trap mandatory. On a class the explicit method is merely hidden, but on a struct there is no ordinary call path left at all: <code>c.Inc()</code> does not compile, and <code>((ICounter)c).Inc()</code> creates a box, increments it and throws it away at once. The change is lost silently.</p>',
      code: 'interface ICounter { int Value { get; } void Inc(); }\n\nstruct Counter : ICounter\n{\n    public int Value { get; private set; }\n    void ICounter.Inc() => Value++;   // explicit implementation\n}\n\nvar c = new Counter();\n// c.Inc();            // error CS1061\n((ICounter)c).Inc();   // boxing: the copy grew, c.Value == 0\nICounter box = c;      // another box\nbox.Inc();             // box.Value == 1, but c.Value == 0',
      deep: '<p>In IL a call through the interface is <code>box</code> followed by <code>callvirt</code> on the interface method. The box is a full object with a header and a type pointer: for <code>Counter</code> on x64 that is 24 bytes.</p><p>That is why explicit implementation is avoided on mutable structs. In the libraries it shows up on struct enumerators: <code>List&lt;T&gt;.Enumerator</code> explicitly implements <code>IEnumerator.Current</code> (returning <code>object</code>) and <code>IEnumerator.Reset</code>. Nobody uses them through the public API, and <code>foreach</code> over a <code>List&lt;T&gt;</code> itself calls the public <code>MoveNext</code> and <code>Current</code> directly, without a box.</p>'
    },
    {
      t: 'choice',
      q: 'Counter from the previous card: Inc is implemented explicitly. What does this print?',
      code: 'var c = new Counter();\n((ICounter)c).Inc();\nICounter a = c;\na.Inc();\nConsole.WriteLine($"{c.Value} {a.Value}");',
      options: ['0 1', '1 2', '2 2', '0 2'],
      answer: 0,
      explain: 'The first cast creates a box, increments it and throws it away: c.Value stays 0. ICounter a = c boxes c again, still with zero, and a.Inc() brings that box to 1.',
      wrong: { 1: 'That would be true if ((ICounter)c).Inc() changed the variable c itself. But the cast works on a copy.', 3: 'Box a was created from c, and c still holds 0: the first box is already gone.' }
    },
    {
      t: 'learn',
      title: 'The box-free path: a constrained generic',
      body: '<p>There is a way to call a struct\'s explicit method without boxing: a generic constrained with <code>where T : ICounter</code>. For a value-type <code>T</code> the JIT compiles a separate copy of the method, knows the exact type and calls the implementation directly — an explicit one too, since an explicit implementation is an ordinary method, just private.</p><p>For the change to reach the caller, pass the parameter by <code>ref</code>. Without it the method works on its own copy of the struct: no box, but nothing changes outside either.</p>',
      code: 'static void Bump<T>(ref T x) where T : ICounter => x.Inc();\nstatic void BumpBoxed(ICounter x) => x.Inc();\n\nvar c = new Counter();\nBump(ref c);     // no box: c.Value == 1\nBumpBoxed(c);    // a box: c.Value is still 1',
      deep: '<p>For <code>x.Inc()</code> inside a generic the compiler emits the <code>constrained.</code> prefix:</p><p><code>ldarg.0</code><br><code>constrained. !!T</code><br><code>callvirt instance void ICounter::Inc()</code></p><p>For a value-type <code>T</code> that implements the interface method itself — implicitly or explicitly — the runtime finds the implementation in the struct type and calls it through the managed pointer, without a box. The explicit method being private does not get in the way: access is checked against the interface method, not the implementation. The compiler uses the same trick in <code>using</code> and <code>foreach</code> with a struct: <code>Dispose</code> on a struct enumerator is called without boxing, even if it is implemented explicitly.</p>'
    },
    {
      t: 'blanks',
      q: 'Complete the method: it must increment any struct counter without boxing, and the change must be visible outside',
      code: 'static void Twice<T>(___ T x) where T : ___\n{\n    x.Inc();\n    x.Inc();\n}',
      tiles: ['ref', 'ICounter', 'in', 'object', 'out', 'class'],
      answer: ['ref', 'ICounter'],
      explain: 'ref gives the method access to the caller\'s variable itself. The ICounter constraint allows calling Inc and lets the JIT make a direct call without a box. With in, Inc would run on a defensive copy and the changes would be lost; with class you could not pass a struct at all.'
    },
    {
      t: 'learn',
      title: 'How the CLR finds an interface method',
      body: '<p>For a class\'s virtual method the slot number in the method table is known in advance: in a derived class the overridden <code>ToString</code> sits where the base one does. The call is a couple of memory reads and an indirect jump.</p><p>That does not work for interfaces. A class implements any number of interfaces, and the same method <code>ICounter.Inc</code> ends up in different slots in different classes. So CoreCLR calls an interface method through a <b>stub</b> with a cache: the call site remembers the type it has seen, and while objects of that type keep arriving, the call is almost as fast as a virtual one.</p><p>It gets more expensive where many different types pass through one call site: then the implementation is looked up in a shared hash table.</p>',
      deep: '<p>The mechanism is called <b>virtual stub dispatch</b> (VSD). The call site goes through an indirection cell, and the runtime rewrites it as it learns more:</p><ul><li><b>lookup stub</b> — the first call: passes the method token and the object type to a shared resolver;</li><li><b>dispatch stub</b> — afterwards: compares the object\'s MethodTable with the remembered one and jumps straight to the implementation, falling through to the resolve stub on a mismatch;</li><li><b>resolve stub</b> — if misses pile up, the call site is treated as polymorphic and switched here: a lookup of the "token + type" pair in a global cache.</li></ul><p>On top of that, the JIT with dynamic PGO (on by default since .NET 8) does guarded devirtualization: if the profile shows one class almost always arrives, the JIT inserts a type check and a direct — and therefore inlinable — call, keeping the stub as the fallback. Native AOT uses its own caching scheme without VSD. The details change between versions, so measure the cost of a specific call site.</p>'
    },
    {
      t: 'choice',
      q: 'Why can an interface method not be called like a virtual one — by a slot number known in advance?',
      options: ['The same interface method sits in different slots in different classes', 'Interface methods do not go into the class\'s method table', 'Structs implement interfaces too, and they have no method table', 'Interface slots are reassigned on every garbage collection'],
      answer: 0,
      explain: 'Virtual method slots are inherited down the class chain, so an override keeps the same number. Each class has its own set of interfaces, and there is no common number for ICounter.Inc — it is looked up by the object\'s type and the result is cached in the stub.',
      wrong: { 1: 'They do: an implicit implementation is a virtual final method with its own slot. The point is that the slot number differs between classes.' }
    },
    {
      t: 'multi',
      q: 'Counter is a struct implementing ICounter; c is a Counter variable; list is a List<int>. Where does boxing happen by the rules of the language and IL? Select all.',
      options: ['ICounter i = c;', 'IEnumerable<int> e = list; foreach (var x in e) { }', 'Bump(ref c), where Bump<T>(ref T x) where T : ICounter', 'int v = c.Value;', 'foreach (var x in list) { }'],
      answer: [0, 1],
      explain: 'Assigning to an interface boxes the struct. Iterating through IEnumerable<int> gets List<int>.Enumerator through the interface — boxed as well. The constrained generic, reading a property of the struct and foreach over the List<int> itself manage without one.'
    },
    {
      t: 'match',
      q: 'Match the construct to what it means',
      pairs: [
        ['void IFoo.Run()', 'Explicit implementation: call only through the interface'],
        ['ICounter i = c', 'Boxing a struct'],
        ['where T : ICounter', 'A call without a box for a value-type T'],
        ['constrained.', 'IL prefix before callvirt in a generic'],
        ['dispatch stub', 'Checks the object type against the remembered one']
      ]
    }
  ]
};

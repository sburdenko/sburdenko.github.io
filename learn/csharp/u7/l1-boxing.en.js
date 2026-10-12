/** Deeper C#, unit "Value types all the way", lesson 1: boxing you cannot see in the code. */
export default {
  id: 'cs.u7.l1',
  title: 'Boxing you cannot see',
  sub: 'Interfaces, GetType, ValueType methods and the constrained call',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Where the compiler emits box without asking',
      body: '<p>The rule from the ".NET inside out" course is simple: a value is boxed when you put it where a reference is expected — into <code>object</code> or an interface. There boxing is visible: <code>object o =</code> is right there on the left.</p><p>It gets harder when the one expecting a reference is not a variable but a <b>method</b>. A method declared in a class (<code>Object</code>, <code>ValueType</code>) receives <code>this</code> as a reference to a heap object. A struct has no such reference, so calling that method needs a box. You do not see it in C# — you see it in IL (<code>box</code>) and in the allocation counter.</p><p>This lesson covers four places where it happens: calls through an interface, <code>GetType</code>, non-overridden <code>ToString</code>/<code>Equals</code>/<code>GetHashCode</code>, and enumerators.</p>'
    },
    {
      t: 'learn',
      title: 'An interface on a struct: three ways to call it',
      body: '<p>A struct can implement an interface, but a box does not always appear. What decides is <b>what you call through</b>:</p><ul><li>through a variable of the struct itself — an ordinary <code>call</code> to its method, no box;</li><li>through a variable of the interface type — the value is boxed first, and the call goes to the box;</li><li>in a generic with a <code>where T : IShape</code> constraint — no box, more on that below.</li></ul><p>If the method is implemented <b>explicitly</b> (<code>double IShape.Area()</code>), you cannot call it through the struct: you have to cast to the interface, and that is boxing.</p>',
      code: 'interface IShape { double Area(); }\n\nstruct Square : IShape\n{\n    public double Side;\n    public double Area() => Side * Side;\n}\n\nvar s = new Square { Side = 2 };\ns.Area();          // call Square::Area — no box\nIShape sh = s;     // box: a copy of s moved to the heap\nsh.Area();         // a call on the box through the interface',
      deep: '<p>The JIT treats struct methods as sealed: a struct has no subclasses, so <code>s.Area()</code> is a direct call and easy to inline. A call through <code>IShape</code> is interface dispatch via the type pointer of the box.</p><p>Explicit implementation hides rarely needed members: that is how <code>int</code> hides the <code>IConvertible</code> methods (<code>ToBoolean</code>, <code>ToChar</code>…). You can still call them, but only through the interface — that is, with boxing, unless the JIT removes it.</p>'
    },
    {
      t: 'multi',
      q: 'Temp is a struct that implements IComparable<Temp> and overrides GetHashCode but not ToString. Where is there boxing? Select all.',
      options: [
        'IComparable<Temp> c = t;',
        't.CompareTo(other);',
        't.ToString();',
        't.GetHashCode();',
        'list.Sort();  // List<Temp>'
      ],
      answer: [0, 2],
      explain: 'An interface variable needs a box. ToString is not overridden — the call goes to ValueType.ToString, which needs a this object. CompareTo and GetHashCode are the struct\'s own — direct calls. List<Temp>.Sort goes through Comparer<Temp>.Default and generic code with no boxes.'
    },
    {
      t: 'learn',
      title: 'Non-overridden ToString, Equals, GetHashCode',
      body: '<p>A struct always has these three methods: the base class <code>System.ValueType</code> provides them. But they are class methods, and they need a <code>this</code> object.</p><p>The compiler emits <code>p.ToString()</code> with a <code>constrained.</code> prefix. At run time the runtime checks: if the <b>struct overrides</b> the method, it calls it directly, no box. If not, it boxes the value and calls the <code>ValueType</code> version.</p><p><code>Equals(object)</code> is worse: the argument is also <code>object</code>, so it is boxed no matter what. And <code>ValueType.Equals</code> itself, as you will see in lesson 3, may go through reflection.</p>',
      code: 'struct P { public int X, Y; }   // nothing overridden\n\nvar a = new P { X = 1 };\nvar b = new P { X = 1 };\na.ToString();    // box a → ValueType.ToString → "P"\na.Equals(b);     // box b (object argument) and box a (this)',
      deep: '<p>The IL for <code>a.ToString()</code>:</p><p><code>ldloca.s a</code><br><code>constrained. P</code><br><code>callvirt instance string System.Object::ToString()</code></p><p>Per ECMA-335 the <code>constrained.</code> prefix works like this: if the type is a value type and implements the method itself — a direct <code>call</code> on the address; if not — <code>box</code> and a virtual call. The JIT decides when it compiles the method, so an overridden <code>ToString</code> on a struct costs nothing beyond the method itself.</p>'
    },
    {
      t: 'choice',
      q: 'P is a struct of two ints that overrides nothing. How many boxes does a.Equals(b) create according to the IL?',
      options: ['2', '0', '1', '3'],
      answer: 0,
      explain: 'The argument b is boxed because the Equals parameter is object. And a itself is boxed because Equals is not overridden and its this must be a ValueType object. Two boxes for one comparison.',
      wrong: {
        1: 'That is only true for a struct that implements Equals(P) — then overload resolution picks it and there are no boxes.',
        2: 'The argument is not the only box: ValueType.Equals is called on an object, so a gets boxed too.'
      }
    },
    {
      t: 'learn',
      title: 'GetType: always through a box',
      body: '<p><code>GetType</code> is a non-virtual <code>Object</code> method: it reads the type pointer from the object (unit "How a type is built"). A struct on the stack has neither a header nor a type pointer. So for <code>s.GetType()</code> the compiler first emits <code>box</code>, then <code>call Object::GetType</code>.</p><p>The struct type is already known at compile time, so instead of <code>s.GetType()</code> it is more honest to write <code>typeof(Square)</code>. In a generic where the type is not known yet — <code>typeof(T)</code>: for value-type <code>T</code> the JIT compiles separate code, and <code>typeof(T)</code> there is just a constant.</p>',
      code: 'Square s = default;\nType t1 = s.GetType();     // IL: box Square; call GetType\nType t2 = typeof(Square);  // IL: ldtoken — no objects',
      deep: '<p>The modern JIT recognizes the <code>box</code> + <code>GetType</code> pair for an exactly known type and often folds it into a constant with no allocation. This is an optimization, not a guarantee: in a debug build and on an older runtime the box will be there. The check <code>value.GetType() == typeof(X)</code> is especially common — the JIT can fold that too.</p>'
    },
    {
      t: 'learn',
      title: 'A call through an interface changes the box, not the original',
      body: '<p>If an interface method <b>modifies</b> the struct, boxing turns from an extra allocation into a logic bug. The box is a copy. The method changes a field inside the box, and the original variable stays as it was.</p><p>An on-the-fly cast is especially sneaky: <code>((ICounter)c).Inc()</code>. A box is created, the counter inside it changes, and the box immediately becomes garbage. The compiler will not warn you.</p>',
      code: 'interface ICounter { void Inc(); int Value { get; } }\n\nstruct Counter : ICounter\n{\n    public int Value { get; private set; }\n    public void Inc() => Value++;\n}'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'var c = new Counter();\nICounter i = c;\ni.Inc();\n((ICounter)c).Inc();\nc.Inc();\nConsole.WriteLine($"{c.Value} {i.Value}");',
      options: ['1 1', '3 3', '2 1', '1 2'],
      answer: 0,
      explain: 'i is its own box with a copy: after i.Inc() it holds 1. ((ICounter)c).Inc() creates another box and changes it — the result is lost. c.Inc() is a direct call on the variable itself: c.Value = 1.',
      wrong: {
        1: 'That is what you would get if Counter were a class: then c, i and the cast would all point to the same object.',
        2: 'Casting to ICounter does not give you a reference to c — it boxes a copy. The change goes into a box nobody keeps.'
      }
    },
    {
      t: 'learn',
      title: 'A constrained generic: an interface without a box',
      body: '<p>For a value-type <code>T</code> the JIT compiles a separate version of the method (unit "Generics"). With <code>where T : ICounter</code> the compiler emits <code>x.Inc()</code> as <code>constrained. T callvirt ICounter::Inc</code>. For <code>T = Counter</code> this becomes a direct call to <code>Counter.Inc</code> on the variable itself — <b>no box</b>.</p><p>Two traps nearby:</p><ul><li>a parameter without <code>ref</code> — the method changes its own copy, not the caller\'s variable;</li><li>a non-generic interface: <code>where T : IComparable</code> does not help, the argument of <code>CompareTo(object)</code> is still boxed. You need <code>IComparable&lt;T&gt;</code>.</li></ul>',
      code: 'static void BumpRef<T>(ref T x) where T : ICounter => x.Inc(); // changes the original\nstatic void Bump<T>(T x) where T : ICounter => x.Inc();         // changes a copy\nstatic void BumpI(ICounter x) => x.Inc();                       // box at the call',
      deep: '<p><code>using</code> and <code>foreach</code> use the same mechanism: the compiler calls <code>Dispose</code> on a struct resource and <code>MoveNext</code> on a struct enumerator without boxing, even though formally these are methods of the <code>IDisposable</code> and <code>IEnumerator&lt;T&gt;</code> interfaces.</p><p>For shared instantiations over reference <code>T</code> the same <code>constrained.</code> simply becomes an ordinary <code>callvirt</code>: one piece of IL works for both cases.</p>'
    },
    {
      t: 'blanks',
      q: 'Fill in the constraint so that Max<int> compares without boxing',
      code: 'static T Max<T>(T a, T b) where T : ___\n    => a.CompareTo(b) >= 0 ? a : b;',
      tiles: ['IComparable<T>', 'IComparable', 'struct', 'IEquatable<T>'],
      answer: ['IComparable<T>'],
      explain: 'With IComparable<T>, CompareTo(T) is called: a constrained call on a and an argument b of type T — not a single box. With the non-generic IComparable the code also compiles, but b goes into CompareTo(object) and is boxed on every comparison.'
    },
    {
      t: 'match',
      q: 'Match each expression with what happens in it. list is a List<int>.',
      pairs: [
        ['foreach (var x in list)', 'A struct enumerator, no heap'],
        ['foreach (var x in (IEnumerable<int>)list)', 'The enumerator is boxed on the heap'],
        ['x.CompareTo(y) with where T : IComparable<T>', 'A constrained call with no box'],
        ['p.ToString() on a struct without override', 'A box for the sake of ValueType.ToString'],
        ['flags.HasFlag(Opt.A) in .NET 8', 'A JIT intrinsic, no boxes']
      ]
    },
    {
      t: 'learn',
      title: 'Then and now: the JIT removes some boxes',
      body: '<p>A <code>box</code> in IL does not yet mean an object on the heap. Over time the JIT has learned to remove common cases:</p><ul><li><code>Enum.HasFlag</code> in .NET Framework boxed both the value and the argument. Since .NET Core 2.1 it is a JIT intrinsic — one bitwise operation;</li><li>the JIT shortens a <code>box</code> that is immediately followed by unboxing or a type check;</li><li>in .NET 9–10 the "object does not leave the method" analysis (escape analysis) was extended to boxes: in some cases the box lives on the stack or disappears.</li></ul><p>Hence the rule: judge boxes in hot code <b>by measurement</b>, not by IL. And the other way round: no visible <code>object</code> in the code does not mean there are no boxes.</p>',
      deep: '<p>Measuring without a profiler: <code>GC.GetAllocatedBytesForCurrentThread()</code> before and after the loop. In BenchmarkDotNet — the <code>[MemoryDiagnoser]</code> attribute, the Allocated column. JIT optimizations work in Release and after tier-up (tiered compilation), so measure after warm-up and not in Debug.</p>'
    },
    {
      t: 'choice',
      q: 'You need to find out whether a hot loop boxes values on .NET 9. What is more reliable?',
      options: [
        'Measure allocated memory in Release after warm-up',
        'Find every box instruction in the IL',
        'Search the C# code for casts to object',
        'Run it in Debug under a debugger and inspect the heap'
      ],
      answer: 0,
      explain: 'IL shows where a box may be, but the JIT removes some of them. Many boxes are not visible in C# code at all. Debug disables optimizations and will show boxes that do not exist in Release. Only measuring allocations in the real configuration settles it.',
      wrong: { 1: 'box in IL is an upper bound. After JIT optimizations there may be fewer real allocations.' }
    }
  ]
};

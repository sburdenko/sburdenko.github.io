/** Deeper C#, unit "How a type is built", lesson 2: casts. */
export default {
  id: 'cs.u6.l2',
  title: 'Casts: is, as and patterns',
  sub: 'How the CLR checks a type, why (long)(object)42 fails and where operators stay silent',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Up is free, down is checked',
      body: '<p>A cast to a base type or an interface is <b>implicit</b>: the compiler already knows a Manager is an Employee. Nothing happens at run time; the reference stays the same.</p><p>Going back down to a derived type takes an <b>explicit</b> cast in parentheses. The compiler does not know what really sits in the variable, so it inserts a check that runs at run time.</p><p>The same parentheses do different things: for numbers, <code>(int)3.9</code> is a <b>conversion</b> of the value (you get 3); for references, it is only a <b>check</b> of the type, and the object does not change.</p>',
      code: 'class Employee { }\nclass Manager : Employee { }\n\nEmployee e = new Manager();   // implicit, no check\nobject o = e;                 // implicit\nManager m = (Manager)o;       // explicit: checked at run time'
    },
    {
      t: 'learn',
      title: 'How the CLR checks a cast',
      body: '<p>For <code>(Manager)o</code> the compiler emits the IL instruction <code>castclass</code>. At run time the CLR reads the <b>type pointer</b> from the object and compares it with Manager. No match — it walks up the parent chain, and for an interface, through the type\'s list of interfaces. Found — the cast succeeds. Not found — <code>InvalidCastException</code>.</p><p>An important detail: <code>null</code> passes any cast to a reference type. There is nothing to check, so there is no exception.</p>',
      flow: ['(Manager)o', 'castclass', 'the object\'s type pointer', 'parents and interfaces', 'reference or InvalidCastException'],
      deep: '<p>In modern .NET this logic lives in managed code (the <code>CastHelpers</code> class in the runtime) and uses a cache of cast results. A cast to a <code>sealed</code> class is often reduced by the JIT to a single pointer comparison: there are no subclasses, so the type must match exactly. A cast to an interface or to a class deep in a hierarchy costs more. These are nanoseconds, but in a hot loop over millions of objects the difference shows up in a profiler.</p>'
    },
    {
      t: 'tapline',
      q: 'Manager derives from Employee. Which line throws InvalidCastException?',
      code: 'object o = new Employee();\nEmployee e = (Employee)o;\nobject n = null;\nManager m1 = (Manager)n;\nManager m2 = (Manager)o;',
      answer: 4,
      explain: 'o holds an Employee, not a Manager: a parent does not become a subclass. The null line passes: casting null to a reference type always succeeds.'
    },
    {
      t: 'learn',
      title: 'is, as and patterns',
      body: '<p><code>is</code> and <code>as</code> compile to the IL instruction <code>isinst</code>: the same check, but without an exception. <code>is</code> returns a bool, <code>as</code> returns the reference or null.</p><p>Older code often checks the type twice: first with <code>is</code>, then with a cast. The pattern <code>is Manager m</code> does one check and hands you a variable of the right type straight away.</p>',
      code: '// two type checks\nif (o is Manager) { var m = (Manager)o; m.Approve(); }\n\n// one check\nvar m2 = o as Manager;\nif (m2 != null) m2.Approve();\n\n// one check, the modern way\nif (o is Manager m3) m3.Approve();'
    },
    {
      t: 'match',
      q: 'Match the expression to what happens when o is not a Manager',
      pairs: [
        ['(Manager)o', 'InvalidCastException'],
        ['o as Manager', 'Returns null'],
        ['o is Manager', 'Returns false'],
        ['o is Manager m', 'false, m is not assigned']
      ]
    },
    {
      t: 'choice',
      q: 'Why does int n = o as int; not compile?',
      options: ['as returns null on failure, and an int cannot be null', 'as only works with interfaces', 'An int cannot be taken out of an object', 'You have to write as Int32'],
      answer: 0,
      explain: 'For value types write o as int? or, better, o is int n: the check and the unboxing in one step.'
    },
    {
      t: 'learn',
      title: 'is null and is not null',
      body: '<p>A class can overload <code>==</code> — and then <code>x == null</code> calls its code, which may be wrong or slow. The patterns <code>is null</code> and <code>is not null</code> <b>never call</b> overloaded operators: the compiler compares the reference itself with null.</p>',
      code: 'class Weird\n{\n    public static bool operator ==(Weird? a, Weird? b) => true;\n    public static bool operator !=(Weird? a, Weird? b) => false;\n}\n\nWeird w = new();\nConsole.WriteLine(w == null);   // True — the operator said so\nConsole.WriteLine(w is null);   // False — an honest check'
    },
    {
      t: 'learn',
      title: 'Unboxing: the exact type only',
      body: '<p>A boxed int is a heap object whose type pointer says "Int32". Unboxing (IL <code>unbox</code>) checks that the box holds <b>exactly</b> the requested type and copies the value. It does no numeric conversion at all.</p><p>That is why <code>(long)(object)42</code> fails with <code>InvalidCastException</code>, even though <code>(long)42</code> works. Unbox to the exact type first, then convert.</p>',
      code: 'object o = 42;          // the box holds Int32\nlong a = (long)o;       // InvalidCastException\nlong b = (long)(int)o;  // unbox the int, then widen\nint c = (int)(object)null!; // NullReferenceException',
      deep: '<p>The "exactly the same type" rule has exceptions. An enum and its underlying integer type unbox into each other: <code>(DayOfWeek)(object)1</code> works. A boxed <code>int</code> can be unboxed into <code>int?</code>, and a boxed <code>int?</code> does not exist at all: boxing turns a Nullable into either a box with an int or null. Unboxing null into <code>int</code> gives a <code>NullReferenceException</code>, into <code>int?</code> simply null.</p>'
    },
    {
      t: 'choice',
      q: 'object o = 42; Which expression runs without an exception?',
      options: ['(long)(int)o', '(long)o', '(short)o', '(double)o'],
      answer: 0,
      explain: 'The box can only be unboxed into Int32. After that, (long) is an ordinary widening numeric conversion.'
    },
    {
      t: 'learn',
      title: 'Conversion operators are invisible through object',
      body: '<p>A user-defined <code>explicit operator</code> is a static method. The compiler picks it based on <b>static</b> types: from Celsius to Fahrenheit, it calls the operator. But if the value sits in an <code>object</code>, the compiler sees "object → Fahrenheit" and emits a plain unbox. At run time the box holds a Celsius, not a Fahrenheit — <code>InvalidCastException</code>.</p><p>The same scenario breaks code during a refactoring: a parameter changes from <code>Celsius</code> to <code>object</code>, everything compiles, and the cast starts failing.</p>',
      code: 'var c = new Celsius(100);\nvar f1 = (Fahrenheit)c;          // operator: 212\nobject o = c;\nvar f2 = (Fahrenheit)o;          // InvalidCastException\n\nreadonly record struct Celsius(double V);\nreadonly record struct Fahrenheit(double V)\n{\n    public static explicit operator Fahrenheit(Celsius c) => new(c.V * 9 / 5 + 32);\n}'
    },
    {
      t: 'multi',
      q: 'Which lines throw InvalidCastException? Select all.',
      options: ['object o = "hi"; int n = (int)o;', 'object o = 42; long l = (long)o;', 'object o = null; string s = (string)o;', 'object o = new Celsius(5); var f = (Fahrenheit)o;', 'object o = 42; int n = (int)o;'],
      answer: [0, 1, 3],
      explain: 'A string is not an int; unboxing needs the exact type; a conversion operator is not called through object. null passes a cast to string, and an int unboxes fine from a box holding an int.'
    },
    {
      t: 'blanks',
      q: 'Complete the pattern checks',
      code: 'if (o is ___ m) m.Approve();\n\nif (input is not ___) Use(input);',
      tiles: ['Manager', 'null', 'as', 'default', 'object'],
      answer: ['Manager', 'null'],
      explain: 'is Manager m is a type check and a variable in one step. is not null checks the reference without any overloaded !=.'
    }
  ]
};

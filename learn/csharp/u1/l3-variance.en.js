/** Deeper C#, unit 1, lesson 3: variance and generic math. */
export default {
  id: 'cs.u1.l3',
  title: 'Variance and generic math',
  sub: 'out T, in T and INumber<T>',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Why List<string> is not a List<object>',
      body: '<p>If that assignment were allowed, you could put a number into a list of strings through the "list of objects" — and break it.</p>',
      code: 'List<object> objs = new List<string>();   // compile error\nobjs.Add(42);                              // and this is why'
    },
    {
      t: 'learn',
      title: 'Covariance: out T',
      body: '<p><code>IEnumerable&lt;T&gt;</code>, on the other hand, only <b>hands out</b> T and never takes one in. So a sequence of strings can safely be treated as a sequence of objects. That is marked with <code>out</code>: <code>IEnumerable&lt;out T&gt;</code>.</p>',
      code: 'IEnumerable<object> objs = new List<string> { "a", "b" };   // allowed'
    },
    {
      t: 'learn',
      title: 'Contravariance: in T',
      body: '<p><code>Action&lt;in T&gt;</code> only <b>takes in</b> T. An action that can print any object also works where an action for string is expected.</p>',
      code: 'Action<object> print = o => Console.WriteLine(o);\nAction<string> printText = print;   // allowed'
    },
    {
      t: 'choice',
      q: 'Which assignment compiles?',
      options: ['IEnumerable<object> x = new List<string>();', 'List<object> x = new List<string>();', 'IList<object> x = new List<string>();'],
      answer: 0,
      explain: 'IList takes elements in (Add), so it is invariant.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IEnumerable<out T>', 'Covariant: only hands out'],
        ['Action<in T>', 'Contravariant: only takes in'],
        ['List<T>', 'Invariant'],
        ['Func<in T, out R>', 'Takes T, hands out R']
      ]
    },
    {
      t: 'learn',
      title: 'The array trap',
      body: '<p>Arrays have been covariant since .NET 1.0 — before generics existed. The compiler lets this through, and it fails at run time:</p>',
      code: 'object[] arr = new string[2];\narr[0] = 42;   // ArrayTypeMismatchException'
    },
    {
      t: 'learn',
      title: 'Generic math (C# 11, .NET 7)',
      body: '<p>You used to be unable to write Sum&lt;T&gt; for any number type: T has no + operator. Now interfaces can require <b>static</b> members, and <code>INumber&lt;T&gt;</code> gives you +, −, Zero and the rest.</p>',
      code: 'T Sum<T>(T[] xs) where T : INumber<T>\n{\n    T total = T.Zero;\n    foreach (var x in xs) total += x;\n    return total;\n}\n\nSum(new[] { 1, 2, 3 });        // int\nSum(new[] { 1.5, 2.5 });       // double'
    },
    {
      t: 'blanks',
      q: 'A sum for any number type',
      code: 'T Sum<T>(T[] xs) where T : ___<T>\n{\n    T total = T.___;',
      tiles: ['INumber', 'Zero', 'IComparable', 'Default', 'IEquatable'],
      answer: ['INumber', 'Zero'],
      explain: 'Zero is a static property from the interface, so you write T.Zero.'
    },
    {
      t: 'choice',
      q: 'Why does the compiler accept object[] arr = new string[2], even though it is risky?',
      options: ['Array covariance stayed from .NET 1.0 for compatibility; the check happens at run time', 'It is safe', 'It is a compile error'],
      answer: 0,
      explain: 'Generic interfaces made variance safe, but arrays stayed as they were.'
    }
  ]
};

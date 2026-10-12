/** Final of the "Interfaces" unit, Deeper C#. */
export default {
  id: 'cs.u10.boss',
  title: 'Final: interfaces',
  sub: 'Boxing, default methods and version 2',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Counter is a struct with a public Inc() method that increments Value. What does this print?',
      code: 'var c = new Counter();\nICounter i = c;\nc.Inc();\ni.Inc();\ni.Inc();\nConsole.WriteLine(c.Value + i.Value);',
      options: ['3', '4', '2', '6'],
      answer: 0,
      explain: 'The box was created while c was 0. After that two independent copies live on: c grew to 1, the box to 2. The sum is 3.',
      wrong: { 1: 'That would be true if i referred to the variable c itself. But the interface holds a box with a copy.' }
    },
    {
      t: 'tapline',
      q: 'Which line does not compile?',
      code: 'class Cache : IDisposable, IAsyncDisposable\n{\n    void IDisposable.Dispose() { }\n    public ValueTask DisposeAsync() => ValueTask.CompletedTask;\n}\n\nvar cache = new Cache();\nawait cache.DisposeAsync();\nusing (cache) { }\ncache.Dispose();',
      answer: 9,
      explain: 'Dispose is implemented explicitly and is not visible through a Cache variable. using works because it calls Dispose through IDisposable. DisposeAsync is an ordinary public method.'
    },
    {
      t: 'multi',
      q: 'S is a struct implementing IComparable<S>; s and t are variables of type S. What boxes s? Select all.',
      options: ['IComparable<S> x = s;', 'Max(s, t), where Max<T>(T a, T b) where T : IComparable<T>', 'object o = s;', 's.CompareTo(t)'],
      answer: [0, 2],
      explain: 'Converting to an interface or to object is always a box. In a constrained generic the JIT makes a separate copy for S and calls CompareTo directly. s.CompareTo(t) is a direct call to the struct\'s method.'
    },
    {
      t: 'choice',
      q: 'You added a method without a body to a public interface. What will a team see when it rebuilds its implementation against the new version?',
      options: ['Error CS0535: interface member not implemented', 'TypeLoadException at startup', 'A warning, and the method will be empty', 'Nothing: the method gets a default body'],
      answer: 0,
      explain: 'A rebuild means the compiler, and it demands an implementation. TypeLoadException is for those who did not rebuild and just dropped in the new library. A default body appears only if you write it in the interface.'
    },
    {
      t: 'blanks',
      q: 'Add a method to the interface that does not break old implementations',
      code: 'public interface IExporter\n{\n    void Export(Report r);\n\n    void ExportAll(IEnumerable<Report> rs)\n    ___\n        foreach (var r in rs) ___(r);\n    }\n}',
      tiles: ['{', 'Export', 'abstract', 'base.Export', ';'],
      answer: ['{', 'Export'],
      explain: 'A body in braces makes it a default method. Inside it can use only other interface members — here Export. There is no base.Export in an interface.'
    },
    {
      t: 'match',
      q: 'Match',
      pairs: [
        ['void IFoo.Run()', 'Called only through the interface'],
        ['Interface method with a body', 'Does not break old implementations'],
        ['static abstract', 'Called through T, no object'],
        ['constrained. !!T', 'No boxing for a value-type T'],
        ['Abstract base class', 'State and protected members']
      ]
    },
    {
      t: 'choice',
      q: 'ICommand<TSelf> contains static abstract TSelf Parse(string). Why does List<ICommand<Move>> not compile?',
      options: ['The interface has no body for static abstract members, and a type argument could reach a T.Parse call', 'Interfaces can never be type arguments', 'ICommand<Move> is a value type', 'A record cannot appear in type arguments'],
      answer: 0,
      explain: 'The rule is general (CS8920): if an interface has a static abstract member without a most specific implementation, the interface itself cannot be a type argument — otherwise T.Parse would have to be called on a "type" with no body. Ordinary interfaces, as in List<IDisposable>, are fine.'
    },
    {
      t: 'order',
      q: 'What happens to an interface call site in CoreCLR as the program runs? Put it in order',
      items: ['The call cell points to the lookup stub', 'The resolver finds the implementation for the incoming type', 'The cell is switched to a dispatch stub for that type', 'Different types start arriving, misses pile up', 'The cell is switched to the resolve stub with a shared cache'],
      explain: 'First a lookup through the shared resolver, then a fast check against one remembered type, and only if the site turns out polymorphic — a lookup in the global cache by the "method + type" pair.'
    }
  ]
};

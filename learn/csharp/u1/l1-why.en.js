/** Deeper C#, unit 1, lesson 1: why generics. */
export default {
  id: 'cs.u1.l1',
  title: 'Why generics',
  sub: 'One piece of code for many types — no object, no casts',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Life before generics',
      body: '<p>In .NET 1.0, collections stored <code>object</code>. You could put anything in, but getting it out took a cast. Make a mistake and you found out at run time.</p>',
      code: 'var list = new ArrayList();\nlist.Add(42);           // int is boxed into object\nlist.Add("forty-two");  // a string is fine too\nint x = (int)list[1];   // InvalidCastException at run time'
    },
    {
      t: 'tapline',
      q: 'Which line fails at run time?',
      code: 'var list = new ArrayList();\nlist.Add(42);\nlist.Add("forty-two");\nint x = (int)list[1];',
      answer: 3,
      explain: 'The second element is a string, and the cast to int is only checked at run time.'
    },
    {
      t: 'learn',
      title: 'List<T>: the type is a parameter',
      body: '<p>A generic is code with a type parameter <code>T</code>. The compiler plugs in a concrete type and checks everything up front. Value types are not boxed: <code>List&lt;int&gt;</code> stores real ints.</p>',
      code: 'var list = new List<int>();\nlist.Add(42);\nlist.Add("forty-two");   // compile error\nint x = list[0];         // no cast'
    },
    {
      t: 'rig', rig: 'generics',
      task: 'Max must compare a and b and work with both int and string. Add the constraint it needs.',
      sig: 'T Max<T>(T a, T b)', ops: ['cmp'],
      goal: { allow: ['int', 'string'] },
      solve: ['c:cmp']
    },
    {
      t: 'choice',
      q: 'Why can\'t you call a.CompareTo(b) without a constraint?',
      options: ['Nothing is known about T — an arbitrary type may not have CompareTo', 'CompareTo is banned in generics', 'You have to cast to object first'],
      answer: 0,
      explain: 'A constraint is a promise to the compiler: "T has this."'
    },
    {
      t: 'learn',
      title: 'How the JIT compiles generics',
      body: '<p>For all reference types the JIT emits <b>one shared</b> piece of machine code: a reference is always 8 bytes. Each value type gets <b>its own</b>: <code>List&lt;int&gt;</code> and <code>List&lt;double&gt;</code> each get separate, fast code with no boxing.</p>'
    },
    {
      t: 'choice',
      q: 'How many machine-code versions of Add do List<string>, List<object> and List<int> get?',
      options: ['Two: one shared by string and object, one for int', 'Three', 'One'],
      answer: 0,
      explain: 'Reference types share code; value types get their own.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['ArrayList', 'Stores object, needs casts'],
        ['List<int>', 'Stores ints without boxing'],
        ['T', 'Type parameter'],
        ['where T : …', 'Constraint on T']
      ]
    },
    {
      t: 'multi',
      q: 'What do generics give you? Select all.',
      options: ['Type errors at compile time', 'No boxing of value types', 'No casts when reading', 'Code that runs without the JIT'],
      answer: [0, 1, 2],
      explain: 'The JIT still compiles the code — just for specific types.'
    }
  ]
};

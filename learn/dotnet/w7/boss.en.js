/** .NET inside out, final of the unit "Generics and reflection inside out". */
export default {
  id: 'dotnet.w7.boss',
  title: 'Final: generics and reflection inside out',
  sub: '__Canon, dictionaries, tokens, Invoke, call sites and generators',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'The method Echo<T>(T x) is called with int, double, string and Uri. How many machine code versions will the JIT produce (ignoring tiered recompilation)?',
      options: ['3', '4', '2', '1'],
      answer: 0,
      explain: 'Echo<int> and Echo<double> get a copy each, while string and Uri share the canonical Echo<__Canon>. Three in total.',
      wrong: { 1: 'string and Uri are reference types, so both use the same code: Echo<__Canon>.' }
    },
    {
      t: 'tapline',
      q: 'Which line prints False?',
      code: 'class Cache<T>\n{\n    public static readonly Guid Id = Guid.NewGuid();\n}\n\nvar a = Cache<string>.Id;\nvar b = Cache<object>.Id;\nvar c = Cache<string>.Id;\nConsole.WriteLine(a == c);\nConsole.WriteLine(a == b);',
      answer: 9,
      explain: 'Cache<string> and Cache<object> run shared code, but each has its own statics block and its own static constructor. So their Guids differ. Two reads of Cache<string>.Id give the same value.'
    },
    {
      t: 'multi',
      q: 'T is a reference type and the code is shared (__Canon). Which operations inside the method need a generic dictionary lookup? Select all.',
      options: ['new List<T>()', 'o is T', 'return default(T);', 'typeof(T)', 'if (x == null)'],
      answer: [0, 1, 3],
      explain: 'Creating a List<T>, checking a type and getting a Type all require the exact T. default(T) for a reference T is just null, and a null check does not depend on the type.'
    },
    {
      t: 'choice',
      q: 'Version 2 of a library changed void Log(string s) into void Log(string s, int level = 0). The old app was not rebuilt. What happens on Log("hi")?',
      options: ['MissingMethodException: the app MemberRef has a one-parameter signature', 'It works: level becomes 0', 'A warning at startup, then the call goes through', 'The runtime picks the nearest overload by name'],
      answer: 0,
      explain: 'A MemberRef token stores the name and the full signature. The new assembly has no Log(string), and the default value is inserted by the compiler of the calling code, which the old app never saw.',
      wrong: { 1: 'The value 0 would have been inserted by the compiler when building the app. The app was built against the old version, and its IL calls a one-parameter method.' }
    },
    {
      t: 'order',
      q: 'Order the ways to call a method from fastest to slowest (in general, for a method with int parameters)',
      items: ['A direct call', 'A delegate from CreateDelegate', 'MethodInvoker.Invoke (.NET 8)', 'MethodInfo.Invoke with a cached MethodInfo', 'GetMethod by name and Invoke on every call'],
      explain: 'A direct call can be inlined. A delegate is an indirect call without checks. MethodInvoker saves the array but boxes the arguments. Invoke also allocates the array. A lookup by name each time adds reflection cache work on top.'
    },
    {
      t: 'match',
      q: 'Match each part of dynamic with its role',
      pairs: [
        ['L0', 'The rule inside the site.Target delegate'],
        ['L1', 'Up to 10 recent rules of this call site'],
        ['L2', 'The binder shared rule cache'],
        ['Binder', 'Analyzes the call by C# rules at run time'],
        ['CallSite<T>', 'An object in a hidden static field per operation']
      ]
    },
    {
      t: 'multi',
      q: 'What is true about source generators and Native AOT? Select all.',
      options: ['A generator only adds code; it cannot change existing code', 'The JSON generator removes reflection-based type inspection at startup', 'In Native AOT, MakeGenericType with a struct not seen at compile time may fail', 'A generator runs the first time a method is called'],
      answer: [0, 1, 2],
      explain: 'A generator runs inside the compiler and only adds files, which is why it relies on partial. Without a JIT there is nobody to create a code copy for a new value T.'
    },
    {
      t: 'blanks',
      q: 'Reach the private field _count without reflection (.NET 8)',
      code: 'class Counter { private int _count; }\n\n[___(UnsafeAccessorKind.Field, Name = "_count")]\nstatic ___ ref int CountOf(Counter c);',
      tiles: ['UnsafeAccessor', 'extern', 'DllImport', 'abstract', 'partial'],
      answer: ['UnsafeAccessor', 'extern'],
      explain: 'For a static extern method marked [UnsafeAccessor], the runtime substitutes direct field access at JIT time: no MethodInfo, no boxing, and it works in Native AOT.'
    }
  ]
};

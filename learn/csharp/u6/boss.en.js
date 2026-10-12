/** Final of the "Inside a type" unit of the "Deeper C#" course. */
export default {
  id: 'cs.u6.boss',
  title: 'Final: inside a type',
  sub: 'Objects on the heap, casts, primitives and dynamic',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'multi',
      q: 'An object on the heap of a 64-bit process. Which are true? Select all.',
      options: [
        'The reference in a variable points at the word holding the type pointer (MethodTable)',
        'The object header sits 8 bytes before that word',
        'A boxed int takes 24 bytes on the heap',
        'A struct in a local variable also has a header and a type pointer',
        'GetType reads the type from the object header'
      ],
      answer: [0, 1, 2],
      explain: 'A boxed int is an ordinary object: an 8-byte header, an 8-byte type pointer and 4 bytes of value, padded up to the 24-byte minimum. A struct outside a box has no overhead words. GetType reads the type pointer; the header holds bits for lock and the hash code.'
    },
    {
      t: 'choice',
      q: 'Equals compares fields, and GetHashCode returns 0 for every object. What happens to a dictionary that uses these objects as keys?',
      code: 'public override bool Equals(object? o) =>\n    o is Point p && p.X == X && p.Y == Y;\n\npublic override int GetHashCode() => 0;',
      options: [
        'Keys are found, but they all land in one bucket and lookups become linear',
        'The contract is broken: the dictionary starts losing keys',
        'It will not compile: CS0659',
        'Nothing changes: the hash only affects Equals'
      ],
      answer: 0,
      explain: 'The contract demands one thing: equal objects produce equal hashes. Zero for everyone satisfies it. But there is a single bucket for all keys, and every lookup compares the key with each element via Equals — O(n) instead of O(1).',
      wrong: { 1: 'A key gets lost when equal objects produce different hashes. Here the hashes are always equal.', 2: 'CS0659 warns that GetHashCode is not overridden at all. Here it is.' }
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'int? x = 5;\nConsole.WriteLine(x.GetType());',
      options: ['System.Int32', 'System.Nullable`1[System.Int32]', 'System.Object', 'It throws NullReferenceException'],
      answer: 0,
      explain: 'GetType is non-virtual and defined on object, so the int? is boxed first. A boxed int? that has a value is a box with a plain int. If x were null, boxing would produce null and the call would throw NullReferenceException.'
    },
    {
      t: 'tapline',
      q: 'Which line throws InvalidCastException?',
      code: 'object o = (short)7;\nint a = (short)o;\nint b = (int)o;\nDayOfWeek d = (DayOfWeek)(object)1;\nstring? s = o as string;',
      answer: 2,
      explain: 'The box holds an Int16. (short)o unboxes the exact type, then short widens to int implicitly. (int)o tries to unbox an Int32 from a box holding an Int16 — exception. An enum and its underlying type unbox into each other, and as returns null on failure.'
    },
    {
      t: 'match',
      q: 'Match the IL instruction to the C# expression it comes from',
      pairs: [
        ['castclass', '(Manager)o'],
        ['isinst', 'o as Manager'],
        ['unbox.any', '(int)o, where o is an object'],
        ['add.ovf', 'checked(a + b) for int'],
        ['call op_Addition', 'a + b for decimal']
      ]
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'object a = 1;\nobject b = 1;\nConsole.WriteLine(a == b);\nConsole.WriteLine(a.Equals(b));',
      options: ['False and True', 'True and True', 'False and False', 'True and False'],
      answer: 0,
      explain: 'Each 1 is boxed into its own box. == on two objects compares references, and the boxes are different. Equals is virtual: Int32.Equals runs and compares the values.'
    },
    {
      t: 'choice',
      q: 'A project with default settings. What does this code print?',
      code: 'checked\n{\n    int r = Add(int.MaxValue, 1);\n    Console.WriteLine(r);\n}\n\nstatic int Add(int a, int b) => a + b;',
      options: ['-2147483648', 'It throws OverflowException', '2147483648', 'It will not compile: CS0220'],
      answer: 0,
      explain: 'checked only affects code written inside the block. The addition is in Add, and Add is compiled in the project context — unchecked, a plain add instruction with no check.',
      wrong: { 1: 'checked does not extend into called methods: Add contains a plain add instruction.', 3: 'CS0220 is for constant expressions. A method call is not a constant.' }
    },
    {
      t: 'blanks',
      q: 'You want an exception instead of dropping the high bits, and then a type check plus unboxing in one step',
      code: 'long big = 5_000_000_000;\nint n = ___((int)big);\n\nif (o ___ int i) Use(i);',
      tiles: ['checked', 'unchecked', 'is', 'as', 'default'],
      answer: ['checked', 'is'],
      explain: 'checked turns the narrowing into conv.ovf, which throws OverflowException. The pattern is int i checks that the box holds exactly an Int32 and unboxes it. as does not work with int: on failure it has nothing to return.'
    },
    {
      t: 'choice',
      q: 'What is the compile-time type of n?',
      code: 'dynamic d = new List<int> { 1, 2 };\nvar n = d.Count;',
      options: ['dynamic', 'int', 'object', 'It will not compile: dynamic has no Count'],
      answer: 0,
      explain: 'The result of an operation on dynamic is dynamic too: the compiler does not know what Count returns. So n.Foo() compiles and fails only at run time. To get compiler checks back, write the type explicitly: int n = d.Count.'
    }
  ]
};

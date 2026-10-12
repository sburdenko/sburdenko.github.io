/** Final of the "Parameters, properties, tuples" unit of the "Deeper C#" course. */
export default {
  id: 'cs.u9.boss',
  title: 'Final: parameters and tuples',
  sub: 'ref, defaults, params, properties and ValueTuple',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Why can you not declare void M(ref int x) next to void M(in int x)?',
      options: [
        'In IL both parameters are int32&, so the signatures collide',
        'in and ref cannot be used in the same class',
        'The compiler could not choose: the modifier is optional at the call site',
        'The CLR forbids two methods with the same name'
      ],
      answer: 0,
      explain: 'ref, out, in and ref readonly are one managed pointer; only flags and attributes differ. You cannot overload on them, while the pair M(int) and M(in int) is legal.',
      wrong: { 3: 'Overloading on different parameter types is normal for the CLR. The problem is that the types here are the same.' }
    },
    {
      t: 'tapline',
      q: 'Which line will not compile?',
      code: 'int[] arr = [1, 2, 3];\nref int r = ref arr[0];\nref readonly int ro = ref arr[1];\nr = 10;\nro = 20;\nint copy = ro;',
      answer: 4,
      explain: 'ref readonly is a read-only reference: you cannot assign through it. r is an ordinary ref local, r = 10 changes arr[0]. Reading ro into a copy is fine.'
    },
    {
      t: 'choice',
      q: 'Library v1: Connect(int timeout = 30). In v2: Connect(int timeout = 30, bool tls = true). The app was built against v1, the DLL was replaced. What happens on the call Connect()?',
      options: [
        'MissingMethodException: Connect(int32) is gone',
        'A call with timeout = 30 and tls = true',
        'A call with timeout = 30 and tls = false',
        'A compile error in the app'
      ],
      answer: 0,
      explain: 'An added optional parameter changes the signature. The old IL looks for Connect(int32) and does not find it. Default values are inserted by the caller at compile time, and the app was not rebuilt. The fix is an overload with the old signature.'
    },
    {
      t: 'match',
      q: 'Match the C# construct to what it leaves in metadata',
      pairs: [
        ['The property Age', 'Methods get_Age and set_Age'],
        ['The indexer this[int]', 'get_Item and DefaultMember("Item")'],
        ['An init accessor', 'modreq(IsExternalInit)'],
        ['A ref readonly parameter', 'RequiresLocationAttribute'],
        ['Tuple element names', 'TupleElementNames']
      ]
    },
    {
      t: 'multi',
      q: 'What is true about (int X, int Y)? Select all.',
      options: [
        'It is the mutable struct ValueTuple<int, int>',
        'At run time it has fields Item1 and Item2',
        '(X: 1, Y: 2) == (A: 1, B: 2) gives True',
        'It is the System.Tuple class on the heap',
        'Reflection sees fields X and Y'
      ],
      answer: [0, 1, 2],
      explain: 'The names live only in the compiler and the TupleElementNames attribute. The == comparison is element-wise and ignores names. System.Tuple is a different, older class type.'
    },
    {
      t: 'choice',
      q: 'There are Join(params string[]) and Join(params ReadOnlySpan<string>). Which overloads do Join("a", "b") and Join(arr), where arr is a string[], pick?',
      options: [
        'The first — span, the second — array',
        'Both — span',
        'Both — array',
        'The first — array, the second — span'
      ],
      answer: 0,
      explain: 'Join("a", "b") fits both only in expanded form — then the span wins (C# 13). Join(arr) fits both in normal form, and the exact string[] match beats converting the array to a span.'
    },
    {
      t: 'blanks',
      q: 'The method hands out a reference to the first element, and the caller writes through it',
      code: 'static ___ int First(int[] a) => ___ a[0];\n\n___ int f = ref First(arr);\nf = 42;   // arr[0] == 42',
      tiles: ['ref', 'ref', 'ref', 'in', 'out', 'readonly'],
      answer: ['ref', 'ref', 'ref'],
      explain: 'ref in the return type, ref in the return, and a ref local in the caller. Without ref on the left, f would be a copy and arr would not change.'
    },
    {
      t: 'choice',
      q: 'A C# 10 project calls new Order() from a library where Order has a required member. What happens?',
      options: [
        'A compile error: the constructor is marked Obsolete as an error',
        'It compiles, Customer stays null',
        'It compiles and throws at run time',
        'It compiles with a warning'
      ],
      answer: 0,
      explain: 'The compiler marks the constructors of a type with required members with Obsolete (as an error) and CompilerFeatureRequired. An old compiler does not understand required, but it does understand Obsolete — and will not let you create the object around the check.'
    },
    {
      t: 'choice',
      q: 'What is new Temp().C?',
      code: 'class Temp\n{\n    public int C { get; set => field = Math.Max(value, -273); } = -500;\n}',
      options: ['-500', '-273', '0', 'Does not compile'],
      answer: 0,
      explain: 'A property initializer writes straight into the hidden field (field), the setter is not called. The check runs only on an assignment C = ....'
    }
  ]
};

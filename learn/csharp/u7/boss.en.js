/** Final of the "Value types all the way" unit of the "Deeper C#" course. */
export default {
  id: 'cs.u7.boss',
  title: 'Final: value types',
  sub: 'Hidden boxes, copies and equality',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Counter is a mutable struct implementing ICounter with an Inc method. What does this code print?',
      code: 'var arr = new Counter[1];\n((ICounter)arr[0]).Inc();\narr[0].Inc();\nICounter i = arr[0];\ni.Inc();\nConsole.WriteLine(arr[0].Value);',
      options: ['1', '0', '2', '3'],
      answer: 0,
      explain: 'The first cast boxes a copy of the element — the change is lost. arr[0].Inc() changes the array element itself: 1. ICounter i = arr[0] boxes a copy holding 1, i.Inc() takes the box to 2, and the element stays at 1.',
      wrong: { 2: 'i is a box with a copy of the element. Changing it never reaches the array.' }
    },
    {
      t: 'multi',
      q: 'S is a struct with no overrides that implements IDisposable and IComparable<S>. Where is there boxing, unless the JIT removes it? Select all.',
      options: [
        's.GetType();',
        's.Equals(other);',
        'using (s) { }',
        'Max(s, other);  // where T : IComparable<T>',
        's.GetHashCode();'
      ],
      answer: [0, 1, 4],
      explain: 'GetType is an Object method, it needs an object. Equals and GetHashCode are not overridden — they go to ValueType with a box (Equals also boxes its argument). Dispose in using and CompareTo in a constrained generic are called via constrained with no box.'
    },
    {
      t: 'tapline',
      q: 'Point is a mutable struct with an Offset method. Which line compiles but changes nothing in the data?',
      code: 'var list = new List<Point> { default };\nvar arr = new Point[1];\narr[0].Offset(1);\nlist[0] = list[0] with { X = 2 };\nlist[0].Offset(1);\nforeach (ref var p in CollectionsMarshal.AsSpan(list)) p.Offset(1);',
      answer: 4,
      explain: 'The List<T> indexer returns a copy: Offset changes a temporary. The array yields the element itself, with plus assignment writes a new value, and ref via AsSpan gives a reference straight into the list\'s internal array.'
    },
    {
      t: 'choice',
      q: 'struct Key { string City; int Id; } is a dictionary key, nothing overridden. Why is this bad when many keys share a city?',
      options: [
        'The default hash comes from City only: those keys land in one bucket, and Equals goes through reflection',
        'Equals compares only City, so different Ids overwrite each other',
        'A dictionary does not accept a struct with a reference as a key',
        'It is fine: ValueType.GetHashCode mixes all the fields'
      ],
      answer: 0,
      explain: 'The reference closes the fast path. The slow GetHashCode hashes the first non-null field — City. Equals still compares every field, so data does not get mixed up, but lookup becomes a walk with reflection.',
      wrong: { 1: 'Equals via reflection compares every field. Keys do not get mixed up — everything is just slow.' }
    },
    {
      t: 'blanks',
      q: 'A struct key: equality with no boxes or reflection, in one line',
      code: 'public ___ record ___ Key(string City, int Id);',
      tiles: ['readonly', 'struct', 'class', 'ref', 'sealed'],
      answer: ['readonly', 'struct'],
      explain: 'readonly record struct generates IEquatable<Key>, Equals, GetHashCode over all fields and ==, and readonly makes the properties init — the key cannot be spoiled after insertion. A record class would give equality too, but that is a reference type with an allocation per key.'
    },
    {
      t: 'match',
      q: 'Match each struct with how ValueType.Equals compares it',
      pairs: [
        ['struct { int A; int B; }', 'Bytewise'],
        ['struct { byte A; int B; }', 'Reflection: an alignment gap'],
        ['struct { double X; }', 'Reflection: double'],
        ['struct { string S; }', 'Reflection: a reference'],
        ['struct with override Equals', 'Its own Equals, ValueType is not involved']
      ]
    },
    {
      t: 'choice',
      q: 'What does Unsafe.SizeOf<R>() return on x64?',
      code: 'struct R\n{\n    public byte Kind;\n    public double Value;\n    public int Id;\n}',
      options: ['24', '13', '16', '17'],
      answer: 0,
      explain: 'Sequential: Kind at 0, then a 7-byte gap up to the aligned double at 8, Id at 16, 20 in total — rounded up to a multiple of 8: 24. Put the double first and the byte last, and it is 16.',
      wrong: { 1: '13 is the sum of field sizes without alignment. You would only get that with Pack = 1.', 2: 'You get 16 if you reorder the fields: double, int, byte.' }
    },
    {
      t: 'choice',
      q: 'A HashSet<P>, where P is a struct without IEquatable<P> but with overridden Equals(object) and GetHashCode. What happens in Contains?',
      options: [
        'No reflection, but the argument is boxed on every Equals(object) call',
        'No boxes and no reflection — the override is enough',
        'Comparison via ValueType.Equals with reflection',
        'It does not compile: HashSet requires IEquatable<T>'
      ],
      answer: 0,
      explain: 'Without IEquatable<P>, EqualityComparer<P>.Default calls Equals(object): your own override, so no reflection, but the argument is object, which means a box per comparison. IEquatable<P> removes that too.',
      wrong: { 3: 'HashSet works with any T: without IEquatable<T> it just falls back to Equals(object).' }
    }
  ]
};

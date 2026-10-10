/** Unit 1 final of the "Deeper C#" course. */
export default {
  id: 'cs.u1.boss',
  title: 'Final: generics',
  sub: 'Constraints, the JIT and variance',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'generics',
      task: 'The method creates a T and compares values. It must work with int, and must reject string.',
      sig: 'T MaxOrNew<T>(T a, T b)', ops: ['newT', 'cmp'],
      goal: { allow: ['int'], deny: ['string'] },
      solve: ['c:struct', 'c:cmp']
    },
    {
      t: 'choice',
      q: 'where T : struct, new() — what does the compiler say?',
      options: ['Error: a struct always has a parameterless constructor, so new() is not allowed with it', 'All good', 'A warning'],
      answer: 0,
      explain: 'With struct, new T() is already allowed.'
    },
    {
      t: 'choice',
      q: 'You pass an IEnumerable<Cat> where an IEnumerable<Animal> is expected. Does it work?',
      options: ['Yes: IEnumerable is covariant (out T)', 'No: generics are invariant', 'Only via Cast<Animal>()'],
      answer: 0,
      explain: 'Covariance works for reference types in interfaces and delegates.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['List<int> stores ints without boxing', 'For reference-type T the JIT emits shared code', 'object[] arr = new string[1]; arr[0] = 1; fails at run time', 'where T : unmanaged allows string'],
      answer: [0, 1, 2],
      explain: 'string is a reference type, so it is not unmanaged.'
    },
    {
      t: 'match',
      q: 'Match the task to the constraint',
      pairs: [
        ['Sorting', 'IComparable<T>'],
        ['Factory', 'new()'],
        ['Stack buffer', 'unmanaged'],
        ['Summing numbers', 'INumber<T>']
      ]
    },
    {
      t: 'tapline',
      q: 'Which line will not compile?',
      code: 'void Reset<T>(ref T value)\n{\n    value = default;\n    value = null;\n}',
      answer: 3,
      explain: 'An unconstrained T cannot be null — T might be int. default always works.'
    },
    {
      t: 'blanks',
      q: 'The constraint that allows T x = null',
      code: 'class Box<T> where T : ___',
      tiles: ['class', 'struct', 'new()', 'notnull'],
      answer: ['class'],
      explain: 'Only reference types (and Nullable<T>) can be null.'
    },
    {
      t: 'choice',
      q: 'Why did C# 11 add static abstract interface members?',
      options: ['So a generic can require operators and static properties — like + and Zero on numbers', 'So interfaces can hold fields', 'For async'],
      answer: 0,
      explain: 'INumber<T> and all of generic math are built on this.'
    }
  ]
};

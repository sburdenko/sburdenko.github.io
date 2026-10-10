/** Deeper C#, unit 4, lesson 3: readonly struct, in and defensive copies. */
export default {
  id: 'cs.u4.l3',
  title: 'readonly struct and in',
  sub: 'Defensive copies you can\'t see in the code',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A struct is copied whole',
      body: '<p>Pass a struct to a method and it gets copied. For a small one (int, Point) that is cheap. A 4×4 matrix is already 64 bytes on every call.</p><p><code>ref</code> and <code>in</code> pass a reference instead of a copy. <code>in</code> also promises that the method won\'t change the struct.</p>'
    },
    {
      t: 'rig', rig: 'copies',
      task: 'Get rid of the matrix copies, but make sure the method can\'t mess up the caller\'s matrix.',
      goal: { max: 0, safe: true },
      solve: ['pass:in', 'ro']
    },
    {
      t: 'choice',
      q: 'Why did copies remain with in but without readonly struct?',
      options: ['The compiler doesn\'t know whether Det() and Trace() change the struct, so it calls them on a copy to keep the in promise', 'in always copies', 'It is a compiler bug'],
      answer: 0,
      explain: 'That is a defensive copy: invisible, but real.'
    },
    {
      t: 'rig', rig: 'copies',
      task: 'This one already uses in, yet there are two copies per call. Remove them without changing how the matrix is passed.',
      start: { pass: 'in' },
      goal: { max: 0, safe: true },
      solve: ['ro']
    },
    {
      t: 'learn',
      title: 'readonly struct',
      body: '<p><code>readonly struct</code> promises that no method changes the fields. The compiler checks this and can then call methods directly on the original — even through in.</p><p>In a regular struct you can mark individual methods <code>readonly</code>.</p>',
      code: 'public readonly struct Matrix\n{\n    public readonly float M11, M12; // …\n    public float Det() => …;\n}'
    },
    {
      t: 'choice',
      q: 'What is the danger of ref instead of in?',
      options: ['The method can change the caller\'s struct', 'ref is slower', 'ref copies'],
      answer: 0,
      explain: 'ref is for when you actually want the change.'
    },
    {
      t: 'match',
      q: 'Match the passing mode to its behavior',
      pairs: [
        ['By value', 'A copy on every call'],
        ['ref', 'A reference, can be changed'],
        ['in + regular struct', 'A reference, but defensive copies'],
        ['in + readonly struct', 'A reference, no copies']
      ]
    },
    {
      t: 'blanks',
      q: 'No copies and no changes',
      code: 'public ___ struct Vec4 { … }\nfloat Len(___ Vec4 v) => …;',
      tiles: ['readonly', 'in', 'ref', 'static', 'out'],
      answer: ['readonly', 'in'],
      explain: 'The pair that in was invented for.'
    },
    {
      t: 'choice',
      q: 'A Point struct holds two ints. Is it worth passing it with in?',
      options: ['Usually not: copying 8 bytes costs no more than passing a reference', 'Yes, always', 'You can\'t'],
      answer: 0,
      explain: 'in pays off for large structs — 16–32 bytes and up.'
    }
  ]
};

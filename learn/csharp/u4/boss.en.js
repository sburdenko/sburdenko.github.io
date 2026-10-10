/** Unit 4 final of the "Deeper C#" course. */
export default {
  id: 'cs.u4.boss',
  title: 'Final: performance',
  sub: 'Span, ref struct, copies',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'allocs',
      task: 'Start with Substring and find a way with no allocations.',
      start: 'substring',
      goal: { max: 0 },
      solve: ['way:span']
    },
    {
      t: 'rig', rig: 'copies',
      task: 'The method takes the matrix by ref. Make it safe and copy-free.',
      start: { pass: 'ref' },
      goal: { max: 0, safe: true },
      solve: ['pass:in', 'ro']
    },
    {
      t: 'tapline',
      q: 'What will not compile?',
      code: 'Span<int> nums = stackalloc int[4];\nobject boxed = nums;\nint first = nums[0];',
      answer: 1,
      explain: 'A ref struct cannot be boxed: an object lives on the heap.'
    },
    {
      t: 'choice',
      q: 'You need to pass a buffer to an async method that writes to a stream. What do you pass?',
      options: ['ReadOnlyMemory<byte>', 'ReadOnlySpan<byte>', 'Span<byte>'],
      answer: 0,
      explain: 'A Span cannot be held across an await.'
    },
    {
      t: 'multi',
      q: 'What reduces pressure on the GC? Select all.',
      options: ['Span slices instead of Substring', 'stackalloc for small buffers', 'ArrayPool<T>.Shared for large temporary arrays', 'ToList() after every Where'],
      answer: [0, 1, 2],
      explain: 'ToList creates a new list — that is extra garbage.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Span<T>', 'A window into memory'],
        ['Memory<T>', 'A window for the heap and async'],
        ['readonly struct', 'No defensive copies'],
        ['ArrayPool', 'Reusing arrays']
      ]
    },
    {
      t: 'choice',
      q: 'Why can\'t a Span be a field of a class?',
      options: ['It may point into the stack, and a class object outlives the method — the window would point at garbage', 'Span is too big', 'It is a JIT limitation'],
      answer: 0,
      explain: 'ref struct is how the compiler guarantees safety without run-time checks.'
    },
    {
      t: 'choice',
      q: 'in + a regular (non-readonly) struct with two method calls inside. How many defensive copies?',
      options: ['Two — one before each method call', 'Zero', 'One'],
      answer: 0,
      explain: 'Each method call on an in parameter is made on a copy.'
    }
  ]
};

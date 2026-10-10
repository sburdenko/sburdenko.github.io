/** Deeper C#, unit 4, lesson 1: Span<T>. */
export default {
  id: 'cs.u4.l1',
  title: 'Span<T>',
  sub: 'A window into memory, no copying',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A window, not a copy',
      body: '<p><code>Span&lt;T&gt;</code> is a "window" into a chunk of memory: a start and a length. The memory can be an array, a string, the stack or a native buffer. A slice <code>span[2..5]</code> copies nothing — it is a new window onto the same bytes.</p>',
      code: 'int[] arr = { 1, 2, 3, 4, 5 };\nSpan<int> middle = arr.AsSpan(1, 3);   // 2, 3, 4\nmiddle[0] = 20;                         // arr[1] is now 20'
    },
    {
      t: 'choice',
      q: 'What is in arr[1] after middle[0] = 20?',
      options: ['20 — the Span looks at the same array', '2 — a Span is a copy', 'An error'],
      answer: 0,
      explain: 'A Span does not own memory; it just looks at it.'
    },
    {
      t: 'rig', rig: 'allocs',
      task: 'Parsing the string "12,34,56" creates garbage right now. Pick a way that puts not a single object on the heap.',
      goal: { max: 0 },
      solve: ['way:span']
    },
    {
      t: 'choice',
      q: 'Why does Split create 4 objects for the string "12,34,56"?',
      options: ['An array for the parts plus three new strings', 'Four numbers', 'Split copies the original string'],
      answer: 0,
      explain: 'Strings are immutable, so every part is a new string.'
    },
    {
      t: 'learn',
      title: 'ReadOnlySpan<char> and the stack',
      body: '<p>You can view a string as a <code>ReadOnlySpan&lt;char&gt;</code>: slices without copies, and <code>int.Parse</code> can read straight from a slice.</p><p>A small temporary buffer can live on the stack — no heap at all:</p>',
      code: 'Span<byte> buf = stackalloc byte[256];\nint written = Encoding.UTF8.GetBytes("hello", buf);'
    },
    {
      t: 'blanks',
      q: 'Slice a string without copying',
      code: 'ReadOnlySpan<char> s = line.___();\nvar head = s[..___];',
      tiles: ['AsSpan', '3', 'Substring', 'ToArray', 'Split'],
      answer: ['AsSpan', '3'],
      explain: 'Substring would create a new string.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Span<T>', 'A writable window into memory'],
        ['ReadOnlySpan<T>', 'A read-only window'],
        ['stackalloc', 'A buffer on the stack'],
        ['span[1..4]', 'A slice without copying']
      ]
    },
    {
      t: 'multi',
      q: 'What can a Span look at? Select all.',
      options: ['An array', 'A string (as ReadOnlySpan<char>)', 'Memory on the stack', 'A file on disk, directly'],
      answer: [0, 1, 2],
      explain: 'Native memory too. A file has to be read into a buffer first.'
    },
    {
      t: 'choice',
      q: 'Why bother, if the GC cleans up garbage anyway?',
      options: ['Less garbage means fewer collections and pauses; in hot code the difference is huge', 'The GC cannot clean up strings', 'Span compiles faster'],
      answer: 0,
      explain: 'The fastest object is the one you never created.'
    }
  ]
};

/** Deeper C#, unit 1, lesson 2: constraints. */
export default {
  id: 'cs.u1.l2',
  title: 'where constraints',
  sub: 'class, struct, new(), unmanaged and interfaces',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'What you can require of T',
      body: '<p><b>class</b> — a reference type (can be null).<br><b>struct</b> — a value type.<br><b>unmanaged</b> — a value type with no references inside (works with stackalloc and pointers).<br><b>new()</b> — has a public parameterless constructor.<br><b>An interface</b> — T has its methods.</p>'
    },
    {
      t: 'rig', rig: 'generics',
      task: 'A factory creates a new object of type T. It must work with List<int> and Point.',
      sig: 'T Create<T>()', ops: ['newT'],
      goal: { allow: ['list', 'point'] },
      solve: ['c:new']
    },
    {
      t: 'choice',
      q: 'Why doesn\'t string satisfy new()?',
      options: ['string has no public parameterless constructor', 'string is a value type', 'string is banned in generics'],
      answer: 0,
      explain: 'new string() does not compile — so string does not satisfy new() either.'
    },
    {
      t: 'rig', rig: 'generics',
      task: 'A cache holds a T value and can reset it to null. It must work with string and List<int>, but not with int.',
      sig: 'class Cache<T>', ops: ['nullT'],
      goal: { allow: ['string', 'list'], deny: ['int'] },
      solve: ['c:class']
    },
    {
      t: 'rig', rig: 'generics',
      task: 'A fast stack buffer via stackalloc. It must work with int and Point.',
      sig: 'void Fill<T>(T value)', ops: ['stack'],
      goal: { allow: ['int', 'point'] },
      solve: ['c:unmanaged']
    },
    {
      t: 'learn',
      title: 'What doesn\'t mix',
      body: '<p><code>class</code> and <code>struct</code> can\'t be combined. <code>unmanaged</code> already means "value type", so you don\'t write it with <code>struct</code>, <code>class</code> or <code>new()</code>. Order: class/struct/unmanaged first, then interfaces, <code>new()</code> last.</p>'
    },
    {
      t: 'blanks',
      q: 'Order of constraints',
      code: 'T Make<T>() where T : ___, IDisposable, ___',
      tiles: ['class', 'new()', 'struct', 'unmanaged'],
      answer: ['class', 'new()'],
      explain: 'new() always goes at the end of the list.'
    },
    {
      t: 'choice',
      q: 'What does default(T) return for T = int and T = string?',
      options: ['0 and null', 'null and null', '0 and ""'],
      answer: 0,
      explain: 'default means "zeros": the zero value for value types, null for reference types.'
    },
    {
      t: 'match',
      q: 'Match the constraint to what it allows',
      pairs: [
        ['new()', 'new T()'],
        ['class', 'T x = null'],
        ['unmanaged', 'stackalloc T[n]'],
        ['IComparable<T>', 'a.CompareTo(b)']
      ]
    },
    {
      t: 'multi',
      q: 'Which types satisfy where T : struct? Select all.',
      options: ['int', 'DateTime', 'Point (struct)', 'string', 'int?'],
      answer: [0, 1, 2],
      explain: 'string is a reference type. int? is Nullable<int>: it is a value type, but the struct constraint deliberately rejects it.'
    }
  ]
};

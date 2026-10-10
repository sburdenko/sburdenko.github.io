/** Final of the "Deeper C#" course. */
export default {
  id: 'cs.u5.boss',
  title: 'Course final',
  sub: 'Everything together',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'patterns',
      task: 'Fix the switch: every shape should land in its own arm.',
      start: ['rect', 'square', 'circle', 'point', 'nul', 'any'],
      solve: ['up:point', 'up:point', 'up:point', 'up:circle', 'up:circle', 'up:square']
    },
    {
      t: 'rig', rig: 'generics',
      task: 'The method puts T into a stack buffer and sorts it. It must accept int.',
      sig: 'void SortSmall<T>(T a, T b)', ops: ['stack', 'cmp'],
      goal: { allow: ['int'] },
      solve: ['c:unmanaged', 'c:cmp']
    },
    {
      t: 'rig', rig: 'closures',
      task: 'Make it print 0 1 2 while keeping the for loop.',
      start: 'for', variants: ['for', 'copy'],
      goal: { out: '0 1 2', variants: ['copy'] },
      solve: ['variant:copy', 'end']
    },
    {
      t: 'choice',
      q: 'How many times does the query run?',
      code: 'var q = users.Where(u => u.IsActive);\nif (q.Any()) Console.WriteLine(q.Count());',
      options: ['Twice', 'Once', 'Never'],
      answer: 0,
      explain: 'Any and Count are two separate enumerations.'
    },
    {
      t: 'tapline',
      q: 'Where is the compile error?',
      code: 'public record Point(int X, int Y);\nvar p = new Point(1, 2);\nvar q = p with { X = 5 };\np.Y = 3;',
      answer: 3,
      explain: 'The properties of a positional record are init-only.'
    },
    {
      t: 'match',
      q: 'Match the task to the tool',
      pairs: [
        ['Parse a string with no garbage', 'ReadOnlySpan<char>'],
        ['A big struct with no copies', 'readonly struct + in'],
        ['An immutable value with equality', 'record'],
        ['A sum for any number type', 'INumber<T>']
      ]
    },
    {
      t: 'multi',
      q: 'What does the compiler check, rather than the runtime? Select all.',
      options: ['Nullable warnings', 'where constraints', 'Unreachable switch arms', 'Going out of a Span\'s bounds'],
      answer: [0, 1, 2],
      explain: 'Span bounds are checked at run time — IndexOutOfRangeException.'
    },
    {
      t: 'choice',
      q: 'Why can\'t a List<string> be assigned to a List<object>, while an IEnumerable<string> can go into an IEnumerable<object>?',
      options: ['IEnumerable only hands out elements (out T), but you could put a foreign type into a List', 'Historical reasons', 'Both are allowed'],
      answer: 0,
      explain: 'Variance is about type safety.'
    },
    {
      t: 'blanks',
      q: 'A property that trims whitespace, in C# 14',
      code: 'public string Name { get; set => ___ = value.Trim(); }',
      tiles: ['field', 'value', 'this.Name', '_name'],
      answer: ['field'],
      explain: 'this.Name would recurse forever.'
    }
  ]
};

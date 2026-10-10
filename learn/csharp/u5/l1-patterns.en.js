/** Deeper C#, unit 5, lesson 1: pattern matching. */
export default {
  id: 'cs.u5.l1',
  title: 'Pattern matching',
  sub: 'is, switch expressions and arm order',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Check and extract in one go',
      body: '<p><code>is</code> checks the type and declares a variable at the same time. Property patterns look inside the object.</p>',
      code: 'if (shape is Circle { R: > 10 } big)\n    Console.WriteLine($"big circle {big.R}");'
    },
    {
      t: 'learn',
      title: 'The switch expression',
      body: '<p>Arms are checked <b>top to bottom</b>, and the first match wins. <code>_</code> means "everything else", null included. The compiler complains (CS8510) if an arm can never be reached because everything is already caught above it.</p>',
      code: 'string Describe(Shape? s) => s switch\n{\n    Circle { R: 0 } => "point",\n    Circle c        => "circle",\n    null            => "empty",\n    _               => "something else"\n};'
    },
    {
      t: 'rig', rig: 'patterns',
      task: 'The arms are mixed up: a point becomes a circle, a square becomes a rectangle, and null becomes "something else". Put them in order with the ▲ buttons.',
      start: ['circle', 'point', 'rect', 'square', 'any', 'nul'],
      solve: ['up:point', 'up:square', 'up:nul']
    },
    {
      t: 'choice',
      q: 'Why did null end up in "something else"?',
      options: ['_ catches everything, null included, and the null arm was below it', 'You can\'t check for null in a switch', 'It is a bug'],
      answer: 0,
      explain: 'Specific cases go higher, general ones lower.'
    },
    {
      t: 'learn',
      title: 'More patterns',
      body: '<p><b>Relational</b>: <code>&lt; 0</code>, <code>&gt;= 18</code>.<br><b>Logical</b>: <code>and</code>, <code>or</code>, <code>not</code>.<br><b>List</b> (C# 11): <code>[1, .., var last]</code>.</p>',
      code: 'string Grade(int score) => score switch\n{\n    < 0 or > 100 => "invalid",\n    >= 90        => "excellent",\n    >= 60        => "pass",\n    _            => "fail"\n};\n\nif (args is [var cmd, ..]) Run(cmd);'
    },
    {
      t: 'choice',
      q: 'What does Grade(95) return?',
      options: ['"excellent"', '"pass"', '"invalid"'],
      answer: 0,
      explain: '95 is neither below 0 nor above 100, but it is ≥ 90 — the first matching arm.'
    },
    {
      t: 'blanks',
      q: 'Not null and not an empty string',
      code: 'if (name is ___ null ___ "") Greet(name);',
      tiles: ['not', 'and not', 'or', '!=', 'is'],
      answer: ['not', 'and not'],
      explain: 'name is not null and not "" — it reads almost like plain English.'
    },
    {
      t: 'match',
      q: 'Match the pattern to its meaning',
      pairs: [
        ['Circle { R: 0 }', 'Property pattern'],
        ['>= 18', 'Relational pattern'],
        ['[var first, ..]', 'List pattern'],
        ['_', 'Everything else']
      ]
    },
    {
      t: 'choice',
      q: 'The arm Rect r sits above Rect { W: var w, H: var h } when w == h. What does the compiler say?',
      options: ['CS8510: the second arm is unreachable — every Rect is already caught', 'Nothing', 'It picks the more specific arm by itself'],
      answer: 0,
      explain: 'The compiler doesn\'t reorder arms — the first one wins.'
    }
  ]
};

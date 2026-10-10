/** Deeper C#, unit 5, lesson 2: records. */
export default {
  id: 'cs.u5.l2',
  title: 'Records',
  sub: 'Value equality and with',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A value type in one line',
      body: '<p>A <code>record</code> (C# 9) is a class for which the compiler writes the constructor, properties, content-based equality, <code>ToString</code> and deconstruction for you.</p>',
      code: 'public record Point(int X, int Y);\n\nvar a = new Point(1, 2);\nvar b = new Point(1, 2);\nConsole.WriteLine(a == b);   // True\nConsole.WriteLine(a);        // Point { X = 1, Y = 2 }'
    },
    {
      t: 'choice',
      q: 'a and b are two different record Point(1, 2) objects. What does a == b return?',
      options: ['True: a record compares contents', 'False: they are different objects', 'An error'],
      answer: 0,
      explain: 'A regular class would give False — it would compare references.'
    },
    {
      t: 'learn',
      title: 'with: a copy with changes',
      body: '<p>The properties of a positional record are <code>init</code>: they don\'t change after creation. Need a modified version? Make a copy.</p>',
      code: 'var moved = a with { X = 10 };   // Point { X = 10, Y = 2 }, a is unchanged'
    },
    {
      t: 'tapline',
      q: 'Which line will not compile?',
      code: 'public record User(string Name, int Age);\n\nvar u = new User("Anna", 30);\nvar older = u with { Age = 31 };\nu.Age = 32;',
      answer: 4,
      explain: 'Age is an init property. You change it with with.'
    },
    {
      t: 'learn',
      title: 'record struct',
      body: '<p>Since C# 10 there is <code>record struct</code> — a value type with the same conveniences. Its properties are mutable by default; <code>readonly record struct</code> makes them init.</p>'
    },
    {
      t: 'multi',
      q: 'What does a record generate for you? Select all.',
      options: ['Value equality', 'A ToString that shows the contents', 'Deconstruction: var (x, y) = p', 'Saving to a database'],
      answer: [0, 1, 2],
      explain: 'Saving is the ORM\'s job, not the language\'s.'
    },
    {
      t: 'choice',
      q: 'Where do records shine?',
      options: ['DTOs, messages, dictionary keys, immutable values', 'EF entities with mutable state and identity', 'UI controls'],
      answer: 0,
      explain: 'An entity with an Id is usually compared by Id, not by every field.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['record', 'Reference type, value equality'],
        ['record struct', 'Value type with the same conveniences'],
        ['with', 'A copy with changes'],
        ['init', 'Can only be set at creation']
      ]
    }
  ]
};

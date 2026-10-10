/** Deeper C#, unit 5, lesson 3: nullable references. */
export default {
  id: 'cs.u5.l3',
  title: 'Nullable references',
  sub: 'string and string? are different promises',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'The billion-dollar mistake',
      body: '<p>NullReferenceException is the most common error in .NET. Since C# 8 you can turn on the <b>nullable context</b>: then <code>string</code> means "never null here", and <code>string?</code> means "may be null". The compiler keeps track and warns you.</p><p>New projects have it on by default: <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'On which line does the compiler warn about a possible null?',
      code: 'string? FindName(int id) => …;\n\nvar name = FindName(42);\nConsole.WriteLine(name.Length);',
      answer: 3,
      explain: 'CS8602: name may be null. Check it, or use name?.Length.'
    },
    {
      t: 'learn',
      title: 'Keeping the compiler happy, honestly',
      body: '<p>Check: <code>if (name is not null)</code> — after that the compiler knows it is not null.<br>A default value: <code>name ?? "guest"</code>.<br>Last resort: <code>name!</code> — "trust me, it\'s not null". If you\'re wrong, you get that very exception.</p>'
    },
    {
      t: 'choice',
      q: 'What does the ! operator do in name!.Length?',
      options: ['It only silences the warning; nothing is checked at run time', 'It checks for null and throws a clear exception', 'It turns null into an empty string'],
      answer: 0,
      explain: 'It exists only for the compiler.'
    },
    {
      t: 'learn',
      title: 'required',
      body: '<p>A property can\'t be null, but it is set by an initializer rather than the constructor? <code>required</code> (C# 11) forces you to set it at creation.</p>',
      code: 'public class Order\n{\n    public required string Customer { get; init; }\n}\n\nvar o = new Order();   // error: Customer is not set'
    },
    {
      t: 'blanks',
      q: 'The name, or "guest" if it is null',
      code: 'var shown = name ___ "guest";',
      tiles: ['??', '?.', '!', '||'],
      answer: ['??'],
      explain: 'The null-coalescing operator.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['string?', 'May be null'],
        ['name!', 'Silence the warning'],
        ['name ?? x', 'x if name is null'],
        ['required', 'Must be set at creation']
      ]
    },
    {
      t: 'multi',
      q: 'Which are true about nullable references? Select all.',
      options: ['It is a compiler check, not a runtime one', 'They are on by default in new projects', 'After if (x is not null) the compiler treats x as not null', 'string? is Nullable<string>'],
      answer: [0, 1, 2],
      explain: 'Nullable<T> is only for value types. string? is just an annotation for the compiler.'
    }
  ]
};

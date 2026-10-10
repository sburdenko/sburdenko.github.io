/** Async, unit 2, lesson 2: Task, Task<T>, ValueTask, async void (English version). */
export default {
  id: 'as.u2.l2',
  title: 'What to return',
  sub: 'Task, ValueTask and the dangerous async void',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Task, Task<T>, ValueTask<T>',
      body: '<p><code>Task</code>: no result, but you can wait for it.<br><code>Task&lt;T&gt;</code>: returns a T.<br><code>ValueTask&lt;T&gt;</code>: the same, but with no allocation when the result is often ready at once (say, from a cache). You may await it only once.</p>'
    },
    {
      t: 'learn',
      title: 'async void is for event handlers only',
      body: '<p>You can\'t await an <code>async void</code>: the caller never learns when the method finished. And you can\'t catch its exception from outside: it goes to the synchronization context and usually crashes the app.</p><p>Use async void only where an event dictates the signature: <code>button.Click += async (s, e) =&gt; …</code></p>'
    },
    {
      t: 'choice',
      q: 'Why is async void dangerous?',
      options: ['You can\'t await it, and a try around the call won\'t catch its exception', 'It\'s slower', 'It can\'t use await'],
      answer: 0,
      explain: 'No task means nothing to wait on and nothing to carry the exception.'
    },
    {
      t: 'tapline',
      q: 'Which line is a design mistake?',
      code: 'public async void SaveAsync(Order o)\n{\n    await db.InsertAsync(o);\n}\npublic async Task LoadAsync() => await db.LoadAsync();',
      answer: 0,
      explain: 'SaveAsync isn\'t an event handler. It should be async Task so callers can await it.'
    },
    {
      t: 'choice',
      q: 'When does ValueTask<T> beat Task<T>?',
      options: ['When the result is often ready at once and the method is called very often', 'Always', 'When the method waits a long time on the network'],
      answer: 0,
      explain: 'You only save on the fast path with no waiting. If the method always waits, there is hardly any difference.'
    },
    {
      t: 'multi',
      q: 'What must you not do with a ValueTask? Select all that apply.',
      options: ['Await it twice', 'Await it from two places at once', 'Read .Result before it completes', 'Await it once'],
      answer: [0, 1, 2],
      explain: 'Need more? Call .AsTask() and work with a regular task.',
      deep: 'A ValueTask can wrap a reusable IValueTaskSource. After the first await, what it holds may already belong to another operation. Hence the strict rules.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Task', 'Wait with no result'],
        ['Task<T>', 'Wait for a T result'],
        ['ValueTask<T>', 'No allocation if ready at once'],
        ['async void', 'Event handlers only']
      ]
    },
    {
      t: 'blanks',
      q: 'Fix the signature',
      code: 'public async ___ SaveAsync(Order o)\n{\n    await db.InsertAsync(o);\n}',
      lang: 'cs',
      tiles: ['Task', 'void', 'object', 'int'],
      answer: ['Task'],
      explain: 'async Task is a method with no result that callers can await.'
    }
  ]
};

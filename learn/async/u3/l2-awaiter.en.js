/** Async, unit 3, lesson 2: the awaiter pattern (English version). */
export default {
  id: 'as.u3.l2',
  title: 'The awaiter pattern',
  sub: 'Why you can await almost anything',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'await works with anything that has GetAwaiter',
      body: '<p><code>await x</code> compiles to roughly this: get <code>x.GetAwaiter()</code>; if <code>IsCompleted</code>, call <code>GetResult()</code> right away; if not, subscribe with <code>OnCompleted</code> and return.</p><p>It\'s a pattern, not an interface: any type with the right methods works, even through an extension method.</p>'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['GetAwaiter()', 'Get the waiting object'],
        ['IsCompleted', 'Is it done already?'],
        ['OnCompleted(…)', 'What to call when it\'s done'],
        ['GetResult()', 'Take the result or the exception']
      ]
    },
    {
      t: 'learn',
      title: 'Your own awaitable in two lines',
      body: '<p>Add a GetAwaiter extension method for TimeSpan, and you can await a span of time directly.</p>',
      code: 'public static TaskAwaiter GetAwaiter(this TimeSpan t)\n    => Task.Delay(t).GetAwaiter();\n\nawait TimeSpan.FromSeconds(1);   // now this works'
    },
    {
      t: 'choice',
      q: 'Why did await TimeSpan.FromSeconds(1) compile?',
      options: ['TimeSpan got a GetAwaiter extension method, and that\'s all await needs', 'TimeSpan derives from Task', 'It\'s built into C# 12'],
      answer: 0,
      explain: 'The compiler looks for GetAwaiter the same way foreach looks for GetEnumerator.'
    },
    {
      t: 'blanks',
      q: 'Rebuild what await expands into',
      code: 'var aw = task.___();\nif (!aw.___)\n{\n    // subscribe and return\n}\nvar result = aw.GetResult();',
      lang: 'cs',
      tiles: ['GetAwaiter', 'IsCompleted', 'Wait', 'Result'],
      answer: ['GetAwaiter', 'IsCompleted'],
      explain: 'First the awaiter, then the readiness check.'
    },
    {
      t: 'choice',
      q: 'What does GetResult() do if the task failed?',
      options: ['Throws its exception', 'Returns null', 'Returns an AggregateException as a value'],
      answer: 0,
      explain: 'That\'s why await throws the original exception.'
    },
    {
      t: 'multi',
      q: 'What can you await? Select all that apply.',
      options: ['Task', 'ValueTask', 'Task.Yield()', 'Awaitable in Unity', 'An int with no GetAwaiter of its own'],
      answer: [0, 1, 2, 3],
      explain: 'All of them except int have a GetAwaiter.'
    },
    {
      t: 'choice',
      q: 'Why write await Task.Yield()?',
      options: ['To force the method to give up control and resume a bit later through the queue', 'To wait one frame in Unity', 'To free memory'],
      answer: 0,
      explain: 'YieldAwaitable always reports IsCompleted = false, so the method is guaranteed to pause.'
    }
  ]
};

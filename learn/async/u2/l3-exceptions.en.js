/** Async, unit 2, lesson 3: exceptions (English version). */
export default {
  id: 'as.u2.l3',
  title: 'Exceptions',
  sub: 'await, .Result and AggregateException',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'await throws like normal code',
      body: '<p>If a task fails, await throws its exception: the very one thrown inside. A plain try/catch around the await catches it.</p>',
      code: 'try\n{\n    var json = await http.GetStringAsync(url);\n}\ncatch (HttpRequestException e)\n{\n    Log(e.Message);\n}'
    },
    {
      t: 'learn',
      title: '.Result and .Wait() wrap it',
      body: '<p>If you wait synchronously with <code>.Result</code> or <code>.Wait()</code>, the exception arrives wrapped in an <code>AggregateException</code>, with the original inside, in InnerExceptions.</p><p><code>GetAwaiter().GetResult()</code> throws the original exception, but it still blocks the thread.</p>'
    },
    {
      t: 'choice',
      q: 'Will this catch block catch a network error?',
      code: 'try { var r = GetAsync().Result; }\ncatch (HttpRequestException) { … }',
      options: ['No: .Result throws AggregateException, with the HttpRequestException inside', 'Yes', 'Only in Release'],
      answer: 0,
      explain: 'One more reason not to block: deadlocks and awkward exceptions.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Start three requests with Task.WhenAll and make two of them fail. How many exceptions does await throw, and how many are stored in the task?',
      goal: { kind: 'inner', n: 2 },
      solve: ['mode:all', 'fail:A', 'fail:C']
    },
    {
      t: 'choice',
      q: 'WhenAll, and A and C failed. What does await throw?',
      options: ['Only A\'s exception; all errors are in the WhenAll task\'s Exception.InnerExceptions', 'An AggregateException with both', 'Nothing'],
      answer: 0,
      explain: 'await unwraps and throws the first one. To see them all, keep the WhenAll task and check its Exception.'
    },
    {
      t: 'learn',
      title: 'Forgotten exceptions',
      body: '<p>If nobody awaits a task, nobody sees its exception. Since .NET 4.5 this doesn\'t crash the app; the error is simply lost (you can catch it with the TaskScheduler.UnobservedTaskException event).</p><p>That\'s why fire-and-forget hides errors.</p>'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['await throws the original exception', '.Result wraps it in AggregateException', 'A WhenAll task keeps all errors in Exception.InnerExceptions', 'An exception from an unawaited task crashes the app at once', 'try/catch doesn\'t work with await'],
      answer: [0, 1, 2],
      explain: 'With await, try/catch works just as it does in synchronous code.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['await', 'The original exception'],
        ['.Result', 'AggregateException'],
        ['GetAwaiter().GetResult()', 'The original, but the thread is blocked'],
        ['UnobservedTaskException', 'An error from a task nobody awaited']
      ]
    }
  ]
};

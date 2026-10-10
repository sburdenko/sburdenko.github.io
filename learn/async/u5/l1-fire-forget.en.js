/** Async, unit 5, lesson 1: async void and fire-and-forget (English version). */
export default {
  id: 'as.u5.l1',
  title: 'Fire and forget',
  sub: 'Fire-and-forget, a missing await and async void',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Fire and forget',
      body: '<p>Calling an async method without await is called <b>fire-and-forget</b>. The compiler warns you (CS4014).</p><p>The danger: you won\'t know when it finished, and you won\'t see its error.</p>'
    },
    {
      t: 'tapline',
      q: 'Where is the missing await?',
      code: 'public async Task SaveAllAsync()\n{\n    foreach (var o in orders)\n        SaveAsync(o);\n    await LogAsync("saved");\n}',
      answer: 3,
      explain: 'The saves were started but never awaited. Their errors will be lost.'
    },
    {
      t: 'choice',
      q: 'What ends up in the log?',
      code: 'foreach (var o in orders)\n    SaveAsync(o);\nawait LogAsync("saved");',
      options: ['"saved", even though the saves are still running or have already failed', 'Nothing', 'The log entry appears after all the saves'],
      answer: 0,
      explain: 'Without await, the code doesn\'t wait for SaveAsync to finish.'
    },
    {
      t: 'learn',
      title: 'async void crashes the process',
      body: '<p>An exception from async void goes to the SynchronizationContext where the method started. If there\'s no context (console, pool), it\'s thrown on the thread pool, and the process crashes.</p>'
    },
    {
      t: 'choice',
      q: 'A console app calls an async void method that throws after an await. What happens?',
      options: ['The process crashes with an unhandled exception', 'The exception is silently lost', 'A try around the call catches it'],
      answer: 0,
      explain: 'The call already returned, and the try around it finished long ago. Nobody is there to catch the exception.'
    },
    {
      t: 'learn',
      title: 'If you really must fire and forget',
      body: '<p>Wrap the task so its error is sure to reach the log. On a server, use a BackgroundService or a queue for background work.</p>',
      code: 'async Task RunSafeAsync(Func<Task> work)\n{\n    try { await work(); }\n    catch (Exception e) { log.LogError(e, "background task failed"); }\n}\n\n_ = RunSafeAsync(() => SendEmailAsync(user));'
    },
    {
      t: 'multi',
      q: 'What\'s wrong with fire-and-forget? Select all that apply.',
      options: ['You can\'t tell when the task finished', 'Exceptions get lost', 'The task can outlive the object or request that started it', 'The code runs slower'],
      answer: [0, 1, 2],
      explain: 'Speed is the same; it\'s all about control.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['CS4014', 'Warning: call without await'],
        ['async void', 'Can\'t be awaited; an exception crashes the process'],
        ['_ = task', 'Explicitly "forget" a task'],
        ['BackgroundService', 'Background work on a server']
      ]
    }
  ]
};

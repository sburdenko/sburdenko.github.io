/** Async, unit 5, lesson 3: TaskCompletionSource (English version). */
export default {
  id: 'as.u5.l3',
  title: 'TaskCompletionSource',
  sub: 'Your own task, built from callbacks',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A task you complete yourself',
      body: '<p><code>TaskCompletionSource&lt;T&gt;</code> creates a Task&lt;T&gt; that you complete yourself: SetResult, SetException, SetCanceled. That\'s how you turn an old callback API into a clean await.</p>',
      code: 'Task<Location> GetLocationAsync()\n{\n    var tcs = new TaskCompletionSource<Location>(\n        TaskCreationOptions.RunContinuationsAsynchronously);\n    gps.OnFix += loc => tcs.TrySetResult(loc);\n    gps.OnError += e => tcs.TrySetException(e);\n    gps.Start();\n    return tcs.Task;\n}'
    },
    {
      t: 'choice',
      q: 'What does tcs.TrySetResult(loc) do?',
      options: ['Completes tcs.Task with a result, and everyone awaiting it continues', 'Starts the GPS', 'Blocks the thread until there\'s a result'],
      answer: 0,
      explain: 'A task from TaskCompletionSource runs nothing by itself; something outside completes it.'
    },
    {
      t: 'learn',
      title: 'The catch: continuations run on your thread',
      body: '<p>By default, SetResult may run the waiters\' continuations right inside itself: synchronously, on the thread that called it. If you\'re holding a lock at that moment, or you\'re inside another library\'s callback, you get surprise reentrancy and even deadlocks.</p><p>The <code>RunContinuationsAsynchronously</code> flag sends continuations to the pool instead.</p>'
    },
    {
      t: 'choice',
      q: 'Why use RunContinuationsAsynchronously?',
      options: ['So the waiters\' continuations don\'t run synchronously inside SetResult', 'So the task runs on another thread', 'To make SetResult faster'],
      answer: 0,
      explain: 'SetResult returns right away, and the continuations run separately.'
    },
    {
      t: 'choice',
      q: 'Why TrySetResult rather than SetResult?',
      options: ['The event may fire twice: SetResult throws the second time, while TrySetResult returns false', 'TrySetResult is faster', 'SetResult is obsolete'],
      answer: 0,
      explain: 'Callbacks can repeat, but a task completes only once.'
    },
    {
      t: 'tapline',
      q: 'Which line can leave the task hanging forever?',
      code: 'var tcs = new TaskCompletionSource<string>();\nclient.OnMessage += m => tcs.TrySetResult(m);\nclient.OnError += e => { log.Error(e); };\nreturn tcs.Task;',
      answer: 2,
      explain: 'On an error, the task never completes. It needs tcs.TrySetException(e).'
    },
    {
      t: 'multi',
      q: 'How can you complete a TaskCompletionSource task? Select all that apply.',
      options: ['SetResult', 'SetException', 'SetCanceled', 'Dispose'],
      answer: [0, 1, 2],
      explain: 'Plus the Try versions of all three.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['TaskCompletionSource', 'A task you complete yourself'],
        ['TrySetResult', 'Complete it if not already completed'],
        ['RunContinuationsAsynchronously', 'Continuations don\'t run inside SetResult'],
        ['SetException', 'Complete it with an error']
      ]
    }
  ]
};

/** Async course, unit 2 final (English version). */
export default {
  id: 'as.u2.boss',
  title: 'Final: async in practice',
  sub: 'Types, exceptions, combinators and cancellation',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'combinators',
      task: 'Load the three page sections as fast as you can.',
      goal: { kind: 'time', mode: 'all', max: 500 },
      solve: ['mode:all']
    },
    {
      t: 'choice',
      q: 'What does an async method return to its caller at its first real pause?',
      options: ['An incomplete task', 'The finished result', 'An exception'],
      answer: 0,
      explain: 'The result comes later, through that task.'
    },
    {
      t: 'tapline',
      q: 'Which signature is bad?',
      code: 'public async Task<User> LoadUserAsync(int id)\npublic async void UploadAsync(byte[] data)\npublic ValueTask<int> GetCachedAsync(string key)',
      answer: 1,
      explain: 'UploadAsync isn\'t an event handler; it needs async Task.'
    },
    {
      t: 'choice',
      q: 'catch (HttpRequestException) around task.Result. Will it catch?',
      options: ['No: an AggregateException arrives', 'Yes', 'Yes, but only in Debug'],
      answer: 0,
      explain: 'Waiting synchronously wraps exceptions.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Show that WhenAll collects every error: make at least two tasks fail.',
      goal: { kind: 'inner', n: 2 },
      solve: ['mode:all', 'fail:B', 'fail:C']
    },
    {
      t: 'multi',
      q: 'Which are true about cancellation? Select all that apply.',
      options: ['You must pass it all the way down, into every async method', 'A long loop must check the token itself', 'Cancel() kills the thread', 'A canceled task ends with OperationCanceledException'],
      answer: [0, 1, 3],
      explain: 'Nothing gets killed: code stops where it checks the token.'
    },
    {
      t: 'blanks',
      q: 'Wait for the fastest mirror',
      code: 'Task<string> first = await Task.___(t1, t2, t3);\nstring page = await first;',
      lang: 'cs',
      tiles: ['WhenAny', 'WhenAll', 'Run', 'Yield'],
      answer: ['WhenAny'],
      explain: 'WhenAny returns the winning task; one more await collects its result.'
    },
    {
      t: 'choice',
      q: 'When does ValueTask<T> pay off?',
      options: ['The method is called very often and the result is usually ready at once', 'The method always waits a long time on the network', 'Always, instead of Task'],
      answer: 0,
      explain: 'The savings are on the fast path with no waiting.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['async void', 'Event handlers'],
        ['WhenAll', 'Wait for all tasks'],
        ['WhenAny', 'Wait for the first one'],
        ['CancellationToken', 'Ask code to stop']
      ]
    }
  ]
};

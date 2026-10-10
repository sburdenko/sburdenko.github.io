/** Async course, unit 5 final: pitfalls (English version). */
export default {
  id: 'as.u5.boss',
  title: 'Final: pitfalls',
  sub: 'Find the bug in each snippet',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'tapline',
      q: 'Where is the bug?',
      code: 'public async Task ImportAsync(IEnumerable<Row> rows)\n{\n    foreach (var r in rows)\n        _db.InsertAsync(r);\n    await _db.CommitAsync();\n}',
      answer: 3,
      explain: 'InsertAsync has no await: the commit runs before the inserts finish, and errors get lost.'
    },
    {
      t: 'tapline',
      q: 'What won\'t compile?',
      code: 'lock (_sync)\n{\n    var data = await LoadAsync();\n    _cache = data;\n}',
      answer: 2,
      explain: 'CS1996: await inside lock isn\'t allowed. Use SemaphoreSlim.WaitAsync.'
    },
    {
      t: 'choice',
      q: 'A TaskCompletionSource is completed from a library callback while the library holds its internal lock. What should you pass when creating it?',
      options: ['TaskCreationOptions.RunContinuationsAsynchronously', 'TaskCreationOptions.LongRunning', 'Nothing'],
      answer: 0,
      explain: 'Otherwise the waiters\' continuations run right under someone else\'s lock.'
    },
    {
      t: 'choice',
      q: 'Where is async void acceptable?',
      options: ['In an event handler', 'In a library method', 'In a method that saves to the database'],
      answer: 0,
      explain: 'Everywhere except handlers, use async Task.'
    },
    {
      t: 'multi',
      q: 'How can you limit the number of concurrent requests? Select all that apply.',
      options: ['Parallel.ForEachAsync with MaxDegreeOfParallelism', 'SemaphoreSlim(N, N) and WaitAsync', 'A bounded Channel with N consumers', 'Task.WhenAll over the whole collection'],
      answer: [0, 1, 2],
      explain: 'WhenAll limits nothing.'
    },
    {
      t: 'blanks',
      q: 'Clean up the connection asynchronously',
      code: '___ using var conn = new SqlConnection(cs);',
      lang: 'cs',
      tiles: ['await', 'async', 'lock', 'static'],
      answer: ['await'],
      explain: 'await using calls DisposeAsync.'
    },
    {
      t: 'choice',
      q: 'Why is IAsyncEnumerable good for reading a huge file?',
      options: ['Items are processed as they\'re read, without loading the whole file into memory', 'It compresses the file', 'It reads the file on several threads'],
      answer: 0,
      explain: 'A stream of data instead of one giant list.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['CS4014', 'Forgot await'],
        ['CS1996', 'await inside lock'],
        ['TrySetResult', 'Complete a TCS only once'],
        ['BoundedChannel', 'Backpressure']
      ]
    }
  ]
};

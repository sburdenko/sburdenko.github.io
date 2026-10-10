/** Async, unit 5, lesson 5: Channel<T> and Parallel.ForEachAsync (English version). */
export default {
  id: 'as.u5.l5',
  title: 'Channel and Parallel.ForEachAsync',
  sub: 'Pipelines and limiting concurrency',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A pipeline: producer → consumer',
      body: '<p>A <code>Channel&lt;T&gt;</code> is an async queue: some code writes with WriteAsync, other code reads with ReadAllAsync.</p><p>A bounded channel (CreateBounded) makes a fast producer wait until the consumer catches up. This is <b>backpressure</b>.</p>',
      code: 'var ch = Channel.CreateBounded<Job>(100);\n\n// producer\nawait ch.Writer.WriteAsync(job);\n\n// consumer\nawait foreach (var job in ch.Reader.ReadAllAsync())\n    await HandleAsync(job);'
    },
    {
      t: 'choice',
      q: 'A channel with room for 100 items is full. What does WriteAsync do?',
      options: ['Waits asynchronously until there\'s room', 'Drops the oldest item', 'Throws an exception'],
      answer: 0,
      explain: 'That\'s the default behavior (BoundedChannelFullMode.Wait). Dropping items happens only if you ask for it explicitly.'
    },
    {
      t: 'choice',
      q: 'Why bound a channel?',
      options: ['So a fast producer doesn\'t fill up memory when the consumer can\'t keep up', 'So the channel runs faster', '.NET requires it'],
      answer: 0,
      explain: 'With no limit, the queue can grow until memory runs out.'
    },
    {
      t: 'learn',
      title: 'Parallel.ForEachAsync',
      body: '<p>Since .NET 6 you can process a collection asynchronously with a concurrency limit. It won\'t fire off 10,000 requests at once.</p>',
      code: 'await Parallel.ForEachAsync(urls,\n    new ParallelOptions { MaxDegreeOfParallelism = 8 },\n    async (url, ct) => await DownloadAsync(url, ct));'
    },
    {
      t: 'choice',
      q: 'You need to download 10,000 files, at most 8 at a time. What do you pick?',
      options: ['Parallel.ForEachAsync with MaxDegreeOfParallelism = 8', 'Task.WhenAll over all 10,000 at once', 'Sequential await in a loop'],
      answer: 0,
      explain: 'WhenAll over 10,000 tasks will swamp the server, and a sequential loop will take forever.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['A Channel is an async queue between parts of a program', 'A bounded channel gives you backpressure', 'Parallel.ForEachAsync limits the number of concurrent operations', 'Task.WhenAll limits concurrency by itself', 'A Channel stores data on disk'],
      answer: [0, 1, 2],
      explain: 'WhenAll waits for everything you give it; limiting is up to you.'
    },
    {
      t: 'blanks',
      q: 'Limit the concurrency',
      code: 'await Parallel.ForEachAsync(urls,\n    new ParallelOptions { ___ = 8 },\n    async (url, ct) => await DownloadAsync(url, ct));',
      lang: 'cs',
      tiles: ['MaxDegreeOfParallelism', 'BoundedCapacity', 'Timeout', 'Priority'],
      answer: ['MaxDegreeOfParallelism'],
      explain: 'No more than 8 downloads at a time.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Channel<T>', 'An async queue'],
        ['CreateBounded', 'A queue with a limit and waiting'],
        ['ReadAllAsync', 'Read until the channel is closed'],
        ['Parallel.ForEachAsync', 'Process a collection with a limit']
      ]
    }
  ]
};

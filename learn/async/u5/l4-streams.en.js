/** Async, unit 5, lesson 4: IAsyncEnumerable and await using (English version). */
export default {
  id: 'as.u5.l4',
  title: 'Async streams and await using',
  sub: 'await foreach, yield and DisposeAsync',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Data as it arrives',
      body: '<p>A method with async and yield return returns an <code>IAsyncEnumerable&lt;T&gt;</code>: items arrive one at a time, and you can wait between them. You read it with <code>await foreach</code>.</p>',
      code: 'async IAsyncEnumerable<Order> ReadOrdersAsync()\n{\n    await foreach (var line in File.ReadLinesAsync(path))   // .NET 7+\n        yield return Parse(line);\n}\n\nawait foreach (var o in ReadOrdersAsync())\n    Handle(o);'
    },
    {
      t: 'choice',
      q: 'Why is IAsyncEnumerable<T> better than Task<List<T>>?',
      options: ['You can process the first items without waiting for all of them to load', 'It\'s always faster', 'It uses no memory'],
      answer: 0,
      explain: 'You don\'t have to hold a million lines from a file in memory at once.'
    },
    {
      t: 'blanks',
      q: 'Read an async sequence',
      code: '___ ___ (var o in ReadOrdersAsync())\n    Handle(o);',
      lang: 'cs',
      tiles: ['await', 'foreach', 'for', 'async', 'using'],
      answer: ['await', 'foreach'],
      explain: 'await foreach waits for each next item.'
    },
    {
      t: 'learn',
      title: 'Cancellation in an async stream',
      body: '<p>The consumer passes a token with <code>.WithCancellation(ct)</code>, and the generator method receives it in a parameter marked <code>[EnumeratorCancellation]</code>.</p>'
    },
    {
      t: 'learn',
      title: 'await using',
      body: '<p>If cleaning up a resource is itself asynchronous (flushing a buffer to the network, closing a connection), the type implements <code>IAsyncDisposable</code> with a <code>DisposeAsync()</code> method. <code>await using</code> calls it and awaits it at the end of the block.</p>',
      code: 'await using var conn = new SqlConnection(cs);\nawait conn.OpenAsync();'
    },
    {
      t: 'choice',
      q: 'How is await using different from using?',
      options: ['It calls DisposeAsync and awaits it without blocking the thread', 'No difference', 'It frees memory faster'],
      answer: 0,
      explain: 'A plain using would call the synchronous Dispose, which can block the thread.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['await foreach works with IAsyncEnumerable', 'yield return in an async method gives you an IAsyncEnumerable', 'await using calls DisposeAsync', 'await foreach loads all items at once', 'IAsyncDisposable replaces the finalizer'],
      answer: [0, 1, 2],
      explain: 'Items arrive one at a time, and the finalizer is a completely different mechanism.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IAsyncEnumerable', 'An async sequence'],
        ['await foreach', 'Reading it'],
        ['IAsyncDisposable', 'Async cleanup'],
        ['[EnumeratorCancellation]', 'Get the token in a generator']
      ]
    }
  ]
};

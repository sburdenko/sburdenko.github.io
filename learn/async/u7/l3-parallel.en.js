/** Async, unit "Tasks without await", lesson 3: Parallel.For/ForEach/Invoke and PLINQ for CPU work. */
export default {
  id: 'as.u7.l3',
  title: 'Parallel and PLINQ',
  sub: 'Every core on one job — and when it does not pay off',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Data parallelism',
      body: '<p>async is about waiting. This is something else: <b>computation</b>. The same operation over many elements, spread across all cores. For that there are <code>Parallel.For</code>, <code>Parallel.ForEach</code>, <code>Parallel.Invoke</code> and PLINQ.</p><p>The key fact about <code>Parallel.For</code>: it is <b>synchronous</b>. The calling thread blocks until all iterations finish, and it takes iterations itself too. Pool threads pick up the rest.</p><p>This is a tool for CPU work. For I/O there is <code>Parallel.ForEachAsync</code> from unit 5.</p>',
      code: 'var pixels = new float[4096 * 4096];\n\nParallel.For(0, pixels.Length, i =>\n{\n    pixels[i] = MathF.Sqrt(i);   // each iteration writes its own cell\n});\n// we get here once every iteration is done',
      deep: '<p>Inside, Parallel creates a "replicating" task: the calling thread runs it itself, and its copies go to the pool. Each copy grabs ranges of indices, and the ranges grow as work proceeds — this balances the load even when iterations differ in length.</p><p><code>MaxDegreeOfParallelism</code> defaults to −1, meaning no limit: the pool decides how many workers to give. If the loop body blocks, the pool injects threads, and the loop happily takes those too. So a blocking body in Parallel is a road to the pool starvation from unit 4.</p>'
    },
    {
      t: 'choice',
      q: 'A WPF button handler calls Parallel.For with 3 seconds of heavy work. What happens to the window?',
      options: ['It freezes: Parallel.For is synchronous and occupies the calling thread', 'It does not freeze: all iterations go to the pool', 'It throws InvalidOperationException: not allowed from the UI thread', 'It freezes only on a single-core machine'],
      answer: 0,
      explain: 'The UI thread waits for the loop to end and computes iterations itself. The fix: await Task.Run(() => Parallel.For(…)) — then a pool thread does the waiting and the UI thread is free.'
    },
    {
      t: 'learn',
      title: 'Shared data: races and local totals',
      body: '<p>Iterations run at the same time. Each writing its own cell is fine. Changing a shared variable is a race, like <code>count++</code> from two threads in ".NET under the hood". And a <code>lock</code> in every iteration lines the threads up in a queue, and the parallelism is gone.</p><p>The pattern: each worker keeps its own <b>local total</b> and merges it into the shared one once at the end. There is an overload with <code>localInit</code> and <code>localFinally</code> for that.</p>',
      code: 'long total = 0;\nParallel.For(0, data.Length,\n    () => 0L,                                    // localInit: a total per worker\n    (i, state, local) => local + data[i],        // body: only the local sum\n    local => Interlocked.Add(ref total, local)); // localFinally: merge once'
    },
    {
      t: 'tapline',
      q: 'Which line loses increments?',
      code: 'int count = 0;\nParallel.ForEach(words, w =>\n{\n    if (w.Length > 5)\n        count++;\n});\nConsole.WriteLine(count);',
      answer: 4,
      explain: 'count++ is a read, an add and a write. Two threads read the same value, both write +1, and one increment is lost. Use Interlocked.Increment or local totals.'
    },
    {
      t: 'learn',
      title: 'Stopping, exceptions, Invoke',
      body: '<ul><li><code>ParallelLoopState.Stop()</code> — stop as soon as possible;</li><li><code>ParallelLoopState.Break()</code> — do not start iterations with higher indices, but finish all lower ones. Used to find the first match;</li><li><code>ParallelOptions</code>: <code>MaxDegreeOfParallelism</code> and <code>CancellationToken</code> (on cancellation — <code>OperationCanceledException</code>);</li><li>an exception in an iteration: no new iterations start, running ones finish, and all errors arrive as one <code>AggregateException</code>.</li></ul><p><code>Parallel.Invoke</code> runs several <b>different</b> actions and returns when all are done.</p>',
      code: 'var opts = new ParallelOptions\n{\n    MaxDegreeOfParallelism = 2,\n    CancellationToken = ct\n};\n\nParallel.Invoke(opts,\n    () => BuildIndex(),\n    () => CompressLogs(),\n    () => ResizeImages());'
    },
    {
      t: 'choice',
      q: 'You are looking for the element with the lowest index that matches a condition. What do you call in the iteration that found one?',
      options: ['state.Break()', 'state.Stop()', 'return from the lambda', 'Cancel() on your own CancellationTokenSource'],
      answer: 0,
      explain: 'Break guarantees that all iterations with lower indices will run: if one of them matches, you will not miss it. The lowest index Break was called from is in ParallelLoopResult.LowestBreakIteration.',
      wrong: { 1: 'Stop may leave lower-index iterations unexecuted — the element you found is not necessarily the first.', 2: 'return ends only the current iteration; the loop goes on.' }
    },
    {
      t: 'learn',
      title: 'PLINQ: AsParallel',
      body: '<p>PLINQ is parallel LINQ to Objects. <code>AsParallel()</code> turns a sequence into a <code>ParallelQuery&lt;T&gt;</code>, and the operators after it run on several threads.</p><ul><li>The query is lazy, like regular LINQ: the work starts on <code>foreach</code> or <code>ToList</code>.</li><li><b>Order is not preserved.</b> <code>AsOrdered()</code> restores the source order at the cost of buffering.</li><li><code>WithDegreeOfParallelism(n)</code> — how many workers (by default as many as cores), <code>WithCancellation(ct)</code> — cancellation.</li><li><code>ForAll(action)</code> — process results right on the worker threads, without merging them into one thread.</li></ul>',
      code: 'var hits = files\n    .AsParallel()\n    .WithDegreeOfParallelism(4)\n    .Where(f => Hash(f) == target)   // computed on 4 threads\n    .ToList();                       // results are merged, any order',
      deep: '<p>PLINQ analyzes the shape of the query and, for some combinations of operators, decides to run it sequentially if it thinks parallelism will not pay off. <code>WithExecutionMode(ParallelExecutionMode.ForceParallelism)</code> forces parallel execution.</p><p><code>WithMergeOptions</code> controls how results are handed to the consumer: <code>NotBuffered</code> — one at a time right away, <code>FullyBuffered</code> — all at once at the end, <code>AutoBuffered</code> — in chunks (the default).</p>'
    },
    {
      t: 'choice',
      q: 'What is guaranteed about the order of elements in r?',
      code: 'int[] r = Enumerable.Range(1, 8)\n    .AsParallel()\n    .Select(x => x * 10)\n    .ToArray();',
      options: ['Nothing: without AsOrdered the order can be anything', 'Source order: ToArray restores it by itself', 'Source order: Range knows its indices in advance', 'Reverse: the last thread writes first'],
      answer: 0,
      explain: 'Without AsOrdered PLINQ promises no order, even if on a small example it often matches the source. If you need order, use AsParallel().AsOrdered().'
    },
    {
      t: 'learn',
      title: 'When parallelism loses',
      body: '<ul><li><b>A cheap body.</b> Partitioning, delegate calls and merging cost more than <code>x * 2</code>. A thousand such iterations are faster sequentially.</li><li><b>Shared state under a lock.</b> Threads queue up behind the <code>lock</code>.</li><li><b>Memory-bound work.</b> A simple pass over a huge array is limited by RAM bandwidth, not by the number of cores.</li><li><b>False sharing.</b> Threads write to neighboring cells of one cache line and bounce it between cores (cache lines are covered in the "Memory in .NET" course).</li><li><b>I/O inside.</b> Pool threads just sit and wait. Here you need <code>Parallel.ForEachAsync</code> or <code>WhenAll</code>.</li></ul><p>Measurement decides, not intuition: BenchmarkDotNet on real data.</p>',
      deep: '<p>For a cheap body, slice the range coarsely: <code>Partitioner.Create(0, n)</code> hands out "from — to" pairs, and inside each one runs a plain <code>for</code>. One delegate call per chunk instead of per element:</p><p><code>Parallel.ForEach(Partitioner.Create(0, n), r =&gt; { for (int i = r.Item1; i &lt; r.Item2; i++) a[i] *= 2; });</code></p>'
    },
    {
      t: 'tapline',
      q: 'Why does "all downloaded" print before everything is downloaded? Find the line.',
      code: 'Parallel.ForEach(urls, async url =>\n{\n    var html = await http.GetStringAsync(url);\n    Save(url, html);\n});\nConsole.WriteLine("all downloaded");',
      answer: 0,
      explain: 'Parallel.ForEach takes an Action<T>, and the async lambda becomes async void. Each iteration returns at its first await, and the loop considers it done. Errors from async void will also crash the process. For I/O, use await Parallel.ForEachAsync.'
    },
    {
      t: 'multi',
      q: 'Where will Parallel.For or PLINQ most likely speed things up? Select all.',
      options: ['Computing SHA-256 for 10,000 large in-memory buffers', 'Multiplying each element of a 1000-int array by 2', 'Rendering a 4K frame pixel by pixel with a heavy formula on the CPU', 'Downloading 500 pages over HTTP', 'Adding to a shared counter under a lock in every iteration'],
      answer: [0, 2],
      explain: 'Heavy independent CPU work speeds up. 1000 multiplications are cheaper than the overhead, HTTP is waiting, and a shared lock lines threads up in a queue.'
    },
    {
      t: 'blanks',
      q: 'Spread heavy log parsing over 4 threads with PLINQ',
      code: 'var errors = lines\n    .___()\n    .___(4)\n    .Where(l => Parse(l).IsError)\n    .ToList();',
      tiles: ['AsParallel', 'WithDegreeOfParallelism', 'AsOrdered', 'ToParallel', 'MaxDegreeOfParallelism'],
      answer: ['AsParallel', 'WithDegreeOfParallelism'],
      explain: 'AsParallel turns PLINQ on, WithDegreeOfParallelism limits the number of workers. MaxDegreeOfParallelism is a ParallelOptions property for the Parallel class, not a PLINQ operator.'
    },
    {
      t: 'match',
      q: 'Match the tool to the job',
      pairs: [
        ['Parallel.For', 'An index loop with CPU work'],
        ['Parallel.Invoke', 'Several different actions at once'],
        ['AsOrdered', 'Keep the source order in PLINQ'],
        ['ForAll', 'Process results without merging'],
        ['Parallel.ForEachAsync', 'Asynchronous I/O with a limit']
      ]
    }
  ]
};

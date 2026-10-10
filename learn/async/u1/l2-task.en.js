/** Async, unit 1, lesson 2: Task, a promise of a result (English version). */
export default {
  id: 'as.u1.l2',
  title: 'Task: a promise of a result',
  sub: 'A claim ticket instead of the answer',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A Task is a claim ticket',
      body: '<p>A <code>Task</code> is an object meaning "work that will finish later". Think of a dry cleaner\'s ticket: your clothes aren\'t ready yet, but you hold a slip you\'ll trade for them later.</p><p>A <code>Task&lt;string&gt;</code> is a ticket you\'ll trade for a string.</p>'
    },
    {
      t: 'learn',
      title: 'Get the ticket, collect later',
      body: '<p>A task can be in progress, completed successfully, faulted with an error, or canceled.</p>',
      code: 'Task<string> t = http.GetStringAsync(url);   // the ticket\n// … do something else …\nstring html = await t;                       // collect the result',
      deep: 'TaskStatus: Created, WaitingForActivation, WaitingToRun, Running, WaitingForChildrenToComplete, RanToCompletion, Canceled, Faulted. Tasks from async methods and I/O are usually WaitingForActivation: they aren\'t "running" on any thread, and something outside will complete them.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Task', 'Work that will finish later'],
        ['Task<int>', 'The same, with an int result'],
        ['await', 'Wait without blocking the thread'],
        ['.Result', 'Wait by blocking the thread']
      ]
    },
    {
      t: 'choice',
      q: 'A method returned Task<string>. Where is the string?',
      options: ['It may not exist yet: await hands it over when the task completes', 'Inside the Task right away', 'In the Task.Text property'],
      answer: 0,
      explain: 'A task is a promise. The result appears when the operation finishes.'
    },
    {
      t: 'learn',
      title: 'Task.Run is for computation',
      body: '<p><code>Task.Run(() => …)</code> hands work to a thread-pool thread. Use it for heavy computation so the main thread stays free.</p><p>I/O doesn\'t need Task.Run: GetStringAsync already doesn\'t hold a thread.</p>',
      deep: 'Task.Run(async () => …) unwraps the inner task correctly. Task.Factory.StartNew with an async lambda returns Task<Task>, and await then waits only for the start. A classic mistake.'
    },
    {
      t: 'choice',
      q: 'You need to compress a large image without freezing the window. What do you do?',
      options: ['await Task.Run(() => Compress(img))', 'Call Compress(img) directly in the handler', 'Call Compress(img), then Thread.Sleep(0)'],
      answer: 0,
      explain: 'Compression is CPU work. Task.Run moves it to the pool, and await brings the result back to the UI thread.'
    },
    {
      t: 'choice',
      q: 'Should you wrap http.GetStringAsync(url) in Task.Run?',
      options: ['No: the request doesn\'t hold a thread anyway; Task.Run just ties up a pool thread', 'Yes, or it will block the window', 'Yes, it\'s faster'],
      answer: 0,
      explain: 'Async I/O already doesn\'t block. Task.Run on top is wasted work.'
    },
    {
      t: 'multi',
      q: 'How can a task end? Select all that apply.',
      options: ['Successfully, with a result', 'With an error (Faulted)', 'Canceled', 'Paused until the next run'],
      answer: [0, 1, 2],
      explain: 'Those are the three final states. You can\'t pause a task.'
    },
    {
      t: 'blanks',
      q: 'Get the result without blocking the thread',
      code: 'string html = ___ http.GetStringAsync(url);',
      lang: 'cs',
      tiles: ['await', 'async', 'Task', 'lock'],
      answer: ['await'],
      explain: 'await "unwraps" a Task<string> into a string.'
    }
  ]
};

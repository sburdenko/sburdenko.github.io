/** Async, unit 2, lesson 4: several tasks at once, WhenAll and WhenAny (English version). */
export default {
  id: 'as.u2.l4',
  title: 'Several tasks at once',
  sub: 'One by one, WhenAll and WhenAny',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'One by one or together',
      body: '<p>You can await three independent requests one by one: await, await, await. The times add up.</p><p>Or you can start all three at once and wait for them together with <code>Task.WhenAll</code>. Then it takes as long as the slowest one.</p>'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Three requests: 300, 500 and 200 ms. Get the total time down to 500 ms or less.',
      goal: { kind: 'time', mode: 'all', max: 500 },
      solve: ['mode:all']
    },
    {
      t: 'choice',
      q: 'How long does the sequential version take?',
      options: ['1,000 ms', '500 ms', '300 ms'],
      answer: 0,
      explain: '300 + 500 + 200. Each request starts after the previous one ends.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Go back to "one by one" and make the first request fail. What happened to the others?',
      goal: { kind: 'skip' },
      solve: ['fail:A']
    },
    {
      t: 'choice',
      q: 'With sequential awaits, why did B and C never even start after A failed?',
      options: ['await A threw, and execution never reached the lines with B and C', 'WhenAll canceled them', 'The server rejected them all'],
      answer: 0,
      explain: 'An exception stops the method at the very first await.'
    },
    {
      t: 'learn',
      title: 'WhenAny: who\'s first',
      body: '<p><code>Task.WhenAny</code> returns the first task to finish. Handy for "whoever answers fastest" and for timeouts.</p><p>WhenAny itself doesn\'t throw: check the winner or await it.</p>'
    },
    {
      t: 'choice',
      q: 'You need data from the fastest of three mirrors. What do you use?',
      options: ['Task.WhenAny', 'Task.WhenAll', 'Sequential await'],
      answer: 0,
      explain: 'Cancel the other tasks with a token so they don\'t waste resources.'
    },
    {
      t: 'tapline',
      q: 'Why do the requests still run one by one?',
      code: 'var tasks = new List<Task<string>>();\nforeach (var url in urls)\n{\n    var html = await http.GetStringAsync(url);\n    tasks.Add(Task.FromResult(html));\n}\nawait Task.WhenAll(tasks);',
      answer: 3,
      explain: 'The await inside the loop waits for each request before starting the next. Add the tasks themselves to the list, without await.'
    },
    {
      t: 'blanks',
      q: 'Start all the requests at once',
      code: 'var tasks = urls.Select(u => http.GetStringAsync(u));\nstring[] pages = await Task.___(tasks);',
      lang: 'cs',
      tiles: ['WhenAll', 'WhenAny', 'Run', 'Delay'],
      answer: ['WhenAll'],
      explain: 'WhenAll returns an array of results in the same order.'
    }
  ]
};

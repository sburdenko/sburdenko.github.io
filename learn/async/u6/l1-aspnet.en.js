/** Async, unit 6, lesson 1: ASP.NET Core (English version). */
export default {
  id: 'as.u6.l1',
  title: 'ASP.NET Core',
  sub: 'No context, but still no blocking',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'No context on the server',
      body: '<p>ASP.NET Core has no SynchronizationContext: any free pool thread runs the continuation after await. So the classic .Result deadlock doesn\'t happen here.</p><p>Old ASP.NET (Framework) did have a context, and .Result hung there just like in WPF.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'A request handler calls .Result. Run it to the end: will it hang?',
      start: { ctx: 'console', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'result' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Why doesn\'t .Result hang here?',
      options: ['The continuation doesn\'t need a particular thread: any pool thread will run it', 'The server is faster', '.Result works like await in ASP.NET Core'],
      answer: 0,
      explain: 'No context, so nothing is waiting on a main thread.'
    },
    {
      t: 'learn',
      title: 'But .Result still hurts',
      body: '<p>While a request is stuck on .Result, its pool thread is busy doing nothing. A hundred such requests and the pool starves: new requests wait in the queue even though the CPU is free. It\'s the same pool starvation from unit 4.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Rewrite the handler to use await and run it to the end.',
      start: { ctx: 'console', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'await' },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'The server crawls under load, but the CPU is at 5%. The code has lots of .Result. What\'s going on?',
      options: ['Pool threads are blocked, and new requests can\'t get a thread', 'Not enough memory', 'The database is slow'],
      answer: 0,
      explain: 'Classic pool starvation. The cure is await all along the chain.'
    },
    {
      t: 'learn',
      title: 'HttpContext lives only during the request',
      body: '<p>Don\'t carry HttpContext or scoped services (like DbContext) into a background task: the request ends and they get disposed. Copy the data you need up front, and hand background work to a BackgroundService or a queue.</p>',
      code: '// bad\n_ = Task.Run(() => Log(HttpContext.User.Identity.Name));\n\n// good\nvar name = HttpContext.User.Identity.Name;\nawait _queue.EnqueueAsync(name);'
    },
    {
      t: 'tapline',
      q: 'Which line is dangerous?',
      code: 'public async Task<IActionResult> Order(int id)\n{\n    var order = await _db.Orders.FindAsync(id);\n    _ = Task.Run(() => _db.SaveChangesAsync());\n    return Ok(order);\n}',
      answer: 3,
      explain: 'The DbContext is disposed when the request ends, but the background task will still be using it.'
    },
    {
      t: 'multi',
      q: 'Which are true about ASP.NET Core? Select all that apply.',
      options: ['There is no SynchronizationContext', '.Result doesn\'t cause the classic deadlock, but it blocks a pool thread', 'ConfigureAwait(false) in app code changes nothing', 'HttpContext is safe to use after the response'],
      answer: [0, 1, 2],
      explain: 'You must not use HttpContext after the request ends.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['ASP.NET Core', 'No context'],
        ['ASP.NET Framework', 'Had a context; .Result hung'],
        ['Pool starvation', 'Threads busy waiting'],
        ['BackgroundService', 'Work outside a request']
      ]
    }
  ]
};

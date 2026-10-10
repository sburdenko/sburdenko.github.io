/** Async, unit 4, lesson 4: async all the way (English version). */
export default {
  id: 'as.u4.l4',
  title: 'Async all the way',
  sub: 'How to really cure a deadlock',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Don\'t mix them',
      body: '<p>If the code inside is asynchronous, the code outside should await too, all the way up to the event handler or Main. That\'s <b>async all the way</b>.</p><p>Mixing them with .Result and .Wait() is called <b>sync-over-async</b>: it gives you both deadlocks and pool starvation.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Fix the deadlock properly: no ConfigureAwait, just make the handler async.',
      start: { ctx: 'ui', call: 'result' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', call: 'await', cfa: false, ctx: 'ui' },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Why is await better than .Result in a handler?',
      options: ['The UI thread doesn\'t block: continuations and clicks keep running, so a deadlock is impossible', 'The code is shorter', 'The network replies faster'],
      answer: 0,
      explain: 'No blocked thread, no wait cycle.'
    },
    {
      t: 'learn',
      title: 'async Main and async handlers',
      body: '<p>Since C# 7.1, Main can be <code>async Task Main()</code>. Event handlers are <code>async void</code>: the one sensible place for void. ASP.NET Core controllers return <code>Task&lt;IActionResult&gt;</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Where is the sync-over-async?',
      code: 'public IActionResult Get(int id)\n{\n    var user = _repo.GetUserAsync(id).Result;\n    return Ok(user);\n}',
      answer: 2,
      explain: '.Result holds a pool thread for the whole database query.'
    },
    {
      t: 'blanks',
      q: 'Fix the controller',
      code: 'public ___ Task<IActionResult> Get(int id)\n{\n    var user = ___ _repo.GetUserAsync(id);\n    return Ok(user);\n}',
      lang: 'cs',
      tiles: ['async', 'await', 'void', 'lock'],
      answer: ['async', 'await'],
      explain: 'async in the declaration, await before the call.'
    },
    {
      t: 'learn',
      title: 'The reverse problem: async-over-sync',
      body: '<p>Wrapping a synchronous blocking call in Task.Run and naming the method …Async is a trick: a thread is still busy, just a different one.</p><p>Don\'t do this in a library: let the caller decide whether they need Task.Run.</p>'
    },
    {
      t: 'multi',
      q: 'Which of these are sync-over-async? Select all that apply.',
      options: ['task.Result', 'task.Wait()', 'task.GetAwaiter().GetResult()', 'await task', 'await Task.WhenAll(tasks)'],
      answer: [0, 1, 2],
      explain: 'Any synchronous wait on a task blocks the thread.'
    }
  ]
};

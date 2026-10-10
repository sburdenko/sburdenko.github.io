/** Async, unit 4, lesson 2: deadlock with .Result (English version). */
export default {
  id: 'as.u4.l2',
  title: 'Deadlock with .Result',
  sub: 'The classic UI deadlock',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A classic',
      body: '<p>The UI thread calls <code>GetDataAsync().Result</code> and blocks. Inside GetDataAsync, the continuation after await wants to return to the UI thread. But that thread is blocked, waiting for this very task.</p><p>Each waits for the other: a <b>deadlock</b>.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Switch the handler to .Result and drive the program into a hang.',
      start: { ctx: 'ui', call: 'await' }, lock: ['ctx', 'cfa'],
      goal: { status: 'deadlock' },
      solve: ['call:result', 'end']
    },
    {
      t: 'choice',
      q: 'What is the UI thread waiting for?',
      options: ['For the GetDataAsync task to complete', 'For the server to reply', 'For a user click'],
      answer: 0,
      explain: '.Result blocks the thread until the task completes.'
    },
    {
      t: 'choice',
      q: 'And what is the task waiting for?',
      options: ['For the UI thread to run its continuation', 'For the server to reply', 'For garbage collection'],
      answer: 0,
      explain: 'The reply has already arrived. All the task needs is to run its continuation, which sits in the blocked thread\'s queue.'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Keep .Result, but move the code to a console app. Will it hang?',
      start: { ctx: 'ui', call: 'result' }, lock: ['call', 'cfa'],
      goal: { status: 'done', call: 'result', ctx: 'console' },
      solve: ['ctx:console', 'end']
    },
    {
      t: 'choice',
      q: 'Why doesn\'t .Result hang in a console app?',
      options: ['There\'s no context: a pool thread runs the continuation, and it\'s free', 'The console is faster', 'The console doesn\'t support await'],
      answer: 0,
      explain: 'Without a context, the continuation doesn\'t need the blocked thread.'
    },
    {
      t: 'learn',
      title: 'Why it\'s still bad',
      body: '<p>In a console app or ASP.NET Core, .Result won\'t hang, but the thread still sits idle. Under load that\'s pool starvation (lesson 5).</p><p>Blocking on async code is bad everywhere.</p>'
    },
    {
      t: 'order',
      q: 'How a deadlock comes together',
      items: ['The UI thread calls GetDataAsync().Result and blocks', 'The request goes out to the network', 'The reply arrives and the continuation is queued to the UI thread', 'The UI thread can\'t run it: it\'s waiting for the task', 'Nobody ever gets what they\'re waiting for'],
      explain: 'The wait cycle: thread → task → thread.'
    },
    {
      t: 'multi',
      q: 'Where can this deadlock happen? Select all that apply.',
      options: ['WPF', 'WinForms', 'Classic ASP.NET on .NET Framework', 'ASP.NET Core', 'A console app'],
      answer: [0, 1, 2],
      explain: 'It takes a single-threaded context. Old ASP.NET had one (AspNetSynchronizationContext); ASP.NET Core doesn\'t.'
    }
  ]
};

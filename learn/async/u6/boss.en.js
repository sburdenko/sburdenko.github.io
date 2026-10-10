/** Async course final: platforms and everything together (English version). */
export default {
  id: 'as.u6.boss',
  title: 'Course final',
  sub: 'Server, window and game: one mechanism',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'timeline',
      task: 'Find the platform where .Result doesn\'t hang.',
      start: { ctx: 'ui', call: 'result' }, lock: ['call', 'cfa'],
      goal: { status: 'done', call: 'result', cfa: false },
      solve: ['ctx:console', 'end']
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'A Unity script moves a transform after await. Make it all work without freezing frames.',
      start: { ctx: 'unity', call: 'result', cfa: true }, lock: ['ctx'],
      goal: { status: 'done', ctx: 'unity', call: 'await', cfa: false },
      solve: ['call:await', 'cfa', 'end']
    },
    {
      t: 'choice',
      q: 'What do WPF and Unity have in common when it comes to async?',
      options: ['Both install a SynchronizationContext that returns the continuation to the main thread', 'Both forbid await', 'Nothing'],
      answer: 0,
      explain: 'That\'s also why .Result hangs in both.'
    },
    {
      t: 'multi',
      q: 'Where is ConfigureAwait(false) dangerous? Select all that apply.',
      options: ['In a WPF handler that then changes a control', 'In a Unity script that then touches a transform', 'In an HTTP client library', 'In an ASP.NET Core controller'],
      answer: [0, 1],
      explain: 'In a library it helps, and in ASP.NET Core it changes nothing.'
    },
    {
      t: 'tapline',
      q: 'Which line is missing cancellation?',
      code: 'async Awaitable Start()\n{\n    await Awaitable.WaitForSecondsAsync(3f);\n    transform.position = spawnPoint;\n}',
      answer: 2,
      explain: 'Without destroyCancellationToken the wait won\'t be canceled, and the next line will touch a destroyed object.'
    },
    {
      t: 'choice',
      q: 'An ASP.NET Core server responds slower and slower under load, and the CPU is nearly idle. What do you suspect first?',
      options: ['Blocking .Result/.Wait() calls ate up the pool threads', 'A slow CPU', 'Too many awaits'],
      answer: 0,
      explain: 'Pool starvation. Use await all along the chain.'
    },
    {
      t: 'order',
      q: 'Put the path of a continuation after await in WPF in order',
      items: ['await captured the UI context', 'The operation completed on a pool thread', 'The continuation was posted to the context (Post)', 'The UI thread took it from the message queue', 'The code after await ran on the UI thread'],
      explain: 'If the UI thread is blocked on .Result at that moment, step 4 never happens. That\'s the deadlock.'
    },
    {
      t: 'match',
      q: 'Match each platform to its context',
      pairs: [
        ['WPF', 'DispatcherSynchronizationContext'],
        ['WinForms', 'WindowsFormsSynchronizationContext'],
        ['Unity', 'UnitySynchronizationContext'],
        ['ASP.NET Core', 'No context']
      ]
    },
    {
      t: 'choice',
      q: 'The main rule of the whole course?',
      options: ['Async all the way: don\'t block async code with .Result and .Wait()', 'Use Task.Run everywhere', 'Always ConfigureAwait(false)'],
      answer: 0,
      explain: 'Everything else is platform detail.'
    }
  ]
};

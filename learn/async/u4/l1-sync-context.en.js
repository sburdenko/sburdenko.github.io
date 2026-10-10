/** Async, unit 4, lesson 1: SynchronizationContext (English version). */
export default {
  id: 'as.u4.l1',
  title: 'SynchronizationContext',
  sub: 'Who runs the code after await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Where code resumes after await',
      body: '<p>await remembers the current <b>SynchronizationContext</b>. In WPF and WinForms that means "the UI thread": the continuation is queued to the window and runs there, so you can touch controls.</p><p>A console app or ASP.NET Core has no context: any pool thread runs the continuation.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Run the scenario in WPF, then switch to a console app and see who runs the continuations.',
      start: { ctx: 'ui', call: 'await' }, lock: ['call', 'cfa'],
      goal: { status: 'done', ctx: 'console', call: 'await' },
      solve: ['end', 'ctx:console', 'end']
    },
    {
      t: 'choice',
      q: 'Why can you write label.Text = … after await in WPF?',
      options: ['The continuation came back to the UI thread through the synchronization context', 'WPF lets you change controls from any thread', 'await blocks the UI thread'],
      answer: 0,
      explain: 'That\'s the main job of SynchronizationContext in windowed apps.'
    },
    {
      t: 'multi',
      q: 'Where is there a SynchronizationContext by default? Select all that apply.',
      options: ['WPF', 'WinForms', 'Unity', 'A console app', 'ASP.NET Core'],
      answer: [0, 1, 2],
      explain: 'A console app and ASP.NET Core have no context; the pool runs continuations.'
    },
    {
      t: 'learn',
      title: 'A context is a queue',
      body: '<p>The UI context is a queue: clicks, redraws, continuations after await. One thread works through it, one item at a time.</p><p>If that thread is busy or blocked, the queue stalls.</p>'
    },
    {
      t: 'choice',
      q: 'The UI thread is busy with a long computation while a continuation waits in the queue. When does it run?',
      options: ['When the thread frees up and reaches it', 'Right away, on another thread', 'Never'],
      answer: 0,
      explain: 'The continuation waits its turn, just like clicks.'
    },
    {
      t: 'learn',
      title: 'When there is no context',
      body: '<p>If no SynchronizationContext is set, await looks at the current TaskScheduler. By default that\'s the thread pool.</p>',
      deep: 'SynchronizationContext.Current and TaskScheduler.Current are checked at the moment of the await. You install your own context with SynchronizationContext.SetSynchronizationContext; that\'s how test frameworks and Unity run continuations on a single thread.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['WPF', 'DispatcherSynchronizationContext'],
        ['WinForms', 'WindowsFormsSynchronizationContext'],
        ['Unity', 'UnitySynchronizationContext'],
        ['ASP.NET Core', 'No context']
      ]
    }
  ]
};

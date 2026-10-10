/** Async, unit 6, lesson 2: WPF and WinForms (English version). */
export default {
  id: 'as.u6.l2',
  title: 'WPF and WinForms',
  sub: 'The UI thread, Dispatcher and Task.Run',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'One thread for every control',
      body: '<p>A single UI thread draws the window and handles clicks. Controls may only be touched from that thread. await in a handler brings you back there on its own, which is why <code>label.Text = ...</code> works after await.</p>'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'After await, the handler writes to label.Text. Someone added ConfigureAwait(false), and everything broke. Fix it.',
      start: { ctx: 'ui', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'done', ctx: 'ui', cfa: false },
      solve: ['cfa', 'end']
    },
    {
      t: 'choice',
      q: 'Which exception do you get in WPF if you touch a control from another thread?',
      options: ['InvalidOperationException: "The calling thread cannot access this object because a different thread owns it"', 'NullReferenceException', 'OutOfMemoryException'],
      answer: 0,
      explain: 'WinForms throws a similar InvalidOperationException about a cross-thread operation.'
    },
    {
      t: 'learn',
      title: 'Getting back to the UI thread by hand',
      body: '<p>If your code is already on another thread (a timer event, a library callback), ask the UI thread to do the work:</p>',
      code: '// WPF\nawait Dispatcher.InvokeAsync(() => label.Content = text);\n\n// WinForms\nlabel.BeginInvoke(() => label.Text = text);'
    },
    {
      t: 'learn',
      title: 'Heavy computation goes to Task.Run',
      body: '<p>await by itself doesn\'t move work off the UI thread: synchronous code before the first await runs right there. Hand heavy calculations to the pool with Task.Run, and show the result after await.</p>',
      code: 'async void Build_Click(object s, EventArgs e)\n{\n    var mesh = await Task.Run(() => BuildMesh(points));\n    viewport.Show(mesh);          // back on the UI thread\n}'
    },
    {
      t: 'choice',
      q: 'A button handler has await CalculateAsync(), yet the window still freezes for 3 seconds. Why?',
      options: ['CalculateAsync computes synchronously until its first await, which means on the UI thread', 'await always freezes the window', 'ConfigureAwait(false) is missing'],
      answer: 0,
      explain: 'async doesn\'t make code run in the background. Hand the calculation to Task.Run.'
    },
    {
      t: 'order',
      q: 'Put what happens on a click in order',
      items: ['The handler starts on the UI thread', 'Task.Run hands the calculation to the pool', 'The UI thread is free and handles clicks', 'The calculation ends and the continuation is queued to the UI', 'The UI thread shows the result'],
      explain: 'While the pool computes, the window stays alive.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['await in a handler returns to the UI thread', 'Dispatcher.InvokeAsync runs code on the UI thread', 'Task.Run moves heavy calculation off the UI thread', 'A button handler must be async Task'],
      answer: [0, 1, 2],
      explain: 'The event sets the handler\'s signature, so async void is fine there.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Dispatcher.InvokeAsync', 'WPF: run on the UI thread'],
        ['Control.BeginInvoke', 'WinForms: run on the UI thread'],
        ['Task.Run', 'Computation on the pool'],
        ['DispatcherSynchronizationContext', 'Brings await back to the WPF UI thread']
      ]
    }
  ]
};

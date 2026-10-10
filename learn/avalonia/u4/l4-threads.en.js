/** Avalonia, unit 4, lesson 4: the UI thread and Dispatcher. */
export default {
  id: 'av.u4.l4',
  title: 'The UI thread',
  sub: 'Dispatcher.UIThread and async in commands',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'One thread for the UI',
      body: '<p>As in WPF and Unity, Avalonia controls can be touched only from the <b>UI thread</b>. From any other thread you get <code>InvalidOperationException: Call from invalid thread</code>.</p>'
    },
    {
      t: 'choice',
      q: 'A background thread writes to TextBlock.Text. What happens?',
      options: ['InvalidOperationException: Call from invalid thread', 'The text updates', 'The text updates after a delay'],
      answer: 0,
      explain: 'Controls check which thread is accessing them.'
    },
    {
      t: 'learn',
      title: 'Ask the UI thread',
      body: '<p><code>Dispatcher.UIThread</code> is the UI thread\'s queue.</p>',
      code: '// queue it and do not wait\nDispatcher.UIThread.Post(() => Status = "Done");\n\n// queue it and wait\nawait Dispatcher.UIThread.InvokeAsync(() => Status = "Done");\n\n// are we already on the UI thread?\nif (Dispatcher.UIThread.CheckAccess()) { … }'
    },
    {
      t: 'learn',
      title: 'Most of the time you do not need Dispatcher',
      body: '<p>In an async command, await brings you back to the UI thread on its own: Avalonia installs its own SynchronizationContext. Hand heavy computation to <code>Task.Run</code> and assign the result after await.</p>',
      code: '[RelayCommand]\nprivate async Task BuildAsync()\n{\n    var mesh = await Task.Run(() => Heavy(points));  // on the pool\n    Mesh = mesh;                                       // back on the UI thread\n}'
    },
    {
      t: 'choice',
      q: 'A command computes for 3 seconds right on the UI thread, and the window freezes. How do you fix it?',
      options: ['Move the computation to Task.Run and await it', 'Wrap the computation in Dispatcher.UIThread.Post', 'Make the method async void'],
      answer: 0,
      explain: 'Post also runs the computation on the UI thread, so the window still freezes.'
    },
    {
      t: 'blanks',
      q: 'Update the status from a background thread',
      code: 'Dispatcher.___.___(() => Status = "Done");',
      tiles: ['UIThread', 'Post', 'Current', 'Run', 'Invoke'],
      answer: ['UIThread', 'Post'],
      explain: 'Post queues the action on the UI thread.'
    },
    {
      t: 'tapline',
      q: 'Which line will crash?',
      code: 'timer.Elapsed += (_, _) =>\n{\n    var now = DateTime.Now;\n    ClockText.Text = now.ToString("T");\n};',
      answer: 3,
      explain: 'System.Timers.Timer calls its handler on the thread pool. You need Dispatcher.UIThread.Post or a DispatcherTimer.'
    },
    {
      t: 'match',
      q: 'Match each API to what it does',
      pairs: [
        ['Dispatcher.UIThread.Post', 'Queue on the UI thread, do not wait'],
        ['InvokeAsync', 'Queue on the UI thread and wait'],
        ['CheckAccess', 'Are we on the UI thread already?'],
        ['DispatcherTimer', 'A timer that ticks on the UI thread']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['After await in a command, the code continues on the UI thread', 'Task.Run moves heavy work off the UI thread', '.Result on the UI thread can hang the app', 'Controls can be touched from any thread'],
      answer: [0, 1, 2],
      explain: 'The .Result deadlock is covered in detail in the "Async/await all the way down" course.'
    }
  ]
};

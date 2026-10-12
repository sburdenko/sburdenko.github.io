/** Final of the "Tasks without await" unit of the async/await course. */
export default {
  id: 'as.u7.boss',
  title: 'Final: tasks without await',
  sub: 'ContinueWith, schedulers, Parallel, timers and cancellation',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A WPF button handler, not inside any task. Where does Heavy() run?',
      code: 'void OnClick(object sender, RoutedEventArgs e)\n{\n    Task.Factory.StartNew(() => Heavy());\n}',
      options: ['On the pool: outside a task TaskScheduler.Current is Default', 'On the UI thread: StartNew takes the current SynchronizationContext', 'On the UI thread: StartNew without a scheduler takes Current', 'On a new dedicated thread: that is how StartNew works by default'],
      answer: 0,
      explain: 'Current is the scheduler of the running task, not the thread\'s context. A button handler is not a task, so Current is Default. The trap fires only when the code is already inside a task on a UI scheduler. It is safer not to guess and to write Task.Run.'
    },
    {
      t: 'tapline',
      q: 'Which line throws TaskCanceledException whatever the outcome of LoadAsync?',
      code: 'var t = LoadAsync();\nvar show = t.ContinueWith(x => Show(x.Result),\n    TaskContinuationOptions.OnlyOnRanToCompletion);\nvar log = t.ContinueWith(x => Log(x.Exception!),\n    TaskContinuationOptions.OnlyOnFaulted);\nawait Task.WhenAll(show, log);',
      answer: 5,
      explain: 'Of the two continuations one is always skipped and moves to Canceled: on success it is log, on failure it is show. WhenAll with a cancelled task is cancelled too, and await throws TaskCanceledException.'
    },
    {
      t: 'multi',
      q: 'How does Task.Run(work) differ from Task.Factory.StartNew(work)? Select all.',
      options: ['Task.Run always goes to TaskScheduler.Default', 'Task.Run forbids attaching child tasks', 'Task.Run unwraps the Task<Task> from an async lambda', 'Task.Run allocates a dedicated thread for long work', 'Task.Run picks up the caller\'s cancellation token by itself'],
      answer: [0, 1, 2],
      explain: 'Task.Run = StartNew with DenyChildAttach, TaskScheduler.Default and Unwrap for async lambdas. Only LongRunning gives a dedicated thread, and Task.Run uses only a token passed to it explicitly.'
    },
    {
      t: 'choice',
      q: 'Inside Task.Run a library creates a task with AttachedToParent and throws from it. What does await on your task see?',
      options: ['Nothing: the child did not attach, its error stays in its own task', 'An AggregateException with the child\'s error', 'Your task waits for the child and completes together with it', 'InvalidOperationException: attaching is forbidden'],
      answer: 0,
      explain: 'DenyChildAttach on the Task.Run task silently turns the child into an independent task. No waiting, no foreign exceptions. The child\'s error is the concern of whoever created it.'
    },
    {
      t: 'choice',
      q: 'You need a report in the source row order, but the heavy formula should run on all cores. What do you add?',
      code: 'var report = rows\n    .AsParallel()\n    // ???\n    .Select(r => Heavy(r))\n    .ToList();',
      options: ['.AsOrdered()', '.WithDegreeOfParallelism(1)', '.OrderBy(r => r)', 'Nothing: ToList preserves order'],
      answer: 0,
      explain: 'AsOrdered makes PLINQ return results in the source order while computing them in parallel. WithDegreeOfParallelism(1) kills the parallelism, and OrderBy sorts by value, not by position.'
    },
    {
      t: 'choice',
      q: 'A PeriodicTimer has a 5 s period, and the work in the loop takes 8 s. How do the runs go?',
      options: ['Back to back: one missed tick is pending, extra ones do not pile up', 'Overlapping: a new instance starts every 5 s', 'Every 10 s: a missed tick postpones the next one', 'Missed ticks accumulate, and the loop catches up on them'],
      answer: 0,
      explain: 'While the work runs, the timer remembers at most one tick. The next wait completes immediately, and the work takes 8 s again. No overlap: a new iteration does not start until you return to WaitForNextTickAsync.'
    },
    {
      t: 'choice',
      q: 'A background thread (IsBackground = true) is writing a file in try/finally when Main ends. What about finally?',
      options: ['It does not run: the runtime stops background threads without an exception', 'It runs: finally always runs', 'It runs: on exit a ThreadAbortException is raised in the thread', 'The process waits until the background thread finishes the file'],
      answer: 0,
      explain: 'Background threads do not hold the process. When the last foreground thread ends, they are cut off where they are, and finally does not run. For a clean exit — a cancellation token and waiting for the work.'
    },
    {
      t: 'blanks',
      q: 'Cancel the request if the caller cancels or 10 seconds pass, and leave no subscription on someone else\'s token',
      code: '___ var cts = CancellationTokenSource.___(ct);\ncts.___(TimeSpan.FromSeconds(10));\nreturn await FetchAsync(cts.Token);',
      tiles: ['using', 'CreateLinkedTokenSource', 'CancelAfter', 'await', 'Register', 'Cancel'],
      answer: ['using', 'CreateLinkedTokenSource', 'CancelAfter'],
      explain: 'The linked source is cancelled for either reason, CancelAfter adds the timeout, and using removes the subscription on ct when the method ends.'
    },
    {
      t: 'match',
      q: 'Match them and test yourself on the whole unit',
      pairs: [
        ['Unwrap()', 'A task that waits for the inner task'],
        ['LongRunning', 'A dedicated thread for blocking work'],
        ['ParallelLoopState.Break()', 'Finish the iterations with lower indices'],
        ['ExecuteSynchronously', 'A continuation without the scheduler queue'],
        ['CancellationToken.Register', 'A callback on the thread that called Cancel']
      ]
    }
  ]
};

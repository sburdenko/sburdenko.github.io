/** Async, unit "Tasks without await", lesson 2: TaskScheduler, StartNew vs. Task.Run, child tasks. */
export default {
  id: 'as.u7.l2',
  title: 'The scheduler and StartNew',
  sub: 'TaskScheduler, TaskCreationOptions and child tasks',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Who runs a task: TaskScheduler',
      body: '<p>A task that has a delegate does not start itself. It is handed to a <b>task scheduler</b> (TaskScheduler), which decides where and when to run it:</p><ul><li><code>TaskScheduler.Default</code> — the thread pool;</li><li><code>FromCurrentSynchronizationContext()</code> — into the current context, for example the UI thread;</li><li><code>ConcurrentExclusiveSchedulerPair</code> — a ready-made pair for limits: "no more than N at once" and "strictly one at a time".</li></ul><p>Tasks from async methods and <code>TaskCompletionSource</code> have no delegate: they are not run but <b>completed</b> from outside (as in unit 1). They need no scheduler.</p>',
      code: 'TaskScheduler pool = TaskScheduler.Default;\nTaskScheduler ui = TaskScheduler.FromCurrentSynchronizationContext();\n\nvar pair = new ConcurrentExclusiveSchedulerPair(\n    TaskScheduler.Default, maxConcurrencyLevel: 4);\nTaskScheduler four = pair.ConcurrentScheduler;   // no more than 4 at once\nTaskScheduler one = pair.ExclusiveScheduler;     // strictly one; the "four" waits',
      deep: '<p>A custom scheduler derives from <code>TaskScheduler</code> and implements three methods: <code>QueueTask</code> (accept a task), <code>TryExecuteTaskInline</code> (may it run right now on this thread) and <code>GetScheduledTasks</code> (for the debugger).</p><p>Inlining happens, for example, on <code>Wait()</code> for a task that has not started yet: the waiting thread may run it itself instead of standing idle. One more detail: if there is no <code>SynchronizationContext</code> and <code>TaskScheduler.Current</code> is not Default, <code>await</code> resumes on that scheduler. Code under a <code>ConcurrentExclusiveSchedulerPair</code> stays under it after await.</p>'
    },
    {
      t: 'choice',
      q: 'Which task never goes through a TaskScheduler at all?',
      options: ['A task returned by an async method', 'A task from Task.Run', 'A task from Task.Factory.StartNew', 'A continuation task from ContinueWith'],
      answer: 0,
      explain: 'An async method\'s task is a promise without a delegate: the state machine builder completes it. The other three carry a delegate, and someone has to run it — that is exactly the scheduler\'s job.'
    },
    {
      t: 'learn',
      title: 'Task.Run is StartNew with the right settings',
      body: '<p><code>Task.Run</code> arrived in .NET 4.5 as a shorthand for the most common case. It equals <code>StartNew</code> with three explicit decisions: no token, no child attachment, strictly the pool. And for an async lambda it also does <code>Unwrap</code>.</p><p>A "bare" <code>Task.Factory.StartNew(work)</code> differs in everything: scheduler <code>Current</code> (the trap from the last lesson), options <code>None</code>, no unwrapping.</p><p>You need <code>StartNew</code> when you need what it offers: a custom scheduler, <code>LongRunning</code>, a state object without a closure.</p>',
      code: 'Task.Run(work);\n\n// almost the same as:\nTask.Factory.StartNew(work,\n    CancellationToken.None,\n    TaskCreationOptions.DenyChildAttach,\n    TaskScheduler.Default);\n// + for a Func<Task> Task.Run calls Unwrap itself'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'var sw = Stopwatch.StartNew();\nawait Task.Factory.StartNew(async () => await Task.Delay(1000));\nConsole.WriteLine(sw.ElapsedMilliseconds);',
      options: ['About 0', 'About 1000', 'About 2000', 'Does not compile: StartNew does not accept an async lambda'],
      answer: 0,
      explain: 'StartNew returned Task<Task>. The outer task completed when the lambda reached its first await and returned the inner task. await waited only for that. With Task.Run it would be about 1000.'
    },
    {
      t: 'learn',
      title: 'TaskCreationOptions',
      body: '<p>Creation options are hints for the scheduler and rules for task relationships:</p><ul><li><code>LongRunning</code> — work that takes a long time. The default scheduler gives it a <b>dedicated thread</b> instead of a pool thread: the pool keeps its worker and does not have to wait to inject new threads;</li><li><code>PreferFairness</code> — into the pool\'s global queue rather than the current thread\'s local queue: closer to first come, first served;</li><li><code>AttachedToParent</code> and <code>DenyChildAttach</code> — task relationships, more on them below;</li><li><code>HideScheduler</code> — inside the task <code>TaskScheduler.Current</code> looks like Default;</li><li><code>RunContinuationsAsynchronously</code> — as with <code>TaskCompletionSource</code> in unit 5.</li></ul>',
      deep: '<p>In the default scheduler <code>LongRunning</code> is literal: it creates <code>new Thread(…) { IsBackground = true }</code>, which runs one task and exits. Creating a thread means an OS object and a stack reservation, on the order of tens of microseconds or more. For short tasks the option hurts.</p><p>It is only a hint: a custom scheduler may ignore it. And with an async lambda the dedicated thread lives only until the first real pause.</p>'
    },
    {
      t: 'choice',
      q: 'How long does the dedicated thread allocated for LongRunning live?',
      code: 'Task.Factory.StartNew(async () =>\n{\n    while (true)\n    {\n        var msg = await queue.ReadAsync();\n        Handle(msg);\n    }\n}, TaskCreationOptions.LongRunning);',
      options: ['Until the first real pause at an await', 'As long as the loop spins, i.e. forever', 'Not at all: the option fails with an async lambda', 'Until the garbage collector collects the task'],
      answer: 0,
      explain: 'The delegate is an async lambda. At the first incomplete await it returns a task, and the thread is free — so it exits. The loop continues on pool threads. The dedicated thread was created for nothing. This loop does not need LongRunning: it does not hold a thread anyway.'
    },
    {
      t: 'learn',
      title: 'Child tasks: AttachedToParent',
      body: '<p>A task created <b>inside a running task</b> with <code>AttachedToParent</code> becomes its child:</p><ul><li>the parent does not complete until all its children have. While it waits, its status is <code>WaitingForChildrenToComplete</code>;</li><li>children\'s exceptions end up in the parent\'s <code>AggregateException</code>.</li></ul><p>Without the option a nested task is independent (detached): the parent knows nothing about it.</p><p>This is the "structured parallelism" model of .NET 4.0. New code does the same explicitly: collect the tasks and wait with <code>WhenAll</code>.</p>',
      deep: '<p>How it works: on creation a task checks which task is currently running on this thread. If <code>AttachedToParent</code> is set and that task has no <code>DenyChildAttach</code>, the parent\'s counter of unfinished children goes up. When the parent finishes its delegate, it decrements the counter for itself; each child decrements it on completion. Zero means the parent is complete.</p>'
    },
    {
      t: 'choice',
      q: 'What does the code print?',
      code: 'var parent = Task.Factory.StartNew(() =>\n{\n    Task.Factory.StartNew(() =>\n    {\n        Thread.Sleep(500);\n        Console.WriteLine("child");\n    }, TaskCreationOptions.AttachedToParent);\n    Console.WriteLine("parent");\n});\nparent.Wait();\nConsole.WriteLine("done");',
      options: ['parent, child, done', 'parent, done, child', 'child, parent, done', 'done, parent, child'],
      answer: 0,
      explain: 'The child is attached: Wait on the parent waits for it too. "parent" prints at once, "child" after 500 ms, and only then is the parent complete and "done" printed.'
    },
    {
      t: 'learn',
      title: 'Why Task.Run sets DenyChildAttach',
      body: '<p>Whether to attach is decided by the <b>child</b>, that is, by someone else\'s code. Imagine a library inside your <code>Task.Run</code> creates a task with <code>AttachedToParent</code>. Your task suddenly waits for foreign work and receives foreign exceptions — and you never asked for that.</p><p><code>DenyChildAttach</code> on the parent silently cancels such requests: the child becomes an ordinary independent task, without any error. <code>Task.Run</code> always sets it.</p>'
    },
    {
      t: 'choice',
      q: 'In the code from the previous exercise the outer StartNew was replaced with Task.Run. What changes?',
      options: ['done prints before child: the child does not attach', 'Nothing: the child\'s option beats the parent\'s settings', 'Creating the child throws InvalidOperationException', 'child never prints: the child task gets cancelled'],
      answer: 0,
      explain: 'Task.Run sets DenyChildAttach, and the child\'s AttachedToParent is silently ignored. Wait covers only the parent body: "parent", "done", and "child" after 500 ms if the process is still alive.'
    },
    {
      t: 'blanks',
      q: 'Hardware polling is a blocking loop that runs for hours. Give it a dedicated thread without touching the pool, strictly through the standard scheduler',
      code: 'Task.Factory.StartNew(PollHardware,\n    CancellationToken.None,\n    TaskCreationOptions.___ | TaskCreationOptions.DenyChildAttach,\n    TaskScheduler.___);',
      tiles: ['LongRunning', 'Default', 'Current', 'PreferFairness', 'AttachedToParent'],
      answer: ['LongRunning', 'Default'],
      explain: 'LongRunning with the default scheduler gives a dedicated thread. Default so as not to depend on which task the code is called from.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['Task.Run always uses TaskScheduler.Default', 'Task.Factory.StartNew without a scheduler takes TaskScheduler.Current', 'Task.Run unwraps the Task<Task> from an async lambda', 'LongRunning guarantees a dedicated thread with any scheduler', 'PreferFairness makes a task run faster'],
      answer: [0, 1, 2],
      explain: 'LongRunning is a hint: only the default scheduler turns it into a dedicated thread. PreferFairness changes the queue, not the speed.'
    },
    {
      t: 'match',
      q: 'Match the option to its effect',
      pairs: [
        ['LongRunning', 'A dedicated thread instead of the pool'],
        ['PreferFairness', 'The global queue instead of the local one'],
        ['AttachedToParent', 'The parent waits for this child'],
        ['DenyChildAttach', 'Children cannot attach'],
        ['HideScheduler', 'Inside, Current looks like Default']
      ]
    }
  ]
};

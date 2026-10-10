/** Unit 4, lesson 4: the thread pool. */
const ticks = n => Array(n).fill('tick:1');

export default {
  id: 'dotnet.w4.l4',
  title: 'The thread pool',
  sub: 'Ready-made threads and a work queue',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Why a pool',
      body: '<p>Creating a thread for every small task is expensive. The <b>thread pool</b> (ThreadPool) keeps a set of ready threads: tasks join a queue, and a free thread picks up the next one.</p><p><code>Task.Run</code>, timers and continuations after <code>await</code> all run on the pool.</p>',
      flow: ['Task.Run(…)', 'Pool queue', 'Free thread', 'Execution'],
      code: 'Task.Run(() => Compress(file));\nThreadPool.QueueUserWorkItem(_ => Log("done"));'
    },
    {
      t: 'rig', rig: 'pool', adds: ['cpu'],
      task: 'Add 16 CPU tasks and start the clock. Watch the threads work through the queue.',
      goal: { kind: 'done', n: 16 },
      solve: ['add:cpu:8', 'add:cpu:8', ...ticks(12)]
    },
    {
      t: 'choice',
      q: 'How many threads does the pool have at startup?',
      options: ['Usually one per logical CPU core', 'One', 'A thousand', 'As many as there are queued tasks'],
      answer: 0,
      explain: 'By default the pool\'s minimum thread count equals the number of logical processors. From there the pool grows as needed.'
    },
    {
      t: 'learn',
      title: 'The pool grows carefully',
      body: '<p>If every thread is busy and the queue is stuck, the pool adds a thread, but gradually, not all at once. Too many threads is bad too: they get in each other\'s way and eat memory.</p>',
      deep: 'The thread count is tuned by a hill-climbing algorithm: the pool tries adding or removing a thread and checks whether throughput went up. ThreadPool.SetMinThreads is a crutch that hides the problem instead of solving it.'
    },
    {
      t: 'choice',
      q: 'Why doesn\'t the pool create 1,000 threads right away for 1,000 tasks?',
      options: ['Threads are expensive and there are few cores anyway: extra threads would just keep switching', 'Windows forbids it', 'The pool can\'t count to 1,000'],
      answer: 0,
      explain: 'On 8 cores, at most 8 threads run at once. The rest would burn time on switches and memory on stacks.'
    },
    {
      t: 'multi',
      q: 'What runs on the thread pool? Select all that apply.',
      options: ['Task.Run(…)', 'The continuation after await in a console app and ASP.NET Core', 'A System.Threading.Timer callback', 'Code on the WPF UI thread', 'new Thread(…).Start()'],
      answer: [0, 1, 2],
      explain: 'The UI thread is a separate thread of its own. new Thread creates a new thread outside the pool.'
    },
    {
      t: 'choice',
      q: 'A pool task spends 10 minutes building a report. What\'s wrong with that?',
      options: ['It ties up a pool thread for a long time; long tasks are better on a dedicated thread (TaskCreationOptions.LongRunning)', 'Nothing', 'The pool kills it after a minute'],
      answer: 0,
      explain: 'The pool is built for short tasks. A long one holds a thread, and the pool has to ramp up to compensate.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Thread', 'A dedicated thread you create yourself'],
        ['ThreadPool', 'Ready threads with a shared queue'],
        ['Task.Run', 'Queue work to the pool'],
        ['CPU core', 'Runs one thread at any given moment']
      ]
    }
  ]
};

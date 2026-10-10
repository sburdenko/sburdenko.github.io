/** Async, unit 4, lesson 5: thread-pool starvation from sync-over-async (English version). */
const ticks = n => Array(n).fill('tick:1');

export default {
  id: 'as.u4.l5',
  title: 'Thread-pool starvation',
  sub: 'The server doesn\'t crash, it crawls',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A server that crawls',
      body: '<p>ASP.NET Core has no context, so .Result won\'t hang. But every such request holds a pool thread while it waits for the database.</p><p>Under load the threads run out, the pool adds new ones slowly, and responses stretch to seconds while the CPU is nearly idle.</p>'
    },
    {
      t: 'rig', rig: 'pool', adds: ['block'],
      task: 'Add 16 requests with .Result and start the clock. How many threads are stuck, and how does the pool grow?',
      goal: { kind: 'threads', min: 6 },
      solve: ['add:block:8', 'add:block:8', ...ticks(8)]
    },
    {
      t: 'rig', rig: 'pool', adds: ['block', 'async'],
      task: 'Now the same 16 requests, but with await.',
      goal: { kind: 'done', n: 16, of: 'async' },
      solve: ['add:async:8', 'add:async:8', ...ticks(14)]
    },
    {
      t: 'choice',
      q: 'What did the two exercises show?',
      options: ['Blocking requests tie up threads and bloat the pool; with await the same 4 threads cope', 'await creates more threads', 'No difference'],
      answer: 0,
      explain: 'Waiting without a thread is the main win of async on a server.'
    },
    {
      t: 'choice',
      q: 'Under load, responses lag by seconds and the CPU is nearly idle. What do you suspect first?',
      options: ['Pool starvation: a .Result or .Wait() somewhere', 'A slow disk', 'Too much memory'],
      answer: 0,
      explain: 'An idle CPU with growing latency means the threads exist but are stuck.'
    },
    {
      t: 'learn',
      title: 'How to find it',
      body: '<p>In <code>dotnet-counters</code>, watch the pool\'s queue length and thread count. A growing queue with low CPU usage is a sure sign.</p>',
      deep: 'dotnet-counters monitor --counters System.Runtime shows ThreadPool Queue Length and ThreadPool Thread Count. In a process dump (dotnet-dump) during starvation you\'ll see dozens or hundreds of threads whose stacks end in .Result or Wait.'
    },
    {
      t: 'multi',
      q: 'What can cause pool starvation? Select all that apply.',
      options: ['.Result and .Wait() on tasks that query a database', 'Thread.Sleep in code running on the pool', 'A synchronous read from a slow disk in every request', 'await httpClient.GetAsync(…)', 'Short computations with no waiting'],
      answer: [0, 1, 2],
      explain: 'Anything that holds a pool thread without doing work.'
    },
    {
      t: 'choice',
      q: 'A quick "fix": ThreadPool.SetMinThreads(500, 500). What do you think?',
      options: ['It hides the symptom: threads still sit idle and eat memory; the cure is switching to await', 'A great solution', 'It speeds up the database'],
      answer: 0,
      explain: 'Hundreds of waiting threads cost memory and context switches. The real cure is not blocking.'
    }
  ]
};

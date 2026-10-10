/** Unit 4, lesson 5: thread pool starvation and a bridge to async/await. */
const ticks = n => Array(n).fill('tick:1');

export default {
  id: 'dotnet.w4.l5',
  title: 'Thread pool starvation',
  sub: '.Result, Thread.Sleep and why a thread shouldn\'t wait',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A waiting thread is a wasted thread',
      body: '<p>If code on the pool calls <code>.Result</code>, <code>.Wait()</code> or <code>Thread.Sleep</code>, the thread just sits there doing nothing while it waits for the network or disk.</p><p>Tie up every thread like that, and new tasks pile up in the queue. That\'s <b>thread pool starvation</b>.</p>'
    },
    {
      t: 'rig', rig: 'pool', adds: ['block'],
      task: 'Add 16 requests that wait on the network via .Result and start the clock. See how many threads are stuck and how the pool grows.',
      goal: { kind: 'threads', min: 6 },
      solve: ['add:block:8', 'add:block:8', ...ticks(8)]
    },
    {
      t: 'choice',
      q: 'The pool keeps adding threads, but the queue still doesn\'t move. Why?',
      options: ['The new threads also pick up .Result requests and start waiting too', 'The pool is broken', '.Result requests run one at a time'],
      answer: 0,
      explain: 'As long as the code blocks the thread, every new thread just becomes one more waiter.'
    },
    {
      t: 'learn',
      title: 'What if we don\'t block?',
      body: '<p>With <code>await</code>, the thread doesn\'t wait for the network: it sends the request and goes straight back to the pool for the next task.</p><p>When the response arrives, the continuation joins the queue and runs on any free thread.</p>'
    },
    {
      t: 'rig', rig: 'pool', adds: ['block', 'async'],
      task: 'Compare: add 16 requests that use await and look at the thread count and the average wait.',
      goal: { kind: 'done', n: 16, of: 'async' },
      solve: ['add:async:8', 'add:async:8', ...ticks(14)]
    },
    {
      t: 'choice',
      q: 'What did the rig show?',
      options: ['With await the same threads serve more requests: while the network wait is on, the thread is free', 'await downloads data from the network faster', 'await creates a new thread for every request'],
      answer: 0,
      explain: 'The network didn\'t get faster. The thread just works on other requests while there\'s no response yet.',
      wrong: { 2: 'The opposite: await doesn\'t create threads. Waiting on the network doesn\'t occupy a thread at all.' }
    },
    {
      t: 'multi',
      q: 'What can cause thread pool starvation? Select all that apply.',
      options: ['.Result and .Wait() on tasks doing network calls', 'Thread.Sleep in code running on the pool', 'A synchronous read from a slow disk in every request', 'await httpClient.GetAsync(…)', 'Short computations with no waiting'],
      answer: [0, 1, 2],
      explain: 'Anything that holds a pool thread without doing work. await and short computations don\'t hold the thread.'
    },
    {
      t: 'choice',
      q: 'An ASP.NET Core server: under load, responses suddenly lag by seconds, yet the CPU is nearly idle. What do you suspect first?',
      options: ['Thread pool starvation: blocking calls like .Result somewhere', 'Not enough RAM', 'A slow JIT'],
      answer: 0,
      explain: 'An idle CPU with growing latency is the classic sign: the threads exist, but they\'re stuck waiting.'
    },
    {
      t: 'learn',
      title: 'A bridge to async/await',
      body: '<p>Threads, the pool and locking are the foundation of async/await. Next up: what the compiler does with <code>await</code>, where the code continues, and where the infamous <code>.Result</code> deadlock in UI apps comes from.</p><p>That\'s a separate course, "Async/await in depth". You\'ll find it in the catalog.</p>',
      deep: 'Since .NET 6 the pool compensates faster for blocking on Task.Wait and .Result by adding a thread right away. That eases the symptoms but doesn\'t cure them. A blocked thread still sits idle and eats memory, and under heavy load the compensation isn\'t enough.'
    }
  ]
};

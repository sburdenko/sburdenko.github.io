/** Async, unit 1, lesson 3: There is no thread (English version). */
const ticks = n => Array(n).fill('tick:1');

export default {
  id: 'as.u1.l3',
  title: 'There is no thread',
  sub: 'Where is the thread during a request? Nowhere',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Where is the thread during a request?',
      body: '<p>Answer: nowhere. The request goes to the network card, and the OS waits for the reply on its own, with no thread. When data arrives, the OS tells .NET, and only then does a pool thread briefly pick up the continuation.</p><p>This is the famous "There is no thread", the title of an article by Stephen Cleary.</p>',
      deep: 'Under the hood are the OS mechanisms for async I/O: IOCP on Windows, epoll on Linux, kqueue on macOS. A few .NET threads wait for notifications for all operations at once, not one thread per request.'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'A console program awaits a reply. Step through the ticks and watch the "network" row: is any thread busy while we wait?',
      start: { ctx: 'console', call: 'await' }, lock: ['ctx', 'call', 'cfa'],
      goal: { status: 'done', ctx: 'console' },
      solve: ['tick', 'tick', 'end']
    },
    {
      t: 'choice',
      q: '1,000 requests are awaiting replies. How many threads are busy waiting?',
      options: ['None: the OS waits, and threads only run continuations', '1,000', 'One per core'],
      answer: 0,
      explain: 'A thread is needed only when there is code to run.'
    },
    {
      t: 'rig', rig: 'pool', adds: ['block', 'async'],
      task: 'Compare on the thread pool: add 16 requests with await and watch the thread count and wait time. Then try .Result if you like.',
      goal: { kind: 'done', n: 16, of: 'async' },
      solve: ['add:async:8', 'add:async:8', ...ticks(14)]
    },
    {
      t: 'choice',
      q: 'Why can an async server handle more requests?',
      options: ['While requests wait on the database and network, threads serve other requests', 'Async code compiles faster', 'The server gets more cores'],
      answer: 0,
      explain: 'Same number of threads, but none of them sits idle waiting.'
    },
    {
      t: 'choice',
      q: 'Does async speed up heavy computation?',
      options: ['Not by itself: computation still occupies a thread; you can only move it to the pool with Task.Run', 'Yes, async parallelizes the code', 'Yes, if you add await'],
      answer: 0,
      explain: 'async is about waiting. For parallel computation there are Parallel and PLINQ.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IOCP', 'Async I/O on Windows'],
        ['epoll', 'Async I/O on Linux'],
        ['Thread pool', 'Runs continuations'],
        ['await', 'Releases the thread while waiting']
      ]
    },
    {
      t: 'order',
      q: 'What happens on await http.GetStringAsync(url)?',
      items: ['The method sends the request', 'The thread goes back to other work', 'The OS waits for the reply with no thread', 'The reply arrives and the continuation is queued', 'A free thread runs the continuation'],
      explain: 'The thread is involved only at the start and at the end.'
    }
  ]
};

/** Unit 4, lesson 3: lock, Interlocked and deadlock. */
export default {
  id: 'dotnet.w4.l3',
  title: 'lock, Interlocked and deadlock',
  sub: 'How to fix races without hanging the program',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'lock: one at a time',
      body: '<p><code>lock (obj) { … }</code> lets only one thread into the block. The others wait at the door until it leaves.</p>',
      code: 'static readonly object _gate = new();\n\nlock (_gate)\n{\n    count++;\n}',
      deep: 'lock is Monitor.Enter/Exit inside try/finally. Since .NET 9 and C# 13 there\'s a dedicated System.Threading.Lock type, and lock on it is more efficient. Don\'t do lock(this) or lock on a string: other code can reach those objects and take the same lock.'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'lock',
      task: 'Same count++, but inside a lock. Try to get 1 again, then run both threads to completion.',
      goal: 'done',
      solve: ['step:A', 'step:A', 'step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'choice',
      q: 'Why couldn\'t you lose an increment with lock?',
      options: ['While A is inside the lock, B can\'t start its steps', 'lock makes the CPU faster', 'lock runs threads one after another from the start of the program'],
      answer: 0,
      explain: 'Inside the lock, the read, add and write run as one chunk relative to other threads using the same lock.'
    },
    {
      t: 'learn',
      title: 'Interlocked: atomic, no lock needed',
      body: '<p>For simple number operations there\'s <code>Interlocked</code>: Increment, Add, Exchange, CompareExchange. The CPU runs them as a single indivisible instruction, faster than a lock.</p>',
      code: 'Interlocked.Increment(ref count);'
    },
    {
      t: 'rig', rig: 'datarace', mode: 'atomic', random: true,
      task: 'Interlocked.Increment: run 2 threads × 1,000 and check the result.',
      goal: 'random',
      solve: ['random']
    },
    {
      t: 'choice',
      q: 'What do 2 threads × 1,000 calls to Interlocked.Increment give you?',
      options: ['Always 2,000', 'A different number around 2,000 each time', 'Always 1,000'],
      answer: 0,
      explain: 'Read, add and write are one indivisible operation. You can\'t lose an increment.'
    },
    {
      t: 'learn',
      title: 'The price of locks: deadlock',
      body: '<p>If a thread needs two locks and another thread takes the same locks in the opposite order, they can get stuck forever: each waits for the lock the other holds.</p><p>That\'s a <b>deadlock</b>. The program doesn\'t crash. It just hangs.</p>'
    },
    {
      t: 'rig', rig: 'deadlock',
      task: 'A takes L1, then L2. B does the opposite. Drive the threads into a deadlock.',
      goal: 'deadlock',
      solve: ['step:A', 'step:B']
    },
    {
      t: 'rig', rig: 'deadlock', toggle: true,
      task: 'Fix it: make both threads take the locks in the same order. Then run them to completion.',
      goal: 'fixed',
      solve: ['fix', 'step:A', 'step:A', 'step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'choice',
      q: 'What\'s the main rule against lock deadlocks?',
      options: ['Always take locks in the same order', 'Take as many locks at once as you can', 'Add Thread.Sleep before lock'],
      answer: 0,
      explain: 'With a single order, the second thread waits on the first lock and can\'t grab the second one. No waiting cycle forms.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['lock', 'One thread in the block, the rest wait'],
        ['Interlocked', 'An indivisible operation on a number'],
        ['Deadlock', 'Threads wait for each other forever'],
        ['Data race', 'The result depends on thread switches']
      ]
    }
  ]
};

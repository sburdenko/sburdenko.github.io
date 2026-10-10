/** Unit 4 final: threads and the thread pool. */
const ticks = n => Array(n).fill('tick:1');

export default {
  id: 'dotnet.w4.boss',
  title: 'Final: many threads',
  sub: 'Races, locks and the pool: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'datarace', mode: 'plain',
      task: 'Show a lost update: get count to end at 1.',
      goal: 'lost',
      solve: ['step:B', 'step:A', 'step:B', 'step:B', 'step:A', 'step:A']
    },
    {
      t: 'order',
      q: 'What steps make up count++?',
      items: ['Read count from memory', 'Add 1 in a register', 'Write the result to memory'],
      explain: 'Three separate steps, and the thread can be interrupted between any of them.'
    },
    {
      t: 'rig', rig: 'deadlock', toggle: true,
      task: 'Fix the deadlock and run both threads to completion.',
      goal: 'fixed',
      solve: ['fix', 'step:A', 'step:A', 'step:A', 'step:A', 'step:A', 'step:B', 'step:B', 'step:B', 'step:B', 'step:B']
    },
    {
      t: 'multi',
      q: 'What do threads share? Select all that apply.',
      options: ['The heap', 'Static fields', 'The stack', 'A method\'s local variables'],
      answer: [0, 1],
      explain: 'Each thread has its own stack and everything on it.'
    },
    {
      t: 'choice',
      q: 'You just need to count requests from many threads. What do you pick?',
      options: ['Interlocked.Increment', 'A lock around the whole request handler', 'Nothing, ++ is atomic'],
      answer: 0,
      explain: 'Interlocked solves it with a single instruction and makes nobody wait.'
    },
    {
      t: 'tapline',
      q: 'Which line is bad practice?',
      code: 'class Account\n{\n    public void Deposit(int x)\n    {\n        lock (this)\n        {\n            _balance += x;\n        }\n    }\n}',
      answer: 4,
      explain: 'Anyone who uses the object has a reference to it and can take the same lock. A private readonly lock object is better.'
    },
    {
      t: 'choice',
      q: 'The CPU is idle, yet requests sit in the pool queue. Most likely…',
      options: ['Pool threads are blocked waiting', 'The CPU is too slow', 'The garbage collector is turned off'],
      answer: 0,
      explain: 'Thread pool starvation: the threads exist, but they\'re waiting instead of working.'
    },
    {
      t: 'rig', rig: 'pool', adds: ['block', 'async'],
      task: 'Serve 8 requests without a single thread stuck waiting.',
      goal: { kind: 'done', n: 8, of: 'async' },
      solve: ['add:async:8', ...ticks(10)]
    },
    {
      t: 'choice',
      q: 'Two threads read the same immutable string. Do you need synchronization?',
      options: ['No: races only happen when something writes', 'Yes, always', 'Only on ARM'],
      answer: 0,
      explain: 'If nobody changes the data, any number of threads can read it.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['lock', 'Mutual exclusion'],
        ['Interlocked', 'Atomic operation'],
        ['ThreadPool', 'Reusable threads'],
        ['Deadlock', 'Locks taken in different orders']
      ]
    }
  ]
};

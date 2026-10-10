/** Async course, unit 1 final (English version). */
export default {
  id: 'as.u1.boss',
  title: 'Final: why async',
  sub: 'Waiting, Task and the thread that isn\'t there',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'timeline',
      task: 'Make the window handle the user\'s click by tick 2 at the latest.',
      start: { ctx: 'ui', call: 'sync' }, lock: ['ctx', 'cfa'],
      goal: { status: 'done', clickBy: 2 },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'What does the thread do while await waits for the server?',
      options: ['Other work, or nothing if there is none', 'Waits for the reply', 'Polls the network every millisecond'],
      answer: 0,
      explain: 'The OS waits, not the thread.'
    },
    {
      t: 'multi',
      q: 'Where does Task.Run make sense? Select all that apply.',
      options: ['Heavy computation started from the UI thread', 'Compressing a large file in memory', 'Wrapping http.GetStringAsync', 'Wrapping File.ReadAllTextAsync'],
      answer: [0, 1],
      explain: 'Async I/O doesn\'t need Task.Run.'
    },
    {
      t: 'choice',
      q: 'What has Task<int> LoadAsync() returned while the request is still running?',
      options: ['An incomplete task', 'The number 0', 'null'],
      answer: 0,
      explain: 'The result comes later; you can wait for the task with await.'
    },
    {
      t: 'choice',
      q: 'How is await different from .Result?',
      options: ['await doesn\'t block the thread, .Result does', 'No difference', '.Result is faster'],
      answer: 0,
      explain: 'Both wait for the result, but .Result holds the thread the whole time.'
    },
    {
      t: 'order',
      q: 'The path of an async request',
      items: ['Send the request', 'Release the thread', 'The OS waits for the reply', 'The continuation is queued', 'A thread runs the continuation'],
      explain: 'A thread is needed at the start and at the end.'
    },
    {
      t: 'choice',
      q: 'A game makes a synchronous HTTP request on the main thread. What does the player see?',
      options: ['The picture freezes until the server replies', 'Nothing', 'A black screen forever'],
      answer: 0,
      explain: 'The main thread can\'t draw frames while it waits.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['I/O', 'Waiting for hardware: network, disk'],
        ['Computation', 'The processor is working'],
        ['Task', 'A promise of a result'],
        ['There is no thread', 'No thread is busy while waiting']
      ]
    }
  ]
};

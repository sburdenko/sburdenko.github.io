/** Async, unit 1, lesson 1: waiting is the real enemy (English version). */
export default {
  id: 'as.u1.l1',
  title: 'Waiting is the enemy',
  sub: 'Why a window goes "Not Responding"',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A waiter by the stove',
      body: '<p>Picture a waiter who takes an order and then stands by the stove until the dish is ready. Every other table waits.</p><p>That is synchronous code: the thread waits for the network or the disk and does nothing else. A good waiter hands the order to the kitchen and goes to serve other tables. That is asynchrony.</p>'
    },
    {
      t: 'learn',
      title: 'Why the window freezes',
      body: '<p>An app with a window (WPF, WinForms, Unity) has one <b>main thread</b>. It draws the UI and handles clicks.</p><p>If that thread is waiting for a server, the window stops responding: clicks pile up in the queue and nobody is there to handle them.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Run the synchronous version to the end. On which tick is the user\'s click handled?',
      start: { ctx: 'ui', call: 'sync' }, lock: ['ctx'],
      goal: { status: 'done', call: 'sync' },
      solve: ['end']
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Now switch the handler to await and compare: when is the click handled?',
      start: { ctx: 'ui', call: 'sync' }, lock: ['ctx'],
      goal: { status: 'done', call: 'await', clickBy: 2 },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Why is the click handled almost at once with await?',
      options: ['While we wait for the network, the main thread is free to work through the message queue', 'await makes the network faster', 'Another thread handles the click'],
      answer: 0,
      explain: 'await releases the thread while it waits. The network is no faster; the thread just isn\'t sitting idle.'
    },
    {
      t: 'learn',
      title: 'I/O vs. computation',
      body: '<p>There are two very different things you can wait for.</p><p><b>I/O</b>: network, disk, database. The hardware does the work, and the thread just waits.<br><b>Computation</b> (CPU): compression, physics, parsing. The processor itself does the work.</p><p>async/await is mainly about the first kind: how not to hold a thread while you wait.</p>'
    },
    {
      t: 'multi',
      q: 'Which of these are I/O waits? Select all that apply.',
      options: ['An HTTP request', 'Reading a file from disk', 'A database query', 'Compressing an image', 'Running physics'],
      answer: [0, 1, 2],
      explain: 'Compression and physics are CPU work. You can move them to another thread, but there is nothing to wait for.'
    },
    {
      t: 'choice',
      q: 'Does async/await make the server request itself faster?',
      options: ['No: the request takes just as long, but the thread isn\'t idle', 'Yes, twice as fast', 'Yes, if the server supports async'],
      answer: 0,
      explain: 'The win is that the thread does other work meanwhile: drawing the window or serving other clients.'
    },
    {
      t: 'choice',
      q: 'Where is a blocked main thread most noticeable?',
      options: ['In a windowed app or a game: the picture freezes', 'In a console tool', 'Nowhere, you can\'t see it'],
      answer: 0,
      explain: 'At 60 frames per second a game has just 16 ms per frame. Any wait on the main thread is a freeze.'
    }
  ]
};

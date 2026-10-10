/** Async, unit 5, lesson 2: lock and await, SemaphoreSlim (English version). */
export default {
  id: 'as.u5.l2',
  title: 'lock and await',
  sub: 'An async lock: SemaphoreSlim',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'No await inside lock',
      body: '<p>The compiler won\'t allow it: error CS1996. A lock belongs to a thread, and after await the method may resume on another one. The lock would then be released by a thread that never took it.</p>'
    },
    {
      t: 'choice',
      q: 'Why can\'t you await inside a lock?',
      options: ['lock is tied to a thread, and after await the method may resume on another thread', 'It\'s slow', 'lock doesn\'t support Task'],
      answer: 0,
      explain: 'Monitor requires Exit to be called by the same thread that called Enter.'
    },
    {
      t: 'learn',
      title: 'SemaphoreSlim: an async lock',
      body: '<p><code>SemaphoreSlim(1, 1)</code> lets one caller in. Its <code>WaitAsync</code> waits without blocking the thread, and any thread can release it.</p>',
      code: 'static readonly SemaphoreSlim _gate = new(1, 1);\n\nawait _gate.WaitAsync();\ntry\n{\n    await WriteToFileAsync(data);\n}\nfinally\n{\n    _gate.Release();\n}'
    },
    {
      t: 'blanks',
      q: 'Build an async lock',
      code: 'await _gate.___();\ntry { await WriteAsync(); }\nfinally { _gate.___(); }',
      lang: 'cs',
      tiles: ['WaitAsync', 'Release', 'Wait', 'Dispose', 'Enter'],
      answer: ['WaitAsync', 'Release'],
      explain: 'There\'s a Wait() too, but it blocks the thread.'
    },
    {
      t: 'choice',
      q: 'Why put Release in finally?',
      options: ['Otherwise an exception leaves the semaphore taken forever', 'It\'s faster', 'It won\'t compile otherwise'],
      answer: 0,
      explain: 'A forgotten Release is a deadlock too, just a quiet one.'
    },
    {
      t: 'choice',
      q: 'What does new SemaphoreSlim(3, 3) mean?',
      options: ['Up to three callers can be inside at once', 'Three attempts to get in', 'A three-second wait'],
      answer: 0,
      explain: 'A counting semaphore limits concurrency, for example the number of simultaneous API requests.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['WaitAsync doesn\'t block the thread while waiting', 'SemaphoreSlim isn\'t tied to a thread', 'You can use lock around await', 'You can skip Release: the GC will release it'],
      answer: [0, 1],
      explain: 'Nobody will release the semaphore for you.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['lock', 'A synchronous lock tied to a thread'],
        ['SemaphoreSlim', 'An async lock with a counter'],
        ['WaitAsync', 'Wait without blocking the thread'],
        ['CS1996', 'await inside lock']
      ]
    }
  ]
};

/** Async, unit 6, lesson 3: async/await in Unity (English version). */
export default {
  id: 'as.u6.l3',
  title: 'Unity',
  sub: 'The main thread, UnitySynchronizationContext and Awaitable',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Unity has a context too',
      body: '<p>Almost the entire Unity API (transform, GameObject, components) works only from the main thread. Unity installs its own <b>UnitySynchronizationContext</b>: the continuation after await runs on the main thread, in the next frame.</p>'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'The script moves a transform after await. Run it as is.',
      start: { ctx: 'unity', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'error', ctx: 'unity' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'What error does Unity show?',
      options: ['UnityException: … can only be called from the main thread', 'NullReferenceException', 'MissingReferenceException'],
      answer: 0,
      explain: 'ConfigureAwait(false) sent the continuation to the pool, and you can\'t touch a transform from there.'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Fix it: the continuation must return to the main thread.',
      start: { ctx: 'unity', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'done', ctx: 'unity', cfa: false },
      solve: ['cfa', 'end']
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Unity can hang too. Drive it into a deadlock.',
      start: { ctx: 'unity', call: 'await' }, lock: ['ctx', 'cfa'],
      goal: { status: 'deadlock', ctx: 'unity' },
      solve: ['call:result', 'end']
    },
    {
      t: 'learn',
      title: 'Awaitable: Unity\'s native async',
      body: '<p>Since Unity 2023.1 (and in Unity 6) there\'s an <code>Awaitable</code> class: cheap waits with no extra allocations.</p>',
      code: 'async Awaitable FlyAsync()\n{\n    await Awaitable.WaitForSecondsAsync(1f);\n    await Awaitable.BackgroundThreadAsync();  // to the pool\n    var path = FindPath(map);                  // heavy calculation\n    await Awaitable.MainThreadAsync();         // and back\n    transform.position = path[0];\n}',
      deep: 'Awaitable objects come from a pool and go back to it when they complete. So you can\'t await the same Awaitable twice: the second await may get someone else\'s operation. If you need to await several times, wrap it in a Task.'
    },
    {
      t: 'blanks',
      q: 'Compute in the background, then move the object',
      code: 'await Awaitable.___();\nvar path = FindPath(map);\nawait Awaitable.___();\ntransform.position = path[0];',
      lang: 'cs',
      tiles: ['BackgroundThreadAsync', 'MainThreadAsync', 'NextFrameAsync', 'Task.Run', 'Yield'],
      answer: ['BackgroundThreadAsync', 'MainThreadAsync'],
      explain: 'Without MainThreadAsync, the transform line will throw.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['NextFrameAsync', 'Wait for the next frame'],
        ['WaitForSecondsAsync', 'Wait for game time'],
        ['BackgroundThreadAsync', 'Move to the pool'],
        ['MainThreadAsync', 'Return to the main thread']
      ]
    },
    {
      t: 'choice',
      q: 'Can you await the same Awaitable twice?',
      options: ['No: the Awaitable goes back to the pool, and a second await is unpredictable', 'Yes, like a Task', 'Yes, but only on the main thread'],
      answer: 0,
      explain: 'That\'s the price of zero allocations.'
    }
  ]
};

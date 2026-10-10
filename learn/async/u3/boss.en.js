/** Async course, unit 3 final: under the hood (English version). */
export default {
  id: 'as.u3.boss',
  title: 'Final: under the hood',
  sub: 'State machine, awaiter and contexts',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'statemachine',
      task: 'Walk the state machine in both modes: with waiting and with ready results.',
      goal: 'both',
      solve: [...Array(13).fill('step'), 'cached', ...Array(9).fill('step')]
    },
    {
      t: 'choice',
      q: 'What does the state field hold?',
      options: ['The number of the await where the method stopped', 'The method\'s result', 'The thread ID'],
      answer: 0,
      explain: 'The switch in MoveNext uses it to jump to the right spot.'
    },
    {
      t: 'blanks',
      q: 'The awaiter pattern\'s methods',
      code: 'var aw = x.GetAwaiter();\nif (!aw.IsCompleted) aw.___(continuation);\nvar r = aw.___();',
      lang: 'cs',
      tiles: ['OnCompleted', 'GetResult', 'Wait', 'Start'],
      answer: ['OnCompleted', 'GetResult'],
      explain: 'Subscribe to completion, then get the result.'
    },
    {
      t: 'choice',
      q: 'When does an async method allocate nothing on the heap?',
      options: ['When no await ever paused', 'Never', 'When the method returns void'],
      answer: 0,
      explain: 'The state machine struct stays on the stack.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['AsyncLocal survives a thread switch after await', 'The builder calls SetException on an exception', 'A ValueTask can be awaited many times', 'Task.Yield guarantees a pause'],
      answer: [0, 1, 3],
      explain: 'A ValueTask is single-use.'
    },
    {
      t: 'choice',
      q: 'Does ConfigureAwait(false) stop AsyncLocal from flowing?',
      options: ['No: it\'s about SynchronizationContext, while ExecutionContext always flows', 'Yes', 'Only in a console app'],
      answer: 0,
      explain: 'These are two independent mechanisms.'
    },
    {
      t: 'order',
      q: 'The life of an async method with one await',
      items: ['MoveNext #1 runs up to the await', 'The awaiter isn\'t ready: state is saved and the method returns', 'The task completes and MoveNext #2 is called', 'GetResult and the rest of the method', 'SetResult completes the task'],
      explain: 'Two MoveNext calls, one pause.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['MoveNext', 'The method body, cut at each await'],
        ['GetAwaiter', 'The key that makes any type awaitable'],
        ['ExecutionContext', 'Travels with the continuation'],
        ['PoolingAsyncValueTaskMethodBuilder', 'Pooling for ValueTask methods']
      ]
    }
  ]
};

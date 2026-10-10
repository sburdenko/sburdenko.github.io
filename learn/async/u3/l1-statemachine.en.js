/** Async, unit 3, lesson 1: the state machine (English version). */
const step = n => Array(n).fill('step');

export default {
  id: 'as.u3.l1',
  title: 'The state machine',
  sub: 'What the compiler turns await into',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'await isn\'t magic, it\'s a switch',
      body: '<p>The compiler rewrites an async method into a struct: a <b>state machine</b>. Local variables become its fields, and the method body becomes a <code>MoveNext</code> function with the step number kept in a <code>state</code> field.</p><p>Every await is a spot where MoveNext can return and later come back.</p>'
    },
    {
      t: 'rig', rig: 'statemachine',
      task: 'The responses are still on their way. Step through MoveNext and count the calls and pauses.',
      goal: 'async',
      solve: step(13)
    },
    {
      t: 'choice',
      q: 'How many times is MoveNext called for a method with two awaits if neither task is ready?',
      options: ['3', '2', '1', '4'],
      answer: 0,
      explain: 'The first call is the start, then one more for each continuation after an await.'
    },
    {
      t: 'choice',
      q: 'Why isn\'t variable a lost between MoveNext calls?',
      options: ['It became a field of the state machine', 'The thread keeps it', 'The garbage collector saves it'],
      answer: 0,
      explain: 'The stack frame disappears between calls, but the struct\'s fields stay.'
    },
    {
      t: 'rig', rig: 'statemachine',
      task: 'Turn on "Results are ready" and walk through again.',
      goal: 'cached',
      solve: ['cached', ...step(9)]
    },
    {
      t: 'choice',
      q: 'The results were already ready. How many pauses were there?',
      options: ['0', '1', '2'],
      answer: 0,
      explain: 'IsCompleted = true, so the method runs straight through in a single MoveNext call.'
    },
    {
      t: 'learn',
      title: 'On the stack, then on the heap',
      body: '<p>In Release the state machine is a struct and lives on the stack as long as the method never pauses. On the first real pause it moves to the heap so it can outlive the method\'s return.</p>',
      deep: 'In .NET Core 2.1+ the state machine\'s "box" is the task itself: AsyncStateMachineBox derives from Task<T>, so a pause costs a single allocation. In Debug the state machine is a class so that Edit and Continue works.'
    },
    {
      t: 'order',
      q: 'What does MoveNext do when it meets an incomplete awaiter?',
      items: ['Checks IsCompleted', 'Writes the step number to state', 'Subscribes MoveNext to completion via AwaitUnsafeOnCompleted', 'Returns control'],
      explain: 'That\'s how a method "pauses" without holding a thread.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['state', 'The step where we stopped'],
        ['MoveNext', 'Runs a piece of the method up to the next await'],
        ['awaiter', 'What we\'re waiting on right now'],
        ['SetResult', 'Completes the task']
      ]
    }
  ]
};

/** Async, unit 3, lesson 3: the fast path, ValueTask and allocations (English version). */
export default {
  id: 'as.u3.l3',
  title: 'Fast path and allocations',
  sub: 'When await costs nothing',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Already done? No pause',
      body: '<p>If the awaiter says <code>IsCompleted = true</code> right away, the method doesn\'t pause: no subscription, no thread switch, no extra objects. This is the <b>fast path</b>.</p>'
    },
    {
      t: 'rig', rig: 'statemachine', cached: true,
      task: 'Walk the fast path: the results are already ready.',
      goal: 'cached',
      solve: Array(9).fill('step')
    },
    {
      t: 'learn',
      title: 'Where allocations hide',
      body: '<p>Every async method that pauses creates a heap object: the state machine together with its task.</p><p>Ready results can be returned with no allocation: <code>Task.CompletedTask</code>, <code>ValueTask&lt;T&gt;</code>. .NET caches some results itself, such as completed tasks holding true and false.</p>'
    },
    {
      t: 'choice',
      q: 'A method reads a cache, and 99% of the time the data is there. What should it return?',
      options: ['ValueTask<T>: a cache hit allocates nothing', 'Task<T>, always with Task.Run', 'async void'],
      answer: 0,
      explain: 'The fast path puts not a single object on the heap.'
    },
    {
      t: 'tapline',
      q: 'Which line is the allocation-free fast path?',
      code: 'public ValueTask<User> GetUserAsync(int id)\n{\n    if (_cache.TryGetValue(id, out var u))\n        return new ValueTask<User>(u);\n    return new ValueTask<User>(LoadUserAsync(id));\n}',
      answer: 3,
      explain: 'A ValueTask holding a ready value is a struct; the heap isn\'t touched.'
    },
    {
      t: 'multi',
      q: 'Which create no new heap objects? Select all that apply.',
      options: ['return Task.CompletedTask', 'new ValueTask<int>(42)', 'await on an already completed task', 'An async Task method that paused', 'Task.Run(…)'],
      answer: [0, 1, 2],
      explain: 'Allocations show up where there is real waiting or new work.'
    },
    {
      t: 'choice',
      q: 'Can you await the same ValueTask twice?',
      options: ['No: the behavior is undefined; if you need more, call .AsTask() first', 'Yes', 'Yes, but only in Release'],
      answer: 0,
      explain: 'A ValueTask is single-use.'
    },
    {
      t: 'learn',
      title: 'Measure first',
      body: '<p>If a method runs millions of times a second, its allocations show up in the profiler. If not, Task<T> is simpler and safer. Optimize after you measure.</p>',
      deep: 'Since .NET 6 you can mark a method [AsyncMethodBuilder(typeof(PoolingAsyncValueTaskMethodBuilder<>))], and then even a ValueTask method that pauses takes its objects from a pool. Turn it on selectively, after measuring.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Task.CompletedTask', 'A ready empty task'],
        ['Task.FromResult', 'A ready task with a result'],
        ['ValueTask', 'No allocation on the fast path'],
        ['IsCompleted = true', 'No pause']
      ]
    }
  ]
};

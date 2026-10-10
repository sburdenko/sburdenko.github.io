/** Async, unit 6, lesson 4: coroutines, UniTask and cancellation in Unity (English version). */
export default {
  id: 'as.u6.l4',
  title: 'Coroutines, UniTask and cancellation',
  sub: 'What to pick in Unity and how not to outlive your object',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Coroutines: async before async',
      body: '<p>A coroutine is a method with IEnumerator and yield return. Unity advances it every frame. It lives as long as its MonoBehaviour: destroy the object, and the coroutine stops.</p><p>But a coroutine can\'t return a value, and it\'s bad at handling exceptions.</p>',
      code: 'IEnumerator Blink()\n{\n    while (true)\n    {\n        light.enabled = !light.enabled;\n        yield return new WaitForSeconds(0.5f);\n    }\n}'
    },
    {
      t: 'learn',
      title: 'async outlives the object',
      body: '<p>An async method knows nothing about a GameObject\'s lifetime. Destroy the object, or exit Play Mode in the editor, and the method keeps running. A second later it touches a destroyed transform.</p>'
    },
    {
      t: 'choice',
      q: 'The object is destroyed during await Awaitable.WaitForSecondsAsync(5). What happens to an async method with no cancellation token?',
      options: ['It keeps running and most likely fails when it touches the destroyed object', 'It stops, like a coroutine', 'Unity cancels it for you'],
      answer: 0,
      explain: 'You have to cancel explicitly, with a token.'
    },
    {
      t: 'learn',
      title: 'destroyCancellationToken',
      body: '<p>Since Unity 2022.2, every MonoBehaviour has a <code>destroyCancellationToken</code> that is canceled when the object is destroyed.</p>',
      code: 'async Awaitable PatrolAsync()\n{\n    var ct = destroyCancellationToken;\n    while (true)\n    {\n        await Awaitable.WaitForSecondsAsync(2f, ct);\n        MoveToNextPoint();\n    }\n}'
    },
    {
      t: 'blanks',
      q: 'Stop the patrol along with the object',
      code: 'await Awaitable.WaitForSecondsAsync(2f, ___);',
      lang: 'cs',
      tiles: ['destroyCancellationToken', 'CancellationToken.None', 'gameObject', 'this'],
      answer: ['destroyCancellationToken'],
      explain: 'CancellationToken.None is never canceled.'
    },
    {
      t: 'learn',
      title: 'UniTask',
      body: '<p><b>UniTask</b> (Cysharp) is a popular library: an allocation-free struct task, waiting on Unity frames and events, and convenient cancellation. People used it before Awaitable existed, and still use it today for its rich API.</p>'
    },
    {
      t: 'match',
      q: 'Match each tool to what it is',
      pairs: [
        ['Coroutine', 'IEnumerator and yield; dies with the object'],
        ['async Awaitable', 'Built-in async in Unity 2023.1+'],
        ['UniTask', 'An allocation-free async library'],
        ['destroyCancellationToken', 'Cancellation when the object is destroyed']
      ]
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['A coroutine stops when its MonoBehaviour is destroyed', 'An async method stops by itself when the object is destroyed', 'destroyCancellationToken is canceled on OnDestroy', 'A coroutine makes it easy to return a value'],
      answer: [0, 2],
      explain: 'You have to cancel async yourself, and a coroutine doesn\'t return a value.'
    },
    {
      t: 'choice',
      q: 'You need to load data from a server and return the result to the game. What\'s more convenient?',
      options: ['async Awaitable<T> or UniTask<T> with a cancellation token', 'A coroutine with a global variable', 'Task.Run and .Result'],
      answer: 0,
      explain: 'Results, exceptions and cancellation come out of the box.'
    }
  ]
};

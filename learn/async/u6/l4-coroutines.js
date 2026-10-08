/** Async, раздел 6, урок 4: корутины, UniTask и отмена в Unity. */
export default {
  id: 'as.u6.l4',
  title: 'Корутины, UniTask и отмена',
  sub: 'Что выбрать в Unity и как не пережить свой объект',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Корутины — async до async',
      body: '<p>Корутина — метод с IEnumerator и yield return. Unity сам двигает её каждый кадр. Она живёт, пока жив её MonoBehaviour: уничтожили объект — корутина остановилась.</p><p>Но корутина не возвращает значение и плохо ловит исключения.</p>',
      code: 'IEnumerator Blink()\n{\n    while (true)\n    {\n        light.enabled = !light.enabled;\n        yield return new WaitForSeconds(0.5f);\n    }\n}'
    },
    {
      t: 'learn',
      title: 'async живёт дольше объекта',
      body: '<p>async-метод не знает о жизни GameObject. Уничтожили объект или вышли из Play Mode в редакторе — а метод продолжает работать и через секунду тронет уничтоженный transform.</p>'
    },
    {
      t: 'choice',
      q: 'Объект уничтожен во время await Awaitable.WaitForSecondsAsync(5). Что будет с async-методом без токена отмены?',
      options: ['Продолжит работу и, скорее всего, упадёт на обращении к уничтоженному объекту', 'Остановится, как корутина', 'Unity его отменит сам'],
      answer: 0,
      explain: 'Отменять нужно явно — токеном.'
    },
    {
      t: 'learn',
      title: 'destroyCancellationToken',
      body: '<p>С Unity 2022.2 у каждого MonoBehaviour есть <code>destroyCancellationToken</code> — он отменяется при уничтожении объекта.</p>',
      code: 'async Awaitable PatrolAsync()\n{\n    var ct = destroyCancellationToken;\n    while (true)\n    {\n        await Awaitable.WaitForSecondsAsync(2f, ct);\n        MoveToNextPoint();\n    }\n}'
    },
    {
      t: 'blanks',
      q: 'Останови патруль вместе с объектом',
      code: 'await Awaitable.WaitForSecondsAsync(2f, ___);',
      lang: 'cs',
      tiles: ['destroyCancellationToken', 'CancellationToken.None', 'gameObject', 'this'],
      answer: ['destroyCancellationToken'],
      explain: 'CancellationToken.None никогда не отменится.'
    },
    {
      t: 'learn',
      title: 'UniTask',
      body: '<p><b>UniTask</b> (Cysharp) — популярная библиотека: структура-задача без аллокаций, ожидание кадров и событий Unity, удобная отмена. Её брали, когда Awaitable ещё не было, и берут сейчас ради богатого API.</p>'
    },
    {
      t: 'match',
      q: 'Соедини инструмент и его суть',
      pairs: [
        ['Корутина', 'IEnumerator и yield, умирает с объектом'],
        ['async Awaitable', 'Встроенный async Unity 2023.1+'],
        ['UniTask', 'Библиотека async без аллокаций'],
        ['destroyCancellationToken', 'Отмена при уничтожении объекта']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Корутина останавливается при уничтожении своего MonoBehaviour', 'async-метод сам останавливается при уничтожении объекта', 'destroyCancellationToken отменяется при OnDestroy', 'Корутина удобно возвращает значение'],
      answer: [0, 2],
      explain: 'async надо отменять самому, а корутина значения не возвращает.'
    },
    {
      t: 'choice',
      q: 'Нужно загрузить данные с сервера и вернуть результат в игру. Что удобнее?',
      options: ['async Awaitable<T> или UniTask<T> с токеном отмены', 'Корутина с глобальной переменной', 'Task.Run и .Result'],
      answer: 0,
      explain: 'Результат, исключения и отмена — из коробки.'
    }
  ]
};

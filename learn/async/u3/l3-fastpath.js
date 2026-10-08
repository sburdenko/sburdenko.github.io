/** Async, раздел 3, урок 3: быстрый путь, ValueTask и аллокации. */
export default {
  id: 'as.u3.l3',
  title: 'Быстрый путь и аллокации',
  sub: 'Когда await ничего не стоит',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Готовое — без остановки',
      body: '<p>Если awaiter сразу говорит <code>IsCompleted = true</code>, метод не приостанавливается: ни подписки, ни переключения потоков, ни лишних объектов. Это <b>быстрый путь</b>.</p>'
    },
    {
      t: 'rig', rig: 'statemachine', cached: true,
      task: 'Пройди быстрый путь: ответы уже готовы.',
      goal: 'cached',
      solve: Array(9).fill('step')
    },
    {
      t: 'learn',
      title: 'Где прячутся аллокации',
      body: '<p>Каждый приостановившийся async-метод создаёт объект в куче — машину вместе с задачей.</p><p>Готовые результаты можно отдавать без аллокаций: <code>Task.CompletedTask</code>, <code>ValueTask&lt;T&gt;</code>. Часть результатов .NET кэширует сам: например, завершённые задачи с true и false.</p>'
    },
    {
      t: 'choice',
      q: 'Метод читает кэш: в 99 % случаев данные есть. Что вернуть?',
      options: ['ValueTask<T>: при попадании в кэш не будет аллокации', 'Task<T> и всегда Task.Run', 'async void'],
      answer: 0,
      explain: 'Быстрый путь — без единого объекта в куче.'
    },
    {
      t: 'tapline',
      q: 'Какая строка — быстрый путь без аллокаций?',
      code: 'public ValueTask<User> GetUserAsync(int id)\n{\n    if (_cache.TryGetValue(id, out var u))\n        return new ValueTask<User>(u);\n    return new ValueTask<User>(LoadUserAsync(id));\n}',
      answer: 3,
      explain: 'ValueTask с готовым значением — структура, куча не трогается.'
    },
    {
      t: 'multi',
      q: 'Что не создаёт новых объектов в куче? Отметь все.',
      options: ['return Task.CompletedTask', 'new ValueTask<int>(42)', 'await уже завершённой задачи', 'Приостановившийся async Task метод', 'Task.Run(…)'],
      answer: [0, 1, 2],
      explain: 'Аллокации появляются там, где есть настоящее ожидание или новая работа.'
    },
    {
      t: 'choice',
      q: 'Можно ли сделать await одного ValueTask дважды?',
      options: ['Нет: поведение не определено; нужно больше — сначала .AsTask()', 'Да', 'Да, но только в Release'],
      answer: 0,
      explain: 'ValueTask одноразовый.'
    },
    {
      t: 'learn',
      title: 'Сначала измерь',
      body: '<p>Если метод вызывается миллионы раз в секунду, аллокации видны в профайлере. Если нет — Task<T> проще и безопаснее. Оптимизируй после измерений.</p>',
      deep: 'С .NET 6 метод можно пометить [AsyncMethodBuilder(typeof(PoolingAsyncValueTaskMethodBuilder<>))] — тогда даже приостанавливающийся ValueTask-метод берёт объекты из пула. Включают точечно и после замеров.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Task.CompletedTask', 'Готовая пустая задача'],
        ['Task.FromResult', 'Готовая задача с результатом'],
        ['ValueTask', 'Без аллокации на быстром пути'],
        ['IsCompleted = true', 'Нет приостановки']
      ]
    }
  ]
};

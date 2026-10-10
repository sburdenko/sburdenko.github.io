/** Финал раздела 2 курса async/await. */
export default {
  id: 'as.u2.boss',
  title: 'Финал: async на практике',
  sub: 'Типы, исключения, комбинаторы и отмена',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'combinators',
      task: 'Загрузи три блока страницы как можно быстрее.',
      goal: { kind: 'time', mode: 'all', max: 500 },
      solve: ['mode:all']
    },
    {
      t: 'choice',
      q: 'Что вернёт async-метод вызывающему на первой настоящей паузе?',
      options: ['Незавершённую задачу', 'Готовый результат', 'Исключение'],
      answer: 0,
      explain: 'Результат придёт позже, через эту задачу.'
    },
    {
      t: 'tapline',
      q: 'Какая сигнатура плохая?',
      code: 'public async Task<User> LoadUserAsync(int id)\npublic async void UploadAsync(byte[] data)\npublic ValueTask<int> GetCachedAsync(string key)',
      answer: 1,
      explain: 'UploadAsync — не обработчик события, ему нужен async Task.'
    },
    {
      t: 'choice',
      q: 'catch (HttpRequestException) вокруг task.Result. Поймает?',
      options: ['Нет — придёт AggregateException', 'Да', 'Да, но только в Debug'],
      answer: 0,
      explain: 'Синхронное ожидание заворачивает исключения.'
    },
    {
      t: 'rig', rig: 'combinators',
      task: 'Покажи, что WhenAll собирает все ошибки: урони хотя бы две задачи.',
      goal: { kind: 'inner', n: 2 },
      solve: ['mode:all', 'fail:B', 'fail:C']
    },
    {
      t: 'multi',
      q: 'Что правда про отмену? Отметь все.',
      options: ['Её нужно передавать вглубь — во все async-методы', 'Долгий цикл должен проверять токен сам', 'Cancel() убивает поток', 'Отменённая задача заканчивается исключением OperationCanceledException'],
      answer: [0, 1, 3],
      explain: 'Ничего не убивается — код останавливается там, где проверяет токен.'
    },
    {
      t: 'blanks',
      q: 'Дождись самого быстрого зеркала',
      code: 'Task<string> first = await Task.___(t1, t2, t3);\nstring page = await first;',
      lang: 'cs',
      tiles: ['WhenAny', 'WhenAll', 'Run', 'Yield'],
      answer: ['WhenAny'],
      explain: 'WhenAny возвращает задачу-победителя, её результат забирают ещё одним await.'
    },
    {
      t: 'choice',
      q: 'Когда выгоден ValueTask<T>?',
      options: ['Метод вызывают очень часто, и результат обычно готов сразу', 'Метод всегда долго ждёт сеть', 'Всегда вместо Task'],
      answer: 0,
      explain: 'Экономия — на быстром пути без ожидания.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['async void', 'Обработчики событий'],
        ['WhenAll', 'Ждать все задачи'],
        ['WhenAny', 'Ждать первую'],
        ['CancellationToken', 'Попросить остановиться']
      ]
    }
  ]
};

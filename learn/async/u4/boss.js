/** Финал раздела 4 курса async/await: контекст и deadlock. */
export default {
  id: 'as.u4.boss',
  title: 'Финал: контекст и deadlock',
  sub: 'Повесь программу и почини её тремя способами',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'timeline',
      task: 'Доведи WPF-приложение до deadlock.',
      start: { ctx: 'ui', call: 'await' },
      goal: { status: 'deadlock' },
      solve: ['call:result', 'end']
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Почини правильным способом — без ConfigureAwait, оставаясь в WPF.',
      start: { ctx: 'ui', call: 'result' },
      goal: { status: 'done', ctx: 'ui', call: 'await', cfa: false },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Какой способ починки — страховка, а не лечение?',
      options: ['ConfigureAwait(false) в библиотеке', 'await вместо .Result', 'Оба — полноценное лечение'],
      answer: 0,
      explain: 'Поток всё равно блокируется на .Result — просто deadlock не замыкается.'
    },
    {
      t: 'multi',
      q: 'Где после await нужен захваченный контекст? Отметь все.',
      options: ['Обработчик WPF меняет label.Text', 'Unity-скрипт двигает transform', 'Библиотека разбирает JSON', 'Контроллер ASP.NET Core читает базу'],
      answer: [0, 1],
      explain: 'Библиотеке и серверу UI-поток не нужен.'
    },
    {
      t: 'tapline',
      q: 'Какая строка может повесить WPF-приложение?',
      code: 'private void OnSave(object s, RoutedEventArgs e)\n{\n    var ok = _service.SaveAsync(doc).Result;\n    Status.Text = ok ? "Сохранено" : "Ошибка";\n}',
      answer: 2,
      explain: '.Result в UI-потоке при await внутри SaveAsync без ConfigureAwait(false).'
    },
    {
      t: 'choice',
      q: 'Почему в ASP.NET Core та же строка не вешает сервер?',
      options: ['Контекста нет — продолжение выполнит пул; но поток всё равно простаивает', 'ASP.NET Core запрещает .Result', 'Там другой C#'],
      answer: 0,
      explain: 'Вместо deadlock — голодание пула под нагрузкой.'
    },
    {
      t: 'order',
      q: 'Цикл ожидания при deadlock',
      items: ['UI-поток ждёт задачу', 'Задача ждёт продолжение', 'Продолжение ждёт UI-поток'],
      explain: 'Замкнутый круг.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['.Result в UI', 'Deadlock'],
        ['.Result на сервере', 'Голодание пула'],
        ['ConfigureAwait(false)', 'Продолжение в пуле'],
        ['await до самого верха', 'Настоящее лечение']
      ]
    }
  ]
};

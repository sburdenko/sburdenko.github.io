/** Финал раздела 2 курса «C# глубже». */
export default {
  id: 'cs.u2.boss',
  title: 'Финал: делегаты и замыкания',
  sub: 'Методы как значения',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'closures',
      task: 'Добейся вывода 0 1 2 любым способом.',
      start: 'for',
      goal: { out: '0 1 2' },
      solve: ['variant:foreach', 'end']
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: 'int x = 10;\nFunc<int> get = () => x;\nx = 20;\nConsole.WriteLine(get());',
      options: ['20', '10', 'Ошибка компиляции'],
      answer: 0,
      explain: 'Лямбда читает переменную в момент вызова.'
    },
    {
      t: 'tapline',
      q: 'Где утечка памяти?',
      code: 'public MainWindow()\n{\n    InitializeComponent();\n    App.ThemeChanged += OnThemeChanged;\n}',
      answer: 3,
      explain: 'Подписка на статическое событие без отписки держит окно в памяти навсегда.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Func<int, bool>', 'Принимает int, возвращает bool'],
        ['Action<string>', 'Принимает string, ничего не возвращает'],
        ['event', 'Снаружи только подписка'],
        ['static лямбда', 'Без захвата']
      ]
    },
    {
      t: 'multi',
      q: 'Что создаёт лямбда, которая захватывает локальную переменную? Отметь все.',
      options: ['Скрытый объект для переменной', 'Делегат', 'Новый поток', 'Копию переменной на стеке'],
      answer: [0, 1],
      explain: 'Переменная переезжает в объект в куче, а лямбда превращается в делегат.'
    },
    {
      t: 'choice',
      q: 'Что вернёт многоадресный Func<int> из двух методов?',
      options: ['Результат последнего', 'Сумму', 'Массив результатов'],
      answer: 0,
      explain: 'Чтобы получить все, перебирают GetInvocationList().'
    },
    {
      t: 'blanks',
      q: 'Отпишись при закрытии окна',
      code: 'App.ThemeChanged ___ OnThemeChanged;',
      tiles: ['-=', '+=', '=', '=='],
      answer: ['-='],
      explain: 'После отписки событие перестаёт держать окно.'
    },
    {
      t: 'choice',
      q: 'Почему у foreach нет ловушки с замыканием, а у for есть?',
      options: ['С C# 5 переменная foreach своя на каждый круг, а у for одна на весь цикл', 'foreach медленнее', 'for не поддерживает лямбды'],
      answer: 0,
      explain: 'Изменение C# 5 было ломающим, но все сочли его исправлением.'
    }
  ]
};

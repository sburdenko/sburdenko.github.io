/** Финал раздела 3 курса Avalonia. */
export default {
  id: 'av.u3.boss',
  title: 'Финал: привязки и MVVM',
  sub: 'Данные сами доходят до экрана',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'bind',
      task: 'Всё сломано: режим OneTime и модель без уведомлений. Добейся, чтобы и ввод, и изменения из кода были видны везде.',
      start: { mode: 'OneTime', notify: false },
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'notify', 'type', 'code']
    },
    {
      t: 'choice',
      q: 'Привязка к свойству Nmae (опечатка). Что будет с compiled bindings?',
      options: ['Ошибка при сборке', 'Пустое поле при запуске', 'Падение приложения'],
      answer: 0,
      explain: 'Без x:DataType получилось бы тихое пустое поле.'
    },
    {
      t: 'tapline',
      q: 'Почему экран не обновится, когда код изменит Count?',
      code: 'public partial class CounterViewModel : ObservableObject\n{\n    public int Count { get; set; }\n\n    [RelayCommand]\n    private void Add() => Count++;\n}',
      answer: 2,
      explain: 'Обычное автосвойство не вызывает PropertyChanged. Нужно [ObservableProperty] private int _count;'
    },
    {
      t: 'blanks',
      q: 'Кнопка «Добавить» к методу Add()',
      code: '<Button Content="Добавить" ___="{Binding ___}"/>',
      lang: 'xml',
      tiles: ['Command', 'AddCommand', 'Click', 'Add'],
      answer: ['Command', 'AddCommand'],
      explain: 'Click — событие для code-behind; в MVVM — Command.'
    },
    {
      t: 'multi',
      q: 'Что должно быть во ViewModel? Отметь все.',
      options: ['Свойства для отображения', 'Команды', 'Проверка введённых данных', 'Ссылки на TextBox и Button'],
      answer: [0, 1, 2],
      explain: 'ViewModel ничего не знает о контролах.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину',
      pairs: [
        ['Код меняет свойство, экран стоит', 'Нет PropertyChanged'],
        ['Ввод не доходит до модели', 'Режим OneWay или OneTime'],
        ['Кнопка не включается', 'Не вызван NotifyCanExecuteChanged'],
        ['Поле пустое без ошибок', 'Опечатка без compiled bindings']
      ]
    },
    {
      t: 'choice',
      q: 'Какой режим у TextBox.Text по умолчанию?',
      options: ['TwoWay', 'OneWay', 'OneTime'],
      answer: 0,
      explain: 'Поле ввода для того и нужно, чтобы данные шли обратно в модель.'
    },
    {
      t: 'order',
      q: 'Путь значения при вводе',
      items: ['Пользователь печатает в TextBox', 'Привязка TwoWay пишет значение в Name', 'Сеттер Name вызывает PropertyChanged', 'Другие привязки к Name обновляют экран'],
      explain: 'Без третьего шага четвёртого не будет.'
    }
  ]
};

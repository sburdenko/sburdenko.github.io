/** Avalonia, раздел 3, урок 2: INotifyPropertyChanged и режимы. */
export default {
  id: 'av.u3.l2',
  title: 'Почему экран не обновился',
  sub: 'INotifyPropertyChanged и режимы привязки',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Экран не следит за моделью сам',
      body: '<p>Привязка не опрашивает свойство каждую секунду. Модель должна сама <b>сообщить</b>: «моё свойство изменилось». Для этого есть интерфейс <code>INotifyPropertyChanged</code> с событием <code>PropertyChanged</code>.</p>'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Код меняет имя, а экран стоит на месте. Почини модель и проверь.',
      start: { mode: 'TwoWay', notify: false }, lock: ['mode'],
      goal: { sync: ['code'] },
      solve: ['notify', 'code']
    },
    {
      t: 'choice',
      q: 'Почему без INotifyPropertyChanged экран не обновился?',
      options: ['Модель не вызвала PropertyChanged, и привязка не узнала об изменении', 'Привязка сломалась', 'Нужно перезапустить окно'],
      answer: 0,
      explain: 'Нет события — нет обновления.'
    },
    {
      t: 'learn',
      title: 'Режимы',
      body: '<p><b>OneWay</b> — из модели на экран.<br><b>TwoWay</b> — в обе стороны (у TextBox.Text по умолчанию).<br><b>OneTime</b> — один раз при старте.<br><b>OneWayToSource</b> — только с экрана в модель.</p>'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Код обновляет TextBox, но то, что вводит пользователь, в модель не попадает. Поменяй режим.',
      start: { mode: 'OneWay', notify: true }, lock: ['notify'],
      goal: { sync: ['type'] },
      solve: ['mode:TwoWay', 'type']
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Подбери режим, при котором и ввод, и изменения из кода видны везде.',
      start: { mode: 'OneTime', notify: true }, lock: ['notify'],
      goal: { sync: ['type', 'code'] },
      solve: ['mode:TwoWay', 'type', 'code']
    },
    {
      t: 'match',
      q: 'Соедини режим и направление',
      pairs: [
        ['OneWay', 'Модель → экран'],
        ['TwoWay', 'В обе стороны'],
        ['OneTime', 'Один раз при старте'],
        ['OneWayToSource', 'Экран → модель']
      ]
    },
    {
      t: 'tapline',
      q: 'Какая строка заставляет экран обновиться?',
      code: 'public string Name\n{\n    get => _name;\n    set { _name = value; OnPropertyChanged(); }\n}',
      answer: 3,
      explain: 'OnPropertyChanged вызывает событие PropertyChanged с именем свойства.'
    },
    {
      t: 'choice',
      q: 'Пользователь ввёл текст, модель получила его, а приветствие (TextBlock с той же привязкой) не обновилось. Что не так?',
      options: ['Модель не вызвала PropertyChanged — другие привязки к Name не узнали об изменении', 'Режим TwoWay сломан', 'TextBlock не умеет привязки'],
      answer: 0,
      explain: 'Именно это показал первый стенд без INotifyPropertyChanged.'
    }
  ]
};

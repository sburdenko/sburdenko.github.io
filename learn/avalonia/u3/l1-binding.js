/** Avalonia, раздел 3, урок 1: DataContext и привязки. */
export default {
  id: 'av.u3.l1',
  title: 'Привязки',
  sub: 'DataContext и {Binding}',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Не трогай контролы руками',
      body: '<p>Можно писать <code>NameBox.Text = user.Name</code> и обратно. Но с десятком полей код превращается в бесконечное перекладывание.</p><p><b>Привязка</b> (binding) связывает свойство контрола со свойством объекта данных. Avalonia сама переносит значения туда и обратно.</p>'
    },
    {
      t: 'learn',
      title: 'Откуда берутся данные',
      body: '<p>У каждого элемента есть <b>DataContext</b> — объект с данными. Если не задан, он берётся у родителя. Обычно его ставят окну, и все элементы внутри видят одну и ту же модель представления.</p>',
      code: '<TextBox Text="{Binding Name}"/>\n<TextBlock Text="{Binding Name, StringFormat=\'Привет, {0}!\'}"/>',
      lang: 'xml'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Всё уже настроено. Введи имя в TextBox и посмотри, как оно доходит до модели и возвращается в приветствие.',
      start: { mode: 'TwoWay', notify: true }, lock: ['mode', 'notify'],
      goal: { sync: ['type'] },
      solve: ['type']
    },
    {
      t: 'choice',
      q: 'У окна DataContext = new MainViewModel(). Какой DataContext у TextBox внутри окна, если его не задавать?',
      options: ['Тот же MainViewModel — он наследуется от родителя', 'null', 'Сам TextBox'],
      answer: 0,
      explain: 'DataContext течёт вниз по дереву, пока его не переопределят.'
    },
    {
      t: 'rig', rig: 'bind',
      task: 'Теперь поменяй имя из кода и проверь, обновился ли экран.',
      start: { mode: 'TwoWay', notify: true }, lock: ['mode', 'notify'],
      goal: { sync: ['code'] },
      solve: ['code']
    },
    {
      t: 'blanks',
      q: 'Привяжи текст к свойству Title',
      code: '<TextBlock Text="{___ ___}"/>',
      lang: 'xml',
      tiles: ['Binding', 'Title', 'Bind', 'DataContext', 'this'],
      answer: ['Binding', 'Title'],
      explain: 'Путь привязки — имя свойства в DataContext.'
    },
    {
      t: 'multi',
      q: 'Что правда про привязки? Отметь все.',
      options: ['Привязка ищет свойство в DataContext', 'DataContext наследуется от родителя', 'Привязка избавляет от ручного перекладывания значений', 'Привязка работает только с string'],
      answer: [0, 1, 2],
      explain: 'Привязать можно любые свойства: числа, флаги, коллекции, цвета.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['DataContext', 'Объект с данными для элемента'],
        ['{Binding Name}', 'Связь со свойством Name'],
        ['StringFormat', 'Как показать значение'],
        ['Модель представления', 'Класс с данными окна']
      ]
    }
  ]
};

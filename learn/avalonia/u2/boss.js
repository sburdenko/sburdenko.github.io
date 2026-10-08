/** Финал раздела 2 курса Avalonia. */
export default {
  id: 'av.u2.boss',
  title: 'Финал: раскладка',
  sub: 'Панели и Grid',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'grid',
      task: 'Редактор: дерево слева 200 px, панель справа 100 px, просмотр посередине — всё остальное.',
      labels: ['Дерево', 'Просмотр', 'Панель'], content: [0, 0, 0],
      start: ['*', '*', '*'],
      goal: { at: { 400: [200, 100, 100], 800: [200, 500, 100] } },
      solve: ['col:0:200', 'col:2:100']
    },
    {
      t: 'rig', rig: 'panels',
      task: 'Собери окно как на образце.',
      start: 'wrap',
      goal: { panel: 'dock' },
      solve: ['panel:dock']
    },
    {
      t: 'choice',
      q: 'Плитки фотографий должны заполнять строку и переноситься. Какая панель?',
      options: ['WrapPanel', 'StackPanel', 'DockPanel'],
      answer: 0,
      explain: 'Перенос по строкам — это WrapPanel.'
    },
    {
      t: 'choice',
      q: 'Колонки "Auto,*". Содержимое первой — 120 px, окно — 500 px. Ширины?',
      options: ['120 и 380', '250 и 250', '120 и 500'],
      answer: 0,
      explain: 'Auto берёт 120, звёздочка — остальное.'
    },
    {
      t: 'tapline',
      q: 'Из-за какой строки статус окажется не внизу на всю ширину, а справа от меню?',
      code: '<DockPanel>\n  <Border DockPanel.Dock="Top"> Шапка </Border>\n  <Border DockPanel.Dock="Left"> Меню </Border>\n  <Border DockPanel.Dock="Bottom"> Статус </Border>\n  <Border> Контент </Border>\n</DockPanel>',
      lang: 'xml',
      answer: 2,
      explain: 'Меню прижато раньше статуса и забрало левую полосу до самого низа. Поставь статус перед меню.'
    },
    {
      t: 'blanks',
      q: 'Три колонки: по содержимому, остаток, ровно 150',
      code: '<Grid ColumnDefinitions="___,___,___">',
      lang: 'xml',
      tiles: ['Auto', '*', '150', '2*', 'Fill'],
      answer: ['Auto', '*', '150'],
      explain: 'Порядок колонок слева направо.'
    },
    {
      t: 'match',
      q: 'Соедини задачу и решение',
      pairs: [
        ['Отступ между кнопками', 'Margin'],
        ['Отступ текста от рамки', 'Padding'],
        ['Сайдбар фиксированной ширины', 'Колонка 200'],
        ['Шапка, меню, контент', 'DockPanel']
      ]
    },
    {
      t: 'choice',
      q: 'Кто решает, какого размера будет кнопка?',
      options: ['Кнопка говорит, сколько ей нужно, а итоговый прямоугольник выдаёт родительская панель', 'Только сама кнопка', 'Только окно'],
      answer: 0,
      explain: 'Measure — просьба, Arrange — решение родителя.'
    }
  ]
};

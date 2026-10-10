/** Avalonia, раздел 4, урок 1: стили и селекторы. */
export default {
  id: 'av.u4.l1',
  title: 'Стили и селекторы',
  sub: 'Как в CSS, только для контролов',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Селектор выбирает, сеттер меняет',
      body: '<p>Стиль в Avalonia похож на правило CSS: <b>селектор</b> говорит, к каким элементам применить, а <b>сеттеры</b> — что поменять.</p>',
      code: '<Style Selector="Button.primary">\n  <Setter Property="Background" Value="#4f7cff"/>\n  <Setter Property="Foreground" Value="White"/>\n</Style>\n\n<Button Classes="primary" Content="Сохранить"/>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Азбука селекторов',
      body: '<p><code>Button</code> — по типу.<br><code>.primary</code> — по классу (<code>Classes="primary"</code>).<br><code>#Save</code> — по имени (<code>x:Name="Save"</code>).<br><code>StackPanel Button</code> — кнопка где угодно внутри StackPanel.<br><code>StackPanel &gt; Button</code> — только прямые дети.</p>'
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Выбери все кнопки окна.',
      options: ['#Save', 'Button', '.primary', 'StackPanel > Button'],
      goal: { ids: [2, 3, 5, 8] },
      solve: ['sel:Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Только кнопки, лежащие прямо в панели инструментов (не внутри Border).',
      options: ['StackPanel Button', 'StackPanel > Button', '.toolbar Button', 'Button.primary'],
      goal: { ids: [2, 3] },
      solve: ['sel:StackPanel > Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Все кнопки внутри панели инструментов — на любой глубине.',
      options: ['.toolbar > Button', '.toolbar Button', 'Border > Button', 'Window > Button'],
      goal: { ids: [2, 3, 5] },
      solve: ['sel:.toolbar Button']
    },
    {
      t: 'rig', rig: 'selectors',
      task: 'Только заголовок.',
      options: ['TextBlock', '#h1', 'TextBlock.h1', '.toolbar TextBlock'],
      goal: { ids: [6] },
      solve: ['sel:TextBlock.h1']
    },
    {
      t: 'learn',
      title: 'Псевдоклассы',
      body: '<p>Состояния элемента — через двоеточие: <code>:pointerover</code> (мышь над элементом), <code>:pressed</code>, <code>:disabled</code>, <code>:focus</code>.</p>',
      code: '<Style Selector="Button.primary:pointerover /template/ ContentPresenter">\n  <Setter Property="Background" Value="#6b93ff"/>\n</Style>',
      lang: 'xml',
      deep: 'Почему /template/ ContentPresenter? Тема Fluent сама красит фон при наведении на внутренний элемент шаблона кнопки. Стиль на самой кнопке проиграет — нужно попасть в ту же часть шаблона.'
    },
    {
      t: 'choice',
      q: 'Чем «StackPanel Button» отличается от «StackPanel > Button»?',
      options: ['Первый — кнопки на любой глубине внутри, второй — только прямые дети', 'Ничем', 'Второй выбирает StackPanel'],
      answer: 0,
      explain: 'Как в CSS: пробел — потомок, > — ребёнок.'
    },
    {
      t: 'match',
      q: 'Соедини селектор и что он выбирает',
      pairs: [
        ['Button', 'Все кнопки'],
        ['.primary', 'Элементы с классом primary'],
        ['#Save', 'Элемент с x:Name="Save"'],
        [':disabled', 'Выключенное состояние']
      ]
    },
    {
      t: 'multi',
      q: 'Какие селекторы выберут <Button Classes="primary danger"/>? Отметь все.',
      options: ['Button', '.danger', 'Button.primary.danger', 'Button.warning'],
      answer: [0, 1, 2],
      explain: 'Несколько классов подряд — все должны быть у элемента. warning у кнопки нет.'
    },
    {
      t: 'blanks',
      q: 'Кнопка получит стиль Button.danger',
      code: '<Button ___="danger" Content="Удалить"/>',
      lang: 'xml',
      tiles: ['Classes', 'Class', 'Style', 'x:Name'],
      answer: ['Classes'],
      explain: 'Свойство Classes — список классов через пробел.'
    }
  ]
};

/** Avalonia, раздел 4, урок 2: темы и ресурсы. */
export default {
  id: 'av.u4.l2',
  title: 'Темы и ресурсы',
  sub: 'Fluent, светлая и тёмная, StaticResource и DynamicResource',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Тема — набор стилей для всех контролов',
      body: '<p>В <code>App.axaml</code> подключена тема — например, <b>FluentTheme</b>. Она описывает, как выглядят все стандартные контролы.</p><p>У темы есть варианты: светлый и тёмный.</p>',
      code: '<Application RequestedThemeVariant="Default">\n  <Application.Styles>\n    <FluentTheme/>\n  </Application.Styles>\n</Application>',
      lang: 'xml'
    },
    {
      t: 'choice',
      q: 'RequestedThemeVariant="Default". Какой будет тема?',
      options: ['Как в системе: светлая или тёмная', 'Всегда светлая', 'Всегда тёмная'],
      answer: 0,
      explain: 'Light или Dark задают явно.'
    },
    {
      t: 'learn',
      title: 'Ресурсы: цвет один раз',
      body: '<p>Цвета, кисти и размеры кладут в ресурсы с ключом и используют по ключу. Поменял в одном месте — поменялось везде.</p>',
      code: '<Application.Resources>\n  <SolidColorBrush x:Key="Accent" Color="#4f7cff"/>\n</Application.Resources>\n\n<Button Background="{DynamicResource Accent}"/>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'Static или Dynamic',
      body: '<p><b>StaticResource</b> — ищет ресурс один раз при загрузке.<br><b>DynamicResource</b> — следит за ним: если ресурс поменяли (например, переключили тему), элемент обновится.</p><p>Для цветов, которые зависят от темы, — DynamicResource.</p>'
    },
    {
      t: 'choice',
      q: 'Пользователь переключил тему на тёмную, а одна кнопка осталась светлой. Вероятная причина?',
      options: ['Её цвет взят через StaticResource и не следит за изменениями', 'Кнопка сломана', 'Тёмная тема не поддерживает кнопки'],
      answer: 0,
      explain: 'DynamicResource обновился бы вместе с темой.'
    },
    {
      t: 'learn',
      title: 'Свой цвет для каждой темы',
      body: '<p>Ресурс можно задать отдельно для светлой и тёмной темы — <code>ThemeDictionaries</code>.</p>',
      code: '<ResourceDictionary.ThemeDictionaries>\n  <ResourceDictionary x:Key="Light">\n    <SolidColorBrush x:Key="Panel" Color="#f3f3f3"/>\n  </ResourceDictionary>\n  <ResourceDictionary x:Key="Dark">\n    <SolidColorBrush x:Key="Panel" Color="#1e1e1e"/>\n  </ResourceDictionary>\n</ResourceDictionary.ThemeDictionaries>',
      lang: 'xml'
    },
    {
      t: 'blanks',
      q: 'Фон, который меняется вместе с темой',
      code: '<Border Background="{___ Panel}"/>',
      lang: 'xml',
      tiles: ['DynamicResource', 'StaticResource', 'Binding', 'Resource'],
      answer: ['DynamicResource'],
      explain: 'StaticResource взял бы цвет один раз.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['FluentTheme', 'Готовая тема контролов'],
        ['RequestedThemeVariant', 'Светлая, тёмная или как в системе'],
        ['StaticResource', 'Найти ресурс один раз'],
        ['DynamicResource', 'Следить за ресурсом']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Тема описывает вид всех стандартных контролов', 'ThemeDictionaries задают разные значения для Light и Dark', 'DynamicResource обновляется при смене темы', 'Ресурс можно использовать только в одном месте'],
      answer: [0, 1, 2],
      explain: 'Смысл ресурса — использовать его везде.'
    }
  ]
};

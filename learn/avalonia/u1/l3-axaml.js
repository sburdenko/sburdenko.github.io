/** Avalonia, раздел 1, урок 3: AXAML. */
export default {
  id: 'av.u1.l3',
  title: 'AXAML: разметка',
  sub: 'Теги — объекты, атрибуты — свойства',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Разметка — это создание объектов',
      body: '<p>Каждый тег — объект, атрибут — его свойство, вложенный тег — содержимое.</p>',
      code: '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        x:Class="MyApp.Views.MainWindow"\n        Title="Привет" Width="400" Height="200">\n  <Button Content="Нажми" HorizontalAlignment="Center"/>\n</Window>',
      lang: 'xml'
    },
    {
      t: 'learn',
      title: 'То же самое на C#',
      body: '<p>Разметка — просто удобная запись. Её можно повторить кодом:</p>',
      code: 'var window = new Window { Title = "Привет", Width = 400, Height = 200 };\nwindow.Content = new Button\n{\n    Content = "Нажми",\n    HorizontalAlignment = HorizontalAlignment.Center\n};'
    },
    {
      t: 'choice',
      q: 'Что делает тег <Button Content="Нажми"/>?',
      options: ['Создаёт объект Button и задаёт его свойству Content значение «Нажми»', 'Описывает стиль кнопки', 'Вызывает метод Нажми'],
      answer: 0,
      explain: 'Атрибут = свойство объекта.'
    },
    {
      t: 'tapline',
      q: 'Какая строка связывает разметку с классом в C#?',
      code: '<Window xmlns="https://github.com/avaloniaui"\n        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n        x:Class="MyApp.Views.MainWindow"\n        Title="Привет">',
      lang: 'xml',
      answer: 2,
      explain: 'x:Class говорит: эта разметка — вторая половина partial-класса MainWindow.'
    },
    {
      t: 'learn',
      title: 'x:Name и code-behind',
      body: '<p>Дай элементу имя — и в C# появится поле с этим именем. Разметка компилируется при сборке, поэтому опечатка в имени — ошибка компиляции, а не падение при запуске.</p>',
      code: '<TextBox x:Name="NameBox"/>\n\n// MainWindow.axaml.cs\nNameBox.Text = "Аня";'
    },
    {
      t: 'blanks',
      q: 'Окно с кнопкой по центру',
      code: '<Window Title="Демо">\n  <___ Content="OK" HorizontalAlignment="___"/>\n</Window>',
      lang: 'xml',
      tiles: ['Button', 'Center', 'Middle', 'Click', 'Stretch'],
      answer: ['Button', 'Center'],
      explain: 'Middle в Avalonia нет — центр называется Center.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Тег', 'Объект'],
        ['Атрибут', 'Свойство'],
        ['x:Class', 'Связь с C#-классом'],
        ['x:Name', 'Поле для доступа из кода']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда про AXAML? Отметь все.',
      options: ['Компилируется при сборке', 'Любую разметку можно повторить кодом на C#', 'Пространство имён — https://github.com/avaloniaui', 'Исполняется как скрипт в браузере'],
      answer: [0, 1, 2],
      explain: 'XAML превращается в обычный код при компиляции.'
    },
    {
      t: 'choice',
      q: 'У Window свойство Content — одно. Как положить в окно несколько элементов?',
      options: ['Положить в окно панель (StackPanel, Grid…), а элементы — в неё', 'Написать несколько атрибутов Content', 'Никак'],
      answer: 0,
      explain: 'Панели раскладывают детей — следующий раздел.'
    }
  ]
};

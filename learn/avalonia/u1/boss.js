/** Финал раздела 1 курса Avalonia. */
export default {
  id: 'av.u1.boss',
  title: 'Финал: знакомство',
  sub: 'Avalonia, проект и разметка',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Главная особенность Avalonia среди UI-фреймворков .NET?',
      options: ['Кросс-платформенность за счёт собственной отрисовки', 'Работает только в браузере', 'Использует WinForms внутри'],
      answer: 0,
      explain: 'Skia рисует всё — платформа только даёт окно.'
    },
    {
      t: 'order',
      q: 'От команды до окна',
      items: ['dotnet new avalonia.mvvm', 'dotnet run', 'Main → BuildAvaloniaApp', 'App создаёт MainWindow', 'Окно на экране'],
      explain: 'Шаблон делает всё, что нужно для первого окна.'
    },
    {
      t: 'tapline',
      q: 'Где ошибка?',
      code: '<Window xmlns="https://github.com/avaloniaui">\n  <Button Content="Сохранить"/>\n  <Button Content="Отмена"/>\n</Window>',
      lang: 'xml',
      answer: 2,
      explain: 'У Window одно содержимое. Вторая кнопка — уже лишняя: нужна панель.'
    },
    {
      t: 'blanks',
      q: 'Имя для доступа из кода',
      code: '<TextBox ___="SearchBox"/>',
      lang: 'xml',
      tiles: ['x:Name', 'x:Class', 'Id', 'Key'],
      answer: ['x:Name'],
      explain: 'В code-behind появится поле SearchBox.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Skia', 'Рисует интерфейс'],
        ['.axaml', 'Файл разметки'],
        ['UsePlatformDetect', 'Выбор платформы'],
        ['DataContext', 'Откуда разметка берёт данные']
      ]
    },
    {
      t: 'multi',
      q: 'Что верно? Отметь все.',
      options: ['Опыт WPF во многом переносится', 'Разметка компилируется при сборке', 'Avalonia работает на Linux', 'Avalonia — платная'],
      answer: [0, 1, 2],
      explain: 'Сама Avalonia — MIT. Платный только отдельный продукт XPF.'
    },
    {
      t: 'choice',
      q: 'Чем кнопка Avalonia на Mac отличается от кнопки MAUI на Mac?',
      options: ['Кнопку Avalonia рисует сама Avalonia, кнопка MAUI — настоящая кнопка macOS', 'Ничем', 'На Mac не работает ни то, ни другое'],
      answer: 0,
      explain: 'Свой рендер против нативных контролов.'
    },
    {
      t: 'choice',
      q: 'Что окажется в окне?',
      code: '<Window Title="Демо">\n  <TextBlock Text="Привет!"/>\n</Window>',
      options: ['Текст «Привет!», а в заголовке окна — «Демо»', 'Кнопка «Привет!»', 'Пустое окно'],
      answer: 0,
      explain: 'Title — заголовок окна, TextBlock — текст внутри.'
    }
  ]
};

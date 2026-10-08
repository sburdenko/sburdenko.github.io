/** Avalonia, раздел 1, урок 2: первый проект. */
export default {
  id: 'av.u1.l2',
  title: 'Первый проект',
  sub: 'Шаблон, файлы и путь до первого окна',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Две команды',
      body: '<p>Шаблоны ставятся один раз, потом проект создаётся одной командой.</p>',
      code: 'dotnet new install Avalonia.Templates\ndotnet new avalonia.mvvm -o MyApp\ncd MyApp\ndotnet run',
      lang: 'plain'
    },
    {
      t: 'learn',
      title: 'Что внутри',
      body: '<p><b>Program.cs</b> — точка входа, настраивает Avalonia.<br><b>App.axaml</b> — приложение и тема оформления.<br><b>App.axaml.cs</b> — создаёт главное окно.<br><b>Views/MainWindow.axaml</b> — разметка окна.<br><b>ViewModels/MainWindowViewModel.cs</b> — данные и логика окна.</p><p>Расширение <code>.axaml</code> — это XAML для Avalonia; его выбрали, чтобы IDE не путала его с WPF.</p>'
    },
    {
      t: 'learn',
      title: 'Program.cs',
      body: '<p><code>UsePlatformDetect</code> сам выбирает, как открывать окна на текущей системе.</p>',
      code: 'public static void Main(string[] args) =>\n    BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);\n\npublic static AppBuilder BuildAvaloniaApp() =>\n    AppBuilder.Configure<App>()\n        .UsePlatformDetect()\n        .WithInterFont()\n        .LogToTrace();'
    },
    {
      t: 'learn',
      title: 'App.axaml.cs',
      body: '<p>Когда фреймворк готов, приложение создаёт главное окно и даёт ему модель представления.</p>',
      code: 'public override void OnFrameworkInitializationCompleted()\n{\n    if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)\n        desktop.MainWindow = new MainWindow\n        {\n            DataContext = new MainWindowViewModel()\n        };\n    base.OnFrameworkInitializationCompleted();\n}'
    },
    {
      t: 'order',
      q: 'Расставь, что происходит при запуске',
      items: ['Main вызывает BuildAvaloniaApp', 'UsePlatformDetect выбирает платформу', 'Загружается App.axaml с темой', 'OnFrameworkInitializationCompleted создаёт MainWindow', 'Окно появляется на экране'],
      explain: 'От Main до окна — пять шагов, и все видны в коде шаблона.'
    },
    {
      t: 'match',
      q: 'Соедини файл и его роль',
      pairs: [
        ['Program.cs', 'Точка входа и настройка'],
        ['App.axaml', 'Тема оформления'],
        ['MainWindow.axaml', 'Разметка окна'],
        ['MainWindowViewModel.cs', 'Данные и логика окна']
      ]
    },
    {
      t: 'blanks',
      q: 'Создай проект по шаблону MVVM',
      code: 'dotnet ___ avalonia.mvvm -o MyApp',
      lang: 'plain',
      tiles: ['new', 'run', 'build', 'add'],
      answer: ['new'],
      explain: 'dotnet new создаёт проект по шаблону.'
    },
    {
      t: 'choice',
      q: 'Зачем у файлов разметки расширение .axaml, а не .xaml?',
      options: ['Чтобы IDE и инструменты не принимали их за WPF-разметку', 'Это другой язык', 'Так быстрее компилируется'],
      answer: 0,
      explain: 'Внутри — XAML со своим пространством имён Avalonia.'
    },
    {
      t: 'choice',
      q: 'Где окно получает свою модель представления?',
      options: ['В App.axaml.cs: DataContext = new MainWindowViewModel()', 'В Program.cs', 'Avalonia находит её сама по имени'],
      answer: 0,
      explain: 'DataContext — главное слово следующих разделов: из него привязки берут данные.'
    }
  ]
};

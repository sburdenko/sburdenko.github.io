/** Avalonia, unit 1, lesson 2: your first project. */
export default {
  id: 'av.u1.l2',
  title: 'Your first project',
  sub: 'The template, the files and the path to the first window',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Two commands',
      body: '<p>You install the templates once, then create a project with a single command.</p>',
      code: 'dotnet new install Avalonia.Templates\ndotnet new avalonia.mvvm -o MyApp\ncd MyApp\ndotnet run',
      lang: 'plain'
    },
    {
      t: 'learn',
      title: 'What is inside',
      body: '<p><b>Program.cs</b>: the entry point, sets up Avalonia.<br><b>App.axaml</b>: the application and its theme.<br><b>App.axaml.cs</b>: creates the main window.<br><b>Views/MainWindow.axaml</b>: the window markup.<br><b>ViewModels/MainWindowViewModel.cs</b>: the window\'s data and logic.</p><p>The <code>.axaml</code> extension is XAML for Avalonia. It was chosen so IDEs do not confuse it with WPF.</p>'
    },
    {
      t: 'learn',
      title: 'Program.cs',
      body: '<p><code>UsePlatformDetect</code> works out how to open windows on the current system.</p>',
      code: 'public static void Main(string[] args) =>\n    BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);\n\npublic static AppBuilder BuildAvaloniaApp() =>\n    AppBuilder.Configure<App>()\n        .UsePlatformDetect()\n        .WithInterFont()\n        .LogToTrace();'
    },
    {
      t: 'learn',
      title: 'App.axaml.cs',
      body: '<p>Once the framework is ready, the app creates the main window and hands it a view model.</p>',
      code: 'public override void OnFrameworkInitializationCompleted()\n{\n    if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)\n        desktop.MainWindow = new MainWindow\n        {\n            DataContext = new MainWindowViewModel()\n        };\n    base.OnFrameworkInitializationCompleted();\n}'
    },
    {
      t: 'order',
      q: 'Put the startup steps in order',
      items: ['Main calls BuildAvaloniaApp', 'UsePlatformDetect picks the platform', 'App.axaml loads with the theme', 'OnFrameworkInitializationCompleted creates MainWindow', 'The window appears on screen'],
      explain: 'Five steps from Main to a window, and you can see each of them in the template code.'
    },
    {
      t: 'match',
      q: 'Match each file to its role',
      pairs: [
        ['Program.cs', 'Entry point and setup'],
        ['App.axaml', 'Theme'],
        ['MainWindow.axaml', 'Window markup'],
        ['MainWindowViewModel.cs', 'Window data and logic']
      ]
    },
    {
      t: 'blanks',
      q: 'Create a project from the MVVM template',
      code: 'dotnet ___ avalonia.mvvm -o MyApp',
      lang: 'plain',
      tiles: ['new', 'run', 'build', 'add'],
      answer: ['new'],
      explain: 'dotnet new creates a project from a template.'
    },
    {
      t: 'choice',
      q: 'Why do markup files use .axaml instead of .xaml?',
      options: ['So IDEs and tools do not mistake them for WPF markup', 'It is a different language', 'It compiles faster'],
      answer: 0,
      explain: 'Inside, it is XAML with Avalonia\'s own namespace.'
    },
    {
      t: 'choice',
      q: 'Where does the window get its view model?',
      options: ['In App.axaml.cs: DataContext = new MainWindowViewModel()', 'In Program.cs', 'Avalonia finds it by name on its own'],
      answer: 0,
      explain: 'DataContext is the key word of the next units: bindings get their data from it.'
    }
  ]
};

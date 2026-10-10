/** Unit 2 final of the "Deeper C#" course. */
export default {
  id: 'cs.u2.boss',
  title: 'Final: delegates and closures',
  sub: 'Methods as values',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'closures',
      task: 'Get the output 0 1 2 any way you like.',
      start: 'for',
      goal: { out: '0 1 2' },
      solve: ['variant:foreach', 'end']
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'int x = 10;\nFunc<int> get = () => x;\nx = 20;\nConsole.WriteLine(get());',
      options: ['20', '10', 'Compile error'],
      answer: 0,
      explain: 'The lambda reads the variable at the moment it is called.'
    },
    {
      t: 'tapline',
      q: 'Where is the memory leak?',
      code: 'public MainWindow()\n{\n    InitializeComponent();\n    App.ThemeChanged += OnThemeChanged;\n}',
      answer: 3,
      explain: 'Subscribing to a static event without unsubscribing keeps the window in memory forever.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Func<int, bool>', 'Takes int, returns bool'],
        ['Action<string>', 'Takes string, returns nothing'],
        ['event', 'Outsiders can only subscribe'],
        ['static lambda', 'No capturing']
      ]
    },
    {
      t: 'multi',
      q: 'What does a lambda that captures a local variable create? Select all.',
      options: ['A hidden object for the variable', 'A delegate', 'A new thread', 'A copy of the variable on the stack'],
      answer: [0, 1],
      explain: 'The variable moves into an object on the heap, and the lambda becomes a delegate.'
    },
    {
      t: 'choice',
      q: 'What does a multicast Func<int> made of two methods return?',
      options: ['The result of the last one', 'The sum', 'An array of results'],
      answer: 0,
      explain: 'To get them all, loop over GetInvocationList().'
    },
    {
      t: 'blanks',
      q: 'Unsubscribe when the window closes',
      code: 'App.ThemeChanged ___ OnThemeChanged;',
      tiles: ['-=', '+=', '=', '=='],
      answer: ['-='],
      explain: 'Once you unsubscribe, the event stops holding on to the window.'
    },
    {
      t: 'choice',
      q: 'Why does for have the closure trap while foreach does not?',
      options: ['Since C# 5 the foreach variable is fresh on each iteration, while for has one for the whole loop', 'foreach is slower', 'for does not support lambdas'],
      answer: 0,
      explain: 'The C# 5 change was technically breaking, but everyone saw it as a fix.'
    }
  ]
};

/** Async, unit 2, lesson 1: your first async method (English version). */
export default {
  id: 'as.u2.l1',
  title: 'Your first async method',
  sub: 'async, await and where a method pauses',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Two keywords',
      body: '<p><code>async</code> on a method lets you use <code>await</code> inside it.</p><p><code>await</code> takes a task. If the task isn\'t done yet, the method "pauses" and returns control to its caller. When the task finishes, the method picks up right where it left off.</p>',
      code: 'async Task<int> GetLengthAsync(string url)\n{\n    string html = await http.GetStringAsync(url);\n    return html.Length;\n}'
    },
    {
      t: 'learn',
      title: 'The start is synchronous',
      body: '<p>Until the first await that actually waits, an async method runs like any other: on the same thread, with no switching.</p><p>And if the task has already completed, await doesn\'t pause at all.</p>'
    },
    {
      t: 'choice',
      q: 'What does the caller get when GetLengthAsync reaches await on an unfinished request?',
      options: ['An incomplete Task<int>', 'A number', 'null', 'Nothing: the caller waits'],
      answer: 0,
      explain: 'The method returns a task right away, at its first real pause. The result comes later.'
    },
    {
      t: 'tapline',
      q: 'On which line can the method pause?',
      code: 'async Task<int> CountAsync()\n{\n    var list = new List<int>();\n    var data = await LoadAsync();\n    list.AddRange(data);\n    return list.Count;\n}',
      answer: 3,
      explain: 'A method can only pause at an await.'
    },
    {
      t: 'choice',
      q: 'return html.Length returns an int, but the method is declared Task<int>. Why is that allowed?',
      options: ['The compiler wraps the result in a task for you', 'It\'s a compile error', 'An int automatically becomes a Task'],
      answer: 0,
      explain: 'In an async method, return sets the result of the future task.'
    },
    {
      t: 'blanks',
      q: 'Make the method asynchronous',
      code: '___ Task<string> LoadAsync()\n{\n    var text = ___ File.ReadAllTextAsync(path);\n    return text.Trim();\n}',
      lang: 'cs',
      tiles: ['async', 'await', 'Task', 'void', 'static'],
      answer: ['async', 'await'],
      explain: 'async goes in the declaration, await before the task.'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Same async code: run it in WPF, then in a console app. Who runs the continuation?',
      start: { ctx: 'console', call: 'await' }, lock: ['call', 'cfa'],
      goal: { status: 'done', ctx: 'ui', call: 'await' },
      solve: ['end', 'ctx:ui', 'end']
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['Until the first await, an async method runs synchronously', 'Awaiting an already completed task doesn\'t pause the method', 'An async method with no await inside runs synchronously', 'async by itself creates a new thread', 'await blocks the thread'],
      answer: [0, 1, 2],
      explain: 'async doesn\'t create threads or block. It\'s a way to cut a method into pieces around its waits.'
    },
    {
      t: 'choice',
      q: 'A method is marked async but has no await inside. What happens?',
      options: ['It runs synchronously, and the compiler warns you (CS1998)', 'It runs on another thread', 'A compile error'],
      answer: 0,
      explain: 'No await means no pauses: the method runs to the end and returns an already completed task.'
    }
  ]
};

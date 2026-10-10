/** Async course, unit 4 final: context and deadlock (English version). */
export default {
  id: 'as.u4.boss',
  title: 'Final: context and deadlock',
  sub: 'Hang the program, then fix it three ways',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'timeline',
      task: 'Drive the WPF app into a deadlock.',
      start: { ctx: 'ui', call: 'await' },
      goal: { status: 'deadlock' },
      solve: ['call:result', 'end']
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'Fix it the right way: no ConfigureAwait, and stay in WPF.',
      start: { ctx: 'ui', call: 'result' },
      goal: { status: 'done', ctx: 'ui', call: 'await', cfa: false },
      solve: ['call:await', 'end']
    },
    {
      t: 'choice',
      q: 'Which fix is a safety net rather than a cure?',
      options: ['ConfigureAwait(false) in the library', 'await instead of .Result', 'Both are a full cure'],
      answer: 0,
      explain: 'The thread still blocks on .Result; the deadlock loop just never closes.'
    },
    {
      t: 'multi',
      q: 'Where do you need the captured context after await? Select all that apply.',
      options: ['A WPF handler updates label.Text', 'A Unity script moves a transform', 'A library parses JSON', 'An ASP.NET Core controller reads the database'],
      answer: [0, 1],
      explain: 'A library or a server doesn\'t need the UI thread.'
    },
    {
      t: 'tapline',
      q: 'Which line can hang a WPF app?',
      code: 'private void OnSave(object s, RoutedEventArgs e)\n{\n    var ok = _service.SaveAsync(doc).Result;\n    Status.Text = ok ? "Saved" : "Error";\n}',
      answer: 2,
      explain: '.Result on the UI thread while SaveAsync awaits inside without ConfigureAwait(false).'
    },
    {
      t: 'choice',
      q: 'Why doesn\'t the same line hang an ASP.NET Core server?',
      options: ['There\'s no context, so the pool runs the continuation; but the thread still sits idle', 'ASP.NET Core forbids .Result', 'It uses a different C#'],
      answer: 0,
      explain: 'Instead of a deadlock you get thread-pool starvation under load.'
    },
    {
      t: 'order',
      q: 'The wait cycle in a deadlock',
      items: ['The UI thread waits for the task', 'The task waits for its continuation', 'The continuation waits for the UI thread'],
      explain: 'A closed loop.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['.Result on the UI', 'Deadlock'],
        ['.Result on a server', 'Pool starvation'],
        ['ConfigureAwait(false)', 'Continuation on the pool'],
        ['async all the way', 'The real cure']
      ]
    }
  ]
};

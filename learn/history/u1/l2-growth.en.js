/** The history of .NET, unit 1, lesson 2: Framework grows, 2.0 to 4.5. */
export default {
  id: 'hs.u1.l2',
  title: 'Framework grows up',
  sub: 'Generics, WPF, LINQ, async, version by version',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Every version was a big step',
      body: '<p>Framework and C# grew together. Almost every release brought something you can hardly imagine C# without today.</p>'
    },
    {
      t: 'learn',
      title: '2005, 2.0: generics',
      body: '<p><code>List&lt;int&gt;</code> instead of <code>ArrayList</code>: the compiler checks the type, and numbers are not boxed into objects. Generics live in the CLR itself, not just in the language. Java does it differently.</p>'
    },
    {
      t: 'learn',
      title: '2006-2007: 3.0 and 3.5',
      body: '<p><b>3.0</b>: WPF (a new XAML-based UI), WCF (network services), Workflow Foundation.</p><p><b>3.5 and C# 3.0</b>: LINQ, lambdas, <code>var</code>, extension methods. Queries over collections and databases, written in plain C#.</p>',
      code: 'var adults = people.Where(p => p.Age >= 18)\n                   .OrderBy(p => p.Name);'
    },
    {
      t: 'learn',
      title: '2010-2012: 4.0 and 4.5',
      body: '<p><b>4.0</b>: the Task Parallel Library, TPL (<code>Task</code>, <code>Parallel.For</code>), and <code>dynamic</code>.</p><p><b>4.5 and C# 5</b>: <code>async</code> and <code>await</code>. Asynchronous code that reads like ordinary code.</p>'
    },
    {
      t: 'rig', rig: 'years',
      task: 'Find the year async and await arrived in C#.',
      goal: { year: 2012 },
      solve: ['year:2012']
    },
    {
      t: 'order',
      q: 'Put these in chronological order',
      items: ['Generics (2.0)', 'WPF (3.0)', 'LINQ (3.5)', 'Task and TPL (4.0)', 'async/await (4.5)'],
      explain: 'Each feature built on the ones before it: LINQ needs generics and lambdas, and async needs Task.'
    },
    {
      t: 'match',
      q: 'Match each version to its headline feature',
      pairs: [
        ['C# 2.0', 'Generics'],
        ['C# 3.0', 'LINQ and lambdas'],
        ['C# 4.0', 'dynamic'],
        ['C# 5.0', 'async and await']
      ]
    },
    {
      t: 'choice',
      q: 'How do .NET generics differ from Java generics?',
      options: ['They exist in the runtime itself: List<int> stores real ints with no boxing', 'They do not differ', '.NET has no generics'],
      answer: 0,
      explain: 'Java erases generics at compile time, so List<Integer> stores objects.'
    },
    {
      t: 'choice',
      q: 'What made async/await possible?',
      options: ['Task from .NET 4.0', 'WPF', 'dynamic'],
      answer: 0,
      explain: 'await waits on a task. Task came first, and two years later C# got a convenient syntax for it.'
    }
  ]
};

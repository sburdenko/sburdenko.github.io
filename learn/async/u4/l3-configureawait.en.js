/** Async, unit 4, lesson 3: ConfigureAwait(false) (English version). */
export default {
  id: 'as.u4.l3',
  title: 'ConfigureAwait(false)',
  sub: 'Skipping the context, and when that\'s dangerous',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Don\'t go back to the context',
      body: '<p><code>ConfigureAwait(false)</code> says: "the continuation doesn\'t have to run in the captured context". It goes to the pool instead.</p><p>That\'s right for library code that doesn\'t need the UI thread: fewer switches, and no deadlock if someone outside calls .Result.</p>'
    },
    {
      t: 'rig', rig: 'timeline',
      task: 'The code with .Result hangs. Fix it inside the library without touching the handler.',
      start: { ctx: 'ui', call: 'result' }, lock: ['ctx', 'call'],
      goal: { status: 'done', cfa: true, call: 'result' },
      solve: ['cfa', 'end']
    },
    {
      t: 'choice',
      q: 'What did ConfigureAwait(false) change?',
      options: ['A pool thread ran the continuation, and the task completed without the UI thread', 'The UI thread stopped blocking', 'The network replied faster'],
      answer: 0,
      explain: 'The UI thread was still stuck on .Result, but the task no longer needed it.'
    },
    {
      t: 'rig', rig: 'timeline', api: true,
      task: 'Now the method updates a window control after await. What happens with ConfigureAwait(false)?',
      start: { ctx: 'ui', call: 'await', cfa: true }, lock: ['ctx', 'call'],
      goal: { status: 'error' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Why did it crash?',
      options: ['After ConfigureAwait(false) the code ran on a pool thread, and controls may only be touched from the UI thread', 'ConfigureAwait(false) is banned in WPF', 'The network returned an error'],
      answer: 0,
      explain: 'ConfigureAwait(false) belongs only where the code after await doesn\'t need the UI thread.'
    },
    {
      t: 'learn',
      title: 'The rule',
      body: '<p>In libraries, use ConfigureAwait(false) on every await. In app code that touches the UI, leave it out.</p><p>But ConfigureAwait is a safety net, not a cure. The real cure for deadlock is not blocking at all: that\'s the next lesson.</p>',
      deep: '.NET 8 added ConfigureAwaitOptions: for example, await task.ConfigureAwait(ConfigureAwaitOptions.SuppressThrowing) waits for the task without throwing. ASP.NET Core has no context, so ConfigureAwait(false) in app code changes nothing there.'
    },
    {
      t: 'multi',
      q: 'Where does ConfigureAwait(false) belong? Select all that apply.',
      options: ['In an HTTP client library', 'In a data access library', 'In a button handler that then updates label.Text', 'In a Unity script that then moves a transform'],
      answer: [0, 1],
      explain: 'Where the code after await touches the UI or the Unity API, you need the context.'
    },
    {
      t: 'choice',
      q: 'ConfigureAwait(false) is on the method\'s first await but not the second. What\'s the risk?',
      options: ['If the first task completed at once, the context never changed, and the second await captures the UI context again', 'None', 'A compile error'],
      answer: 0,
      explain: 'An await that completes synchronously doesn\'t switch threads. That\'s why libraries put ConfigureAwait(false) on every await.'
    }
  ]
};

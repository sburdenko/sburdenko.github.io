/** Deeper C#, unit 2, lesson 2: events. */
export default {
  id: 'cs.u2.l2',
  title: 'Events',
  sub: 'A delegate outsiders can only subscribe to',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Why the event keyword',
      body: '<p>A public delegate field is dangerous: anyone can invoke it or wipe out every subscriber with <code>=</code>.</p><p><code>event</code> leaves outsiders only <code>+=</code> and <code>-=</code>. Only the owning class can raise the event.</p>',
      code: 'public class Button\n{\n    public event EventHandler? Clicked;\n    public void Press() => Clicked?.Invoke(this, EventArgs.Empty);\n}'
    },
    {
      t: 'tapline',
      q: 'Which line will not compile outside the Button class?',
      code: 'var b = new Button();\nb.Clicked += OnClick;\nb.Clicked -= OnClick;\nb.Clicked = null;',
      answer: 3,
      explain: 'From the outside an event only has += and -=. You cannot assign or invoke it.'
    },
    {
      t: 'choice',
      q: 'Why the ?. in Clicked?.Invoke(...)?',
      options: ['With no subscribers the event is null — without ?. you get a NullReferenceException', 'For speed', 'event requires it'],
      answer: 0,
      explain: 'An event with no subscribers is null.'
    },
    {
      t: 'learn',
      title: 'The standard shape',
      body: '<p>By convention a handler receives the sender and the arguments: <code>EventHandler&lt;TArgs&gt;</code>.</p>',
      code: 'public event EventHandler<OrderEventArgs>? OrderPlaced;\n\nshop.OrderPlaced += (sender, e) => Console.WriteLine(e.OrderId);'
    },
    {
      t: 'learn',
      title: 'A subscription holds on to the subscriber',
      body: '<p>The publisher stores the delegate, and the delegate stores a reference to the subscriber object. As long as the publisher is alive and you have not unsubscribed, the garbage collector will not collect the subscriber. The classic leak: a window subscribes to a global event and never unsubscribes.</p>'
    },
    {
      t: 'choice',
      q: 'A window subscribed to the static event App.ThemeChanged and closed without unsubscribing. What happens?',
      options: ['The window stays in memory: the event holds a reference to it', 'The garbage collector collects the window', 'The event unsubscribes the closed window by itself'],
      answer: 0,
      explain: 'More on this in ".NET under the hood", in the "Garbage collection and resources" unit.'
    },
    {
      t: 'blanks',
      q: 'Raise the event only if there are subscribers',
      code: 'Clicked___Invoke(this, EventArgs.Empty);',
      tiles: ['?.', '.', '!.', '??'],
      answer: ['?.'],
      explain: 'A null-conditional call.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['event', 'Outsiders get only += and -='],
        ['EventHandler<T>', 'Standard handler type'],
        ['?.Invoke', 'Raise only if there are subscribers'],
        ['-=', 'Unsubscribe and let the object go']
      ]
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['Only the owning class can raise an event', 'An event with no subscribers is null', 'A subscription keeps the subscriber in memory', 'Outsiders can clear an event with ='],
      answer: [0, 1, 2],
      explain: 'Blocking = from the outside is exactly what event is for.'
    }
  ]
};

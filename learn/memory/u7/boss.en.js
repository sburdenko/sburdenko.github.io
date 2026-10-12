/** Final of the "Object lifetime" unit of the Memory in .NET course. */
export default {
  id: 'mem.u7.boss',
  title: 'Final: object lifetime',
  sub: 'Finalization queues, weak references and leaks',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'gc',
      task: 'Owner has no finalizer and holds a small Handle that has one. Null out o and free both. Which of them dies first?',
      objects: [{ id: 'Owner', refs: ['Handle'] }, { id: 'Handle', fin: true }],
      roots: [{ name: 'o', to: 'Owner' }],
      goal: { kind: 'dead', ids: ['Owner', 'Handle'] },
      solve: ['root:o', 'gc:0', 'fin', 'gc:2']
    },
    {
      t: 'order',
      q: 'Put the steps of a single collection in order',
      items: [
        'Mark everything reachable from the roots',
        'Clear short weak references to unmarked objects',
        'Move unmarked finalizable objects to the f-reachable queue',
        'Mark everything reachable from the f-reachable queue',
        'Clear long weak references to still unmarked objects'
      ],
      explain: 'Short weak references go empty before finalizable objects are rescued, long ones after. That is why a long reference still sees an object waiting for its finalizer.'
    },
    {
      t: 'choice',
      q: 'An object has no finalizer. A short and a long weak reference point to it, no strong references. What after a collection of its generation?',
      options: [
        'Both are empty',
        'The short one is empty, the long one still returns the object',
        'Both return the object until the finalizer is called',
        'The long one holds the object until it is freed'
      ],
      answer: 0,
      explain: 'Without a finalizer the object does not go to the f-reachable queue, nobody "rescues" it, and by the long-reference step it is still unmarked. Short and long differ only for finalizable objects.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: [
        'After GC.SuppressFinalize the finalization queue entry stays, but a collection skips it',
        'A resurrected object is finalized again automatically when it dies next time',
        'An object referenced by finalizable garbage survives the same collection and gets promoted',
        'Critical finalizers are called before ordinary ones'
      ],
      answer: [0, 2],
      explain: 'For the finalizer to be called again you need GC.ReRegisterForFinalize. Critical finalizers run after ordinary ones among objects that died in the same collection, so a wrapper can still use its SafeHandle.'
    },
    {
      t: 'tapline',
      q: 'Dispose is called on the sessions, yet memory keeps growing. Which line holds the closed sessions?',
      code: 'class Session : IDisposable\n{\n    static readonly List<Session> All = new();\n    readonly Timer _ping;\n\n    public Session()\n    {\n        All.Add(this);\n        _ping = new Timer(_ => Ping(), null, 0, 5000);\n    }\n\n    public void Dispose() => _ping.Dispose();\n    void Ping() { }\n}',
      answer: 7,
      explain: 'Dispose stops the timer, and the timer queue lets go of the callback. But the static All list is a root, and nobody removes sessions from it. Dispose should also do All.Remove(this).'
    },
    {
      t: 'match',
      q: 'Match the leak source to the cure',
      pairs: [
        ['Subscription to a static event', 'Unsubscribe in Dispose'],
        ['A cache on a static Dictionary', 'MemoryCache with expiration and SizeLimit'],
        ['Data attached to someone else\'s objects', 'ConditionalWeakTable'],
        ['A GCHandle for native code', 'Free in finally'],
        ['A lambda captured an extra big array', 'Split the captures into different scopes']
      ]
    },
    {
      t: 'blanks',
      q: 'Attach metadata to widgets so that it dies together with the widget',
      code: 'static readonly ___<Widget, Meta> _meta = new();\n\nMeta MetaOf(Widget w) => _meta.___(w, _ => new Meta(w));',
      tiles: ['ConditionalWeakTable', 'GetValue', 'Dictionary', 'WeakReference', 'TryGetValue'],
      answer: ['ConditionalWeakTable', 'GetValue'],
      explain: 'GetValue finds the value or creates it with the factory, atomically. The key is weak, and the value lives while the widget lives, even if Meta references it.'
    },
    {
      t: 'choice',
      q: 'A service moves from .NET Framework 4.8 to .NET 8. The logger flushed the tail of its buffer in its finalizer on exit. What changes?',
      options: [
        'The last entries start getting lost: finalizers are not called on exit',
        'Nothing: finalizers work the same way',
        'The tail is written twice: the finalizer runs both on exit and on collection',
        'The process hangs on exit waiting for the finalizer thread'
      ],
      answer: 0,
      explain: 'In .NET Core and later, finalizers do not run when the process terminates. The buffer must be flushed explicitly: Dispose, ProcessExit or ApplicationStopping.'
    },
    {
      t: 'choice',
      q: 'A Writer with an ordinary finalizer flushes its buffer through its own SafeFileHandle. Both became garbage in the same collection. Why is the handle still open at flush time?',
      options: [
        'SafeHandle is a CriticalFinalizerObject: among objects that died together, its finalizer runs after the ordinary ones',
        'Writer references the SafeHandle, so the latter is finalized later',
        'SafeHandle is never finalized, only Dispose closes it',
        'The OS closes the handle on process exit'
      ],
      answer: 0,
      explain: 'A reference between objects does not set the finalization order. Order comes only from the split into ordinary and critical finalizers, and only for objects that died in the same collection.',
      wrong: { 1: 'The reference graph does not affect order: both go to the f-reachable queue together.' }
    }
  ]
};

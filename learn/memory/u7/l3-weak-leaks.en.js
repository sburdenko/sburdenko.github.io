/** Memory in .NET, unit "Object lifetime", lesson 3: weak references, GCHandle, ConditionalWeakTable and leaks in managed code. */
export default {
  id: 'mem.u7.l3',
  title: 'Weak references and leaks',
  sub: 'WeakReference, GCHandle, ConditionalWeakTable and who holds an object',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'WeakReference<T>: a reference that does not hold',
      body: '<p>An ordinary reference from a live object makes its target reachable. A <b>weak reference</b> lets you get to the object but does not help it live: if there are no other paths from the roots, a collection frees it, and the weak reference goes empty.</p><p>You use it in two steps: <code>TryGetTarget</code> hands out an ordinary reference, and while you hold it in a variable, the object is alive.</p><p>Under the hood <code>WeakReference&lt;T&gt;</code> is a heap object plus an entry in the collector\'s <b>handle table</b>. The GC checks every such entry on every collection, so a million weak references cost both memory and pause time.</p>',
      code: 'var cache = new WeakReference<Report>(LoadReport());\n\nif (cache.TryGetTarget(out var report))\n    report.Print();          // report holds the object to the end of the block\nelse\n    cache.SetTarget(LoadReport());'
    },
    {
      t: 'choice',
      q: 'What is wrong with this code on the non-generic WeakReference?',
      code: 'var wr = new WeakReference(LoadReport());\n// ...\nif (wr.IsAlive)\n{\n    var r = (Report)wr.Target!;\n    r.Print();\n}',
      options: [
        'A collection can happen between IsAlive and Target: Target returns null, and Print crashes',
        'IsAlive itself extends the object\'s life, so it is never collected',
        'Target throws an exception if the object was already collected',
        'Nothing: after the IsAlive check the object is guaranteed to be alive'
      ],
      answer: 0,
      explain: 'A collection can happen on any thread between two lines. Get a strong reference first, then check it. It is no accident that WeakReference<T> has only TryGetTarget and no IsAlive or Target.',
      wrong: { 2: 'Target does not throw: it returns null. It is the next line that crashes.' }
    },
    {
      t: 'learn',
      title: 'Short and long',
      body: '<p>The constructor takes <code>trackResurrection</code>. Recall the collection order from the first lesson; weak references fit into it:</p><ul><li>a <b>short</b> one (the default) is cleared as soon as the object is unreachable, <b>before</b> it moves to the f-reachable queue;</li><li>a <b>long</b> one (<code>trackResurrection: true</code>) is cleared only when the object is really freed, <b>after</b> finalization, if it was not resurrected.</li></ul><p>For an object without a finalizer there is no difference. With a finalizer, a long reference can return an object whose finalizer has already run, and you get it in an unpredictable state. You rarely need one.</p>',
      code: 'var shortRef = new WeakReference<Conn>(c);\nvar longRef  = new WeakReference<Conn>(c, trackResurrection: true);'
    },
    {
      t: 'choice',
      q: 'Conn has a finalizer. A collection ran, the finalizer has not been called yet. What do the references return?',
      code: 'var c = new Conn();\nvar shortRef = new WeakReference<Conn>(c);\nvar longRef  = new WeakReference<Conn>(c, trackResurrection: true);\nc = null;\nGC.Collect();   // the object is in the f-reachable queue',
      options: [
        'shortRef is empty, longRef still returns the object',
        'Both are empty',
        'Both still return the object',
        'shortRef returns the object, longRef is empty'
      ],
      answer: 0,
      explain: 'The collector clears short weak references before it rescues finalizable objects, and long ones after. The object in the f-reachable queue is marked live, so the long reference still sees it. And by taking it through TryGetTarget you effectively resurrect it.'
    },
    {
      t: 'learn',
      title: 'GCHandle: four kinds',
      body: '<p>A weak reference is a special case of a <b>GC handle</b>. You can create them directly with <code>GCHandle.Alloc</code>:</p><ul><li><code>Weak</code> and <code>WeakTrackResurrection</code>: short and long weak;</li><li><code>Normal</code>: strong, keeps the object alive even with no ordinary reference to it. This is how a managed object is passed to native code as a "context" through <code>GCHandle.ToIntPtr</code>;</li><li><code>Pinned</code>: strong and also forbids moving the object during compaction. Only for objects with no managed references inside.</li></ul><p>A handle is an unmanaged resource. Forget <code>Free</code> and the object lives forever, and a pinned one also punches a hole in the heap.</p>',
      code: 'var h = GCHandle.Alloc(buffer, GCHandleType.Pinned);\ntry\n{\n    Native.Fill(h.AddrOfPinnedObject(), buffer.Length);\n}\nfinally\n{\n    h.Free();   // without this, buffer is pinned forever\n}',
      deep: '<p>For short pinning during a call, <code>fixed</code> is cheaper: it creates no handle, it just marks a local variable for the GC. Long-lived pinned buffers are better allocated straight in the POH since .NET 5 (<code>GC.AllocateArray&lt;T&gt;(n, pinned: true)</code>). More in the "Advanced" unit.</p><p>.NET 10 added typed wrappers <code>GCHandle&lt;T&gt;</code>, <code>PinnedGCHandle&lt;T&gt;</code> and <code>WeakGCHandle&lt;T&gt;</code>: they implement <code>IDisposable</code> and keep you from mixing up handle kinds.</p>'
    },
    {
      t: 'match',
      q: 'Match the handle kind to its behavior',
      pairs: [
        ['GCHandleType.Normal', 'Keeps the object alive, but the GC may move it'],
        ['GCHandleType.Pinned', 'Keeps it alive and forbids moving'],
        ['GCHandleType.Weak', 'Goes empty as soon as the object is unreachable'],
        ['GCHandleType.WeakTrackResurrection', 'Goes empty when the object is freed after finalization'],
        ['DependentHandle', 'Holds the value while the key is alive']
      ]
    },
    {
      t: 'learn',
      title: 'ConditionalWeakTable: an ephemeron',
      body: '<p>You need to attach data to someone else\'s objects, say metadata to widgets created by code you do not own. An ordinary dictionary keeps the keys forever. A dictionary with weak keys does not help either: if the value references the key, the dictionary holds the value, and the value holds the key.</p><p><code>ConditionalWeakTable&lt;TKey, TValue&gt;</code> works differently: the key is weak, and the value lives <b>exactly as long as the key</b>, and references from the value to the key do not keep it alive. Such a pair is called an <b>ephemeron</b>. Keys are compared by reference, <code>Equals</code> is not called. The table is thread-safe.</p>',
      code: 'static readonly ConditionalWeakTable<Widget, Meta> _meta = new();\n\nMeta MetaOf(Widget w) => _meta.GetValue(w, _ => new Meta(w));\n// Meta references Widget and still does not hold it',
      deep: '<p>Each entry is a <b>dependent handle</b>: the primary object is weak, the secondary is reachable only if the primary is. Since .NET 6 it is available directly as <code>DependentHandle</code>. The cost: during marking the collector walks dependent handles repeatedly while new live objects keep turning up, so thousands of entries noticeably lengthen a collection.</p><p>This is not a cache: a value is not evicted under memory pressure, it lives as long as its key. For a cache use <code>MemoryCache</code> with a size limit.</p>'
    },
    {
      t: 'choice',
      q: 'Metadata is stored in a Dictionary<WeakReference<Widget>, Meta>, and Meta holds a reference to its Widget. What is wrong with that?',
      options: [
        'The dictionary holds Meta, Meta holds Widget: the weak key solves nothing, the widgets are never freed',
        'WeakReference cannot be a dictionary key: it does not compile',
        'Weak keys are cleared at the next Gen 0 collection even if the widget is alive',
        'Nothing, this is exactly how ConditionalWeakTable works'
      ],
      answer: 0,
      explain: 'The path from the root: static dictionary → Meta → Widget. While a strong path exists, the weak reference does not go empty. ConditionalWeakTable solves this with a dependent handle: Meta is reachable only through a live Widget.',
      wrong: { 2: 'A weak reference goes empty only when the object is unreachable. It will not let go of a live widget.' }
    },
    {
      t: 'learn',
      title: 'Leaks: events and closures',
      body: '<p>A leak in .NET is always a path from a root to an object nobody needs. The usual suspects were listed in the "How to measure" unit; here is the mechanism of the two least obvious ones. The first is <b>closures</b>.</p><p>All lambdas of one method that capture variables of the same scope share <b>one closure object</b> (a display class): the compiler puts all captured variables into it as fields. A lambda that needs only <code>id</code> also holds a megabyte-sized <code>big</code> if a neighboring lambda captured it.</p><p>One more thing: a subscription with a lambda <code>e += () =&gt; ...</code> cannot be undone unless the delegate is saved in a variable: a new lambda gives a different delegate, and <code>-=</code> finds nothing.</p>',
      code: 'void Start(byte[] big, int id)\n{\n    Task.Run(() => Process(big));\n    Bus.Changed += () => Log(id);   // holds both id and big\n}',
      deep: '<p>For events of long-lived publishers there are "weak events": the subscription holds the subscriber through a weak reference (<code>WeakEventManager</code> in WPF, <code>WeakReferenceMessenger</code> in CommunityToolkit.Mvvm). The cost is extra handles and the fact that unsubscribing happens only after a collection.</p><p>A dump helps find the path that holds an object, as in the "How to measure" unit: the chain from a root to the object is the answer.</p>'
    },
    {
      t: 'choice',
      q: 'The handler in the static Bus uses only id. What does it keep in memory?',
      code: 'void Start(byte[] big, int id)\n{\n    Task.Run(() => Process(big));\n    Bus.Changed += () => Log(id);\n}',
      options: [
        'A closure object with fields id and big: the array lives as long as the subscription',
        'Just a copy of id: each lambda captures its own variables',
        'Nothing: the lambda does not use this, so it is static',
        'The object Start was running on'
      ],
      answer: 0,
      explain: 'big and id are parameters of the same scope, the compiler puts them into one display class, and both lambdas are its methods. The delegate in Bus references that whole object. The fix is splitting into separate methods or copying what you need into a separate local in a nested scope.',
      wrong: { 3: 'Neither lambda touches instance fields or methods, so this does not get into the closure.' }
    },
    {
      t: 'learn',
      title: 'Statics, caches and timers',
      body: '<p>The second non-obvious one is the timer, but first the obvious. A <b>static collection</b> is a root. Whatever you put in and never remove lives until the process ends. Especially sneaky are "caches" on a <code>static Dictionary</code> without eviction: memory grows with every new key. If you need a cache, take <code>MemoryCache</code> with entry expiration and a <code>SizeLimit</code>.</p><p>A <b>timer</b> has a catch both ways. <code>System.Threading.Timer</code> registers in a static timer queue, and the queue holds the <b>callback</b>, and through it the object whose method it calls. If that object keeps the timer in its own field, it will not die until <code>Dispose</code> is called.</p><p>The flip side: the queue does not reference the <code>Timer</code> object itself. If you did not store it anywhere, it can be collected and stop firing.</p>',
      code: 'class Poller\n{\n    readonly Timer _timer;\n    public Poller() =>\n        _timer = new Timer(_ => Poll(), null, 0, 1000);\n    void Poll() { }\n    // no Dispose: Poller lives forever\n}'
    },
    {
      t: 'multi',
      q: 'Which of these keep an object alive indefinitely? Select all.',
      options: [
        'Its method is subscribed to a static event, never unsubscribed',
        'It is a value in a static Dictionary nobody removes anything from',
        'A System.Threading.Timer in its field calls its method, Dispose is never called',
        'It is a value in a ConditionalWeakTable whose key is already unreachable',
        'A WeakReference<T> in a static list points to it'
      ],
      answer: [0, 1, 2],
      explain: 'The first three are strong paths from a root: a static event, a static collection, the timer queue through the callback. A value in a ConditionalWeakTable lives as long as its key, and a weak reference holds nothing, although the WeakReference objects themselves in an ever-growing static list are a leak too.'
    },
    {
      t: 'choice',
      q: 'The timer is created and not stored anywhere. What can happen?',
      code: 'void StartHeartbeat()\n{\n    new Timer(_ => Ping(), null, 0, 1000);\n}',
      options: [
        'After some garbage collection the timer may stop firing',
        'The timer fires forever: the timer queue holds it',
        'It does not compile: the result of new must be assigned',
        'The timer fires once and stops'
      ],
      answer: 0,
      explain: 'The queue holds the timer\'s internal object and the callback, but not the Timer itself. When the Timer is collected, the finalizer of its internal object stops the timer. The documentation explicitly says to keep a reference to the Timer for as long as you need it.'
    }
  ]
};

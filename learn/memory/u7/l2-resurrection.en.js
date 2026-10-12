/** Memory in .NET, unit "Object lifetime", lesson 2: resurrection, SuppressFinalize and ReRegisterForFinalize, SafeHandle and CriticalFinalizerObject inside out. */
export default {
  id: 'mem.u7.l2',
  title: 'Resurrection and SafeHandle',
  sub: 'ReRegisterForFinalize, SuppressFinalize, critical finalizers',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Resurrection',
      body: '<p>A finalizer is an ordinary method, and <code>this</code> inside it is an ordinary reference. Store it in a static field, and the object is reachable from a root again. This is <b>resurrection</b>.</p><p>What happens then:</p><ul><li>the memory is not freed: the object lives on, now in an older generation;</li><li>its entry has left the queues, so the finalizer <b>will not be called a second time</b>;</li><li>the objects it references may already be finalized (order is not guaranteed), so a resurrected object can be half torn down.</li></ul>',
      code: 'class Zombie\n{\n    public static Zombie? Last;\n    ~Zombie()\n    {\n        Last = this;   // reachable from a static field again\n    }\n}'
    },
    {
      t: 'choice',
      q: 'A Zombie object was resurrected through Last. Later Zombie.Last = null ran. What happens at the next collection of its generation?',
      options: [
        'The memory is freed, the finalizer is not called',
        'The finalizer is called again, and the object is resurrected again',
        'The object stays in memory forever: the GC leaves resurrected objects alone',
        'The process crashes: access to a finalized object'
      ],
      answer: 0,
      explain: 'The finalizer has already run, and there is no entry in the finalization queue anymore. To the collector it is an ordinary object without a finalizer: unreachable means freed.',
      wrong: { 1: 'For a second call the object has to be registered again through GC.ReRegisterForFinalize, and Zombie does not do that.' }
    },
    {
      t: 'learn',
      title: 'GC.ReRegisterForFinalize',
      body: '<p><code>GC.ReRegisterForFinalize(obj)</code> turns finalization back on: when the object becomes garbage again, the finalizer is called once more.</p><p>Together with resurrection this gives a "finalizer-based pool": in the finalizer the object returns itself to the pool and re-registers. Sounds thrifty, but in practice it is the worst kind of pool:</p><ul><li>the object comes back only after a collection and a call on another thread, at an unknown moment;</li><li>every round promotes it and everything it references;</li><li>its fields may point at objects that are already finalized.</li></ul><p>Pools are built explicitly: <code>ArrayPool&lt;T&gt;</code>, <code>ObjectPool&lt;T&gt;</code> and returning in <code>Dispose</code>.</p>',
      deep: '<p>In CoreCLR <code>GC.SuppressFinalize</code> sets a bit in the object header, and <code>ReRegisterForFinalize</code> clears it; if the queue entry is already gone (the finalizer has run), the runtime registers the object again. Hence a subtlety: re-registering "just in case" on a live object that still has its entry can produce a second entry and a double finalizer call. Call it only together with resurrection or after <code>SuppressFinalize</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line resurrects the object?',
      code: 'class Pooled\n{\n    static readonly ConcurrentBag<Pooled> Pool = new();\n\n    ~Pooled()\n    {\n        if (Pool.Count < 16)\n        {\n            Pool.Add(this);\n            GC.ReRegisterForFinalize(this);\n        }\n    }\n}',
      answer: 8,
      explain: 'Pool.Add(this) puts the reference into a static collection, so the object is reachable from a root again. The next line resurrects nothing: it just turns the finalizer back on so the object returns to the pool next time too.'
    },
    {
      t: 'learn',
      title: 'SuppressFinalize: what it saves',
      body: '<p>The Dispose pattern ends with a call to <code>GC.SuppressFinalize(this)</code>. The resource is already released, the finalizer is not needed.</p><p>The finalization queue entry <b>stays</b>: the registration at <code>new</code> is already paid for. But the object is flagged, and when a collection finds it dead, it does not move it to the f-reachable queue but frees it right away. The savings: no call on the finalizer thread, no extra collection, no promoted graph.</p><p>Conclusion: a finalizer plus <code>Dispose</code> with <code>SuppressFinalize</code> is still more expensive than no finalizer at all. That is why a class holding a <code>SafeHandle</code> does not need a finalizer of its own.</p>',
      code: 'public void Dispose()\n{\n    Dispose(disposing: true);\n    GC.SuppressFinalize(this);   // the entry stays, but the GC skips it\n}'
    },
    {
      t: 'choice',
      q: 'In a class with a finalizer, Dispose releases the resource, but GC.SuppressFinalize was forgotten. The user dutifully calls Dispose. What do we lose?',
      options: [
        'Every object still goes through the f-reachable queue: an extra collection, promotion and a finalizer call',
        'Nothing: the GC can see Dispose was already called',
        'The resource is released twice and the process crashes',
        'The object is never freed'
      ],
      answer: 0,
      explain: 'The collector knows nothing about IDisposable. Without SuppressFinalize the object is an ordinary finalizable one to it. If Dispose(false) is idempotent, there is no harm beyond the cost, but the cost is everything from the previous lesson.',
      wrong: { 2: 'If the finalizer checks an "already released" flag, there is no second release. The loss is in performance.' }
    },
    {
      t: 'learn',
      title: 'Why a bare IntPtr is not enough',
      body: '<p>A class keeps a handle in an <code>IntPtr</code> field and closes it in the finalizer. The <code>Read</code> method reads <code>_h</code> and passes the number to a native call. After the field is read, <code>this</code> is no longer used, and the JIT considers it dead.</p><p>If there are no other references, a collection can happen <b>in the middle</b> of the native call: the object is unreachable, the finalizer closes the handle, and <code>Read</code> is still using it. The old cure is <code>GC.KeepAlive(this)</code> after the call.</p><p><code>SafeHandle</code> handles this itself: the wrapper object itself is passed to the call, the marshaller keeps it alive, increments its reference count before the call (<code>DangerousAddRef</code>) and decrements it after. <code>Dispose</code> in the middle of a call only marks the handle as closed, and <code>ReleaseHandle</code> runs on the last <code>Release</code>, exactly once.</p>',
      deep: '<p>Another hole SafeHandle plugs: P/Invoke returned a handle, but it was not wrapped in time, because an exception happened between the return and creating the wrapper. For a returned SafeHandle the marshaller creates the wrapper object <b>before</b> the call, and after the call it only stores the number into it. That is why a derived class needs a parameterless constructor.</p><p>The counter and the "closed" and "disposed" flags live in one integer field, <code>_state</code>, and change through <code>Interlocked</code>. <code>DangerousAddRef</code> and <code>DangerousGetHandle</code> are available to you too, for when you need to pass the number to code the marshaller cannot see. Then <code>DangerousRelease</code> in a <code>finally</code> is mandatory.</p>'
    },
    {
      t: 'choice',
      q: 'Once in a while Read returns an "invalid handle" error. Why?',
      code: 'class Device\n{\n    IntPtr _h = Native.Open();\n    ~Device() => Native.Close(_h);\n    public int Read() => Native.Read(_h);\n}\n\nint n = new Device().Read();',
      options: [
        'After _h is read nobody needs the Device object: a collection during Native.Read runs the finalizer, which closes the handle',
        'The finalizer is called before the constructor',
        'IntPtr gets boxed, and Read receives a copy',
        'Native.Open is called on the finalizer thread'
      ],
      answer: 0,
      explain: 'The JIT tracks reference lifetimes up to their last use. this is used only to read the field; after that the object can become garbage even while its method is on the stack. The cure is SafeHandle instead of IntPtr, or GC.KeepAlive(this) after the native call.'
    },
    {
      t: 'learn',
      title: 'CriticalFinalizerObject: then and now',
      body: '<p><code>SafeHandle</code> derives from <code>CriticalFinalizerObject</code>. What this gives you <b>now</b>: if ordinary and critical objects became garbage in the same collection, the runtime first calls all the ordinary finalizers, then the critical ones. So a wrapper class finalizer can still flush its buffer through its SafeHandle: the handle itself is closed later.</p><p><b>Back then</b>, in .NET Framework, "critical" meant more. The finalizer code was compiled ahead of time (CER, constrained execution regions) so it could not fail for lack of memory for the JIT, and it ran even on a rude AppDomain unload and thread abort. .NET Core has neither <code>Thread.Abort</code> nor AppDomain unloading, and CERs are not supported. What remains is the ordering guarantee and SafeHandle itself.</p>',
      deep: '<p>In the CoreCLR collector, critical finalizers sit in the queue as a separate segment, which is where the order comes from. The guarantee is weak: it covers only objects that died in the same collection. If the wrapper survived a collection while the SafeHandle died earlier (nobody else referenced it), the order is different.</p>'
    },
    {
      t: 'match',
      q: 'Match the method to what it does',
      pairs: [
        ['GC.SuppressFinalize(obj)', 'A collection frees the object without calling the finalizer'],
        ['GC.ReRegisterForFinalize(obj)', 'The finalizer is called again when the object becomes garbage'],
        ['GC.KeepAlive(obj)', 'The object is reachable at least up to this line'],
        ['GC.WaitForPendingFinalizers()', 'Wait until the finalizer thread drains the queue'],
        ['handle.DangerousAddRef(ref ok)', 'The handle is not closed until the matching Release']
      ]
    },
    {
      t: 'learn',
      title: 'Your own SafeHandle',
      body: '<p>For a native resource without a ready-made wrapper, write your own SafeHandle. Most often you derive from <code>SafeHandleZeroOrMinusOneIsInvalid</code>: it already has <code>IsInvalid</code> for the values 0 and -1.</p><p>One thing is left: <code>ReleaseHandle</code>. The runtime calls it exactly once, from <code>Dispose</code> or from the critical finalizer. Inside: only closing the handle, no exceptions, locks or touching other objects. Return <code>true</code> if the release succeeded.</p>',
      code: 'sealed class MapHandle : SafeHandleZeroOrMinusOneIsInvalid\n{\n    public MapHandle() : base(ownsHandle: true) { }\n\n    protected override bool ReleaseHandle()\n        => NativeMethods.CloseHandle(handle);\n}\n\n// [LibraryImport(...)] static partial MapHandle CreateFileMapping(...);'
    },
    {
      t: 'blanks',
      q: 'Complete the wrapper for a native handle',
      code: 'sealed class MapHandle : ___\n{\n    public MapHandle() : base(ownsHandle: true) { }\n\n    protected override bool ___()\n        => NativeMethods.CloseHandle(handle);\n}',
      tiles: ['SafeHandleZeroOrMinusOneIsInvalid', 'ReleaseHandle', 'CriticalFinalizerObject', 'Dispose', 'Finalize'],
      answer: ['SafeHandleZeroOrMinusOneIsInvalid', 'ReleaseHandle'],
      explain: 'The base class provides IsInvalid, the reference count and the critical finalizer, and the constructor with ownsHandle comes from it. Only ReleaseHandle is overridden: Dispose and the finalizer are already written in SafeHandle and will call it once.'
    }
  ]
};

/** Unit 3, lesson 5: SafeHandle, and memory leaks despite the GC. */
export default {
  id: 'dotnet.w3.l5',
  title: 'SafeHandle and leaks',
  sub: 'Native handles and objects that won\'t die',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'When the resource is fully native',
      body: '<p>Sometimes P/Invoke hands you a raw OS handle, just an <code>IntPtr</code> number. It must be closed even if someone forgot to call <code>Dispose</code>.</p><p>You don\'t need to write your own finalizer for that: .NET has a ready-made wrapper, <b>SafeHandle</b>.</p>'
    },
    {
      t: 'learn',
      title: 'Why SafeHandle beats your own finalizer',
      body: '<p>Its finalizer is <b>critical</b>: the runtime runs it with stronger guarantees than a regular one.</p><p>While a P/Invoke call is in progress, SafeHandle counts references, so the handle can\'t be closed mid-call. Otherwise the OS could hand the same number to another resource, and data would go to the wrong place (handle recycling).</p><p>All you have to write is <code>ReleaseHandle()</code>.</p>',
      code: 'sealed class MyHandle : SafeHandleZeroOrMinusOneIsInvalid\n{\n    public MyHandle() : base(ownsHandle: true) { }\n    protected override bool ReleaseHandle() => CloseHandle(handle);\n}'
    },
    {
      t: 'choice',
      q: 'Why is closing a handle in the middle of a P/Invoke call dangerous?',
      options: ['The OS may give the same number to a new resource, and the code writes data to the wrong place', 'The program gets slower', 'It isn\'t dangerous'],
      answer: 0,
      explain: 'Handle numbers get reused. SafeHandle won\'t let a handle close while a call is using it.'
    },
    {
      t: 'choice',
      q: 'What in .NET already uses SafeHandle?',
      options: ['FileStream, sockets and other wrappers over OS resources', 'Only your code', 'Nothing, it\'s an obsolete class'],
      answer: 0,
      explain: 'SafeFileHandle, SafeSocketHandle, SafeWaitHandle: all of them derive from SafeHandle.'
    },
    {
      t: 'learn',
      title: 'Leaks happen even with a GC',
      body: '<p>The GC only removes what\'s unreachable. If something alive references an object you no longer need, that object will never die.</p><p>The classic case is subscribing to an event on a long-lived object. The event keeps a reference to the subscriber.</p>',
      code: 'AppEvents.Changed += window.OnChanged;\n// the window was closed, but never unsubscribed'
    },
    {
      t: 'rig', rig: 'gc',
      task: 'The window was closed: form.window = null. Run a collection and see whether Window dies. Then fix the leak.',
      objects: [{ id: 'Window', refs: ['View'] }, { id: 'View' }],
      roots: [
        { name: 'form.window', to: 'Window' },
        { name: 'AppEvents.Changed (static)', to: 'Window', btn: '-= OnChanged', cut: 'Unsubscribed from the event' }
      ],
      goal: { kind: 'dead', ids: ['Window', 'View'] },
      solve: ['root:form.window', 'gc:0', 'root:AppEvents.Changed (static)', 'gc:2']
    },
    {
      t: 'choice',
      q: 'The window was closed, but memory keeps growing. The profiler shows a static event holding the window. What do you do?',
      options: ['Unsubscribe from the event when the window closes', 'Call GC.Collect()', 'Add a finalizer to the window'],
      answer: 0,
      explain: 'As long as the event references the window, the window is reachable. Neither GC.Collect nor a finalizer will help.'
    },
    {
      t: 'multi',
      q: 'What can keep an unneeded object alive? Select all that apply.',
      options: ['A subscription to an event on a long-lived object', 'A static cache collection that is never cleared', 'A timer that references the object', 'A local variable of a method that already returned', 'A reference cycle between two garbage objects'],
      answer: [0, 1, 2],
      explain: 'A leak in .NET is always a path from a root to an object you don\'t need. Finished methods and garbage cycles don\'t create such a path.'
    },
    {
      t: 'order',
      q: 'Someone forgot Dispose on an object with a SafeHandle. What happens next?',
      items: ['The object becomes unreachable', 'The GC finds it and puts it on the finalization queue', 'The finalizer thread calls ReleaseHandle()', 'The next collection frees the memory'],
      explain: 'The resource does get released, just late. Dispose is always better.'
    }
  ]
};

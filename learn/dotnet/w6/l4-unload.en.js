/** .NET inside out, unit "Loading and hosting", lesson 4: unloading collectible contexts and the unhandled exception policy. */
export default {
  id: 'dotnet.w6.l4',
  title: 'Unloading and crashes',
  sub: 'Collectible contexts, what keeps them alive, and unhandled exceptions',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Collectible: a context you can unload',
      body: '<p>A context created with <code>isCollectible: true</code> can be unloaded together with all its assemblies (since .NET Core 3.0). The plugin code, its types and the machine code the JIT produced live in that context memory and are freed with it.</p><p>But unloading is <b>cooperative</b>. <code>Unload()</code> only starts it. The garbage collector finishes it, once no strong references from outside point at the context assemblies, types and objects, and no thread is running its code.</p><p>This is the opposite of <code>AppDomain.Unload</code>, which aborted threads by force. Here nobody aborts anything: whatever holds the context keeps it.</p>',
      code: 'class PluginLoadContext : AssemblyLoadContext\n{\n    public PluginLoadContext(string name)\n        : base(name, isCollectible: true) { }\n}\n\nvar alc = new PluginLoadContext("report");\n// ... load and run the plugin ...\nalc.Unload();   // unloading started, not finished yet',
      deep: 'Inside the runtime the context memory belongs to a LoaderAllocator object. While it is reachable, nothing is freed. Limitations: C++/CLI assemblies cannot be loaded into a collectible context, and ReadyToRun machine code in such assemblies is ignored, so the JIT compiles the methods.'
    },
    {
      t: 'choice',
      q: 'The alc.Unload() call has returned. Are the plugin assemblies unloaded already?',
      options: ['No: unloading has only started, the GC finishes it once no references remain', 'Yes, right after Unload returns', 'Yes, and the plugin threads are aborted, as with AppDomain', 'No: a collectible context unloads only at process exit'],
      answer: 0,
      explain: 'Unload puts the context into the unloading state. Only the garbage collector can free the memory, and it does so when the context becomes unreachable.',
      wrong: { 2: 'AppDomain unloaded by force. AssemblyLoadContext aborts nobody: a thread running plugin code keeps the context alive.' }
    },
    {
      t: 'learn',
      title: 'What keeps a context alive',
      body: '<p>Unloading is blocked by any strong reference from outside to an assembly, type or object of the context, and by context code on the stack of any thread. In practice:</p><ul><li><b>host static fields and caches</b>: a <code>Type → handler</code> dictionary, the last plugin result;</li><li><b>subscriptions</b>: the plugin subscribed to a host event, so the event delegate references the plugin object;</li><li>plugin <b>threads and timers</b>: a thread in <code>Thread.Sleep</code>, a <code>Timer</code>, a <code>RegisteredWaitHandle</code> with a plugin callback;</li><li><b>strong GCHandles</b>, normal and pinned;</li><li><b>local variables</b>, including invisible temporaries the JIT introduced;</li><li><b>fields of your</b> AssemblyLoadContext subclass that reference plugin assemblies and objects.</li></ul><p>A <code>WeakReference</code> does not block unloading.</p>',
      deep: 'The last item is sneaky: while unloading is in progress, the runtime itself holds a strong handle to the context object. So subclass fields pointing at an Assembly or plugin objects will not be collected even after you let go of the context. Clear them. The AssemblyLoadContext.Unloading event is where a plugin can stop its threads and free its GCHandles.'
    },
    {
      t: 'multi',
      q: 'What will prevent the plugin context from unloading? Select all.',
      options: ['A host static field holds a plugin object', 'The plugin subscribed to a static host event', 'A plugin background thread sleeps in Thread.Sleep', 'The host keeps a WeakReference to the context', 'The plugin passed a string to the host, and the host stored it'],
      answer: [0, 1, 2],
      explain: 'A static field and a delegate in an event are strong references to a plugin object. A sleeping thread keeps plugin code on its stack. A WeakReference does not count. A string is a System.String from CoreLib, not a plugin type: it does not hold the context.'
    },
    {
      t: 'learn',
      title: 'How to unload and make sure',
      body: '<p>Everything that touches the plugin goes into a separate method marked <code>NoInlining</code>: otherwise the JIT may inline it into the caller, and references to the context stay in the caller stack. Only a <code>WeakReference</code> is handed out.</p><p>Then you run garbage collection while the reference is alive. One pass is usually enough. If plugin objects have finalizers, it takes several: a finalizer keeps its object alive for one more collection.</p>',
      code: '[MethodImpl(MethodImplOptions.NoInlining)]\nstatic WeakReference RunPlugin(string path)\n{\n    var alc = new PluginLoadContext(path);\n    Assembly asm = alc.LoadFromAssemblyPath(path);\n    // ... create the plugin and call it ...\n    alc.Unload();\n    return new WeakReference(alc);\n}\n\nvar weak = RunPlugin("/app/plugins/Report.dll");\nfor (int i = 0; weak.IsAlive && i < 10; i++)\n{\n    GC.Collect();\n    GC.WaitForPendingFinalizers();\n}\nConsole.WriteLine(weak.IsAlive ? "not unloaded" : "unloaded");',
      deep: 'If the context does not unload, take a dump and find what holds it. In WinDbg or LLDB with the SOS extension, <code>dumpheap -type LoaderAllocator</code> shows the context object and <code>gcroot &lt;address&gt;</code> shows the reference chain to a root. The root can be a stack slot, a static field or a GCHandle. If a thread running plugin code holds the context, the thread stacks show it (<code>clrstack</code>).'
    },
    {
      t: 'tapline',
      q: 'After RunPlugin and the GC.Collect loop the context is still alive. Registry is a static host class. Which line blocks unloading?',
      code: '[MethodImpl(MethodImplOptions.NoInlining)]\nstatic WeakReference RunPlugin(string path)\n{\n    var alc = new PluginLoadContext(path);\n    var asm = alc.LoadFromAssemblyPath(path);\n    var plugin = (IPlugin)Activator.CreateInstance(asm.GetType("Report.Plugin")!)!;\n    plugin.Run();\n    Registry.Last = plugin;\n    alc.Unload();\n    return new WeakReference(alc);\n}',
      answer: 7,
      explain: 'A host static field is a GC root. Through the plugin object it holds its type, its assembly and the whole context. The method locals disappear after it returns; the static field does not.'
    },
    {
      t: 'learn',
      title: 'An unhandled exception: the process goes down',
      body: '<p>An exception nobody catches terminates the <b>whole process</b>, whatever thread it happens on: the main thread, a <code>new Thread</code>, the thread pool, the finalizer thread.</p><p>Then: in .NET Framework 1.x exceptions on pool threads and the finalizer were silently swallowed, and only the thread died. Version 2.0 made the policy strict, and the <code>legacyUnhandledExceptionPolicy</code> flag in app.config brought the old behavior back. Modern .NET has no such flag.</p><p>Why: a thread that dies quietly leaves program state half-changed, and the program goes on with corrupted data. Better to fail at once and loudly.</p>',
      deep: 'The runtime itself swallows only the service exceptions it uses to control threads: in Framework, ThreadAbortException and AppDomainUnloadedException on threads the CLR created. In .NET 5+ Thread.Abort throws PlatformNotSupportedException. A stack overflow cannot be caught at all: the process ends without events or finally blocks; the stack lesson in the memory course covers it.'
    },
    {
      t: 'choice',
      q: 'The host calls plugin.Run() inside try/catch (Exception). Inside Run the plugin does new Thread(() => throw new InvalidOperationException()).Start() and returns at once. What happens?',
      options: ['The process terminates: nobody caught the exception on the other thread', 'The host catch catches the exception', 'Only the plugin thread dies, the host keeps running', 'The plugin context unloads automatically'],
      answer: 0,
      explain: 'try/catch catches only exceptions of its own thread. The new thread has no handler, so the exception becomes unhandled, and that terminates the whole process. An assembly load context does not protect against crashes.',
      wrong: { 2: 'That was .NET Framework 1.x. Since 2.0 an unhandled exception on any thread terminates the process.' }
    },
    {
      t: 'learn',
      title: 'UnhandledException is a notice, not a rescue',
      body: '<p>The <code>AppDomain.CurrentDomain.UnhandledException</code> event arrives before termination. In it you can write a log, flush buffers, save a dump. You cannot cancel the crash: <code>e.IsTerminating</code> is <code>true</code>.</p><p>What does <b>not</b> bring the process down:</p><ul><li>an exception in a <code>Task</code> nobody awaited: since .NET 4.5 it only raises <code>TaskScheduler.UnobservedTaskException</code> when the GC collects the task;</li><li>an exception caught in a <code>catch</code>.</li></ul><p>But <code>async void</code> does crash it: the exception has nowhere to return, so it is thrown on the synchronization context or the thread pool.</p>',
      code: 'AppDomain.CurrentDomain.UnhandledException += (_, e) =>\n{\n    Log.Fatal((Exception)e.ExceptionObject);\n    Log.Flush();\n    // e.IsTerminating == true: the process ends anyway\n};',
      deep: '<p>.NET 10 added <code>ExceptionHandling.SetUnhandledExceptionHandler(Func&lt;Exception, bool&gt;)</code> in <code>System.Runtime.ExceptionServices</code>. The documentation names its purpose: hosts such as REPLs and game scripting that cannot otherwise handle exceptions thrown by plugins. The handler returns <code>true</code> if the exception was handled, and it can be set once; a second call throws <code>InvalidOperationException</code>. Check the documentation for your version on which threads and cases it covers before building a host on it.</p><p>In .NET Framework a native host could change the policy through <code>ICLRPolicyManager::SetUnhandledExceptionPolicy</code>.</p>'
    },
    {
      t: 'multi',
      q: 'What terminates the process by default in .NET 8? Select all.',
      options: ['An exception in a method started with new Thread', 'An exception in an async void method', 'An exception in a Task nobody awaited', 'An exception in a ThreadPool.QueueUserWorkItem callback', 'An exception caught in catch and logged'],
      answer: [0, 1, 3],
      explain: 'A thread, async void and a pool callback have no handler above them, so the exception becomes unhandled. A task nobody awaited only raises UnobservedTaskException during garbage collection.'
    },
    {
      t: 'learn',
      title: 'Summary: what a plugin context protects against',
      body: '<p><b>It protects</b> against dependency version conflicts, and it lets you unload a plugin and load a new version without a restart.</p><p><b>It does not protect</b> against crashes, since an exception on a plugin thread terminates the host; against memory corruption and infinite loops, since the heap and the CPU are shared; against leaks, since a forgotten subscription holds the whole context.</p><p>A plugin you do not trust, or one that crashes often, needs a <b>separate process</b>: you can kill it, restart it and cap its memory with OS tools. That is what replaces what domains used to do.</p>'
    },
    {
      t: 'choice',
      q: 'The host subscribed to UnhandledException and writes a log in the handler. A plugin timer throws an exception in its callback. What happens?',
      options: ['The log is written, then the process terminates', 'The log is written, and the host keeps running', 'The handler is not called: the exception is from another context', 'The timer stops, everything else keeps running'],
      answer: 0,
      explain: 'A timer callback runs on the thread pool, and an exception in it becomes unhandled. The UnhandledException event is process-wide: it arrives, but it cannot cancel termination.',
      wrong: { 2: 'Load contexts do not split the process into domains. There is one UnhandledException event for the whole process.' }
    }
  ]
};

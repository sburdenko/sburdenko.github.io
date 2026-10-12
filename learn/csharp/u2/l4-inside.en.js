/** Deeper C#, unit "Delegates, events and closures", lesson 4: how a delegate works inside. */
export default {
  id: 'cs.u2.l4',
  title: 'Delegates inside out',
  sub: 'The delegate class, chains, exceptions and explicit add/remove',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'One delegate line is a whole class',
      body: '<p>The declaration <code>delegate int Op(int a, int b);</code> is not a "function type" but a <b>class</b>. The compiler generates a sealed class <code>Op</code> deriving from <code>System.MulticastDelegate</code>, with four methods:</p><ul><li>a constructor <code>(object, IntPtr)</code> — an object and a method address;</li><li><code>Invoke(int a, int b)</code> — with the same signature as the delegate;</li><li><code>BeginInvoke</code> and <code>EndInvoke</code> — old-style asynchronous invocation.</li></ul><p>These methods have no bodies: they are marked <code>runtime managed</code>, and the CLR supplies their code. <code>Func</code> and <code>Action</code> are the same kind of class, just already declared in the library.</p>',
      code: '.class public auto ansi sealed Op\n    extends [System.Runtime]System.MulticastDelegate\n{\n    .method public specialname rtspecialname instance void\n        .ctor(object, native int) runtime managed { }\n    .method public virtual instance int32\n        Invoke(int32 a, int32 b) runtime managed { }\n    // BeginInvoke and EndInvoke look the same, no body\n}',
      deep: '<p>The compiler turns <code>op(2, 3)</code> into <code>callvirt Op::Invoke</code>. The JIT does not call Invoke like an ordinary method: it reads the object and the code address from the delegate and makes an indirect call — close to a virtual call in cost. The JIT usually cannot inline a delegate\'s target; with dynamic PGO (.NET 8+) it sometimes inserts a "is it that same method" check and a direct call — guarded devirtualization for delegates.</p><p>On .NET Framework, <code>BeginInvoke</code> ran the delegate on the thread pool through the remoting infrastructure. On .NET Core and later the method is still in the metadata but throws <code>PlatformNotSupportedException</code>. The replacement is <code>Task.Run(() =&gt; op(2, 3))</code>.</p>'
    },
    {
      t: 'choice',
      q: 'What does the compiler turn op(2, 3) into, where op is a variable of type Op?',
      options: ['op.Invoke(2, 3)', 'op.DynamicInvoke(2, 3)', 'A direct call to the target method', 'op.BeginInvoke(2, 3, null, null)'],
      answer: 0,
      explain: 'Invoking a delegate is always a call to its Invoke method. The compiler does not know what will be inside the delegate: that is decided at run time.',
      wrong: { 1: 'DynamicInvoke is a slow reflection-based call with an argument array. The compiler never uses it on its own.', 2: 'Which method the delegate holds is known only at run time.' }
    },
    {
      t: 'learn',
      title: 'Inside: an object and a code address',
      body: '<p>A delegate instance is a heap object. It inherits two key fields from <code>System.Delegate</code>:</p><ul><li><code>_target</code> — the object to call an instance method on;</li><li><code>_methodPtr</code> — the address of the method\'s machine code.</li></ul><p>From outside you see them as the <code>Target</code> and <code>Method</code> properties. For a static method <code>Target</code> returns null. Creating a delegate in IL is <code>ldftn</code> (take the method address) plus <code>newobj</code> on the constructor: one allocation.</p>',
      code: 'class Greeter\n{\n    public string Name = "Anna";\n    public void Hello() => Console.WriteLine($"Hello, {Name}");\n}\n\nvar g = new Greeter();\nAction a = g.Hello;                    // newobj Action(g, address of Hello)\nConsole.WriteLine(a.Target == g);      // True\nConsole.WriteLine(a.Method.Name);      // Hello',
      deep: '<p>A delegate to a static method is trickier inside: the real address sits in <code>_methodPtrAux</code>, while <code>_methodPtr</code> holds a small shuffle thunk that shifts the arguments, since there is no receiver object. The <code>Target</code> property still returns null. Because of the thunk, a delegate to a static method is slightly more expensive to call than one to an instance method.</p><p>That is why the C# compiler turns capture-free lambdas into instance methods of a hidden singleton class <code>&lt;&gt;c</code> and caches the delegate itself in a static field: creating it again does not allocate. Since C# 11 a static method group conversion is cached the same way (<code>Func&lt;int, int&gt; f = Math.Abs;</code>).</p>'
    },
    {
      t: 'choice',
      q: 'What does this print?',
      code: 'Func<int, int> twice = x => x * 2;\nConsole.WriteLine(twice.Target is null);',
      options: ['False: Target is an instance of the hidden <>c class', 'True: a capture-free lambda compiles to a static method', 'False: Target is the delegate twice itself', 'Does not compile: a lambda has no Target'],
      answer: 0,
      explain: 'The C# compiler places capture-free lambdas in instance methods of the <>c singleton: a delegate to an instance method needs no argument-shuffling thunk. Target is that singleton.',
      wrong: { 1: 'It sounds logical, but the compiler avoids it on purpose: a delegate to a static method goes through a thunk and is slightly slower.' }
    },
    {
      t: 'learn',
      title: 'A chain is a new object',
      body: '<p><code>a += b</code> means <code>a = (Action)Delegate.Combine(a, b)</code>. Combine changes neither <code>a</code> nor <code>b</code>: delegates are <b>immutable</b>. It creates a new delegate that holds an array inside — the <b>invocation list</b> of all methods in order.</p><p><code>-=</code> is <code>Delegate.Remove</code>: also a new object, without the last occurrence of the method. Remove the last method and you get null.</p><p>Two consequences. Every <code>+=</code> is an allocation, and a chain also has an array. And a copy of the delegate in another variable does not see new subscriptions: it points to the old object.</p>',
      code: 'Action a = () => Console.Write("A");\nAction snapshot = a;\na += () => Console.Write("B");\n\na();          // AB\nsnapshot();   // A — the old object did not change\nConsole.WriteLine(a.GetInvocationList().Length);   // 2',
      deep: '<p>In <code>MulticastDelegate</code> the chain lives in the <code>_invocationList</code> field (an <code>object[]</code> of delegates) and <code>_invocationCount</code>. Combine with null returns the other argument without allocating. When appending, the runtime can reuse an array with spare room if the next slot in it is still free — so a series of <code>+=</code> does not copy the whole list every time.</p><p>Immutability makes invocation thread-safe: <code>handler?.Invoke()</code> works on one snapshot of the chain even if another thread is unsubscribing right now. That is why the old advice "copy the event to a local before the null check" boils down to <code>?.</code> today.</p>'
    },
    {
      t: 'choice',
      q: 'What does this print?',
      code: 'Action log = () => Console.Write("1");\nAction copy = log;\nlog += () => Console.Write("2");\ncopy += () => Console.Write("3");\nlog();\ncopy();',
      options: ['1213', '123123', '1212', '12313'],
      answer: 0,
      explain: 'copy = log copies a reference to a single-method delegate. Each += creates a new chain and stores it only in its own variable: log is 1 and 2, copy is 1 and 3.',
      wrong: { 1: 'That would be true if += appended the method to a shared object. But delegates are immutable.' }
    },
    {
      t: 'learn',
      title: 'Exceptions and results in a chain',
      body: '<p><code>Invoke</code> on a chain is a loop over the invocation list. Hence behavior that is easy to forget:</p><ul><li>An <b>exception</b> in the second method breaks the loop. The third and later ones are <b>not called</b>, and the exception flies to whoever invoked the delegate.</li><li>The <b>return value</b> comes from the last method; the other results are discarded. Each next method sees <code>ref</code> and <code>out</code> parameters already changed by the previous one.</li></ul><p>If you need to call everyone independently or collect all results, walk <code>GetInvocationList()</code> yourself.</p>',
      code: 'EventHandler? saved = null;\nsaved += (s, e) => Console.WriteLine("to log");\nsaved += (s, e) => throw new IOException("disk full");\nsaved += (s, e) => Console.WriteLine("to cache");   // not called by saved(...)\n\nforeach (EventHandler h in saved.GetInvocationList())\n{\n    try { h(null, EventArgs.Empty); }\n    catch (Exception ex) { Console.WriteLine(ex.Message); }\n}'
    },
    {
      t: 'tapline',
      q: 'On which line does Console.WriteLine never run?',
      code: 'Action steps = () => Console.WriteLine("step 1");\nsteps += () => throw new InvalidOperationException();\nsteps += () => Console.WriteLine("step 3");\ntry { steps(); }\ncatch (InvalidOperationException) { Console.WriteLine("error"); }\nConsole.WriteLine("done");',
      answer: 2,
      explain: 'The chain calls the methods in turn: "step 1", then the exception. The third method is never called — the exception has left Invoke. catch prints "error", then "done".'
    },
    {
      t: 'blanks',
      q: 'Collect the results of all checks, not just the last one',
      code: 'Func<string, bool> rules = IsNotEmpty;\nrules += IsShort;\nvar results = new List<bool>();\nforeach (Func<string, bool> r in rules.___())\n    results.Add(r.___("abc"));',
      tiles: ['GetInvocationList', 'Invoke', 'DynamicInvoke', 'Combine', 'BeginInvoke'],
      answer: ['GetInvocationList', 'Invoke'],
      explain: 'GetInvocationList returns an array of delegates, one method each. Their Invoke returns its own bool. DynamicInvoke would return object — it does not go into a List<bool> without a cast, and a reflection call is slow anyway.'
    },
    {
      t: 'learn',
      title: 'An event with explicit add and remove',
      body: '<p>An ordinary event <code>public event EventHandler? Changed;</code> is expanded by the compiler into a private delegate field and two accessor methods: <code>add_Changed</code> and <code>remove_Changed</code>. Those are what <code>+=</code> and <code>-=</code> call from outside.</p><p>You can write the accessors yourself — like <code>get</code> and <code>set</code> on a property. Then the compiler creates no field, and you decide where subscribers live: in one dictionary for all events, in another object, in weak references.</p>',
      code: 'class Panel\n{\n    private readonly Dictionary<string, Delegate?> _handlers = new();\n\n    public event EventHandler? Resized\n    {\n        add => _handlers["Resized"] = Delegate.Combine(_handlers.GetValueOrDefault("Resized"), value);\n        remove => _handlers["Resized"] = Delegate.Remove(_handlers.GetValueOrDefault("Resized"), value);\n    }\n\n    protected void OnResized() =>\n        (_handlers.GetValueOrDefault("Resized") as EventHandler)?.Invoke(this, EventArgs.Empty);\n}',
      deep: '<p>Since C# 4 the generated <code>add</code> of an ordinary event takes no <code>lock</code>: in a loop it reads the field, calls <code>Delegate.Combine</code> and tries to store the result with <code>Interlocked.CompareExchange</code> until nobody interferes. Subscribing from different threads is safe. In your own accessors thread safety is on you — the dictionary in the example does not provide it.</p><p>Why bother: a class with a hundred events that usually nobody subscribes to would spend a field per event in every object. Windows Forms controls therefore keep subscribers in a single <code>EventHandlerList</code>. In metadata an event is an <code>.event</code> record linking the name to the <code>add_</code> and <code>remove_</code> methods.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line inside the Panel class does not compile?',
      code: 'class Panel\n{\n    private EventHandler? _resized;\n\n    public event EventHandler? Resized\n    {\n        add => _resized += value;\n        remove => _resized -= value;\n    }\n\n    void Raise()\n    {\n        _resized?.Invoke(this, EventArgs.Empty);\n        Resized?.Invoke(this, EventArgs.Empty);\n    }\n}',
      answer: 13,
      explain: 'An event with explicit accessors has no field behind the name Resized. Even inside the class it can only appear on the left of += and -= (error CS0079). You invoke the delegate you store yourself — _resized.'
    },
    {
      t: 'match',
      q: 'Match',
      pairs: [
        ['_target', 'The object to call the method on'],
        ['_methodPtr', 'The method\'s code address'],
        ['Delegate.Combine', 'A new delegate with an invocation list'],
        ['GetInvocationList()', 'The chain\'s delegates one by one'],
        ['add and remove', 'Accessors that += and -= call']
      ]
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['+= on a delegate creates a new object; the old one does not change', 'If the second method in a chain throws, the third still runs', 'A delegate class derives from MulticastDelegate and is sealed', 'In .NET 8 BeginInvoke runs the delegate on the thread pool', 'An event with explicit add and remove cannot be invoked by name'],
      answer: [0, 2, 4],
      explain: 'An exception breaks the chain: the remaining methods are not called. On .NET Core and later BeginInvoke throws PlatformNotSupportedException — use Task.Run instead.'
    }
  ]
};

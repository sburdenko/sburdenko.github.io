/** Deeper C#, unit "Exceptions and reliability", lesson 3: unhandled exceptions, the cost of an exception, TryXxx and your own exception types. */
export default {
  id: 'cs.u12.l3',
  title: 'Unhandled, cost and your own exceptions',
  sub: 'What brings the process down, what throw costs, the TryXxx pattern and designing exceptions',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Where an exception brings down the whole process',
      body: '<p>An exception not caught in <b>any frame of its own thread</b> terminates the whole process — whether it is the main thread or not. This has been so since .NET 2.0; in .NET 1.x errors on background threads were silently swallowed.</p><p>The process crashes on an unhandled exception:</p><ul><li>in a <code>new Thread(...)</code> thread;</li><li>in thread pool work: <code>ThreadPool.QueueUserWorkItem</code>, a <code>System.Threading.Timer</code> callback;</li><li>in a <b>finalizer</b> — the finalizer thread is just a thread;</li><li>in <code>async void</code> — the exception goes to the synchronization context or the pool.</li></ul><p>An exception inside <code>Task.Run</code> does not crash the process: the task stores it, as in the "Async/await in depth" course.</p>',
      code: 'new Thread(() => throw new Exception("boom")).Start();\n// Unhandled exception. System.Exception: boom\n// the process is terminated\n\nThreadPool.QueueUserWorkItem(_ => throw new Exception());\n// same thing\n\nclass Handle { ~Handle() => throw new Exception(); }\n// crashes when the finalizer thread\n// reaches the object after a collection'
    },
    {
      t: 'multi',
      q: 'Which of these unhandled exceptions will terminate the process? Select all.',
      options: ['throw in the body of new Thread(...)', 'throw in a finalizer ~T()', 'throw in Task.Run, nobody awaits the task', 'throw in a ThreadPool.QueueUserWorkItem callback', 'throw in a catch that is itself inside an outer try with a catch'],
      answer: [0, 1, 3],
      explain: 'A thread, the finalizer thread and a pool work item — the exception has nowhere further to go, so the process crashes. Task.Run puts the exception into the task. An exception from a catch is caught by the outer try — it is handled.'
    },
    {
      t: 'learn',
      title: 'AppDomain.UnhandledException — the last word',
      body: '<p>Before the crash the runtime raises <code>AppDomain.CurrentDomain.UnhandledException</code>. The stack is not unwound yet, <code>e.ExceptionObject</code> holds the exception, and <code>e.IsTerminating</code> is <code>true</code>.</p><p>It is a <b>notification, not a handler</b>: it cannot cancel termination. Its job is to write a log, flush the logger\'s buffers, send a report. After the handler the process ends anyway.</p><p>One more thing: an exception from another thread cannot be caught by a <code>try</code> around <code>Start</code> or <code>Join</code>. Each thread has its own stack, and the handler search walks only that stack. Catch inside the thread.</p>',
      code: 'AppDomain.CurrentDomain.UnhandledException += (_, e) =>\n{\n    var ex = (Exception)e.ExceptionObject;\n    log.Fatal(ex, "crash");\n    log.Flush();   // otherwise the last entries are lost\n};',
      deep: '<p><code>ExceptionObject</code> is typed <code>object</code>: in IL you can throw anything, not just an <code>Exception</code>. C# will not let you, and the runtime wraps foreign objects in <code>RuntimeWrappedException</code> (the <code>RuntimeCompatibility(WrapNonExceptionThrows = true)</code> attribute, which the C# compiler puts on the assembly itself).</p><p>In ASP.NET Core an unhandled exception in a request does not crash the process: the server catches it and turns it into a 500 response. But background threads and <code>async void</code> crash there just the same. For background work there is <code>BackgroundService</code>; since .NET 6 a failed <code>ExecuteAsync</code> stops the host by default (<code>BackgroundServiceExceptionBehavior.StopHost</code>).</p>'
    },
    {
      t: 'choice',
      q: 'What will the user see?',
      code: 'var t = new Thread(() => throw new InvalidOperationException());\ntry\n{\n    t.Start();\n    t.Join();\n}\ncatch (Exception)\n{\n    Console.WriteLine("caught");\n}',
      options: ['The process crashes, caught is not printed', 'caught', 'caught, and the thread restarts', 'Nothing: the thread\'s exception silently vanishes'],
      answer: 0,
      explain: 'The exception travels up thread t\'s stack, and there is no handler there. The main thread\'s try has nothing to do with that stack. Join just waits for the thread to finish; it does not pass errors along.',
      wrong: { 3: 'That was .NET 1.x. Since .NET 2.0 an unhandled exception on any thread terminates the process.' }
    },
    {
      t: 'learn',
      title: 'What throw costs',
      body: '<p>A throw is not just a jump. The runtime:</p><ul><li>creates the exception object on the heap;</li><li>in the first pass walks the stack and evaluates filters;</li><li>in the second pass unwinds frames, runs finally blocks and records each frame into the exception\'s stack.</li></ul><p>The orders of magnitude: on .NET 9, throwing and catching a failed <code>int.Parse</code> takes <b>a few microseconds</b>, while <code>int.TryParse</code> on the same string takes <b>a few nanoseconds</b>. About a thousandfold difference, and it grows with stack depth. Exact numbers depend on the machine.</p><p>Hence the rule: exceptions are for <b>exceptional</b> situations. If failure is an ordinary outcome (bad input, missing key), return it as a value.</p>',
      deep: '<p>The most expensive part is turning the stack into text (method names, line numbers from the PDB), but it is lazy: you pay only if you read <code>StackTrace</code> or log <code>ToString()</code>. In .NET 9 CoreCLR switched to the managed exception handling from NativeAOT, and throws got several times faster — but the gap with a plain <code>return</code> is still huge.</p>'
    },
    {
      t: 'choice',
      q: 'A file with a million lines, every tenth is not a number. Parsing uses int.Parse with catch (FormatException). Roughly how much time goes to the exceptions alone?',
      options: ['About half a second', 'About a millisecond', 'About a minute', 'None: the JIT removes exceptions in Release'],
      answer: 0,
      explain: 'A hundred thousand throws at a few microseconds each — hundreds of milliseconds. With TryParse the same work would take a few milliseconds for the whole file. With a deeper stack exceptions cost even more.',
      wrong: { 3: 'The JIT does not turn throw into a returned value: every throw is a real stack walk and unwind.' }
    },
    {
      t: 'learn',
      title: 'The TryXxx pattern',
      body: '<p>For operations where failure is a normal outcome, .NET uses the <b>TryXxx</b> pattern: the method returns <code>bool</code>, and the result comes through <code>out</code>. Usually there is a twin without <code>Try</code> that throws: <code>int.Parse</code> and <code>int.TryParse</code>, the dictionary indexer and <code>TryGetValue</code>.</p><p>The <code>[NotNullWhen(true)]</code> attribute tells nullable analysis: if it returned <code>true</code>, the <code>out</code> is not null. Without it the caller has to write <code>user!</code>.</p><p>A Try method does not swallow everything: it returns <code>false</code> only for the expected failure. Programmer and environment errors — a bad argument, a broken disk — it still throws.</p>',
      code: 'public bool TryFind(string id, [NotNullWhen(true)] out User? user)\n{\n    user = _cache.GetValueOrDefault(id);\n    return user is not null;\n}\n\nif (repo.TryFind(id, out var user))\n    Greet(user);   // no warning: user is not null',
      deep: '<p>The alternative is "test, then do" (tester-doer): <code>if (dict.ContainsKey(k)) v = dict[k];</code>. That is two lookups instead of one, and a race if another thread changes the collection. A Try method does the check and the action as one operation — which is why almost all of <code>ConcurrentDictionary</code>\'s API is <code>TryAdd</code>, <code>TryRemove</code>, <code>TryUpdate</code>.</p>'
    },
    {
      t: 'blanks',
      q: 'Finish the Try method so that after true the caller gets a non-null user with no warnings',
      code: 'public bool TryLoad(int id, [___(true)] out User? user)\n{\n    if (!_rows.TryGetValue(id, out var row))\n    {\n        user = null;\n        return ___;\n    }\n    user = Map(row);\n    return true;\n}',
      tiles: ['NotNullWhen', 'MaybeNull', 'NotNull', 'false', 'true'],
      answer: ['NotNullWhen', 'false'],
      explain: 'NotNullWhen(true) ties the result to the out parameter. When there is no row, the method returns false and puts null into out — an ordinary outcome, not an exception.'
    },
    {
      t: 'learn',
      title: 'Your own exception: when and how',
      body: '<p>First ask whether you need a new type. A standard one often fits: <code>ArgumentException</code> and its descendants — a bad argument, <code>InvalidOperationException</code> — the object is in the wrong state, <code>NotSupportedException</code>, <code>ObjectDisposedException</code>. Your own type is needed when the caller will catch <b>exactly it</b> and react specially.</p><p>If you need one:</p><ul><li>derive from <code>Exception</code> (not <code>ApplicationException</code> — that idea was dropped long ago);</li><li>end the name with <code>Exception</code>;</li><li>provide three constructors: empty, with a message, with a message and an inner exception;</li><li>put data for handling into properties, not just into the text.</li></ul><p>Do not write the serialization constructor <code>(SerializationInfo, StreamingContext)</code> anymore: in .NET 8 it was obsoleted along with BinaryFormatter (SYSLIB0051).</p>',
      code: 'public sealed class OrderNotFoundException : Exception\n{\n    public int OrderId { get; }\n\n    public OrderNotFoundException() { }\n    public OrderNotFoundException(string message) : base(message) { }\n    public OrderNotFoundException(string message, Exception inner)\n        : base(message, inner) { }\n    public OrderNotFoundException(int orderId)\n        : base($"Order {orderId} not found") => OrderId = orderId;\n}',
      deep: '<p>For argument checks there are ready-made helpers: <code>ArgumentNullException.ThrowIfNull</code> (.NET 6), <code>ArgumentException.ThrowIfNullOrEmpty</code> and <code>ObjectDisposedException.ThrowIf</code> (.NET 7), <code>ArgumentOutOfRangeException.ThrowIfNegative</code> and friends (.NET 8). They take the parameter name themselves via <code>[CallerArgumentExpression]</code>.</p><p>Why throws are moved into a separate method: building the exception and the string bloats the method\'s code and gets in the way of inlining it. A call to a helper that only throws is recognized by the JIT as a no-return branch and moved to cold code. The <code>[StackTraceHidden]</code> attribute (.NET 6) hides the helper itself from the stack.</p>'
    },
    {
      t: 'multi',
      q: 'Which exceptions should library code not throw itself? Select all.',
      options: ['System.Exception', 'NullReferenceException', 'InvalidOperationException', 'IndexOutOfRangeException', 'ArgumentOutOfRangeException'],
      answer: [0, 1, 3],
      explain: 'Exception is too general: you cannot catch it separately from the rest. NullReferenceException and IndexOutOfRangeException are thrown by the runtime and signal a bug in the code. For a bad argument use ArgumentNullException and ArgumentOutOfRangeException, for a wrong state InvalidOperationException.'
    },
    {
      t: 'learn',
      title: 'Where to catch Exception as a whole',
      body: '<p><code>catch (Exception)</code> without a filter catches everything: bugs, cancellation and things you did not think of. Its place is <b>at the boundaries</b>: the top of request or message handling, a thread\'s entry point, a background job\'s loop. There the error is logged and a decision is made: skip the item, retry, stop.</p><p>Inside the logic catch specific types or add a filter. Above all do not swallow <code>OperationCanceledException</code>: cancellation is not an error, and by swallowing it you keep doing work the user asked to stop.</p>',
      code: 'catch (Exception e) when (e is not OperationCanceledException)\n{\n    log.Warn(e, "item skipped");\n}'
    },
    {
      t: 'tapline',
      q: 'The user pressed Cancel, but the upload went on through the remaining files. Which line is to blame?',
      code: 'void UploadAll(IEnumerable<string> files, CancellationToken ct)\n{\n    foreach (var file in files)\n    {\n        try\n        {\n            Upload(file, ct);\n        }\n        catch (Exception e)\n        {\n            log.Warn(e, $"skip {file}");\n        }\n    }\n}',
      answer: 8,
      explain: 'Upload throws OperationCanceledException, and catch (Exception) catches it too: the cancellation is logged as "file skipped" and the loop goes on. You need the filter when (e is not OperationCanceledException) — then cancellation flies out and stops the loop.'
    }
  ]
};

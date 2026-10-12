/** Deeper C#, unit "Exceptions and reliability", lesson 1: what finally guarantees and how when filters work. */
export default {
  id: 'cs.u12.l1',
  title: 'finally and when filters',
  sub: 'What finally promises, two-pass handling and logging without catching',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'What finally promises',
      body: '<p>A <code>finally</code> block runs no matter how control leaves the <code>try</code>:</p><ul><li>the code ran to the end;</li><li>a <code>return</code>, <code>break</code>, <code>continue</code> or <code>goto</code> jumped out;</li><li>an exception flew out and a <code>catch</code> caught it — right here or several frames up.</li></ul><p><code>using</code>, <code>lock</code> and <code>foreach</code> rely on this: the compiler lowers them into <code>try/finally</code> so that <code>Dispose</code> or <code>Monitor.Exit</code> is called in every case.</p>',
      code: 'using var file = File.OpenRead(path);\nreturn Parse(file);\n\n// the compiler turns this into roughly:\nvar file = File.OpenRead(path);\ntry\n{\n    return Parse(file);\n}\nfinally\n{\n    file?.Dispose();\n}'
    },
    {
      t: 'choice',
      q: 'What does F() return?',
      code: 'static int F()\n{\n    int x = 1;\n    try\n    {\n        return x;\n    }\n    finally\n    {\n        x = 10;\n    }\n}',
      options: ['1', '10', 'It does not compile', '0'],
      answer: 0,
      explain: 'return x first copies the value into a temporary, then finally runs, then the method returns the saved copy. Changing x in finally does not touch it. If x were a reference to a list, changes inside the object would be visible — the reference is copied, not the object.',
      wrong: { 2: 'You may change variables in finally. What is forbidden is leaving it: return inside finally is error CS0157.' }
    },
    {
      t: 'learn',
      title: 'When finally does not run',
      body: '<p>The finally promise holds only while the process is alive and the stack unwinds normally. It does not run if:</p><ul><li><b>the stack overflowed</b> — <code>StackOverflowException</code> ends the process at once (as in the "Memory in .NET" course);</li><li><b><code>Environment.FailFast</code></b> was called — the process ends immediately, with no finally blocks and no finalizers, writing an entry to the Windows event log;</li><li><b><code>Environment.Exit</code></b> was called inside <code>try</code> — that thread\'s finally does not run, though process-exit handlers do;</li><li>the process was <b>killed from outside</b>: <code>kill -9</code>, "End task", a power cut.</li></ul><p>For an <b>unhandled</b> exception the documentation does not promise finally: it depends on how the runtime tears the process down.</p>',
      deep: '<p>On .NET 9 on Linux, with an unhandled exception in Main, the order is: first the <code>AppDomain.UnhandledException</code> event and the "Unhandled exception" message, and only then finally. The runtime learned there was no handler <b>before</b> unwinding the stack — that is the two-pass scheme, coming up in a couple of screens. Do not rely on that finally: on another OS, version or under a debugger the behaviour may differ.</p><p>The takeaway for reliable code: finally is for releasing resources inside a living process. Data that must survive a crash is saved ahead of time (a transaction, a write to disk with fsync), not "at the last moment".</p>'
    },
    {
      t: 'multi',
      q: 'In which cases will this try\'s finally NOT run? Select all.',
      options: ['The try calls Environment.FailFast("bye")', 'The try executes return', 'Infinite recursion in the try overflows the stack', 'The exception from the try is caught three frames up', 'The process receives SIGKILL'],
      answer: [0, 2, 4],
      explain: 'return and an exception caught higher up are normal exits, so finally runs. FailFast, a stack overflow and SIGKILL end the process without unwinding the stack.'
    },
    {
      t: 'learn',
      title: 'An exception from finally wipes out the original',
      body: '<p>If finally runs because of an exception and throws a new one itself, the original is <b>lost</b>: only the new one travels up the stack. The log shows a cleanup error instead of the real cause.</p><p>So code in finally is written not to throw: check for null, and <code>Dispose</code> should not throw per .NET guidelines. The compiler will not let you leave finally with <code>return</code>, <code>break</code> or <code>goto</code> — error <b>CS0157</b>.</p>',
      code: 'try\n{\n    Save(order);              // threw IOException\n}\nfinally\n{\n    connection.Close();       // connection == null →\n                              // NullReferenceException,\n                              // the IOException is lost\n}'
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'try\n{\n    try { throw new InvalidOperationException("A"); }\n    finally { throw new ArgumentException("B"); }\n}\ncatch (Exception e)\n{\n    Console.WriteLine(e.GetType().Name);\n}',
      options: ['ArgumentException', 'InvalidOperationException', 'AggregateException', 'The process crashes'],
      answer: 0,
      explain: 'The exception from finally replaced the one in flight. The InvalidOperationException ends up neither in InnerException nor anywhere else — it simply vanished.',
      wrong: { 2: 'AggregateException collects errors from tasks and Parallel. A plain try/finally combines nothing.' }
    },
    {
      t: 'learn',
      title: 'Two passes: search first, then unwind',
      body: '<p>The CLR handles an exception in <b>two passes</b>:</p><p><b>First pass — search.</b> The runtime walks up the stack from the throw point looking for a matching <code>catch</code>. <code>when</code> filters are evaluated here. The stack is <b>untouched</b>: every frame, its locals and the throw point are still in place.</p><p><b>Second pass — unwind.</b> Having found a handler, the runtime goes again from the throw point, running every <code>finally</code> along the way and popping frames. Only then does it enter the <code>catch</code> body.</p><p>If the first pass finds nobody, the exception is unhandled, and the process learns about it while the stack is still intact. That is why a crash dump shows the exact spot.</p>',
      deep: '<p>The scheme comes from Windows SEH; on Linux and macOS CoreCLR reproduces it on its own. In .NET 9 exception handling in CoreCLR was rewritten in managed code (the implementation came from NativeAOT) — the two passes stayed, and handling got noticeably faster.</p>'
    },
    {
      t: 'choice',
      q: 'Log prints a string and returns true. What does the program print?',
      code: 'try\n{\n    try { throw new Exception(); }\n    finally { Console.Write("finally "); }\n}\ncatch (Exception) when (Log("filter "))\n{\n    Console.Write("catch");\n}',
      options: ['filter finally catch', 'finally filter catch', 'finally catch', 'filter catch finally'],
      answer: 0,
      explain: 'The outer catch filter is evaluated in the first pass, while the inner finally has not run yet. Then the second pass unwinds the stack — finally — and only then the catch body.',
      wrong: { 1: 'That would happen if the stack were unwound before checking the filter — as with catch and rethrow. The filter sees the stack intact.' }
    },
    {
      t: 'learn',
      title: 'The when filter and logging without catching',
      body: '<p>The filter <code>catch (X e) when (condition)</code> arrived in C# 6. If the condition is false, this catch is skipped and the search continues — to the next catch or further up the stack. If the filter itself throws, that exception is swallowed and counts as <code>false</code>.</p><p>The key trick is <b>logging through a filter</b>: the method writes the log and returns <code>false</code>. The exception is not caught, the stack is not unwound, yet the entry is written. Compare with <code>catch { Log(e); throw; }</code>: there the stack has already unwound to this frame, and a dump or debugger no longer shows the locals at the throw point.</p>',
      code: 'try\n{\n    Process(order);\n}\ncatch (Exception e) when (LogAndContinue(e))\n{\n    // never reached\n}\n\nstatic bool LogAndContinue(Exception e)\n{\n    log.Error(e, "Process failed");\n    return false;   // "not mine" — keep looking\n}',
      deep: '<p>In IL a filter is a separate <code>filter</code> block next to the <code>catch</code>; VB.NET and F# had it from the start, C# caught up in version 6. A filter runs while frames below it are not yet unwound, so keep it short and free of side effects other than logging: inner <code>finally</code> blocks have not run, and a <code>lock</code> taken deeper is still held.</p><p>Even earlier than filters, the <code>AppDomain.CurrentDomain.FirstChanceException</code> event fires — on every throw, even a caught one. Good for diagnostics, not for logic.</p>'
    },
    {
      t: 'blanks',
      q: 'Retry on a transient error, and only log the other errors without catching them',
      code: 'catch (IOException e) ___ (IsTransient(e))\n{\n    retry = true;\n}\ncatch (Exception e) when (Log(e))\n{\n    // unreachable: Log always returns ___\n}',
      tiles: ['when', 'if', 'where', 'true', 'false'],
      answer: ['when', 'false'],
      explain: 'The filter keyword is when. Log returns false, so the second catch never enters its body: the exception keeps travelling up the stack, but it has been logged while the stack was intact.'
    },
    {
      t: 'learn',
      title: 'Then and now: ThreadAbortException and CER',
      body: '<p>In .NET Framework an exception could arrive <b>at any point</b>: <code>Thread.Abort</code> injected a <code>ThreadAbortException</code> into another thread — even between creating an object and storing the reference. Once caught, it was automatically rethrown at the end of the catch until someone called <code>Thread.ResetAbort</code>. ASP.NET timeouts and <code>Response.Redirect</code> worked this way.</p><p>The defence was the <b>CER</b> (constrained execution region): <code>RuntimeHelpers.PrepareConstrainedRegions</code> and the <code>ReliabilityContract</code> attribute made the runtime compile the finally code ahead of time, so cleanup would not fail on low memory or an abort.</p><p>Modern .NET has none of this: <code>Thread.Abort</code> throws <code>PlatformNotSupportedException</code> (since .NET 5 also with warning SYSLIB0006), CERs are not supported (SYSLIB0004). Stopping a thread is cooperative only, through a <code>CancellationToken</code>.</p>',
      deep: '<p>Dropping asynchronous exceptions made everything simpler: an exception only appears where code calls or checks something. Running out of memory has not gone away, but OS resources have <code>SafeHandle</code>: it closes the handle both in <code>Dispose</code> and in the finalizer if Dispose was forgotten, and it will not close the handle while another thread is using it. And when the process ends, the OS closes its handles itself.</p><p>Code unloading, for which Framework aborted a domain\'s threads, was replaced by collectible <code>AssemblyLoadContext</code>s, and unloading there is cooperative too: while a thread runs code from the context, it does not unload.</p>'
    },
    {
      t: 'match',
      q: 'Match the situation with what happens',
      pairs: [
        ['Thread.Abort() in .NET 8', 'PlatformNotSupportedException'],
        ['Environment.FailFast in try', 'The process ends without finally'],
        ['return inside finally', 'Compile error CS0157'],
        ['An exception inside a when filter', 'The filter counts as false'],
        ['throw in finally during an exception', 'The original exception is lost']
      ]
    }
  ]
};

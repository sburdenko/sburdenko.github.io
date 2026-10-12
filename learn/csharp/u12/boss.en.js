/** Final of the "Exceptions and reliability" unit of the Deeper C# course. */
export default {
  id: 'cs.u12.boss',
  title: 'Final: exceptions and reliability',
  sub: 'Two passes, rethrowing, broken types and cost',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'Log prints a string and returns true only for "B". What does the program print?',
      code: 'try\n{\n    try { throw new Exception(); }\n    catch (Exception) when (Log("A")) { }\n    finally { Console.Write("F "); }\n}\ncatch (Exception) when (Log("B"))\n{\n    Console.Write("C ");\n}',
      options: ['A B F C', 'A F B C', 'F A B C', 'A B C F'],
      answer: 0,
      explain: 'First pass: filter A is false, the search goes on, filter B is true. Only now does the second pass unwind the stack: the inner finally prints F. The catch body runs last.',
      wrong: { 1: 'The inner try\'s finally runs in the second pass, which starts only after the first pass has found a handler — filter B.' }
    },
    {
      t: 'multi',
      q: 'In which cases will finally not run? Select all.',
      options: ['The try calls Environment.Exit(0)', 'The try is left by a break out of a loop', 'The process is killed with SIGKILL', 'The exception is caught in the calling method'],
      answer: [0, 2],
      explain: 'Environment.Exit inside try does not run that thread\'s finally, and SIGKILL lets the process run nothing at all. break and an exception caught higher up are normal exits.'
    },
    {
      t: 'tapline',
      q: 'The LIMIT variable is not set. Accessing Settings.Path throws TypeInitializationException. Which line is the real cause?',
      code: 'static class Settings\n{\n    public static readonly string Root =\n        Environment.GetEnvironmentVariable("ROOT") ?? "/srv";\n    public static readonly int Limit =\n        int.Parse(Environment.GetEnvironmentVariable("LIMIT")!);\n    public static string Path => Root + "/data";\n}',
      answer: 5,
      explain: 'int.Parse(null) throws ArgumentNullException, which ends up in InnerException. The initializers of all fields form one static constructor, so the whole type is broken, Path included, until the process restarts.'
    },
    {
      t: 'choice',
      q: 'A background thread saved a caught exception in a field. The main thread must throw it with the original stack. How?',
      options: [
        'ExceptionDispatchInfo.Capture(e) in the thread, Throw() in the main one',
        'throw saved; in the main thread',
        'throw; in the main thread',
        'throw new AggregateException(saved);'
      ],
      answer: 0,
      explain: 'ExceptionDispatchInfo throws the same object and keeps the original stack, appending the new frames after a separator. await works the same way.',
      wrong: { 1: 'throw saved starts the stack at this line; the place in the background thread is lost.', 2: 'throw; without an argument outside a catch is compile error CS0156.' }
    },
    {
      t: 'match',
      q: 'Match how it was in .NET Framework with how it is now',
      pairs: [
        ['Thread.Abort', 'PlatformNotSupportedException'],
        ['CER and PrepareConstrainedRegions', 'Not supported, SYSLIB0004'],
        ['The exception serialization constructor', 'Obsolete in .NET 8, SYSLIB0051'],
        ['Thread exceptions were swallowed in .NET 1.x', 'Unhandled on any thread crashes the process']
      ]
    },
    {
      t: 'choice',
      q: 'In a hot loop half the keys are missing from the dictionary. What is wrong with this code?',
      code: 'try\n{\n    total += prices[key];\n}\ncatch (KeyNotFoundException)\n{\n    missing++;\n}',
      options: [
        'Every miss is a throw with a stack walk and unwind, microseconds instead of nanoseconds; use TryGetValue',
        'Nothing: a try without an exception is free, and an exception costs as much as an if',
        'The dictionary indexer returns default for a missing key, so the catch never fires',
        'KeyNotFoundException must not be caught, it is a runtime exception'
      ],
      answer: 0,
      explain: 'The try itself costs almost nothing; the throw is what is expensive. When a missing key is an ordinary outcome, check it with a value: TryGetValue does one lookup and does not throw.',
      wrong: { 2: 'The Dictionary indexer throws KeyNotFoundException. GetValueOrDefault and TryGetValue are the ones that return default.' }
    },
    {
      t: 'multi',
      q: 'What is true about AppDomain.UnhandledException? Select all.',
      options: ['It fires for an unhandled exception on any thread', 'It lets you cancel process termination', 'It is the place to write a log and flush buffers', 'It fires for an exception in a Task nobody awaited'],
      answer: [0, 2],
      explain: 'It is a notification before the crash: IsTerminating is true and it cannot be cancelled. Exceptions of unawaited tasks go to TaskScheduler.UnobservedTaskException and do not crash the process.'
    },
    {
      t: 'blanks',
      q: 'The boundary of a background job: log any error, but let cancellation through',
      code: 'try\n{\n    Run(ct);\n}\ncatch (Exception e) ___ (e is not ___Exception)\n{\n    log.Error(e, "job failed");\n}',
      tiles: ['when', 'if', 'OperationCanceled', 'Aggregate', 'Argument'],
      answer: ['when', 'OperationCanceled'],
      explain: 'The when filter excludes OperationCanceledException: cancellation is not caught and stops the work, while the other errors go to the log.'
    }
  ]
};

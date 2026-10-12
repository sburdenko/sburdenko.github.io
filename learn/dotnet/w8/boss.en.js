/** Final of the unit "Runtime performance" and of the whole ".NET inside out" course. */
export default {
  id: 'dotnet.w8.boss',
  title: 'Course final: .NET inside out',
  sub: 'From CIL to the hot path — test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'order',
      q: 'The path of a hot method from source to the best machine code in .NET 8',
      items: ['The C# compiler turns the method into CIL', 'CIL and metadata go into the assembly', 'First call: the stub calls the JIT and Tier 0 comes out', 'An instrumented version collects the profile', 'A background thread builds Tier 1 using the profile'],
      explain: 'The whole course in one chain: the compiler, the assembly, the JIT on demand, and then the runtime refines hot code from a live profile.'
    },
    {
      t: 'choice',
      q: 'A command-line tool runs thousands of times a day in CI and works for a fraction of a second. No reflection, no plugins. What gives the biggest win?',
      options: ['Native AOT: no JIT and no CIL loading at startup', 'Dynamic PGO: the profile will speed up hot methods', 'AggressiveOptimization on every method', 'Turn off tiered compilation'],
      answer: 0,
      explain: 'The program lives so briefly that almost nothing reaches Tier 1: all the time is startup. Native AOT removes the JIT entirely, and its restrictions do not get in the way here.',
      wrong: { 1: 'PGO pays off over long runs. In a fraction of a second the profile has no time to be collected, let alone used.', 3: 'Without tiers every method is compiled fully optimized right away — startup only gets slower.' }
    },
    {
      t: 'multi',
      q: 'What is true about code after warmup? Select all.',
      options: ['A static readonly bool can become a constant in Tier 1, and the branch disappears', 'AggressiveInlining lets you inline a virtual call with an unknown type', 'sealed helps the JIT call a method directly', 'Tier 0 inlines small methods', 'Guarded devirtualization keeps a fallback virtual call'],
      answer: [0, 2, 4],
      explain: 'AggressiveInlining only lifts the size limit: it cannot tell whose body to insert when the type is unknown. Tier 0 inlines nothing.'
    },
    {
      t: 'tapline',
      q: 'Which line allocates a heap object for a boxed int?',
      code: 'int n = 42;\nobject o = n;\nint m = (int)o;\nlong l = n;',
      answer: 1,
      explain: 'Assigning a value type to object is boxing: an object with a header and a type pointer appears on the heap. Unboxing with (int)o copies the value back, and int to long is an ordinary widening with no heap involved.'
    },
    {
      t: 'match',
      q: 'Match the course concept to what it means',
      pairs: [
        ['Generation 0', 'Where new objects land'],
        ['SafeHandle', 'Reliably closes a native handle'],
        ['Interlocked.Increment', 'An atomic count++ without lock'],
        ['AssemblyLoadContext', 'Isolating and unloading plugins'],
        ['OSR', 'Switching to optimized code mid-loop']
      ]
    },
    {
      t: 'choice',
      q: 'A method was timed with a Stopwatch: one call right after the program started. What was actually measured?',
      options: ['JIT time and slow Tier 0 code, not the steady-state speed', 'The peak speed of the method after warmup', 'Only garbage collection time', 'The speed of code from a ReadyToRun image'],
      answer: 0,
      explain: 'The first call goes through the stub and the JIT, and the resulting code is Tier 0 without inlining. Only warmup and many iterations show the steady-state speed — which is what BenchmarkDotNet does.'
    },
    {
      t: 'blanks',
      q: 'Add an allocations column and a comparison against the reference',
      code: '[___]\npublic class ParseBench\n{\n    private readonly string _s = "12345";\n\n    [Benchmark(___ = true)]\n    public int Old() => int.Parse(_s);\n\n    [Benchmark]\n    public int New() => int.TryParse(_s, out var v) ? v : 0;\n}',
      tiles: ['MemoryDiagnoser', 'Baseline', 'GlobalSetup', 'Params', 'Consumer'],
      answer: ['MemoryDiagnoser', 'Baseline'],
      explain: '[MemoryDiagnoser] adds Allocated and Gen0, Baseline = true adds a Ratio column relative to Old. Both methods return their result, so the JIT will not throw the computation away.'
    },
    {
      t: 'multi',
      q: 'What is missing from an app built with Native AOT? Select all.',
      options: ['A JIT at run time', 'Tiered compilation and Dynamic PGO', 'A garbage collector', 'Loading new assemblies on the fly', 'Type information for GetType()'],
      answer: [0, 1, 3],
      explain: 'The garbage collector and the type system are part of the small Native AOT runtime — memory is still managed and GetType works. There is no JIT, and so no tiers, no PGO and no loading of new code.'
    },
    {
      t: 'choice',
      q: 'A program uses List<int>, List<long>, List<string> and List<object>. How many distinct machine-code versions of the Add method will the JIT produce?',
      options: ['3', '4', '1', '2'],
      answer: 0,
      explain: 'Every value type T gets its own copy: int and long. All reference T share one piece of code — a reference is always pointer-sized. Three in total.',
      wrong: { 1: 'string and object are reference types; they share code.', 2: 'int and long differ in size and the code handles them differently — the copies are separate.' }
    }
  ]
};

/** .NET inside out, unit "Runtime performance", lesson 1: tiered compilation, OSR and Dynamic PGO. */
export default {
  id: 'dotnet.w8.l1',
  title: 'JIT tiers and Dynamic PGO',
  sub: 'Tier 0, Tier 1, OSR and a live profile',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'The JIT dilemma: compile fast or run fast',
      body: '<p>In the unit "How .NET code runs" you saw two passes: Tier 0, then Tier 1. Now for the why.</p><p>An optimizing JIT is expensive: inlining, register allocation and removing array bounds checks all cost compile time. Yet at startup thousands of methods run once or twice: static constructors, reading configuration, registering services. Optimizing them is wasted time.</p><p>So <b>Tier 0</b> is built with almost no optimizations: no inlining, locals live on the stack rather than in registers. The code is worse, but it is ready fast. Code is made good only where it pays off — in hot methods.</p>',
      deep: '<p>In .NET Framework and early .NET Core the JIT always compiled with full optimizations, and NGen took care of fast startup. Tiered compilation arrived in .NET Core 2.1 as an opt-in and has been on by default since .NET Core 3.0.</p><p>Tier 0 is essentially the same minopts mode the JIT uses for Debug builds. You can turn tiers off entirely with <code>&lt;TieredCompilation&gt;false&lt;/TieredCompilation&gt;</code>: every method is then compiled optimized right away, startup gets slower, and Dynamic PGO disappears.</p>'
    },
    {
      t: 'learn',
      title: 'How a method becomes hot',
      body: '<p>Tier 0 code sits behind a <b>call counter</b>. Once a method reaches the threshold — about <b>30 calls</b> — it is queued. A <b>background thread</b> compiles an optimized version, and when it is ready the method entry point is redirected to the new code.</p><p>The program does not stop: threads already inside the old code finish there, and new calls go to the new code.</p><p>Counting does not start right away. While the JIT is busy compiling new Tier 0 methods at startup, counting is postponed: otherwise all the initialization code would end up "hot".</p>',
      deep: '<p>Runtime knobs for experiments: <code>DOTNET_TC_CallCountThreshold</code> (the threshold, 30 by default) and <code>DOTNET_TC_CallCountingDelayMs</code> (the counting delay, 100 ms by default; it is extended while new Tier 0 methods keep appearing). These are internal settings, not a public contract: the values can change between versions.</p><p>Tier 1 is the end of the line. If the program behaves differently later, the method is not recompiled again.</p>'
    },
    {
      t: 'rig', rig: 'jit',
      task: 'A service handles requests. Call HandleRequest ("×10" speeds things up) until Parse reaches Tier 1. Then call LoadConfig once — where does it stay?',
      methods: [
        { name: 'HandleRequest', calls: ['Parse'] },
        { name: 'Parse' },
        { name: 'LoadConfig' }
      ],
      tiered: true,
      goal: { kind: 'state', name: 'Parse', state: 'tier1' }
    },
    {
      t: 'choice',
      q: 'LoadConfig was called once at startup. What code will it have until the process ends?',
      options: ['Tier 0: it will never reach the threshold', 'Tier 1: the background thread eventually optimizes everything', 'Tier 1 after the first garbage collection', 'None: the code is unloaded after the call'],
      answer: 0,
      explain: 'Recompilation is triggered only by the counter. A cold method stays in Tier 0 — and rightly so: there is no point optimizing code that will not run again.',
      wrong: { 1: 'The background thread only takes methods from the hot queue, and they get there through the call counter.' }
    },
    {
      t: 'learn',
      title: 'A long loop: OSR',
      body: '<p>The problem: <code>Main</code> is called once, and inside is a loop of a billion iterations. The call counter never reaches 30, so the loop would spin in slow Tier 0.</p><p>Before .NET 7 the JIT dodged this crudely: a method with a loop was compiled optimized straight away, skipping Tier 0, and startup paid for it.</p><p>Since <b>.NET 7</b> on x64 and Arm64 there is <b>OSR</b> (on-stack replacement). Tier 0 loop code contains <b>patchpoints</b> with an iteration counter. When the counter fires, the JIT builds an optimized version of the method that can start mid-loop, moves the current values of the locals into it, and execution continues there.</p>',
      code: 'static void Main()\n{\n    long sum = 0;\n    for (int i = 0; i < 1_000_000_000; i++)\n        sum += i;            // OSR kicks in here\n    Console.WriteLine(sum);\n}',
      deep: '<p>The OSR version is a special variant of the method: it is entered only from a patchpoint, and its frame sits on top of the Tier 0 frame. The next ordinary call goes the usual way through the counter. JIT output marks such a version as OSR.</p><p>The behavior for methods with loops is controlled by <code>&lt;TieredCompilationQuickJitForLoops&gt;</code>: <code>true</code> (the default since .NET 7 where OSR exists) means Tier 0 first, <code>false</code> means optimized code straight away, as before.</p>'
    },
    {
      t: 'choice',
      q: 'Main is called once, and inside is a loop of a billion iterations. How does .NET 8 on x64 make this loop fast?',
      options: ['OSR: it switches to an optimized version of the method mid-loop', 'It does not: Main never reaches 30 calls and stays in Tier 0', 'It compiles Main optimized right away because it has a loop', 'It restarts Main from the beginning, now in Tier 1'],
      answer: 0,
      explain: 'The counter sits on loop iterations, not only on calls. When it fires, the JIT builds the OSR version and continues from the current iteration, keeping the values of i and sum.',
      wrong: { 1: 'That is what would happen without OSR. This is exactly the gap OSR closes.', 2: 'That is what the JIT did before .NET 7. Now a method with a loop also starts in Tier 0.', 3: 'A restart would repeat the side effects of the code before the loop. OSR continues from the same spot.' }
    },
    {
      t: 'learn',
      title: 'Dynamic PGO: a profile from the live program',
      body: '<p><b>PGO</b> (profile-guided optimization) means the compiler looks at how the code actually behaves. Dynamic PGO collects the profile right inside the running process:</p><ul><li>which <code>if</code> branches run and which almost never do;</li><li>which concrete types arrive at virtual and interface calls;</li><li>which methods sit behind delegates.</li></ul><p>Tier 1 is compiled with this data: the hot path goes straight, cold blocks move to the end of the method, and the common type is called directly (more on that in lesson 3). Dynamic PGO appeared in .NET 6 as an opt-in and has been <b>on by default since .NET 8</b>.</p>',
      code: '// 99% of calls pass a List<int> here.\n// Without a profile every foreach step is an interface call;\n// with a profile Tier 1 builds a fast path for List<int>.\nstatic int Sum(IEnumerable<int> items)\n{\n    int s = 0;\n    foreach (var x in items) s += x;\n    return s;\n}',
      deep: '<p>In .NET 8 profile counters are not placed in the first Tier 0: that would slow down all startup code. A hot method goes <b>Tier 0 → instrumented Tier 0 → Tier 1</b>, roughly 30 calls per step. Code from a ReadyToRun image takes another route: R2R → optimized instrumented Tier 1 → Tier 1. Methods with loops that are eligible for OSR skip plain Tier 0 and start instrumented right away.</p><p>The profile lives in process memory and is lost on restart. So the machine code of two runs can differ, depending on what input arrived during warmup.</p>'
    },
    {
      t: 'order',
      q: 'The life of a hot method in .NET 8 with default settings. Put the steps in order.',
      items: ['First call: the stub calls the JIT', 'Tier 0: quick code without optimizations', 'An instrumented version collects the profile', 'A background thread compiles Tier 1 using the profile', 'The entry point is redirected to the new code'],
      explain: 'Cheap and fast first, then the profile, and only then the expensive optimization. Switching to the new code happens without stopping the program.'
    },
    {
      t: 'learn',
      title: 'static readonly becomes a constant',
      body: '<p>Tier 1 has an advantage no ahead-of-time compiler has: by the time of recompilation the class static constructor has already run. The JIT reads the value of a <code>static readonly</code> field and substitutes it as a <b>constant</b>.</p><p>If <code>s_trace</code> is <code>false</code>, the logging branch disappears entirely in Tier 1 — no check, no call. Tier 0 cannot do this: it is built before the value is known for sure.</p>',
      code: 'static readonly bool s_trace =\n    Environment.GetEnvironmentVariable("TRACE") == "1";\n\nstatic int Work(int x)\n{\n    if (s_trace)               // a constant in Tier 1\n        Console.WriteLine(x);  // gone when false\n    return x * 2;\n}',
      deep: '<p>This works for references too: if a <code>static readonly</code> field holds an object, the JIT knows its exact type and can call its methods directly. With an ordinary (non-readonly) static field the trick does not work — the value may change.</p><p>Native AOT cannot know the value of an environment variable at build time. It can run simple static constructors ahead of time, during compilation, but anything that depends on the environment stays a runtime check.</p>'
    },
    {
      t: 'multi',
      q: 'What does Tier 1 do that Tier 0 does not? Select all.',
      options: ['Inlines small methods', 'Uses values of static readonly fields as constants', 'Takes the Dynamic PGO profile into account', 'Compiles the method on its first call', 'Keeps all locals on the stack'],
      answer: [0, 1, 2],
      explain: 'Compiling on the first call is exactly what Tier 0 does. Tier 0 also keeps locals on the stack: allocating registers for them is an optimization Tier 0 does not have.'
    },
    {
      t: 'learn',
      title: 'How to see the tiers for yourself',
      body: '<p>Since .NET 7 JIT output is available in the regular runtime, no checked build needed. Two environment variables:</p><ul><li><code>DOTNET_JitDisasmSummary=1</code> — a list of all compilations: which method and at what tier (Tier 0, instrumented, Tier 1, OSR);</li><li><code>DOTNET_JitDisasm=Name</code> — the machine code of every version of a method. You can see where a call was inlined and where a <code>call</code> remained.</li></ul><p><code>DOTNET_JitStdOutFile</code> redirects this output to a file. To compare "with PGO and without" there are the project properties <code>TieredPGO</code>, <code>TieredCompilation</code> and the environment variables <code>DOTNET_TieredPGO=0</code>, <code>DOTNET_TieredCompilation=0</code>.</p>',
      code: '# every compilation with its tier\nDOTNET_JitDisasmSummary=1 dotnet run -c Release\n\n# machine code of every version of Work\nDOTNET_JitDisasm=Work dotnet run -c Release',
      lang: 'plain',
      deep: '<p>Counters without a restart: <code>dotnet-counters monitor -n MyApp</code> shows the number of compiled methods and the time spent in the JIT. From inside the program, <code>System.Runtime.JitInfo.GetCompiledMethodCount()</code> and <code>JitInfo.GetCompilationTime()</code> (.NET 6+) give the same. In BenchmarkDotNet the <code>[DisassemblyDiagnoser]</code> attribute shows the machine code.</p>'
    },
    {
      t: 'blanks',
      q: 'Turn off Dynamic PGO in the project file to compare speed with and without it',
      code: '<PropertyGroup>\n  <___>false</___>\n</PropertyGroup>',
      lang: 'xml',
      tiles: ['TieredPGO', 'TieredPGO', 'TieredCompilation', 'PublishReadyToRun', 'Optimize'],
      answer: ['TieredPGO', 'TieredPGO'],
      explain: 'TieredPGO=false turns off only the profile; the tiers stay. TieredCompilation=false would remove the tiers and PGO along with them. Without rebuilding — the DOTNET_TieredPGO=0 variable.'
    },
    {
      t: 'choice',
      q: 'A hot method got [MethodImpl(MethodImplOptions.AggressiveOptimization)] so that it "is Tier 1 right away". What happens?',
      options: ['The method is optimized right away, but without a PGO profile — and may end up slower than regular Tier 1', 'The method gets faster under any conditions', 'Since .NET 8 the attribute is ignored', 'The method is compiled ahead of time, as in ReadyToRun'],
      answer: 0,
      explain: 'AggressiveOptimization takes the method out of the tiered scheme: full optimization on the first call, no instrumentation. No profile means no PGO gains, and static fields may not be initialized yet at compile time. Usually you do not need the attribute.',
      wrong: { 1: 'Optimization without a profile can be worse than Tier 1 with one. Check with a measurement.' }
    }
  ]
};

/** Lesson 5: the JIT: compilation on demand, stubs, tiered JIT. */
const PROGRAM = [
  { name: 'Main', calls: ['Add', 'Log'] },
  { name: 'Add' },
  { name: 'Log' },
  { name: 'Unused' }
];

export default {
  id: 'dotnet.w1.l5',
  title: 'JIT: translating at the last moment',
  sub: 'Stubs, the first call and hot methods',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'The JIT translates on the fly',
      body: '<p>The <b>JIT</b> (just-in-time compiler) is the part of the CLR that turns CIL into machine code while the program is running.</p><p>And not the whole program at once, but <b>method by method</b>, when each method is first needed.</p>'
    },
    {
      t: 'learn',
      title: 'How it works: stubs',
      body: '<p>When the CLR loads a class, each method gets a <b>stub</b> in place of machine code.</p><p>The first call lands in the stub, and the stub calls the JIT. The JIT compiles the method and points the stub straight at the finished code. Later calls go directly to machine code.</p>',
      flow: ['Call Add()', 'Stub', 'JIT compiles', 'Machine code']
    },
    {
      t: 'rig', rig: 'jit',
      task: 'Call Add twice. How many times does the JIT kick in?',
      methods: PROGRAM,
      goal: { kind: 'calls', name: 'Add', min: 2 }
    },
    {
      t: 'choice',
      q: 'A program calls Add 1,000 times. How many times does the JIT compile Add?',
      options: ['1', '1000', '0', '500'],
      answer: 0,
      explain: 'Once, on the first call. After that the stub leads straight to finished machine code. (There\'s a twist for modern .NET at the end of the lesson.)',
      wrong: { 1: 'Compiling every time would be very slow. That\'s exactly what the stub is for.' }
    },
    {
      t: 'choice',
      q: 'Main calls Add and Log. Nobody calls Unused. How many methods does the JIT compile if you run Main?',
      options: ['3', '4', '1', '0'],
      answer: 0,
      explain: 'Main, Add and Log. Unused stays a stub: the JIT doesn\'t waste time on code nobody needs.',
      wrong: { 1: 'Nobody calls Unused, so the JIT never gets to it.' }
    },
    {
      t: 'rig', rig: 'jit',
      task: 'Check it: press "Call" on Main once.',
      methods: PROGRAM,
      goal: { kind: 'calls', name: 'Main', min: 1 }
    },
    {
      t: 'choice',
      q: 'The program was closed and started again. Can it reuse the machine code the JIT produced last time?',
      options: ['No: it lived in the process memory and died with the process', 'Yes, the JIT saves it to disk', 'Only the code for Main'],
      answer: 0,
      explain: 'JIT output belongs to one process. A new run means a new compilation. The next lesson shows how to avoid that.'
    },
    {
      t: 'multi',
      q: 'What is true about the JIT? Select all that apply.',
      options: ['It compiles only what gets called', 'It knows the exact CPU it is running on', 'The first call of a method is slower than later ones', 'Its code is shared by all running copies of the program', 'It compiles the whole program at install time'],
      answer: [0, 1, 2],
      explain: 'The JIT saves work and tunes code for the CPU, but pays with a slower first call, and its code isn\'t shared between processes.'
    },
    {
      t: 'learn',
      title: 'The modern JIT works in two passes',
      body: '<p>.NET Core 3.0 and later turn on <b>tiered compilation</b>.</p><p>First a method is compiled quickly with no optimizations: <b>Tier 0</b>. If it gets called often (the threshold is about 30 calls), the JIT recompiles it in the background, this time optimized: <b>Tier 1</b>. The program starts fast and still runs fast.</p>',
      deep: 'Long-running loops get OSR (on-stack replacement, .NET 7+): the loop switches to optimized code mid-execution. Dynamic PGO (on by default since .NET 8) gathers statistics at Tier 0 and uses them when building Tier 1. Methods from ReadyToRun images also count as an "initial tier" and get recompiled to Tier 1 once they warm up.'
    },
    {
      t: 'rig', rig: 'jit',
      task: 'Tiered mode is on. Keep calling Add (the "×10" button speeds things up) until it reaches Tier 1.',
      methods: [{ name: 'Add' }],
      tiered: true,
      goal: { kind: 'state', name: 'Add', state: 'tier1' }
    },
    {
      t: 'choice',
      q: 'With tiered JIT, how many times is Add compiled over 1,000 calls?',
      options: ['2', '1', '1000', '30'],
      answer: 0,
      explain: 'Twice: a quick Tier 0 on the first call, and an optimized Tier 1 once the method got hot.'
    }
  ]
};

/** Lesson 3: CIL is a stack machine language. Main rig: the IL machine. */
const ADD = ['ldarg.0', 'ldarg.1', 'add', 'ret'];

export default {
  id: 'dotnet.w1.l3',
  title: 'CIL: a stack machine language',
  sub: 'Run CIL with your own hands',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'CIL: instructions for an imaginary machine',
      body: '<p>CIL (Common Intermediate Language) is a set of simple instructions. They work with a <b>stack</b>, a pile of numbers.</p><p>Picture a stack of plates: an instruction puts a number on top or takes the top one off. You can only take from the top.</p>',
      deep: 'The stack model keeps compilers and code verification simple: nobody has to allocate registers. The JIT does that later for the specific CPU. x64 has 16 general-purpose registers, ARM64 has 31.'
    },
    {
      t: 'learn',
      title: 'The Add method in CIL',
      body: '<p>Here is what the compiler turns <code>a + b</code> into. Comments follow <code>//</code>.</p>',
      code: 'ldarg.0   // push argument a\nldarg.1   // push argument b\nadd       // pop two numbers, push their sum\nret       // return whatever is on top',
      lang: 'il'
    },
    {
      t: 'rig', rig: 'stack',
      task: 'Press "Step" until the method returns a result. Watch the stack.',
      program: ADD,
      args: [{ name: 'a', value: 40 }, { name: 'b', value: 2 }],
      goal: 'ret'
    },
    {
      t: 'choice',
      q: 'a = 40, b = 2. What is on top of the stack right after ldarg.1?',
      code: 'ldarg.0\nldarg.1\nadd\nret',
      lang: 'il',
      options: ['2', '40', '42', 'Nothing'],
      answer: 0,
      explain: 'ldarg.1 pushed b = 2 on top of 40. The addition only happens at the next instruction.',
      wrong: { 2: '42 only appears after add, and that hasn\'t run yet.', 1: '40 is underneath: ldarg.0 pushed it, then 2 went on top.' }
    },
    {
      t: 'blanks',
      q: 'Build the CIL for return a * b + c;',
      code: 'ldarg.0\n___\nmul\n___\nadd\nret',
      lang: 'il',
      tiles: ['ldarg.1', 'ldarg.2', 'add', 'ldarg.0'],
      answer: ['ldarg.1', 'ldarg.2'],
      explain: 'Push a and b, mul gives a·b, push c, add sums them. The instruction order follows the order of evaluation.'
    },
    {
      t: 'rig', rig: 'stack',
      task: 'Let\'s test your solution on the machine: a = 5, b = 8, c = 2.',
      program: ['ldarg.0', 'ldarg.1', 'mul', 'ldarg.2', 'add', 'ret'],
      args: [{ name: 'a', value: 5 }, { name: 'b', value: 8 }, { name: 'c', value: 2 }],
      goal: 'ret'
    },
    {
      t: 'multi',
      q: 'Which instructions does CIL have? Select all that apply.',
      options: ['Load and store a value', 'Call a method', 'Add and multiply', 'Throw an exception', 'Draw a window', 'Connect to Wi-Fi'],
      answer: [0, 1, 2, 3],
      explain: 'CIL has loads and stores, calls, arithmetic, branches and exceptions. Windows and networking are libraries that are themselves built from such instructions.'
    },
    {
      t: 'rig', rig: 'stack',
      task: 'Now a broken program. Press "Step" and see what happens.',
      program: ['ldarg.0', 'add', 'ret'],
      args: [{ name: 'a', value: 40 }],
      goal: 'error'
    },
    {
      t: 'choice',
      q: 'Why did the machine break?',
      options: ['add needs two numbers, but the stack has one', 'The number 40 is too large', 'A ret is missing', 'Argument a is wrong'],
      answer: 0,
      explain: 'This CIL is invalid: the stack runs dry (stack underflow). In the safety lesson we\'ll see who catches errors like this.'
    },
    {
      t: 'choice',
      q: 'CIL doesn\'t depend on the CPU. What does that give us?',
      options: ['The same CIL becomes machine code for any supported CPU', 'CIL runs faster than machine code', 'CIL doesn\'t need to be compiled', 'CIL can run without .NET'],
      answer: 0,
      explain: '.NET has a JIT compiler for each CPU, while the CIL is shared by all of them.',
      wrong: { 1: 'The opposite: the CPU doesn\'t understand CIL, so it still has to be translated to machine code.' }
    }
  ]
};

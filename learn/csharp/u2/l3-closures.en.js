/** Deeper C#, unit 2, lesson 3: closures. */
export default {
  id: 'cs.u2.l3',
  title: 'Closures',
  sub: 'A lambda captures the variable, not the value',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'A lambda sees outer variables',
      body: '<p>A lambda can use the variables of the method it was created in. So the variable can outlive the method, the compiler moves it into a <b>hidden object</b> on the heap, and the lambda holds a reference to that object.</p>',
      code: 'int count = 0;\nAction inc = () => count++;\ninc(); inc();\nConsole.WriteLine(count);   // 2 — it is the very same variable'
    },
    {
      t: 'rig', rig: 'closures',
      task: 'Three lambdas are created in a for loop. Step through: what will they print?',
      start: 'for', variants: ['for'],
      goal: { out: '3 3 3' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'Why did all three lambdas print 3?',
      options: ['They captured the same variable i, and by the time they ran it was 3', 'Lambdas copy the last value', 'It is a compiler bug'],
      answer: 0,
      explain: 'The variable is captured, not its value at the moment the lambda was created.'
    },
    {
      t: 'rig', rig: 'closures',
      task: 'Fix it: make it print 0 1 2, but keep the for loop.',
      start: 'for', variants: ['for', 'copy'],
      goal: { out: '0 1 2', variants: ['copy'] },
      solve: ['variant:copy', 'end']
    },
    {
      t: 'rig', rig: 'closures',
      task: 'And how does foreach behave?',
      start: 'foreach', variants: ['foreach'],
      goal: { out: '0 1 2' },
      solve: ['end']
    },
    {
      t: 'choice',
      q: 'What does this code print?',
      code: 'int count = 0;\nAction inc = () => count++;\ninc();\ninc();\nConsole.WriteLine(count);',
      options: ['2', '0', 'Compile error'],
      answer: 0,
      explain: 'The lambda changes the very same count variable — it now lives in the hidden object.'
    },
    {
      t: 'learn',
      title: 'foreach was fixed in C# 5',
      body: '<p>Before C# 5, foreach had the same trap. It was fixed: the foreach variable is now fresh on every iteration. Not so with for: there really is one variable for the whole loop.</p>'
    },
    {
      t: 'learn',
      title: 'The cost of capturing',
      body: '<p>Capturing means a heap object plus a delegate. In hot code that runs millions of times, that is extra work for the GC. The <code>static</code> keyword in front of a lambda (C# 9) forbids capturing — the compiler checks that the lambda pulls nothing from outside.</p>',
      code: 'var r = items.Where(static x => x > 0);   // captures nothing'
    },
    {
      t: 'choice',
      q: 'What does static do in front of x => x > limit, where limit is a local variable?',
      options: ['Compile error: a static lambda cannot capture limit', 'The lambda gets faster', 'limit gets copied'],
      answer: 0,
      explain: 'static guarantees there is no capture.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['for + lambda', 'One variable for all iterations'],
        ['foreach + lambda', 'A fresh variable per iteration'],
        ['int j = i inside the loop', 'A copy per iteration'],
        ['static lambda', 'Capturing is forbidden']
      ]
    }
  ]
};

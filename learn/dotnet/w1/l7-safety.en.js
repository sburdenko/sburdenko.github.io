/** Lesson 7: type safety and verification, then and now. */
export default {
  id: 'dotnet.w1.l7',
  title: 'Type safety',
  sub: 'Verification: then and now',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'What type safety means',
      body: '<p>A <b>type</b> says what\'s stored in memory: a number, a string, an array. Type-safe code touches memory only in ways the type allows: it doesn\'t read a string as a number or step past the end of an array.</p><p>That protects objects from each other, against both honest mistakes and attacks.</p>'
    },
    {
      t: 'learn',
      title: 'Three promises',
      body: '<p>According to the Microsoft article, the CLR relies on three rules for type-safe code:</p><p>1. A reference to a type is always compatible with that type.<br>2. Only the operations defined for an object are invoked on it.<br>3. An object is what it claims to be.</p>'
    },
    {
      t: 'match',
      q: 'Which rule is broken?',
      pairs: [
        ['Reference is compatible with its type', 'A string is read as an array of numbers'],
        ['Only defined operations', 'A number gets a method call it doesn\'t have'],
        ['An object is what it claims to be', 'An object poses as a different type']
      ]
    },
    {
      t: 'choice',
      q: 'What happens?',
      code: 'object o = "hello";\nint[] a = (int[])o;',
      options: ['InvalidCastException: the CLR won\'t let a string pass as an array', 'a ends up holding the character codes', 'The code won\'t compile', 'Nothing'],
      answer: 0,
      explain: 'The compiler lets it through: an object could be anything. But at run time the CLR checks the real type and throws.',
      wrong: { 2: 'It compiles: casting object to int[] is legal until it turns out there\'s a string inside.' }
    },
    {
      t: 'choice',
      q: 'What happens?',
      code: 'int[] a = new int[3];\na[5] = 1;',
      options: ['IndexOutOfRangeException', 'It writes 1 into the memory past the array', 'The array grows to 6 elements', 'Nothing'],
      answer: 0,
      explain: 'The CLR checks array bounds on every access. Safe code can\'t write past the end.',
      wrong: { 1: 'That could happen in C or C++. In managed code the CLR won\'t let you cross the bound.' }
    },
    {
      t: 'learn',
      title: 'Verification in .NET Framework',
      body: '<p>Before JIT compilation, CIL went through <b>verification</b>: can we prove the code is type-safe? If security policy required verified code and the check failed, you got an exception at startup.</p><p>The verifier plays it safe: it also rejects some code that <i>is</i> safe. For example, any code with pointers (<code>unsafe</code>).</p>'
    },
    {
      t: 'tapline',
      q: 'Which line would the verifier reject?',
      code: 'int[] a = { 1, 2, 3 };\nint sum = a[0] + a[1];\nunsafe {\n    int* p = &sum;\n    Console.WriteLine(*p);\n}',
      answer: 3,
      explain: 'A pointer means unsafe code. Here it\'s actually harmless (the address of a local variable), but the verifier can\'t prove that, so it rejects any code with pointers.'
    },
    {
      t: 'multi',
      q: 'What does verification check? Select all that apply.',
      options: ['Memory is accessed through the correct types', 'The CIL is well-formed, e.g. the stack has enough numbers', 'The algorithm works correctly', 'There are no memory leaks'],
      answer: [0, 1],
      explain: 'Verification is about memory safety and well-formed CIL. It doesn\'t check program logic.'
    },
    {
      t: 'learn',
      title: 'And today?',
      body: '<p>.NET Core and .NET 5+ dropped the old security policy system (CAS), and the CLR <b>does not verify</b> CIL at startup.</p><p>Type safety now rests on the compiler and run-time checks: array bounds and type casts, exactly what you just saw. You can check CIL by hand with the ILVerify tool.</p>',
      deep: 'That\'s why unsafe code in modern .NET simply runs if the project allows it (<code>&lt;AllowUnsafeBlocks&gt;</code>). The responsibility is on the programmer. Untrusted code is now isolated with processes and containers, not inside the CLR.'
    },
    {
      t: 'choice',
      q: 'Remember the broken CIL from lesson 3 (add with only one number on the stack)? What would the .NET Framework verifier do with it?',
      options: ['Reject it: that CIL is invalid', 'Let it through', 'Fix the bug itself'],
      answer: 0,
      explain: 'Checking that CIL is well-formed is exactly the verifier\'s job: badly generated CIL breaks the safety guarantees.'
    }
  ]
};

/** Unit 2, lesson 5: string is a reference type, but immutable. */
const CODE = 'string a = "kit";\nstring b = a;\nb += "ten";\nConsole.WriteLine(a);';

export default {
  id: 'dotnet.w2.l5',
  title: 'string: a special type',
  sub: 'A reference type that behaves like a value',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A string can\'t be changed',
      body: '<p><code>string</code> is a reference type: the text lives on the heap. But a string is <b>immutable</b>. Any "edit" creates a new string, and the old one stays exactly as it was.</p><p>That\'s why strings are safe to pass anywhere: nobody can mess up your text.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through and see what += does.',
      goal: 'end',
      code: CODE,
      steps: [
        { line: 0, note: 'The string "kit" is on the heap; a holds a reference.', ops: [{ op: 'str', name: 'a', text: 'kit' }] },
        { line: 1, note: 'b leads to the same string.', ops: [{ op: 'copy', to: 'b', from: 'a' }] },
        { line: 2, note: '+= doesn\'t change "kit": a new string "kitten" is created, and b now leads to it.', ops: [{ op: 'concat', name: 'b', from: 'b', text: 'ten' }] },
        { line: 3, note: 'Prints "kit".', ops: [] }
      ],
      solve: ['step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'What does the code print?',
      code: CODE,
      options: ['kit', 'kitten', 'ten'],
      answer: 0,
      explain: 'The string "kit" didn\'t change. b got a reference to a new string; a didn\'t.'
    },
    {
      t: 'choice',
      q: 'Two strings with the same text were built in different ways. What does a == b return?',
      code: 'string a = "ki" + Console.ReadLine(); // user typed "t"\nstring b = "kit";\nConsole.WriteLine(a == b);',
      options: ['True', 'False'],
      answer: 0,
      explain: 'The == operator on string compares text, not references. These are different objects, but the text is the same.'
    },
    {
      t: 'learn',
      title: 'Concatenating strings in a loop is a bad idea',
      body: '<p><code>s += x</code> in a loop creates a new string every time and copies all the accumulated text into it. 10,000 iterations means 10,000 garbage strings and work that grows quadratically.</p><p><code>StringBuilder</code> collects text in a mutable buffer and builds the string once at the end.</p>',
      code: 'var sb = new StringBuilder();\nfor (int i = 0; i < 10_000; i++)\n    sb.Append(i);\nstring s = sb.ToString();'
    },
    {
      t: 'choice',
      q: 'How many new strings does this loop create?',
      code: 'string s = "";\nfor (int i = 0; i < 1000; i++)\n    s += "x";',
      options: ['1,000', '1', '0', '2'],
      answer: 0,
      explain: 'Each += creates a new string. The literal "x" is only one object, though: it\'s interned.'
    },
    {
      t: 'learn',
      title: 'Interning',
      body: '<p>Identical string literals in a program are one and the same object: the CLR keeps them in the intern pool.</p><p>Strings built at run time don\'t go there unless you call <code>string.Intern</code>.</p>',
      deep: 'That\'s why <code>ReferenceEquals("abc", "abc")</code> is usually true, but false for a string with the same text from a StringBuilder. Comparing strings by reference is a bug: use == or string.Equals with the right StringComparison.'
    },
    {
      t: 'multi',
      q: 'What is true about string? Select all that apply.',
      options: ['It\'s a reference type', 'Once created, a string can\'t be changed', '== compares text', 'The string\'s text lives on the stack', 's.Replace("a", "b") changes the original string'],
      answer: [0, 1, 2],
      explain: 'Replace, ToUpper and other methods return a new string. If you don\'t keep the result, nothing changes.'
    },
    {
      t: 'blanks',
      q: 'Build a fast way to join words',
      code: 'var sb = new ___();\nforeach (var w in words)\n    sb.___(w);\nreturn sb.ToString();',
      tiles: ['StringBuilder', 'Append', 'string', 'Concat', 'Add'],
      answer: ['StringBuilder', 'Append'],
      explain: 'StringBuilder.Append writes into the buffer without creating intermediate strings.'
    }
  ]
};

/** Unit 2, lesson 4: passing arguments: copy, ref, out, in. */
const MOVE = 'static void Main()\n{\n    var p = new Point(1, 1);\n    Move(p);\n    Console.WriteLine(p.X);\n}\nstatic void Move(Point q)\n{\n    q.X = 99;\n}';
const moveSteps = kind => [
  { line: 2, note: kind === 'val' ? 'p is a struct in Main\'s frame.' : 'p is a reference to an object on the heap.', ops: [{ op: 'new', name: 'p', type: 'Point', kind, fields: { X: 1, Y: 1 } }] },
  { line: 3, note: kind === 'val' ? 'Move got a copy of the whole struct.' : 'Move got a copy of the reference, to the same object.', ops: [{ op: 'call', fn: 'Move', params: [{ name: 'q', from: 'p' }] }] },
  { line: 8, note: kind === 'val' ? 'We change the copy in Move\'s frame.' : 'We change the object on the heap, shared by p and q.', ops: [{ op: 'set', target: 'q', field: 'X', value: 99 }] },
  { line: 9, note: kind === 'val' ? 'Move\'s frame is gone, and the copy with it.' : 'Move\'s frame is gone; the object stays modified.', ops: [{ op: 'ret' }] },
  { line: 4, note: kind === 'val' ? 'Prints 1.' : 'Prints 99.', ops: [] }
];

export default {
  id: 'dotnet.w2.l4',
  title: 'Passing to a method',
  sub: 'Copy, ref, out and in',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'By default, a copy',
      body: '<p>When you call a method, each argument is copied into its parameter.</p><p>For a struct, the whole struct is copied. For a class, only the reference: the method gets the address of the same object.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through the call to Move in both versions.',
      goal: 'both',
      variants: { struct: { code: MOVE, steps: moveSteps('val') }, class: { code: MOVE, steps: moveSteps('ref') } },
      solve: ['step', 'step', 'step', 'step', 'step', 'variant:class', 'step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point is a struct. What does the program print?',
      code: MOVE,
      options: ['1', '99', '0'],
      answer: 0,
      explain: 'Move changed its own copy. The variable p in Main stayed the same.'
    },
    {
      t: 'learn',
      title: 'ref: pass the variable itself',
      body: '<p>With <code>ref</code>, the method gets not a copy but access to the caller\'s variable.</p><p><code>out</code> is the same, but the method must assign a value (like in <code>int.TryParse</code>).<br><code>in</code> passes by reference, but read-only: a big struct doesn\'t have to be copied.</p>',
      code: 'static void Move(ref Point q) => q.X = 99;\nMove(ref p);',
      deep: 'in with a regular (non-readonly) struct can force the compiler to make "defensive copies" when calling its methods, in case a method changes fields. That\'s why big structs are declared <code>readonly struct</code>.'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Now Move(ref p). See what q points to.',
      goal: 'end',
      code: 'static void Main()\n{\n    var p = new Point(1, 1);\n    Move(ref p);\n    Console.WriteLine(p.X);\n}\nstatic void Move(ref Point q)\n{\n    q.X = 99;\n}',
      steps: [
        { line: 2, note: 'p is a struct in Main\'s frame.', ops: [{ op: 'new', name: 'p', type: 'Point', kind: 'val', fields: { X: 1, Y: 1 } }] },
        { line: 3, note: 'q is not a copy but a reference to the variable p in Main.', ops: [{ op: 'call', fn: 'Move', params: [{ name: 'q', from: 'p', ref: true }] }] },
        { line: 8, note: 'p itself changes, right in Main\'s frame.', ops: [{ op: 'set', target: 'q', field: 'X', value: 99 }] },
        { line: 9, note: 'Move returned.', ops: [{ op: 'ret' }] },
        { line: 4, note: 'Prints 99.', ops: [] }
      ],
      solve: ['step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Point is a class, p = (5, 5). What is p.X after Reset(p)?',
      code: 'static void Reset(Point q)\n{\n    q = new Point(0, 0);\n}',
      options: ['5', '0', 'NullReferenceException'],
      answer: 0,
      explain: 'The method replaced its own copy of the reference with a new object. The variable p still leads to the old object. To replace p, you need ref.',
      wrong: { 1: 'That would happen with ref Point q. Without ref, the method only changes its own copy of the reference.' }
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Check it on the rig: what happens to q inside Reset.',
      goal: 'end',
      code: 'static void Main()\n{\n    var p = new Point(5, 5);\n    Reset(p);\n}\nstatic void Reset(Point q)\n{\n    q = new Point(0, 0);\n}',
      steps: [
        { line: 2, note: 'The object (5, 5) on the heap.', ops: [{ op: 'new', name: 'p', type: 'Point', kind: 'ref', fields: { X: 5, Y: 5 } }] },
        { line: 3, note: 'q is a copy of the reference p.', ops: [{ op: 'call', fn: 'Reset', params: [{ name: 'q', from: 'p' }] }] },
        { line: 7, note: 'q now leads to a new object. p still leads to the old one.', ops: [{ op: 'new', name: 'q', type: 'Point', kind: 'ref', fields: { X: 0, Y: 0 } }] },
        { line: 8, note: 'Reset\'s frame is gone. The new object became garbage, and p didn\'t change.', ops: [{ op: 'ret' }] }
      ],
      solve: ['step', 'step', 'step', 'step']
    },
    {
      t: 'match',
      q: 'Match each modifier to its meaning',
      pairs: [
        ['ref', 'The method reads and changes the caller\'s variable'],
        ['out', 'The method must assign a value'],
        ['in', 'By reference, but read-only'],
        ['no modifier', 'The method gets a copy']
      ]
    },
    {
      t: 'choice',
      q: 'Why pass a big struct as in?',
      options: ['To avoid copying it on every call and to forbid changes', 'So the method can change it', 'So it moves to the heap'],
      answer: 0,
      explain: 'in passes an address instead of copying every field, and the compiler won\'t let the method change it.'
    }
  ]
};

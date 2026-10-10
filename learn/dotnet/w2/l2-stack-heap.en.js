/** Unit 2, lesson 2: the stack and the heap, method frames, where structs really live. */
const ARR = 'var pts = new Point[2];\npts[0] = new Point(1, 1);\npts[1] = new Point(2, 2);';

export default {
  id: 'dotnet.w2.l2',
  title: 'The stack and the heap',
  sub: 'Where variables and objects live',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'The stack: a method\'s notepad',
      body: '<p>When a method is called, it gets a slice of memory on the <b>stack</b> called a frame. The frame holds the local variables and parameters.</p><p>When the method returns, the whole frame is thrown away. That\'s very fast: no cleanup needed.</p>'
    },
    {
      t: 'learn',
      title: 'The heap: a warehouse for objects',
      body: '<p>Class instances created with <code>new</code> live on the <b>heap</b>. They aren\'t tied to a method and live as long as anything still references them.</p><p>Unused objects are cleaned up by the garbage collector. That\'s the next unit.</p>'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'Step through and watch the frame for the Heal method appear and disappear.',
      goal: 'end',
      code: 'static void Main()\n{\n    int count = 3;\n    var hero = new Hero { Hp = 10 };\n    Heal(hero, count);\n}\nstatic void Heal(Hero h, int amount)\n{\n    h.Hp += amount;\n}',
      steps: [
        { line: 2, note: 'count is a number and lives right in Main\'s frame.', ops: [{ op: 'int', name: 'count', value: 3 }] },
        { line: 3, note: 'A Hero object is created on the heap. Main\'s frame holds a reference to it.', ops: [{ op: 'new', name: 'hero', type: 'Hero', kind: 'ref', fields: { Hp: 10 } }] },
        { line: 4, note: 'Calling Heal pushes a new frame onto the stack. h gets a copy of the reference, amount a copy of the number.', ops: [{ op: 'call', fn: 'Heal', params: [{ name: 'h', from: 'hero' }, { name: 'amount', from: 'count' }] }] },
        { line: 8, note: 'h leads to the same object as hero, so we modify it.', ops: [{ op: 'set', target: 'h', field: 'Hp', value: 13 }] },
        { line: 9, note: 'Heal returned and its frame is gone. The object on the heap stays: hero still references it.', ops: [{ op: 'ret' }] }
      ],
      solve: ['step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Where does the local variable int count from Main live?',
      options: ['In Main\'s frame on the stack', 'On the heap', 'In the assembly metadata', 'In special memory reserved for numbers'],
      answer: 0,
      explain: 'Local variables of value types live in their method\'s frame.'
    },
    {
      t: 'learn',
      title: 'Myth: "structs always live on the stack"',
      body: '<p>A value type lives wherever it\'s declared:</p><p>a local variable lives in a frame on the stack;<br>a class field lives inside the object, so on the heap;<br>an array element lives inside the array, also on the heap.</p>',
      deep: 'The JIT may keep a local variable in a CPU register and never touch memory. Recent .NET versions sometimes even put class instances on the stack when the JIT can prove they never leave the method (escape analysis). These are optimizations: they don\'t change how the code behaves.'
    },
    {
      t: 'rig', rig: 'memory',
      task: 'An array of two points: step through both versions and compare how many objects end up on the heap.',
      goal: 'both',
      variants: {
        struct: {
          code: ARR,
          steps: [
            { line: 0, note: 'The array is an object on the heap. For structs, space for both points is right inside it.', ops: [{ op: 'arr', name: 'pts', elem: 'Point', kind: 'val', items: [{ X: 0, Y: 0 }, { X: 0, Y: 0 }] }] },
            { line: 1, note: 'The point is written straight into the array slot. No new objects.', ops: [{ op: 'set', target: 'pts', field: '0', value: { X: 1, Y: 1 } }] },
            { line: 2, note: 'Total on the heap: one object, the array itself.', ops: [{ op: 'set', target: 'pts', field: '1', value: { X: 2, Y: 2 } }] }
          ]
        },
        class: {
          code: ARR,
          steps: [
            { line: 0, note: 'An array of classes holds only references. For now they are null.', ops: [{ op: 'arr', name: 'pts', elem: 'Point', kind: 'ref', items: [null, null] }] },
            { line: 1, note: 'Each point is a separate object on the heap; the array holds a reference to it.', ops: [{ op: 'newin', target: 'pts', field: '0', type: 'Point', fields: { X: 1, Y: 1 } }] },
            { line: 2, note: 'Total: three objects, the array and two points.', ops: [{ op: 'newin', target: 'pts', field: '1', type: 'Point', fields: { X: 2, Y: 2 } }] }
          ]
        }
      },
      solve: ['step', 'step', 'step', 'variant:class', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'An array of 1,000 Point structs and an array of 1,000 Point classes, all elements filled. How many objects are on the heap in each case?',
      options: ['1 and 1,001', '1,000 and 1,000', '0 and 1,000', '1 and 1,000'],
      answer: 0,
      explain: 'An array of structs is one object with the points inside it. An array of classes is the array itself plus 1,000 separate point objects.',
      deep: 'That\'s why arrays of structs are faster to iterate: the data sits contiguously and plays well with the CPU cache. Game engines and ECS rely on this.'
    },
    {
      t: 'multi',
      q: 'What lives on the heap? Select all that apply.',
      options: ['A class instance created with new', 'A struct field inside a class instance', 'The elements of an int[]', 'A local int variable', 'A struct parameter of a method'],
      answer: [0, 1, 2],
      explain: 'Anything inside an object or array lives with it on the heap. Local variables and parameters live in a stack frame.'
    },
    {
      t: 'choice',
      q: 'A method returned. Its local variable referenced an object, and nothing else references it. What happens to the object?',
      options: ['It became garbage; the garbage collector will clean it up later', 'It\'s deleted immediately along with the frame', 'It lives until the program ends'],
      answer: 0,
      explain: 'The frame disappears right away, but the object on the heap doesn\'t. It just became unreachable, and the garbage collector will reclaim it.'
    }
  ]
};

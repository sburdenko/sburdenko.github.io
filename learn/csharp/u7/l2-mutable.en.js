/** Deeper C#, unit "Value types all the way", lesson 2: a mutable struct in a collection and in foreach. */
export default {
  id: 'cs.u7.l2',
  title: 'The mutable struct',
  sub: 'Collections, foreach and changes that land in a copy',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Why list[0].X = 1 does not compile',
      body: '<p>An array element is a <b>variable</b>: it has an address inside the array. <code>arr[0].X = 1</code> compiles to "take the address of the element" (<code>ldelema</code>) and write the field at that address.</p><p>The <code>List&lt;T&gt;</code> indexer is a <b>method</b>, <code>get_Item</code>. It returns a value, that is, a copy of the struct in a temporary slot. Writing a field into a temporary copy is possible but pointless: it vanishes right after the line. So the compiler forbids it with error <b>CS1612</b>: "cannot modify the return value because it is not a variable".</p><p>The same rule protects a dictionary (<code>dict[key].X = 1</code>) and a property that returns a struct (<code>shape.Center.X = 1</code>).</p>',
      code: 'struct Point { public int X, Y; }\n\nvar arr = new Point[1];\narr[0].X = 1;            // ok: the array element changes\n\nvar list = new List<Point> { default };\nlist[0].X = 1;           // CS1612'
    },
    {
      t: 'tapline',
      q: 'Point is a mutable struct with fields X and Y. Which line does not compile?',
      code: 'Point[] arr = new Point[2];\nSpan<Point> span = arr;\nList<Point> list = new() { default };\narr[1].X = 5;\nspan[0].Y = 7;\nlist[0].Y = 7;',
      answer: 5,
      explain: 'The array indexer and Span<T> give you a variable: the Span indexer returns ref T. List<T> returns a copy — writing a field into it is forbidden (CS1612).'
    },
    {
      t: 'learn',
      title: 'A method on a copy compiles silently',
      body: '<p>CS1612 only catches <b>assignment</b> to a field or property. If you call a method that mutates the struct instead, the compiler will not object: it puts the copy into a temporary variable and calls the method on it.</p><p>The method honestly changes the fields — of the copy. The list element stays the same. No error, no warning.</p>',
      code: 'struct Point\n{\n    public int X, Y;\n    public void Offset(int dx) => X += dx;\n}\n\nvar list = new List<Point> { default };\nlist[0].Offset(5);   // compiles\n// IL: call get_Item → stloc tmp → ldloca tmp → call Offset',
      deep: '<p>Why does the compiler not forbid this too? It does not know whether the method changes <code>this</code>. The method might only read fields, and then calling it on a copy is perfectly fine. It can only know if the method is marked <code>readonly</code> or the struct is a <code>readonly struct</code> (the defensive copies lesson in the "Performance" unit): then mutation is forbidden inside the method itself.</p>'
    },
    {
      t: 'choice',
      q: 'What does this code print, with the same Point struct?',
      code: 'var list = new List<Point> { new Point { X = 1 } };\nlist[0].Offset(5);\nConsole.WriteLine(list[0].X);',
      options: ['1', '6', '5', 'It does not compile'],
      answer: 0,
      explain: 'get_Item returned a copy, Offset added 5 to the copy, the copy vanished. The second list[0] returned a fresh copy of the unchanged element: X = 1.',
      wrong: {
        1: 'That is what you would get with a Point[] array or if Point were a class.',
        3: 'CS1612 is only about assignment. Calling a method on a temporary copy is allowed.'
      }
    },
    {
      t: 'learn',
      title: 'foreach: the loop variable is read-only',
      body: '<p>The <code>foreach</code> variable is a copy of the current element, and it is <b>read-only</b>. You cannot assign to its field: error <b>CS1654</b>.</p><p>You can call a mutating method, and it is easy to get this wrong in both directions. The compiler makes no defensive copy for the loop variable: the method changes <code>p</code> itself, and the next line of the body sees the new value. But <code>p</code> is already a copy of the element, so the collection element does not change. On the next iteration <code>p</code> is filled again, and the change is gone.</p>',
      code: 'foreach (var p in list)\n{\n    p.X = 1;        // CS1654\n    p.Offset(1);    // compiles: p changes, not the element\n}',
      deep: '<p>For a <code>readonly</code> <b>field</b>, though, the defensive copy is real, and it produces a famous infinite loop: the <code>List&lt;T&gt;.Enumerator</code> enumerator is a mutable struct. Put it in a <code>readonly</code> field, and every <code>_e.MoveNext()</code> runs on a fresh defensive copy: it always starts at the beginning, always returns true, and <code>_e.Current</code> stays the default value.</p>'
    },
    {
      t: 'multi',
      q: 'Point is a mutable struct, list is a List<Point>, arr is a Point[]. Which lines actually change the data in the collection? Select all.',
      options: [
        'arr[0].Offset(1);',
        'list[0] = list[0] with { X = 1 };',
        'list[0].Offset(1);',
        'foreach (var p in arr) p.Offset(1);',
        'CollectionsMarshal.AsSpan(list)[0].X = 1;'
      ],
      answer: [0, 1, 4],
      explain: 'An array element is a variable, the method changes it in place. with creates a modified copy, and the assignment puts it back into the list. AsSpan gives a Span over the list\'s internal array, and its indexer returns a ref. list[0].Offset changes a temporary copy, and foreach changes the loop variable, which is itself a copy of the element, even for an array.'
    },
    {
      t: 'learn',
      title: 'How to change an element in place',
      body: '<ul><li><b>Replace it whole.</b> <code>list[i] = list[i] with { X = 1 };</code> — <code>with</code> works with any struct since C# 10. Two copies, but honest code.</li><li><b>A ref local.</b> <code>ref var p = ref arr[i];</code> — an alias for the array element, all changes go into it.</li><li><b>ref in foreach.</b> <code>foreach (ref var p in span)</code> — over a <code>Span&lt;T&gt;</code>, whose enumerator yields <code>ref T</code>.</li><li><b>A list and a dictionary.</b> <code>CollectionsMarshal.AsSpan(list)</code> (.NET 5) and <code>CollectionsMarshal.GetValueRefOrNullRef(dict, key)</code> (.NET 6) give a ref into the internal storage.</li></ul>',
      code: 'foreach (ref var p in CollectionsMarshal.AsSpan(list))\n    p.X += 1;                     // the element itself changes\n\nref var v = ref CollectionsMarshal.GetValueRefOrNullRef(dict, "a");\nif (!Unsafe.IsNullRef(ref v)) v.X = 1;',
      deep: '<p><code>CollectionsMarshal</code> is a "dangerous" API: you hold a ref into the internal array. Add an element to the list and it may move to a new array: the old span keeps looking at a stale copy. For a dictionary, any add or remove invalidates the ref. So do not change the collection between getting a ref and using it.</p>'
    },
    {
      t: 'blanks',
      q: 'Shift every point in the list in place, with no copies',
      code: 'foreach (___ var p in CollectionsMarshal.___(list))\n    p.X += 1;',
      tiles: ['ref', 'AsSpan', 'in', 'ToArray', 'readonly', 'AsMemory'],
      answer: ['ref', 'AsSpan'],
      explain: 'AsSpan gives a Span<Point> over the list\'s internal array, and foreach (ref var …) gives a reference to each element. ToArray would copy the data, and the changes would go into the copy.'
    },
    {
      t: 'learn',
      title: 'A boxed struct behaves like a class',
      body: '<p>There is a third mode. If structs are stored in a collection of interfaces (<code>List&lt;IMover&gt;</code>) or of <code>object</code>, the list holds <b>boxes</b>. A call through the interface changes the box — the very one in the list. The change is visible.</p><p>But unbox an element into a variable of the struct type, and you hold a copy again. The same type behaves sometimes like a value, sometimes like a reference — depending on how you reached it. This is the main argument against mutable structs.</p>',
      code: 'var movers = new List<IMover> { new Point() };\nmovers[0].Move(5);               // the box in the list changes\nvar p = (Point)movers[0];        // unboxing — a copy, X = 5\np.Move(1);                       // only p changes\nConsole.WriteLine(((Point)movers[0]).X);  // 5'
    },
    {
      t: 'match',
      q: 'Point is a mutable struct with a Move method. Match each call with what it actually changes.',
      pairs: [
        ['arr[i].Move() on Point[]', 'The array element itself'],
        ['list[i].Move() on List<Point>', 'A temporary copy of the element'],
        ['movers[i].Move() on List<IMover>', 'The box stored in the list'],
        ['p.Move() in foreach (var p in list)', 'The loop variable, a copy of the element'],
        ['span[i].Move() on Span<Point>', 'The memory element under the span']
      ]
    },
    {
      t: 'learn',
      title: 'The takeaway: do not make structs mutable',
      body: '<p>The .NET design guidelines say it plainly: <b>do not define mutable value types</b>. Every trap in this lesson follows from one fact: a struct is copied on every read, and the change lands in whichever copy the code happened to reach.</p><p>An immutable struct: <code>readonly struct</code> or <code>readonly record struct</code> (C# 10). Read-only fields, and instead of mutating methods — methods that return a new value, plus <code>with</code>. Then <code>list[0] = list[0].Offset(5)</code> is the only way, and it works.</p>',
      code: 'public readonly record struct Point(int X, int Y)\n{\n    public Point Offset(int dx) => this with { X = X + dx };\n}\n\nlist[0] = list[0].Offset(5);   // explicit: read, change, write',
      deep: '<p>The BCL itself has exceptions to the rule, all for speed: collection enumerators, <code>ValueTuple</code> (its <code>Item1</code>, <code>Item2</code> fields are mutable), internal runtime builders like <code>ValueStringBuilder</code>. They are structs to avoid allocation, and are used only as local variables — never put into collections or readonly fields.</p>'
    },
    {
      t: 'choice',
      q: 'Which line is a silent bug: it compiles but changes nothing in the list?',
      options: [
        'list[0].Offset(1);',
        'list[0].X = 1;',
        'arr[0].X = 1;',
        'list[0] = list[0] with { X = 1 };'
      ],
      answer: 0,
      explain: 'The compiler allows a method call on a temporary copy, and the change is lost. list[0].X = 1 does not compile (CS1612), and the other two lines honestly change the data.',
      wrong: { 1: 'This line is not silent at all: the compiler stops it with error CS1612.' }
    }
  ]
};

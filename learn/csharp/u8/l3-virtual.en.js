/** Deeper C#, unit "Type members and versioning", lesson 3: virtual, new, override, sealed, call and callvirt, the method table. */
export default {
  id: 'cs.u8.l3',
  title: 'virtual, new and override',
  sub: 'The method table, call and callvirt, and what breaks for a consumer when new becomes override',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'The virtual method table',
      body: '<p>Every type has a MethodTable, the structure an object points to (see the unit "How a type is built"). It holds a <b>table of slots</b>: one slot per virtual method, and each slot holds a code address.</p><p>A derived type gets a copy of the parent table, and then:</p><ul><li><code>override</code> <b>replaces the address in the parent slot</b>: same slot, new code;</li><li><code>new</code> <b>leaves the parent slot alone</b>: a method with the same name becomes a separate method (and <code>new virtual</code> becomes a new slot at the end of the table).</li></ul><p>A virtual call means "take the object MethodTable, take slot number N, jump to the address". The object decides which code runs, not the variable type.</p>',
      code: 'class Shape            { public virtual string Name() => "shape"; }\nclass Circle : Shape   { public override string Name() => "circle"; }\nclass Square : Shape   { public new string Name() => "square"; }\n\n// Name slot of Shape:  Shape.Name\n// Name slot of Circle: Circle.Name  (replaced)\n// Name slot of Square: Shape.Name   (untouched)'
    },
    {
      t: 'choice',
      q: 'The classes from the example above. What does the code print?',
      code: 'Shape a = new Circle();\nShape b = new Square();\nConsole.WriteLine($"{a.Name()} {b.Name()}");',
      options: ['circle shape', 'circle square', 'shape shape', 'shape square'],
      answer: 0,
      explain: 'The call goes through the Shape.Name slot. Circle has its override in the slot; Square still has the Shape method: new created a separate method that is visible only through a variable of type Square.',
      wrong: { 1: 'Square.Name with new would be called only through a variable of type Square. Through Shape the slot leads to Shape.Name.' }
    },
    {
      t: 'learn',
      title: 'Modifiers in IL',
      body: '<p>C# keywords turn into method flags in metadata:</p><ul><li><code>virtual</code> → <code>newslot virtual</code>: a new slot;</li><li><code>override</code> → <code>virtual</code> without <code>newslot</code>: take the parent slot with the same signature;</li><li><code>sealed override</code> → <code>final virtual</code>: the slot is taken, no further overriding;</li><li><code>new</code> on a non-virtual method → a plain method with no flags;</li><li><code>abstract</code> → <code>newslot abstract virtual</code>, with no code.</li></ul><p>The word <code>new</code> itself never reaches IL. It is just an answer to the compiler: "I know I am hiding the parent method".</p>',
      code: '.method public hidebysig newslot virtual instance string Name()   // virtual\n.method public hidebysig virtual instance string Name()           // override\n.method public final hidebysig virtual instance string Name()     // sealed override\n.method public hidebysig instance string Name()                   // new',
      deep: '<p>The <code>hidebysig</code> flag says the method hides the parent one only when the signature matches, not by name alone. C# always sets it.</p><p>An implicit interface method implementation without <code>virtual</code> looks like <code>virtual final newslot</code> in IL: the CLR needs it virtual to call it through the interface, but for C# it stays non-virtual and sealed.</p>'
    },
    {
      t: 'learn',
      title: 'call and callvirt',
      body: '<p>IL has two instructions for calling an instance method:</p><ul><li><code>call</code>: call exactly this method, the address is known up front. No null check.</li><li><code>callvirt</code>: check the reference for null, and if the method is virtual, find the code through the object slot.</li></ul><p>C# emits <code>callvirt</code> for almost every instance method call on a reference type, <b>even a non-virtual one</b>: that way a call on null immediately throws <code>NullReferenceException</code>. For a non-virtual method the JIT still makes a direct call, adding a cheap null check.</p><p>C# uses <code>call</code> for static methods, struct methods and <code>base.Method()</code>: there it needs exactly the parent method, not the slot.</p>',
      code: 'order.Total();      // callvirt  Order::Total   (even if Total is not virtual)\nMath.Max(a, b);     // call      Math::Max\npoint.Length();     // call      Point::Length  (Point is a struct)\nbase.ToString();    // call      Object::ToString — bypasses the slot'
    },
    {
      t: 'match',
      q: 'Match the call with the IL instruction C# emits',
      pairs: [
        ['list.Clear() on a List<int>', 'callvirt'],
        ['base.Dispose() inside an override', 'call without a slot lookup'],
        ['Path.Combine(a, b)', 'call, a static method'],
        ['span.Slice(1) on a Span<byte>', 'call, a struct method']
      ]
    },
    {
      t: 'learn',
      title: 'The cost of a virtual call, and sealed',
      body: '<p>A virtual call is two memory reads (the MethodTable, then the slot) and an indirect jump. By itself that is nanoseconds. What costs more: <b>the JIT cannot inline</b> a method whose code is unknown until run time.</p><p>If the JIT is sure of the exact type, it <b>devirtualizes</b>: a direct call, and then inlining. What helps:</p><ul><li><code>sealed</code> on a class or a method: no derived types, the slot will not be replaced;</li><li>the exact type is visible in the code: <code>new Circle().Name()</code>;</li><li>dynamic PGO (on by default since .NET 8): the JIT notices that <code>Circle</code> almost always arrives and emits a check "if Circle, call directly, else go through the slot".</li></ul>',
      deep: '<p>That is why modern codebases often make classes <code>sealed</code> by default, and analyzer CA1852 suggests sealing internal classes that have no derived types. A bonus: <code>is</code> and casts to a <code>sealed</code> type boil down to comparing the MethodTable pointer.</p><p>A call through an interface is more involved than through a class slot: the CLR uses stubs (virtual stub dispatch) with a cache keyed by the object type. In .NET 8–10 guarded devirtualization through PGO works for it too.</p>'
    },
    {
      t: 'multi',
      q: 'When can the JIT call Name() directly, without going through the slot? Select all.',
      options: ['Class Circle is sealed, the call is through a Circle variable', 'Circle declares the method as sealed override, the call is through a Circle variable', 'new Circle().Name()', 'The call is through a Shape variable, and Shape is an abstract class', 'Name is declared virtual, but nobody has overridden it'],
      answer: [0, 1, 2],
      explain: 'A sealed class and a sealed override guarantee the slot will not be replaced further down. For new Circle() the exact type is visible right in the code. Shape being abstract says nothing about the derived type, and the JIT cannot know that "nobody overrode it": an assembly with a derived type may be loaded later. Dynamic PGO puts a type check with a fallback through the slot in such places, which is no longer an unconditional direct call.'
    },
    {
      t: 'learn',
      title: 'Version 2: new is changed to override',
      body: '<p>Library <code>Shapes.dll</code> v1: <code>Square.Name()</code> is declared with <code>new</code>. The app keeps squares in a <code>List&lt;Shape&gt;</code> and prints <code>s.Name()</code>, getting "shape". Tests and reports are written around this behavior.</p><p>In v2 the author fixed the "bug": replaced <code>new</code> with <code>override</code>. The app was not recompiled. What happens:</p><ul><li>the app IL still has <code>callvirt Shape::Name</code>: the reference is valid, no load errors;</li><li>but the <code>Name</code> slot of <code>Square</code> is now taken by the override, and the same call prints "square".</li></ul><p>Binary compatibility survived, the behavior changed. The reverse change <code>override</code> → <code>new</code> just as quietly breaks calls through the base type: they stop reaching the derived class.</p>',
      code: '// The app, built against v1, IL unchanged:\nforeach (Shape s in shapes)\n    Console.WriteLine(s.Name());   // callvirt Shape::Name\n\n// with Shapes v1 (new):      shape\n// with Shapes v2 (override): square'
    },
    {
      t: 'tapline',
      q: 'The app was built against Shapes v1, where Square.Name is declared with new. It runs with v2, where it is override. Which line changes its output?',
      code: 'var sq = new Square();\nShape sh = sq;\nobject o = sq;\nConsole.WriteLine(sq.Name());\nConsole.WriteLine(sh.Name());\nConsole.WriteLine(o.GetType().Name);',
      answer: 4,
      explain: 'sq.Name() lands in Square.Name in both v1 and v2: the variable type is Square. sh.Name() goes through the Shape.Name slot: in v1 it holds the Shape method, in v2 the Square override. GetType().Name is always "Square".'
    },
    {
      t: 'learn',
      title: 'Version 2: a method appears in the base class',
      body: '<p>The opposite case. The app has <code>class MyButton : Button</code> with its own <code>void Refresh()</code>. In v2 of the UI library, <code>Button</code> gets a <code>virtual void Refresh()</code> and calls it internally on redraw.</p><p>Without a recompile, the app method is a plain non-virtual method in IL; it does not take the <code>Button.Refresh</code> slot. The library calls its own version, and <code>MyButton.Refresh</code> stays silent.</p><p>On recompile the compiler gives warning <b>CS0114</b>: "the member hides an inherited member; add override or new". By default C# treats it as <code>new</code>, a deliberate language decision: a new method in a base class must not silently take over someone else\'s code.</p>',
      deep: '<p>Other library changes that break consumers without a recompile:</p><ul><li>the class became <code>sealed</code> while a consumer derives from it: <code>TypeLoadException</code> when the consumer type loads;</li><li>an <code>abstract</code> method was added to the base class: the consumer derived class has no implementation, also <code>TypeLoadException</code>;</li><li>a method stopped being <code>virtual</code>: the consumer override has nothing to override anymore, so it becomes a separate method and is no longer called through the base.</li></ul><p>Making a non-virtual method <code>virtual</code> is safe for C# callers: they already call it through <code>callvirt</code>.</p>'
    },
    {
      t: 'multi',
      q: 'Which changes break a derived consumer built against v1 when only the library dll is replaced? Select all.',
      options: ['The base class became sealed', 'An abstract method was added to the base class', 'A public base class method became virtual', 'A new private method was added to the base class'],
      answer: [0, 1],
      explain: 'You cannot derive from a sealed class, and an unimplemented abstract method makes the type unloadable: both give TypeLoadException. Adding virtual is safe: calls already go through callvirt. The consumer cannot see a private method.'
    },
    {
      t: 'blanks',
      q: 'Forbid further overriding while keeping your own override',
      code: 'class Circle : Shape\n{\n    public ___ ___ string Name() => "circle";\n}',
      tiles: ['sealed', 'override', 'new', 'virtual', 'static'],
      answer: ['sealed', 'override'],
      explain: 'sealed override takes the parent slot and sets the final flag: classes derived from Circle cannot override it, and the JIT can devirtualize a call through a Circle variable.'
    }
  ]
};

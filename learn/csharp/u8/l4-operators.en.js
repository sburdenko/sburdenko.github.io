/** Deeper C#, unit "Type members and versioning", lesson 4: operators, user-defined conversions and extension methods. */
export default {
  id: 'cs.u8.l4',
  title: 'Operators and extensions',
  sub: 'op_Addition, implicit and explicit, extension methods and C# 14 extension blocks',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'An operator is a static method',
      body: '<p>The CLR has no "operator overloading". When you write <code>operator +</code>, the compiler creates an ordinary static method with the special name <code>op_Addition</code> and the <code>specialname</code> flag. The expression <code>a + b</code> becomes <code>call Money::op_Addition(a, b)</code>.</p><p>C# rules:</p><ul><li>an operator is <code>public static</code>, and at least one parameter is your type;</li><li>paired operators are declared together: <code>==</code> with <code>!=</code>, <code>&lt;</code> with <code>&gt;</code>, <code>&lt;=</code> with <code>&gt;=</code>;</li><li>if you declare <code>==</code>, override <code>Equals</code> and <code>GetHashCode</code>, or get warnings CS0660/CS0661;</li><li><code>+=</code> is built from <code>+</code> and an assignment by default.</li></ul>',
      code: 'public readonly record struct Money(decimal Amount, string Currency)\n{\n    public static Money operator +(Money a, Money b) =>\n        a.Currency == b.Currency\n            ? new(a.Amount + b.Amount, a.Currency)\n            : throw new InvalidOperationException("Different currencies");\n}\n\n// IL: .method public hidebysig specialname static\n//     valuetype Money op_Addition(valuetype Money a, valuetype Money b)',
      deep: '<p>Names like <code>op_Addition</code>, <code>op_Equality</code>, <code>op_Implicit</code> are reserved by the ECMA-335 standard, and other .NET languages recognize operators by them. A language without operator overloading can call the same method by name.</p><p>C# 11 added <code>checked</code> operators (<code>op_CheckedAddition</code>), and C# 14 added user-defined compound assignment: an instance <code>public void operator +=(Money m)</code> named <code>op_AdditionAssignment</code> changes the object in place, without creating a new one. Useful for large buffers and tensors.</p>'
    },
    {
      t: 'choice',
      q: 'Money is the struct from the example above. What does the compiler turn total += price into?',
      options: ['total = Money.op_Addition(total, price)', 'callvirt Money::op_Addition', 'The IL instruction add', 'A call to total.Add(price)'],
      answer: 0,
      explain: 'Money has no += operator, so the compiler takes op_Addition and assigns the result. It is a static method: the call instruction, no callvirt. The IL add instruction works only with primitives.',
      wrong: { 1: 'Operators are static and called with call: there is no receiver object and no slot.', 2: 'add is for int, double and other CLR primitives. The Money struct is not one of them.' }
    },
    {
      t: 'learn',
      title: 'The operator is chosen at compile time',
      body: '<p>Since an operator is a static method, <b>the compiler chooses it by static types</b>, just like method overloads. No virtual dispatch.</p><p>The classic trap is <code>==</code> through <code>object</code>. <code>string</code> has its own <code>op_Equality</code> that compares characters. But if both variables are declared as <code>object</code>, the compiler sees only <code>object == object</code>: a reference comparison.</p><p>Same in generics: in a method with <code>where T : class</code> the expression <code>a == b</code> is always a reference comparison, even if <code>T</code> turns out to be <code>string</code>. To compare values use <code>Equals</code> or <code>EqualityComparer&lt;T&gt;.Default</code>.</p>',
      code: 'string s1 = "ab";\nstring s2 = string.Concat("a", "b");   // a new string on the heap\n\nConsole.WriteLine(s1 == s2);             // True: string.op_Equality\nobject o1 = s1, o2 = s2;\nConsole.WriteLine(o1 == o2);             // False: reference comparison\nConsole.WriteLine(o1.Equals(o2));        // True: virtual Equals'
    },
    {
      t: 'choice',
      q: 'What does Same("ab", string.Concat("a", "b")) return?',
      code: 'static bool Same<T>(T a, T b) where T : class => a == b;',
      options: ['False', 'True', 'Does not compile: == is not allowed for T', 'Depends on interning, usually True'],
      answer: 0,
      explain: 'With the class constraint the compiler allows == and binds it to reference comparison: it does not see string op_Equality when compiling the generic. Concat creates a new string, so the references differ.',
      wrong: { 2: 'That would be true without the class constraint. With where T : class, == is allowed but compares references.', 3: 'The string from Concat is created at run time and is not interned, so the references differ.' }
    },
    {
      t: 'learn',
      title: 'implicit and explicit',
      body: '<p>User-defined conversions are static methods too: <code>op_Implicit</code> and <code>op_Explicit</code>. This is the only place where the CLR allows overloading <b>by return type</b>: one class can have several <code>op_Implicit</code> methods with the same parameter and different results.</p><ul><li><code>implicit</code>: the compiler inserts the call itself. Only for conversions that lose no data and never throw.</li><li><code>explicit</code>: you have to write <code>(Type)x</code>. For anything that may truncate or fail.</li></ul><p>You cannot declare a conversion to or from an interface, to <code>object</code>, to a base class or a derived class: the CLR already has those casts. And remember from the unit "How a type is built": user-defined conversions are not called through <code>object</code>.</p>',
      code: 'Meters d = 5;         // call Meters::op_Implicit(int32)\nint n = (int)d;       // call Meters::op_Explicit(Meters)\n\npublic readonly record struct Meters(double Value)\n{\n    public static implicit operator Meters(int m) => new(m);       // lossless\n    public static explicit operator int(Meters m) => (int)m.Value; // truncates\n}'
    },
    {
      t: 'multi',
      q: 'Which declarations inside public class Money compile? Select all.',
      options: ['public static implicit operator Money(decimal d)', 'public static explicit operator decimal(Money m)', 'public static implicit operator object(Money m)', 'public static implicit operator IComparable(Money m)', 'public implicit operator string(Money m)'],
      answer: [0, 1],
      explain: 'A conversion to object is forbidden: it is a base class (CS0553). To an interface is not allowed either (CS0552). And without static the operator cannot be declared at all.'
    },
    {
      t: 'learn',
      title: 'Version 2: operators are baked into the calling IL',
      body: '<p>The operator is chosen at compile time and written into the consumer IL as a specific method. Hence two "version 2" scenarios:</p><ul><li>v2 adds a more precise overload, say <code>Money + decimal</code>. The old consumer keeps calling what the compiler chose earlier: <code>op_Implicit(decimal)</code>, then <code>op_Addition(Money, Money)</code>. The new overload kicks in only after a recompile.</li><li>v2 removes an <code>implicit</code> conversion or turns it into <code>explicit</code>. For source code that is a compile error, and for an old consumer it is a <code>MissingMethodException</code> on the first call of a method that used <code>op_Implicit</code>.</li></ul><p>An operator signature is as much a part of the public API as a method name.</p>',
      code: '// consumer built against v1: Money has only + (Money, Money) and implicit from decimal\nvar total = price + 10m;\n\n// its IL, unchanged when the dll is replaced:\ncall  Money::op_Implicit(valuetype decimal)\ncall  Money::op_Addition(valuetype Money, valuetype Money)'
    },
    {
      t: 'learn',
      title: 'An extension method is a static call',
      body: '<p>An extension method is a static method of a static class whose first parameter is marked with <code>this</code>. The compiler puts <code>ExtensionAttribute</code> on it.</p><p>The call <code>title.Truncate(10)</code> is syntactic sugar. In IL it is <code>call StringExt::Truncate(title, 10)</code>: no <code>callvirt</code>, no null check on the receiver. That is why an extension method <b>can be called on null</b>: an exception happens only if the method itself touches the parameter.</p><p>To make the method visible you need a <code>using</code> for the namespace of its class. Remove the <code>using</code> and the method "disappears".</p>',
      code: 'string? name = null;\nname.IsBlank();            // true — IL: call StringExt::IsBlank(name)\nStringExt.IsBlank(name);   // exactly the same\n\npublic static class StringExt\n{\n    public static bool IsBlank(this string? s) => string.IsNullOrWhiteSpace(s);\n    public static string Truncate(this string s, int n) =>\n        s.Length <= n ? s : s[..n];\n}'
    },
    {
      t: 'choice',
      q: 'StringExt from the example above. What happens?',
      code: 'string? s = null;\nConsole.WriteLine(s.IsBlank());\nConsole.WriteLine(s.Truncate(3));',
      options: ['Prints True, then NullReferenceException inside Truncate', 'NullReferenceException on the very first call', 'Prints True and an empty string', 'Does not compile: null has no methods'],
      answer: 0,
      explain: 'An extension call is a static call; null is simply passed as an argument. IsBlank handles null. Truncate reads s.Length and fails inside the method.',
      wrong: { 1: 'That is what an instance method would do: callvirt checks the receiver for null. An extension is called with call.' }
    },
    {
      t: 'learn',
      title: 'An instance method always wins',
      body: '<p>The compiler looks for a method in two stages. First among the instance methods of the type. Only if <b>none is applicable</b> does it look at extensions in visible namespaces.</p><p>Note: "applicable" does not mean "a better match". If the type has <code>Log(object)</code>, the call <code>x.Log(5)</code> goes there with boxing, even if an extension <code>Log(this X x, int n)</code> with the exact type is right next to it.</p><p><b>Version 2.</b> You wrote a <code>Shuffle</code> extension for someone else\'s type. In v2 of the library the type gets its own <code>Shuffle()</code>. Your old assembly keeps calling your extension: its IL has a static call. But after a recompile every call silently moves to the library method, without a single warning.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line prints inst?',
      code: 'var item = new Item();\nConsole.WriteLine(item.Show());\nConsole.WriteLine(Ext.Show(item, 5));\nConsole.WriteLine(item.Show(5));\n\nstatic class Ext\n{\n    public static string Show(this Item i) => "ext0";\n    public static string Show(this Item i, int n) => "ext";\n}\nclass Item { public string Show(object o) => "inst"; }',
      answer: 3,
      explain: 'item.Show(5): the instance Show(object) is applicable, the int gets boxed to object. Once an applicable instance method is found, extensions are not considered, even though Show(int) is more precise. item.Show() with no arguments does not fit the instance method, so the extension runs. Ext.Show(item, 5) is an explicit static call.'
    },
    {
      t: 'learn',
      title: 'C# 14: extension blocks',
      body: '<p>C# 14 (.NET 10) introduced <b>extension members</b>. Inside a static class you write an <code>extension(receiver)</code> block, and it can declare more than methods:</p><ul><li><b>extension properties</b>: <code>name.IsBlank</code> without parentheses;</li><li><b>static members</b> of the type: a block without a receiver name, called as <code>string.Dash</code>;</li><li><b>operators</b> for someone else\'s type.</li></ul><p>Old <code>this</code> methods are still here. An instance method in a block compiles to the same IL as a <code>this</code> method, so a library can move to the new syntax without breaking consumers, neither binary nor source.</p>',
      code: 'public static class StringExt\n{\n    extension(string? s)\n    {\n        public bool IsBlank => string.IsNullOrWhiteSpace(s);   // property\n        public string Or(string other) => s ?? other;          // method\n    }\n\n    extension(string)\n    {\n        public static string Dash => "-";                     // string.Dash\n    }\n}',
      deep: '<p>Blocks have the same restrictions as classic extensions: a top-level, static, non-generic class. Type parameters go on the block itself: <code>extension&lt;T&gt;(IEnumerable&lt;T&gt; source)</code>.</p><p>The priority has not changed: an instance member of the type still beats an extension. The compiler turns an extension property into a static accessor method with the receiver as the first parameter and adds auxiliary metadata that lets the consumer compiler recognize the block. Extension indexers arrive in the next version, C# 15.</p>'
    },
    {
      t: 'blanks',
      q: 'Declare an extension property in C# 14 style',
      code: 'public static class ListExt\n{\n    ___<T>(List<T> list)\n    {\n        public bool IsEmpty => list.Count == 0;\n    }\n}',
      tiles: ['extension', 'this', 'static', 'operator', 'implicit'],
      answer: ['extension'],
      explain: 'The block extension<T>(List<T> list) declares the receiver for all members inside. this before a parameter is the syntax of classic extension methods; a property cannot be declared that way.'
    }
  ]
};

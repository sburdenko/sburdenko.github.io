/** Deeper C#, unit "Type members and versioning", lesson 2: initialization order, the static constructor and beforefieldinit. */
export default {
  id: 'cs.u8.l2',
  title: 'Initialization order',
  sub: 'Field initializers, base(), the constructor body, the static constructor and beforefieldinit',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Field initializers do not exist',
      body: '<p>The CLR has no notion of a "field initializer". The C# compiler moves every <code>= ...</code> on a field <b>into the constructor</b>, at the very start, before the base class constructor is called.</p><p>A constructor in IL looks like this:</p><ul><li>the field initializers of its own class, in declaration order;</li><li>the <code>base(...)</code> call;</li><li>the constructor body you wrote.</li></ul><p>If there are several constructors, the initializers are copied into each one that calls <code>base</code>. A constructor with <code>: this(...)</code> does not get them, or the fields would be filled twice.</p>',
      code: '// C#\nclass Order : Entity\n{\n    List<Line> lines = new();\n    public Order() : base("order") { Console.WriteLine("body"); }\n}\n\n// IL of the Order constructor\nldarg.0\nnewobj     List<Line>::.ctor()\nstfld      Order::lines            // 1. field initializer\nldarg.0\nldstr      "order"\ncall       Entity::.ctor(string)   // 2. base constructor\nldstr      "body"\ncall       Console::WriteLine      // 3. body',
      deep: '<p>Fields without an initializer get nothing assigned: the CLR hands out object memory already zeroed. So <code>int count = 0;</code> is a redundant store: it adds an instruction to every constructor and the result is the same. Analyzer CA1805 suggests removing it.</p><p>The order "initializers before <code>base</code>" differs from Java, where field initializers run after the <code>super()</code> call.</p>'
    },
    {
      t: 'order',
      q: 'class D : B. Both have field initializers and constructor bodies. Put in order what runs on new D()',
      items: ['Field initializers of D', 'Field initializers of B', 'The object constructor', 'Body of the B constructor', 'Body of the D constructor'],
      explain: 'The D constructor first fills its own fields, then calls the B constructor. That one fills the B fields and calls object. The bodies run on the way back: B first, then D.'
    },
    {
      t: 'learn',
      title: 'A virtual call from a constructor',
      body: '<p>An object type in the CLR does not change while it is being built: from the first instruction it is already <code>Derived</code>. So a virtual method called from the <code>Base</code> constructor lands in the <code>Derived</code> override, while the <code>Derived</code> constructor body has not run yet.</p><p>What the override sees:</p><ul><li><code>Derived</code> fields with initializers are <b>already filled</b> (they run before <code>base</code>);</li><li>fields assigned in the <code>Derived</code> constructor body are <b>still default</b>: 0, null, false.</li></ul><p>Hence a <code>NullReferenceException</code> "out of nowhere". The rule: do not call virtual methods from a constructor. Analyzer CA2214 warns about it.</p>',
      code: 'class Widget\n{\n    public Widget() => Render();          // a virtual call\n    protected virtual void Render() { }\n}\n\nclass Label : Widget\n{\n    string font = "Arial";                // filled before base()\n    string text;\n    public Label() { text = "Hello"; }    // has not run yet\n    protected override void Render() =>\n        Console.WriteLine($"{font}: {text.Length}");\n}',
      deep: '<p>C++ works differently: inside the base class constructor the object still counts as the base type, and a virtual call goes to the base version. In .NET the type pointer (MethodTable) is written into the object at allocation, before any constructor, and never changes after that.</p><p>Nullable analysis does not help here: the compiler considers <code>text</code> assigned after the constructor, and the call happens earlier, inside it.</p>'
    },
    {
      t: 'tapline',
      q: 'new Label() from the example above. Which line throws NullReferenceException?',
      code: 'class Label : Widget\n{\n    string font = "Arial";\n    string text;\n    public Label() { text = "Hello"; }\n    protected override void Render() =>\n        Console.WriteLine($"{font}: {text.Length}");\n}',
      answer: 6,
      explain: 'Render is called from the Widget constructor. By then font is already "Arial": its initializer ran before base(). But text is assigned by the Label constructor body, which has not started, so text is null.'
    },
    {
      t: 'learn',
      title: 'The static constructor',
      body: '<p>Static fields are filled by the <b>static constructor</b>, the <code>.cctor</code> method in IL. The compiler puts static field initializers at its start, followed by the body of <code>static Name() { }</code> if you wrote one.</p><p>CLR guarantees:</p><ul><li>it runs <b>once</b> per type for the lifetime of the process;</li><li>it is thread-safe: if two threads touch the type at once, one runs <code>.cctor</code> and the other waits;</li><li>you cannot call it yourself; it has no parameters and no access modifiers.</li></ul><p>If it throws, the type is broken for good: every later access gets a <code>TypeInitializationException</code>.</p>',
      code: 'class Config\n{\n    public static readonly string Path = Find();   // goes into .cctor first\n    public static readonly int Retries;\n\n    static Config()                                // .cctor, continued\n    {\n        Retries = int.Parse(Read("retries"));\n    }\n}',
      deep: '<p>Cycles between static constructors are dangerous. On a single thread a cycle does not hang: if the <code>.cctor</code> of A touches B and the <code>.cctor</code> of B touches A, then B sees A half-initialized, with default field values. Across threads (thread 1 initializes A, thread 2 initializes B) the same cycle risks a deadlock or the same read of a half-initialized type. That is why static constructors are kept short and free of cross dependencies.</p>'
    },
    {
      t: 'learn',
      title: 'When it runs: beforefieldinit',
      body: '<p>It all depends on one flag in the type metadata: <code>beforefieldinit</code>.</p><p><b>No explicit <code>static</code> constructor</b> (only initializers): the compiler sets the flag. It means "initialize whenever you like, but <b>before the first access to a static field</b>". The runtime may do it earlier or later, and calling a static method that does not touch fields does not trigger initialization.</p><p><b>An explicit <code>static Name() { }</code></b>, even an empty one: no flag. Then the moment is precise: right before the first access to any static member or before the first instance is created.</p><p>The price of precision: code the JIT compiled before the type was initialized gets "is the type ready?" checks before those accesses.</p>',
      code: '// IL: .class public beforefieldinit Lazy1\nclass Lazy1\n{\n    public static string X = Log("Lazy1");\n}\n\n// IL: .class public Exact1 — no flag\nclass Exact1\n{\n    public static string X = Log("Exact1");\n    static Exact1() { }\n}',
      deep: '<p>With tiered compilation a hot method reaches tier 1 when the types it needs are usually already initialized, and the JIT drops the checks. So the real speed difference shows mostly in cold code.</p><p>When a <code>beforefieldinit</code> type gets initialized depends on the runtime version: in older .NET Framework versions the JIT often ran it ahead of time, while compiling a method that uses the type. Modern .NET is usually lazier. Do not rely on a specific moment, only on "no later than the first field read".</p>'
    },
    {
      t: 'choice',
      q: 'Settings has no explicit static constructor. The code only calls Settings.Describe(), which returns a constant string and touches no fields. Will Load() run?',
      code: 'class Settings\n{\n    public static readonly string Data = Load();\n    public static string Describe() => "settings";\n}',
      options: ['Not necessarily: the type is beforefieldinit and nobody read the field', 'Yes, always: any static method call triggers initialization', 'No, never: static field initializers are lazy only for properties', 'Yes, but only in Release'],
      answer: 0,
      explain: 'Without an explicit static constructor the type is marked beforefieldinit. The runtime must initialize it only before the first read of a static field. Describe reads no fields, so Load may not run at all, or may run earlier, at the runtime discretion.',
      wrong: { 1: 'That would be true if Settings had an explicit static constructor: then a call to any static member triggers it.' }
    },
    {
      t: 'learn',
      title: 'Statics, inheritance and new D()',
      body: '<p>A static constructor belongs to its own type and is not inherited: <code>B</code> and <code>D</code> each have their own <code>.cctor</code>, and each runs once.</p><p>The order for <code>new D()</code> when both <code>D</code> and <code>B</code> have explicit static constructors:</p><ul><li>the <code>D</code> static constructor, then the <code>B</code> static constructor: before creating the instance the runtime walks the inheritance chain from <code>D</code> upward and runs those that have not run yet;</li><li>the <code>D</code> field initializers, the <code>B</code> field initializers;</li><li>the <code>B</code> body, the <code>D</code> body.</li></ul><p>Note that the derived statics run before the base statics, while for the instance the base goes before the derived one, but only the bodies, not the initializers.</p>',
      code: 'new D();   // sD sB B D\n\nclass B\n{\n    static B() => Console.Write("sB ");\n    public B() => Console.Write("B ");\n}\n\nclass D : B\n{\n    static D() => Console.Write("sD ");\n    public D() => Console.Write("D ");\n}'
    },
    {
      t: 'multi',
      q: 'Class Cache has an explicit static constructor. Which of these triggers it if the type is not initialized yet? Select all.',
      options: ['new Cache()', 'Cache.Clear(), a static method', 'Reading the static field Cache.Count', 'typeof(Cache)', 'Declaring a variable Cache c = null;'],
      answer: [0, 1, 2],
      explain: 'Without beforefieldinit the static constructor is triggered by the first access to any static member or by creating an instance. typeof only gets a Type object, and declaring a variable set to null does not touch the type at run time at all.'
    },
    {
      t: 'learn',
      title: 'Version 2: initialization is part of the contract',
      body: '<p>Initialization order is something a library consumer relies on without noticing. A real-life example: in v1 the <code>Registry</code> type registered handlers in a static field initializer, and it had an empty explicit <code>static Registry() { }</code>. The app called <code>Registry.Ping()</code> to "wake up" the type.</p><p>In v2 the author removed the "useless" empty constructor. The type became <code>beforefieldinit</code>, <code>Ping</code> does not touch fields, and the registration no longer happens at the expected moment. The app was not recompiled, the compiler said nothing.</p><p>The takeaway: side effects in static initialization are fragile. If you need explicit initialization, write an explicit <code>Init()</code> method or use <code>Lazy&lt;T&gt;</code>.</p>',
      deep: '<p>The same flag explains the old singleton trick: an empty static constructor is written so that the instance is created exactly on the first access to <code>Instance</code> and not earlier. Today <code>Lazy&lt;T&gt;</code> or a nested holder class is simpler and clearer.</p><p>There is also <code>[ModuleInitializer]</code> (C# 9), a method the runtime runs when the module loads, before any access to its types. It is an honest way to "run the registration" without betting on the <code>.cctor</code> moment.</p>'
    },
    {
      t: 'match',
      q: 'Match what runs with when it runs',
      pairs: [
        ['An instance field initializer', 'At the start of the constructor, before base()'],
        ['The constructor body', 'After base() returns'],
        ['An explicit static constructor', 'Before the first access to a static member or the first instance'],
        ['A static field initializer in a beforefieldinit type', 'At any moment before the first static field read'],
        ['[ModuleInitializer]', 'When the module loads']
      ]
    },
    {
      t: 'blanks',
      q: 'Make the initialization moment precise: before the first access to any static member',
      code: 'class Metrics\n{\n    public static readonly Counter Hits = new();\n    ___ ___() { }\n}',
      tiles: ['static', 'Metrics', 'public', 'void', 'Init'],
      answer: ['static', 'Metrics'],
      explain: 'An explicit static constructor, even an empty one, removes the beforefieldinit flag. Access modifiers are not allowed on it, and it has no return type.'
    }
  ]
};

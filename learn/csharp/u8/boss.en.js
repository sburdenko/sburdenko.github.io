/** Final of the unit "Type members and versioning" in the "Deeper C#" course. */
export default {
  id: 'cs.u8.boss',
  title: 'Final: type members and versioning',
  sub: 'Constants, initialization, slots and extensions: what breaks without a recompile',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'The app was built against Api v1, where Version = "1" and Url = "https://v1". In v2 they became "2" and "https://v2". The dll was replaced, the app was not rebuilt. What does it print?',
      code: 'public static class Api\n{\n    public const string Version = "2";\n    public static readonly string Url = "https://v2";\n}\n\n// app code\nConsole.WriteLine($"{Api.Version} {Api.Url}");',
      options: ['1 https://v2', '2 https://v2', '1 https://v1', '2 https://v1'],
      answer: 0,
      explain: 'The string constant is baked into the app IL as ldstr "1". static readonly is read with ldsfld from the new dll, which already says https://v2.',
      wrong: { 1: 'That happens only after the app is recompiled: a const value comes from the caller IL.', 3: 'The other way round: the const is what is baked in, and the field is read from the new assembly.' }
    },
    {
      t: 'order',
      q: 'class D : B. D has an explicit static constructor; both have field initializers and constructor bodies. Type D has not been touched yet. Put in order what runs on new D()',
      items: ['The D static constructor', 'Field initializers of D', 'Field initializers of B', 'Body of the B constructor', 'Body of the D constructor'],
      explain: 'Before the first instance is created, the D static constructor runs. Then the D constructor: its own initializers, the base call (B initializers and the B body), and only then the D body.'
    },
    {
      t: 'tapline',
      q: 'new SqlRepo("Server=db"). Which line throws NullReferenceException?',
      code: 'class Repo\n{\n    protected Repo() { Warmup(); }\n    protected virtual void Warmup() { }\n}\nclass SqlRepo : Repo\n{\n    readonly string table = "orders";\n    readonly string conn;\n    public SqlRepo(string c) { conn = c; }\n    protected override void Warmup()\n    {\n        Console.WriteLine(table.Length);\n        Console.WriteLine(conn.Length);\n    }\n}',
      answer: 13,
      explain: 'Warmup is called from the Repo constructor and reaches SqlRepo through the slot. The table initializer has already run: it comes before the base call. But conn is assigned by the SqlRepo constructor body, which has not been reached yet.'
    },
    {
      t: 'multi',
      q: 'The library was updated to v2, the consumer was not rebuilt. Which changes quietly alter its behavior, with no exceptions? Select all.',
      options: ['A public const value changed', 'A new member was inserted in the middle of an enum', 'A derived class replaced new with override', 'A base class the consumer derives from became sealed', 'An implicit conversion the consumer used was removed'],
      answer: [0, 1, 2],
      explain: 'Constants and enum members are baked in as numbers, and override takes the slot the old callvirt goes through. sealed gives TypeLoadException, a removed op_Implicit gives MissingMethodException: loud, not quiet.'
    },
    {
      t: 'choice',
      q: 'Area is a non-virtual method of class Shape and touches no fields. What happens?',
      code: 'Shape s = null;\nConsole.WriteLine(s.Area());',
      options: ['NullReferenceException at the call site', 'The method runs: it does not need this', 'NullReferenceException only if Area reads a field', 'Does not compile'],
      answer: 0,
      explain: 'C# calls instance methods of reference types with callvirt, and it checks the receiver for null before entering the method. Only an extension method would pass without an exception: it is called with call.',
      wrong: { 1: 'That would be the case with the call instruction. But C# emits callvirt even for non-virtual methods precisely for this check.' }
    },
    {
      t: 'match',
      q: 'Match what you see in IL with the C# construct',
      pairs: [
        ['op_Addition', 'operator +'],
        ['op_Implicit', 'implicit operator'],
        ['.cctor', 'Static constructor'],
        ['newslot virtual', 'virtual'],
        ['final virtual', 'sealed override']
      ]
    },
    {
      t: 'blanks',
      q: 'Consumers must see the new value after the dll is replaced, and initialization must happen at a precise moment, without beforefieldinit',
      code: 'public class Defaults\n{\n    public static ___ int TimeoutSec = 30;\n    ___ Defaults() { }\n}',
      tiles: ['readonly', 'static', 'const', 'sealed', 'virtual'],
      answer: ['readonly', 'static'],
      explain: 'static readonly is read with ldsfld from the current assembly. An explicit static constructor, even an empty one, removes the beforefieldinit flag.'
    },
    {
      t: 'choice',
      q: 'You have an extension ToJson(this Order o). In v2 of the library Order gets its own public string ToJson(). What happens to the order.ToJson() calls in your code?',
      options: ['Before a recompile, your extension; after it, the library method, with no warnings', 'The library method right away: the CLR picks the instance method at load time', 'After a recompile, an ambiguous call error', 'Always your extension: it is declared closer to the call'],
      answer: 0,
      explain: 'Your IL has a static call to the extension, and replacing the dll does not touch it. On recompile the compiler first looks for instance methods, finds ToJson on Order and never gets to extensions. There is no warning.',
      wrong: { 1: 'The CLR does not re-choose methods: the IL already names a specific static method.', 2: 'There is no ambiguity: the instance method simply wins, extensions are not considered.' }
    }
  ]
};

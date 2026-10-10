/** The history of .NET, unit 4, lesson 2: what is new in .NET 10 and C# 14. */
export default {
  id: 'hs.u4.l2',
  title: '.NET 10 and C# 14',
  sub: 'What is actually new and what has been around for years',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: '.NET 10: the November 2025 LTS',
      body: '<p>The headline of every recent release is speed. The JIT removes more memory allocations and virtual calls, and libraries get <code>Span&lt;T&gt;</code>-based APIs that avoid extra copies.</p><p>And there is a new language version: C# 14.</p>'
    },
    {
      t: 'learn',
      title: 'Not new, though people often think so',
      body: '<p><b>Nullable references</b>: C# 8 (2019). On by default in project templates since .NET 6.<br><b>Records</b>: C# 9 (2020).<br><b>Span&lt;T&gt;</b>: 2018 (.NET Core 2.1 and C# 7.2).</p><p>None of these arrived in .NET 10. They just got easier to use and spread wider through the libraries.</p>'
    },
    {
      t: 'match',
      q: 'Match each feature to the C# version that introduced it',
      pairs: [
        ['Nullable references', 'C# 8'],
        ['Records', 'C# 9'],
        ['Primary constructors for classes', 'C# 12'],
        ['The field keyword', 'C# 14']
      ]
    },
    {
      t: 'learn',
      title: 'C# 14: field',
      body: '<p>Adding logic to a setter used to mean declaring a backing field by hand. Now <code>field</code> is the hidden backing field of an auto-property.</p>',
      code: 'public string Name\n{\n    get;\n    set => field = value.Trim();\n}'
    },
    {
      t: 'learn',
      title: 'C# 14: extension members and ?.=',
      body: '<p>An <code>extension</code> block adds not just methods but also properties to someone else\'s type.</p><p>Assignment through <code>?.</code>: if the left side is null, nothing happens.</p>',
      code: 'static class StringExt\n{\n    extension(string s)\n    {\n        public bool IsBlank => string.IsNullOrWhiteSpace(s);\n    }\n}\n\ncustomer?.Order = GetOrder();   // if customer == null, GetOrder() is not called'
    },
    {
      t: 'blanks',
      q: 'A property that trims spaces, with no field of your own',
      code: 'public string Name { get; set => ___ = value.Trim(); }',
      tiles: ['field', 'value', 'this', '_name'],
      answer: ['field'],
      explain: '_name would work only if you declared that field yourself.'
    },
    {
      t: 'learn',
      title: 'Running a single file',
      body: '<p>In .NET 10 you can run a one-file program with no project: <code>dotnet run app.cs</code>. Packages are pulled in by a directive right in the file. Handy for scripts and experiments.</p>',
      code: '#:package Humanizer@2.14.1\nusing Humanizer;\n\nConsole.WriteLine(DateTime.Now.AddHours(-3).Humanize());'
    },
    {
      t: 'choice',
      q: 'What does customer?.Order = GetOrder() do when customer is null?',
      options: ['Nothing: no assignment happens, and GetOrder() is not called', 'Throws a NullReferenceException', 'Creates a new customer'],
      answer: 0,
      explain: 'The right side is evaluated only if the left side is not null.'
    },
    {
      t: 'multi',
      q: 'What is actually new in C# 14 / .NET 10? Select all that apply.',
      options: ['The field keyword', 'extension blocks with extension properties', 'Assignment through ?.', 'Records', 'Nullable references'],
      answer: [0, 1, 2],
      explain: 'Records and nullable are old features, from C# 9 and C# 8.'
    },
    {
      t: 'choice',
      q: 'Where do you usually see the biggest win from moving to a new .NET without changing code?',
      options: ['Speed: the JIT and libraries get faster with every release', 'Smaller source files', 'Syntax'],
      answer: 0,
      explain: 'Many teams see a gain just by switching the target and rebuilding.'
    }
  ]
};

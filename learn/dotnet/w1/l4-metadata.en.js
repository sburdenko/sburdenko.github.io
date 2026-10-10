/** Lesson 4: what's inside an assembly: metadata and the PE file. */
const TABLE = 'TypeDef     Program\nMethodDef   Add(int32, int32) : int32\nMethodDef   Main() : void\nMemberRef   System.Console::WriteLine(int32)\nAssemblyRef System.Console';

export default {
  id: 'dotnet.w1.l4',
  title: 'What\'s inside a .dll',
  sub: 'Metadata: a program that describes itself',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'An assembly is a .dll or .exe',
      body: '<p>The output of compilation is called an <b>assembly</b>. It has two main layers:</p><p><b>CIL</b>: what to do.<br><b>Metadata</b>: what the program contains: which classes, and what methods and parameters they have.</p>'
    },
    {
      t: 'learn',
      title: 'Metadata is a packing list',
      body: '<p>Like the packing list in a moving box. It lists both what\'s yours ("class Program, method Add") and what\'s borrowed, things the program takes from outside ("method WriteLine from the System.Console assembly").</p>',
      code: TABLE,
      lang: 'plain',
      deep: 'These are the real metadata table names from the ECMA-335 standard. You can browse them in ildasm or ILSpy, or read them from code with System.Reflection.Metadata.'
    },
    {
      t: 'match',
      q: 'Match each metadata table to what it holds',
      pairs: [
        ['TypeDef', 'Classes declared in this assembly'],
        ['MethodDef', 'This assembly\'s methods and their parameters'],
        ['MemberRef', 'Other code\'s methods that we call'],
        ['AssemblyRef', 'Assemblies we depend on']
      ]
    },
    {
      t: 'multi',
      q: 'What does metadata describe? Select all that apply.',
      options: ['Which classes the assembly has', 'Method parameters and types', 'External methods the code calls', 'Variable values at run time', 'The user\'s password'],
      answer: [0, 1, 2],
      explain: 'Metadata describes how the program is built. What happens at run time isn\'t in the file.'
    },
    {
      t: 'learn',
      title: 'Code that describes itself',
      body: '<p>Since the packing list lives right in the file, you don\'t need separate description files. Older technologies like COM used IDL and type libraries for that.</p><p>Metadata powers IDE hints, the debugger and <b>reflection</b>, a program\'s way of looking at itself:</p>',
      code: 'var methods = typeof(Program).GetMethods(\n    BindingFlags.Static | BindingFlags.NonPublic);\n// finds Add by reading it from the metadata'
    },
    {
      t: 'choice',
      q: 'How does the IDE know which methods a class in someone else\'s .dll has when there is no source?',
      options: ['From the metadata inside the .dll', 'It guesses from the file name', 'It downloads the source from the internet', 'It doesn\'t know'],
      answer: 0,
      explain: 'The list of types and method signatures is in the metadata. The IDE simply reads it.'
    },
    {
      t: 'tapline',
      q: 'Find the line that says "we call someone else\'s method"',
      code: TABLE,
      lang: 'plain',
      answer: 3,
      explain: 'MemberRef is a reference to a member of another type: here, Console.WriteLine from the System.Console assembly.'
    },
    {
      t: 'learn',
      title: 'The file format is PE',
      body: '<p>An assembly is stored in the <b>PE</b> (Portable Executable) format, the same one regular Windows programs use. .NET extended it with a CLR header, metadata and CIL. That\'s how the system tells a .NET program from a regular one.</p>',
      flow: ['PE header', 'CLR header', 'Metadata', 'CIL']
    },
    {
      t: 'choice',
      q: 'Hello.dll was built on Windows and runs on Linux. Is it still a PE file?',
      options: ['Yes, the assembly format is the same on every OS', 'No, .NET repackages it into a Linux format', 'No, on Linux assemblies are .so files'],
      answer: 0,
      explain: '.NET assemblies are PE files on any OS. They are read by the CLR, not by the Linux loader.',
      wrong: { 2: '.so files are native Linux libraries. A .NET assembly stays a .dll with CIL inside.' }
    }
  ]
};

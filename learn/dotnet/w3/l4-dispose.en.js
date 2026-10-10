/** Unit 3, lesson 4: IDisposable and using. */
export default {
  id: 'dotnet.w3.l4',
  title: 'IDisposable and using',
  sub: 'Release a resource now, not someday',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Resources the GC doesn\'t know about',
      body: '<p>A file, a network connection, a database connection: these are OS resources. The GC only sees memory and has no idea an object is holding a file open.</p><p>If you wait for the GC, the file may stay open for who knows how long.</p>'
    },
    {
      t: 'rig', rig: 'files',
      task: 'Open the file, then "forget" it (= null) and try to open it again. Get the second open to succeed without Dispose.',
      buttons: ['open', 'forget', 'gc', 'fin'],
      goal: { n: 2, noDispose: true },
      solve: ['open', 'open', 'forget:fs1', 'gc', 'fin', 'open']
    },
    {
      t: 'learn',
      title: 'IDisposable: release it now',
      body: '<p>Classes that hold such resources implement <code>IDisposable</code>: the <code>Dispose()</code> method closes the resource right away.</p><p><code>using</code> calls <code>Dispose()</code> automatically, even if an exception was thrown inside.</p>',
      code: 'using (var fs = new FileStream("log.txt", FileMode.Open))\n{\n    // work with the file\n}   // fs.Dispose() is called here\n\n// C# 8+: Dispose at the end of the current block\nusing var reader = new StreamReader("data.txt");'
    },
    {
      t: 'rig', rig: 'files',
      task: 'Now open the file twice the right way: with Dispose() or using.',
      buttons: ['open', 'dispose', 'using', 'forget', 'gc', 'fin'],
      goal: { n: 2 },
      solve: ['open', 'dispose:fs1', 'open']
    },
    {
      t: 'choice',
      q: 'An exception was thrown inside a using block. What happens to the resource?',
      options: ['Dispose() is still called', 'It stays open', 'The exception is swallowed'],
      answer: 0,
      explain: 'using expands into try/finally, and finally runs no matter what.'
    },
    {
      t: 'blanks',
      q: 'using is syntactic sugar. What does it expand into?',
      code: 'var fs = new FileStream(path, FileMode.Open);\n___\n{\n    Work(fs);\n}\n___\n{\n    fs?.Dispose();\n}',
      lang: 'cs',
      tiles: ['try', 'finally', 'catch', 'lock'],
      answer: ['try', 'finally'],
      explain: 'try/finally guarantees Dispose() on both a normal exit and an exception.'
    },
    {
      t: 'learn',
      title: 'Your own class with a resource',
      body: '<p>If a class owns an <code>IDisposable</code> field, it must implement <code>IDisposable</code> too and release the field in its own <code>Dispose()</code>. No finalizer needed.</p>',
      code: 'sealed class Report : IDisposable\n{\n    private readonly FileStream _file = File.OpenWrite("report.txt");\n    public void Dispose() => _file.Dispose();\n}',
      deep: 'The full Dispose(bool disposing) pattern with GC.SuppressFinalize(this) is for unsealed classes that may have subclasses, and for classes that hold an unmanaged resource directly. For the latter there\'s SafeHandle, the next lesson.'
    },
    {
      t: 'choice',
      q: 'A class stores a FileStream in a field. What\'s the right move?',
      options: ['Implement IDisposable and call _file.Dispose() in Dispose()', 'Write a finalizer that closes the file', 'Nothing: the GC will close it'],
      answer: 0,
      explain: 'The owner of a resource passes the responsibility up: its callers will wrap it in using too.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all that apply.',
      options: ['Dispose() releases the resource right away, without waiting for the GC', 'After Dispose() the object may still live in memory', 'using calls Dispose() even on an exception', 'Dispose() frees the object\'s memory', 'Every class needs IDisposable'],
      answer: [0, 1, 2],
      explain: 'Dispose closes the OS resource. The object\'s own memory is still freed by the GC once the object becomes unreachable.'
    }
  ]
};

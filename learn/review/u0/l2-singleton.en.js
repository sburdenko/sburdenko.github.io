/** Code review, unit 0 (ModelManager), lesson 2: a singleton, a constructor with side effects, a file handle, a subscription. */
export default {
  id: 'rv.u0.l2',
  title: 'Singleton, constructor and handles',
  sub: 'One static line that kills the whole type',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Story: a type that died for good',
      body: '<p>Everything worked in the editor. In the build, the console shows <code>TypeInitializationException</code> at startup, and from then on <b>every</b> access to <code>ModelManager</code> fails with the same exception. Reloading the scene does not help, only restarting the app does.</p><p>It all comes down to one line: <code>public static ModelManager Instance = new ModelManager();</code></p>'
    },
    {
      t: 'learn',
      title: 'The static initializer gets one attempt',
      body: '<p>A static field initializer runs inside the <b>type initializer</b> (the static constructor). The CLR runs it once, when the type is first used.</p><p>If it throws, the CLR wraps the exception in <code>TypeInitializationException</code> and <b>remembers the failure</b>. There is no second attempt: the type is "poisoned" for the rest of the process lifetime (in Unity, until the domain reloads).</p><p>And this constructor does a lot of risky things: it opens a file and subscribes to <code>SelectionService.Current</code>. If <code>Current</code> does not exist yet, you get a NullReferenceException right inside the type initializer.</p>',
      code: `public static ModelManager Instance = new ModelManager();

public ModelManager()
{
    _log = new FileStream("log.txt", FileMode.Append);
    SelectionService.Current.SelectionChanged += OnSelectionChanged;
}`,
      deep: '<p>The real cause sits in <code>InnerException</code>; the top-level message only says "The type initializer for \'ModelManager\' threw an exception". If the class has no explicit static constructor, the type is marked <code>beforefieldinit</code>, and the CLR may run the initialization at any moment before the first static field access, so its order relative to <code>SelectionService</code> is not guaranteed at all. In Unity with domain reload disabled (Enter Play Mode Options), statics survive exiting Play Mode: both a healthy and a "poisoned" type stay until scripts recompile.</p>'
    },
    {
      t: 'order',
      q: 'Put in order how one static line turns into a TypeInitializationException.',
      items: [
        'Code accesses ModelManager.Instance for the first time',
        'The CLR runs the ModelManager type initializer',
        'new ModelManager() is called',
        'SelectionService.Current is still null, so NullReferenceException',
        'The CLR wraps it in TypeInitializationException and remembers the failure'
      ],
      explain: 'The type initializer runs once. Its exception becomes "permanent": every later access to the type throws the same TypeInitializationException.'
    },
    {
      t: 'choice',
      q: 'The first access to ModelManager.Instance failed. What happens on a second access a minute later, when SelectionService.Current already exists?',
      options: ['TypeInitializationException again', 'Initialization runs again and succeeds', 'Instance returns null without an exception'],
      answer: 0,
      explain: 'The CLR does not retry a type initializer. The failure is remembered, and the type stays unusable for the rest of the process (domain) lifetime. That is why side effects in static initialization are so dangerous.',
      wrong: { 1: 'There is no retry: a static constructor runs at most once, even if it fails.', 2: 'It never gets to the field: accessing any static member of the type throws.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'The start of ModelManager: the singleton, the constructor and log writing. Find the lifecycle and resource bugs.',
      code: `public class ModelManager
{
    public static ModelManager Instance = new ModelManager();

    private FileStream _log;

    public event Action<ElementInfo> ElementSelected;

    public ModelManager()
    {
        _log = new FileStream("log.txt", FileMode.Append);
        SelectionService.Current.SelectionChanged += OnSelectionChanged;
    }

    private void OnSelectionChanged(int id)
    {
        var bytes = Encoding.UTF8.GetBytes("Selected " + id + "\\n");
        _log.Write(bytes, 0, bytes.Length);
    }
}`,
      bugs: [
        { lines: [0], title: 'Owns a FileStream but is not IDisposable', why: 'The class holds a file handle and has no way to close it: there is no Dispose, so nobody outside can release the resource.' },
        { lines: [2], title: 'Singleton: a public mutable field and risky static initialization', why: 'Any code can overwrite Instance. An exception in the constructor becomes a TypeInitializationException and poisons the type for good.' },
        { lines: [8], title: 'A public constructor on a singleton', why: 'Anyone can create a second instance: it opens log.txt again (IOException) and subscribes to the event twice.' },
        { lines: [10], title: 'The FileStream is never closed', why: 'The handle stays taken until the process ends, with FileShare.Read by default: a second instance or another process cannot open the file for writing. The relative path depends on the current directory.' },
        { lines: [11], title: 'A subscription in the constructor that nobody removes', why: 'If Current is still null, you get an NRE during type initialization. The subscription is never removed: SelectionService keeps the object alive, and this escapes from a half-built constructor.' },
        { lines: [17], title: 'Writes without Flush on the main thread', why: 'FileStream buffers data (4 KB by default): if the process crashes, the last log lines are lost. The synchronous write blocks whichever thread raised the event.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:0', 'flag:2', 'flag:8', 'flag:10', 'flag:11', 'check']
    },
    {
      t: 'learn',
      title: 'A file handle is a room key',
      body: '<p>Opening a file means getting a <b>room key</b> from the OS. While you hold the key, the OS knows the room is taken and decides who else may come in. Here the key is taken in the constructor and never given back.</p><p><code>new FileStream(path, FileMode.Append)</code> opens the file write-only with <code>FileShare.Read</code>: others may read, but not write. A second <code>new ModelManager()</code> or a second running process gets an <code>IOException</code>: "the file is being used by another process".</p>',
      code: `// this way the resource lives exactly as long as needed
using (var log = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read))
{
    log.Write(bytes, 0, bytes.Length);
}`,
      deep: '<p>The <code>FileStream(string, FileMode)</code> constructor uses <code>FileAccess.Write</code> for Append (ReadWrite for the other modes) and <code>FileShare.Read</code>, with a 4096-byte buffer. Sharing modes are strictly enforced on Windows; on Unix, .NET emulates them with advisory locks, so behavior there can differ. <code>SafeFileHandle</code> has a finalizer, so the GC will eventually close a "forgotten" stream, but not here: the object lives in a static field forever. A relative "log.txt" in Unity goes to the process current directory (the project folder in the editor, anyone\'s guess in a build, and on mobile you often cannot write there at all); the right place is <code>Application.persistentDataPath</code>.</p>'
    },
    {
      t: 'choice',
      q: 'A test writes var m = new ModelManager(); while Instance already exists. What most likely happens on Windows?',
      options: ['IOException: log.txt is already open for writing by the first instance', 'The second instance silently replaces Instance', 'Both instances write to the same log without problems'],
      answer: 0,
      explain: 'The first instance holds the file with FileShare.Read, so others may only read. A second FileStream opened for writing hits a sharing violation. Instance does not change: this is just one more object.',
      wrong: { 1: 'The constructor never writes to Instance. You get a second object next to it, not a replacement.', 2: 'Shared writing is forbidden by FileShare.Read, which is the default.' }
    },
    {
      t: 'learn',
      title: 'A subscription is a leash',
      body: '<p><code>Current.SelectionChanged += OnSelectionChanged</code> puts a delegate into the event, and the delegate holds a reference to <code>this</code>. That is a <b>leash</b> from SelectionService to ModelManager: as long as the event source lives, so does the subscriber, even if nobody needs it anymore.</p><p>Subscribing in the constructor also lets <code>this</code> escape before the object is fully built: an event can arrive while fields are not yet initialized.</p>',
      deep: '<p>For a static singleton the leak is less visible (it lives forever anyway), but it shows up as soon as a second instance, tests or a scene reload appear: old objects keep receiving events, and the handler runs twice. The rule: whoever subscribes also unsubscribes, symmetrically (Init/Dispose, in Unity OnEnable/OnDisable). Weak events (the weak event pattern) are a crutch for cases where you cannot control the subscriber lifetime.</p>'
    },
    {
      t: 'multi',
      q: 'What is wrong with subscribing SelectionService.Current.SelectionChanged += OnSelectionChanged right in the constructor? Select all.',
      options: [
        'If Current is still null, the constructor throws NullReferenceException',
        'There is no unsubscribe, so SelectionService keeps ModelManager alive',
        'this becomes visible outside before the constructor finishes',
        'The compiler forbids subscribing to events in a constructor'
      ],
      answer: [0, 1, 2],
      explain: 'Subscribing in a constructor is syntactically fine, but it is a hidden dependency on global state, a leak without unsubscribing, and an "escaping this". Move the subscription to an explicit Init and unsubscribe in Dispose.'
    },
    {
      t: 'blanks',
      q: 'Rewrite the singleton safely: the field cannot be overwritten, the constructor cannot be called from outside, the subscription can be removed.',
      code: `public sealed class ModelManager : IDisposable
{
    private static ___ Lazy<ModelManager> _instance =
        new Lazy<ModelManager>(() => new ModelManager());
    public static ModelManager Instance => _instance.Value;

    ___ ModelManager() { }   // no side effects

    public void Init(SelectionService selection) { /* store _selection, open the file, subscribe */ }

    public void Dispose()
    {
        _selection.SelectionChanged ___ OnSelectionChanged;
        _log.Dispose();
    }
}`,
      tiles: ['readonly', 'private', '-=', 'public', '+=', 'const'],
      answer: ['readonly', 'private', '-='],
      explain: 'readonly prevents overwriting the field, a private constructor prevents a second instance, and -= removes the leash. Everything risky moved into an explicit Init: if it fails, the type is not poisoned and the call can be retried.'
    },
    {
      t: 'learn',
      title: 'For seniors: Lazy remembers errors too',
      body: '<p><code>Lazy&lt;T&gt;</code> gives you laziness and thread safety, but in the default mode (<code>ExecutionAndPublication</code>) it <b>caches the factory exception</b>: if the constructor failed, every later <code>.Value</code> throws the same exception. The poisoning did not go away, it just moved from the type into the field.</p><p>So the main cure is not "Lazy instead of new" but <b>a constructor without side effects</b> plus explicit initialization.</p>',
      deep: '<p><code>LazyThreadSafetyMode.PublicationOnly</code> does not cache exceptions, but it allows several threads to run the factory in parallel. Even better is to drop the global singleton altogether: inject ModelManager through constructors (a DI container such as VContainer or Zenject in Unity) or from a scene composition root. Then the dependency on SelectionService is visible in the signature, it can be replaced in a test, and you control the creation order, not the CLR.</p>'
    },
    {
      t: 'match',
      q: 'Match the problem with the fix.',
      pairs: [
        ['public static Instance field', 'static readonly (or a get-only property)'],
        ['Public singleton constructor', 'private constructor'],
        ['FileStream never closed', 'IDisposable / using'],
        ['Subscription without unsubscribe', '-= in Dispose'],
        ['Side effects in the type initializer', 'Explicit Init after creation'],
        ['Relative log.txt path', 'Application.persistentDataPath']
      ]
    }
  ]
};

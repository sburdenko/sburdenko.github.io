/** Code review, unit 0 (ModelManager), final: the full listing. */
export default {
  id: 'rv.u0.boss',
  title: 'Final: ModelManager',
  sub: 'Find the bugs in the full listing',
  minutes: 12,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'hunt',
      task: 'This is the whole ModelManager sent for review. Flag as many bugs as you can: the mutable struct, the singleton, resources, loading, search, events and error handling. You need at least 16.',
      code: `public struct ElementInfo
{
    public int Id;
    public string Name;
    public Bounds Box;
    public List<int> ChildIds;

    public void Rename(string newName)
    {
        Name = newName;
    }
}

public class ModelManager
{
    public static ModelManager Instance = new ModelManager();

    private List<ElementInfo> _elements = new List<ElementInfo>();
    private Dictionary<object, ElementInfo> _byId = new Dictionary<object, ElementInfo>();
    private FileStream _log;
    private HttpClient _http;

    public event Action<ElementInfo> ElementSelected;

    public ModelManager()
    {
        _log = new FileStream("log.txt", FileMode.Append);
        SelectionService.Current.SelectionChanged += OnSelectionChanged;
    }

    public void Load(string url)
    {
        _http = new HttpClient();
        var json = _http.GetStringAsync(url).Result;
        var elements = JsonConvert.DeserializeObject<List<ElementInfo>>(json);

        foreach (var e in elements)
        {
            _elements.Add(e);
            _byId.Add(e.Id, e);
        }
    }

    public void RenameAll(string prefix)
    {
        foreach (var e in _elements)
        {
            e.Rename(prefix + e.Name);
        }
    }

    public List<ElementInfo> FindByName(string name)
    {
        var result = new List<ElementInfo>();
        for (int i = 0; i < _elements.Count; i++)
        {
            if (_elements[i].Name.ToLower().Contains(name.ToLower()))
                result.Add(_elements[i]);
        }
        return result;
    }

    public int CountClashes()
    {
        int count = 0;
        for (int i = 0; i < _elements.Count; i++)
            for (int j = 0; j < _elements.Count; j++)
                if (i != j && _elements[i].Box.Intersects(_elements[j].Box))
                    count++;
        return count;
    }

    private void OnSelectionChanged(int id)
    {
        try
        {
            var e = _byId[id];
            ElementSelected(e);
            var bytes = Encoding.UTF8.GetBytes("Selected " + id + " at " + DateTime.Now + "\\n");
            _log.Write(bytes, 0, bytes.Length);
        }
        catch (Exception) { }
    }
}`,
      bugs: [
        { lines: [0, 7, 9], title: 'Mutable struct with a mutator method', why: 'ElementInfo is copied on every List read, every pass and every assignment, and Rename changes only its own copy. Changes get lost silently, and copies in different places drift apart.' },
        { lines: [5], title: 'ChildIds: null by default and shared by copies', why: 'For default(ElementInfo) and when the JSON lacks the field, the list is null, so access throws NullReferenceException. All copies of the struct share the same list: half value, half reference.' },
        { lines: [15], title: 'Singleton: a public non-readonly field and risky static initialization', why: 'Anyone can overwrite Instance. An exception in the constructor becomes a TypeInitializationException, and the type stays poisoned for the rest of the process lifetime.' },
        { lines: [17], title: 'Shared collections without synchronization', why: 'If Load runs in the background while a selection arrives on the main thread, the List and the Dictionary are read during a write: a race, garbage or exceptions.' },
        { lines: [18], title: 'A dictionary keyed by object', why: 'Every int Id is boxed on insert and on every lookup, so every click allocates. The key type is not checked: long 5 will not find int 5.' },
        { lines: [20, 32], title: 'A new HttpClient on every Load', why: 'Each client keeps its own connection pool, and the old one is neither released nor reused. With frequent loads, sockets pile up and ports run out.' },
        { lines: [24], title: 'A public constructor on a singleton', why: 'A second instance can be created: it opens log.txt again (IOException because of FileShare.Read) and subscribes to selection once more.' },
        { lines: [26], title: 'The FileStream is never closed', why: 'There is no IDisposable, and the handle stays taken until the process ends. The relative path depends on the current directory, and an unflushed buffer is lost on a crash.' },
        { lines: [27], title: 'A subscription in the constructor with no unsubscribe', why: 'If SelectionService.Current is still null, you get an NRE inside type initialization. Nobody removes the subscription: the source keeps the object alive, and this escapes from a half-built constructor.' },
        { lines: [30, 33], title: 'Synchronous loading through .Result', why: 'The thread waits for the network: on Unity\'s main thread the game freezes. Errors arrive in AggregateException, there is no cancellation or timeout, and combined with your own async code a deadlock is possible.' },
        { lines: [34, 36], title: 'DeserializeObject can return null', why: 'For the JSON "null" or an empty response, elements is null, and foreach throws NullReferenceException.' },
        { lines: [38], title: 'Load clears nothing', why: 'A repeated call appends the elements to _elements again: duplicates in search and in clash counting.' },
        { lines: [39], title: 'Dictionary.Add throws mid-loop', why: 'A duplicate Id throws ArgumentException. Some elements are already in the list but not in the dictionary: the collections are out of sync, and the operation is not atomic.' },
        { lines: [45, 47], title: 'RenameAll changes copies', why: 'The foreach variable is a copy of the struct, Rename changes it, and the list stays the same. The method silently does nothing.' },
        { lines: [56], title: 'ToLower in a loop', why: 'Two new strings per element, and name.ToLower() is recomputed every time. It depends on the culture (the Turkish I) and throws NullReferenceException on an element without a name.' },
        { lines: [66, 67], title: 'Every pair is counted twice', why: 'The inner loop starts at j = 0 and checks both (i, j) and (j, i): the result is twice the truth. Use j = i + 1, and a spatial index for large models.' },
        { lines: [76], title: 'Indexer with an unknown id', why: '_byId[id] throws KeyNotFoundException if there is no such element. Use TryGetValue.' },
        { lines: [77], title: 'The event is raised without a null check', why: 'With no subscribers, ElementSelected is null, so NullReferenceException. A subscriber exception aborts the method, and the log is not written.' },
        { lines: [78, 79], title: 'Logging: DateTime.Now, concatenation, a synchronous write', why: 'Local time and its format depend on the time zone and culture, and every click allocates strings and an array. The write is synchronous, with no Flush and no lock.' },
        { lines: [81], title: 'An empty catch (Exception)', why: 'It swallows every error above without a trace: selection "just doesn\'t work", and the log and console are empty.' }
      ],
      goal: { min: 16, maxFalse: 3 },
      solve: ['flag:0', 'flag:5', 'flag:15', 'flag:17', 'flag:18', 'flag:20', 'flag:24', 'flag:26', 'flag:27', 'flag:30', 'flag:34', 'flag:38', 'flag:39', 'flag:45', 'flag:56', 'flag:66', 'flag:76', 'flag:77', 'flag:78', 'flag:81', 'check']
    },
    {
      t: 'multi',
      q: 'Which bugs in the listing throw no exceptions at all and simply give a wrong result? Select all.',
      options: [
        'RenameAll changes copies of the struct',
        'CountClashes counts every pair twice',
        'The object key in the dictionary boxes an int',
        'A repeated Load with the same data'
      ],
      answer: [0, 1, 2],
      explain: 'RenameAll silently does nothing, CountClashes silently doubles the answer, boxing silently creates garbage. A repeated Load is the loud one: Dictionary.Add throws ArgumentException on the very first duplicate.'
    },
    {
      t: 'tapline',
      q: 'On which line is the NullReferenceException thrown that becomes a TypeInitializationException if SelectionService does not exist yet?',
      code: `public static ModelManager Instance = new ModelManager();

public ModelManager()
{
    _log = new FileStream("log.txt", FileMode.Append);
    SelectionService.Current.SelectionChanged += OnSelectionChanged;
}`,
      answer: 5,
      explain: 'Accessing Current.SelectionChanged while Current == null throws an NRE. Since the constructor is called from a static field initializer, the CLR wraps it in TypeInitializationException, and the type becomes unusable for the rest of the process lifetime.'
    },
    {
      t: 'choice',
      q: 'Which of these does NOT save Load from socket exhaustion?',
      options: [
        'using (var c = new HttpClient()) per request',
        'One static readonly HttpClient for the whole app',
        'IHttpClientFactory, which reuses handlers'
      ],
      answer: 0,
      explain: 'Dispose closes the connections, but closed sockets still linger in TIME_WAIT for a while, and clients do not share a connection pool. Reusing one client or a handler factory is the right way.',
      wrong: { 1: 'This is the recommended option: connections get reused. In modern .NET, add PooledConnectionLifetime so DNS changes are noticed.', 2: 'The factory keeps and reuses handlers with their pools; that is what it was built for.' }
    },
    {
      t: 'blanks',
      q: 'Two one-line fixes: make the element a reference type and raise the event safely.',
      code: `public ___ ElementInfo
{
    public int Id;
    public string Name;
}

// in OnSelectionChanged:
ElementSelected___Invoke(e);`,
      tiles: ['class', '?.', 'struct', '.', 'readonly'],
      answer: ['class', '?.'],
      explain: 'With a class, foreach, the List indexer and the event all pass a reference to the same object, and RenameAll starts working. The ?. operator raises the event only if there are subscribers and reads the field once.'
    },
    {
      t: 'order',
      q: 'Put the lifecycle of the fixed ModelManager in order.',
      items: [
        'Create the object: a constructor without side effects',
        'Init: open the log and subscribe to SelectionService',
        'await LoadAsync: download, validate and swap the collections at once',
        'Work: search, selection, clash counting',
        'Dispose: unsubscribe from the event and close the log'
      ],
      explain: 'Everything that can fail or holds resources moved out of the constructor into explicit steps. Every "take" (subscription, file) has a matching "give back" in Dispose.'
    },
    {
      t: 'match',
      q: 'Match the bug with the fix.',
      pairs: [
        ['Mutable struct ElementInfo', 'class or readonly struct'],
        ['new HttpClient() in Load', 'static readonly HttpClient'],
        ['.Result', 'async Task LoadAsync + await'],
        ['Dictionary<object, ...>', 'Dictionary<int, ...>'],
        ['_byId[id]', 'TryGetValue'],
        ['catch (Exception) { }', 'A targeted catch with logging']
      ]
    },
    {
      t: 'choice',
      q: 'Why is this listing a good interview task, even though it compiles without a single error?',
      options: [
        'Most of its bugs show up at runtime: struct copies, resources, networking, swallowed errors',
        'The C# compiler will find these mistakes during the build anyway',
        'These are only style issues, they do not affect behavior'
      ],
      answer: 0,
      explain: 'The compiler only catches a direct assignment to a field of a copy (CS1654, CS1612). Everything else (silent copies, leaked handles and sockets, blocking, races and an empty catch) is visible only to someone who understands how the code behaves at runtime.',
      wrong: { 1: 'Calling a mutating method on a copy, .Result, an empty catch and new HttpClient are not errors to the compiler.', 2: 'Quite the opposite: nearly every item changes behavior, from a no-op RenameAll to a frozen game.' }
    }
  ]
};

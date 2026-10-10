/** Code review, unit 0 (ModelManager), lesson 3: HttpClient, .Result, atomic loading, an object key. */
export default {
  id: 'rv.u0.l3',
  title: 'Loading: HttpClient, .Result and atomicity',
  sub: 'The game freezes, sockets run out, data drifts apart',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Story: three complaints about one button',
      body: '<p>The "Load model" button calls <code>Load(url)</code>. QA files three tickets:</p><p>1. While the model loads, <b>the game freezes</b>.<br>2. After frequent reloads, connection errors pour in.<br>3. Loading the same model again throws <code>ArgumentException</code>, and search finds elements that are missing from the dictionary.</p><p>All three live in nine lines of one method.</p>',
      code: `public void Load(string url)
{
    _http = new HttpClient();
    var json = _http.GetStringAsync(url).Result;
    var elements = JsonConvert.DeserializeObject<List<ElementInfo>>(json);

    foreach (var e in elements)
    {
        _elements.Add(e);
        _byId.Add(e.Id, e);
    }
}`
    },
    {
      t: 'learn',
      title: 'HttpClient is a phone exchange, not a call',
      body: '<p><code>HttpClient</code> is meant to be an <b>exchange</b> you set up once and call through many times: inside it has a connection pool and reuses sockets that are already open.</p><p>A new <code>HttpClient</code> per call is a new exchange with its own pool. Old connections are not reused, and closed ones linger for minutes in <code>TIME_WAIT</code>. With frequent calls you run out of local ports: <code>SocketException</code>, even though the network is fine.</p>',
      deep: '<p>Here the old client is not even disposed: its connections close only when its finalizer runs, whenever the GC gets to it. But <code>using (var c = new HttpClient())</code> per request is no cure either: the sockets still go to TIME_WAIT. The right way is one long-lived instance (static) or <code>IHttpClientFactory</code>. In modern .NET a long-lived client has its own trap: it does not notice DNS changes; <code>SocketsHttpHandler.PooledConnectionLifetime</code> fixes that. In Unity, networking is often written with <code>UnityWebRequest</code>; on WebGL <code>HttpClient</code> does not work at all (no sockets).</p>'
    },
    {
      t: 'choice',
      q: 'Load is called every couple of seconds. What will the line _http = new HttpClient() eventually cause?',
      options: ['Sockets pile up, and new connections start failing with SocketException', 'Nothing: HttpClient is a lightweight object with no resources', 'A compiler warning that stops the build'],
      answer: 0,
      explain: 'Each client opens its own connections and does not share them. Closed connections keep the port in TIME_WAIT for a while. Under load this is port exhaustion, a classic .NET mistake.',
      wrong: { 1: 'Inside HttpClient there is a handler with a connection pool and OS sockets. It is a heavy object.', 2: 'The compiler notices nothing here. The failure only shows up at runtime, under load.' }
    },
    {
      t: 'learn',
      title: '.Result: standing at the door until the parcel arrives',
      body: '<p><code>GetStringAsync</code> is a delivery order: it immediately returns a "receipt" (a Task). <code>.Result</code> means "I will stand at the door doing nothing until it arrives". If the one standing is Unity\'s <b>main thread</b>, the whole game freezes: no frames, no input.</p><p>The second problem: the error does not arrive as is but wrapped in <code>AggregateException</code>, and <code>catch (HttpRequestException)</code> will not catch it.</p>',
      code: `// bad
var json = _http.GetStringAsync(url).Result;

// good
var json = await Http.GetStringAsync(url);`,
      deep: '<p><code>HttpClient</code> itself uses <code>ConfigureAwait(false)</code> internally, so this exact line usually "only" freezes the thread for the duration of the request. But wrap the call in your own async method without <code>ConfigureAwait(false)</code>, call <code>.Result</code> on it from the main thread, and you get the classic deadlock: the continuation waits for the main thread through Unity\'s <code>SynchronizationContext</code>, and the main thread waits for the continuation. <code>.GetAwaiter().GetResult()</code> does not wrap the exception in AggregateException, but it blocks just the same, so it is not a fix.</p>'
    },
    {
      t: 'choice',
      q: 'The server returned 404. Which exception reaches the caller of Load?',
      code: `var json = _http.GetStringAsync(url).Result;`,
      options: ['AggregateException with an HttpRequestException inside', 'HttpRequestException as is', 'None: Result returns an empty string'],
      answer: 0,
      explain: 'Task.Result wraps the task error in AggregateException. The real cause is in InnerException. With await you would get the original HttpRequestException.',
      wrong: { 1: 'That is what await would give you. The blocking .Result wraps the exception.', 2: 'GetStringAsync checks the status code and fails the task for 404.' }
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'The fields and the load method of ModelManager. Find the bugs: network, blocking, JSON data, atomicity and the key type.',
      code: `private List<ElementInfo> _elements = new List<ElementInfo>();
private Dictionary<object, ElementInfo> _byId = new Dictionary<object, ElementInfo>();
private HttpClient _http;

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
}`,
      bugs: [
        { lines: [1], title: 'A dictionary keyed by object', why: 'Every int Id is boxed on insert and on every lookup: extra allocations. Type safety is gone too: store a long and you will not find it by int.' },
        { lines: [6], title: 'A new HttpClient on every call', why: 'Each client starts its own connection pool, and the old one is never released. With frequent loads, sockets pile up and ports run out.' },
        { lines: [4, 7], title: 'Synchronous loading through .Result', why: 'The thread stands still during the request: on Unity\'s main thread the game freezes. Errors arrive in AggregateException, and there is no cancellation or timeout.' },
        { lines: [8, 10], title: 'DeserializeObject can return null', why: 'For the JSON "null" or an empty response the result is null, and foreach throws NullReferenceException.' },
        { lines: [12], title: 'A repeated Load duplicates elements', why: 'The method clears nothing: a second call appends the same elements to _elements again.' },
        { lines: [13], title: 'Add throws in the middle of the loop', why: 'On a duplicate Id, Dictionary.Add throws ArgumentException. Some elements are already in _elements but not in _byId: the collections are out of sync.' }
      ],
      goal: { min: 5, maxFalse: 2 },
      solve: ['flag:1', 'flag:4', 'flag:6', 'flag:8', 'flag:12', 'flag:13', 'check']
    },
    {
      t: 'multi',
      q: 'The model is already loaded. Load is called a second time with the same JSON. What happens? Select all.',
      options: [
        '_elements grows by one element',
        '_byId stays the same',
        'The caller gets an ArgumentException',
        '_elements doubles'
      ],
      answer: [0, 1, 2],
      explain: 'The first element makes it into _elements, then _byId.Add on an existing Id throws ArgumentException and the loop stops. The list has N+1 elements, the dictionary has N. A "half-done" operation is exactly what a lack of atomicity looks like.'
    },
    {
      t: 'learn',
      title: 'Atomicity: pack a new box next to the old one',
      body: '<p>Do not move items one by one into a box people are already taking things from. Pack a <b>new box next to it</b>, check it, and only then swap it in for the old one in a single move.</p><p>Then any error (network, bad JSON, a duplicate Id) leaves the old data intact, and a repeated call creates no duplicates.</p>',
      deep: '<p>Swapping two fields (<code>_elements = list; _byId = byId;</code>) is atomic for a single thread. If readers live on other threads, they might see the new list with the old dictionary; then keep both in one immutable snapshot object and swap a single reference (<code>Volatile.Write</code>/<code>Interlocked.Exchange</code>). In Unity, the continuation after <code>await</code> returns to the main thread by default, so the swap happens where the data is read, and there is no race.</p>'
    },
    {
      t: 'blanks',
      q: 'Build a correct load: one client for the whole app and a dictionary without boxing.',
      code: `private static ___ HttpClient Http = new HttpClient();

public async Task LoadAsync(string url, CancellationToken ct)
{
    using var resp = await Http.GetAsync(url, ct);
    resp.EnsureSuccessStatusCode();
    var json = await resp.Content.ReadAsStringAsync();
    var list = JsonConvert.DeserializeObject<List<ElementInfo>>(json)
               ?? new List<ElementInfo>();

    var byId = new Dictionary<___, ElementInfo>();
    foreach (var e in list)
    {
        if (byId.ContainsKey(e.Id)) throw new InvalidDataException("Duplicate Id " + e.Id);
        byId.Add(e.Id, e);
    }

    _elements = list;   // swap at once, after every check
    _byId = byId;
}`,
      tiles: ['readonly', 'int', 'object', 'const', 'long'],
      answer: ['readonly', 'int'],
      explain: 'One static readonly client reuses connections. Dictionary<int, ...> does not box keys. The new collections are built separately and swapped in only after every check, so an error never leaves the data "half loaded".'
    },
    {
      t: 'learn',
      title: 'object as a key: every number in its own box',
      body: '<p>To put an <code>int</code> where an <code>object</code> is expected, the runtime <b>boxes</b> the number into a box on the heap. <code>Dictionary&lt;object, ...&gt;</code> does this on every <code>Add</code> and every <code>_byId[id]</code>: garbage for the GC on every lookup.</p><p>It works: a boxed int is compared by value. But the compiler no longer checks the key type.</p>',
      code: `_byId.Add(5, e);           // the key is a boxed int
_byId.ContainsKey(5L);     // false: long 5 is not int 5`,
      deep: '<p><code>Int32.Equals(object)</code> returns true only if the argument is also a boxed <code>int</code>; a boxed <code>long</code> or <code>short</code> with the same number is not equal. <code>Dictionary&lt;int, T&gt;</code> uses <code>EqualityComparer&lt;int&gt;.Default</code>, which works with int directly, without boxing. In Unity this shows up in the Profiler as GC Alloc in hot spots like the selection handler.</p>'
    },
    {
      t: 'choice',
      q: 'What does the last line return?',
      code: `var d = new Dictionary<object, string>();
d.Add(7, "pipe");
short key = 7;
bool found = d.ContainsKey(key);`,
      options: ['false', 'true', 'It throws InvalidCastException'],
      answer: 0,
      explain: 'The key is a boxed int 7, and the lookup uses a boxed short 7. These are different types, and Int32.Equals(object) returns false. With Dictionary<int, string>, the short would widen to int implicitly, and the lookup would succeed.',
      wrong: { 1: 'The numbers are equal, but they are boxed as different types. For an object key, those are different keys.', 2: 'There is no cast here: the dictionary just compares objects with Equals.' }
    },
    {
      t: 'order',
      q: 'Put the steps of a reliable model reload in order.',
      items: [
        'Download the JSON asynchronously with the shared HttpClient (with a cancellation token)',
        'Deserialize and replace null with an empty list',
        'Build a new dictionary, checking for duplicate Ids',
        'Swap _elements and _byId at once',
        'Notify subscribers that the model has been updated'
      ],
      explain: 'Everything that can fail happens before the swap. Subscribers are called last, once the data is consistent.'
    },
    {
      t: 'match',
      q: 'Match the line of Load with its problem.',
      pairs: [
        ['_http = new HttpClient()', 'Socket exhaustion'],
        ['.Result', 'A frozen main thread'],
        ['DeserializeObject(...)', 'May return null'],
        ['_elements.Add without clearing', 'Duplicates on reload'],
        ['_byId.Add(e.Id, e)', 'ArgumentException mid-loop'],
        ['Dictionary<object, ...>', 'Boxing an int on every lookup']
      ]
    }
  ]
};

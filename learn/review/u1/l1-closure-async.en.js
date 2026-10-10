/** Code review, unit 1 (ClashService), lesson 1: loop closures, async void, shared state. */
export default {
  id: 'rv.u1.l1',
  title: "Loop closures and async void",
  sub: "Why the service found zero clashes",
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: "Story: zero clashes",
      body: "<p>A building model has hundreds of pipes and beams that cross each other. <code>ClashService</code> starts 8 tasks, and each one checks its own \"bucket\" of elements. The run finishes without errors and reports: <b>no clashes</b>. But there are clashes.</p><p>This is the sneakiest kind of bug: nothing crashed, the answer looks fine, it is just wrong. Let's see where it comes from.</p>"
    },
    {
      t: 'learn',
      title: "A lambda holds the box, not the value",
      body: "<p>A lambda does not copy a variable. It <b>remembers the box</b> the variable lives in. In a <code>for</code> loop there is one box <code>i</code> for all iterations. The task from <code>Task.Run</code> peeks into the box only when the thread pool gets to it, and by then the eight-iteration loop has usually finished. The box holds <code>8</code>.</p><p>In <code>foreach</code> every iteration gets a fresh box (since C# 5), so that trap does not exist there.</p>",
      code: `for (int i = 0; i < 8; i++)
{
    tasks.Add(Task.Run(() => ProcessChunk(elements, i)));
}
// every lambda looks at the same i`,
      deep: "<p>The compiler hoists the captured variable into a hidden closure class (a display class). With <code>for</code>, the variable is declared before the loop body, so there is one instance. With <code>foreach</code> (since C# 5) and with variables declared inside the body, a new instance is created per iteration. The behavior is non-deterministic: a task that managed to start before the next <code>i++</code> sees a smaller number. That is why the bug \"floats\" between runs.</p>"
    },
    {
      t: 'choice',
      q: "What will ProcessChunk most often receive in the chunk parameter?",
      code: `for (int i = 0; i < 8; i++)
    tasks.Add(Task.Run(() => ProcessChunk(elements, i)));`,
      options: ["8 for every task", "0, 1, 2, ... 7 in order", "Each gets its own number, but in random order"],
      answer: 0,
      explain: "By the time the tasks start, the loop has usually finished, and the shared variable is 8. The filter <code>e.Id % 8 == 8</code> is never true, so no pairs are found at all.",
      wrong: { 1: "That would happen if every lambda saw its own value. But there is one box for all.", 2: "Random order would need copies. Here the variable is shared, so almost every task sees the final value." }
    },
    {
      t: 'rig', rig: 'hunt',
      task: "Here is the launch and the processing of one bucket. Find the bugs: they are about closures, async, lazy enumeration and shared state.",
      code: `public async void RunAsync(IEnumerable<Element> elements)
{
    var tasks = new List<Task>();
    for (int i = 0; i < 8; i++)
    {
        tasks.Add(Task.Run(() => ProcessChunk(elements, i)));
    }
    await Task.WhenAll(tasks);
    Completed?.Invoke();
}

private void ProcessChunk(IEnumerable<Element> elements, int chunk)
{
    var mine = elements.Where(e => e.Id % 8 == chunk);
    foreach (var a in mine)
    {
        foreach (var b in mine)
        {
            if (a.Id < b.Id && a.Bounds.Intersects(b.Bounds))
            {
                _clashes.Add(new Clash { A = a, B = b });
                _processed++;
            }
        }
    }
}`,
      bugs: [
        { lines: [0], title: "async void", why: "The caller cannot wait for completion or catch the exception. If ProcessChunk throws, Completed never fires, and the error goes to the SynchronizationContext: in Unity it is just a line in the console, in .NET without a context the process crashes." },
        { lines: [5], title: "Closure over the loop variable i", why: "Tasks see the shared i, usually already 8. The chunk filter selects nothing, and the service silently finds zero clashes." },
        { lines: [13], title: "Id % 8 buckets split the pairs", why: "Elements from different buckets are never compared with each other, so some clashes can never be found. For negative Ids the remainder is negative too." },
        { lines: [14, 16], title: "Lazy sequence enumerated many times", why: "mine is a Where recipe, not a list. The inner loop re-runs the filter for every outer element: n² predicate calls, and if the source is lazy too, repeated computation." },
        { lines: [20], title: "Race on List.Add", why: "List<T> is not thread-safe. Eight threads corrupt its internal array at the same time: items get lost, exceptions happen." },
        { lines: [21], title: "Non-atomic counter", why: "The ++ operation is read, add, write. Threads overwrite each other's values, so the count ends up too low. Also, the name _processed promises one thing but counts another." }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:0', 'flag:5', 'flag:13', 'flag:14', 'flag:20', 'flag:21', 'check']
    },
    {
      t: 'blanks',
      q: "Fix the closure: every task needs its own copy of the number.",
      code: `for (int i = 0; i < 8; i++)
{
    int chunk = ___;
    tasks.Add(Task.Run(() => ProcessChunk(elements, ___)));
}`,
      tiles: ['i', 'chunk', '8', 'elements'],
      answer: ['i', 'chunk'],
      explain: "The copy is declared inside the loop body, so each iteration gets a new box. The lambda must use the copy, not <code>i</code>."
    },
    {
      t: 'learn',
      title: "async void: a call with no callback number",
      body: "<p><code>async Task</code> returns a \"receipt\": you can wait for completion and learn how it ended. <code>async void</code> gives no receipt. The caller cannot <code>await</code>, and a failure has nobody to catch it.</p><p>There is one legitimate use: event handlers (in Unity that includes message methods like <code>async void Start()</code>). Everything else should be <code>async Task</code>.</p>",
      code: `// bad
public async void RunAsync(...)

// good
public async Task RunAsync(...)`,
      deep: "<p>An exception from <code>async void</code> has no Task to live in, so it is rethrown through the <code>SynchronizationContext</code> captured when the method started. In Unity that is <code>UnitySynchronizationContext</code>: the exception runs in its queue on the main thread, Unity logs it to the console, and the game keeps going as if nothing happened. Without a context (a console app, a pool thread) it is thrown on the thread pool as unhandled, and the .NET process terminates. Either way, the code after the failed <code>await</code> never runs: <code>Completed</code> never fires, and whoever waits for it waits forever. Also, a test or the caller cannot await such a method.</p>"
    },
    {
      t: 'choice',
      q: "What changes for the caller once RunAsync becomes async Task?",
      options: ["It can await and catch exceptions with try/catch", "The method gets faster", "The method starts running on the main thread"],
      answer: 0,
      explain: "A Task gives the caller a point to wait on and a channel for errors. Speed and thread are not affected.",
      wrong: { 1: "Speed is the same. Only what you get back changes.", 2: "The executing thread is decided by await and the synchronization context, not by the return type." }
    },
    {
      t: 'learn',
      title: "Lazy filters and a shared list",
      body: "<p><code>Where</code> does not filter, it writes down a <b>recipe</b>. Every <code>foreach</code> over it cooks the dish again. Nest one <code>foreach</code> in another and the recipe runs once per outer element.</p><p>The second lesson from the kitchen: eight cooks must not write into one notebook at the same time. Either queue up for the notebook (<code>lock</code>), or give each cook their own notebook and glue them together later.</p>",
      code: `var all = elements.ToList();            // once
var mine = all.Where(...).ToList();     // a ready list
var local = new List<Clash>();          // one per task`
    },
    {
      t: 'multi',
      q: "Which operations are unsafe when several threads run them on shared fields? Pick all that apply.",
      options: ['_clashes.Add(clash)', '_processed++', 'var n = 5;  (a local variable)', 'Interlocked.Increment(ref _processed)'],
      answer: [0, 1],
      explain: "Add and ++ read and write shared state in several steps. A local variable belongs to its own thread, and Interlocked is atomic."
    },
    {
      t: 'order',
      q: "Put the steps of a reliable RunAsync in order.",
      items: [
        "Turn elements into a list once (ToList)",
        "In the loop, make a local copy of the bucket number",
        "Start 8 tasks, each with its own local list",
        "Wait for all of them with await Task.WhenAll",
        "Merge the local lists into _clashes"
      ],
      explain: "First pin down the data and the numbers, then work in parallel with no shared writes, and only after waiting for everyone collect the result on one thread."
    },
    {
      t: 'match',
      q: "Match each bug with its fix.",
      pairs: [
        ["for variable inside a lambda", "A local copy inside the body"],
        ["async void", "async Task"],
        ["Lazy Where in a double loop", "ToList() once"],
        ["List.Add from several threads", "lock or local lists"],
        ["_processed++", "Interlocked.Increment"]
      ]
    },
    {
      t: 'learn',
      title: "For seniors: what else is wrong with the split",
      body: "<p>Even after the fixes, the algorithm has a hole. Since pairs are compared only inside a bucket, elements from <b>different buckets</b> never meet. It is better to split the <b>outer</b> loop between tasks (who gets which <code>a</code>) and let the inner loop run over all <code>b</code>. Even better, avoid n² entirely: build a spatial index (a grid, a BVH) and test only neighbors.</p>",
      deep: "<p>Note that splitting by <code>Id % 8</code> can also be uneven (if Ids are issued in steps of 8, say, every element lands in one bucket), and for negative Ids the remainder in C# is negative, so they fall outside 0...7 altogether. For balanced load, prefer <code>Parallel.For</code> with ranges or a <code>Partitioner</code>.</p>"
    }
  ]
};

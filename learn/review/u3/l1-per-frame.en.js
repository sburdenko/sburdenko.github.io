/** Section 3, lesson 1 of the "Code review: find the bug" course. */
export default {
  id: 'rv.u3.l1',
  title: 'Allocations in Update',
  sub: 'LINQ, GetComponent, strings and WaitForSeconds every frame',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'A pile of trash every frame',
      body: '<p>Picture a kitchen where the cook drops a wrapper on the floor after <b>every</b> dish. A few dishes, nobody notices. But every so often a cleaner walks in and stops the whole kitchen for a moment. That cleaner is the <b>garbage collector (GC)</b>.</p><p>A game draws 60 frames a second, so a frame has only about 16 ms. If <code>Update</code> creates new objects every frame (lists, strings, delegates), garbage piles up and the cleaner arrives in the middle of a frame. The game stutters.</p><p>In this lesson you hunt through <code>ClashMarkers.Update</code> for anything that makes garbage or does expensive work <b>every frame</b>.</p>',
      deep: '<p>Unity uses the Boehm collector: it is non-generational and does not compact the heap. The incremental GC (an option since Unity 2019.1) spreads the pause over several frames, but it does not remove the cost of the allocations or of heap scanning. So when you review a hot path (Update, physics, short-step coroutines) the goal is zero allocations in steady state.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'This method runs every frame. Flag the lines that allocate or do needlessly expensive work every frame (the .material line is the topic of the next lesson, but it is a bug too).',
      code: `private void Update()
{
    var visible = _markers
        .Where(m => m.activeSelf)
        .OrderBy(m => Vector3.Distance(Camera.main.transform.position, m.transform.position))
        .ToList();

    for (int i = 0; i < visible.Count; i++)
    {
        var renderer = visible[i].GetComponent<Renderer>();
        renderer.material.color = i < 10 ? Color.red : Color.gray;
        visible[i].GetComponentInChildren<TextMesh>().text = "Clash " + (i + 1);
    }
}`,
      bugs: [
        { lines: [2, 3, 5], title: 'LINQ chain in Update', why: 'Every frame, Where, OrderBy and ToList create iterator objects, sort buffers and a new list with its array. That is steady garbage and regular GC pauses.' },
        { lines: [4], title: 'Camera.main and Distance (with a square root) inside the sort key', why: 'The key is computed for every marker every frame, and each time it reads Camera.main (a tag lookup in old Unity versions). Distance also does a square root. Read the camera position once and compare squared distances.' },
        { lines: [9], title: 'GetComponent for every marker every frame', why: 'A component lookup is not free. With hundreds of markers it eats a visible share of the frame. Cache the reference when the marker is created.' },
        { lines: [10], title: 'renderer.material makes a copy of the material', why: 'The first access clones the material for this renderer: leaked copies and broken batching. The materials lesson covers it in detail.' },
        { lines: [11], title: 'String and TextMesh work every frame', why: 'Concatenation creates a new string per marker per frame, and assigning text every frame pushes the string into the native TextMesh, which may rebuild its mesh even though the text is the same. Plus one more expensive GetComponentInChildren.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:2', 'flag:4', 'flag:9', 'flag:11', 'check']
    },
    {
      t: 'learn',
      title: 'What LINQ really does',
      body: '<p>LINQ looks like one line, but a whole workshop runs underneath:</p><p><b>Where</b> creates an iterator object and holds a delegate. <b>OrderBy</b> copies all elements into a buffer, computes a key for each one and keeps an array of keys. <b>ToList</b> allocates a new list and its backing array.</p><p>Once, while loading a level, that is fine. <b>Every frame</b> it means dozens of small objects for the GC to clean up.</p><p>The replacement: a reusable <code>List</code> field (<code>Clear()</code> and refill in a plain loop) and an in-place sort.</p>',
      deep: '<p>The compiler (Roslyn) caches a lambda that captures nothing in a static field. Neither lambda in this Update captures anything (Camera.main is a static property), so the garbage here comes from the iterators, the OrderBy buffer and the list, not from delegates. A lambda that does capture something (say, a local camera position) allocates a closure object and a new delegate on every call of the method. So <code>list.Sort((a, b) => …)</code> with a captured local allocates too. In the hottest code, keep the camera position in a field and precompute squared distances into a parallel array.</p><p>One more detail: <code>OrderBy</code> computes the key <b>once per element</b>, not once per comparison, so Camera.main is read n times here, not n log n. Still n times too many.</p>'
    },
    {
      t: 'choice',
      q: 'There are 200 markers and the list must be ordered by distance to the camera every frame. What is best?',
      options: [
        'Keep the LINQ and wrap it in try/catch',
        'Keep a list field, refill it without LINQ, compare squared distances, and skip the sort when the camera barely moved',
        'Run the LINQ on a background thread with Task.Run',
        'Call GC.Collect() at the end of Update'
      ],
      answer: 1,
      explain: 'Remove the cause of the garbage and the extra work. Do not hide it.',
      wrong: {
        0: 'try/catch changes nothing about allocations.',
        2: 'You may touch Transform and GameObject only from the main thread, and the garbage would not disappear anyway.',
        3: 'Forcing a collection every frame causes huge pauses on its own.'
      }
    },
    {
      t: 'learn',
      title: 'Cache it: once instead of a thousand times',
      body: '<p>A good reviewer asks about every line in Update: "Could we compute this <b>earlier</b>?"</p><p><code>GetComponent</code>, <code>GetComponentInChildren</code>, <code>Camera.main</code>, <code>Find…</code>: fetch them once in <code>Awake</code> or when the marker is created, and keep them in a field. Prebuild the labels "Clash 1", "Clash 2"… in an array and assign them only when the value has <b>changed</b>.</p><p>You do not need the root to compare distances: <code>sqrMagnitude</code> goes up and down exactly like the distance.</p>',
      deep: '<p>Since Unity 2020.2, <code>Camera.main</code> is cached inside the engine and is cheap. In older versions it was a <code>FindGameObjectWithTag</code> on every call. Do not rely on that in code that builds on several versions. Caching is still better, because it also makes the "no camera" case (null) visible.</p>'
    },
    {
      t: 'blanks',
      q: 'Let us finish the cache: when a marker is created, fetch its renderer and text once. Fill in the blanks.',
      code: `private struct MarkerView
{
    public Renderer Renderer;
    public TextMesh Label;
}

private readonly List<MarkerView> _views = new List<MarkerView>();

private void Register(GameObject go)
{
    _views.Add(new MarkerView
    {
        Renderer = go.___<Renderer>(),
        Label = go.___<TextMesh>()
    });
}`,
      tiles: ['GetComponent', 'GetComponentInChildren', 'FindObjectOfType', 'AddComponent'],
      answer: ['GetComponent', 'GetComponentInChildren'],
      explain: 'The renderer sits on the marker itself and the text on a child object. Do the expensive lookup once at registration, then use the ready struct in Update.'
    },
    {
      t: 'blanks',
      q: 'A coroutine waits 0.05 seconds in a loop. Remove the allocation on every iteration.',
      code: `private static readonly WaitForSeconds PulseDelay = ___ WaitForSeconds(0.05f);

private IEnumerator Pulse()
{
    while (true)
    {
        // ...
        yield return ___;
    }
}`,
      tiles: ['new', 'PulseDelay', 'Pulse', 'default'],
      answer: ['new', 'PulseDelay'],
      explain: 'WaitForSeconds is a plain class, so new in a loop makes garbage 20 times a second. One shared instance is safe to reuse.'
    },
    {
      t: 'choice',
      q: 'The method is called with a plain List<ClashScore>. What allocates here?',
      code: `public float TotalWeight(IList<ClashScore> scores)
{
    float total = 0f;
    foreach (var s in scores)
        total += s.Weight;
    return total;
}`,
      options: [
        'Nothing: the List<T> enumerator is a struct',
        'The enumerator gets boxed into an object: foreach goes through the interface and calls IEnumerable<T>.GetEnumerator()',
        'All the list elements are copied'
      ],
      answer: 1,
      explain: 'A direct foreach over a List<T> does not allocate, because the compiler uses the struct enumerator. Through the IList<T> interface it becomes a boxed object, and you get garbage on every call.',
      wrong: {
        0: 'That is true only for a foreach over a variable of type List<T>. Here the type is an interface.',
        2: 'Nothing is copied. Only the enumerator is allocated.'
      }
    },
    {
      t: 'tapline',
      q: 'Which line creates garbage on every Update call?',
      code: `private void Update()
{
    transform.position += Vector3.up * Time.deltaTime;
    float d = (target.position - transform.position).sqrMagnitude;
    var near = new List<Collider>();
    if (d < 4f) _isNear = true;
}`,
      answer: 4,
      explain: 'new List<...>() is a heap object that lives for one frame. Vector3 and float are structs that live on the stack and make no garbage.'
    },
    {
      t: 'multi',
      q: 'Which of these remove allocations in a hot path? Select all that apply.',
      options: [
        'static readonly WaitForSeconds instead of new in a loop',
        'for by index instead of foreach over IList<T>',
        'A prebuilt array of "Clash 1"... strings',
        'Calling GC.Collect() every frame',
        'Moving the LINQ to a background thread'
      ],
      answer: [0, 1, 2],
      explain: 'The first three remove the allocations themselves. GC.Collect every frame causes huge pauses, and you cannot move code that touches scene objects to a background thread.'
    },
    {
      t: 'match',
      q: 'Match the problem to the fix',
      pairs: [
        ['LINQ chain in Update', 'Reusable list and a plain loop'],
        ['GetComponent every frame', 'Cache the references at creation'],
        ['new WaitForSeconds in a loop', 'One static readonly instance'],
        ['"Clash " + (i + 1)', 'Array of ready strings, assign on change'],
        ['Vector3.Distance for comparing', 'sqrMagnitude']
      ]
    },
    {
      t: 'learn',
      title: 'How to prove there is garbage',
      body: '<p>In a review, "I feel it is slow" is weak and "here is the number" is strong. Open <b>Profiler → CPU</b>, enable the <b>GC Alloc</b> column and look at a frame: how many bytes, and from where.</p><p>The rule: in a quiet frame with no events, <b>GC Alloc should be 0</b>. If it shows 2 KB per frame, that is already about 120 KB of garbage per second at 60 FPS.</p>',
      deep: '<p>Turn on Call Stacks in the profiler (Allocation Callstacks) to see exactly which line allocates. Deep Profile slows the game a lot and distorts timings, but it works for finding the source of allocations. For before/after comparisons, Profile Analyzer and Memory Profiler (snapshots before and after) are more convenient.</p>'
    }
  ]
};

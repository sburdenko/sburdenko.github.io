/** Code review, unit 0 (ModelManager), lesson 4: name search, pair counting, an event with no subscribers, an empty catch. */
export default {
  id: 'rv.u0.l4',
  title: 'Search, events and an empty catch',
  sub: 'Selection "just doesn\'t work", and the log is empty',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'Story: silence instead of an error',
      body: '<p>The user clicks a pipe in the scene. The properties panel does not update. The selection log is empty, the console has not a single error. Five clicks, ten: silence.</p><p>There are errors, and more than one. A single line eats them all: <code>catch (Exception) { }</code>.</p>'
    },
    {
      t: 'learn',
      title: 'An empty catch is a garbage chute for errors',
      body: '<p><code>catch (Exception) { }</code> catches <b>everything</b> and drops it down the chute without looking. An unknown id, no subscribers, a locked log file, an error in someone else\'s handler: to the user it all looks the same, "it doesn\'t work". To the developer it also looks the same: not a single log line.</p><p>The rule: catch only the exceptions you <b>expect and know how to handle</b>, and let the rest fly on, or at least reach the log.</p>',
      code: `private void OnSelectionChanged(int id)
{
    try
    {
        var e = _byId[id];
        ElementSelected(e);
        var bytes = Encoding.UTF8.GetBytes("Selected " + id + " at " + DateTime.Now + "\\n");
        _log.Write(bytes, 0, bytes.Length);
    }
    catch (Exception) { }
}`
    },
    {
      t: 'multi',
      q: 'Which problems does this empty catch silently hide? Select all.',
      options: [
        'KeyNotFoundException for an unknown id',
        'NullReferenceException when nobody subscribed to ElementSelected',
        'IOException while writing the log',
        'A compile error in the handler'
      ],
      answer: [0, 1, 2],
      explain: 'Anything thrown at runtime inside the try vanishes without a trace. Compile errors never make it to runtime, so catch has nothing to do with them.'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Name search and the selection handler from ModelManager. Find the bugs: strings, the dictionary, the event, the log and error handling.',
      code: `public List<ElementInfo> FindByName(string name)
{
    var result = new List<ElementInfo>();
    for (int i = 0; i < _elements.Count; i++)
    {
        if (_elements[i].Name.ToLower().Contains(name.ToLower()))
            result.Add(_elements[i]);
    }
    return result;
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
}`,
      bugs: [
        { lines: [5], title: 'ToLower in a loop: allocations, culture, null', why: 'Every iteration creates two new strings, and name.ToLower() is recomputed each time. ToLower depends on the culture (the Turkish I), and Name == null throws NullReferenceException.' },
        { lines: [15], title: 'Dictionary indexer with an unknown id', why: '_byId[id] throws KeyNotFoundException if the element is missing (a click on another model\'s object, a selection before loading). Use TryGetValue.' },
        { lines: [16], title: 'Raising the event without a null check', why: 'With no subscribers the event field is null, and the call throws NullReferenceException. A subscriber exception also aborts the method, so the log line is never written.' },
        { lines: [17, 18], title: 'Logging: DateTime.Now, concatenation, no Flush', why: 'Local time jumps with time zone and daylight saving changes, and the date format depends on the culture. Strings and a byte array are allocated on every click, and an unflushed buffer is lost on a crash.' },
        { lines: [20], title: 'An empty catch (Exception)', why: 'It swallows every error above without a trace: selection "just doesn\'t work", and the cause is nowhere in the log or the console.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:5', 'flag:15', 'flag:16', 'flag:17', 'flag:20', 'check']
    },
    {
      t: 'learn',
      title: 'ToLower: expensive and country-dependent',
      body: '<p><code>name.ToLower()</code> inside the loop makes a new string on <b>every</b> iteration, even though name never changes. <code>_elements[i].Name.ToLower()</code> is one more string per element. With 100,000 elements that is 200,000 garbage strings per search.</p><p>Worse, <code>ToLower()</code> uses the <b>current culture</b>. In the Turkish culture the capital I becomes a dotless "ı", so searching for "id" will not find "ID".</p>',
      code: `// no allocations and no culture dependency
n.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0`,
      deep: '<p>The <code>string.Contains(string, StringComparison)</code> overload exists in .NET Core 2.1+ and .NET Standard 2.1 (Unity 2021.2+); <code>IndexOf(..., StringComparison)</code> works everywhere, including old Mono. <code>OrdinalIgnoreCase</code> compares character codes with simple case folding, which is exactly what identifiers and element names need. For natural-language search (diacritics and the like) use <code>CompareInfo.IndexOf</code> with the right culture. If searches are frequent, build an index (a dictionary by normalized name or a prefix tree) instead of a linear scan.</p>'
    },
    {
      t: 'choice',
      q: 'The current culture is tr-TR. An element is called "ID-42". What does FindByName("id") return?',
      code: `if (_elements[i].Name.ToLower().Contains(name.ToLower()))`,
      options: ['An empty list: "ID-42".ToLower() gives "ıd-42"', 'A list with this element', 'It throws CultureNotFoundException'],
      answer: 0,
      explain: 'In the Turkish alphabet I and i have different partners: the capital I becomes a lowercase dotless ı. So "ıd-42" does not contain "id". This is the famous "Turkish I problem", a reason to always pass StringComparison explicitly.',
      wrong: { 1: 'It would be found with OrdinalIgnoreCase or the invariant culture, but not with ToLower() under tr-TR.', 2: 'The tr-TR culture exists, so nothing is thrown: you just get the "wrong" result.' }
    },
    {
      t: 'blanks',
      q: 'Fix FindByName: no extra strings, no culture, no crash on null.',
      code: `public List<ElementInfo> FindByName(string name)
{
    var result = new List<ElementInfo>();
    if (string.IsNullOrEmpty(name)) return result;
    foreach (var e in _elements)
    {
        if (e.Name ___ null && e.Name.IndexOf(name, StringComparison.___) >= 0)
            result.Add(e);
    }
    return result;
}`,
      tiles: ['!=', 'OrdinalIgnoreCase', '==', 'CurrentCulture', 'Ordinal'],
      answer: ['!=', 'OrdinalIgnoreCase'],
      explain: 'The null check protects against elements without a name. OrdinalIgnoreCase creates no new strings and does not depend on the culture. Ordinal would be case-sensitive, and CurrentCulture would bring back the Turkish problem.'
    },
    {
      t: 'learn',
      title: 'CountClashes: every pair twice',
      body: '<p>The double loop runs over every i and every j. The pair "pipe 1, beam 2" is checked as (1, 2) and again as (2, 1). The <code>i != j</code> condition only removes comparing an element with itself. The result is <b>exactly twice</b> the truth, and so is the work.</p>',
      code: `for (int i = 0; i < _elements.Count; i++)
    for (int j = i + 1; j < _elements.Count; j++)   // each pair once
        if (_elements[i].Box.Intersects(_elements[j].Box))
            count++;`,
      deep: '<p>Even with <code>j = i + 1</code> the algorithm is O(n²): for 50,000 elements that is about 1.25 billion checks. Real clash detection first prunes pairs in a broad phase (a uniform grid, a BVH or octree, or sweep-and-prune along one axis), and only then tests the candidates. A detail for a hot loop: <code>_elements[i].Box</code> through the List indexer copies the whole 48-byte struct for one field, and <code>Bounds.Intersects</code> takes Bounds by value, which is another copy.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line makes CountClashes count every pair twice?',
      code: `public int CountClashes()
{
    int count = 0;
    for (int i = 0; i < _elements.Count; i++)
        for (int j = 0; j < _elements.Count; j++)
            if (i != j && _elements[i].Box.Intersects(_elements[j].Box))
                count++;
    return count;
}`,
      answer: 4,
      explain: 'The inner loop starts at 0, so every pair shows up in both orders. Start at j = i + 1 and the i != j check is no longer needed, while each pair is counted once.'
    },
    {
      t: 'choice',
      q: 'Three boxes, all three overlapping each other. What does the original CountClashes return?',
      options: ['6', '3', '9'],
      answer: 0,
      explain: 'There are three real pairs: (0,1), (0,2), (1,2). A loop over every j, skipping only self-comparison, counts each twice: 3 x 2 = 6. Nine would require dropping the i != j check as well.',
      wrong: { 1: 'Three is the correct answer for j = i + 1. The original code counts each pair in both orders.', 2: '9 = 3 x 3 would include comparing each box with itself, but i != j filters that out.' }
    },
    {
      t: 'learn',
      title: 'An event with no subscribers is null',
      body: '<p>An event field nobody subscribed to is <b>null</b>. Calling <code>ElementSelected(e)</code> then throws NullReferenceException. The short form <code>ElementSelected?.Invoke(e)</code> calls subscribers only if there are any.</p><p>The second trap: if the first subscriber throws, the remaining subscribers are not called, and the code after the call (the log write) does not run.</p>',
      code: `if (!_byId.TryGetValue(id, out var e))
{
    Debug.LogWarning("Unknown element id " + id);
    return;
}
ElementSelected?.Invoke(e);`,
      deep: '<p><code>?.Invoke</code> reads the field once, so it also closes the race "checked for null, but the last subscriber unsubscribed on another thread before the call". A multicast delegate calls subscribers one by one and stops at the first exception. If the handlers are foreign and unreliable, iterate <code>GetInvocationList()</code> and wrap each one in a try/catch with logging. As for the log: write the time as <code>DateTime.UtcNow.ToString("o")</code> (ISO 8601, independent of time zone and culture), and write through a <code>StreamWriter</code> with <code>WriteLine</code> instead of a manual <code>Encoding.GetBytes</code> per line.</p>'
    },
    {
      t: 'choice',
      q: 'Which version of the handler is better?',
      options: [
        'TryGetValue, then ElementSelected?.Invoke(e), then the log write, with a catch only for IOException that calls Debug.LogException',
        'Keep catch (Exception) { }, but add a retry',
        'catch (Exception ex) { throw ex; }'
      ],
      answer: 0,
      explain: 'Expected situations (no such id, no subscribers) are checked up front, without exceptions. Only what can really happen to the file is caught, and it gets logged. Everything else is an honest error that people will see.',
      wrong: { 1: 'Retrying a swallowed error is the same silence, only twice.', 2: 'throw ex; also resets the stack trace. If you must rethrow, use throw; but here there is no reason to catch and rethrow at all.' }
    },
    {
      t: 'match',
      q: 'Match the symptom with the cause.',
      pairs: [
        ['Selection does nothing, the log is empty', 'An empty catch (Exception)'],
        ['Clicking a foreign object gives KeyNotFoundException', '_byId[id] instead of TryGetValue'],
        ['NRE when the properties panel is closed', 'ElementSelected(e) without ?.'],
        ['Twice as many clashes as there are', 'The inner loop starts at j = 0'],
        ['Searching "id" misses "ID" for Turkish users', 'ToLower() with the current culture'],
        ['Log timestamps jump by an hour', 'DateTime.Now instead of UtcNow']
      ]
    }
  ]
};

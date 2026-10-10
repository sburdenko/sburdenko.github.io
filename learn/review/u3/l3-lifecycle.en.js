/** Section 3, lesson 3 of the "Code review: find the bug" course. */
export default {
  id: 'rv.u3.l3',
  title: 'Lifecycle and flags',
  sub: 'OnEnable/OnDisable, dead objects, HasFlag and Camera.main',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'A newsletter you can join but never leave',
      body: '<p>You subscribe to a newsletter every time you walk into a room, but you only unsubscribe when the <b>house is demolished</b>. You can leave and re-enter the room as often as you like, though: every entry is a new subscription, and the letters arrive in twos and threes.</p><p>In Unity a component has matching pairs: <b>Awake → OnEnable → Start → … → OnDisable → OnDestroy</b>. <code>OnEnable</code> and <code>OnDisable</code> fire every time the object is switched on and off (<code>SetActive</code> or <code>enabled</code>), while <code>OnDestroy</code> fires once, at the end. Subscribe in one place, unsubscribe in its pair.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'A piece of ClashMarkers about events, the coroutine and the marker list. Flag the lines with mistakes.',
      code: `private readonly List<GameObject> _markers = new List<GameObject>();
private ClashFilter _filter = ClashFilter.Hard | ClashFilter.Soft;

private void OnEnable()
{
    ClashEvents.Selected += OnSelected;
    StartCoroutine(Pulse());
}

private void OnDestroy()
{
    ClashEvents.Selected -= OnSelected;
}

private IEnumerator Pulse()
{
    while (true)
    {
        foreach (var m in _markers)
            m.transform.localScale = Vector3.one * (1f + Mathf.Sin(Time.time * 4f) * 0.1f);
        yield return new WaitForSeconds(0.05f);
    }
}

private void OnSelected(int clashId, ClashFilter type)
{
    if (!_filter.HasFlag(type))
        return;
}`,
      bugs: [
        { lines: [5, 6, 11], title: 'Subscribed in OnEnable, unsubscribed only in OnDestroy', why: 'After the object is switched off and on, the handler subscribes a second time and runs twice, and the coroutine starts again. A disabled object also keeps receiving events.' },
        { lines: [0, 18, 19], title: 'GameObject list is never cleaned', why: 'A destroyed object stays in the list as a "fake null". Touching its transform throws MissingReferenceException and kills the coroutine.' },
        { lines: [20], title: 'new WaitForSeconds in a loop', why: 'A new object on every iteration, 20 times a second. One shared instance is enough.' },
        { lines: [26], title: 'HasFlag used for an "any of the flags" test', why: 'HasFlag needs all the bits you pass, and for None it always returns true. A filter on "overlaps" comes out wrong.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:5', 'flag:18', 'flag:26', 'check']
    },
    {
      t: 'learn',
      title: 'What breaks on switch off and on',
      body: '<p>Call <code>SetActive(false)</code> and then <code>SetActive(true)</code>. What happened: <code>OnDisable</code> ran, with no unsubscribe, then <code>OnEnable</code> added the delegate <b>one more time</b>. The event chain now holds two identical handlers. <code>OnDestroy</code> never ran at all.</p><p>The fix is symmetry: whatever you do in <code>OnEnable</code>, undo in <code>OnDisable</code>. Store the coroutine in a field and stop it.</p>',
      deep: '<p>A subtlety with coroutines: <code>SetActive(false)</code> stops all coroutines on the object, but <code>enabled = false</code> on the component does <b>not</b>. The coroutine keeps running, and after <code>enabled = true</code>, OnEnable starts a second copy. So calling <code>StopCoroutine</code> explicitly in OnDisable is safer.</p><p>A static event also keeps its subscriber alive: until the subscriber unsubscribes, the reference stays, and a destroyed component keeps getting calls. Any access to its fields throws <code>MissingReferenceException</code>.</p>'
    },
    {
      t: 'choice',
      q: 'The object was switched off and on (SetActive(false), then SetActive(true)). How many times does OnSelected run for one ClashEvents.Selected event?',
      options: ['0', '1', '2', 'An exception is thrown'],
      answer: 2,
      explain: 'OnDestroy never ran, so the first subscription is still there. OnEnable added the same method a second time, and the delegate chain calls it twice.',
      wrong: {
        0: 'Switching off does not remove the subscription, because there is no unsubscribe.',
        1: 'It would be once with a symmetric OnEnable and OnDisable.',
        3: 'Subscribing again throws nothing. It silently duplicates.'
      }
    },
    {
      t: 'blanks',
      q: 'Make the subscription symmetric and stop the coroutine.',
      code: `private Coroutine _pulse;

private void OnEnable()
{
    ClashEvents.Selected += OnSelected;
    _pulse = StartCoroutine(Pulse());
}

private void ___()
{
    ClashEvents.Selected ___ OnSelected;
    if (_pulse != null) StopCoroutine(_pulse);
}`,
      tiles: ['OnDisable', 'OnDestroy', '-=', '+='],
      answer: ['OnDisable', '-='],
      explain: 'OnDisable runs on every switch off and before destruction, so it fits unsubscribing. We stop the coroutine from the field explicitly, so it does not keep running after enabled = false.'
    },
    {
      t: 'learn',
      title: 'The Unity "fake null"',
      body: '<p>When you call <code>Destroy(go)</code>, the C# wrapper object stays alive and the real object inside the engine disappears. It is an envelope with nothing in it. Any access to it, <code>go.activeSelf</code> or <code>go.transform</code>, throws <code>MissingReferenceException</code>.</p><p>Unity overloaded <code>==</code> so that <code>go == null</code> is <b>true</b> for that empty envelope. So the marker list needs cleaning: <code>_markers.RemoveAll(m => m == null)</code>, or the marker reports its own destruction and removes itself from the list.</p>',
      deep: '<p><code>Destroy</code> is not instant: the object goes away at the end of the frame (<code>DestroyImmediate</code> is instant, but you should avoid it in gameplay code). The operators <code>?.</code>, <code>??</code>, <code>is null</code> and <code>ReferenceEquals</code> bypass the overloaded <code>==</code>, so they <b>will not notice</b> a destroyed object. Check with <code>== null</code> or <code>if (obj)</code>.</p><p>You cannot modify a list during <code>foreach</code>: you get InvalidOperationException. Clean up outside the loop or with <code>RemoveAll</code>.</p>'
    },
    {
      t: 'choice',
      q: 'Which check will NOT notice a destroyed GameObject m?',
      options: ['if (m == null)', 'if (!m)', 'if (m is null)', 'if (m != null && m.activeSelf)'],
      answer: 2,
      explain: 'The is null pattern checks the reference directly and does not call the Unity overloaded operator. The other options go through == or the implicit bool conversion and correctly see the "dead" object.',
      wrong: {
        0: 'The overloaded == returns true for a destroyed object.',
        1: 'The ! operator also uses the Unity implicit conversion to bool.',
        3: 'Here != works through the overload, so m.activeSelf is never reached.'
      }
    },
    {
      t: 'learn',
      title: 'Flags: [Flags] and HasFlag',
      body: '<p>An enum with <code>[Flags]</code> is a set of switches: <code>Hard = 1, Soft = 2, Clearance = 4</code>. The filter "Hard and Soft" equals 3 (011 in binary).</p><p><code>x.HasFlag(f)</code> means <code>(x &amp; f) == f</code>: <b>all</b> bits of f must be on. For a single flag that is the same as "is it set". But:</p><p>• <code>HasFlag(None)</code> is always <b>true</b>, because 0 is contained in everything.<br>• For the combination <code>Hard | Clearance</code> both bits are required.</p><p>If the question is "does at least one match", write <code>(x &amp; f) != 0</code>.</p>',
      deep: '<p>In older runtimes (notably Unity with Mono and IL2CPP) HasFlag converts the value to object, so it boxes, which is an allocation. In modern .NET (since .NET Core 2.1 / .NET 5) the JIT optimizes it and there is no boxing. The bitwise form is equally fast everywhere, so prefer it in hot Unity code.</p>'
    },
    {
      t: 'choice',
      q: 'The filter is Hard | Soft (3). What does the call return?',
      code: `var filter = ClashFilter.Hard | ClashFilter.Soft;
bool r = filter.HasFlag(ClashFilter.Hard | ClashFilter.Clearance);`,
      options: ['true, because Hard is set', 'false, because Clearance is not in the filter', 'An exception'],
      answer: 1,
      explain: 'HasFlag needs every bit of the argument to be set. The Clearance bit is not set, so the result is false. For "any of", use (filter & mask) != 0.',
      wrong: {
        0: 'That is the answer for "at least one" logic, but HasFlag uses "all" logic.',
        2: 'HasFlag does not throw.'
      }
    },
    {
      t: 'blanks',
      q: 'Rewrite the check: leave when the event shares no flag with the filter.',
      code: `if ((_filter ___ type) ___ 0)
    return;`,
      tiles: ['&', '|', '==', '!='],
      answer: ['&', '=='],
      explain: '(_filter & type) keeps the shared bits. If the result is zero there are no common flags, and the event must be skipped.'
    },
    {
      t: 'multi',
      q: 'Which statements about the lifecycle are true? Select all that apply.',
      options: [
        'OnDisable runs both on SetActive(false) and before the object is destroyed',
        'enabled = false on a component stops its coroutines',
        'SetActive(false) on the object stops its coroutines',
        'OnDestroy runs every time the object is switched off'
      ],
      answer: [0, 2],
      explain: 'enabled = false does not touch coroutines. OnDestroy runs once, when the object is destroyed.'
    },
    {
      t: 'match',
      q: 'Match the symptom to the cause',
      pairs: [
        ['The handler fires twice after switching off and on', 'Subscribed in OnEnable, unsubscribed in OnDestroy'],
        ['MissingReferenceException while iterating the marker list', 'Destroyed objects stayed in the list'],
        ['HasFlag(None) is always true', 'Zero is contained in every value'],
        ['The pulse runs twice as fast after enabled = false/true', 'The coroutine was not stopped and was started again']
      ]
    },
    {
      t: 'learn',
      title: 'Camera.main can be null',
      body: '<p>The code <code>Camera.main.transform.position</code> assumes the scene has an enabled camera with the <b>MainCamera</b> tag. If there is none (a UI-only scene, tests, a disabled camera), you get a <code>NullReferenceException</code>.</p><p>The fix: fetch the camera once, check it for null and return from the method instead of crashing.</p>',
      deep: '<p>One more thought for seniors: the markers in the listing are made with <code>Instantiate</code> and removed with <code>Destroy</code> (that code is not shown, but the markers are in the list). With hundreds of markers that is constant allocation and GC pressure. In such cases use an <b>object pool</b>: <code>UnityEngine.Pool.ObjectPool&lt;T&gt;</code> (available since Unity 2021.1) or your own. The marker is then switched off and returned to the pool instead of being destroyed, and the list of dead references never appears.</p>'
    }
  ]
};

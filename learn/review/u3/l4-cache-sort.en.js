/** Section 3, lesson 4 of the "Code review: find the bug" course. */
export default {
  id: 'rv.u3.l4',
  title: 'Cache and sorting',
  sub: 'The comparer contract and your own LRU thumbnail cache',
  minutes: 12,
  cards: [
    {
      t: 'learn',
      title: 'A judge who cannot call a tie',
      body: '<p>A sort asks the comparer: "which is bigger, a or b?" The answer is a number: <b>less than zero</b> (a goes first), <b>zero</b> (equal) or <b>greater than zero</b> (a goes later).</p><p>The answer has contract rules:</p><p>• <code>Compare(x, x)</code> equals <b>0</b>.<br>• If <code>Compare(a, b) &lt; 0</code>, then <code>Compare(b, a) &gt; 0</code>.<br>• If a goes before b and b before c, then a goes before c.</p><p>The comparer in the listing, <code>a.Severity &gt; b.Severity ? -1 : 1</code>, never says "zero". For two equal values it answers "a goes after b" in both directions. A judge with no ties.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'A sort and a thumbnail cache that should drop the pictures nobody has needed for the longest time (LRU). Find the mistakes.',
      code: `public void SortBySeverity(List<ClashScore> scores)
{
    scores.Sort((a, b) => a.Severity > b.Severity ? -1 : 1);
}

public Texture2D Get(int id)
{
    return _map.TryGetValue(id, out var texture) ? texture : null;
}

public void Put(int id, Texture2D texture)
{
    if (_map.Count >= _capacity)
    {
        var oldest = _order.Last.Value;
        _order.RemoveLast();
        _map.Remove(oldest);
    }

    _map[id] = texture;
    _order.AddLast(id);
}`,
      bugs: [
        { lines: [2], title: 'The comparer never returns 0', why: 'The contract is broken: Compare(x, x) gives 1. The order rests on Sort implementation details, NaN in the data breaks it, and BinarySearch or SortedSet with this comparer will never find an equal element.' },
        { lines: [7], title: 'Get does not update the usage order', why: 'A picture you just read does not become "fresh". Even with correct eviction this would be a plain queue (FIFO), not an LRU: frequently used pictures get thrown out for nothing.' },
        { lines: [14, 20], title: 'The newest element is evicted, not the oldest', why: 'AddLast puts the new element at the end, and the eviction takes Last too. The fresh picture goes on the very next Put, and the oldest ones stay forever.' },
        { lines: [12, 19], title: 'Put with an id that is already cached', why: 'The id lands in _order a second time and the old entry is not removed, so the order drifts out of sync with _map. Later an eviction removes a live entry. The Count >= capacity check also fires on a simple update.' },
        { lines: [15, 16], title: 'The evicted texture is never destroyed', why: 'Texture2D wraps native memory. The garbage collector will not free it: native memory leaks until someone destroys the texture by hand.' }
      ],
      goal: { min: 4, maxFalse: 2 },
      solve: ['flag:2', 'flag:7', 'flag:14', 'flag:12', 'check']
    },
    {
      t: 'learn',
      title: 'What Sort really guarantees',
      body: '<p>When the contract is broken, <code>List.Sort</code> promises nothing: what happens depends on the implementation and on the data. That is why such a bug is "flaky".</p><p>• A comparer that answers <b>−1</b> for equal values can drive the partition loop past the end of the array in .NET Framework and Unity\'s Mono, and Sort throws <code>ArgumentException</code> "Unable to sort because the IComparer.Compare() method returns inconsistent results".<br>• Ours answers <b>+1</b> for equal values, and on ordinary numbers List.Sort happens to sort correctly. But <code>a &gt; NaN</code> is always false, so with NaN in the data the order turns to garbage, with no exception at all.</p><p>The right descending comparer is <code>b.Severity.CompareTo(a.Severity)</code>. It honestly returns 0 for equal values and handles NaN (NaN counts as smaller than any number).</p>',
      deep: '<p>Why our comparer "works": the .NET introsort (both in Unity\'s Mono and in modern .NET) only compares the result with zero, and "+1 on ties" merely makes it swap equal elements now and then, which an unstable sort never promised to avoid anyway. That is an implementation detail, not a guarantee. In modern .NET the partition loops also check bounds, so the exception is rare there and only the silently wrong order remains. Code that needs an actual 0 (<code>BinarySearch</code>, <code>SortedSet</code>, <code>SortedList</code>) breaks at once with such a comparer: an equal element is never found.</p><p><code>List.Sort</code> and <code>Array.Sort</code> use introsort, which is <b>unstable</b>: equal elements may swap places. If you need stability, use <code>OrderByDescending</code> (LINQ sorting is stable but allocates) or add a second key such as the original index. Another trap: a comparer like <code>(int)(b.Severity - a.Severity)</code> breaks the contract too, because the fractional part is cut off and different values become "equal" inconsistently.</p>'
    },
    {
      t: 'choice',
      q: 'The tests for a comparer "greater gives minus one, otherwise plus one" are green: the list sorts correctly. What do you tell the author in review?',
      options: [
        'All good: the tests pass, so the comparer is correct',
        'The contract is broken: the correct order rests on Sort implementation details, NaN in the data breaks it, and BinarySearch and SortedSet with this comparer will not find an equal element',
        'List.Sort always throws on equal values; the tests just do not contain any',
        'A sort with this comparer can loop forever'
      ],
      answer: 1,
      explain: 'With a broken contract nothing is guaranteed. Today the .NET introsort survives +1 on ties: it merely swaps equal elements now and then. But once a NaN shows up, the implementation changes, or the comparer ends up in code that needs a 0, everything breaks.',
      wrong: {
        0: 'The tests show it works on this data and this implementation. Correctness is guaranteed only for a comparer that follows the contract.',
        2: 'Not always. This particular comparer (+1 on ties) usually does not throw on ordinary numbers. The exception is typical of a comparer that returns −1 on ties.',
        3: 'There is no infinite loop here. The trouble is that the result is not guaranteed.'
      }
    },
    {
      t: 'blanks',
      q: 'Fix the comparer: sort by Severity descending without breaking the contract.',
      code: `scores.Sort((a, b) => ___.Severity.CompareTo(___.Severity));`,
      tiles: ['a', 'b', 'scores'],
      answer: ['b', 'a'],
      explain: 'CompareTo returns 0 for equal values and handles NaN. Swapping a and b gives descending order: the bigger value gets a negative result.'
    },
    {
      t: 'choice',
      q: 'You need a stable descending order by Severity: markers with equal values keep their original order. What do you pick?',
      options: [
        'scores.Sort with any correct comparer, because it is stable',
        'OrderByDescending(s => s.Severity).ToList(), a stable sort (but it creates a new list)',
        'Array.Sort, because it is stable'
      ],
      answer: 1,
      explain: 'LINQ OrderBy/OrderByDescending are stable. If you cannot allocate, add a second key to the comparer: the original index.',
      wrong: {
        0: 'List.Sort and Array.Sort are built on introsort and are unstable.',
        2: 'Array.Sort is unstable too.'
      }
    },
    {
      t: 'learn',
      title: 'LRU: a shelf that cannot hold everything',
      body: '<p>You have a shelf for 3 things. A thing you just used goes <b>near the edge</b>. When you need space, you throw out the one <b>deepest in the back</b>, because it has gone unused the longest. That is <b>LRU</b> (Least Recently Used).</p><p>We need two things at once:<br>• A <b>dictionary</b> <code>id → node</code>, to find a picture in O(1).<br>• A <b>linked list</b> of nodes from fresh to old, to move a node to the front and drop the tail in O(1).</p><p><code>front → [7] → [3] → [9] ← tail</code></p><p>Every Get and every Put moves the node to the front. We always evict the tail (Last).</p>'
    },
    {
      t: 'order',
      q: 'Put the steps of the Put method in order.',
      items: [
        'Check whether this id is already in the dictionary',
        'If it is, replace the texture, move the node to the front and return',
        'If it is not and the cache is full, take the node at the tail (Last)',
        'Remove it from the list and the dictionary, and destroy its texture',
        'Create a node for the new id, put it at the front, store it in the dictionary'
      ],
      explain: 'First handle updating an existing key (nothing needs evicting). Only for a new key do we check fullness. The new node is added after space has been freed.'
    },
    {
      t: 'blanks',
      q: 'Write Get: the node that was read must become the freshest.',
      code: `public Texture2D Get(int id)
{
    if (!_map.TryGetValue(id, out var node))
        return null;
    _order.___(node);
    _order.___(node);
    return node.Value.Texture;
}`,
      tiles: ['Remove', 'AddFirst', 'AddLast', 'RemoveLast'],
      answer: ['Remove', 'AddFirst'],
      explain: 'First detach the node from the list, then insert it at the front. After Remove the node belongs to no list, so AddFirst accepts it. All in O(1).'
    },
    {
      t: 'blanks',
      q: 'Write the eviction: remove the oldest picture and free its memory.',
      code: `if (_map.Count >= _capacity)
{
    var last = _order.___;
    _order.RemoveLast();
    _map.Remove(last.Value.Id);
    UnityEngine.Object.___(last.Value.Texture);
}`,
      tiles: ['Last', 'First', 'Destroy', 'Remove'],
      answer: ['Last', 'Destroy'],
      explain: 'The least recently used node sits at the tail of the list, which is Last. A Texture2D must be destroyed explicitly (Destroy), or native memory leaks.'
    },
    {
      t: 'learn',
      title: 'The finished cache',
      body: '<p>Here is the result: all the steps together. Read it and find where each bug from the listing is closed.</p>',
      code: `public class ThumbnailCache
{
    private sealed class Entry
    {
        public int Id;
        public Texture2D Texture;
    }

    private readonly int _capacity;
    private readonly Dictionary<int, LinkedListNode<Entry>> _map = new Dictionary<int, LinkedListNode<Entry>>();
    private readonly LinkedList<Entry> _order = new LinkedList<Entry>();

    public ThumbnailCache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        _capacity = capacity;
    }

    public Texture2D Get(int id)
    {
        if (!_map.TryGetValue(id, out var node)) return null;
        _order.Remove(node);
        _order.AddFirst(node);
        return node.Value.Texture;
    }

    public void Put(int id, Texture2D texture)
    {
        if (_map.TryGetValue(id, out var existing))
        {
            if (existing.Value.Texture != texture) Release(existing.Value.Texture);
            existing.Value.Texture = texture;
            _order.Remove(existing);
            _order.AddFirst(existing);
            return;
        }

        if (_map.Count >= _capacity)
        {
            var last = _order.Last;
            _order.RemoveLast();
            _map.Remove(last.Value.Id);
            Release(last.Value.Texture);
        }

        var node = new LinkedListNode<Entry>(new Entry { Id = id, Texture = texture });
        _order.AddFirst(node);
        _map[id] = node;
    }

    private static void Release(Texture2D texture)
    {
        if (texture != null) UnityEngine.Object.Destroy(texture);
    }
}`,
      deep: '<p>More to keep in mind. <b>Ownership:</b> the cache destroys textures, so a picture the UI is showing at that moment will vanish; agree on who owns it. <b>Threads:</b> Texture2D and the Unity API work only on the main thread, so the cache can stay lock-free, but access from other threads needs synchronization or a queue. <b>Capacity:</b> you can count bytes (width × height × format) instead of pictures. With a byte limit, evict in a loop until the new item fits.</p>'
    },
    {
      t: 'choice',
      q: 'Capacity is 3. On the old (broken) cache you call Put(1), Put(2), Put(3), Put(4). What is in it now?',
      code: `// Old code:
// eviction: _order.Last, insertion: _order.AddLast(id)
cache.Put(1, a);
cache.Put(2, b);
cache.Put(3, c);
cache.Put(4, d);`,
      options: ['2, 3, 4', '1, 2, 4', '1, 2, 3'],
      answer: 1,
      explain: 'After three Puts the order is 1, 2, 3 and Last is 3. The 3 is evicted (the newest element) and 4 is added. What remains is 1, 2, 4: the oldest entry, 1, stays forever.',
      wrong: {
        0: 'That is the result of a correct FIFO/LRU: the oldest element, 1, would go.',
        2: 'The fourth Put still adds element 4.'
      }
    },
    {
      t: 'match',
      q: 'Match the cache bug to its symptom',
      pairs: [
        ['Get does not move the node', 'The cache behaves like FIFO, not LRU'],
        ['AddLast and evicting Last', 'The fresh picture is thrown out at once'],
        ['Put of an existing id with no check', 'A duplicate in _order and drift from the dictionary'],
        ['No Destroy on eviction', 'Native texture memory leaks'],
        ['Capacity is 0', 'NullReferenceException on _order.Last.Value']
      ]
    }
  ]
};

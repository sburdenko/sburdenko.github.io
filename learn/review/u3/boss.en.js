/** Section 3 finale of the "Code review: find the bug" course. */
export default {
  id: 'rv.u3.boss',
  title: 'Finale: ClashMarkers',
  sub: 'A full review of the class: memory, speed, lifecycle',
  minutes: 14,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'hunt',
      task: 'The full ClashMarkers and ThumbnailCache listing. Find as many problems as you can: allocations, materials, lifecycle, flags, comparer, cache.',
      code: `[Flags]
public enum ClashFilter { None = 0, Hard = 1, Soft = 2, Clearance = 4 }

public struct ClashScore
{
    public float Weight;
    public float Severity;
}

public class ClashMarkers : MonoBehaviour
{
    [SerializeField] private GameObject _markerPrefab;

    private readonly List<GameObject> _markers = new List<GameObject>();
    private readonly ThumbnailCache _thumbnails = new ThumbnailCache(100);
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

    private void Update()
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
        // ...
    }

    public void SortBySeverity(List<ClashScore> scores)
    {
        scores.Sort((a, b) => a.Severity > b.Severity ? -1 : 1);
    }

    public float TotalWeight(IList<ClashScore> scores)
    {
        float total = 0f;
        foreach (var s in scores)
            total += s.Weight;
        return total;
    }
}

public class ThumbnailCache
{
    private readonly int _capacity;
    private readonly Dictionary<int, Texture2D> _map = new Dictionary<int, Texture2D>();
    private readonly LinkedList<int> _order = new LinkedList<int>();

    public ThumbnailCache(int capacity) => _capacity = capacity;

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
    }
}`,
      bugs: [
        { lines: [30, 31, 33], title: 'LINQ chain in Update', why: 'Every frame, Where, OrderBy and ToList create iterators, a sort buffer and a new list: steady garbage and regular GC pauses.' },
        { lines: [32], title: 'Camera.main and Vector3.Distance inside the sort key', why: 'The camera is fetched for every marker every frame (a tag lookup in old Unity versions), and Distance does a square root. Read the position once and compare sqrMagnitude. If there is no camera, you get a NullReferenceException.' },
        { lines: [37], title: 'GetComponent for every visible marker every frame', why: 'An expensive lookup you could do once when the marker is created, keeping the reference.' },
        { lines: [38], title: 'renderer.material makes a copy of the material', why: 'Every marker gets a private material: the copies are not destroyed along with the object (a leak), and static/dynamic batching and instancing can no longer merge them. Use two shared materials (red and gray) or, outside the SRP Batcher, a MaterialPropertyBlock.' },
        { lines: [39], title: 'String and TextMesh work every frame, plus GetComponentInChildren', why: 'Concatenation makes garbage for every marker, and assigning text every frame may rebuild the TextMesh mesh even though the text did not change. Cache the reference, use prebuilt strings and assign only on change.' },
        { lines: [19, 20, 25], title: 'Subscription and coroutine in OnEnable, unsubscribe only in OnDestroy', why: 'After the object is switched off and on, the handler is added a second time and fires twice, and after enabled = false/true two coroutines run. The static event also keeps the disabled object alive. You need OnEnable/OnDisable symmetry and a stopped coroutine.' },
        { lines: [49], title: 'new WaitForSeconds in the coroutine loop', why: 'A new allocation 20 times a second. One static readonly instance is enough.' },
        { lines: [13, 47, 48], title: 'GameObject list is never cleaned', why: 'Destroyed objects stay in the list as a "fake null", and touching them (activeSelf, transform) throws MissingReferenceException. Clean the list (RemoveAll(m => m == null)) or manage marker lifetime through a pool.' },
        { lines: [55], title: 'HasFlag instead of an overlap test', why: 'HasFlag needs all bits and is always true for None, and in Unity\'s Mono it also boxes. (_filter & type) != 0 is safer.' },
        { lines: [62], title: 'The comparer never returns 0', why: 'The contract is broken (Compare(x, x) = 1): the order rests on Sort implementation details, NaN turns it into garbage, and BinarySearch/SortedSet with this comparer will not find an equal element. Use b.Severity.CompareTo(a.Severity).' },
        { lines: [65, 68], title: 'foreach over IList<T> boxes the enumerator', why: 'Every call allocates. Better to accept List<T> or IReadOnlyList<T> and loop with for by index.' },
        { lines: [84], title: 'Get does not update the order', why: 'A thumbnail you just read does not become "fresh": the cache works as FIFO, not LRU.' },
        { lines: [91, 97], title: 'The newest element is evicted, not the oldest', why: 'AddLast puts the new id at the end and the eviction takes Last too: the fresh picture goes on the next Put, and the old ones stay forever.' },
        { lines: [89, 96], title: 'Put with an id that is already cached', why: 'The id lands in _order twice, the old entry stays, and the order drifts out of sync with the dictionary. The eviction also fires on a simple update.' },
        { lines: [92, 93], title: 'The evicted Texture2D is never destroyed', why: 'It wraps native memory: the GC will not free it, so memory leaks until Destroy is called.' },
        { lines: [80], title: 'Capacity 0 is not validated', why: 'With capacity = 0, the first Put finds _order.Last equal to null and throws NullReferenceException. The constructor should reject a non-positive capacity.' }
      ],
      goal: { min: 13, maxFalse: 3 },
      solve: ['flag:30', 'flag:32', 'flag:37', 'flag:38', 'flag:39', 'flag:19', 'flag:49', 'flag:13', 'flag:55', 'flag:62', 'flag:65', 'flag:84', 'flag:91', 'check']
    },
    {
      t: 'multi',
      q: 'Which statements about the original ClashMarkers are true? Select all that apply.',
      options: [
        'renderer.material in Update gives every marker its own copy of the material',
        'If an event arrives with ClashFilter.None, HasFlag returns true and the filter lets it through',
        'After enabled = false the Pulse coroutine stops by itself',
        'The garbage collector will free a Texture2D evicted from the cache',
        'Putting the same id again leaves a duplicate in _order'
      ],
      answer: [0, 1, 4],
      explain: 'SetActive(false) stops coroutines, enabled = false does not. Only Destroy or an unload of unused assets frees the native memory of a Texture2D; the GC does not touch it.'
    },
    {
      t: 'choice',
      q: 'In the profiler, the material count grows every time the markers are recreated. How do you check that these are copies from .material?',
      options: [
        'Look at the material names in the Memory Profiler: copies have an "(Instance)" suffix',
        'Call GC.Collect() and see whether they disappear',
        'Rename the material in the project'
      ],
      answer: 0,
      explain: 'Copies made through .material are named "Name (Instance)". GC.Collect will not remove them: they are Unity objects, destroyed with Destroy or by unloading unused assets.',
      wrong: {
        1: 'Collecting the managed heap does not free Unity objects.',
        2: 'The name of the source material does not affect the copies.'
      }
    },
    {
      t: 'tapline',
      q: 'Which line breaks the comparer contract (Compare(x, x) is not zero)?',
      code: `list.Sort((a, b) => a.Score > b.Score ? -1 : 1);
list.Sort((a, b) => b.Score.CompareTo(a.Score));
list.Sort((a, b) => a.Id.CompareTo(b.Id));`,
      answer: 0,
      explain: 'For equal values the first line answers 1 in both directions, and it can never return zero. The second and third use CompareTo, which returns 0 for equal values.'
    },
    {
      t: 'order',
      q: 'Put the component lifecycle calls in order, from creation to destruction (the object is active the whole time, then it is destroyed).',
      items: ['Awake', 'OnEnable', 'Start', 'Update', 'OnDisable', 'OnDestroy'],
      explain: 'Awake and OnEnable run when an active object is created, and Start runs before the first Update. When an active object is destroyed, OnDisable runs first, then OnDestroy.'
    },
    {
      t: 'blanks',
      q: 'To compare "who is closer" you do not need the root. Fill in the blank.',
      code: `float d = (a.position - b.position).___;`,
      tiles: ['sqrMagnitude', 'magnitude', 'normalized', 'Distance'],
      answer: ['sqrMagnitude'],
      explain: 'The squared distance rises and falls exactly like the distance, but needs no square root.'
    },
    {
      t: 'match',
      q: 'Which tool for which job?',
      pairs: [
        ['Profiler, GC Alloc column', 'Find which line makes garbage in a frame'],
        ['Frame Debugger', 'See why batches did not merge'],
        ['Memory Profiler', 'Find leaked materials and textures'],
        ['Stats: Batches and SetPass calls', 'Estimate the number of draw calls']
      ]
    },
    {
      t: 'choice',
      q: 'The cache evicts a Texture2D without calling Destroy: "the garbage collector will free it anyway". Why is that a mistake?',
      options: [
        'The GC frees only the managed wrapper object; the native texture memory stays until it is destroyed or unused assets are unloaded',
        'You must never evict a Texture2D from a dictionary',
        'Destroy is needed only in the editor'
      ],
      answer: 0,
      explain: 'Texture2D is a thin wrapper over native data. The managed heap and native memory follow different rules.',
      wrong: {
        1: 'You can evict it. The question is releasing the resources.',
        2: 'In a build, native memory leaks in exactly the same way.'
      }
    }
  ]
};

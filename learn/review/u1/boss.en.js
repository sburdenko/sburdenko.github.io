/** Code review, unit 1 (ClashService), final: the full listing. */
export default {
  "id": "rv.u1.boss",
  "title": "Final: ClashService",
  "sub": "Find the bugs in the full listing",
  "minutes": 12,
  "boss": true,
  "cards": [
    {
      "t": "rig",
      "rig": "hunt",
      "task": "This is the whole ClashService sent for review. Mark as many bugs as you can: equality and dictionary, async, threads, collections, recursion, exceptions, Unity null. You need at least 18.",
      "code": `public class ElementKey
{
    public string ModelId;
    public int ElementId;

    public override bool Equals(object obj) =>
        obj is ElementKey k && k.ModelId == ModelId && k.ElementId == ElementId;
}

public class Element
{
    public ElementKey Key;
    public string Name;
    public string Floor;
    public Bounds Bounds;
    public Element Parent;
    public List<Element> Children = new List<Element>();
    public int Id => Key.ElementId;
}

public class Clash
{
    public Element A;
    public Element B;
    public bool IsResolved;
}

public class ClashService
{
    private readonly List<Clash> _clashes = new List<Clash>();
    private readonly Dictionary<ElementKey, List<Clash>> _cache = new Dictionary<ElementKey, List<Clash>>();
    private int _processed;
    private GameObject _marker;

    public event Action Completed;

    public async void RunAsync(IEnumerable<Element> elements)
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
    }

    public void RemoveResolved()
    {
        foreach (var c in _clashes)
        {
            if (c.IsResolved)
                _clashes.Remove(c);
        }
    }

    public List<Clash> GetClashesFor(ElementKey key)
    {
        if (!_cache.ContainsKey(key))
            _cache[key] = _clashes.Where(c => c.A.Key.Equals(key) || c.B.Key.Equals(key)).ToList();
        return _cache[key];
    }

    public void CollectFloor(Element node, string floor, List<Element> result)
    {
        if (node.Floor == floor)
            result.Add(node);
        foreach (var child in node.Children)
            CollectFloor(child, floor, result);
    }

    public bool IsOnLevel(Element e, float levelHeight) =>
        e.Bounds.min.y == levelHeight;

    public void Import(string path)
    {
        try
        {
            var json = File.ReadAllText(path);
            _clashes.AddRange(JsonConvert.DeserializeObject<List<Clash>>(json));
        }
        catch (Exception ex)
        {
            Debug.LogError(ex.Message);
            throw ex;
        }
    }

    public void Highlight()
    {
        _marker?.SetActive(true);
    }
}`,
      "bugs": [
        {
          "lines": [
            0,
            5,
            6
          ],
          "title": "Equals without GetHashCode",
          "why": "Equal keys land in different dictionary drawers, so the cache cannot find its own keys and keeps growing, and every call recomputes everything."
        },
        {
          "lines": [
            2,
            3
          ],
          "title": "Mutable fields in a key",
          "why": "Once GetHashCode is fixed and depends on the fields, changing a field after insertion \"loses\" the entry: it can be neither found nor removed."
        },
        {
          "lines": [
            17
          ],
          "title": "Id ignores ModelId (and Key may be null)",
          "why": "Elements from different models with the same number are indistinguishable: buckets and comparisons mix them up. A missing Key gives a NullReferenceException."
        },
        {
          "lines": [
            36
          ],
          "title": "async void",
          "why": "The caller cannot wait for completion or catch the error. If a task throws, Completed never fires; in Unity the exception only shows up in the console, in .NET without a synchronization context the process crashes."
        },
        {
          "lines": [
            41
          ],
          "title": "Closure over the loop variable i",
          "why": "Tasks usually see i == 8, the filter selects nothing, and the service finds zero clashes. The main bug of the listing."
        },
        {
          "lines": [
            49
          ],
          "title": "Splitting by Id % 8 breaks the pairs",
          "why": "Elements from different buckets are never compared, so some clashes can never be found. Negative Ids give a negative remainder."
        },
        {
          "lines": [
            50,
            52
          ],
          "title": "Lazy Where enumerated many times",
          "why": "The inner loop re-runs the filter for every outer element: n² predicate calls and repeated computation of the source."
        },
        {
          "lines": [
            56
          ],
          "title": "Race on List.Add",
          "why": "List<T> is not thread-safe: writing from eight threads loses items and throws exceptions."
        },
        {
          "lines": [
            31,
            57
          ],
          "title": "Non-atomic counter with a misleading name",
          "why": "_processed++ from several threads loses increments (Interlocked is needed), and the name promises \"processed\" while it counts clashes."
        },
        {
          "lines": [
            54
          ],
          "title": "a.Id < b.Id drops pairs with equal Ids",
          "why": "Elements from different models with the same ElementId are never compared, so a clash between them is never found."
        },
        {
          "lines": [
            65,
            68
          ],
          "title": "Remove inside foreach",
          "why": "The list changes during enumeration: InvalidOperationException on the next step. Plus quadratic work. Use RemoveAll."
        },
        {
          "lines": [
            74,
            76
          ],
          "title": "Double dictionary lookup",
          "why": "ContainsKey, then the indexer: two lookups instead of one. Fixed with TryGetValue."
        },
        {
          "lines": [
            75
          ],
          "title": "Cache is never reset and exposes its internal list",
          "why": "After removal, import and new clashes the cache holds stale queries, and a mutable internal list is handed out."
        },
        {
          "lines": [
            84
          ],
          "title": "Recursion with no guard against rings or depth",
          "why": "A ring in Parent/Children or a very deep tree causes StackOverflowException. In .NET it cannot be caught and the process ends; in an IL2CPP build the app crashes."
        },
        {
          "lines": [
            88
          ],
          "title": "float compared with ==",
          "why": "Heights are inexact in the last digits, so an element on the level is not recognized as such. A tolerance is needed."
        },
        {
          "lines": [
            100
          ],
          "title": "throw ex; wipes the stack",
          "why": "Only Import remains in the trace, and the real place of failure vanishes. You need throw;."
        },
        {
          "lines": [
            99
          ],
          "title": "Logging and then rethrowing",
          "why": "The same error gets logged at every level, and the log fills up with duplicates. And LogError(ex.Message) drops the stack trace: use Debug.LogException(ex) where the error is handled."
        },
        {
          "lines": [
            97
          ],
          "title": "Too broad catch (Exception)",
          "why": "It catches everything, even what cannot be fixed here. Use specific types (IOException, JsonException)."
        },
        {
          "lines": [
            95
          ],
          "title": "DeserializeObject can return null",
          "why": "For an empty file or the content \"null\", AddRange(null) throws ArgumentNullException. The cache is not reset after the import, and every clash from the JSON gets its own copies of Element, unrelated to the model's elements."
        },
        {
          "lines": [
            94
          ],
          "title": "Synchronous file read",
          "why": "File.ReadAllText blocks the thread. On Unity's main thread the game freezes while the file is read."
        },
        {
          "lines": [
            106
          ],
          "title": "?. on a UnityEngine.Object",
          "why": "For a destroyed GameObject (fake null), ?. does not work as a check and gives MissingReferenceException."
        },
        {
          "lines": [
            32
          ],
          "title": "The _marker field is never assigned",
          "why": "The class is not a MonoBehaviour, so the Inspector will not fill the field. It is always null, and Highlight silently does nothing."
        },
        {
          "lines": [
            15,
            16
          ],
          "title": "Public mutable Parent and Children",
          "why": "The link can be broken from either side, even into a ring. And two-way references are a loop for serialization: Newtonsoft throws \"Self referencing loop detected\"."
        }
      ],
      "goal": {
        "min": 18,
        "maxFalse": 3
      },
      "solve": [
        "flag:0",
        "flag:2",
        "flag:17",
        "flag:36",
        "flag:41",
        "flag:49",
        "flag:50",
        "flag:56",
        "flag:31",
        "flag:54",
        "flag:65",
        "flag:74",
        "flag:75",
        "flag:84",
        "flag:88",
        "flag:100",
        "flag:99",
        "flag:97",
        "flag:95",
        "flag:94",
        "flag:106",
        "flag:32",
        "flag:15",
        "check"
      ]
    },
    {
      "t": "choice",
      "q": "Which bug is the main one, the reason the service \"silently finds zero clashes\"?",
      "options": [
        "Closure over the loop variable i in Task.Run",
        "async void in RunAsync",
        "float compared with =="
      ],
      "answer": 0,
      "explain": "All tasks see i == 8, and the filter Id % 8 == 8 lets no element through. The other bugs break the result less often or loudly, while this one empties it without a single error.",
      "wrong": {
        "1": "async void hides exceptions, but it does not blank the result.",
        "2": "float == breaks the level check, not the clash search."
      }
    },
    {
      "t": "multi",
      "q": "Which bugs in the listing show up \"intermittently\", not on every run? Pick all that apply.",
      "options": [
        "_processed++ from several threads",
        "_clashes.Add from several threads",
        "Closure over i (depends on when the tasks start)",
        "Remove inside foreach in RemoveResolved"
      ],
      "answer": [
        0,
        1,
        2
      ],
      "explain": "Races and the closure depend on timing. Remove inside foreach fails every time there is something to remove: that error is deterministic."
    },
    {
      "t": "choice",
      "q": "Which of these errors in the listing cannot be caught with try/catch?",
      "options": [
        "StackOverflowException from CollectFloor",
        "InvalidOperationException from RemoveResolved",
        "ArgumentNullException from Import",
        "MissingReferenceException from Highlight"
      ],
      "answer": 0,
      "explain": "In .NET a stack overflow ends the process immediately, and no catch runs. The other three are ordinary exceptions and can be caught. So the guard against rings must be in the code up front."
    },
    {
      "t": "order",
      "q": "Put the steps of a Dictionary key lookup in order.",
      "items": [
        "Call GetHashCode on the key",
        "Pick a drawer (bucket) by the hash",
        "Walk the entries of that drawer",
        "For entries with the same hash, compare keys with Equals",
        "Return the found value"
      ],
      "explain": "If equal keys have different GetHashCode values, step 2 leads to another drawer, and even if the drawer matches, the stored hash does not. Equals is never reached."
    },
    {
      "t": "blanks",
      "q": "Fix the launcher: the right return type and a list materialized once.",
      "code": `public async ___ RunAsync(IEnumerable<Element> elements)
{
    var all = elements.___();
    var tasks = new List<Task>();
    for (int i = 0; i < 8; i++)
    {
        int chunk = i;
        tasks.Add(Task.Run(() => ProcessChunk(all, chunk)));
    }
    await Task.WhenAll(tasks);
}`,
      "tiles": [
        "Task",
        "ToList",
        "void",
        "Where"
      ],
      "answer": [
        "Task",
        "ToList"
      ],
      "explain": "Instead of async void you need async Task, so callers can await and catch errors. ToList() pins the data once, and tasks do not recompute a lazy query. Where materializes nothing by itself."
    },
    {
      "t": "tapline",
      "q": "Which line erases the real call stack of the exception?",
      "code": `catch (Exception ex)
{
    Debug.LogError(ex.Message);
    throw ex;
}`,
      "answer": 3,
      "explain": "The throw ex; line restarts the trace at the current place. The correct form is throw;. The logging above does not erase the stack, but it makes the error \"noisy\"."
    },
    {
      "t": "match",
      "q": "Match each bug with its symptom.",
      "pairs": [
        [
          "Equals without GetHashCode",
          "The cache cannot find its own keys"
        ],
        [
          "Remove inside foreach",
          "Collection was modified"
        ],
        [
          "Closure over i",
          "Zero clashes found"
        ],
        [
          "?. on a destroyed object",
          "MissingReferenceException"
        ],
        [
          "Recursion over a ring",
          "The process dies, catch does not help"
        ],
        [
          "Id without ModelId",
          "Different elements merged into one"
        ]
      ]
    },
    {
      "t": "choice",
      "q": "What is the best way to redo ElementKey?",
      "options": [
        "An immutable struct: readonly struct with IEquatable, GetHashCode and == (or a readonly record struct)",
        "Keep the class and write GetHashCode over the mutable fields",
        "Use a string of ModelId + ElementId concatenated on every call"
      ],
      "answer": 0,
      "explain": "A key must be immutable, with Equals and GetHashCode consistent; a struct with IEquatable<T> creates no garbage and is not boxed. In .NET with C# 10, a readonly record struct generates all of this, while in Unity (C# 9) you write such a struct by hand.",
      "wrong": {
        "1": "A hash over mutable fields loses entries after an edit.",
        "2": "Concatenating a string on every call creates garbage, and the key stays flimsy."
      }
    }
  ]
};

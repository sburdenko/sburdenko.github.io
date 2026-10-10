/** Code review, unit 1 (ClashService), lesson 2: Equals/GetHashCode, dictionary keys, float. */
export default {
  id: 'rv.u1.l2',
  title: "Equality and dictionary keys",
  sub: "Equals without GetHashCode, and float compared with ==",
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: "A cabinet with numbered drawers",
      body: "<p><code>Dictionary</code> works like a cabinet with numbered drawers. To find a key, it takes two steps:</p><p>1. It asks the key for its <b>drawer number</b> (<code>GetHashCode</code>).<br>2. Inside that drawer, it compares keys for real (<code>Equals</code>).</p><p>If two \"equal\" keys give different numbers, the second one is searched for in the wrong drawer and never found.</p>"
    },
    {
      t: 'learn',
      title: "Equal, but not found",
      body: "<p>The <code>ElementKey</code> class overrides <code>Equals</code> but forgot <code>GetHashCode</code>. By default a class hash depends on the <b>object's address</b>. Two different objects with the same content get different drawer numbers.</p>",
      code: `var a = new ElementKey { ModelId = "M1", ElementId = 7 };
var b = new ElementKey { ModelId = "M1", ElementId = 7 };

a.Equals(b);               // true
_cache[a] = list;
_cache.ContainsKey(b);     // false (almost always)`,
      deep: "<p>The contract: if <code>a.Equals(b)</code>, the hashes must match. The reverse is not required (hash collisions are allowed). The compiler warns about this (CS0659), and that warning should not be silenced. For classes the default hash is built from object identity (<code>RuntimeHelpers.GetHashCode</code>), so it is \"almost always\" because two different drawers occasionally match by chance.</p>"
    },
    {
      t: 'choice',
      q: "What does this do to GetClashesFor in the service?",
      options: ["The cache never hits: every call recomputes everything, and the cache grows", "An exception is thrown on first access", "The cache returns someone else's clashes"],
      answer: 0,
      explain: "ContainsKey does not find the \"same\" key, so the query is recomputed and one more entry is added to the dictionary. Memory grows, speed is as if there were no cache.",
      wrong: { 1: "There is no exception: the dictionary just honestly says \"not here\".", 2: "No foreign data appears, you only lose the cache hit." }
    },
    {
      t: 'rig', rig: 'hunt',
      task: "Find the problems with the key, the element identifier, the cache and the number comparison.",
      code: `public class ElementKey
{
    public string ModelId;
    public int ElementId;

    public override bool Equals(object obj) =>
        obj is ElementKey k && k.ModelId == ModelId && k.ElementId == ElementId;
}

public class Element
{
    public ElementKey Key;
    public int Id => Key.ElementId;
}

public List<Clash> GetClashesFor(ElementKey key)
{
    if (!_cache.ContainsKey(key))
        _cache[key] = _clashes.Where(c => c.A.Key.Equals(key) || c.B.Key.Equals(key)).ToList();
    return _cache[key];
}

public bool IsOnLevel(Element e, float levelHeight) =>
    e.Bounds.min.y == levelHeight;`,
      bugs: [
        { lines: [0, 5, 6], title: "Equals without GetHashCode", why: "Equal keys land in different dictionary drawers. ContainsKey cannot find them, the cache keeps growing, and every call recomputes everything." },
        { lines: [2, 3], title: "Mutable fields in a key", why: "If ElementId changes after insertion, the entry stays in its old drawer and gets \"lost\": it can be neither found nor removed." },
        { lines: [12], title: "Id ignores ModelId", why: "Elements from different models with the same number are treated as one element. And if Key is null, you get a NullReferenceException." },
        { lines: [17, 19], title: "Double dictionary lookup", why: "ContainsKey, then the indexer: two lookups instead of one. On a hot path that is wasted work, fixed with TryGetValue." },
        { lines: [18], title: "Cache that is never reset", why: "After clashes are added, removed or imported, the cached lists go stale, and the cache's internal mutable list is handed out to callers." },
        { lines: [23], title: "float compared with ==", why: "Floating-point numbers are almost never exactly equal: 3.0f and 2.9999998f differ. An element that is \"on the level\" will be treated as off the level." }
      ],
      goal: { min: 5, maxFalse: 2 },
      solve: ['flag:0', 'flag:2', 'flag:12', 'flag:17', 'flag:18', 'flag:23', 'check']
    },
    {
      t: 'blanks',
      q: "Add the missing method so that equal keys produce the same drawer number.",
      code: `public override int ___() =>
    HashCode.___(ModelId, ElementId);`,
      tiles: ['GetHashCode', 'Combine', 'ToString', 'Equals'],
      answer: ['GetHashCode', 'Combine'],
      explain: "<code>HashCode.Combine</code> mixes the field values into one hash. What matters is that the same fields take part as in <code>Equals</code>."
    },
    {
      t: 'choice',
      q: "What happens if you change key.ElementId after dict[key] = value, and the hash is computed from that field?",
      options: ["The entry stays in the old drawer and can no longer be found by the key", "The dictionary moves the entry to the new drawer itself", "An exception is thrown when the field changes"],
      answer: 0,
      explain: "A dictionary computes the hash once, at insertion. It does not watch the key. That is why keys should be immutable: readonly fields, a record or a readonly struct.",
      wrong: { 1: "The dictionary does not know you changed the field and recomputes nothing.", 2: "A plain field can be changed freely, nothing is checked." }
    },
    {
      t: 'choice',
      q: "What is the right way to rewrite the double lookup?",
      code: `if (!_cache.ContainsKey(key))
    _cache[key] = Build(key);
return _cache[key];`,
      options: ["if (!_cache.TryGetValue(key, out var list)) _cache[key] = list = Build(key); return list;", "return _cache.ContainsKey(key) ? _cache[key] : Build(key);", "return _cache[key] ?? Build(key);"],
      answer: 0,
      explain: "TryGetValue searches once and returns the value right away. The second option searches twice and never stores anything in the cache. The third throws KeyNotFoundException when the key is missing.",
      wrong: { 1: "The lookup is still double, and Build's result is not saved anywhere.", 2: "The indexer throws for a missing key, so ?? is never reached." }
    },
    {
      t: 'choice',
      q: "What is -3 % 8 in C#?",
      code: `int id = -3;
int chunk = id % 8;`,
      options: ['-3', '5', '3'],
      answer: 0,
      explain: "In C# the remainder takes the sign of the dividend. So <code>Id % 8</code> for negative Ids gives a value from -7 to 0, and such elements never land in buckets 0...7. The fix: <code>((id % 8) + 8) % 8</code>. Do not use <code>Math.Abs</code>: <code>Math.Abs(int.MinValue)</code> throws OverflowException.",
      wrong: { 1: "That is how mathematicians do it (the remainder is never negative). In C#, the % operator works differently.", 2: "The sign cannot vanish: the dividend is negative, so the remainder is too." }
    },
    {
      t: 'learn',
      title: "Fractions are inexact",
      body: "<p>A computer stores <code>float</code> in binary, and many numbers (even a simple 0.1) cannot be written there exactly. After a few calculations, \"3\" turns into <code>2.9999998</code>. A <code>==</code> comparison will honestly say \"not equal\".</p><p>You need a tolerance: close enough means equal.</p>",
      code: `float h = 0.1f * 30;
h == 3.0f;                       // may be false
Mathf.Approximately(h, 3.0f);    // true
Math.Abs(h - 3.0f) < 0.001f;     // tolerance in meters`,
      deep: "<p>Choose the tolerance for the problem at hand. <code>Mathf.Approximately</code> uses a relative error of about 1e-6, which is a poor fit for values near zero or at a large scale. For heights in meters, an explicit tolerance is more common (for example, 1 mm). Also, <code>NaN == NaN</code> is false, so check for NaN separately.</p>"
    },
    {
      t: 'multi',
      q: "Which properties should a good dictionary key have? Pick all that apply.",
      options: ["The fields that Equals and the hash depend on never change", "GetHashCode is consistent with Equals", "It implements IEquatable<T>, to avoid boxing", "The hash is computed from a Name field that the user can rename"],
      answer: [0, 1, 2],
      explain: "Immutability and consistency between Equals and GetHashCode are required. IEquatable<T> removes the cast to object and boxing for structs. A hash over a mutable field breaks lookup."
    },
    {
      t: 'match',
      q: "Match each problem with its consequence.",
      pairs: [
        ["Equals without GetHashCode", "The cache cannot find its own keys"],
        ["Mutable field in a key", "The entry is lost after an edit"],
        ["Id without ModelId", "Different elements merged into one"],
        ["ContainsKey + indexer", "Two lookups instead of one"],
        ["float ==", "An element \"on the level\" is not recognized"]
      ]
    },
    {
      t: 'learn',
      title: "For seniors: a better key",
      body: "<p>The simplest cure is <code>readonly record struct ElementKey(string ModelId, int ElementId)</code>. The compiler generates <code>Equals</code>, <code>GetHashCode</code>, <code>IEquatable&lt;T&gt;</code> and the operators, the fields become immutable, and a struct creates no garbage.</p>",
      deep: "<p>A caveat for Unity: <code>record</code> needs C# 9, and <code>readonly record struct</code> needs C# 10. On Unity versions with an older language level, write the struct by hand: <code>readonly struct</code> + <code>IEquatable&lt;ElementKey&gt;</code> + <code>GetHashCode</code> + <code>==</code>/<code>!=</code> operators. If a struct implements neither <code>IEquatable&lt;T&gt;</code> nor an <code>Equals</code> override, the dictionary falls back to <code>ValueType.Equals</code>, which is slower and boxes.</p>"
    }
  ]
};

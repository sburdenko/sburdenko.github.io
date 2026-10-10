/** Code review, unit 1 (ClashService), lesson 4: exceptions, null in Unity, public fields. */
export default {
  id: 'rv.u1.l4',
  title: "Exceptions and null in Unity",
  sub: "throw ex, a \"dead\" GameObject and public fields",
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: "A letter with a forged return address",
      body: "<p>An exception carries its <b>call stack</b>: the path it traveled. Think of an envelope with stamps from every post office. When you catch an exception and rethrow it with <code>throw ex;</code>, you paste a new stamp over all the old ones: \"sent from here\". The real place of failure is lost.</p><p>A plain <code>throw;</code> forwards the envelope as it is.</p>",
      code: `catch (Exception ex)
{
    throw ex;   // the stack starts over at this line
    // throw;   // the stack is preserved
}`,
      deep: "<p><code>throw ex</code> overwrites the stack trace inside the exception object itself: frames below the catch point disappear. If you need to rethrow a caught exception later or from another place (for example, from a continuation of an async operation) and keep its stack, use <code>ExceptionDispatchInfo.Capture(ex).Throw()</code>. If you want to add context, wrap it: <code>throw new ImportException(\"...\", ex)</code>, and the original stays in <code>InnerException</code>.</p>"
    },
    {
      t: 'choice',
      q: "What changes in the stack trace if you replace throw ex; with throw;?",
      options: ["The frames of the real failure point (inside File.ReadAllText or the parser) show up again", "The exception stops being thrown", "The stack gets shorter"],
      answer: 0,
      explain: "With throw ex, the trace starts in Import, and everything deeper is gone. With throw; you see the whole chain down to where things really broke. When you debug from a production log, that is the difference between minutes and hours.",
      wrong: { 1: "The exception is still thrown, only its trace changes.", 2: "The opposite: the stack becomes complete, not shorter." }
    },
    {
      t: 'blanks',
      q: "Rethrow the exception without losing the stack.",
      code: `catch (IOException)
{
    Cleanup();
    ___;
}`,
      tiles: ['throw', 'throw ex', 'throw null', 'return'],
      answer: ['throw'],
      explain: "A bare <code>throw;</code> inside catch forwards the same exception with its original stack. <code>throw ex</code> would wipe the stack."
    },
    {
      t: 'learn',
      title: "Do not catch everything, and do not shout twice",
      body: "<p><code>Import</code> has three more smells. <b>First:</b> <code>catch (Exception)</code> catches absolutely everything, even what cannot be fixed here. Catch something specific: <code>IOException</code>, <code>JsonException</code>. <b>Second:</b> \"log it and rethrow\" turns into double (triple) logging at every level. Pick one: either handle it and do not rethrow, or rethrow and do not log, and let whoever makes the decision log it. <b>Third:</b> <code>DeserializeObject</code> can return <code>null</code> (an empty file, or the content \"null\"), and <code>AddRange(null)</code> throws <code>ArgumentNullException</code>.</p>"
    },
    {
      t: 'blanks',
      q: "Check the deserialization result before using it.",
      code: `var data = JsonConvert.DeserializeObject<List<Clash>>(json);
if (data ___ null)
    throw new InvalidDataException("empty file");
_clashes.AddRange(data);`,
      tiles: ['==', '!=', '?.', '??'],
      answer: ['=='],
      explain: "If there is no data, a clear error right away beats an <code>ArgumentNullException</code> with a confusing parameter. For ordinary (non-Unity) objects, <code>== null</code> works as expected."
    },
    {
      t: 'learn',
      title: "Dead, but not empty",
      body: "<p>A Unity object has two parts: a C# wrapper (what your code sees) and a native object inside the engine. After <code>Destroy</code>, the native part is gone while the wrapper stays, like a nameplate on the door of a demolished room. Unity overloaded the <code>==</code> operator so that such a nameplate compares equal to <code>null</code> (\"fake null\").</p><p>But the <code>?.</code>, <code>??</code> and <code>is null</code> operators <b>do not call</b> that overload: they look at the wrapper and see \"alive\". The result: <code>MissingReferenceException</code>.</p>",
      code: `_marker?.SetActive(true);      // fails for a destroyed GameObject
if (_marker != null)           // the honest Unity check
    _marker.SetActive(true);`,
      deep: "<p>Microsoft.Unity.Analyzers warn about this: UNT0007 for <code>??</code>, UNT0008 for <code>?.</code>, and related rules cover <code>??=</code> and <code>is null</code>. The rule: for subclasses of <code>UnityEngine.Object</code>, use explicit <code>== null</code> / <code>!= null</code> or the implicit conversion to bool. An extra problem in <code>ClashService</code>: the <code>_marker</code> field is private, assigned nowhere, and the class is not a <code>MonoBehaviour</code>, so the Inspector cannot fill it. The method always silently does nothing (the compiler warns with CS0649: the field is never assigned).</p>"
    },
    {
      t: 'choice',
      q: "What does _marker?.SetActive(true) do if the GameObject was already destroyed with Destroy, but the field was not cleared?",
      options: ["Throws MissingReferenceException", "Quietly skips the call", "Creates a new GameObject"],
      answer: 0,
      explain: "The ?. operator only checks the reference to the C# wrapper, and that is not null. So SetActive is called on an object whose native part is already destroyed.",
      wrong: { 1: "It would skip the call if the check honored the overloaded ==. But ?. does not call it.", 2: "Nothing new is created, Unity does not work that way." }
    },
    {
      t: 'rig', rig: 'hunt',
      task: "A part of the service about the data model, import and highlighting. Find as many problems as you can: exceptions, null and class design.",
      code: `public class Element
{
    public ElementKey Key;
    public Element Parent;
    public List<Element> Children = new List<Element>();
}

private GameObject _marker;

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
}`,
      bugs: [
        { lines: [3, 4], title: "Public mutable Parent and Children", why: "The parent-child link can be broken from either side, even into a ring. And two-way references are a loop for serialization by themselves: Newtonsoft throws \"Self referencing loop detected\" unless you set ReferenceLoopHandling or serialize separate DTOs." },
        { lines: [7], title: "The _marker field is never assigned", why: "The class is not a MonoBehaviour, so the Inspector will not fill the field. It is always null, and Highlight silently does nothing." },
        { lines: [13], title: "Synchronous file read", why: "File.ReadAllText blocks the thread. If Import is called on Unity's main thread, the game freezes while a large file is read." },
        { lines: [14], title: "Deserialization result is not checked", why: "DeserializeObject returns null for an empty file, and AddRange(null) throws ArgumentNullException. The cache is also not reset after the import." },
        { lines: [16], title: "Too broad catch (Exception)", why: "It catches everything, including what cannot be fixed here. I/O errors and JSON parse errors need specific types." },
        { lines: [18], title: "Logging and then rethrowing", why: "One error gets logged at every level, and the log fills up with duplicates. Also, LogError(ex.Message) writes only the text, with no stack trace (Debug.LogException(ex) would keep it). Log where the error is handled." },
        { lines: [19], title: "throw ex; wipes the stack", why: "The real place of failure vanishes from the trace: only Import is visible. You need throw;." },
        { lines: [25], title: "?. on a UnityEngine.Object", why: "For a destroyed GameObject, ?. does not see fake null and calls SetActive, which gives MissingReferenceException." }
      ],
      goal: { min: 6, maxFalse: 2 },
      solve: ['flag:3', 'flag:7', 'flag:13', 'flag:14', 'flag:16', 'flag:18', 'flag:19', 'flag:25', 'check']
    },
    {
      t: 'multi',
      q: "Which checks do NOT honor the == overload of UnityEngine.Object and will let a \"dead\" object through? Pick all that apply.",
      options: ['obj?.Method()', 'obj ?? other', 'obj is null', 'obj == null'],
      answer: [0, 1, 2],
      explain: "The ?., ?? and is null operators look at the reference itself and bypass the overload. A plain == null calls Unity's overloaded operator and honestly reports that the object is destroyed."
    },
    {
      t: 'blanks',
      q: "Fix Highlight: use an honest check for a Unity object.",
      code: `public void Highlight()
{
    if (_marker ___ null)
        _marker.SetActive(true);
}`,
      tiles: ['!=', '?.', 'is not', '??'],
      answer: ['!='],
      explain: "The <code>!=</code> operator calls Unity's overload and returns <code>false</code> for a destroyed object. <code>is not null</code> looks similar but bypasses the overload. Also remember to assign the marker field somewhere, in a constructor or via [SerializeField] in a MonoBehaviour."
    },
    {
      t: 'choice',
      q: "What is the best way to protect the Element tree from Parent and Children getting out of sync?",
      options: ["Make the fields private and add an AddChild method that sets Parent itself", "Keep the fields public and describe the usage in a comment", "Make both fields static"],
      answer: 0,
      explain: "When the only way to change the tree goes through one method, the tree cannot become inconsistent. Expose IReadOnlyList<Element> outward, so nobody can modify the list behind the method's back.",
      wrong: { 1: "A comment will not stop the mistake, it will happen sooner or later.", 2: "static makes the link shared by all elements, which destroys the whole idea." }
    },
    {
      t: 'match',
      q: "Match each symptom with its cause.",
      pairs: [
        ["Only the Import method shows in the log", "throw ex; instead of throw;"],
        ["MissingReferenceException on ?.", "fake null of a destroyed object"],
        ["ArgumentNullException in AddRange", "DeserializeObject returned null"],
        ["Self referencing loop detected", "Parent and Children reference each other"],
        ["The game freezes during import", "Synchronous file read on the main thread"]
      ]
    }
  ]
};

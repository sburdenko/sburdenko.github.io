/** Code review, unit 1 (ClashService), lesson 3: modifying a collection in foreach, recursion, float tolerance. */
export default {
  id: 'rv.u1.l3',
  title: "Collections and recursion",
  sub: "Remove inside foreach, an endless tree walk and height comparison",
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: "The torn-out page",
      body: "<p>You read a list aloud, page after page. Suddenly someone tears out a page while you are reading. You lose your place and do not know what to read next. A <code>foreach</code> over a <code>List</code> behaves the same way and <b>gives up loudly</b>: it throws <code>InvalidOperationException</code>, \"Collection was modified\".</p>",
      code: `foreach (var c in _clashes)
{
    if (c.IsResolved)
        _clashes.Remove(c);   // crashes on the next iteration
}`,
      deep: "<p><code>List&lt;T&gt;</code> has a version counter. Every <code>Add</code>/<code>Remove</code> bumps it, and at the start of each step the enumerator compares its own copy of the version with the current one. A mismatch means an exception. For <code>Dictionary</code> in .NET Core 3.0+, <code>Remove</code> and <code>Clear</code> during enumeration do not bump the version and are therefore allowed. But in .NET Framework and in Unity (the Mono class library, under both Mono and IL2CPP) the dictionary works the old way, and such a loop throws too. Code that \"worked\" in tests on .NET 8 will crash in Unity.</p>"
    },
    {
      t: 'choice',
      q: "What happens when RemoveResolved runs and the list contains a resolved clash?",
      code: `foreach (var c in _clashes)
{
    if (c.IsResolved)
        _clashes.Remove(c);
}`,
      options: ["InvalidOperationException on the next step of the loop", "The resolved clashes are quietly removed", "All clashes are removed"],
      answer: 0,
      explain: "After Remove, the list version has changed, and the next step of the enumeration notices. Besides, every Remove searches for the item and shifts the tail: that is O(n) per removal.",
      wrong: { 1: "It would be quiet if you removed outside the loop or used RemoveAll.", 2: "The list is not cleared entirely: the loop is simply cut short by an exception." }
    },
    {
      t: 'blanks',
      q: "Replace the loop with a single call: remove all resolved items in one pass.",
      code: `public void RemoveResolved()
{
    _clashes.___(c => c.IsResolved);
}`,
      tiles: ['RemoveAll', 'Remove', 'Clear', 'Where'],
      answer: ['RemoveAll'],
      explain: "RemoveAll walks the list once, shifts the survivors itself and takes the condition directly. That is O(n) instead of O(n²). Do not forget to reset the cache afterwards, because it still holds stale queries."
    },
    {
      t: 'multi',
      q: "Which ways safely remove items from List<Clash>? Pick all that apply.",
      options: ["_clashes.RemoveAll(c => c.IsResolved)", "for (int i = _clashes.Count - 1; i >= 0; i--) with RemoveAt(i)", "foreach over _clashes.ToList() calling _clashes.Remove(c)", "foreach over _clashes calling _clashes.Remove(c)"],
      answer: [0, 1, 2],
      explain: "RemoveAll is the fastest. A loop from the end does not shift indexes you have not visited yet. A copy via ToList is safe, but costs more time and memory. A direct foreach with Remove crashes."
    },
    {
      t: 'learn',
      title: "A bottomless nesting doll",
      body: "<p><code>CollectFloor</code> calls itself for every child. Each call puts a new plate on a \"stack of plates\" (the call stack). If the data contains a ring (an element is its own descendant), the plates never run out until the stack collapses.</p><p>This crash is called <code>StackOverflowException</code>, and it has a harsh trait: in .NET <b>you cannot catch it</b> with <code>try/catch</code>. The whole process terminates.</p>",
      code: `public void CollectFloor(Element node, string floor, List<Element> result)
{
    if (node.Floor == floor)
        result.Add(node);
    foreach (var child in node.Children)
        CollectFloor(child, floor, result);   // what if child is an ancestor?
}`,
      deep: "<p>A thread's stack is limited (around 1 MB in a typical setup; other platforms and thread pool threads can differ). A depth of tens of thousands of frames can kill the process even without any ring: a very deep tree from an imported model is enough. The C# compiler does not do tail-call optimization, and you cannot rely on the JIT for it either. A Unity caveat: Mono in the Editor sometimes turns the overflow into a regular exception in the console, and the Editor survives. That is no protection: in an IL2CPP build on a device the same error usually means an app crash.</p>"
    },
    {
      t: 'choice',
      q: "Can you wrap the CollectFloor call in try/catch (Exception) and carry on calmly?",
      options: ["No: in .NET StackOverflowException cannot be caught, the process dies", "Yes, catch (Exception) catches any exception", "Yes, but only with catch (StackOverflowException)"],
      answer: 0,
      explain: "Since .NET 2.0, the CLR terminates the process immediately on a stack overflow: carrying on with an exhausted stack is not safe. You have to defend in advance: limit the depth or walk the tree without recursion.",
      wrong: { 1: "For a stack overflow, no catch block is ever invoked.", 2: "That exception type exists, but in .NET no catch clause ever receives it." }
    },
    {
      t: 'rig', rig: 'hunt',
      task: "Three service methods. Each hides its own bug about collections, traversal or numbers. Find all three.",
      code: `public void RemoveResolved()
{
    foreach (var c in _clashes)
    {
        if (c.IsResolved)
            _clashes.Remove(c);
    }
}

public void CollectFloor(Element node, string floor, List<Element> result)
{
    if (node.Floor == floor)
        result.Add(node);
    foreach (var child in node.Children)
        CollectFloor(child, floor, result);
}

public bool IsOnLevel(Element e, float levelHeight) =>
    e.Bounds.min.y == levelHeight;`,
      bugs: [
        { lines: [2, 5], title: "Remove inside foreach", why: "The list changes during enumeration, and the next step throws InvalidOperationException. Also, each removal shifts the tail, so the work is quadratic." },
        { lines: [13, 14], title: "Recursion with no guard against cycles or depth", why: "If Parent and Children form a ring (or the tree is just very deep), the stack overflows. In .NET StackOverflowException cannot be caught: the whole app goes down instead of reporting an error." },
        { lines: [18], title: "float compared with ==", why: "After calculations a height can differ in the last digit. An element that stands on the level is not recognized as such, and the floor looks \"empty\"." }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:2', 'flag:14', 'flag:18', 'check']
    },
    {
      t: 'order',
      q: "Put the steps of an iterative walk (no recursion, protected from rings) in order.",
      items: [
        "Push the root onto a Stack and create a HashSet of visited nodes",
        "While the stack is not empty, pop the top node",
        "If the node was already visited, skip it",
        "Process the node: add it to the result if the floor matches",
        "Push all children of the node onto the stack"
      ],
      explain: "The stack replaces function calls, and the visited set breaks rings. The traversal order comes out mirrored for children; if it matters, push children in reverse order."
    },
    {
      t: 'blanks',
      q: "Fill in the walk: \"push onto the stack\", \"pop from the stack\" and \"remember the visited node\".",
      code: `var stack = new Stack<Element>();
var seen = new HashSet<Element>();
stack.___(root);
while (stack.Count > 0)
{
    var node = stack.___();
    if (!seen.___(node)) continue;
    // ... process and add children
}`,
      tiles: ['Push', 'Pop', 'Add', 'Peek', 'Contains'],
      answer: ['Push', 'Pop', 'Add'],
      explain: "HashSet.Add returns false if the item was already there. One call both checks and remembers. With Contains, the node would never get into the set."
    },
    {
      t: 'choice',
      q: "Which level check is the most sensible for heights in meters?",
      options: ["Math.Abs(e.Bounds.min.y - levelHeight) < 0.01f", "e.Bounds.min.y.Equals(levelHeight)", "(int)e.Bounds.min.y == (int)levelHeight", "e.Bounds.min.y <= levelHeight"],
      answer: 0,
      explain: "Pick the tolerance by meaning: 1 cm for a building. Equals on a float is the same exact comparison as ==. Casting to int drops the fraction: 2.9999 becomes 2 while 3.0 becomes 3. And <= lets everything below the level through.",
      wrong: { 1: "It is the same exact comparison as ==. The only difference is NaN: NaN.Equals(NaN) is true, while NaN == NaN is false.", 2: "Dropping fractions produces errors of a whole meter.", 3: "That checks \"not above\", not \"on the level\"." }
    },
    {
      t: 'match',
      q: "Match each symptom with its fix.",
      pairs: [
        ["Collection was modified", "RemoveAll or a copy of the list"],
        ["The process suddenly exits during a tree walk", "Stack and HashSet instead of recursion"],
        ["A floor looks empty, though it has elements", "A tolerance instead of =="],
        ["Removal is slow on thousands of items", "One pass instead of Remove in a loop"]
      ]
    },
    {
      t: 'learn',
      title: "For seniors: what else was forgotten",
      body: "<p>After <code>RemoveResolved</code> (and after <code>Import</code>) the queries in <code>_cache</code> stay old: the clash is already gone from the list, but the cache still returns it. Any change to <code>_clashes</code> must reset the cache, or the cache must store a data version number.</p>",
      deep: "<p>An iterative walk moves the \"stack of plates\" from the thread stack (around a megabyte) to the heap, where there is far more room. \"Visited\" marks can also live on the nodes themselves (say, a pass number): no HashSet and no allocations, but two concurrent walks will then get in each other's way. If the tree is edited from another thread, walk an immutable snapshot.</p>"
    }
  ]
};

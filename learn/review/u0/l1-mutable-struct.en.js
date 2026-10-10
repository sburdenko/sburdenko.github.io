/** Code review, unit 0 (ModelManager), lesson 1: a mutable struct and its copies. */
export default {
  id: 'rv.u0.l1',
  title: 'Mutable struct: copies',
  sub: 'Why RenameAll renamed nothing',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Story: renaming into thin air',
      body: '<p><code>ModelManager</code> has a button "Add a prefix to every element". <code>RenameAll</code> runs without errors, the compiler is quiet, nothing throws. You open the list and <b>every name is unchanged</b>.</p><p>The culprit is one word in a declaration: <code>struct</code>. Let\'s see why changes "evaporate" with it.</p>'
    },
    {
      t: 'learn',
      title: 'A photocopy versus an address',
      body: '<p>A <b>class</b> is a plate with a house address. Give the plate to a friend and you both walk into the same house: if someone moves the furniture, everyone sees it.</p><p>A <b>struct</b> is a sheet of data. Handing it over means <b>making a photocopy</b>. Your friend draws on their copy, and your sheet stays clean.</p><p>A copy is made on every assignment, every method argument, every return value and every read from a <code>List</code>.</p>',
      code: `public struct ElementInfo
{
    public int Id;
    public string Name;
    public Bounds Box;
    public List<int> ChildIds;

    public void Rename(string newName) { Name = newName; }
}

var a = new ElementInfo { Name = "Wall" };
var b = a;          // a photocopy
b.Rename("Door");
// a.Name is still "Wall"`
    },
    {
      t: 'choice',
      q: 'What will this RenameAll do to the _elements list?',
      code: `public void RenameAll(string prefix)
{
    foreach (var e in _elements)
    {
        e.Rename(prefix + e.Name);
    }
}`,
      options: ['Nothing: every Rename changes a copy', 'Rename every element', 'Throw InvalidOperationException: the collection was modified during enumeration', 'Fail to compile'],
      answer: 0,
      explain: 'The variable e is a copy of the list element. Rename changes the copy, the copy dies at the end of the iteration, and the list is untouched. The compiler does not object: it only forbids assigning to fields of the loop variable, calling methods is allowed.',
      wrong: { 1: 'That is what a class would do: e would be a plate with the address of the same object.', 2: 'The list does not change at all, so its version has nothing to get out of sync with.', 3: 'CS1654 is only reported for assigning to a field (e.Name = ...). A method call compiles.' }
    },
    {
      t: 'learn',
      title: 'The compiler catches half of the cases',
      body: '<p>A <code>foreach</code> variable is read-only. The compiler rejects <code>e.Name = "X";</code> with error <b>CS1654</b>. That is good: it tells you straight away that you are writing into a copy.</p><p>But it accepts the method call <code>e.Rename("X")</code>. The method changes a field inside, and the compiler does not look at what the method does. The result: the same write into a copy, only without a warning.</p>',
      deep: '<p>By the spec, a <code>foreach</code> iteration variable is a readonly variable. Calling a non-readonly method on a readonly struct variable goes through a <b>hidden defensive copy</b>: not even <code>e</code> itself changes, only a temporary copy of the copy. The same mechanism kicks in for <code>readonly</code> fields and <code>in</code> parameters. Mark the method or the whole struct <code>readonly</code> (C# 7.2/8) and the <code>Name = ...</code> assignment inside the method stops compiling, so the bug surfaces at build time.</p>'
    },
    {
      t: 'multi',
      q: 'Which lines will NOT compile if ElementInfo is a struct and _elements is a List<ElementInfo>? Select all.',
      options: ['foreach (var e in _elements) e.Name = "X";', 'foreach (var e in _elements) e.Rename("X");', '_elements[0].Name = "X";', '_elements[0].Rename("X");'],
      answer: [0, 2],
      explain: 'Assigning to a field of a foreach variable is CS1654; assigning to a field of the List indexer result is CS1612 ("not a variable"). Both method calls compile and silently change temporary copies.'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'A piece of ModelManager: the struct, adding elements and bulk renaming. Find the bugs caused by struct copies.',
      code: `public struct ElementInfo
{
    public int Id;
    public string Name;
    public Bounds Box;
    public List<int> ChildIds;
    public void Rename(string newName) { Name = newName; }
}

public void AddAll(List<ElementInfo> elements)
{
    foreach (var e in elements)
    {
        _elements.Add(e);
        _byId.Add(e.Id, e);
    }
}

public void RenameAll(string prefix)
{
    foreach (var e in _elements)
        e.Rename(prefix + e.Name);
}`,
      bugs: [
        { lines: [0, 6], title: 'Mutable struct with a mutator method', why: 'The struct is copied on every read and every pass, and Rename changes only the copy it was called on. Changes get lost silently.' },
        { lines: [5], title: 'ChildIds: null by default and shared by all copies', why: 'For default(ElementInfo) and for an element whose JSON lacks the field, the list is null, and the first access throws NullReferenceException. And all copies share one list: each copy has its own name but the same children.' },
        { lines: [13, 14], title: 'Two independent copies in two collections', why: 'The list and the dictionary get different photocopies. Change an element in one collection and the other keeps returning stale data.' },
        { lines: [20, 21], title: 'foreach changes a copy', why: 'Rename runs on a copy of the element, and the list does not change. RenameAll silently does nothing.' }
      ],
      goal: { min: 3, maxFalse: 2 },
      solve: ['flag:0', 'flag:5', 'flag:13', 'flag:20', 'check']
    },
    {
      t: 'choice',
      q: 'The author "fixes" RenameAll with an index loop. What now?',
      code: `for (int i = 0; i < _elements.Count; i++)
    _elements[i].Rename(prefix + _elements[i].Name);`,
      options: ['It compiles and still changes nothing', 'It works: the indexer gives access to the element itself', 'Compile error CS1612'],
      answer: 0,
      explain: 'The List<T> indexer is a get method, and it returns a copy. Rename changes that temporary copy. CS1612 would only appear for a direct field assignment: _elements[i].Name = ...',
      wrong: { 1: 'That is how an array behaves: arr[i] is the slot itself. A List returns a value through get.', 2: 'CS1612 is about assigning to a field. Calling a method on a temporary value is allowed.' }
    },
    {
      t: 'learn',
      title: 'An array hands you the slot, a list hands you a copy',
      body: '<p>For an array, <code>arr[i]</code> is the memory slot itself, so <code>arr[i].Rename("X")</code> really changes the element. For <code>List&lt;T&gt;</code>, the indexer is an ordinary method that returns a <b>value</b>, that is, a copy.</p><p>The reliable recipe for a list of structs: <b>read, modify, write back</b>.</p>',
      code: `var e = _elements[i];   // a copy
e.Name = prefix + e.Name;
_elements[i] = e;       // write it back`,
      deep: '<p>Modern .NET has <code>CollectionsMarshal.AsSpan(list)</code> (.NET 5+): it gives a <code>Span&lt;T&gt;</code> over the internal array, and <code>span[i]</code> is a reference to the element. That is an optimization for hot paths, not a way to write business logic, and Unity (the .NET Standard 2.1 profile) does not have it. Reading <code>_elements[i].Name</code> also formally copies the whole struct; the JIT often removes that, but it does not have to.</p>'
    },
    {
      t: 'blanks',
      q: 'Fix the renaming: change the copy and write it back into BOTH collections.',
      code: `for (int i = 0; i < _elements.Count; i++)
{
    var e = _elements[i];
    e.Name = prefix + e.Name;
    ___ = e;
    _byId[___] = e;
}`,
      tiles: ['_elements[i]', 'e.Id', 'i', 'e.Name'],
      answer: ['_elements[i]', 'e.Id'],
      explain: 'As long as ElementInfo is a struct, each collection holds its own copy, and both must be updated. The dictionary key is the element Id, not the list index. This is clumsy and easy to forget, so the better fix is to change the type itself (next cards).'
    },
    {
      t: 'choice',
      q: 'What will the list see after this code?',
      code: `var a = _elements[0];
a.Name = "X";
a.ChildIds.Add(42);`,
      options: ['The old name, but 42 appears in ChildIds', 'Name "X" and 42 in ChildIds', 'Nothing changes', 'Name "X", and ChildIds unchanged'],
      answer: 0,
      explain: 'Copying a struct copies the reference to the list, not the list itself. The copy has its own Name, but ChildIds points to the same object. Half value, half reference: confusion guaranteed.',
      wrong: { 1: 'Name was copied by value, so the change stayed in a.', 2: 'ChildIds is shared by the copy and the original, so Add is visible.', 3: 'It is the other way round: Name belongs to the copy, the list is shared.' }
    },
    {
      t: 'learn',
      title: 'How to fix it: a class or an immutable struct',
      body: '<p>There are two honest options.</p><p><b>1. A class.</b> ElementInfo is an entity with an identity (Id) that gets modified and passed between parts of the system. That is reference-type behavior: one plate, one house.</p><p><b>2. A readonly struct.</b> If you need a struct, make it immutable: to change it, create a new one and put it in place of the old one.</p>',
      code: `public readonly struct ElementInfo
{
    public readonly int Id;
    public readonly string Name;
    public ElementInfo(int id, string name) { Id = id; Name = name; }
    public ElementInfo WithName(string n) => new ElementInfo(Id, n);
}

_elements[i] = _elements[i].WithName(prefix + _elements[i].Name);`,
      deep: '<p>The .NET Framework Design Guidelines say a struct should logically represent a single value, be small (the rule of thumb is under 16 bytes), be immutable and rarely get boxed. Here, on a 64-bit platform, it is about 48 bytes (an int, two references and a <code>Bounds</code> made of two <code>Vector3</code>s), so every copy moves three quarters of a 64-byte cache line. The <code>with</code> expression for ordinary structs arrived in C# 10; Unity (C# 9) does not have it, so you write a <code>WithName</code> method by hand. A mutable <code>List&lt;int&gt;</code> inside a readonly struct is still mutable: <code>readonly</code> protects the reference field, not the list contents (prefer <code>IReadOnlyList&lt;int&gt;</code>).</p>'
    },
    {
      t: 'match',
      q: 'Match an operation on the ElementInfo struct with what really happens.',
      pairs: [
        ['foreach (var e ...) e.Rename(...)', 'A temporary copy changes, the list does not'],
        ['_elements[i].Name = ...', 'Compile error CS1612'],
        ['_byId.Add(e.Id, e) after _elements.Add(e)', 'Two independent copies'],
        ['ElementSelected(e)', 'The subscriber gets its own copy'],
        ['default(ElementInfo).ChildIds.Add(1)', 'NullReferenceException']
      ]
    },
    {
      t: 'choice',
      q: 'Which fix for ElementInfo suits this code best?',
      options: ['Make ElementInfo a class (or a readonly struct replaced as a whole)', 'Keep the mutable struct and pass it by ref everywhere', 'Add this = new ElementInfo() to Rename'],
      answer: 0,
      explain: 'A model element has an identity and changes over time, so a class is the natural choice. If compactness matters, use an immutable struct: then changing it "by mistake in a copy" is simply impossible.',
      wrong: { 1: 'ref does not work with foreach, the List indexer or events, which is exactly where the bugs are. One forgotten spot and the copy is back.', 2: 'Assigning this inside a struct method changes the very copy the method was called on. The problem stays.' }
    }
  ]
};

/** Final of the "Memory in .NET" course: advanced topics (unit 8) and the key points of the whole course. */
export default {
  id: 'mem.u8.boss',
  title: 'Course final: memory in .NET',
  sub: 'From OS pages to pinning and Native AOT',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'multi',
      q: 'What is true about a process’s memory numbers? Select all.',
      options: [
        'Virtual size includes reserved but uncommitted addresses',
        'Private bytes grow on commit, even if the pages were never touched',
        'The managed heap size includes memory from NativeMemory.Alloc',
        'Working set is the process’s pages currently in physical memory',
        'GC.GetTotalMemory shows the process’s private bytes'
      ],
      answer: [0, 1, 3],
      explain: 'The numbers nest: virtual size ⊇ private bytes ⊇ what the GC heap occupies. The collector does not see native memory and does not count it in the heap size, and GC.GetTotalMemory counts only managed objects.'
    },
    {
      t: 'order',
      q: 'A thread allocates an object and there is no room. Put what happens next in order',
      items: [
        'The thread’s allocation chunk is used up — the slow path',
        'The gen 0 budget is exhausted — a collection is needed',
        'Threads stop at safepoints',
        'Marking: walk from the roots and through the card table',
        'Planning: compact or sweep',
        'Compaction: survivors slide, references are updated',
        'Threads resume'
      ],
      explain: 'A collection is triggered by an allocation, not a timer. The card table lets a young-generation collection find references into it from old objects without walking the whole heap. Pinned objects stay put during compaction.'
    },
    {
      t: 'match',
      q: 'Where does the memory end up?',
      pairs: [
        ['new Order() — a small object', 'Generation 0 in the SOH'],
        ['new byte[100_000]', 'The LOH'],
        ['GC.AllocateArray<byte>(n, pinned: true)', 'The POH'],
        ['A string literal in .NET 8+', 'The non-GC heap (frozen)'],
        ['NativeMemory.Alloc(n)', 'The C library heap, outside the GC']
      ]
    },
    {
      t: 'choice',
      q: 'A Server GC service runs on a 32-core machine with a 1 GB memory limit. Load is light, yet the heap takes far more than the live data. What helps?',
      options: [
        'DATAS (on by default for Server GC in .NET 9) or capping the heap count with GCHeapCount',
        'Calling GC.Collect() once a second',
        'Switching to SustainedLowLatency mode',
        'Calling GC.AddMemoryPressure with the heap size'
      ],
      answer: 0,
      explain: 'Server GC keeps a heap and a gen 0 budget per core: 32 heaps is a lot of memory even under light load. DATAS adapts the number of heaps to the load, GCHeapCount caps it explicitly. Workstation GC is an option too.',
      wrong: { 1: 'Full blocking collections every second add pauses, and the budgets for 32 heaps stay where they are.', 2: 'SustainedLowLatency suppresses blocking full collections — the heap only gets bigger.' }
    },
    {
      t: 'tapline',
      q: 'Windows get closed and forgotten, but the collector never collects them. Which line keeps them alive?',
      code: 'static class AppEvents\n{\n    public static event Action? ThemeChanged;\n}\nclass Window\n{\n    public Window() =>\n        AppEvents.ThemeChanged += Redraw;\n    void Redraw() { }\n}',
      answer: 7,
      explain: 'The Redraw delegate holds a reference to the window (Target), and a static event is a root that lives for the whole process. Until the window unsubscribes, it is reachable. The cure is unsubscribing on close or weak subscriptions.'
    },
    {
      t: 'choice',
      q: 'What does this method allocate on the heap on every call, in any .NET version?',
      code: 'int CountAbove(List<int> items, int limit)\n{\n    return items.Count(x => x > limit);\n}',
      options: [
        'A closure object with a limit field, and a delegate',
        'Nothing: the lambda becomes a static method',
        'Only a delegate',
        'An array for a params argument'
      ],
      answer: 0,
      explain: 'The lambda captures limit, so the compiler creates a closure class, an instance of it and a delegate to its method — on every call. A lambda with no captures would be cached by the compiler in a static field. Depending on the version, a boxed enumerator inside Count may come on top.',
      wrong: { 2: 'A delegate without captures is indeed cached, but this one points to the closure object, and that is new on every call.' }
    },
    {
      t: 'choice',
      q: 'A native library remembers a buffer’s address while the connection is open. There are a thousand buffers, needed for the whole run. What do you pick?',
      options: [
        'A pool of arrays from GC.AllocateArray(..., pinned: true)',
        'A new byte[] per connection plus GCHandle.Alloc(..., Pinned)',
        'fixed in the method that hands the address to the library',
        'stackalloc in the connect method'
      ],
      answer: 0,
      explain: 'Buffers in the POH never move and leave no holes in the young generations. A thousand fresh arrays with long pins is exactly the case that fragments the heap.',
      wrong: { 2: 'A fixed pin ends with its block, while the library keeps writing to the address.', 3: 'stackalloc memory vanishes when the method returns — the library would write into someone else’s stack frame.' }
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: [
        'TryStartNoGCRegion may run a full collection before the region starts',
        'The collector updates a ref T during compaction, but not a T* pointer',
        'Native AOT has no garbage collector',
        'GC.AddMemoryPressure frees native memory',
        'Memory from NativeMemory.Alloc has to be freed by you'
      ],
      answer: [0, 1, 4],
      explain: 'Native AOT uses the same collector as CoreCLR. AddMemoryPressure only hints to the collector that native memory stands behind objects — freeing it is still your job.'
    },
    {
      t: 'blanks',
      q: 'n comes from outside. Put a small buffer on the stack and a large one on the heap',
      code: 'Span<byte> buf = n <= 256\n    ? ___ byte[256]\n    : ___ byte[n];',
      tiles: ['stackalloc', 'new', 'fixed', 'unsafe'],
      answer: ['stackalloc', 'new'],
      explain: 'A thread’s stack is limited (usually 1 to 8 MB), and stackalloc sized by input can overflow it — which ends the process. So only a small buffer of known size goes on the stack; a large one goes on the heap or comes from ArrayPool.'
    }
  ]
};

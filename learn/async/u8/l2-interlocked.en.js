/** Async/await to the bottom, unit "Synchronization in depth", lesson 2: Interlocked and the CompareExchange loop. */
export default {
  id: 'as.u8.l2',
  title: 'Interlocked and the CAS loop',
  sub: 'Atomic instructions, CompareExchange and lock-free updates',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What happens inside the CPU',
      body: '<p>You have already met <code>Interlocked.Increment</code>. Now — how it works. The JIT turns the call not into a method call but straight into an atomic instruction:</p><ul><li><b>x64</b> — a <code>lock</code>-prefixed instruction: <code>lock xadd</code> for Add/Increment (or <code>lock add</code> when the result is unused), <code>lock cmpxchg</code> for CompareExchange, <code>xchg</code> for Exchange;</li><li><b>ARM64</b> — LSE atomic instructions (<code>ldaddal</code>, <code>casal</code>) if the CPU supports them, otherwise a loop of "exclusive load — conditional store".</li></ul><p>The core takes the cache line into exclusive ownership, does the read-modify-write, and nobody can squeeze in between. It is also a <b>full fence</b>: no operation jumps over it in either direction.</p>'
    },
    {
      t: 'learn',
      title: 'Cost: cheap until it gets crowded',
      body: '<p>Without contention an atomic operation costs on the order of a few to tens of nanoseconds — more than a plain <code>++</code>, but far less than a trip into the kernel.</p><p>Under contention the picture changes. To write, a core needs the line <b>in exclusive ownership</b>. Sixteen threads hammering one counter make the line bounce between the cores\' caches. Every operation waits until the line is handed over. Add threads — it gets slower.</p><p>The cure is the same as for false sharing: give each thread its own counter (or a <code>ThreadLocal</code>) and sum at the end.</p>'
    },
    {
      t: 'choice',
      q: '16 threads call Interlocked.Increment on one field in a loop. Why is it slower than a single thread?',
      options: ['The cache line holding the counter bounces between cores, every operation waits for it', 'Interlocked takes a lock on an object, threads queue up', 'Under contention Interlocked falls back to the OS kernel', 'Interlocked.Increment retries until it wins'],
      answer: 0,
      explain: 'The atomic instruction blocks nothing and never enters the kernel. It simply cannot start until the core gets the line in exclusive ownership. The bottleneck is the cache coherence protocol.',
      wrong: { 1: 'There is no object and no Monitor here: it is a single CPU instruction.', 3: 'Retries belong to the CAS loop you write yourself. Increment on x64 is a single atomic instruction, and it always succeeds.' }
    },
    {
      t: 'learn',
      title: 'What Interlocked methods return',
      body: '<p>A common mistake is mixing up what comes back: the new value or the old one.</p><ul><li><code>Increment</code>, <code>Decrement</code>, <code>Add</code> — the <b>new</b> value;</li><li><code>Exchange</code> — the <b>old</b> one: you write yours and get what was there;</li><li><code>CompareExchange</code> — the <b>old</b> one, always, whether the swap happened or not;</li><li><code>And</code>, <code>Or</code> (.NET 5+) — the <b>old</b> one;</li><li><code>Read(ref long)</code> — an atomic read of a 64-bit number.</li></ul>',
      code: 'int n = 5;\nInterlocked.Add(ref n, 3);        // returns 8\nInterlocked.Exchange(ref n, 0);   // returns 8, n == 0\nInterlocked.Or(ref n, 0b100);     // returns 0, n == 4',
      deep: '<p><code>Interlocked.Read</code> exists only for <code>long</code>/<code>ulong</code>: in a 32-bit process a 64-bit read is two instructions, and without it you can read a "torn" value — the old half and the new half. In a 64-bit process an aligned <code>long</code> read is atomic anyway.</p><p>The set of overloads keeps growing: in .NET 9 <code>Exchange</code> and <code>CompareExchange</code> got versions for <code>byte</code> and <code>short</code>. For reference types there are the generic <code>Exchange&lt;T&gt;</code> and <code>CompareExchange&lt;T&gt;</code>.</p>'
    },
    {
      t: 'match',
      q: 'Match the call (n was 10) with what it returns',
      pairs: [
        ['Interlocked.Increment(ref n)', '11'],
        ['Interlocked.Exchange(ref n, 3)', '10, and n becomes 3'],
        ['Interlocked.CompareExchange(ref n, 7, 10)', '10, and n becomes 7'],
        ['Interlocked.CompareExchange(ref n, 7, 99)', '10, and n stays the same']
      ]
    },
    {
      t: 'learn',
      title: 'CompareExchange — the brick of lock-free code',
      body: '<p><code>CompareExchange(ref location, value, comparand)</code> atomically does: "if <code>location</code> holds <code>comparand</code>, write <code>value</code>". It returns what was in <code>location</code> before the call. This is CAS — compare-and-swap.</p><p>How to tell the swap succeeded: <b>you got back exactly what you expected</b> (<code>comparand</code>).</p><p>The trap is argument order: the new value first, then the expected one. Other languages and algorithm write-ups often do it the other way round.</p>',
      code: '//                         where      what to write if it holds\nint old = Interlocked.CompareExchange(ref _state, Running,     Idle);\nif (old == Idle)\n{\n    // we moved Idle → Running, and nobody else did\n}'
    },
    {
      t: 'learn',
      title: 'The CAS loop: read, compute, try',
      body: '<p>Interlocked can add, but it cannot "write the maximum". Any such update follows one pattern:</p><ul><li>read the current value;</li><li>compute the new value from the old one;</li><li>CAS: write the new value <b>if the old one has not changed</b>;</li><li>failed — someone got there first; take what they wrote and repeat.</li></ul><p>No lock, nobody sleeps. A thread that loses the race just redoes the computation with fresh data.</p>',
      code: 'static int _max;\n\nstatic void UpdateMax(int candidate)\n{\n    int current = Volatile.Read(ref _max);\n    while (candidate > current)\n    {\n        int seen = Interlocked.CompareExchange(ref _max, candidate, current);\n        if (seen == current) return;   // made it\n        current = seen;                // beaten: take the fresh value and retry\n    }\n}'
    },
    {
      t: 'order',
      q: 'Put the steps of one CAS loop iteration in order',
      items: ['Read the current value', 'Compute the new value from what you read', 'Call CompareExchange with what you read as the comparand', 'Compare the result with what you read', 'Not equal — take the returned value and repeat'],
      explain: 'The key is step 4: CompareExchange returns what was actually there. Equal to the expected value — the write went through. Not equal — that is your fresh value, no need to re-read the field.'
    },
    {
      t: 'tapline',
      q: 'A lock-free stack. Under contention it loses items. Which line should be inside the loop but is outside?',
      code: 'static void Push(Node node)\n{\n    Node? head = Volatile.Read(ref _head);\n    node.Next = head;\n    while (true)\n    {\n        Node? seen = Interlocked.CompareExchange(ref _head, node, head);\n        if (seen == head) return;\n        head = seen;\n    }\n}',
      answer: 3,
      explain: 'After a lost attempt head is updated, but node.Next still points at the old top. The next CAS successfully puts node on top — and the chain skips the items other threads pushed in between. The node\'s link must be recomputed on every iteration: the "compute the new value" step belongs inside the loop.'
    },
    {
      t: 'learn',
      title: 'Lock-free does not mean wait-free',
      body: '<p>A CAS loop is <b>lock-free</b>: at any moment at least one thread makes progress, and a stalled thread holds nobody up. But it is not <b>wait-free</b>: a particular thread under heavy contention can lose again and again.</p><p>Rules for a CAS loop:</p><ul><li>the computation inside is short and free of side effects: it may run several times;</li><li>CAS cannot update several fields at once — pack them into an immutable object and swap the reference;</li><li>immutable collections already have a ready-made loop: <code>ImmutableInterlocked.Update</code>.</li></ul><p>If the logic is more than a couple of lines, a <code>lock</code> is simpler, and without contention it is almost as fast.</p>',
      deep: '<p><b>The ABA problem</b>: CAS compares values, not history. It was A, became B, then A again — CAS decides nothing changed. In C/C++ this breaks lock-free stacks: a node is freed and reallocated at the same address. In .NET the garbage collector does not reuse an object\'s memory while a reference to it exists — and you hold one in <code>head</code>. So classic ABA with references does not happen here (unless you reuse nodes yourself through a pool), but with integers (counters, indices, versions) it remains.</p>'
    },
    {
      t: 'blanks',
      q: 'Lazy initialization without a lock: several threads may run the factory, but there will be one winner',
      code: 'static Config? _config;\n\nstatic Config Get()\n{\n    var existing = Volatile.Read(ref _config);\n    if (existing != null) return existing;\n\n    var created = new Config();\n    var winner = Interlocked.___(ref _config, created, ___);\n    return winner ?? created;\n}',
      tiles: ['CompareExchange', 'null', 'Exchange', 'created', 'existing'],
      answer: ['CompareExchange', 'null'],
      explain: 'We store our object only if the field still holds null. Got null back — we won, return created. Got non-null — someone was first, return their object, and ours becomes garbage. Exchange would overwrite another thread\'s object, and different threads would end up with different Config instances.'
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: ['Every Interlocked method is a full memory fence', 'CompareExchange returns true if the swap succeeded', 'The body of a CAS loop may run several times', 'Under contention Interlocked.Increment puts the thread to sleep in the kernel', 'Interlocked.Read is needed for long in a 32-bit process'],
      answer: [0, 2, 4],
      explain: 'CompareExchange returns the old value, not a bool. Increment never enters the kernel — it waits for the cache line at the hardware level. The loop body repeats on every lost attempt, so it must have no side effects.'
    }
  ]
};

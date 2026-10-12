/** Course "Memory in .NET", unit 1, lesson 2: reserve and commit, the numbers behind "memory used", OOM without a RAM shortage. */
export default {
  id: 'mem.u1.l2',
  title: 'Reserve and commit',
  sub: 'Why a process has several different memory numbers',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Two steps: claim the addresses, then back them',
      body: '<p>Getting memory from the OS can take two steps.</p><p><b>Reserve</b>: the process says "this range of addresses is mine". The OS just makes a note in the address space map. It costs neither RAM nor page file space.</p><p><b>Commit</b>: the OS <i>promises</i> that the pages in the range will have something behind them, and counts them against a global limit made up of RAM plus the page file. But a physical page still appears only on first touch, through that same soft page fault.</p>',
      flow: ['Reserve: addresses', 'Commit: a promise', 'First touch: RAM'],
      deep: 'On Windows both steps are done by VirtualAlloc: the MEM_RESERVE flag reserves, MEM_COMMIT commits. The reverse operations are VirtualFree with MEM_DECOMMIT (give back the promise, keep the addresses) and MEM_RELEASE (give back the addresses). Reservations come in multiples of 64 KB, commits in pages. Touching a page that is reserved but not committed is an access error.'
    },
    {
      t: 'blanks',
      q: 'Claim 1 GB of addresses, but back only the first 64 KB with memory',
      code: 'void* p = VirtualAlloc(null, 1 << 30, ___, PAGE_NOACCESS);\nVirtualAlloc(p, 64 * 1024, ___, PAGE_READWRITE);',
      tiles: ['MEM_RESERVE', 'MEM_COMMIT', 'MEM_RELEASE', 'MEM_DECOMMIT'],
      answer: ['MEM_RESERVE', 'MEM_COMMIT'],
      explain: 'First the whole range is reserved, then the first 64 KB are committed. The other addresses are taken but cost nothing until someone commits them.'
    },
    {
      t: 'learn',
      title: 'Linux: mmap and overcommit',
      body: '<p>On Linux the same two steps go through <code>mmap</code>: a range mapped with <code>PROT_NONE</code> is the counterpart of a reservation, and <code>mprotect</code> with read and write access is the counterpart of a commit.</p><p>The big difference is <b>overcommit</b>. By default Linux doesn’t keep strict count of its promises: it refuses only obviously impossible requests and grants the rest, betting that not all of that memory will be needed at once. Physical pages appear on first touch, just as on Windows.</p><p>If RAM and swap do run out, there’s no exception: the kernel starts the <b>OOM killer</b>, which kills a process with SIGKILL. The process simply vanishes, with no stack trace and no catch.</p>',
      deep: 'The mode is set in /proc/sys/vm/overcommit_memory: 0 is the heuristic (default), 1 allows everything, 2 is strict accounting against CommitLimit from /proc/meminfo. In a container the cgroup sets its own ceiling: go over the memory limit and the kernel kills the process inside the container, while the orchestrator sees exit code 137 (128 plus the SIGKILL number).'
    },
    {
      t: 'choice',
      q: 'Why can a program on Linux die from lack of memory not at the moment it allocates, but later?',
      options: [
        'Pages are handed out on first touch, there may not be enough of them then, and the OOM killer comes',
        'mmap always reports errors with a delay',
        'The garbage collector postpones the allocation until the next collection'
      ],
      answer: 0,
      explain: 'With overcommit, an allocation is only a promise. Real memory is needed at the first write, and if there is none, the kernel picks a victim and kills it.'
    },
    {
      t: 'learn',
      title: 'How much memory does the process use? Depends what you count',
      body: '<ul><li><b>Virtual size</b> (VSZ on Linux): every address in use, reserved, committed or mapped from files. For a .NET process that’s hundreds of gigabytes, and that’s fine.</li><li><b>Private bytes</b> (commit): committed memory that belongs to this process alone, what the OS has promised it. Grows when you leak.</li><li><b>Working set</b> (RSS on Linux): pages sitting in physical memory right now, including shared library pages.</li></ul><p>What’s promised hasn’t been touched yet, and what’s been touched the OS can evict, so the numbers drift apart. In the Memory column, Task Manager shows the private working set by default, which is yet another number.</p>',
      deep: 'The working set can shrink without the program doing anything: under pressure the OS takes pages away and they go to standby. If the process touches them again, bringing them back is a soft fault. On Linux the most precise view is /proc/PID/smaps_rollup: it has Rss, Pss (shared pages divided between the processes) and anonymous memory. The private working set on Windows is the working set without shared pages.'
    },
    {
      t: 'match',
      q: 'Match each number with what it counts',
      pairs: [
        ['Virtual size', 'Every address in use, even with no memory behind it'],
        ['Private bytes', 'Committed memory of this process alone'],
        ['Working set / RSS', 'Pages that are in RAM right now'],
        ['Commit limit', 'RAM plus the page file']
      ]
    },
    {
      t: 'learn',
      title: 'How the CLR gets memory for the heap',
      body: '<p>At startup the garbage collector <b>reserves</b> a large contiguous range of addresses, hundreds of gigabytes in a 64-bit process. Addresses are free, and the heap knows it has room to grow.</p><p>From there the heap <b>commits</b> memory in chunks as it grows, and after a collection it can hand unneeded chunks back to the OS (decommit). So:</p><ul><li>the virtual size is huge from the first second;</li><li>private bytes follow the size of the heap;</li><li>the working set is whatever the program has touched recently.</li></ul>',
      deep: 'Since .NET 7 the heap is made of regions: by default 4 MB for ordinary objects and 32 MB for large ones. The initial reservation for regions is 256 GB by default, more on machines with a very large amount of RAM; the GCRegionRange setting changes it. GCHeapHardLimit caps the heap; in a container with a memory limit it defaults to 75% of that limit. From code you can see the numbers through GC.GetGCMemoryInfo(): HeapSizeBytes, TotalCommittedBytes, TotalAvailableMemoryBytes.'
    },
    {
      t: 'choice',
      q: 'A service on .NET 9 shows a virtual size of 260 GB and a working set of 300 MB. What does that mean?',
      options: [
        'All is well: addresses are reserved, and about 300 MB sit in RAM',
        'A 260 GB leak',
        'The process wrote 260 GB to the page file'
      ],
      answer: 0,
      explain: 'A huge virtual size in .NET is the address reservation for the heap. It uses neither RAM nor the page file. You hunt leaks by private bytes and the size of the managed heap.'
    },
    {
      t: 'tapline',
      q: 'Which line shows how much of the process’s memory is in RAM right now?',
      code: 'var p = Process.GetCurrentProcess();\nlong virt = p.VirtualMemorySize64;\nlong priv = p.PrivateMemorySize64;\nlong ws = p.WorkingSet64;\nlong heap = GC.GetTotalMemory(false);',
      answer: 3,
      explain: 'WorkingSet64 is the working set, the pages in physical memory. VirtualMemorySize64 is all addresses, PrivateMemorySize64 is committed private memory, and GC.GetTotalMemory is how many bytes the GC estimates managed objects take.'
    },
    {
      t: 'learn',
      title: 'OutOfMemoryException with RAM to spare',
      body: '<p>OutOfMemoryException doesn’t mean "RAM ran out". Typical causes:</p><ul><li><b>The commit limit is exhausted.</b> Windows has already promised all of RAM and the page file to processes. Actual RAM use may be low, since the promises are untouched, but the OS won’t make new ones.</li><li><b>The GC heap limit is reached.</b> In a container or with GCHeapHardLimit, the runtime throws at its own boundary even if the machine has gigabytes free.</li><li><b>No contiguous range of addresses.</b> A 32-bit problem: 2–4 GB of addresses get fragmented and a big array has nowhere to go.</li><li><b>The object is too big.</b> An array longer than Array.MaxLength can’t be created no matter how much memory you have.</li></ul><p>And on Linux without limits it may never get as far as an exception: the OOM killer kills the process.</p>',
      deep: 'Before an operation that is certain to need a lot of memory, you can ask in advance: MemoryFailPoint checks whether there’s room and throws InsufficientMemoryException before the work starts rather than halfway through. If OOM hits a 64-bit process on a big server, first check the container limits and the GC settings in runtimeconfig.json.'
    },
    {
      t: 'multi',
      q: 'What can cause an OutOfMemoryException while Task Manager shows gigabytes of free RAM? Select all that apply.',
      options: [
        'The commit limit is exhausted: RAM and the page file are already promised',
        'A process in a container hit the GC heap limit',
        'A 32-bit process couldn’t find a contiguous range of addresses',
        'Too many threads are waiting on a lock',
        'The garbage collector is off by default'
      ],
      answer: [0, 1, 2],
      explain: 'Waiting on a lock costs no memory, and the garbage collector is always on. The other three are the classics: the memory is promised, you hit your own ceiling, or there were no consecutive addresses.'
    },
    {
      t: 'choice',
      q: 'A 64-bit process calls VirtualAlloc with MEM_RESERVE for 1 GB a hundred times and writes nothing. What grew?',
      options: ['Only the virtual size', 'The working set, by 100 GB', 'Private bytes, by 100 GB', 'Nothing: Windows refuses on the second call'],
      answer: 0,
      explain: 'A reservation is only addresses. 100 GB fits easily into 128 TB of user space, and no commit or RAM is used.'
    }
  ]
};

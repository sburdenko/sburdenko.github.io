/** Course "Memory in .NET", unit 1, lesson 1: the virtual address space, pages, page faults. */
export default {
  id: 'mem.u1.l1',
  title: 'Virtual memory',
  sub: 'Addresses, pages, the MMU and page faults',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'An address in your program is not an address in RAM',
      body: '<p>When C# code reads an object’s field, the CPU gets an address like <code>0x7FF6_1234_5678</code>. That’s a <b>virtual</b> address: it says nothing about which memory chip actually holds the bytes.</p><p>Every process has its own <b>address space</b>, a huge map of addresses that is almost entirely empty. On every access the CPU translates the virtual address into a physical one. The translation is done by a unit inside the CPU, the <b>MMU</b>, and the OS keeps the translation rules in the process’s <b>page table</b>.</p>',
      flow: ['Virtual address', 'MMU', 'Page table', 'Physical address'],
      deep: 'Why bother: processes are isolated from each other, you can hand out more addresses than there is RAM, rarely used data can be moved out to disk, and a file can be mapped into memory as if it were an array. The OS’s own code lives in the same map, but in the half that user code cannot touch.'
    },
    {
      t: 'learn',
      title: 'Pages',
      body: '<p>Translating every byte separately would be far too expensive, so memory is split into <b>pages</b>, usually <b>4 KB</b> (4096 bytes) each. Translation works in whole pages.</p><p>An address splits into two parts: the high bits are the page number, the low 12 bits are the offset inside the page (2<sup>12</sup> = 4096). For <code>0x7FF6_1234_5678</code> the offset is <code>0x678</code> and the page number is everything else.</p><p>A page table entry holds the physical page number plus flags: is the page in memory, is it writable, can code run from it, can user code access it.</p>',
      deep: 'On x86-64 the page table is a four-level tree, 9 address bits per level, plus 12 bits of offset: 48 bits in total. Walking the tree on every read would be slow, so finished translations are cached in the <b>TLB</b>, a small buffer inside the CPU. A TLB miss costs a table walk. There are also large pages: 2 MB and 1 GB on x86-64. The normal page size depends on the platform: 4 KB on x86-64, 16 KB on Macs with Apple Silicon, and on ARM64 Linux the kernel is built with 4, 16 or 64 KB pages. From .NET you can read it with Environment.SystemPageSize.'
    },
    {
      t: 'choice',
      q: 'How many low bits of an address hold the offset inside a 4 KB page?',
      options: ['12', '4', '32', '64'],
      answer: 0,
      explain: '4096 is 2 to the power of 12, so an offset from 0 to 4095 fits in exactly 12 bits. The remaining bits are the page number.'
    },
    {
      t: 'learn',
      title: 'Page faults',
      body: '<p>What if the page table entry says "this page is not in memory"? The CPU stops the instruction and calls an OS handler: that’s a <b>page fault</b>. The OS works out what happened:</p><ul><li><b>Soft (minor) fault</b>: the data is already in RAM, or all it takes is a zeroed page. The OS fills in the table entry and that’s it. Cost: on the order of a microsecond.</li><li><b>Hard (major) fault</b>: the page must be read from disk, from the page file or from a mapped file such as DLL code. Cost: from tens of microseconds on an SSD to milliseconds on an HDD.</li><li><b>The address maps to nothing</b>: the OS reports an access error, an access violation on Windows, a SIGSEGV signal on Linux.</li></ul><p>After a soft or hard fault the instruction runs again and the program notices nothing, except the time it lost.</p>',
      deep: 'The first touch of freshly allocated memory is a page fault too: that is the moment the OS hands out a zeroed page. On Linux you can see the counts with ps -o min_flt,maj_flt -p PID or in the output of /usr/bin/time -v; on Windows, in the process performance counters. A null dereference in .NET also starts as an access error: pages near address zero are never mapped, and the runtime turns that fault into a NullReferenceException.'
    },
    {
      t: 'match',
      q: 'Match the event with what it means',
      pairs: [
        ['Soft page fault', 'The page is already in RAM, it only needs mapping'],
        ['Hard page fault', 'The page has to be read from disk'],
        ['Access to an unmapped address', 'Access violation or SIGSEGV'],
        ['TLB', 'A cache of finished address translations']
      ]
    },
    {
      t: 'learn',
      title: 'One address, two processes',
      body: '<p>Run a program twice and print the address of the same variable: the numbers may match. There’s no conflict: each process has <b>its own page table</b>, and the same virtual page leads to different physical pages in each.</p><p>A process can’t even name another process’s memory: every address it uses is translated through its own table. That’s what isolation means.</p><p>The reverse happens too: one physical page can be visible in several processes. That’s how the OS shares the code of system libraries and the runtime: it’s loaded into RAM once and mapped into every process that needs it.</p>',
      deep: 'ASLR, the random placement of modules, stacks and heaps at startup, makes matching addresses rarer and gets in the way of attacks, but the rule stays the same. You can read another process’s memory only through the OS (ReadProcessMemory on Windows, process_vm_readv on Linux, with the right permissions) or by agreeing on shared memory up front; in .NET that’s MemoryMappedFile. Shared library pages are marked copy-on-write: a process that tries to write gets its own copy.'
    },
    {
      t: 'choice',
      q: 'Two processes write different numbers to the same virtual address at the same time. What does each of them read back?',
      options: ['Each reads its own number', 'Both read the number of whoever wrote last', 'The second process gets an access error'],
      answer: 0,
      wrong: { 1: 'That would happen if the address were physical. But the processes have different page tables.', 2: 'There’s no error: in each process the address maps to that process’s own page.' },
      explain: 'The same virtual address in two processes goes through two different page tables and ends up in different physical pages.'
    },
    {
      t: 'learn',
      title: 'How much is 64 bits',
      body: '<p>A pointer in a 64-bit process takes 8 bytes, but today’s x86-64 CPUs use only <b>48 bits</b> of a virtual address, which is 256 TB. Half goes to the kernel and half to the process: <b>128 TB</b> of user space on both Windows and Linux.</p><p>For comparison, a 32-bit process sees only 4 GB of addresses, and on Windows it gets 2 GB of them by default.</p><p>The takeaway: a 64-bit process practically never runs out of addresses. What runs out is something else: physical memory and how much the OS is willing to promise. That’s the next lesson.</p>',
      deep: 'The top 16 bits of a 48-bit address must repeat bit 47 (a canonical address), which is why user addresses look like 0x0000_7FFx_xxxx_xxxx and kernel addresses start with 0xFFFF. Newer CPUs support five-level page tables and 57-bit addresses; Linux then hands out addresses above 128 TB only to programs that explicitly ask for them. A 32-bit process with the LargeAddressAware flag gets up to 4 GB on 64-bit Windows.'
    },
    {
      t: 'order',
      q: 'A program reads a freshly allocated page for the first time. Put the steps in order',
      items: [
        'An instruction accesses a virtual address',
        'The MMU finds no translation in the TLB and walks the page table',
        'The entry is marked "not in memory", so the CPU raises a page fault',
        'The OS takes a free physical page, zeroes it and fills in the entry',
        'The instruction runs again and reads 0'
      ],
      explain: 'This is a soft fault: no disk involved, the OS just finds a physical page and zeroes it. It zeroes it so the process can’t see someone else’s data.'
    },
    {
      t: 'multi',
      q: 'What is true about virtual memory? Select all that apply.',
      options: [
        'Every process has its own address space',
        'The OS maps memory in whole pages',
        'A virtual address is the same as a cell number in RAM',
        'A hard page fault costs about as much as an L1 cache read',
        'One physical page can be visible in several processes'
      ],
      answer: [0, 1, 4],
      explain: 'A virtual address is translated through the page table and can lead anywhere. A hard fault is a disk read: it costs tens of thousands of times more than an L1 read, or worse.'
    },
    {
      t: 'choice',
      q: 'A RAM read takes on the order of 100 ns. How much longer does a hard page fault served from an SSD take?',
      options: ['About a thousand times longer or more', 'About twice as long', 'The same: both are memory', 'It’s faster: the disk caches'],
      answer: 0,
      explain: 'A hard fault from an SSD takes tens or hundreds of microseconds, three orders of magnitude more than a RAM access. With a spinning disk it’s milliseconds, another one or two orders worse. That’s why a program that runs short of RAM slows down so abruptly.'
    }
  ]
};

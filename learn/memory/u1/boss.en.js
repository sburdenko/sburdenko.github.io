/** Unit 1 final of the "Memory in .NET" course: memory through the OS's eyes. */
export default {
  id: 'mem.u1.boss',
  title: 'Final: memory through the OS\'s eyes',
  sub: 'Pages, reserve and commit, the stack and caches',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'memory',
      task: 'Step through the call to Draw: what lives in the frame, what lives on the heap, and what is left after the method returns?',
      goal: 'end',
      code: 'static void Main()\n{\n    var origin = new Vector2(0, 0);   // struct\n    Draw(origin);\n}\nstatic void Draw(Vector2 at)\n{\n    var list = new List<int>();\n    int count = 3;\n}',
      steps: [
        { line: 2, note: 'The struct is 8 bytes right in Main\'s frame. Space for the frame was taken with a single stack pointer move on method entry; the OS is not involved.', ops: [{ op: 'new', name: 'origin', type: 'Vector2', kind: 'val', fields: { X: 0, Y: 0 } }] },
        { line: 3, note: 'The call pushes a new frame: return address, saved registers, locals. The parameter at is a copy of the whole struct.', ops: [{ op: 'call', fn: 'Draw', params: [{ name: 'at', from: 'origin' }] }] },
        { line: 7, note: 'The frame holds only an 8-byte reference. The List<int> itself is on the heap, in memory the GC reserved and committed from the OS in advance.', ops: [{ op: 'new', name: 'list', type: 'List<int>', kind: 'ref', fields: { Count: 0 } }] },
        { line: 8, note: 'The number is in the frame too. Or only in a register: that is up to the JIT.', ops: [{ op: 'int', name: 'count', value: 3 }] },
        { line: 9, note: 'The frame is gone: the stack pointer moved back, and the stack pages still belong to the thread. The list is now garbage — the GC removes it, not the method return.', ops: [{ op: 'ret' }] }
      ],
      solve: ['step', 'step', 'step', 'step', 'step']
    },
    {
      t: 'choice',
      q: 'Pages are 4 KB. Which two addresses are on the same page?',
      options: [
        '0x7FF6_1234_5000 and 0x7FF6_1234_5FFF',
        '0x7FF6_1234_5FFF and 0x7FF6_1234_6000',
        '0x7FF6_1234_5678 and 0x7FF6_1235_5678',
        '0x0000_0000_1000 and 0x0000_0000_2000'
      ],
      answer: 0,
      explain: 'The low 12 bits are the offset; the rest is the page number. The first pair shares the page number (0x7FF6_1234_5), with offsets 0x000 and 0xFFF — the start and end of the page. 0x…5FFF and 0x…6000 are adjacent bytes, but on different pages.'
    },
    {
      t: 'order',
      q: 'The life of a page obtained through VirtualAlloc. Put the steps in order',
      items: [
        'MEM_RESERVE: the address range is marked as taken',
        'MEM_COMMIT: the OS counts the pages against the commit limit',
        'First write: a soft page fault, and the OS hands out a zeroed physical page',
        'The page joins the process working set',
        'MEM_DECOMMIT: the promise is returned, the addresses are still taken',
        'MEM_RELEASE: the addresses are free again'
      ],
      explain: 'Virtual size grows at step one, private bytes at step two, the working set at steps three and four. Going back happens in reverse: first the promise is returned, then the addresses.'
    },
    {
      t: 'choice',
      q: 'A Linux process maps 1 GB read-write with mmap and writes one byte into every 4 KB page of the first 100 MB. Roughly how much did VSZ and RSS grow?',
      options: ['VSZ by 1 GB, RSS by 100 MB', 'VSZ and RSS by 1 GB', 'VSZ and RSS by 100 MB', 'VSZ by 1 GB, RSS barely grew'],
      answer: 0,
      explain: 'VSZ counts all taken addresses — the whole gigabyte right after mmap. A physical page appears on first touch, and every page of the first 100 MB was touched, so RSS gains about 100 MB.',
      wrong: { 3: 'One write per page is enough: the page fault brings in a whole physical page for it.' }
    },
    {
      t: 'match',
      q: 'Match the symptom to the cause',
      pairs: [
        ['A container exited with code 137', 'The kernel killed the process for exceeding the memory limit'],
        ['The process vanished after deep recursion, finally never ran', 'Stack overflow'],
        ['OutOfMemoryException on Windows with free RAM', 'The commit limit is exhausted'],
        ['Virtual size 260 GB, working set 300 MB', 'Address space reserved for the GC heap'],
        ['Two threads write to adjacent array cells and slow down', 'False sharing']
      ]
    },
    {
      t: 'tapline',
      q: 'n comes from a network request. Which line can terminate the process with no exception to catch?',
      code: 'void Handle(int n)\n{\n    Span<byte> small = stackalloc byte[256];\n    int[] arr = new int[n];\n    Span<byte> buf = stackalloc byte[n];\n    Process(small, arr, buf);\n}',
      answer: 4,
      explain: 'A stackalloc sized by input can run past the stack reservation — that is a stack overflow, and the runtime terminates the process. A huge new int[n] throws an ordinary OutOfMemoryException that you can catch. For large, unpredictable sizes use an array or ArrayPool; stackalloc only with a size check.'
    },
    {
      t: 'multi',
      q: 'Which are true about CPU caches? Select all.',
      options: [
        'Reading one int brings the whole cache line into the cache — usually 64 bytes',
        'Walking an int[,] with the outer loop over rows is faster than over columns',
        'An array of structs is read sequentially, an array of classes by following references',
        'False sharing corrupts data: the result becomes wrong',
        'The more threads write to adjacent cells, the faster the work goes'
      ],
      answer: [0, 1, 2],
      explain: 'False sharing is a speed problem, not a correctness one: the data is right, but the cache line bounces between cores. That is why adding threads that write to one line does not speed things up, and often slows them down.'
    },
    {
      t: 'choice',
      q: 'A request handler on the thread pool parses JSON recursively, and the client controls the depth. How do you protect it?',
      options: [
        'Check RuntimeHelpers.EnsureSufficientExecutionStack() and catch InsufficientExecutionStackException',
        'Wrap the parsing in catch (StackOverflowException)',
        'Increase the main thread stack in the exe header',
        'Call GC.Collect() before parsing'
      ],
      answer: 0,
      explain: 'That method throws an ordinary exception while there is still stack left — you can catch it and return an error to the client. Even more robust: cap the depth or rewrite the walk with an explicit Stack<T>.',
      wrong: { 1: 'StackOverflowException cannot be caught in .NET: the process terminates immediately.', 2: 'A bigger stack only moves the limit: the client will send deeper nesting. Besides, pool threads do not necessarily take their stack size from the exe header.', 3: 'The stack is not managed by the garbage collector.' }
    },
    {
      t: 'choice',
      q: 'new byte[1_500_000_000] works in a 64-bit process but throws OutOfMemoryException in a 32-bit one on the same machine. Why?',
      options: [
        'A 32-bit process has no contiguous free address range that large',
        'In a 32-bit process an array cannot be longer than a million elements',
        'A 32-bit process cannot commit more than 1 GB in one call',
        '32-bit processes have no page file'
      ],
      answer: 0,
      explain: 'An array must occupy one contiguous address range. A 32-bit process has only 2–4 GB of addresses, already split among modules, stacks and the heap. A 64-bit process has 128 TB of addresses — there is always room.'
    }
  ]
};

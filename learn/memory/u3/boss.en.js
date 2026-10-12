/** Final of the "Inside the heap" unit of the Memory in .NET course. */
export default {
  id: 'mem.u3.boss',
  title: 'Final: inside the heap',
  sub: 'Header, layout, arrays and heaps',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'An object was used as a Dictionary key (its hash taken via the non-overridden GetHashCode), and then it is locked on. What happens to the header?',
      options: ['The hash already occupies the header, so the CLR creates a sync block and writes its index into the header', 'The thin lock overwrites the hash, and the key gets lost', 'lock throws SynchronizationLockException', 'The hash is recomputed after leaving the lock'],
      answer: 0,
      explain: 'The 32 header bits hold only one thing: a thin lock, a hash or a sync block index. When both are needed, the hash and the monitor state move into a sync block, and the hash does not change.'
    },
    {
      t: 'choice',
      q: 'How many bytes does an object of this class take on x64?',
      code: 'class Node\n{\n    public byte Kind;\n    public Node? Next;\n    public int Value;\n}',
      options: ['32', '40', '24', '28'],
      answer: 0,
      explain: 'Auto layout: Next (+0), Value (+8), Kind (+12). 13 bytes of fields → 16, plus 16 of bookkeeping — 32.',
      wrong: { 1: 'That is what the source order would give: byte, a 7-byte gap, a reference, an int, a 4-byte gap. But the CLR reorders class fields.' }
    },
    {
      t: 'order',
      q: 'Put the parts of new int[4] in order from the lowest address to the highest (x64)',
      items: ['Object header', 'MethodTable pointer', 'Array length (4 bytes)', 'Padding (4 bytes)', 'Elements [0]…[3]'],
      explain: 'The header is at ref − 8, the type pointer at the reference address, then the length padded to 8 bytes and the elements back to back. 24 + 16 = 40 bytes in total.'
    },
    {
      t: 'multi',
      q: 'What goes straight to the LOH? Select all.',
      options: ['new double[11_000]', 'new char[40_000]', 'new string(\'x\', 45_000)', 'new object[12_000]', 'new Guid[5_000]'],
      answer: [0, 2, 3],
      explain: 'double[11,000] is 88,024 bytes, a 45,000-character string is 90,022, object[12,000] is 96,024. char[40,000] and Guid[5,000] are 80,024 bytes each, below the 85,000 threshold.'
    },
    {
      t: 'choice',
      q: 'What does Unsafe.SizeOf<S>() return?',
      code: 'struct S\n{\n    public byte A;\n    public string? B;\n    public byte C;\n}',
      options: ['16', '24', '10', '32'],
      answer: 0,
      explain: 'A reference inside a struct switches it to auto layout: B (+0), A (+8), C (+9), rounded to 16. Sequential with gaps would give 24.',
      wrong: { 1: 'That is what sequential layout would give. But with a reference inside, the CLR lays the struct out like a class.' }
    },
    {
      t: 'match',
      q: 'Match the term to its meaning',
      pairs: [
        ['Sync block', 'An entry in a separate table for the hash and the monitor'],
        ['GCDesc', 'Where the references sit inside an object'],
        ['ComponentSize', 'The size of an array element or a string character'],
        ['Region', 'A heap block that belongs to one generation'],
        ['Non-GC heap', 'Literals and typeof results that are never collected']
      ]
    },
    {
      t: 'blanks',
      q: 'Allocate a long-lived buffer for native I/O that will never move',
      code: 'byte[] buf = GC.___<byte>(64 * 1024, ___: true);',
      tiles: ['AllocateArray', 'pinned', 'Alloc', 'fixed', 'KeepAlive'],
      answer: ['AllocateArray', 'pinned'],
      explain: 'pinned: true puts the array in the POH — objects there do not move, need no pinning and do not get in the way of SOH compaction.'
    },
    {
      t: 'choice',
      q: 'What changed in the heap with the move to regions in .NET 7?',
      options: ['The heap is split into small regions that can pass between generations and go back to the OS one by one', 'The LOH threshold grew to 4 MB', 'The collector stopped dividing objects into generations', 'Objects in the SOH no longer move'],
      answer: 0,
      explain: 'Generations, the LOH threshold and compaction stayed. The physical structure changed: instead of large segments, regions of 4 MB (32 MB for the LOH and POH) that move flexibly between generations.'
    },
    {
      t: 'choice',
      q: 'Library v2 reordered the fields of a public struct without references. The app writes it to a file as bytes via MemoryMarshal. What breaks?',
      options: ['Reading files written by v1: the byte order is part of the format', 'Nothing: the CLR computes offsets at load time', 'Type loading: TypeLoadException', 'Nothing: structs have auto layout'],
      answer: 0,
      explain: 'For access from IL the reordering is safe — offsets are computed at load time. But a struct without references has sequential layout, and its bytes in the file follow the field order.'
    }
  ]
};

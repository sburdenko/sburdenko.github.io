/** Memory in .NET, unit "Inside the heap", lesson 2: field layout and alignment. */
export default {
  id: 'mem.u3.l2',
  title: 'Field layout',
  sub: 'Who decides the field order and where the gaps come from',
  minutes: 9,
  cards: [
    {
      t: 'learn',
      title: 'Source order is not memory order',
      body: '<p>For a class the C# compiler writes <b>auto layout</b> into the metadata: "lay it out as you see fit". And the CLR lays it out its own way:</p><ul><li>8-byte fields first, and among them <b>references</b> come first;</li><li>then 4-byte, 2-byte and 1-byte fields;</li><li>nested structs at the end.</li></ul><p>Each field sits at an offset that is a multiple of its size. Large fields in front, small ones behind — this leaves almost no gaps between them. The offsets in the example were measured on .NET 9, x64, and are counted from the first field.</p>',
      code: 'class Mixed\n{\n    public byte B;     // +22\n    public int I;      // +16\n    public string? O;  // +0: references first\n    public long L;     // +8\n    public short S;    // +20\n}\n// fields: 23 bytes → 24; object: 16 + 24 = 40 bytes',
      deep: '<p>The logic is in <code>MethodTableBuilder::PlaceInstanceFields</code> (<code>src/coreclr/vm/methodtablebuilder.cpp</code>): fields are grouped by size, groups are placed from large to small, and references take the start of the pointer-size group. That way all references of an object form one contiguous "series", and the GCDesc describes them with a single entry — easier for the collector to walk.</p><p>The exact order is an implementation detail, not a contract. Code that relies on the field offsets of a class may break on another runtime version or another platform.</p>'
    },
    {
      t: 'choice',
      q: 'How many bytes does an object of this class take on x64?',
      code: 'class Tick\n{\n    public byte Side;\n    public long Time;\n    public byte Flags;\n}',
      options: ['32', '40', '26', '24'],
      answer: 0,
      explain: 'The CLR puts Time first (+0), followed by Side (+8) and Flags (+9). 10 bytes of fields round up to 16, plus 16 bytes of bookkeeping — 32.',
      wrong: { 1: 'That is what the source order would give: byte, a 7-byte gap, long, byte, another 7-byte gap. But a class has auto layout.', 2: 'On x64 an object size is always a multiple of 8.' }
    },
    {
      t: 'learn',
      title: 'Alignment: where the gaps come from',
      body: '<p><b>Natural alignment</b>: a field of N bytes sits at an address that is a multiple of N. <code>long</code> — a multiple of 8, <code>int</code> — 4, <code>short</code> — 2. The CPU reads an aligned value in one access, and it never straddles a cache line.</p><p>There is a correctness guarantee too: reading and writing an aligned reference is atomic. Another thread never sees "half an address". Reference safety under races rests on this.</p><p>The price is <b>padding</b>: empty bytes between fields and at the end of the object, so that the next object also starts at an address that is a multiple of 8.</p>',
      deep: '<p>The CLI specification (ECMA-335, section I.12.6.6) guarantees atomic reads and writes of aligned values no larger than a pointer. That is why <code>long</code> is atomic in a 64-bit process but not in a 32-bit one, and <code>decimal</code> and large structs are not atomic anywhere.</p>'
    },
    {
      t: 'order',
      q: 'In what order will the CLR lay out the fields of this class? From the lowest offset to the highest.',
      code: 'class Row\n{\n    public short S;\n    public object? R;\n    public int I;\n    public byte B;\n    public long L;\n}',
      items: ['object R', 'long L', 'int I', 'short S', 'byte B'],
      explain: 'First the 8-byte group, with the reference first in it: R (+0), L (+8). Then I (+16), S (+20), B (+22). That is exactly what .NET 9 x64 does; the order inside a group is an implementation detail.'
    },
    {
      t: 'learn',
      title: 'Inheritance: base fields first',
      body: '<p>Base class fields sit at the start, derived class fields after them. The CLR cannot interleave them: the base class code already accesses its fields at fixed offsets, and they must stay the same in the derived class.</p><p>If the base fields end off an 8-byte boundary, the CLR tucks small derived fields into the tail — a <code>byte</code>, for example. References do not move like that: they stay in their group, and a gap may remain.</p>',
      code: 'class Base { public byte X; }           // X: +0\nclass Derived : Base\n{\n    public byte Y;   // +1: took the gap after X\n    public long Z;   // +8\n}\n// fields: 16 bytes; a Derived object: 32 bytes',
      deep: '<p>A deep hierarchy with one <code>bool</code> per level loses bytes to padding: each level starts its group of large fields at an alignment boundary. That is one reason to keep "hot" types with millions of instances flat.</p>'
    },
    {
      t: 'multi',
      q: 'What is true about class layout in CoreCLR? Select all.',
      options: ['Base class fields come before derived class fields', 'The CLR puts references at the start of the 8-byte field group', 'The field order in the class source defines the order in memory', 'An object size on x64 is a multiple of 8', 'A bool field takes 1 bit'],
      answer: [0, 1, 3],
      explain: 'Classes have auto layout, the source order does not matter. A bool field takes a whole byte: the CPU cannot address a single bit.'
    },
    {
      t: 'learn',
      title: 'Structs: Sequential until there is a reference',
      body: '<p>For a struct the C# compiler writes <b>sequential layout</b>: fields in memory in declaration order, with gaps for alignment. The order matters for native interop and for <code>MemoryMarshal</code>.</p><p>But if the struct contains a <b>reference</b>, the CLR silently switches to auto layout: references cannot be passed to native code as is anyway, and the collector prefers them grouped together.</p>',
      code: 'struct Seq    { byte A; long L; byte C; }     // 24 bytes: A, 7-byte gap, L, C, 7-byte gap\nstruct Sorted { long L; byte A; byte C; }     // 16 bytes\nstruct WithRef { byte A; object O; byte C; }  // 16 bytes: O, A, C — reordered',
      deep: '<p><code>methodtablebuilder.cpp</code> says exactly that: if the parent is not Object/ValueType/Sequential, or the type has reference fields, Sequential is replaced by Auto. The marshalling layout is a separate story: <code>Marshal.SizeOf</code> computes the native struct by the marshaller\'s rules. The reverse also exists: <code>[StructLayout(LayoutKind.Auto)]</code> on a struct lets the CLR reorder fields, but such a struct cannot be passed to native code.</p>'
    },
    {
      t: 'choice',
      q: 'What does Unsafe.SizeOf<S>() return?',
      code: 'struct S\n{\n    public byte A;\n    public long B;\n    public byte C;\n}',
      options: ['24', '16', '10', '17'],
      answer: 0,
      explain: 'A struct without references is sequential: A (+0), a 7-byte gap, B (+8), C (+16), another 7 bytes up to a multiple of 8. Put B first and it becomes 16.',
      wrong: { 1: '16 is what a class with these fields would get, or a struct with reordered fields. But a struct without references keeps the source order.', 2: '10 is the sum of the field sizes. Without Pack = 1 alignment does not go away.' }
    },
    {
      t: 'blanks',
      q: 'A network packet header must take exactly 10 bytes, in the field order of the protocol',
      code: '[StructLayout(LayoutKind.___, Pack = ___)]\nstruct PacketHeader\n{\n    public byte Version;\n    public long Timestamp;\n    public byte Flags;\n}',
      tiles: ['Sequential', 'Auto', 'Explicit', '1', '8', '4'],
      answer: ['Sequential', '1'],
      explain: 'Sequential keeps the field order, Pack = 1 removes the gaps: 1 + 8 + 1 = 10 bytes. Auto would reorder the fields, and Explicit requires a FieldOffset on every field. An unaligned long is slower to read, so Pack = 1 is for data formats only.'
    },
    {
      t: 'learn',
      title: 'Explicit and "version 2"',
      body: '<p><code>LayoutKind.Explicit</code> with <code>[FieldOffset]</code> sets offsets by hand — this is how unions are made. One restriction: a reference cannot overlap a non-reference and cannot be misaligned. Otherwise the collector would take a number for an address. Such a type will not load: <code>TypeLoadException</code>.</p><p><b>Version 2.</b> Reordering the fields of a class in a new library version is safe: IL accesses a field by a metadata token, and the CLR computes the offset when it loads the type. But for a struct that is written to a file or a socket as bytes, the field order is part of the format: old files will be read wrong.</p>',
      code: '[StructLayout(LayoutKind.Explicit)]\nstruct Bad\n{\n    [FieldOffset(0)] public long Number;\n    [FieldOffset(0)] public string Text;  // a reference over a number\n}\n// TypeLoadException when the type Bad is loaded',
      deep: '<p>The exception message names the cause directly: "contains an object field at offset 0 that is incorrectly aligned or overlapped by a non-object field". Two references at the same offset are allowed. The compiler does not catch it: the type loader checks it on first use of the type, that is, when the JIT compiles a method that uses it.</p>'
    },
    {
      t: 'choice',
      q: 'Library v2 reordered the private fields of the public class Order. The app was built against v1 and not rebuilt. What happens?',
      options: ['Everything works: the CLR computes field offsets at load time', 'MissingFieldException on field access', 'v1 methods read the wrong fields', 'TypeLoadException when Order is loaded'],
      answer: 0,
      explain: 'IL has no offsets — only field tokens. The CLR builds the layout when it loads the type, and all code, library and app alike, uses the same one. Concrete offsets appear only in machine code, and the JIT produces it after the type is loaded.'
    },
    {
      t: 'choice',
      q: 'A struct holds a binary file record and is written with MemoryMarshal.AsBytes. In v2 two int fields were swapped. What happens to old files?',
      options: ['The values of the two fields are read swapped', 'Nothing: the CLR fixes the order itself', 'An exception on read', 'Nothing: structs have auto layout'],
      answer: 0,
      explain: 'A struct without references has sequential layout, and the bytes in the file follow the field order. Change the order and you change the format. Such structs are versioned explicitly: a version number in the file header, new fields only at the end.'
    }
  ]
};

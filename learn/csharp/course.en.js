/** The "Deeper C#" course: generics, delegates, LINQ, Span and modern C#. */
import u6l1 from './u6/l1-object.en.js?v=202610121136';
import u6l2 from './u6/l2-casts.en.js?v=202610121136';
import u6l3 from './u6/l3-primitives.en.js?v=202610121136';
import u6boss from './u6/boss.en.js?v=202610121136';
import u1l1 from './u1/l1-why.en.js?v=202610121136';
import u1l2 from './u1/l2-constraints.en.js?v=202610121136';
import u1l3 from './u1/l3-variance.en.js?v=202610121136';
import u1boss from './u1/boss.en.js?v=202610121136';
import u2l1 from './u2/l1-delegates.en.js?v=202610121136';
import u2l2 from './u2/l2-events.en.js?v=202610121136';
import u2l3 from './u2/l3-closures.en.js?v=202610121136';
import u2l4 from './u2/l4-inside.en.js?v=202610121136';
import u2boss from './u2/boss.en.js?v=202610121136';
import u3l1 from './u3/l1-lazy.en.js?v=202610121136';
import u3l2 from './u3/l2-materialize.en.js?v=202610121136';
import u3l3 from './u3/l3-cost.en.js?v=202610121136';
import u3boss from './u3/boss.en.js?v=202610121136';
import u4l1 from './u4/l1-span.en.js?v=202610121136';
import u4l2 from './u4/l2-refstruct.en.js?v=202610121136';
import u4l3 from './u4/l3-copies.en.js?v=202610121136';
import u4boss from './u4/boss.en.js?v=202610121136';
import u5l1 from './u5/l1-patterns.en.js?v=202610121136';
import u5l2 from './u5/l2-records.en.js?v=202610121136';
import u5l3 from './u5/l3-nullable.en.js?v=202610121136';
import u5l4 from './u5/l4-modern.en.js?v=202610121136';
import u5boss from './u5/boss.en.js?v=202610121136';
import u9l1 from './u9/l1-ref.en.js?v=202610121136';
import u9l2 from './u9/l2-args.en.js?v=202610121136';
import u9l3 from './u9/l3-props.en.js?v=202610121136';
import u9boss from './u9/boss.en.js?v=202610121136';
import u7l1 from './u7/l1-boxing.en.js?v=202610121136';
import u7l2 from './u7/l2-mutable.en.js?v=202610121136';
import u7l3 from './u7/l3-equality-layout.en.js?v=202610121136';
import u7boss from './u7/boss.en.js?v=202610121136';
import u12l1 from './u12/l1-finally.en.js?v=202610121136';
import u12l2 from './u12/l2-rethrow.en.js?v=202610121136';
import u12l3 from './u12/l3-unhandled.en.js?v=202610121136';
import u12boss from './u12/boss.en.js?v=202610121136';
import u8l1 from './u8/l1-const.en.js?v=202610121136';
import u8l2 from './u8/l2-init.en.js?v=202610121136';
import u8l3 from './u8/l3-virtual.en.js?v=202610121136';
import u8l4 from './u8/l4-operators.en.js?v=202610121136';
import u8boss from './u8/boss.en.js?v=202610121136';
import u10l1 from './u10/l1-explicit.en.js?v=202610121136';
import u10l2 from './u10/l2-evolve.en.js?v=202610121136';
import u10boss from './u10/boss.en.js?v=202610121136';
import u11l1 from './u11/l1-strings.en.js?v=202610121136';
import u11l2 from './u11/l2-building.en.js?v=202610121136';
import u11l3 from './u11/l3-enums.en.js?v=202610121136';
import u11l4 from './u11/l4-arrays-nullable.en.js?v=202610121136';
import u11boss from './u11/boss.en.js?v=202610121136';

export default {
  id: 'csharp',
  title: 'Deeper C#',
  units: [
    {
      id: 'u6',
      title: 'How a type is built',
      blurb: 'What every object has: System.Object, the header and the type pointer, the Equals/GetHashCode contract; casts, is, as and unboxing; primitives, checked and overflow, dynamic and its cost.',
      lessons: [u6l1, u6l2, u6l3, u6boss]
    },
    {
      id: 'u7',
      title: 'Value types all the way',
      blurb: 'Boxing you cannot see in the code: interfaces, GetType and ValueType methods; a mutable struct in a collection and in foreach; ValueType.Equals via reflection, IEquatable<T>, record struct and field layout.',
      lessons: [u7l1, u7l2, u7l3, u7boss]
    },
    {
      id: 'u8',
      title: 'Type members and versioning',
      blurb: 'What breaks for a library consumer without a recompile: const versus static readonly, initialization order and beforefieldinit, virtual/new/override and call/callvirt, operators, conversions and extension methods up to C# 14 extension blocks.',
      lessons: [u8l1, u8l2, u8l3, u8l4, u8boss]
    },
    {
      id: 'u9',
      title: 'Parameters, properties, tuples',
      blurb: 'ref inside out: ref readonly, ref returns and CollectionsMarshal; where default values live and what version 2 breaks; params and params ReadOnlySpan; properties, field, init and required in metadata; anonymous types, ValueTuple and Deconstruct.',
      lessons: [u9l1, u9l2, u9l3, u9boss]
    },
    {
      id: 'u1',
      title: 'Generics',
      blurb: 'Why they exist, how the JIT compiles them for value and reference types, where constraints, covariance and contravariance, and generic math with INumber<T>.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u10',
      title: 'Interfaces',
      blurb: 'Explicit implementation and why a struct behind an interface lives in a box, how the CLR finds an interface method; default methods and the "version 2" scenario, static abstract members, interface or base class.',
      lessons: [u10l1, u10l2, u10boss]
    },
    {
      id: 'u2',
      title: 'Delegates, events and closures',
      blurb: 'Func and Action, multicast delegates, events and subscription leaks, lambdas and what exactly they capture; what a delegate is inside: a MulticastDelegate class, chains and exceptions in them, explicit add/remove.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2boss]
    },
    {
      id: 'u11',
      title: 'Strings, enums, arrays',
      blurb: 'A string in memory and the literal pool, ordinal versus culture and the Turkish i, Concat, StringBuilder, the interpolation handler, string.Create and u8 literals; enums as a struct over an integer, baked-in values and [Flags]; the cost of array covariance, jagged versus multidimensional, InlineArray, boxing int?.',
      lessons: [u11l1, u11l2, u11l3, u11l4, u11boss]
    },
    {
      id: 'u12',
      title: 'Exceptions and reliability',
      blurb: 'What finally guarantees and when it does not run, when filters and two-pass handling, throw vs throw ex and ExceptionDispatchInfo, a type broken for good, what crashes the process, the cost of an exception, TryXxx and your own exceptions.',
      lessons: [u12l1, u12l2, u12l3, u12boss]
    },
    {
      id: 'u3',
      title: 'LINQ and its cost',
      blurb: 'Deferred execution and Take, ToList and multiple enumeration, the buffering OrderBy, IQueryable and SQL from lambdas.',
      lessons: [u3l1, u3l2, u3l3, u3boss]
    },
    {
      id: 'u4',
      title: 'Performance',
      blurb: 'Span<T> and copy-free slices, the rules of ref struct and Memory<T>, readonly struct, in and defensive copies.',
      lessons: [u4l1, u4l2, u4l3, u4boss]
    },
    {
      id: 'u5',
      title: 'Modern C#',
      blurb: 'Pattern matching, records, nullable references, required and what is new in C# 12, 13 and 14. The course final.',
      lessons: [u5l1, u5l2, u5l3, u5l4, u5boss]
    }
  ]
};

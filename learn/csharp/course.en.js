/** The "Deeper C#" course: generics, delegates, LINQ, Span and modern C#. */
import u1l1 from './u1/l1-why.en.js?v=202610100807';
import u1l2 from './u1/l2-constraints.en.js?v=202610100807';
import u1l3 from './u1/l3-variance.en.js?v=202610100807';
import u1boss from './u1/boss.en.js?v=202610100807';
import u2l1 from './u2/l1-delegates.en.js?v=202610100807';
import u2l2 from './u2/l2-events.en.js?v=202610100807';
import u2l3 from './u2/l3-closures.en.js?v=202610100807';
import u2boss from './u2/boss.en.js?v=202610100807';
import u3l1 from './u3/l1-lazy.en.js?v=202610100807';
import u3l2 from './u3/l2-materialize.en.js?v=202610100807';
import u3l3 from './u3/l3-cost.en.js?v=202610100807';
import u3boss from './u3/boss.en.js?v=202610100807';
import u4l1 from './u4/l1-span.en.js?v=202610100807';
import u4l2 from './u4/l2-refstruct.en.js?v=202610100807';
import u4l3 from './u4/l3-copies.en.js?v=202610100807';
import u4boss from './u4/boss.en.js?v=202610100807';
import u5l1 from './u5/l1-patterns.en.js?v=202610100807';
import u5l2 from './u5/l2-records.en.js?v=202610100807';
import u5l3 from './u5/l3-nullable.en.js?v=202610100807';
import u5l4 from './u5/l4-modern.en.js?v=202610100807';
import u5boss from './u5/boss.en.js?v=202610100807';

export default {
  id: 'csharp',
  title: 'Deeper C#',
  units: [
    {
      id: 'u1',
      title: 'Generics',
      blurb: 'Why they exist, how the JIT compiles them for value and reference types, where constraints, covariance and contravariance, and generic math with INumber<T>.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Delegates, events and closures',
      blurb: 'Func and Action, multicast delegates, events and subscription leaks, lambdas and exactly what they capture.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
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

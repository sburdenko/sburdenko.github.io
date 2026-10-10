/** Course "The history of .NET": from Framework 1.0 to .NET 10, and where .NET is today. */
import u1l1 from './u1/l1-why.en.js?v=202610101413';
import u1l2 from './u1/l2-growth.en.js?v=202610101413';
import u1l3 from './u1/l3-end.en.js?v=202610101413';
import u1boss from './u1/boss.en.js?v=202610101413';
import u2l1 from './u2/l1-mono.en.js?v=202610101413';
import u2l2 from './u2/l2-unity.en.js?v=202610101413';
import u2l3 from './u2/l3-xamarin.en.js?v=202610101413';
import u2boss from './u2/boss.en.js?v=202610101413';
import u3l1 from './u3/l1-open.en.js?v=202610101413';
import u3l2 from './u3/l2-core.en.js?v=202610101413';
import u3l3 from './u3/l3-standard.en.js?v=202610101413';
import u3l4 from './u3/l4-multitarget.en.js?v=202610101413';
import u3boss from './u3/boss.en.js?v=202610101413';
import u4l1 from './u4/l1-one.en.js?v=202610101413';
import u4l2 from './u4/l2-net10.en.js?v=202610101413';
import u4l3 from './u4/l3-now.en.js?v=202610101413';
import u4l4 from './u4/l4-diff.en.js?v=202610101413';
import u4boss from './u4/boss.en.js?v=202610101413';

export default {
  id: 'history',
  title: 'The history of .NET',
  units: [
    {
      id: 'u1',
      title: 'The .NET Framework era',
      blurb: 'Why Microsoft built .NET, how Framework grew from generics to async, and why 4.8 is the last version yet still powers plugins for older Revit and AutoCAD.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Mono, Unity and Xamarin',
      blurb: 'An open implementation of the ECMA standard, C# in Unity (Mono, IL2CPP, the road to CoreCLR) and on phones: Xamarin and MAUI.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Open source, .NET Core and .NET Standard',
      blurb: 'Open source, a new cross-platform .NET, the standard as an API contract, and why 2.1 is in Unity and .NET 10 but not in Framework. Plus multi-targeting.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'One .NET and where it is today',
      blurb: '.NET 5-10, LTS and STS, what is new in .NET 10 and C# 14, where .NET runs today, and how Framework differs from modern .NET.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    }
  ]
};

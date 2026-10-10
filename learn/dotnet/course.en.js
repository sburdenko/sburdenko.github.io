/** Course ".NET under the hood": units and lessons (English version). Finished units have lessons; the rest are planned and marked "soon". */
import w1l1 from './w1/l1-basics.en.js?v=202610101413';
import w1l2 from './w1/l2-languages.en.js?v=202610101413';
import w1l3 from './w1/l3-cil.en.js?v=202610101413';
import w1l4 from './w1/l4-metadata.en.js?v=202610101413';
import w1l5 from './w1/l5-jit.en.js?v=202610101413';
import w1l6 from './w1/l6-aot.en.js?v=202610101413';
import w1l7 from './w1/l7-safety.en.js?v=202610101413';
import w1l8 from './w1/l8-run.en.js?v=202610101413';
import w1boss from './w1/boss.en.js?v=202610101413';
import w2l1 from './w2/l1-kinds.en.js?v=202610101413';
import w2l2 from './w2/l2-stack-heap.en.js?v=202610101413';
import w2l3 from './w2/l3-boxing.en.js?v=202610101413';
import w2l4 from './w2/l4-passing.en.js?v=202610101413';
import w2l5 from './w2/l5-strings.en.js?v=202610101413';
import w2boss from './w2/boss.en.js?v=202610101413';
import w3l1 from './w3/l1-roots.en.js?v=202610101413';
import w3l2 from './w3/l2-generations.en.js?v=202610101413';
import w3l3 from './w3/l3-finalizers.en.js?v=202610101413';
import w3l4 from './w3/l4-dispose.en.js?v=202610101413';
import w3l5 from './w3/l5-leaks.en.js?v=202610101413';
import w3boss from './w3/boss.en.js?v=202610101413';
import w4l1 from './w4/l1-threads.en.js?v=202610101413';
import w4l2 from './w4/l2-race.en.js?v=202610101413';
import w4l3 from './w4/l3-locks.en.js?v=202610101413';
import w4l4 from './w4/l4-pool.en.js?v=202610101413';
import w4l5 from './w4/l5-starvation.en.js?v=202610101413';
import w4boss from './w4/boss.en.js?v=202610101413';

export default {
  id: 'dotnet',
  title: '.NET under the hood',
  units: [
    {
      id: 'w1',
      title: 'How .NET code runs',
      blurb: 'A program\'s journey from C# source to CPU instructions: the compiler, CIL, metadata, JIT, AOT and the CLR itself.',
      source: { title: 'Microsoft Learn: Managed execution process', url: 'https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process' },
      lessons: [w1l1, w1l2, w1l3, w1l4, w1l5, w1l6, w1l7, w1l8, w1boss]
    },
    {
      id: 'w2',
      title: 'Types and memory',
      blurb: 'Value and reference types, the stack and the heap, boxing, argument passing and what makes string special, on a rig that shows every variable and every object.',
      lessons: [w2l1, w2l2, w2l3, w2l4, w2l5, w2boss]
    },
    {
      id: 'w3',
      title: 'Garbage collection and resources',
      blurb: 'Roots and reachability, generations and the LOH, finalizers, IDisposable and using, SafeHandle and memory leaks. You run the collections yourself and see who survives.',
      lessons: [w3l1, w3l2, w3l3, w3l4, w3l5, w3boss]
    },
    {
      id: 'w4',
      title: 'Threads and the thread pool',
      blurb: 'Threads and the scheduler, data races, lock and Interlocked, deadlock, the thread pool and its starvation. You switch the threads yourself and catch the bugs.',
      lessons: [w4l1, w4l2, w4l3, w4l4, w4l5, w4boss]
    },
    { id: 'w5', title: 'Assemblies and loading', soon: true, blurb: 'How the CLR finds and loads assemblies: AssemblyLoadContext, versions and NuGet, trimming, plugins.' },
    { id: 'w6', title: 'Generics and reflection under the hood', soon: true, blurb: 'How the JIT compiles generics for value and reference types, what reflection costs, and what source generators replace.' },
    { id: 'w7', title: 'Performance', soon: true, blurb: 'Span<T> and Memory<T>, allocations and ArrayPool, profiling and BenchmarkDotNet.' }
  ]
};

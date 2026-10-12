/** Course ".NET under the hood": units and lessons (English version). Finished units have lessons; the rest are planned and marked "soon". */
import w1l1 from './w1/l1-basics.en.js?v=202610121139';
import w1l2 from './w1/l2-languages.en.js?v=202610121139';
import w1l3 from './w1/l3-cil.en.js?v=202610121139';
import w1l4 from './w1/l4-metadata.en.js?v=202610121139';
import w1l5 from './w1/l5-jit.en.js?v=202610121139';
import w1l6 from './w1/l6-aot.en.js?v=202610121139';
import w1l7 from './w1/l7-safety.en.js?v=202610121139';
import w1l8 from './w1/l8-run.en.js?v=202610121139';
import w1boss from './w1/boss.en.js?v=202610121139';
import w2l1 from './w2/l1-kinds.en.js?v=202610121139';
import w2l2 from './w2/l2-stack-heap.en.js?v=202610121139';
import w2l3 from './w2/l3-boxing.en.js?v=202610121139';
import w2l4 from './w2/l4-passing.en.js?v=202610121139';
import w2l5 from './w2/l5-strings.en.js?v=202610121139';
import w2boss from './w2/boss.en.js?v=202610121139';
import w3l1 from './w3/l1-roots.en.js?v=202610121139';
import w3l2 from './w3/l2-generations.en.js?v=202610121139';
import w3l3 from './w3/l3-finalizers.en.js?v=202610121139';
import w3l4 from './w3/l4-dispose.en.js?v=202610121139';
import w3l5 from './w3/l5-leaks.en.js?v=202610121139';
import w3boss from './w3/boss.en.js?v=202610121139';
import w4l1 from './w4/l1-threads.en.js?v=202610121139';
import w4l2 from './w4/l2-race.en.js?v=202610121139';
import w4l3 from './w4/l3-locks.en.js?v=202610121139';
import w4l4 from './w4/l4-pool.en.js?v=202610121139';
import w4l5 from './w4/l5-starvation.en.js?v=202610121139';
import w4boss from './w4/boss.en.js?v=202610121139';
import w7l1 from './w7/l1-sharing.en.js?v=202610121139';
import w7l2 from './w7/l2-reflection.en.js?v=202610121139';
import w7l3 from './w7/l3-dynamic-gen.en.js?v=202610121139';
import w7boss from './w7/boss.en.js?v=202610121139';
import w8l1 from './w8/l1-tiers.en.js?v=202610121139';
import w8l2 from './w8/l2-r2r-aot.en.js?v=202610121139';
import w8l3 from './w8/l3-inline-bench.en.js?v=202610121139';
import w8boss from './w8/boss.en.js?v=202610121139';
import w5l1 from './w5/l1-anatomy.en.js?v=202610121139';
import w5l2 from './w5/l2-versions.en.js?v=202610121139';
import w5l3 from './w5/l3-strong-names.en.js?v=202610121139';
import w5l4 from './w5/l4-resolve.en.js?v=202610121139';
import w5boss from './w5/boss.en.js?v=202610121139';
import w6l1 from './w6/l1-host.en.js?v=202610121139';
import w6l2 from './w6/l2-rollforward.en.js?v=202610121139';
import w6l3 from './w6/l3-alc.en.js?v=202610121139';
import w6l4 from './w6/l4-unload.en.js?v=202610121139';
import w6boss from './w6/boss.en.js?v=202610121139';

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
    {
      id: 'w5',
      title: 'Assemblies and versions',
      blurb: 'What an assembly holds, its three versions and which one the loader checks, strong names and the GAC then and now, deps.json instead of folder probing, and how NuGet settles on one package version.',
      lessons: [w5l1, w5l2, w5l3, w5l4, w5boss]
    },
    {
      id: 'w6',
      title: 'Loading and hosting',
      blurb: 'How dotnet app.dll reaches Main: apphost, hostfxr, hostpolicy and picking a version with rollForward. AssemblyLoadContext instead of AppDomain — plugins, isolation and unloading, plus why the process crashes and what single-file and trimming change.',
      lessons: [w6l1, w6l2, w6l3, w6l4, w6boss]
    },
    {
      id: 'w7',
      title: 'Generics and reflection inside out',
      blurb: 'How the JIT shares generic code through __Canon and dictionaries, what lies behind metadata tokens, MethodInfo and Invoke, how the dynamic call site cache works, and why source generators replace reflection.',
      lessons: [w7l1, w7l2, w7l3, w7boss]
    },
    {
      id: 'w8',
      title: 'Runtime performance',
      blurb: 'How .NET makes code fast on the fly: JIT tiers, OSR and Dynamic PGO, ReadyToRun versus Native AOT, inlining and devirtualization — and how to measure the result honestly with BenchmarkDotNet. Course final.',
      lessons: [w8l1, w8l2, w8l3, w8boss]
    }
  ]
};

/** Course "Memory in .NET": units and lessons (English version). Finished units have lessons; the rest are planned and marked "soon". */
import u1l1 from './u1/l1-virtual.en.js?v=202610121141';
import u1l2 from './u1/l2-reserve-commit.en.js?v=202610121141';
import u1l3 from './u1/l3-stack-cache.en.js?v=202610121141';
import u1boss from './u1/boss.en.js?v=202610121141';
import u2l1 from './u2/l1-numbers.en.js?v=202610121141';
import u2l2 from './u2/l2-tools.en.js?v=202610121141';
import u2l3 from './u2/l3-leak.en.js?v=202610121141';
import u2boss from './u2/boss.en.js?v=202610121141';
import u6l1 from './u6/l1-workstation-server.en.js?v=202610121141';
import u6l2 from './u6/l2-background-latency.en.js?v=202610121141';
import u6l3 from './u6/l3-datas-config.en.js?v=202610121141';
import u6boss from './u6/boss.en.js?v=202610121141';
import u7l1 from './u7/l1-finalization.en.js?v=202610121141';
import u7l2 from './u7/l2-resurrection.en.js?v=202610121141';
import u7l3 from './u7/l3-weak-leaks.en.js?v=202610121141';
import u7boss from './u7/boss.en.js?v=202610121141';
import u4l1 from './u4/l1-fast-path.en.js?v=202610121141';
import u4l2 from './u4/l2-slow-path.en.js?v=202610121141';
import u4l3 from './u4/l3-hidden.en.js?v=202610121141';
import u4l4 from './u4/l4-pool-measure.en.js?v=202610121141';
import u4boss from './u4/boss.en.js?v=202610121141';
import u3l1 from './u3/l1-header.en.js?v=202610121141';
import u3l2 from './u3/l2-layout.en.js?v=202610121141';
import u3l3 from './u3/l3-arrays-strings.en.js?v=202610121141';
import u3l4 from './u3/l4-heaps.en.js?v=202610121141';
import u3boss from './u3/boss.en.js?v=202610121141';
import u5l1 from './u5/l1-triggers.en.js?v=202610121141';
import u5l2 from './u5/l2-suspension.en.js?v=202610121141';
import u5l3 from './u5/l3-mark.en.js?v=202610121141';
import u5l4 from './u5/l4-plan.en.js?v=202610121141';
import u5l5 from './u5/l5-sweep-compact.en.js?v=202610121141';
import u5boss from './u5/boss.en.js?v=202610121141';
import u8l1 from './u8/l1-pinning.en.js?v=202610121141';
import u8l2 from './u8/l2-unsafe.en.js?v=202610121141';
import u8l3 from './u8/l3-gc-api.en.js?v=202610121141';
import u8l4 from './u8/l4-native-aot.en.js?v=202610121141';
import u8boss from './u8/boss.en.js?v=202610121141';

export default {
  id: 'memory',
  title: 'Memory in .NET',
  units: [
    {
      id: 'u1',
      title: 'Memory through the OS’s eyes',
      blurb: 'What the operating system sees when .NET asks for memory: virtual addresses and pages, reserve and commit, why a process has several "memory used" numbers, the stack limit and CPU caches.',
      source: { title: 'Microsoft Learn: Virtual address spaces', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/virtual-address-spaces' },
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'How to measure',
      blurb: 'Working set, private bytes, commit and the managed heap are different numbers. What Task Manager, top and the GC APIs show; dotnet-counters, dotnet-gcdump, dotnet-trace, dotnet-dump and PerfView; how to find a leak with two snapshots and the path to a root.',
      source: { title: 'Microsoft Learn: Debug a memory leak in .NET', url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/debug-memory-leak' },
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Inside the heap',
      blurb: 'What an object is made of: the header, the sync block and the MethodTable, how the CLR lays out and aligns fields, how arrays and strings sit in memory. The SOH, LOH and POH, regions in .NET 7+ and the .NET 8 non-GC heap.',
      source: { title: 'Microsoft Learn: The large object heap', url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap' },
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Allocation',
      blurb: 'Why new in .NET is nearly free — a pointer bump in the thread\'s allocation context — and when it takes the slow path or goes to the LOH. Hidden allocations in closures, boxing, iterators, params, strings and async; ArrayPool, stackalloc, string.Create and measuring bytes per call.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    },
    {
      id: 'u5',
      title: 'How a collection works',
      blurb: 'What triggers a collection and how the generation is chosen, how threads are stopped at safepoints, marking from roots through GC info and the card table, the plan that picks sweep or compact, moving objects and updating references.',
      source: { title: 'Book of the Runtime: Garbage collection design', url: 'https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/botr/garbage-collection.md' },
      lessons: [u5l1, u5l2, u5l3, u5l4, u5l5, u5boss]
    },
    {
      id: 'u6',
      title: 'GC modes',
      blurb: 'Workstation and Server, background GC and the foreground collections that run during it, GCSettings.LatencyMode latency modes, DATAS in .NET 8–9, settings in runtimeconfig.json and environment variables, container limits.',
      source: { title: 'Microsoft Learn: Garbage collector config settings', url: 'https://learn.microsoft.com/en-us/dotnet/core/runtime-config/garbage-collector' },
      lessons: [u6l1, u6l2, u6l3, u6boss]
    },
    {
      id: 'u7',
      title: 'Object lifetime',
      blurb: 'Finalization inside out: two queues, the finalizer thread, resurrection and SuppressFinalize. SafeHandle and critical finalizers, weak references and GCHandle, ConditionalWeakTable and leaks through closures, statics and timers.',
      lessons: [u7l1, u7l2, u7l3, u7boss]
    },
    {
      id: 'u8',
      title: 'Advanced',
      blurb: 'Pinning and the pinned object heap, unsafe code, pointers and native memory, no-GC regions and the collector API, and what changes in memory under Native AOT without a JIT. The course final.',
      source: { title: 'Microsoft Learn: Garbage collection', url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/' },
      lessons: [u8l1, u8l2, u8l3, u8l4, u8boss]
    }
  ]
};

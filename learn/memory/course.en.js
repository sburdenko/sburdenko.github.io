/** Course "Memory in .NET": units and lessons (English version). Finished units have lessons; the rest are planned and marked "soon". */
import u1l1 from './u1/l1-virtual.en.js?v=202610121135';
import u1l2 from './u1/l2-reserve-commit.en.js?v=202610121135';
import u1l3 from './u1/l3-stack-cache.en.js?v=202610121135';
import u1boss from './u1/boss.en.js?v=202610121135';
import u2l1 from './u2/l1-numbers.en.js?v=202610121135';
import u2l2 from './u2/l2-tools.en.js?v=202610121135';
import u2l3 from './u2/l3-leak.en.js?v=202610121135';
import u2boss from './u2/boss.en.js?v=202610121135';
import u6l1 from './u6/l1-workstation-server.en.js?v=202610121135';
import u6l2 from './u6/l2-background-latency.en.js?v=202610121135';
import u6l3 from './u6/l3-datas-config.en.js?v=202610121135';
import u6boss from './u6/boss.en.js?v=202610121135';
import u7l1 from './u7/l1-finalization.en.js?v=202610121135';
import u7l2 from './u7/l2-resurrection.en.js?v=202610121135';
import u7l3 from './u7/l3-weak-leaks.en.js?v=202610121135';
import u7boss from './u7/boss.en.js?v=202610121135';

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
    { id: 'u3', title: 'Inside the heap', soon: true, blurb: 'The object header and the type pointer, field layout and alignment, the SOH, LOH and POH, regions in .NET 7+ and frozen segments.' },
    { id: 'u4', title: 'Allocation', soon: true, blurb: 'Pointer bumping and the allocation context, the slow path and the LOH, hidden allocations in closures, boxing, LINQ and strings, ArrayPool and stackalloc.' },
    { id: 'u5', title: 'How a collection works', soon: true, blurb: 'When the GC kicks in, suspending threads and safepoints, marking from roots and the card table, planning, sweep and compact.' },
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
    { id: 'u8', title: 'Advanced', soon: true, blurb: 'Pinning and the POH, unsafe code and pointers, GC.TryStartNoGCRegion, the GC API and GCSettings, Native AOT and memory.' }
  ]
};

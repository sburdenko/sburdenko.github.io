/** Course "Memory in .NET": units and lessons (English version). Finished units have lessons; the rest are planned and marked "soon". */
import u1l1 from './u1/l1-virtual.en.js?v=202610121129';
import u1l2 from './u1/l2-reserve-commit.en.js?v=202610121129';
import u1l3 from './u1/l3-stack-cache.en.js?v=202610121129';
import u1boss from './u1/boss.en.js?v=202610121129';

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
    { id: 'u2', title: 'How to measure', soon: true, blurb: 'Working set, private bytes and the managed heap are different numbers. dotnet-counters, dotnet-gcdump, dotnet-trace and PerfView; how to read a dump and hunt down a leak.' },
    { id: 'u3', title: 'Inside the heap', soon: true, blurb: 'The object header and the type pointer, field layout and alignment, the SOH, LOH and POH, regions in .NET 7+ and frozen segments.' },
    { id: 'u4', title: 'Allocation', soon: true, blurb: 'Pointer bumping and the allocation context, the slow path and the LOH, hidden allocations in closures, boxing, LINQ and strings, ArrayPool and stackalloc.' },
    { id: 'u5', title: 'How a collection works', soon: true, blurb: 'When the GC kicks in, suspending threads and safepoints, marking from roots and the card table, planning, sweep and compact.' },
    { id: 'u6', title: 'GC modes', soon: true, blurb: 'Workstation and Server, background GC, latency modes, DATAS and the settings in runtimeconfig.json.' },
    { id: 'u7', title: 'Lifetime', soon: true, blurb: 'Finalization from the inside and resurrection, SafeHandle, weak references, ConditionalWeakTable, leaks through events and statics.' },
    { id: 'u8', title: 'Advanced', soon: true, blurb: 'Pinning and the POH, unsafe code and pointers, GC.TryStartNoGCRegion, the GC API and GCSettings, Native AOT and memory.' }
  ]
};

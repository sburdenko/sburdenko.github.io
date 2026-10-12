/** Memory in .NET, unit "Advanced", lesson 3: the collector API, GCSettings, no-GC regions, AddMemoryPressure and configuration. */
export default {
  id: 'mem.u8.l3',
  title: 'The collector API',
  sub: 'GC, GCSettings, no-GC regions and memory pressure',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'What you can ask and what you can request',
      body: '<p>The <code>GC</code> class is the collector’s control panel. Its methods fall into two groups.</p><p><b>Ask:</b> <code>CollectionCount(gen)</code> — how many collections ran; <code>GetGeneration(obj)</code> — which generation an object is in; <code>GetTotalAllocatedBytes()</code> — how much was allocated in total; <code>GetTotalPauseDuration()</code> (.NET 7) — total pause time; <code>GetGCMemoryInfo()</code> — a snapshot of the last collection (as in the "How to measure" unit).</p><p><b>Request:</b> <code>Collect</code>, <code>AddMemoryPressure</code>, <code>TryStartNoGCRegion</code>, <code>RefreshMemoryLimit</code>. You rarely need anything from this group: the collector tunes generation budgets to the load by itself, and interfering usually gets in the way.</p>',
      code: 'Console.WriteLine(GC.CollectionCount(0));      // gen 0 collections\nConsole.WriteLine(GC.GetGeneration(order));    // 0, 1 or 2\nConsole.WriteLine(GC.GetTotalPauseDuration()); // pauses since process start\nvar info = GC.GetGCMemoryInfo();\nConsole.WriteLine(info.FragmentedBytes);',
      deep: '<p><code>CollectionCount(0)</code> also counts collections of older generations: a gen 2 collection collects 0 and 1 too. So the number of "pure" gen 0 collections is <code>CollectionCount(0) - CollectionCount(1)</code>. <code>GetGeneration</code> reports objects in the LOH and POH as generation 2, and objects outside the GC heap (such as string literals since .NET 8) as <code>int.MaxValue</code>.</p>'
    },
    {
      t: 'learn',
      title: 'GC.Collect: why it almost always hurts',
      body: '<p><code>GC.Collect()</code> with no arguments is a full blocking collection of all generations. What it does to the program:</p><ul><li>a pause over the whole heap rather than the small generation 0;</li><li>young live objects get promoted to older generations too early and then linger there;</li><li>the statistics the collector uses to pick budgets get thrown off.</li></ul><p>Where a call is justified: tests and benchmarks (to level the start), and once after loading big data at startup — then together with LOH compaction.</p>',
      code: '// After loading reference data, once\nGCSettings.LargeObjectHeapCompactionMode =\n    GCLargeObjectHeapCompactionMode.CompactOnce;\nGC.Collect(2, GCCollectionMode.Forced, blocking: true, compacting: true);',
      deep: '<p><code>GCCollectionMode.Optimized</code> leaves the decision to the collector: it may skip the collection if it deems it pointless. <code>GCCollectionMode.Aggressive</code> (.NET 7) is a collection that also returns as much memory as possible to the OS; it is meant for when the process goes into the background for a long time. <code>CompactOnce</code> resets to <code>Default</code> after the very first full blocking collection.</p>'
    },
    {
      t: 'choice',
      q: 'An HTTP request handler calls GC.Collect() at the end "so garbage does not pile up". What happens under load?',
      options: [
        'A full blocking collection per request: pauses and latency go up',
        'Memory shrinks with no side effects',
        'Nothing: under Server GC GC.Collect is ignored',
        'The collector collects only this request’s garbage'
      ],
      answer: 0,
      explain: 'Each call is a full collection of the whole heap with threads suspended. At hundreds of requests per second the process will mostly be collecting garbage. The request’s garbage would go away in a cheap gen 0 collection anyway.',
      wrong: { 2: 'Collect works in any mode. Only GCCollectionMode.Optimized may ignore the request.', 3: 'The collector does not know which object belonged to which request: it collects generations, not requests.' }
    },
    {
      t: 'learn',
      title: 'GCSettings: the mode at run time',
      body: '<p><code>System.Runtime.GCSettings</code> has three properties:</p><ul><li><code>IsServerGC</code> — read-only: which mode is actually running;</li><li><code>LatencyMode</code> — the latency mode, changeable on the fly: <code>Batch</code>, <code>Interactive</code>, <code>LowLatency</code>, <code>SustainedLowLatency</code>. The <code>NoGCRegion</code> value is read-only — it reports a no-GC region;</li><li><code>LargeObjectHeapCompactionMode</code> — compact the LOH on the next full collection.</li></ul><p>What each latency mode means and when to pick which is covered in the "GC modes" unit. What matters here: these are process-wide settings; you change them for a short stretch and put them back.</p>',
      code: 'var old = GCSettings.LatencyMode;\nGCSettings.LatencyMode = GCLatencyMode.SustainedLowLatency;\ntry\n{\n    RunTradingSession();\n}\nfinally\n{\n    GCSettings.LatencyMode = old;\n}',
      deep: '<p><code>LowLatency</code> is available only with Workstation GC and suppresses gen 2 collections — for short stretches. <code>SustainedLowLatency</code> also works with Server GC but requires background GC: without it the mode does not take effect. When memory runs low, or on an explicit <code>GC.Collect(2)</code>, the collector still does a full collection.</p>'
    },
    {
      t: 'learn',
      title: 'A region with no collections',
      body: '<p><code>GC.TryStartNoGCRegion(totalSize)</code> asks: "until I allocate totalSize bytes, do not collect". The mechanism:</p><ul><li>the collector commits the needed memory up front, and if there is not enough, first runs a full blocking collection;</li><li>it returns <code>true</code> — the region has started, <code>GCSettings.LatencyMode</code> is <code>NoGCRegion</code>;</li><li>while allocations fit in the budget there are no collections at all;</li><li><code>GC.EndNoGCRegion()</code> restores normal mode.</li></ul><p>Overrunning the budget or an explicit <code>GC.Collect</code> silently ends the region with a collection. Then <code>EndNoGCRegion</code> throws <code>InvalidOperationException</code>.</p>',
      code: 'if (GC.TryStartNoGCRegion(16 * 1024 * 1024))\n{\n    try\n    {\n        RenderCriticalFrame();\n    }\n    finally\n    {\n        if (GCSettings.LatencyMode == GCLatencyMode.NoGCRegion)\n            GC.EndNoGCRegion();\n    }\n}',
      deep: '<p>The one-argument version reserves totalSize for both the SOH and the LOH — effectively twice as much. The <code>(totalSize, lohSize)</code> overload splits the budget explicitly. The size is limited: for the SOH, by the ephemeral segment size; more gives <code>ArgumentOutOfRangeException</code>. Regions cannot nest: a second call throws <code>InvalidOperationException</code>. The budget covers the runtime’s own allocations and those of every thread in the process, not just yours.</p>'
    },
    {
      t: 'order',
      q: 'Put the life of a no-GC region in order',
      items: [
        'TryStartNoGCRegion: the collector checks whether there is enough memory',
        'If not — a full blocking collection',
        'Memory for the budget is committed, the method returns true',
        'Critical code allocates without any collections',
        'EndNoGCRegion: normal mode is back'
      ],
      explain: 'The collection, if needed, happens before the region starts — that is the point: pay the pause up front, not in the middle of the critical section. If there still were not enough memory at step two, the method would return false.'
    },
    {
      t: 'learn',
      title: 'A callback and opting out of the full collection',
      body: '<p>Two add-ons for regions.</p><p><b><code>disallowFullBlockingGC: true</code></b> — do not run a full collection on entry. If memory is short, the method returns <code>false</code> right away. The scenario: a node behind a load balancer answers "not ready", requests go to its neighbours, and the node collects on its own when there is no load.</p><p><b><code>GC.RegisterNoGCRegionCallback(totalSize, callback)</code></b> (.NET 8) — invoke a delegate once totalSize bytes have been allocated in the region. It is a "budget running low" warning, not a way to extend the region. One callback per region; outside a region the call throws <code>InvalidOperationException</code>.</p>',
      code: 'if (GC.TryStartNoGCRegion(32 * 1024 * 1024, disallowFullBlockingGC: true))\n{\n    GC.RegisterNoGCRegionCallback(24 * 1024 * 1024,\n        () => metrics.Warn("NoGC budget 75% used"));\n    ProcessBurst();\n    if (GCSettings.LatencyMode == GCLatencyMode.NoGCRegion)\n        GC.EndNoGCRegion();\n}',
      deep: '<p>The callback does not run on the thread that crossed the threshold, nor at the moment it crosses: the runtime runs it later on one of its own threads (in CoreCLR, the finalizer thread). So it must not wait on anything and is no good for precise accounting. If totalSize exceeds the region’s budget, registration throws <code>InvalidOperationException</code>.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line throws an exception?',
      code: 'if (GC.TryStartNoGCRegion(4_000_000))\n{\n    var frame = new byte[100_000];\n    Process(frame);\n    GC.Collect();\n    GC.EndNoGCRegion();\n}',
      answer: 5,
      explain: 'GC.Collect inside a region does not throw: it runs a collection and thereby ends the region. The InvalidOperationException comes from EndNoGCRegion — the region already ended because of the induced collection. Checking GCSettings.LatencyMode before EndNoGCRegion would have prevented it.'
    },
    {
      t: 'learn',
      title: 'AddMemoryPressure: a small object, a lot of memory',
      body: '<p>A wrapper around a native resource weighs tens of bytes on the heap but holds megabytes — an image, a codec buffer. The collector sees only the tens of bytes and is in no hurry. The wrappers pile up in generation 2, their native memory is never freed, and the process grows.</p><p><code>GC.AddMemoryPressure(bytes)</code> says: "this much native memory stands behind it". The collector takes it into account and may start a gen 2 collection sooner. Once the memory is freed — <code>GC.RemoveMemoryPressure</code> with the same number.</p>',
      code: 'sealed class NativeImage : IDisposable\n{\n    readonly long _size;\n    public NativeImage(long size)\n    {\n        _size = size;\n        /* allocate the native buffer */\n        GC.AddMemoryPressure(_size);\n    }\n    public void Dispose()\n    {\n        /* free the native buffer */\n        GC.RemoveMemoryPressure(_size);\n    }\n}',
      deep: '<p>It is a hint, not accounting: the collector compares the added pressure with the size of the managed heap and, if the imbalance is large, triggers a collection itself. Calls must come in pairs — a forgotten <code>Remove</code> makes the collector collect more often than needed. If the resource is counted in units rather than bytes (OS handles), there is <code>HandleCollector</code> in System.Runtime.InteropServices.</p>'
    },
    {
      t: 'blanks',
      q: 'Tell the collector about a native buffer and remove the note when it is freed',
      code: 'IntPtr buf = Marshal.AllocHGlobal(size);\nGC.___(size);\n// ...\nMarshal.FreeHGlobal(buf);\nGC.___(size);',
      tiles: ['AddMemoryPressure', 'RemoveMemoryPressure', 'Collect', 'KeepAlive', 'SuppressFinalize'],
      answer: ['AddMemoryPressure', 'RemoveMemoryPressure'],
      explain: 'An Add/Remove pair with the same number. Collect is not needed here: knowing about the native memory, the collector decides for itself when to collect.'
    },
    {
      t: 'learn',
      title: 'Configuration is read once at startup',
      body: '<p>The mode, the number of heaps and the hard heap limit are set in the project (<code>&lt;ServerGarbageCollection&gt;</code>), in <code>runtimeconfig.json</code> (<code>System.GC.Server</code>) or in an environment variable (<code>DOTNET_gcServer</code>). The collector reads them <b>once</b>, at initialization.</p><ul><li><code>AppContext.GetData("System.GC.Server")</code> shows what is written in runtimeconfig.json;</li><li><code>GC.GetConfigurationVariables()</code> (.NET 7) — what the collector actually accepted;</li><li>changing an environment variable of a running process does nothing.</li></ul><p>The exception is memory limits: since .NET 8 <code>GC.RefreshMemoryLimit()</code> re-reads the container limit and values such as <code>GCHeapHardLimit</code> set via <code>AppContext.SetData</code>.</p>',
      code: 'foreach (var (key, value) in GC.GetConfigurationVariables())\n    Console.WriteLine($"{key} = {value}");\n\n// The container limit was raised without a restart\nAppContext.SetData("GCHeapHardLimit", (ulong)800 * 1024 * 1024);\nGC.RefreshMemoryLimit();',
      deep: '<p>Since .NET 9 an environment variable wins over the runtimeconfig.json value; before that it was the other way round. Numbers in environment variables are hexadecimal, in runtimeconfig.json decimal. <code>RefreshMemoryLimit</code> throws <code>InvalidOperationException</code> if the new limit is below the memory already committed.</p>'
    },
    {
      t: 'match',
      q: 'Match the question with the API',
      pairs: [
        ['How long have GC pauses lasted in total?', 'GC.GetTotalPauseDuration()'],
        ['Which collector mode is actually running?', 'GCSettings.IsServerGC'],
        ['Which settings did the collector accept at startup?', 'GC.GetConfigurationVariables()'],
        ['How much fragmentation after the last collection?', 'GC.GetGCMemoryInfo()'],
        ['Which generation is this object in?', 'GC.GetGeneration(obj)']
      ]
    },
    {
      t: 'choice',
      q: 'The orchestrator raised the container memory limit from 1 to 2 GB; the process was not restarted. What makes the collector take it into account?',
      options: [
        'Call GC.RefreshMemoryLimit()',
        'Change the DOTNET_GCHeapHardLimit variable',
        'Call GC.Collect(2)',
        'Nothing helps without a restart'
      ],
      answer: 0,
      explain: 'Since .NET 8 RefreshMemoryLimit re-detects the limits: both the container’s and those set via AppContext. The runtime does not read environment variables after startup.',
      wrong: { 3: 'That was true before .NET 8. Now there is RefreshMemoryLimit.' }
    }
  ]
};

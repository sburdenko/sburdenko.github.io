/** Memory in .NET, final of the unit "GC modes". */
export default {
  id: 'mem.u6.boss',
  title: 'Final: GC modes',
  sub: 'Server and Workstation, background GC, latency, DATAS and settings',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'A web API on Microsoft.NET.Sdk.Web, .NET 9, GC settings untouched. The container runs with a CPU limit of one core. Which collector actually runs?',
      options: [
        'Workstation: with a single available core, Server GC does not turn on',
        'Server with DATAS: that is what the Web SDK sets in .NET 9',
        'Server with one heap and one GC thread',
        'Server without DATAS: DATAS turns off on a single core'
      ],
      answer: 0,
      explain: 'The Web SDK asks for Server GC, but the runtime turns it on only if the process has more than one logical processor available — counting the container\'s CPU quota. With one core, Workstation runs and GCSettings.IsServerGC returns False.',
      wrong: { 2: 'It looks similar in structure, but it is not Server: with one core the runtime picks the Workstation implementation right away.' }
    },
    {
      t: 'multi',
      q: 'What is true? Select all.',
      options: [
        'Foreground gen0 and gen1 collections can run during a background gen2 collection',
        'LowLatency is silently not applied on Server GC',
        'DOTNET_GCHeapCount=20 gives 20 heaps',
        'Background GC does not compact gen2',
        'GCSettings.IsServerGC can be switched before the first collection'
      ],
      answer: [0, 1, 3],
      explain: 'Numbers in environment variables are hexadecimal: 0x20 = 32 heaps. IsServerGC is read-only — the mode is chosen at startup. The rest is true: foreground collections run during a BGC, LowLatency is ignored on Server without an exception, and a BGC only sweeps.'
    },
    {
      t: 'order',
      q: 'Put the milestones in time order, earliest first',
      items: [
        'Concurrent GC: no ephemeral collections while it runs',
        'Background GC for Workstation (.NET Framework 4)',
        'Background GC for Server (.NET Framework 4.5)',
        'HeapHardLimit and the 75% container ceiling (.NET Core 3.0)',
        'DATAS opt-in (.NET 8)',
        'DATAS on by default for Server GC (.NET 9)'
      ],
      explain: 'First concurrent GC, then background GC — for Workstation first, then for Server. .NET Core 3.0 taught the collector about container limits, and DATAS arrived in .NET 8 and became the default in .NET 9.'
    },
    {
      t: 'tapline',
      q: 'This is code from a Server GC service. Which line silently fails to do what the author intended?',
      code: 'var old = GCSettings.LatencyMode;\ntry\n{\n    GCSettings.LatencyMode = GCLatencyMode.LowLatency;\n    ProcessMarketBurst();\n}\nfinally\n{\n    GCSettings.LatencyMode = old;\n}',
      answer: 3,
      explain: 'LowLatency applies only to Workstation GC. On Server the assignment changes nothing and throws no exception. Server needs SustainedLowLatency — with background GC on.'
    },
    {
      t: 'match',
      q: 'Match the situation with the right knob',
      pairs: [
        ['Forty small services on one machine', 'Workstation GC'],
        ['Batch processing, nobody cares about pauses', 'System.GC.Concurrent = false'],
        ['An hour of trading with no blocking full collections', 'SustainedLowLatency'],
        ['Throughput dropped after moving to .NET 9', 'DynamicAdaptationMode = 0'],
        ['The heap keeps growing and shrinking, many calls to the OS', 'System.GC.RetainVM = true']
      ]
    },
    {
      t: 'blanks',
      q: 'Dockerfile: Server GC and a 200 MiB heap ceiling (209715200 bytes). Fill in the values',
      code: 'ENV DOTNET_gcServer=___\nENV DOTNET_GCHeapHardLimit=___',
      tiles: ['1', 'C800000', '209715200', 'true', '200'],
      answer: ['1', 'C800000'],
      explain: 'Boolean environment variables take 0 or 1, and numbers are read as hexadecimal: 209715200 = 0xC800000. The decimal 209715200 belongs only in runtimeconfig.json.'
    },
    {
      t: 'choice',
      q: 'A background gen2 collection is in progress, and the gen0 budget runs out. What happens?',
      options: [
        'A foreground gen0 collection runs: all managed threads, including the background GC thread, briefly stop',
        'Allocating threads wait for the background collection to finish',
        'The background collection is aborted and restarts as a blocking one',
        'New objects go straight into gen2'
      ],
      answer: 0,
      explain: 'That is the whole point of background GC: ephemeral collections can run while it is going. The background thread yields, the foreground collection runs, then the background one continues from where it left off.',
      wrong: { 1: 'That is how the old concurrent GC worked in .NET Framework 3.5 and earlier. Background GC lifted that restriction.' }
    },
    {
      t: 'choice',
      q: 'Which of these can be changed while the process runs, without a restart?',
      options: ['GCSettings.LatencyMode', 'System.GC.Server', 'System.GC.HeapHardLimit', 'DOTNET_GCHeapCount'],
      answer: 0,
      explain: 'The runtime reads runtimeconfig.json settings and environment variables once, when the collector initializes. The latency mode is the only one here that changes from code on the fly.',
      wrong: { 3: 'You can change the variable, but the process already read it at startup — it will not see the change.' }
    }
  ]
};

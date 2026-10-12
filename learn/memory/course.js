/** Курс «Память в .NET»: разделы и уроки. Готовые разделы — с уроками, остальные — план со статусом «скоро». */
import u1l1 from './u1/l1-virtual.js?v=202610121139';
import u1l2 from './u1/l2-reserve-commit.js?v=202610121139';
import u1l3 from './u1/l3-stack-cache.js?v=202610121139';
import u1boss from './u1/boss.js?v=202610121139';
import u2l1 from './u2/l1-numbers.js?v=202610121139';
import u2l2 from './u2/l2-tools.js?v=202610121139';
import u2l3 from './u2/l3-leak.js?v=202610121139';
import u2boss from './u2/boss.js?v=202610121139';
import u6l1 from './u6/l1-workstation-server.js?v=202610121139';
import u6l2 from './u6/l2-background-latency.js?v=202610121139';
import u6l3 from './u6/l3-datas-config.js?v=202610121139';
import u6boss from './u6/boss.js?v=202610121139';
import u7l1 from './u7/l1-finalization.js?v=202610121139';
import u7l2 from './u7/l2-resurrection.js?v=202610121139';
import u7l3 from './u7/l3-weak-leaks.js?v=202610121139';
import u7boss from './u7/boss.js?v=202610121139';
import u4l1 from './u4/l1-fast-path.js?v=202610121139';
import u4l2 from './u4/l2-slow-path.js?v=202610121139';
import u4l3 from './u4/l3-hidden.js?v=202610121139';
import u4l4 from './u4/l4-pool-measure.js?v=202610121139';
import u4boss from './u4/boss.js?v=202610121139';
import u3l1 from './u3/l1-header.js?v=202610121139';
import u3l2 from './u3/l2-layout.js?v=202610121139';
import u3l3 from './u3/l3-arrays-strings.js?v=202610121139';
import u3l4 from './u3/l4-heaps.js?v=202610121139';
import u3boss from './u3/boss.js?v=202610121139';

export default {
  id: 'memory',
  title: 'Память в .NET',
  units: [
    {
      id: 'u1',
      title: 'Память глазами ОС',
      blurb: 'Что видит операционная система, когда .NET просит память: виртуальные адреса и страницы, reserve и commit, почему у процесса несколько чисел «занятой» памяти, предел стека и кэши процессора.',
      source: { title: 'Microsoft Learn: Virtual address spaces', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/virtual-address-spaces' },
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Как измерять',
      blurb: 'Working set, private bytes, commit и управляемая куча — разные числа. Что показывают Диспетчер задач, top и API сборщика; dotnet-counters, dotnet-gcdump, dotnet-trace, dotnet-dump и PerfView; как найти утечку по двум снимкам и пути до корня.',
      source: { title: 'Microsoft Learn: Debug a memory leak in .NET', url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/debug-memory-leak' },
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Устройство кучи',
      blurb: 'Из чего состоит объект: заголовок, sync block и MethodTable, как CLR раскладывает поля и выравнивает их, как лежат в памяти массивы и строки. SOH, LOH и POH, регионы в .NET 7+ и non-GC куча .NET 8.',
      source: { title: 'Microsoft Learn: The large object heap', url: 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap' },
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Аллокация',
      blurb: 'Почему new в .NET почти бесплатен — сдвиг указателя в контексте аллокации потока — и когда он идёт медленным путём или в LOH. Скрытые аллокации в замыканиях, упаковке, итераторах, params, строках и async; ArrayPool, stackalloc, string.Create и замер байт на вызов.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    },
    { id: 'u5', title: 'Как работает сборка', soon: true, blurb: 'Когда запускается GC, остановка потоков и safepoint, маркировка от корней и card table, планирование, sweep и compact.' },
    {
      id: 'u6',
      title: 'Режимы GC',
      blurb: 'Workstation и Server, фоновая сборка и foreground-сборки на её фоне, режимы задержки GCSettings.LatencyMode, DATAS в .NET 8–9, настройки в runtimeconfig.json и переменных окружения, лимиты контейнера.',
      source: { title: 'Microsoft Learn: Garbage collector config settings', url: 'https://learn.microsoft.com/en-us/dotnet/core/runtime-config/garbage-collector' },
      lessons: [u6l1, u6l2, u6l3, u6boss]
    },
    {
      id: 'u7',
      title: 'Время жизни',
      blurb: 'Финализация изнутри: две очереди, поток финализатора, воскрешение и SuppressFinalize. SafeHandle и критические финализаторы, слабые ссылки и GCHandle, ConditionalWeakTable и утечки через замыкания, статику и таймеры.',
      lessons: [u7l1, u7l2, u7l3, u7boss]
    },
    { id: 'u8', title: 'Продвинутое', soon: true, blurb: 'Закрепление и POH, unsafe и указатели, GC.TryStartNoGCRegion, API сборщика и GCSettings, Native AOT и память.' }
  ]
};

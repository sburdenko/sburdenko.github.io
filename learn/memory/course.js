/** Курс «Память в .NET»: разделы и уроки. Готовые разделы — с уроками, остальные — план со статусом «скоро». */
import u1l1 from './u1/l1-virtual.js?v=202610121134';
import u1l2 from './u1/l2-reserve-commit.js?v=202610121134';
import u1l3 from './u1/l3-stack-cache.js?v=202610121134';
import u1boss from './u1/boss.js?v=202610121134';
import u2l1 from './u2/l1-numbers.js?v=202610121134';
import u2l2 from './u2/l2-tools.js?v=202610121134';
import u2l3 from './u2/l3-leak.js?v=202610121134';
import u2boss from './u2/boss.js?v=202610121134';

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
    { id: 'u3', title: 'Устройство кучи', soon: true, blurb: 'Заголовок объекта и указатель на тип, раскладка полей и выравнивание, SOH, LOH и POH, регионы в .NET 7+ и frozen-сегменты.' },
    { id: 'u4', title: 'Аллокация', soon: true, blurb: 'Сдвиг указателя и контекст аллокации, медленный путь и LOH, скрытые аллокации в замыканиях, упаковке, LINQ и строках, ArrayPool и stackalloc.' },
    { id: 'u5', title: 'Как работает сборка', soon: true, blurb: 'Когда запускается GC, остановка потоков и safepoint, маркировка от корней и card table, планирование, sweep и compact.' },
    { id: 'u6', title: 'Режимы GC', soon: true, blurb: 'Workstation и Server, фоновая сборка, режимы задержки, DATAS и настройки в runtimeconfig.json.' },
    { id: 'u7', title: 'Время жизни', soon: true, blurb: 'Финализация изнутри и воскрешение, SafeHandle, слабые ссылки, ConditionalWeakTable, утечки через события и статику.' },
    { id: 'u8', title: 'Продвинутое', soon: true, blurb: 'Закрепление и POH, unsafe и указатели, GC.TryStartNoGCRegion, API сборщика и GCSettings, Native AOT и память.' }
  ]
};

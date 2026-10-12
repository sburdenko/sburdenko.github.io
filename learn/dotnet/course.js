/** Курс .NET: разделы и уроки. Готовые разделы — с уроками, остальные — план со статусом «скоро». */
import w1l1 from './w1/l1-basics.js?v=202610121138';
import w1l2 from './w1/l2-languages.js?v=202610121138';
import w1l3 from './w1/l3-cil.js?v=202610121138';
import w1l4 from './w1/l4-metadata.js?v=202610121138';
import w1l5 from './w1/l5-jit.js?v=202610121138';
import w1l6 from './w1/l6-aot.js?v=202610121138';
import w1l7 from './w1/l7-safety.js?v=202610121138';
import w1l8 from './w1/l8-run.js?v=202610121138';
import w1boss from './w1/boss.js?v=202610121138';
import w2l1 from './w2/l1-kinds.js?v=202610121138';
import w2l2 from './w2/l2-stack-heap.js?v=202610121138';
import w2l3 from './w2/l3-boxing.js?v=202610121138';
import w2l4 from './w2/l4-passing.js?v=202610121138';
import w2l5 from './w2/l5-strings.js?v=202610121138';
import w2boss from './w2/boss.js?v=202610121138';
import w3l1 from './w3/l1-roots.js?v=202610121138';
import w3l2 from './w3/l2-generations.js?v=202610121138';
import w3l3 from './w3/l3-finalizers.js?v=202610121138';
import w3l4 from './w3/l4-dispose.js?v=202610121138';
import w3l5 from './w3/l5-leaks.js?v=202610121138';
import w3boss from './w3/boss.js?v=202610121138';
import w4l1 from './w4/l1-threads.js?v=202610121138';
import w4l2 from './w4/l2-race.js?v=202610121138';
import w4l3 from './w4/l3-locks.js?v=202610121138';
import w4l4 from './w4/l4-pool.js?v=202610121138';
import w4l5 from './w4/l5-starvation.js?v=202610121138';
import w4boss from './w4/boss.js?v=202610121138';
import w7l1 from './w7/l1-sharing.js?v=202610121138';
import w7l2 from './w7/l2-reflection.js?v=202610121138';
import w7l3 from './w7/l3-dynamic-gen.js?v=202610121138';
import w7boss from './w7/boss.js?v=202610121138';
import w8l1 from './w8/l1-tiers.js?v=202610121138';
import w8l2 from './w8/l2-r2r-aot.js?v=202610121138';
import w8l3 from './w8/l3-inline-bench.js?v=202610121138';
import w8boss from './w8/boss.js?v=202610121138';
import w5l1 from './w5/l1-anatomy.js?v=202610121138';
import w5l2 from './w5/l2-versions.js?v=202610121138';
import w5l3 from './w5/l3-strong-names.js?v=202610121138';
import w5l4 from './w5/l4-resolve.js?v=202610121138';
import w5boss from './w5/boss.js?v=202610121138';

export default {
  id: 'dotnet',
  title: '.NET изнутри',
  units: [
    {
      id: 'w1',
      title: 'Как запускается код .NET',
      blurb: 'Путь программы от текста на C# до команд процессора: компилятор, CIL, метаданные, JIT, AOT и сам CLR.',
      source: { title: 'Microsoft Learn: Managed execution process', url: 'https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process' },
      lessons: [w1l1, w1l2, w1l3, w1l4, w1l5, w1l6, w1l7, w1l8, w1boss]
    },
    {
      id: 'w2',
      title: 'Типы и память',
      blurb: 'Значимые и ссылочные типы, стек и куча, упаковка, передача аргументов и особенности string — на стенде, где видно каждую переменную и каждый объект.',
      lessons: [w2l1, w2l2, w2l3, w2l4, w2l5, w2boss]
    },
    {
      id: 'w3',
      title: 'Сборка мусора и ресурсы',
      blurb: 'Корни и достижимость, поколения и LOH, финализаторы, IDisposable и using, SafeHandle и утечки памяти. Сам запускаешь сборки и смотришь, кто выжил.',
      lessons: [w3l1, w3l2, w3l3, w3l4, w3l5, w3boss]
    },
    {
      id: 'w4',
      title: 'Потоки и пул потоков',
      blurb: 'Потоки и планировщик, гонка данных, lock и Interlocked, deadlock, пул потоков и его голодание. Ты сам переключаешь потоки и ловишь баги.',
      lessons: [w4l1, w4l2, w4l3, w4l4, w4l5, w4boss]
    },
    {
      id: 'w5',
      title: 'Сборки и версии',
      blurb: 'Что лежит в сборке, три её версии и какую из них смотрит загрузчик, строгие имена и GAC тогда и сейчас, deps.json вместо поиска по папкам и как NuGet выбирает одну версию пакета.',
      lessons: [w5l1, w5l2, w5l3, w5l4, w5boss]
    },
    { id: 'w6', title: 'Загрузка и хостинг', soon: true, blurb: 'Как запускается dotnet app.dll: apphost, hostfxr и rollForward; AppDomain тогда и AssemblyLoadContext сейчас — плагины и выгрузка; trimming и single-file.' },
    {
      id: 'w7',
      title: 'Дженерики и рефлексия изнутри',
      blurb: 'Как JIT делит код дженериков через __Canon и словари, что стоит за токенами метаданных, MethodInfo и Invoke, как устроен кэш call site у dynamic и почему source generators заменяют рефлексию.',
      lessons: [w7l1, w7l2, w7l3, w7boss]
    },
    {
      id: 'w8',
      title: 'Производительность рантайма',
      blurb: 'Как .NET делает код быстрым на ходу: уровни JIT, OSR и Dynamic PGO, ReadyToRun и Native AOT в сравнении, встраивание и девиртуализация — и как честно замерить результат в BenchmarkDotNet. Финал курса.',
      lessons: [w8l1, w8l2, w8l3, w8boss]
    }
  ]
};

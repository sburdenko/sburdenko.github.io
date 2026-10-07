/** Курс .NET: разделы и уроки. Открыт только первый раздел, остальные — план. */
import l1 from './l1-basics.js?v=202610072311';
import l2 from './l2-languages.js?v=202610072311';
import l3 from './l3-cil.js?v=202610072311';
import l4 from './l4-metadata.js?v=202610072311';
import l5 from './l5-jit.js?v=202610072311';
import l6 from './l6-aot.js?v=202610072311';
import l7 from './l7-safety.js?v=202610072311';
import l8 from './l8-run.js?v=202610072311';
import boss from './boss.js?v=202610072311';

export default {
  id: 'dotnet',
  title: '.NET изнутри',
  units: [
    {
      id: 'w1',
      title: 'Как запускается код .NET',
      blurb: 'Путь программы от текста на C# до команд процессора: компилятор, CIL, метаданные, JIT, AOT и сам CLR.',
      source: { title: 'Microsoft Learn: Managed execution process', url: 'https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process' },
      lessons: [l1, l2, l3, l4, l5, l6, l7, l8, boss]
    },
    { id: 'w2', title: 'Типы и память', soon: true, blurb: 'Значимые и ссылочные типы, стек и куча, boxing.' },
    { id: 'w3', title: 'Сборка мусора', soon: true, blurb: 'Поколения, большие объекты, финализаторы и IDisposable.' },
    { id: 'w4', title: 'Async изнутри', soon: true, blurb: 'Task, машина состояний и куда девается поток во время await.' }
  ]
};

/** Курс «История .NET»: от Framework 1.0 до .NET 10 — и где .NET сейчас. */
import u1l1 from './u1/l1-why.js?v=202610101341';
import u1l2 from './u1/l2-growth.js?v=202610101341';
import u1l3 from './u1/l3-end.js?v=202610101341';
import u1boss from './u1/boss.js?v=202610101341';
import u2l1 from './u2/l1-mono.js?v=202610101341';
import u2l2 from './u2/l2-unity.js?v=202610101341';
import u2l3 from './u2/l3-xamarin.js?v=202610101341';
import u2boss from './u2/boss.js?v=202610101341';
import u3l1 from './u3/l1-open.js?v=202610101341';
import u3l2 from './u3/l2-core.js?v=202610101341';
import u3l3 from './u3/l3-standard.js?v=202610101341';
import u3l4 from './u3/l4-multitarget.js?v=202610101341';
import u3boss from './u3/boss.js?v=202610101341';
import u4l1 from './u4/l1-one.js?v=202610101341';
import u4l2 from './u4/l2-net10.js?v=202610101341';
import u4l3 from './u4/l3-now.js?v=202610101341';
import u4l4 from './u4/l4-diff.js?v=202610101341';
import u4boss from './u4/boss.js?v=202610101341';

export default {
  id: 'history',
  title: 'История .NET',
  units: [
    {
      id: 'u1',
      title: 'Эпоха .NET Framework',
      blurb: 'Зачем Microsoft сделала .NET, как Framework рос от дженериков до async и почему версия 4.8 — последняя, но всё ещё нужна плагинам старых Revit и AutoCAD.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Mono, Unity и Xamarin',
      blurb: 'Открытая реализация по стандарту ECMA, C# в Unity (Mono, IL2CPP, путь к CoreCLR) и на телефонах: Xamarin и MAUI.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Open source, .NET Core и .NET Standard',
      blurb: 'Открытые исходники, новый кросс-платформенный .NET, стандарт как контракт API и почему 2.1 есть в Unity и .NET 10, но не во Framework. Мульти-таргетинг.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'Один .NET и где он сейчас',
      blurb: '.NET 5–10, LTS и STS, что нового в .NET 10 и C# 14, где сегодня работает .NET и чем Framework отличается от современного .NET.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    }
  ]
};

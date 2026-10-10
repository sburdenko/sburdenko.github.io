/** Курс «C# глубже»: дженерики, делегаты, LINQ, Span и современный C#. */
import u1l1 from './u1/l1-why.js?v=202610100752';
import u1l2 from './u1/l2-constraints.js?v=202610100752';
import u1l3 from './u1/l3-variance.js?v=202610100752';
import u1boss from './u1/boss.js?v=202610100752';
import u2l1 from './u2/l1-delegates.js?v=202610100752';
import u2l2 from './u2/l2-events.js?v=202610100752';
import u2l3 from './u2/l3-closures.js?v=202610100752';
import u2boss from './u2/boss.js?v=202610100752';
import u3l1 from './u3/l1-lazy.js?v=202610100752';
import u3l2 from './u3/l2-materialize.js?v=202610100752';
import u3l3 from './u3/l3-cost.js?v=202610100752';
import u3boss from './u3/boss.js?v=202610100752';
import u4l1 from './u4/l1-span.js?v=202610100752';
import u4l2 from './u4/l2-refstruct.js?v=202610100752';
import u4l3 from './u4/l3-copies.js?v=202610100752';
import u4boss from './u4/boss.js?v=202610100752';
import u5l1 from './u5/l1-patterns.js?v=202610100752';
import u5l2 from './u5/l2-records.js?v=202610100752';
import u5l3 from './u5/l3-nullable.js?v=202610100752';
import u5l4 from './u5/l4-modern.js?v=202610100752';
import u5boss from './u5/boss.js?v=202610100752';

export default {
  id: 'csharp',
  title: 'C# глубже',
  units: [
    {
      id: 'u1',
      title: 'Дженерики',
      blurb: 'Зачем они, как JIT компилирует их для значимых и ссылочных типов, ограничения where, ковариантность и контравариантность, обобщённая математика INumber<T>.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Делегаты, события и замыкания',
      blurb: 'Func и Action, многоадресные делегаты, event и утечки подписок, лямбды и что именно они захватывают.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'LINQ и его цена',
      blurb: 'Ленивое выполнение и Take, ToList и повторный перебор, буферизующий OrderBy, IQueryable и SQL из лямбд.',
      lessons: [u3l1, u3l2, u3l3, u3boss]
    },
    {
      id: 'u4',
      title: 'Производительность',
      blurb: 'Span<T> и срезы без копий, правила ref struct и Memory<T>, readonly struct, in и защитные копии.',
      lessons: [u4l1, u4l2, u4l3, u4boss]
    },
    {
      id: 'u5',
      title: 'Современный C#',
      blurb: 'Pattern matching, records, nullable-ссылки, required и новое в C# 12, 13 и 14. Финал курса.',
      lessons: [u5l1, u5l2, u5l3, u5l4, u5boss]
    }
  ]
};

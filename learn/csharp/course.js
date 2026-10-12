/** Курс «C# глубже»: дженерики, делегаты, LINQ, Span и современный C#. */
import u6l1 from './u6/l1-object.js?v=202610121140';
import u6l2 from './u6/l2-casts.js?v=202610121140';
import u6l3 from './u6/l3-primitives.js?v=202610121140';
import u6boss from './u6/boss.js?v=202610121140';
import u1l1 from './u1/l1-why.js?v=202610121140';
import u1l2 from './u1/l2-constraints.js?v=202610121140';
import u1l3 from './u1/l3-variance.js?v=202610121140';
import u1boss from './u1/boss.js?v=202610121140';
import u2l1 from './u2/l1-delegates.js?v=202610121140';
import u2l2 from './u2/l2-events.js?v=202610121140';
import u2l3 from './u2/l3-closures.js?v=202610121140';
import u2l4 from './u2/l4-inside.js?v=202610121140';
import u2boss from './u2/boss.js?v=202610121140';
import u3l1 from './u3/l1-lazy.js?v=202610121140';
import u3l2 from './u3/l2-materialize.js?v=202610121140';
import u3l3 from './u3/l3-cost.js?v=202610121140';
import u3boss from './u3/boss.js?v=202610121140';
import u4l1 from './u4/l1-span.js?v=202610121140';
import u4l2 from './u4/l2-refstruct.js?v=202610121140';
import u4l3 from './u4/l3-copies.js?v=202610121140';
import u4boss from './u4/boss.js?v=202610121140';
import u5l1 from './u5/l1-patterns.js?v=202610121140';
import u5l2 from './u5/l2-records.js?v=202610121140';
import u5l3 from './u5/l3-nullable.js?v=202610121140';
import u5l4 from './u5/l4-modern.js?v=202610121140';
import u5boss from './u5/boss.js?v=202610121140';
import u9l1 from './u9/l1-ref.js?v=202610121140';
import u9l2 from './u9/l2-args.js?v=202610121140';
import u9l3 from './u9/l3-props.js?v=202610121140';
import u9boss from './u9/boss.js?v=202610121140';
import u7l1 from './u7/l1-boxing.js?v=202610121140';
import u7l2 from './u7/l2-mutable.js?v=202610121140';
import u7l3 from './u7/l3-equality-layout.js?v=202610121140';
import u7boss from './u7/boss.js?v=202610121140';
import u12l1 from './u12/l1-finally.js?v=202610121140';
import u12l2 from './u12/l2-rethrow.js?v=202610121140';
import u12l3 from './u12/l3-unhandled.js?v=202610121140';
import u12boss from './u12/boss.js?v=202610121140';
import u8l1 from './u8/l1-const.js?v=202610121140';
import u8l2 from './u8/l2-init.js?v=202610121140';
import u8l3 from './u8/l3-virtual.js?v=202610121140';
import u8l4 from './u8/l4-operators.js?v=202610121140';
import u8boss from './u8/boss.js?v=202610121140';
import u10l1 from './u10/l1-explicit.js?v=202610121140';
import u10l2 from './u10/l2-evolve.js?v=202610121140';
import u10boss from './u10/boss.js?v=202610121140';
import u11l1 from './u11/l1-strings.js?v=202610121140';
import u11l2 from './u11/l2-building.js?v=202610121140';
import u11l3 from './u11/l3-enums.js?v=202610121140';
import u11l4 from './u11/l4-arrays-nullable.js?v=202610121140';
import u11boss from './u11/boss.js?v=202610121140';
import u13l1 from './u13/l1-custom.js?v=202610121140';
import u13l2 from './u13/l2-cost.js?v=202610121140';
import u13l3 from './u13/l3-generators.js?v=202610121140';
import u13boss from './u13/boss.js?v=202610121140';

export default {
  id: 'csharp',
  title: 'C# глубже',
  units: [
    {
      id: 'u6',
      title: 'Устройство типа',
      blurb: 'Что есть у любого объекта: System.Object, заголовок и указатель на тип, контракт Equals/GetHashCode; приведения, is, as и распаковка; примитивы, checked и переполнение, dynamic и его цена.',
      lessons: [u6l1, u6l2, u6l3, u6boss]
    },
    {
      id: 'u7',
      title: 'Значимые типы до конца',
      blurb: 'Упаковка, которой не видно в коде: интерфейсы, GetType и методы ValueType; изменяемая структура в коллекции и foreach; ValueType.Equals через отражение, IEquatable<T>, record struct и раскладка полей.',
      lessons: [u7l1, u7l2, u7l3, u7boss]
    },
    {
      id: 'u8',
      title: 'Члены типа и версии',
      blurb: 'Что ломается у потребителя библиотеки без перекомпиляции: const против static readonly, порядок инициализации и beforefieldinit, virtual/new/override и call/callvirt, операторы, преобразования и методы расширения вплоть до extension-блоков C# 14.',
      lessons: [u8l1, u8l2, u8l3, u8l4, u8boss]
    },
    {
      id: 'u9',
      title: 'Параметры, свойства, кортежи',
      blurb: 'ref изнутри: ref readonly, ref-возвраты и CollectionsMarshal; где живёт значение по умолчанию и что ломает «версия 2»; params и params ReadOnlySpan; свойства, field, init и required в метаданных; анонимные типы, ValueTuple и Deconstruct.',
      lessons: [u9l1, u9l2, u9l3, u9boss]
    },
    {
      id: 'u1',
      title: 'Дженерики',
      blurb: 'Зачем они, как JIT компилирует их для значимых и ссылочных типов, ограничения where, ковариантность и контравариантность, обобщённая математика INumber<T>.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u10',
      title: 'Интерфейсы',
      blurb: 'Явная реализация и почему структура за интерфейсом живёт в коробке, как CLR находит метод интерфейса; методы по умолчанию и сценарий «версия 2», статические абстрактные члены, интерфейс или базовый класс.',
      lessons: [u10l1, u10l2, u10boss]
    },
    {
      id: 'u2',
      title: 'Делегаты, события и замыкания',
      blurb: 'Func и Action, многоадресные делегаты, event и утечки подписок, лямбды и что именно они захватывают; что делегат такое изнутри: класс от MulticastDelegate, цепочки и исключения в них, явные add/remove.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2boss]
    },
    {
      id: 'u11',
      title: 'Строки, перечисления, массивы',
      blurb: 'Строка в памяти и пул литералов, ordinal против культуры и турецкая i, Concat, StringBuilder, обработчик интерполяции, string.Create и u8-литералы; перечисления как структура над целым, вшитые значения и [Flags]; цена ковариантности массивов, зубчатые и многомерные, InlineArray, упаковка int?.',
      lessons: [u11l1, u11l2, u11l3, u11l4, u11boss]
    },
    {
      id: 'u12',
      title: 'Исключения и надёжность',
      blurb: 'Что гарантирует finally и когда он не выполняется, фильтры when и два прохода обработки, throw против throw ex и ExceptionDispatchInfo, навсегда сломанный тип, что роняет процесс, цена исключения, TryXxx и свои исключения.',
      lessons: [u12l1, u12l2, u12l3, u12boss]
    },
    {
      id: 'u13',
      title: 'Атрибуты и рефлексия',
      blurb: 'Свой атрибут и где он живёт в метаданных, AttributeUsage и псевдо-атрибуты; цена рефлексии: Invoke, делегат, Expression, UnsafeAccessor и Activator; source generators вместо рефлексии, trimming и Native AOT.',
      lessons: [u13l1, u13l2, u13l3, u13boss]
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

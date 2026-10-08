/** Финал раздела 4 курса «C# глубже». */
export default {
  id: 'cs.u4.boss',
  title: 'Финал: производительность',
  sub: 'Span, ref struct, копии',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'allocs',
      task: 'Начни с Substring и найди способ без аллокаций.',
      start: 'substring',
      goal: { max: 0 },
      solve: ['way:span']
    },
    {
      t: 'rig', rig: 'copies',
      task: 'Метод получает матрицу через ref. Сделай безопасно и без копий.',
      start: { pass: 'ref' },
      goal: { max: 0, safe: true },
      solve: ['pass:in', 'ro']
    },
    {
      t: 'tapline',
      q: 'Что не скомпилируется?',
      code: 'Span<int> nums = stackalloc int[4];\nobject boxed = nums;\nint first = nums[0];',
      answer: 1,
      explain: 'ref struct нельзя упаковать: object живёт в куче.'
    },
    {
      t: 'choice',
      q: 'Буфер нужно передать в async-метод записи в поток. Что передать?',
      options: ['ReadOnlyMemory<byte>', 'ReadOnlySpan<byte>', 'Span<byte>'],
      answer: 0,
      explain: 'Span нельзя держать через await.'
    },
    {
      t: 'multi',
      q: 'Что уменьшает нагрузку на GC? Отметь все.',
      options: ['Срезы Span вместо Substring', 'stackalloc для маленьких буферов', 'ArrayPool<T>.Shared для больших временных массивов', 'ToList() после каждого Where'],
      answer: [0, 1, 2],
      explain: 'ToList создаёт новый список — это лишний мусор.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Span<T>', 'Окно в память'],
        ['Memory<T>', 'Окно для кучи и async'],
        ['readonly struct', 'Без защитных копий'],
        ['ArrayPool', 'Переиспользование массивов']
      ]
    },
    {
      t: 'choice',
      q: 'Почему Span не может быть полем класса?',
      options: ['Он может смотреть в стек, а объект класса живёт дольше метода — окно смотрело бы в мусор', 'Span слишком большой', 'Это ограничение JIT'],
      answer: 0,
      explain: 'ref struct — способ компилятора гарантировать безопасность без проверок в рантайме.'
    },
    {
      t: 'choice',
      q: 'in + обычная (не readonly) структура с двумя вызовами методов внутри. Сколько защитных копий?',
      options: ['Две — по одной перед каждым вызовом метода', 'Ноль', 'Одна'],
      answer: 0,
      explain: 'Каждый вызов метода на in-параметре делается на копии.'
    }
  ]
};

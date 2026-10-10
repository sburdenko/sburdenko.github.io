/** C# глубже, раздел 4, урок 2: ref struct и Memory<T>. */
export default {
  id: 'cs.u4.l2',
  title: 'ref struct: правила Span',
  sub: 'Почему Span нельзя в поле и через await',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Span живёт только на стеке',
      body: '<p>Span может смотреть в память стека. Если бы Span попал в кучу, он пережил бы метод — и смотрел бы в уже чужой стек. Поэтому Span — <b>ref struct</b>: компилятор не даёт ему попасть в кучу.</p>'
    },
    {
      t: 'learn',
      title: 'Чего нельзя',
      body: '<p>Нельзя: хранить Span в поле класса, упаковывать (в object или интерфейс), захватывать в лямбду, держать через <code>await</code> или <code>yield</code>.</p><p>С C# 13 Span можно объявлять в async-методах — но только между await, не через них.</p>'
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется?',
      code: 'class Parser\n{\n    private Span<byte> _buffer;\n    public int Count;\n}',
      answer: 2,
      explain: 'Поле класса живёт в куче, а Span там жить нельзя.'
    },
    {
      t: 'tapline',
      q: 'Где ошибка?',
      code: 'async Task ProcessAsync(byte[] data)\n{\n    Span<byte> head = data.AsSpan(0, 4);\n    await SendAsync();\n    Use(head);\n}',
      answer: 4,
      explain: 'head используется после await — значит, должен пережить приостановку и попасть в кучу. Нельзя.'
    },
    {
      t: 'learn',
      title: 'Memory<T> — для кучи и async',
      body: '<p>Нужно окно, которое можно хранить в поле или передать через await? Бери <code>Memory&lt;T&gt;</code>: обычная структура, живёт где угодно, а <code>.Span</code> даёт Span для работы здесь и сейчас.</p>',
      code: 'async Task SendAsync(ReadOnlyMemory<byte> data)\n{\n    await _stream.WriteAsync(data);\n    Log(data.Span[0]);\n}'
    },
    {
      t: 'choice',
      q: 'Нужно хранить срез буфера в поле класса. Что выбрать?',
      options: ['Memory<T>', 'Span<T>', 'ref Span<T>'],
      answer: 0,
      explain: 'Memory<T> — обычная структура без ограничений ref struct.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Span<T>', 'Только на стеке, быстрый'],
        ['Memory<T>', 'Можно в поле и через await'],
        ['ref struct', 'Не может попасть в кучу'],
        ['.Span', 'Получить Span из Memory']
      ]
    },
    {
      t: 'multi',
      q: 'Что нельзя делать со Span<T>? Отметь все.',
      options: ['Хранить в поле класса', 'Захватывать в лямбду', 'Держать через await', 'Передавать параметром в обычный метод'],
      answer: [0, 1, 2],
      explain: 'Параметром — можно, это всё ещё стек.'
    }
  ]
};

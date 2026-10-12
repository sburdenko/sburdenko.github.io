/** Финал раздела «Атрибуты и рефлексия» курса «C# глубже». */
export default {
  id: 'cs.u13.boss',
  title: 'Финал: атрибуты и рефлексия',
  sub: 'Метаданные, цена вызова и AOT',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'choice',
      q: 'У типа t один атрибут [Route]. Сколько объектов RouteAttribute создаст цикл?',
      code: 'for (int i = 0; i < 1000; i++)\n{\n    if (t.IsDefined(typeof(RouteAttribute)))\n        Use(t.GetCustomAttribute<RouteAttribute>()!);\n}',
      options: ['1000', '1', '2000', '0'],
      answer: 0,
      explain: 'IsDefined смотрит метаданные и объект не создаёт. GetCustomAttribute каждый раз разбирает blob и вызывает конструктор заново — 1000 вызовов, 1000 объектов. Читай один раз и кэшируй.',
      wrong: { 2: 'IsDefined конструктор не вызывает — только проверяет, есть ли запись.' }
    },
    {
      t: 'tapline',
      q: 'Какая строка не скомпилируется? Параметры конструкторов атрибутов совпадают по типу с аргументами.',
      code: 'enum Level { Low, High }\n\n[Priority(Level.High)]\n[Since("2026-01-01")]\n[Owner(nameof(Billing))]\n[Limit(1.5m)]\n[Types(new[] { typeof(int), typeof(string) })]\nclass Billing { }',
      answer: 5,
      explain: 'decimal нет в списке типов параметров атрибута: CS0181. Перечисление, строка, nameof и одномерный массив Type — разрешены. Дробное значение передают как double или строкой.'
    },
    {
      t: 'multi',
      q: 'Какие атрибуты компилятор превращает во флаги и отдельные таблицы метаданных, а не в строку CustomAttribute? Отметь все.',
      options: ['[Serializable]', '[DllImport]', '[Obsolete]', '[StructLayout]', '[Flags]'],
      answer: [0, 1, 3],
      explain: 'Serializable — бит в флагах типа, DllImport — таблица ImplMap, StructLayout — флаги раскладки и ClassLayout. Их читает загрузчик типов. Obsolete и Flags — обычные атрибуты: их читают компилятор и Enum.ToString.'
    },
    {
      t: 'order',
      q: 'Расставь, что происходит внутри t.GetCustomAttribute<RouteAttribute>()',
      items: ['Найти строки CustomAttribute, чей владелец — t', 'Отобрать те, чей конструктор принадлежит RouteAttribute', 'Разобрать blob с аргументами', 'Вызвать конструктор с позиционными аргументами', 'Присвоить именованные свойства и поля'],
      explain: 'Объект собирается только в конце и только по запросу. До этого атрибут — строка таблицы и байты blob.'
    },
    {
      t: 'choice',
      q: 'Горячий цикл вызывает приватный метод чужого типа миллионы раз. Проект на .NET 8, позже его опубликуют с Native AOT. Что выбрать?',
      options: ['UnsafeAccessor', 'MethodInfo.Invoke с закэшированным MethodInfo', 'Expression.Compile с кэшем делегата', 'dynamic'],
      answer: 0,
      explain: 'UnsafeAccessor стоит как прямой вызов и не требует генерации кода при запуске. Invoke — десятки наносекунд и аллокации на каждом вызове. Скомпилированное выражение быстрое под JIT, но в Native AOT превращается в интерпретатор. dynamic private-методы не видит.',
      wrong: { 2: 'Под JIT вариант хороший, но в Native AOT Compile вернёт делегат над интерпретатором — медленнее Invoke.' }
    },
    {
      t: 'match',
      q: 'Соедини код диагностики и причину',
      pairs: [
        ['IL2026', 'Вызов члена с [RequiresUnreferencedCode]'],
        ['IL3050', 'Вызов члена с [RequiresDynamicCode]'],
        ['IL2057', 'Type.GetType с неизвестной строкой'],
        ['IL2067', 'Type передан без нужной аннотации DynamicallyAccessedMembers'],
        ['CS0181', 'Недопустимый тип параметра атрибута']
      ]
    },
    {
      t: 'choice',
      q: 'Что напечатает код?',
      code: '[AttributeUsage(AttributeTargets.Property, Inherited = true)]\nclass TrackAttribute : Attribute { }\n\nclass Base { [Track] public virtual int Qty { get; set; } }\nclass Child : Base { public override int Qty { get; set; } }\n\nvar p = typeof(Child).GetProperty("Qty")!;\nConsole.WriteLine(p.GetCustomAttributes(true).Length);\nConsole.WriteLine(Attribute.GetCustomAttributes(p, true).Length);',
      options: ['0 и 1', '1 и 1', '0 и 0', '1 и 0'],
      answer: 0,
      explain: 'У свойств и событий PropertyInfo.GetCustomAttributes игнорирует параметр inherit и смотрит только на само переопределение. Статический Attribute.GetCustomAttributes проходит по цепочке и находит [Track] у Base.Qty.'
    },
    {
      t: 'choice',
      q: 'В версии 2 библиотеки перечисление стало enum Level { Low, Mid, High }. Приложение с [Priority(Level.High)], собранное против версии 1 (Low, High), не пересобирали. Что прочитает атрибут?',
      options: ['Level.Mid', 'Level.High', 'Исключение при чтении атрибута', '(Level)2'],
      answer: 0,
      explain: 'В blob записано число 1 — значение High из версии 1, а не имя. При чтении это число превращается в Level из новой библиотеки, а там 1 — это Mid. Новые члены перечисления добавляют в конец, а лучше задают значения явно.'
    }
  ]
};

/** Tape 05 strings: page, map and SOLID. */
export const CORE = {
  'page.title': { en: 'Design patterns and SOLID in Unity 6 · Tape 05', ru: 'Паттерны проектирования и SOLID в Unity 6 · Кассета 05' },
  'page.desc': {
    en: 'SOLID and the Unity e-book patterns as working rigs: factory, object pool, singleton, command, state, observer, MVP, MVVM, strategy, flyweight and dirty flag.',
    ru: 'SOLID и паттерны из книги Unity в живых стендах: factory, object pool, singleton, command, state, observer, MVP, MVVM, strategy, flyweight и dirty flag.',
  },
  'hero.eyebrow': { en: 'Tape 05 · Unity 6 · code architecture', ru: 'Кассета 05 · Unity 6 · архитектура кода' },
  'hero.title': { en: 'Patterns', ru: 'Паттерны' },
  'hero.subtitle': { en: 'first the pain, then the tool', ru: 'сначала боль, потом инструмент' },
  'hero.lede': {
    en: 'A pass through Unity’s e-book <i>Level up your code with design patterns and SOLID</i>: five principles and eleven patterns. Every chapter has the book’s idea, its C# code, a rig where you can break the naive version and fix it, and a note where the book is outdated or imprecise.',
    ru: 'Разбор книги Unity <i>Level up your code with design patterns and SOLID</i>: пять принципов и одиннадцать паттернов. В каждой главе — идея из книги, её код на C#, стенд, где наивную версию можно сломать и починить, и заметка там, где книга устарела или неточна.',
  },
  'hero.thesis': {
    en: '<b>The point of this tape:</b> a pattern is a name for a solution to a recurring pressure, not a goal. The book repeats KISS on every page — add structure only when the pain is real. Pick the pain below to jump to its chapter.',
    ru: '<b>Главная мысль кассеты:</b> паттерн — это имя решения повторяющейся проблемы, а не цель. Книга на каждой странице повторяет KISS: добавляй структуру, только когда боль уже есть. Выбери боль ниже — перейдёшь к главе.',
  },
  'map.items': {
    en: [
      ['One class changes for every feature', 'SOLID', 'solid'],
      ['Spawning code knows every concrete type', 'Factory', 'factory'],
      ['Bullets cause GC spikes', 'Object Pool', 'pool'],
      ['One manager, reachable from anywhere', 'Singleton', 'singleton'],
      ['Actions need undo, replay or queuing', 'Command', 'command'],
      ['A switch on an enum keeps growing', 'State', 'state'],
      ['Many systems react to one event', 'Observer', 'observer'],
      ['UI code is tangled with data', 'MVP · MVVM', 'ui'],
      ['Behaviour must be swapped at runtime', 'Strategy', 'strategy'],
      ['Thousands of objects copy the same data', 'Flyweight', 'flyweight'],
      ['Expensive work repeats every frame', 'Dirty Flag', 'dirty'],
    ],
    ru: [
      ['Один класс меняется ради каждой фичи', 'SOLID', 'solid'],
      ['Код спавна знает каждый конкретный тип', 'Factory', 'factory'],
      ['Пули вызывают всплески GC', 'Object Pool', 'pool'],
      ['Один менеджер, доступный отовсюду', 'Singleton', 'singleton'],
      ['Действиям нужны undo, replay или очередь', 'Command', 'command'],
      ['switch по enum растёт и растёт', 'State', 'state'],
      ['Много систем реагируют на одно событие', 'Observer', 'observer'],
      ['Код UI перепутан с данными', 'MVP · MVVM', 'ui'],
      ['Поведение меняется во время игры', 'Strategy', 'strategy'],
      ['Тысячи объектов копируют одни данные', 'Flyweight', 'flyweight'],
      ['Дорогая работа повторяется каждый кадр', 'Dirty Flag', 'dirty'],
    ],
  },
  'hero.unity': {
    en: '<div><span class="n">✓</span><h3>Game loop</h3><p>Already in Unity: <code>Update</code>, <code>LateUpdate</code>, <code>FixedUpdate</code> with fixed and variable time steps.</p></div><div><span class="n">✓</span><h3>Prototype</h3><p>Prefabs and Prefab Variants clone a template object with its components.</p></div><div><span class="n">✓</span><h3>Component</h3><p>A GameObject is a composition of small components, each doing one thing.</p></div>',
    ru: '<div><span class="n">✓</span><h3>Game loop</h3><p>Уже есть в Unity: <code>Update</code>, <code>LateUpdate</code>, <code>FixedUpdate</code> с фиксированным и переменным шагом времени.</p></div><div><span class="n">✓</span><h3>Prototype</h3><p>Prefab и Prefab Variant клонируют объект-шаблон вместе с компонентами.</p></div><div><span class="n">✓</span><h3>Component</h3><p>GameObject — это композиция маленьких компонентов, каждый делает одно дело.</p></div>',
  },

  'solid.h2': { en: 'SOLID: where does the next change land?', ru: 'SOLID: куда попадёт следующее изменение?' },
  'solid.kicker': {
    en: 'The five principles are not about pretty code. Each one answers the same question: when a new requirement arrives, how many existing, working classes do I have to open? Run the requests on the book’s “before” design, then on the “after” one.',
    ru: 'Пять принципов — не про красоту кода. Каждый отвечает на один вопрос: когда приходит новое требование, сколько уже работающих классов придётся открыть? Прогони запросы на «до» из книги, потом на «после».',
  },
  'solid.gloss': {
    en: '<div><dt>S · Single responsibility</dt><dd>A class has one reason to change. The book splits a player into input, movement, audio and FX components — the same way Unity splits a GameObject.</dd></div><div><dt>O · Open-closed</dt><dd>Open for extension, closed for modification. New shapes subclass <code>Shape</code>; <code>AreaCalculator</code> never changes.</dd></div><div><dt>L · Liskov substitution</dt><dd>A subtype must keep every promise of its base. A <code>Train</code> that cannot turn is not a <code>Vehicle</code> that turns.</dd></div><div><dt>I · Interface segregation</dt><dd>No client depends on members it does not use. Small role interfaces instead of one fat <code>IUnitStats</code>.</dd></div><div><dt>D · Dependency inversion</dt><dd>High-level policy and low-level details both depend on an abstraction. <code>Switch</code> talks to <code>ISwitchable</code>, not to <code>Door</code>.</dd></div>',
    ru: '<div><dt>S · Единственная ответственность</dt><dd>У класса одна причина для изменения. Книга делит игрока на компоненты ввода, движения, звука и эффектов — так же, как Unity делит GameObject.</dd></div><div><dt>O · Открытость/закрытость</dt><dd>Открыт для расширения, закрыт для изменения. Новые фигуры наследуют <code>Shape</code>; <code>AreaCalculator</code> не меняется.</dd></div><div><dt>L · Подстановка Лисков</dt><dd>Подтип обязан выполнять все обещания базового типа. <code>Train</code>, который не умеет поворачивать, — не <code>Vehicle</code>, который поворачивает.</dd></div><div><dt>I · Разделение интерфейсов</dt><dd>Клиент не зависит от членов, которые не использует. Узкие роли вместо одного толстого <code>IUnitStats</code>.</dd></div><div><dt>D · Инверсия зависимостей</dt><dd>И политика верхнего уровня, и детали зависят от абстракции. <code>Switch</code> знает <code>ISwitchable</code>, а не <code>Door</code>.</dd></div>',
  },
  'solid.labTag': { en: 'INTERACTIVE · CHANGE IMPACT', ru: 'ИНТЕРАКТИВ · ЦЕНА ИЗМЕНЕНИЯ' },
  'solid.labH': { en: 'Send a request into the design and see what breaks open', ru: 'Отправь требование в дизайн и посмотри, что придётся вскрыть' },
  'solid.tabsAria': { en: 'Principle', ru: 'Принцип' },
  'solid.designAria': { en: 'Design version', ru: 'Версия дизайна' },
  'solid.before': { en: 'Before · from the book', ru: 'До · из книги' },
  'solid.after': { en: 'After · refactored', ru: 'После · рефакторинг' },
  'solid.requests': { en: 'REQUEST', ru: 'ТРЕБОВАНИЕ' },
  'solid.rules': {
    en: {
      srp: '<b>SRP.</b> Four different people ask for four different changes. In one class they all collide in one file and one test.',
      ocp: '<b>OCP.</b> Designers want more area-of-effect shapes. Does every shape reopen the calculator?',
      lsp: '<b>LSP.</b> <code>Navigator.Move</code> drives any vehicle along a path with turns. Pass it each vehicle.',
      isp: '<b>ISP.</b> A new destructible prop needs health, and the barrel also explodes. How many empty methods does each class carry?',
      dip: '<b>DIP.</b> The same switch should open a door, arm a trap and turn on a light.',
    },
    ru: {
      srp: '<b>SRP.</b> Четыре разных человека просят четыре разных изменения. В одном классе они сталкиваются в одном файле и одном тесте.',
      ocp: '<b>OCP.</b> Дизайнеры хотят больше форм области действия. Каждая форма снова открывает калькулятор?',
      lsp: '<b>LSP.</b> <code>Navigator.Move</code> ведёт любой транспорт по пути с поворотами. Передай ему каждый вид транспорта.',
      isp: '<b>ISP.</b> Новому разрушаемому пропу нужно здоровье, а бочка ещё и взрывается. Сколько пустых методов несёт каждый класс?',
      dip: '<b>DIP.</b> Один и тот же рубильник должен открыть дверь, взвести ловушку и включить свет.',
    },
  },
  'solid.req': {
    en: {
      srp: { input: 'Switch to the new Input System', movement: 'Change movement clamping', audio: 'Randomise bounce pitch', fx: 'Add dust particles' },
      ocp: { triangle: 'Add Triangle', hexagon: 'Add Hexagon' },
      lsp: { car: 'Move(Car)', truck: 'Move(Truck)', train: 'Move(Train)' },
      isp: { barrel: 'Add ExplodingBarrel', crate: 'Add breakable Crate' },
      dip: { door: 'Switch → Door', trap: 'Switch → Trap', light: 'Switch → Light' },
    },
    ru: {
      srp: { input: 'Перейти на новый Input System', movement: 'Поменять ограничение движения', audio: 'Случайная высота звука', fx: 'Добавить частицы пыли' },
      ocp: { triangle: 'Добавить Triangle', hexagon: 'Добавить Hexagon' },
      lsp: { car: 'Move(Car)', truck: 'Move(Truck)', train: 'Move(Train)' },
      isp: { barrel: 'Добавить ExplodingBarrel', crate: 'Добавить ломаемый Crate' },
      dip: { door: 'Switch → Door', trap: 'Switch → Trap', light: 'Switch → Light' },
    },
  },
  'solid.mark.edit': { en: 'edited', ru: 'правка' },
  'solid.mark.add': { en: 'new', ru: 'новый' },
  'solid.mark.fail': { en: 'breaks', ru: 'ломается' },
  'solid.statEdits': { en: 'Edited classes', ru: 'Правок в классах' },
  'solid.statNew': { en: 'New classes', ru: 'Новых классов' },
  'solid.statStubs': { en: 'Dead stubs', ru: 'Пустых заглушек' },
  'solid.statAll': { en: n => `all requests: ${n}`, ru: n => `все запросы: ${n}` },
  'solid.pick': { en: 'Pick a request above.', ru: 'Выбери требование выше.' },
  'solid.out.srp.before': {
    en: () => 'All four requests edit <b>UnrefactoredPlayer</b>. Input, movement and audio share one file, one merge conflict and one regression surface.',
    ru: () => 'Все четыре требования правят <b>UnrefactoredPlayer</b>. Ввод, движение и звук делят один файл, один merge-конфликт и одну зону регрессий.',
  },
  'solid.out.srp.after': {
    en: (_, r) => `Only <b>${r.edit[0]}</b> changes. The other components are not even opened.`,
    ru: (_, r) => `Меняется только <b>${r.edit[0]}</b>. Остальные компоненты даже не открываются.`,
  },
  'solid.out.ocp.before': {
    en: (_, r) => `New class <b>${r.add[0]}</b> <i>and</i> a new method in <b>AreaCalculator</b> — stable, tested code is reopened.`,
    ru: (_, r) => `Новый класс <b>${r.add[0]}</b> <i>и</i> новый метод в <b>AreaCalculator</b> — стабильный проверенный код снова открыт.`,
  },
  'solid.out.ocp.after': {
    en: (_, r) => `Only <b>${r.add[0]} : Shape</b> with its own <code>CalculateArea()</code>. <code>GetArea(Shape)</code> is untouched.`,
    ru: (_, r) => `Только <b>${r.add[0]} : Shape</b> со своим <code>CalculateArea()</code>. <code>GetArea(Shape)</code> не тронут.`,
  },
  'solid.out.lsp.before': {
    en: (request, r) => r.outcome === 'runtime'
      ? 'It compiles — and throws <code>NotImplementedException</code> in <code>TurnLeft()</code> at runtime. The type system said “Vehicle”, the object could not keep the promise.'
      : `<b>${request}</b> keeps every promise of Vehicle. Works.`,
    ru: (request, r) => r.outcome === 'runtime'
      ? 'Компилируется — и падает с <code>NotImplementedException</code> в <code>TurnLeft()</code> во время игры. Тип сказал «Vehicle», объект не сдержал обещание.'
      : `<b>${request}</b> выполняет все обещания Vehicle. Работает.`,
  },
  'solid.out.lsp.after': {
    en: (request, r) => r.outcome === 'compile'
      ? 'The mistake moves to compile time: <code>Train</code> is a <code>RailVehicle</code>, it does not implement <code>ITurnable</code>, so it cannot be passed to a navigator that turns.'
      : `<b>${request}</b> is a <code>RoadVehicle</code>: <code>IMovable</code> + <code>ITurnable</code>. Works.`,
    ru: (request, r) => r.outcome === 'compile'
      ? 'Ошибка переезжает на этап компиляции: <code>Train</code> — это <code>RailVehicle</code>, он не реализует <code>ITurnable</code>, и передать его навигатору с поворотами нельзя.'
      : `<b>${request}</b> — это <code>RoadVehicle</code>: <code>IMovable</code> + <code>ITurnable</code>. Работает.`,
  },
  'solid.out.isp.before': {
    en: (request, r) => request === 'barrel'
      ? `The barrel implements all 14 members of <code>IUnitStats</code> to use 5 of them. Adding <code>Explode()</code> to the fat interface also forces a stub into <b>EnemyUnit</b>: ${r.stubs} dead members.`
      : `A crate that only breaks implements movement and stats it will never have: ${r.stubs} dead members.`,
    ru: (request, r) => request === 'barrel'
      ? `Бочка реализует все 14 членов <code>IUnitStats</code>, чтобы использовать 5. Добавив <code>Explode()</code> в толстый интерфейс, мы заставляем и <b>EnemyUnit</b> писать заглушку: ${r.stubs} мёртвых членов.`
      : `Ящик, который только ломается, реализует движение и характеристики, которых у него не будет: ${r.stubs} мёртвых членов.`,
  },
  'solid.out.isp.after': {
    en: request => request === 'barrel'
      ? '<code>ExplodingBarrel : IDamageable, IExplodable</code>. EnemyUnit does not even learn that explosions exist.'
      : '<code>Crate : IDamageable</code>. Five members, all used.',
    ru: request => request === 'barrel'
      ? '<code>ExplodingBarrel : IDamageable, IExplodable</code>. EnemyUnit даже не узнаёт, что бывают взрывы.'
      : '<code>Crate : IDamageable</code>. Пять членов, все используются.',
  },
  'solid.out.dip.before': {
    en: (request, r) => r.edit.length
      ? `<b>Switch</b> knows only <code>Door.Open/Close</code>. A ${r.add[0]} means a new field and a new branch inside Switch — the high-level class depends on every detail.`
      : 'The door works because Switch was written for the door.',
    ru: (request, r) => r.edit.length
      ? `<b>Switch</b> знает только <code>Door.Open/Close</code>. ${r.add[0]} — это новое поле и новая ветка внутри Switch: класс верхнего уровня зависит от каждой детали.`
      : 'Дверь работает, потому что Switch писали под дверь.',
  },
  'solid.out.dip.after': {
    en: (request, r) => r.add.length
      ? `<b>${r.add[0]} : ISwitchable</b>. Switch calls <code>Activate()</code>/<code>Deactivate()</code> and never changes.`
      : '<b>Door : ISwitchable</b>. Switch depends on the abstraction.',
    ru: (request, r) => r.add.length
      ? `<b>${r.add[0]} : ISwitchable</b>. Switch вызывает <code>Activate()</code>/<code>Deactivate()</code> и не меняется.`
      : '<b>Door : ISwitchable</b>. Switch зависит от абстракции.',
  },
  'solid.abstractProse': {
    en: '<h3>Interface or abstract class?</h3><p>Both give you an abstraction. An abstract class shares state and code (<i>is-a</i>) but you inherit only one. Interfaces describe abilities (<i>has-a</i>) and a class can implement many. The book’s advice: an abstract base for shared core behaviour, interfaces for peripheral abilities — an NPC derives from <code>Robot</code> and implements <code>ISwitchable</code>.</p><p><b>Unity catch:</b> a field typed as an interface is not shown in the Inspector. Serialize a <code>MonoBehaviour</code> or <code>ScriptableObject</code> reference and check <code>is IInteractable</code> at runtime. For plain C# classes use <code>[SerializeReference]</code>.</p>',
    ru: '<h3>Интерфейс или абстрактный класс?</h3><p>Оба дают абстракцию. Абстрактный класс делится состоянием и кодом (<i>is-a</i>), но наследовать можно только один. Интерфейсы описывают способности (<i>has-a</i>), и класс может реализовать много. Совет книги: абстрактная база — для общего ядра, интерфейсы — для дополнительных способностей. NPC наследует <code>Robot</code> и реализует <code>ISwitchable</code>.</p><p><b>Ловушка Unity:</b> поле с типом интерфейса не видно в Inspector. Сериализуй ссылку на <code>MonoBehaviour</code> или <code>ScriptableObject</code> и проверяй <code>is IInteractable</code> во время игры. Для обычных C#-классов есть <code>[SerializeReference]</code>.</p>',
  },
  'solid.thAbstract': { en: 'Abstract class', ru: 'Абстрактный класс' },
  'solid.thInterface': { en: 'Interface (C# 9 in Unity 6)', ru: 'Интерфейс (C# 9 в Unity 6)' },
  'solid.abstractRows': {
    en: [
      ['Inheritance', 'One base class', 'Many interfaces'],
      ['Instance fields', 'Yes', 'No'],
      ['Constructors', 'Yes', 'No'],
      ['Method bodies', 'Yes', 'Yes, default implementations since C# 8'],
      ['Static members', 'Yes', 'Yes since C# 8'],
      ['Access modifiers', 'All', 'Allowed since C# 8; public by default'],
    ],
    ru: [
      ['Наследование', 'Один базовый класс', 'Много интерфейсов'],
      ['Поля экземпляра', 'Да', 'Нет'],
      ['Конструкторы', 'Да', 'Нет'],
      ['Тела методов', 'Да', 'Да, реализации по умолчанию с C# 8'],
      ['Статические члены', 'Да', 'Да, с C# 8'],
      ['Модификаторы доступа', 'Все', 'Разрешены с C# 8; по умолчанию public'],
    ],
  },
  'solid.errata': {
    en: '<b>Checked against the book</b><p>The book’s table says interfaces cannot have static members, implementations or access modifiers. That was true before C# 8; Unity 6 compiles C# 9, so all three are allowed — the book’s own <code>IState</code> example already has method bodies. What interfaces still cannot have is instance fields and constructors. In an interview, give the modern answer and mention the old rule.</p>',
    ru: '<b>Сверено с книгой</b><p>Таблица в книге говорит, что у интерфейсов не бывает статических членов, реализаций и модификаторов доступа. Так было до C# 8; Unity 6 компилирует C# 9, и всё это разрешено — даже пример <code>IState</code> из самой книги содержит тела методов. Чего у интерфейса по-прежнему нет — полей экземпляра и конструкторов. На собеседовании дай современный ответ и упомяни старое правило.</p>',
  },
};

/**
 * Модели курса «История .NET»: лента лет и совместимость целевых платформ (TFM).
 * Без DOM — тесты проходят задания теми же действиями, что кнопки.
 */

/* =====================================================================
   Лента лет: что существовало в каждом году.
   ===================================================================== */

export const FIRST_YEAR = 2002, LAST_YEAR = 2026;

/** Выпуски по годам. Берётся последний выпуск, вышедший не позже выбранного года. */
const FRAMEWORK = [[2002, '1.0'], [2003, '1.1'], [2005, '2.0'], [2006, '3.0'], [2007, '3.5'], [2010, '4.0'], [2012, '4.5'], [2015, '4.6'], [2017, '4.7'], [2019, '4.8'], [2022, '4.8.1']];
const MODERN = [[2016, '.NET Core 1.0'], [2017, '.NET Core 2.0'], [2019, '.NET Core 3.1'], [2020, '.NET 5'], [2021, '.NET 6 (LTS)'], [2022, '.NET 7'], [2023, '.NET 8 (LTS)'], [2024, '.NET 9'], [2025, '.NET 10 (LTS)']];
const CSHARP = [[2002, '1.0'], [2005, '2.0'], [2007, '3.0'], [2010, '4.0'], [2012, '5.0'], [2015, '6.0'], [2017, '7.0'], [2019, '8.0'], [2020, '9.0'], [2021, '10'], [2022, '11'], [2023, '12'], [2024, '13'], [2025, '14']];
const STANDARD = [[2016, '1.x'], [2017, '2.0'], [2019, '2.1']];

/** События года — коротко, по одному факту на строку. */
export const EVENTS = {
  2002: ['Вышли .NET Framework 1.0, C# 1.0 и Visual Studio .NET. Работает только на Windows.'],
  2003: ['.NET Framework 1.1.'],
  2004: ['Mono 1.0 — открытая реализация .NET для Linux от компании Ximian (Мигель де Икаса).'],
  2005: ['.NET Framework 2.0 и C# 2.0: дженерики.', 'Unity 1.0 — игровой движок со скриптами на Mono.'],
  2006: ['.NET Framework 3.0: WPF, WCF и Workflow Foundation.'],
  2007: ['.NET Framework 3.5 и C# 3.0: LINQ и лямбды.'],
  2009: ['ASP.NET MVC 1.0.'],
  2010: ['.NET Framework 4.0: библиотека задач (TPL) и dynamic.'],
  2011: ['Основана компания Xamarin: C# для iOS и Android на базе Mono.'],
  2012: ['.NET Framework 4.5 и C# 5.0: async и await.'],
  2014: ['Microsoft открывает исходники: компилятор Roslyn, .NET Foundation, анонс .NET Core под лицензией MIT.'],
  2015: ['C# 6.0 и компилятор Roslyn в Visual Studio 2015.', 'Unity выпускает IL2CPP: C#-код превращается в C++.'],
  2016: ['Microsoft покупает Xamarin и делает его бесплатным.', '.NET Core 1.0 — официально на Windows, Linux и macOS.', 'Первые версии .NET Standard.'],
  2017: ['.NET Core 2.0 и .NET Standard 2.0 — огромный общий набор API.'],
  2018: ['Unity переходит на новый Mono с API .NET 4.x и поддерживает .NET Standard 2.0.'],
  2019: ['.NET Framework 4.8 — последняя большая версия Framework.', '.NET Core 3.0: WPF и WinForms (только на Windows). C# 8: nullable-ссылки.', '.NET Standard 2.1 — и последняя версия стандарта. Framework её не поддерживает.'],
  2020: ['.NET 5: «Core» убрали из названия, номер 4 пропустили. C# 9: records.'],
  2021: ['.NET 6 (LTS) и C# 10.', 'Unity 2021.2 поддерживает .NET Standard 2.1.'],
  2022: ['.NET 7 и C# 11.', '.NET MAUI сменяет Xamarin.Forms.', 'Unity объявляет переход на CoreCLR.'],
  2023: ['.NET 8 (LTS) и C# 12.', 'Avalonia 11.'],
  2024: ['.NET 9 и C# 13.', 'Revit 2025 и AutoCAD 2025 переходят с Framework 4.8 на .NET 8.', 'Microsoft передаёт проект Mono сообществу WineHQ.'],
  2025: ['.NET 10 (LTS) и C# 14.', 'Поддержку версий STS продлили с 18 месяцев до двух лет.'],
  2026: ['10 ноября заканчивается поддержка .NET 8 и .NET 9.', '.NET 11 в превью, выход ожидается в ноябре.']
};

const latest = (list, y) => list.filter(([yy]) => yy <= y).pop()?.[1] ?? null;

/** Срез экосистемы на конец года. */
export function stateAt(year) {
  const modern = latest(MODERN, year);
  return {
    year,
    framework: latest(FRAMEWORK, year),
    modern,
    csharp: latest(CSHARP, year),
    standard: latest(STANDARD, year),
    mono: year >= 2004,
    unity: year >= 2005,
    platforms: modern ? ['Windows', 'Linux', 'macOS'] : year >= 2004 ? ['Windows', 'Linux и macOS — только через Mono'] : ['Windows'],
    events: EVENTS[year] ?? []
  };
}

export const yearsRig = {
  init: card => ({ year: card.from ?? LAST_YEAR, seen: [] }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return yearsRig.init(card);
    const y = Number(v);
    if (k !== 'year' || !Number.isInteger(y) || y < FIRST_YEAR || y > LAST_YEAR) throw new Error(`неизвестное действие ${a}`);
    return { year: y, seen: s0.seen.includes(y) ? s0.seen : [...s0.seen, y] };
  },
  /** Цель — найти год (year) или посмотреть все годы из списка (visit). */
  goal(card, s) {
    const g = card.goal;
    if (g.visit) return g.visit.every(y => s.seen.includes(y));
    return s.year === g.year;
  }
};

/* =====================================================================
   Совместимость: какие сборки библиотеки загрузит каждый хост.
   ===================================================================== */

export const TFMS = {
  net48: { name: 'net48', title: '.NET Framework 4.8' },
  ns20: { name: 'netstandard2.0', title: '.NET Standard 2.0' },
  ns21: { name: 'netstandard2.1', title: '.NET Standard 2.1' },
  net8: { name: 'net8.0', title: '.NET 8' },
  net10: { name: 'net10.0', title: '.NET 10' }
};

/**
 * Хосты и порядок, в котором NuGet выбирает сборку: сначала самая «родная».
 * warn — загрузится через слой совместимости, если библиотека не трогает отсутствующие API.
 */
export const HOSTS = {
  revit24: { name: 'Revit 2024', runtime: '.NET Framework 4.8', pick: [['net48', 'ok'], ['ns20', 'ok']] },
  revit25: { name: 'Revit 2025–2026', runtime: '.NET 8', pick: [['net8', 'ok'], ['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] },
  unity: { name: 'Unity 6', runtime: 'Mono / IL2CPP, профиль .NET Standard 2.1', pick: [['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] },
  app10: { name: 'Приложение на .NET 10', runtime: '.NET 10', pick: [['net10', 'ok'], ['net8', 'ok'], ['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] }
};

/** Какую сборку загрузит хост из выбранных целей: { tfm, status } или { tfm: null, status: 'no' }. */
export function resolveHost(hostId, targets) {
  const pick = HOSTS[hostId].pick;
  const ok = pick.find(([t, st]) => st === 'ok' && targets.includes(t));
  if (ok) return { tfm: ok[0], status: 'ok' };
  const warn = pick.find(([t]) => targets.includes(t));
  return warn ? { tfm: warn[0], status: 'warn' } : { tfm: null, status: 'no' };
}

/** Строка проекта: одна цель — TargetFramework, несколько — TargetFrameworks. */
export function csprojLine(targets) {
  const names = Object.keys(TFMS).filter(t => targets.includes(t)).map(t => TFMS[t].name);
  if (!names.length) return '<!-- выбери хотя бы одну цель -->';
  return names.length === 1 ? `<TargetFramework>${names[0]}</TargetFramework>` : `<TargetFrameworks>${names.join(';')}</TargetFrameworks>`;
}

export const tfmRig = {
  init: card => ({ targets: [...(card.start ?? [])] }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return tfmRig.init(card);
    if (k !== 'tfm' || !(v in TFMS)) throw new Error(`неизвестное действие ${a}`);
    return { targets: s0.targets.includes(v) ? s0.targets.filter(t => t !== v) : [...s0.targets, v] };
  },
  /**
   * Цель: все хосты из hosts грузят сборку без оговорок, целей не больше max,
   * а prefer требует, чтобы конкретный хост получил конкретную сборку.
   */
  goal(card, s) {
    const g = card.goal;
    if (!s.targets.length || (g.max && s.targets.length > g.max)) return false;
    if (!g.hosts.every(h => resolveHost(h, s.targets).status === 'ok')) return false;
    return Object.entries(g.prefer ?? {}).every(([h, t]) => resolveHost(h, s.targets).tfm === t);
  }
};

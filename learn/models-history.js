/**
 * Модели курса «История .NET»: лента лет и совместимость целевых платформ (TFM).
 * Без DOM — тесты проходят задания теми же действиями, что кнопки.
 */
import { tr } from './i18n.js?v=202610101341';

/* =====================================================================
   Лента лет: что существовало в каждом году.
   ===================================================================== */

export const FIRST_YEAR = 2002, LAST_YEAR = 2026;

/** Выпуски по годам. Берётся последний выпуск, вышедший не позже выбранного года. */
const FRAMEWORK = [[2002, '1.0'], [2003, '1.1'], [2005, '2.0'], [2006, '3.0'], [2007, '3.5'], [2010, '4.0'], [2012, '4.5'], [2015, '4.6'], [2017, '4.7'], [2019, '4.8'], [2022, '4.8.1']];
const MODERN = [[2016, '.NET Core 1.0'], [2017, '.NET Core 2.0'], [2019, '.NET Core 3.1'], [2020, '.NET 5'], [2021, '.NET 6 (LTS)'], [2022, '.NET 7'], [2023, '.NET 8 (LTS)'], [2024, '.NET 9'], [2025, '.NET 10 (LTS)']];
const CSHARP = [[2002, '1.0'], [2005, '2.0'], [2007, '3.0'], [2010, '4.0'], [2012, '5.0'], [2015, '6.0'], [2017, '7.0'], [2019, '8.0'], [2020, '9.0'], [2021, '10'], [2022, '11'], [2023, '12'], [2024, '13'], [2025, '14']];
const STANDARD = [[2016, '1.x'], [2017, '2.0'], [2019, '2.1']];

/** События года — коротко, по одному факту на строку. Переводятся в stateAt. */
export const EVENTS = {
  2002: [{ ru: 'Вышли .NET Framework 1.0, C# 1.0 и Visual Studio .NET. Работает только на Windows.', en: '.NET Framework 1.0, C# 1.0 and Visual Studio .NET are released. Windows only.' }],
  2003: [{ ru: '.NET Framework 1.1.', en: '.NET Framework 1.1.' }],
  2004: [{ ru: 'Mono 1.0 — открытая реализация .NET для Linux от компании Ximian (Мигель де Икаса).', en: 'Mono 1.0: an open-source .NET implementation for Linux from Ximian (Miguel de Icaza).' }],
  2005: [{ ru: '.NET Framework 2.0 и C# 2.0: дженерики.', en: '.NET Framework 2.0 and C# 2.0: generics.' }, { ru: 'Unity 1.0 — игровой движок со скриптами на Mono.', en: 'Unity 1.0: a game engine with scripting on Mono.' }],
  2006: [{ ru: '.NET Framework 3.0: WPF, WCF и Workflow Foundation.', en: '.NET Framework 3.0: WPF, WCF and Workflow Foundation.' }],
  2007: [{ ru: '.NET Framework 3.5 и C# 3.0: LINQ и лямбды.', en: '.NET Framework 3.5 and C# 3.0: LINQ and lambdas.' }],
  2009: [{ ru: 'ASP.NET MVC 1.0.', en: 'ASP.NET MVC 1.0.' }],
  2010: [{ ru: '.NET Framework 4.0: библиотека задач (TPL) и dynamic.', en: '.NET Framework 4.0: the Task Parallel Library (TPL) and dynamic.' }],
  2011: [{ ru: 'Основана компания Xamarin: C# для iOS и Android на базе Mono.', en: 'Xamarin is founded: C# for iOS and Android, built on Mono.' }],
  2012: [{ ru: '.NET Framework 4.5 и C# 5.0: async и await.', en: '.NET Framework 4.5 and C# 5.0: async and await.' }],
  2014: [{ ru: 'Microsoft открывает исходники: компилятор Roslyn, .NET Foundation, анонс .NET Core под лицензией MIT.', en: 'Microsoft goes open source: the Roslyn compiler, the .NET Foundation, and .NET Core announced under the MIT license.' }],
  2015: [{ ru: 'C# 6.0 и компилятор Roslyn в Visual Studio 2015.', en: 'C# 6.0 and the Roslyn compiler in Visual Studio 2015.' }, { ru: 'Unity выпускает IL2CPP: C#-код превращается в C++.', en: 'Unity ships IL2CPP: C# code is turned into C++.' }],
  2016: [{ ru: 'Microsoft покупает Xamarin и делает его бесплатным.', en: 'Microsoft buys Xamarin and makes it free.' }, { ru: '.NET Core 1.0 — официально на Windows, Linux и macOS.', en: '.NET Core 1.0: officially on Windows, Linux and macOS.' }, { ru: 'Первые версии .NET Standard.', en: 'The first versions of .NET Standard.' }],
  2017: [{ ru: '.NET Core 2.0 и .NET Standard 2.0 — огромный общий набор API.', en: '.NET Core 2.0 and .NET Standard 2.0: a huge shared set of APIs.' }],
  2018: [{ ru: 'Unity переходит на новый Mono с API .NET 4.x и поддерживает .NET Standard 2.0.', en: 'Unity moves to a new Mono with the .NET 4.x API and supports .NET Standard 2.0.' }],
  2019: [{ ru: '.NET Framework 4.8 — последняя большая версия Framework.', en: '.NET Framework 4.8: the last major version of Framework.' }, { ru: '.NET Core 3.0: WPF и WinForms (только на Windows). C# 8: nullable-ссылки.', en: '.NET Core 3.0: WPF and WinForms (Windows only). C# 8: nullable reference types.' }, { ru: '.NET Standard 2.1 — и последняя версия стандарта. Framework её не поддерживает.', en: '.NET Standard 2.1, the last version of the standard. Framework does not support it.' }],
  2020: [{ ru: '.NET 5: «Core» убрали из названия, номер 4 пропустили. C# 9: records.', en: '.NET 5: "Core" is dropped from the name and version 4 is skipped. C# 9: records.' }],
  2021: [{ ru: '.NET 6 (LTS) и C# 10.', en: '.NET 6 (LTS) and C# 10.' }, { ru: 'Unity 2021.2 поддерживает .NET Standard 2.1.', en: 'Unity 2021.2 supports .NET Standard 2.1.' }],
  2022: [{ ru: '.NET 7 и C# 11.', en: '.NET 7 and C# 11.' }, { ru: '.NET MAUI сменяет Xamarin.Forms.', en: '.NET MAUI replaces Xamarin.Forms.' }, { ru: 'Unity объявляет переход на CoreCLR.', en: 'Unity announces its move to CoreCLR.' }],
  2023: [{ ru: '.NET 8 (LTS) и C# 12.', en: '.NET 8 (LTS) and C# 12.' }, { ru: 'Avalonia 11.', en: 'Avalonia 11.' }],
  2024: [{ ru: '.NET 9 и C# 13.', en: '.NET 9 and C# 13.' }, { ru: 'Revit 2025 и AutoCAD 2025 переходят с Framework 4.8 на .NET 8.', en: 'Revit 2025 and AutoCAD 2025 move from Framework 4.8 to .NET 8.' }, { ru: 'Microsoft передаёт проект Mono сообществу WineHQ.', en: 'Microsoft hands the Mono project over to the WineHQ community.' }],
  2025: [{ ru: '.NET 10 (LTS) и C# 14.', en: '.NET 10 (LTS) and C# 14.' }, { ru: 'Поддержку версий STS продлили с 18 месяцев до двух лет.', en: 'Support for STS releases is extended from 18 months to two years.' }],
  2026: [{ ru: '10 ноября заканчивается поддержка .NET 8 и .NET 9.', en: 'Support for .NET 8 and .NET 9 ends on November 10.' }, { ru: '.NET 11 в превью, выход ожидается в ноябре.', en: '.NET 11 is in preview, with release expected in November.' }]
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
    platforms: modern ? ['Windows', 'Linux', 'macOS'] : year >= 2004 ? ['Windows', tr({ ru: 'Linux и macOS — только через Mono', en: 'Linux and macOS: only via Mono' })] : ['Windows'],
    events: (EVENTS[year] ?? []).map(e => tr(e))
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
 * name и runtime — строка или { ru, en }, читать через tr().
 */
export const HOSTS = {
  revit24: { name: 'Revit 2024', runtime: '.NET Framework 4.8', pick: [['net48', 'ok'], ['ns20', 'ok']] },
  revit25: { name: 'Revit 2025–2026', runtime: '.NET 8', pick: [['net8', 'ok'], ['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] },
  unity: { name: 'Unity 6', runtime: { ru: 'Mono / IL2CPP, профиль .NET Standard 2.1', en: 'Mono / IL2CPP, .NET Standard 2.1 profile' }, pick: [['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] },
  app10: { name: { ru: 'Приложение на .NET 10', en: '.NET 10 app' }, runtime: '.NET 10', pick: [['net10', 'ok'], ['net8', 'ok'], ['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] }
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
  if (!names.length) return tr({ ru: '<!-- выбери хотя бы одну цель -->', en: '<!-- pick at least one target -->' });
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

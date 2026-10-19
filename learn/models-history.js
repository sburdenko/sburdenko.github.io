/**
 * Модели курса «История .NET»: лента лет и совместимость целевых платформ (TFM).
 * Без DOM — тесты проходят задания теми же действиями, что кнопки.
 */
import { tr } from './i18n.js?v=202610191254';
import { t as tl, bi } from './ui.js?v=202610191254';

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
  2002: [bi('m.history.EVENTS.1')],
  2003: [bi('m.history.EVENTS.2')],
  2004: [bi('m.history.EVENTS.3')],
  2005: [bi('m.history.EVENTS.4'), bi('m.history.EVENTS.5')],
  2006: [bi('m.history.EVENTS.6')],
  2007: [bi('m.history.EVENTS.7')],
  2009: [bi('m.history.EVENTS.8')],
  2010: [bi('m.history.EVENTS.9')],
  2011: [bi('m.history.EVENTS.10')],
  2012: [bi('m.history.EVENTS.11')],
  2014: [bi('m.history.EVENTS.12')],
  2015: [bi('m.history.EVENTS.13'), bi('m.history.EVENTS.14')],
  2016: [bi('m.history.EVENTS.15'), bi('m.history.EVENTS.16'), bi('m.history.EVENTS.17')],
  2017: [bi('m.history.EVENTS.18')],
  2018: [bi('m.history.EVENTS.19')],
  2019: [bi('m.history.EVENTS.20'), bi('m.history.EVENTS.21'), bi('m.history.EVENTS.22')],
  2020: [bi('m.history.EVENTS.23')],
  2021: [bi('m.history.EVENTS.24'), bi('m.history.EVENTS.25')],
  2022: [bi('m.history.EVENTS.26'), bi('m.history.EVENTS.27'), bi('m.history.EVENTS.28')],
  2023: [bi('m.history.EVENTS.29'), bi('m.history.EVENTS.30')],
  2024: [bi('m.history.EVENTS.31'), bi('m.history.EVENTS.32'), bi('m.history.EVENTS.33')],
  2025: [bi('m.history.EVENTS.34'), bi('m.history.EVENTS.35')],
  2026: [bi('m.history.EVENTS.36'), bi('m.history.EVENTS.37')]
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
    platforms: modern ? ['Windows', 'Linux', 'macOS'] : year >= 2004 ? ['Windows', tl('m.history.stateAt.1')] : ['Windows'],
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
  unity: { name: 'Unity 6', runtime: bi('m.history.HOSTS.1'), pick: [['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] },
  app10: { name: bi('m.history.HOSTS.2'), runtime: '.NET 10', pick: [['net10', 'ok'], ['net8', 'ok'], ['ns21', 'ok'], ['ns20', 'ok'], ['net48', 'warn']] }
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
  if (!names.length) return tl('m.history.csprojLine.1');
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

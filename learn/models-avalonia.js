/**
 * Модели курса «Avalonia: основы»: Grid, панели, привязки и селекторы стилей.
 * Без DOM — тесты проходят задания теми же действиями, что кнопки.
 */
import { tr } from './i18n.js?v=202610261308';
import { t as tl, bi } from './ui.js?v=202610261308';

/* =====================================================================
   Grid: ширины колонок из ColumnDefinitions="Auto,200,*,2*".
   ===================================================================== */

export const COL_DEFS = ['Auto', '100', '200', '*', '2*'];
export const WIDTHS = [400, 800];

/** Ширины колонок: числа — как есть, Auto — по содержимому, звёзды делят остаток пропорционально. */
export function gridWidths(defs, total, content) {
  const fixed = defs.map((d, i) => d === 'Auto' ? content[i] : /^\d+$/.test(d) ? Number(d) : null);
  const rest = Math.max(0, total - fixed.reduce((a, w) => a + (w ?? 0), 0));
  const stars = defs.map(d => d.endsWith('*') ? Number(d.slice(0, -1) || 1) : 0);
  const sum = stars.reduce((a, b) => a + b, 0);
  return defs.map((d, i) => fixed[i] ?? (sum ? rest * stars[i] / sum : 0));
}

export const gridRig = {
  init: card => ({ defs: [...card.start], w: card.width ?? 800 }),
  act(card, s0, a) {
    const [k, v, d] = a.split(':');
    if (k === 'reset') return gridRig.init(card);
    if (k === 'w' && WIDTHS.includes(Number(v))) return { ...s0, w: Number(v) };
    const i = Number(v);
    if (k === 'col' && Number.isInteger(i) && i >= 0 && i < s0.defs.length && COL_DEFS.includes(d)) {
      const defs = [...s0.defs]; defs[i] = d;
      return { ...s0, defs };
    }
    throw new Error(`неизвестное действие ${a}`);
  },
  /** Цель — ширины колонок при каждой ширине окна из goal.at (с точностью до пикселя). */
  goal(card, s) {
    return Object.entries(card.goal.at).every(([W, want]) =>
      gridWidths(s.defs, Number(W), card.content).every((w, i) => want[i] == null || Math.abs(w - want[i]) <= 1));
  }
};

/* =====================================================================
   Панели: как StackPanel, WrapPanel и DockPanel раскладывают одних и тех же детей.
   ===================================================================== */

export const PANELS = {
  'stack-v': bi('m.avalonia.PANELS.1'),
  'stack-h': 'StackPanel Orientation="Horizontal"',
  wrap: 'WrapPanel',
  dock: 'DockPanel'
};

/** Дети окна: размеры «по содержимому» и сторона для DockPanel. Последний заполняет остаток. */
export const KIDS = [
  { name: bi('m.avalonia.KIDS.1'), w: 120, h: 36, dock: 'Top' },
  { name: bi('m.avalonia.KIDS.2'), w: 90, h: 80, dock: 'Left' },
  { name: bi('m.avalonia.KIDS.3'), w: 110, h: 26, dock: 'Bottom' },
  { name: bi('m.avalonia.KIDS.4'), w: 140, h: 70, dock: null }
];

/** Прямоугольники детей в окне W×H. */
export function arrange(panel, W, H) {
  if (panel === 'stack-v') {
    let y = 0;
    return KIDS.map(k => { const r = { x: 0, y, w: W, h: k.h }; y += k.h; return r; });
  }
  if (panel === 'stack-h') {
    let x = 0;
    return KIDS.map(k => { const r = { x, y: 0, w: k.w, h: H }; x += k.w; return r; });
  }
  if (panel === 'wrap') {
    let x = 0, y = 0, line = 0;
    return KIDS.map(k => {
      if (x > 0 && x + k.w > W) { x = 0; y += line; line = 0; }
      const r = { x, y, w: k.w, h: k.h };
      x += k.w; line = Math.max(line, k.h);
      return r;
    });
  }
  if (panel === 'dock') {
    let l = 0, t = 0, r = W, b = H;
    return KIDS.map((k, i) => {
      if (i === KIDS.length - 1) return { x: l, y: t, w: r - l, h: b - t };
      if (k.dock === 'Top') { const o = { x: l, y: t, w: r - l, h: k.h }; t += k.h; return o; }
      if (k.dock === 'Bottom') { b -= k.h; return { x: l, y: b, w: r - l, h: k.h }; }
      if (k.dock === 'Left') { const o = { x: l, y: t, w: k.w, h: b - t }; l += k.w; return o; }
      r -= k.w; return { x: r, y: t, w: k.w, h: b - t };
    });
  }
  throw new Error(`неизвестная панель ${panel}`);
}

export const panelRig = {
  init: card => ({ panel: card.start ?? 'stack-v', w: 320 }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return panelRig.init(card);
    if (k === 'panel' && v in PANELS) return { ...s0, panel: v };
    if (k === 'w' && ['220', '320'].includes(v)) return { ...s0, w: Number(v) };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal: (card, s) => s.panel === card.goal.panel && (card.goal.w == null || s.w === card.goal.w)
};

/* =====================================================================
   Привязки: TextBox и TextBlock привязаны к свойству Name модели представления.
   ===================================================================== */

export const MODES = ['OneWay', 'TwoWay', 'OneTime', 'OneWayToSource'];
const TYPED = [bi('m.avalonia.TYPED.1'), bi('m.avalonia.TYPED.2'), bi('m.avalonia.TYPED.3'), bi('m.avalonia.TYPED.4')];

/**
 * vm — значение в модели; box — что в TextBox (привязка с режимом mode);
 * label — TextBlock, привязанный OneWay. Без notify модель не сообщает об изменениях.
 */
export const bindRig = {
  init(card) {
    const o = { mode: 'TwoWay', notify: false, ...(card.start ?? {}) };
    const init = tl('m.avalonia.bindRig.1');
    return { ...o, vm: init, box: o.mode === 'OneWayToSource' ? '' : init, label: init, typed: 0, coded: 0, ok: [], log: [] };
  },
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return bindRig.init(card);
    if (k === 'mode' && MODES.includes(v)) return { ...bindRig.init({ start: { mode: v, notify: s0.notify } }) };
    if (k === 'notify') return { ...bindRig.init({ start: { mode: s0.mode, notify: !s0.notify } }) };
    const s = { ...s0, ok: [...s0.ok], log: [...s0.log] };
    if (k === 'type') {
      // пользователь ввёл имя в TextBox
      s.box = tr(TYPED[s.typed++ % TYPED.length]);
      const toSource = s.mode === 'TwoWay' || s.mode === 'OneWayToSource';
      if (toSource) {
        s.vm = s.box;
        if (s.notify) s.label = s.vm;
      }
      s.log.push(tr(toSource ? (s.notify ? bi('m.avalonia.bindRig.2')
        : bi('m.avalonia.bindRig.3'))
        : bi('m.avalonia.bindRig.4', { mode: s.mode })));
    } else if (k === 'code') {
      // код меняет свойство модели
      ++s.coded;
      s.vm = tl('m.avalonia.bindRig.5', { coded: s.coded });
      if (s.notify) {
        s.label = s.vm;
        if (s.mode === 'OneWay' || s.mode === 'TwoWay') s.box = s.vm;
      }
      s.log.push(tr(!s.notify ? bi('m.avalonia.bindRig.6')
        : s.mode === 'OneWay' || s.mode === 'TwoWay' ? bi('m.avalonia.bindRig.7')
        : bi('m.avalonia.bindRig.8', { mode: s.mode })));
    } else throw new Error(`неизвестное действие ${a}`);
    if (s.vm === s.box && s.vm === s.label && !s.ok.includes(k)) s.ok.push(k);
    return s;
  },
  /** Цель — после каждого события из goal.sync модель, TextBox и TextBlock показали одно и то же. */
  goal: (card, s) => card.goal.sync.every(k => s.ok.includes(k))
};

/* =====================================================================
   Селекторы стилей: какие элементы дерева выберет Selector="…".
   ===================================================================== */

/** Дерево окна. depth — вложенность, parent — индекс родителя. */
export const TREE = [
  { type: 'Window', parent: -1 },
  { type: 'StackPanel', classes: ['toolbar'], parent: 0 },
  { type: 'Button', name: 'Save', classes: ['primary'], parent: 1 },
  { type: 'Button', name: 'Cancel', classes: [], parent: 1 },
  { type: 'Border', parent: 1 },
  { type: 'Button', name: 'Help', classes: [], parent: 4 },
  { type: 'TextBlock', classes: ['h1'], parent: 0 },
  { type: 'TextBlock', classes: [], parent: 0 },
  { type: 'Button', name: 'Delete', classes: ['primary', 'danger'], parent: 0 }
].map((n, i, all) => ({ ...n, classes: n.classes ?? [], id: i }));

/** Один шаг селектора: Type#name.class.class (псевдоклассы в этой модели не нужны). */
function parseStep(str) {
  const m = /^([A-Za-z]*)(?:#(\w+))?((?:\.[\w-]+)*)$/.exec(str);
  if (!m) throw new Error(`не понимаю селектор «${str}»`);
  return { type: m[1] || null, name: m[2] || null, classes: m[3] ? m[3].slice(1).split('.') : [] };
}
const stepOk = (st, n) => (!st.type || st.type === n.type) && (!st.name || st.name === n.name) && st.classes.every(c => n.classes.includes(c));

/** Элементы, которые выберет селектор: пробел — потомок на любой глубине, «>» — прямой ребёнок. */
export function select(selector) {
  const tokens = selector.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/);
  const steps = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '>') continue;
    steps.push({ ...parseStep(tokens[i]), child: tokens[i - 1] === '>' });
  }
  const matches = (n, k) => {
    if (!stepOk(steps[k], n)) return false;
    if (k === 0) return true;
    if (steps[k].child) return n.parent >= 0 && matches(TREE[n.parent], k - 1);
    for (let p = n.parent; p >= 0; p = TREE[p].parent) if (matches(TREE[p], k - 1)) return true;
    return false;
  };
  return TREE.filter(n => matches(n, steps.length - 1)).map(n => n.id);
}

export const selRig = {
  init: _card => ({ sel: null }),
  act(card, s0, a) {
    const i = a.indexOf(':'), k = i < 0 ? a : a.slice(0, i), v = a.slice(i + 1);
    if (k === 'reset') return selRig.init(card);
    if (k === 'sel' && card.options.includes(v)) return { sel: v };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    if (!s.sel) return false;
    const got = select(s.sel), want = card.goal.ids;
    return got.length === want.length && want.every(id => got.includes(id));
  }
};

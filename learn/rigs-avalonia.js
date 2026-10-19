/** Стенды курса «Avalonia: основы»: Grid, панели, привязки, селекторы стилей. */
import { esc } from '../assets/vhs.js?v=202610191241';
import { drive, act } from './rig-kit.js?v=202610191241';
import { codeHtml } from './code-view.js?v=202610191241';
import { tr } from './i18n.js?v=202610191241';
import { COL_DEFS, WIDTHS, gridWidths, gridRig, PANELS, KIDS, arrange, panelRig, MODES, bindRig, TREE, select, selRig } from './models-avalonia.js?v=202610191241';
import { t as tl } from './ui.js?v=202610191241';

const seg = (items, cur, prefix) => `<div class="seg wrap literal">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(tr(label)), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;
const COLORS = ['var(--gpu)', 'var(--cpu)', '#b28dff', 'var(--osd)'];
const px = v => `${Math.round(v)}`;

/* ---------- Grid ---------- */

function grid(card, host, done) {
  drive(card, host, gridRig, s => {
    const ws = gridWidths(s.defs, s.w, card.content);
    const cols = s.defs.map((d, i) => `<div class="av-col" style="flex:0 0 ${ws[i] / s.w * 100}%;--c:${COLORS[i]}" title="${esc(card.labels[i])}: ${esc(d)} → ${px(ws[i])} px"><b>${esc(card.labels[i])}</b><span>${esc(d)} → ${px(ws[i])} px</span></div>`).join('');
    const ctl = s.defs.map((d, i) => `<div class="ctl-group"><span class="ctl-label">${tl('r.avalonia.grid.1')} ${i + 1}: ${esc(card.labels[i])}</span>${seg(COL_DEFS.map(x => [`${i}:${x}`, x]), `${i}:${d}`, 'col')}</div>`).join('');
    return `<pre class="code small wrapln">${codeHtml(`<Grid ColumnDefinitions="${s.defs.join(',')}">`, 'xml')}</pre>
      <div class="av-win" style="width:${s.w / 8}%"><div class="av-title">${tl('r.avalonia.grid.2')} ${s.w} px</div><div class="av-cols">${cols}</div></div>
      <div class="ctl-group"><span class="ctl-label">${tl('r.avalonia.grid.3')}</span>${seg(WIDTHS.map(w => [w, `${w} px`]), s.w, 'w')}</div>
      ${ctl}`;
  }, done);
}

/* ---------- панели ---------- */

function panelSvg(panel, W, H, cls = '') {
  const rs = arrange(panel, W, H);
  return `<svg class="av-panel ${cls}" viewBox="0 0 ${W} ${H}" style="max-width:${W}px" role="img" aria-label="${esc(tr(PANELS[panel]))}">
    <rect x="0" y="0" width="${W}" height="${H}" class="frame"/>
    ${rs.map((r, i) => `<g><rect x="${r.x + 1}" y="${r.y + 1}" width="${Math.max(0, r.w - 2)}" height="${Math.max(0, Math.min(r.h, H - r.y) - 2)}" rx="4" style="--c:${COLORS[i]}"/><text x="${r.x + 6}" y="${r.y + 16}">${esc(tr(KIDS[i].name))}</text></g>`).join('')}
  </svg>`;
}

function panelCode(panel) {
  const open = { 'stack-v': '<StackPanel>', 'stack-h': '<StackPanel Orientation="Horizontal">', wrap: '<WrapPanel>', dock: '<DockPanel>' }[panel];
  const close = { 'stack-v': '</StackPanel>', 'stack-h': '</StackPanel>', wrap: '</WrapPanel>', dock: '</DockPanel>' }[panel];
  const kids = KIDS.map(k => `  <Border${panel === 'dock' && k.dock ? ` DockPanel.Dock="${k.dock}"` : ''}> ${tr(k.name)} </Border>`);
  return [open, ...kids, close].join('\n');
}

function panels(card, host, done) {
  drive(card, host, panelRig, s => `<div class="av-target"><div class="colh">${tl('r.avalonia.panels.1')}</div>${panelSvg(card.goal.panel, card.goal.w ?? 320, 200, 'mini')}</div>
      <div class="colh">${tl('r.avalonia.panels.2')}</div>
      ${panelSvg(s.panel, s.w, 200)}
      <pre class="code small">${codeHtml(panelCode(s.panel), 'xml')}</pre>
      <div class="ctl-group"><span class="ctl-label">${tl('r.avalonia.panels.3')}</span>${seg(Object.entries(PANELS), s.panel, 'panel')}</div>
      <div class="ctl-group"><span class="ctl-label">${tl('r.avalonia.panels.4')}</span>${seg([[320, '320 px'], [220, '220 px']], s.w, 'w')}</div>`, done);
}

/* ---------- привязки ---------- */

function bindCode(s) {
  const world = tl('r.avalonia.bindCode.1');
  const vm = s.notify
    ? `private string _name = "${world}";\npublic string Name\n{\n    get => _name;\n    set { _name = value; OnPropertyChanged(); }   // ${tl('r.avalonia.bindCode.2')}\n}`
    : `public string Name { get; set; } = "${world}";   // ${tl('r.avalonia.bindCode.3')}`;
  return { vm, xaml: `<TextBox Text="{Binding Name, Mode=${s.mode}}"/>\n<TextBlock Text="{Binding Name, StringFormat='${tl('r.avalonia.bindCode.4')}'}"/>` };
}

function bind(card, host, done) {
  const lock = new Set(card.lock ?? []);
  drive(card, host, bindRig, s => {
    const c = bindCode(s);
    const same = s.vm === s.box && s.vm === s.label;
    return `<pre class="code small">${codeHtml(c.vm)}</pre>
      <pre class="code small wrapln">${codeHtml(c.xaml, 'xml')}</pre>
      <div class="av-bind">
        <div class="av-app"><div class="av-title">${tl('r.avalonia.bind.1')}</div><div class="av-box">${esc(s.box) || '&nbsp;'}</div><div class="av-label">${esc(tl('r.avalonia.bind.2', { label: s.label }))}</div></div>
        <div class="av-vm${same ? ' ok' : ''}"><div class="av-title">${tl('r.avalonia.bind.3')}</div><code>Name = "${esc(s.vm)}"</code></div>
      </div>
      ${s.log.length ? `<div class="vm-note${same ? ' ret' : ' err'}">${esc(s.log[s.log.length - 1])}</div>` : ''}
      <div class="btns">${act('type', tl('r.avalonia.bind.4'), 'btn primary')}${act('code', tl('r.avalonia.bind.5'), 'btn')}${act('reset', tl('r.avalonia.bind.6'))}</div>
      ${lock.has('mode') ? '' : `<div class="ctl-group"><span class="ctl-label">${tl('r.avalonia.bind.7')}</span>${seg(MODES.map(m => [m, m]), s.mode, 'mode')}</div>`}
      ${lock.has('notify') ? '' : `<div class="btns">${act('notify', s.notify ? '✓ INotifyPropertyChanged' : tl('r.avalonia.bind.8'), 'btn sm')}</div>`}`;
  }, done);
}

/* ---------- селекторы ---------- */

const label = n => `${n.type}${n.name ? `#${n.name}` : ''}${n.classes.map(c => `.${c}`).join('')}`;
const depth = n => n.parent < 0 ? 0 : 1 + depth(TREE[n.parent]);

function selectors(card, host, done) {
  drive(card, host, selRig, s => {
    const got = s.sel ? select(s.sel) : [];
    const want = new Set(card.goal.ids);
    const rows = TREE.map(n => `<div class="av-node${got.includes(n.id) ? ' hit' : ''}${card.showWant && want.has(n.id) ? ' want' : ''}" style="--d:${depth(n)}">${esc(label(n))}</div>`).join('');
    return `<div class="av-tree"><div class="colh">${tl('r.avalonia.selectors.1')}</div>${rows}</div>
      <pre class="code small wrapln">${codeHtml(`<Style Selector="${s.sel ?? '?'}">\n  <Setter Property="Foreground" Value="Gold"/>\n</Style>`, 'xml')}</pre>
      ${s.sel ? `<div class="vm-note">${tl('r.avalonia.selectors.2', { length: got.length })}</div>` : ''}
      <div class="ctl-group"><span class="ctl-label">Selector</span>${seg(card.options.map(o => [o, o]), s.sel, 'sel')}</div>`;
  }, done);
}

export const RIGS_AVALONIA = { grid, panels, bind, selectors };

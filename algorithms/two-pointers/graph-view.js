/** Draw the actual next links, with the repeated part laid out as a loop. */
export function renderGraph(host, next, state, previous, kind) {
  const order = [], seen = new Set();
  let node = 0;
  while (node !== -1 && !seen.has(node)) {
    seen.add(node);
    order.push(node);
    node = next[node];
  }
  const entry = node, split = entry === -1 ? order.length : order.indexOf(entry);
  const cycle = order.slice(split), prefix = order.slice(0, split);
  const positions = new Map();
  const radiusX = 155, radiusY = 126, centerX = Math.max(270, prefix.length * 104 + 205), centerY = 205;
  if (cycle.length > 1) {
    cycle.forEach((id, i) => {
      const angle = Math.PI + i * Math.PI * 2 / cycle.length;
      positions.set(id, { x: centerX + radiusX * Math.cos(angle), y: centerY + radiusY * Math.sin(angle) });
    });
    prefix.forEach((id, i) => positions.set(id, { x: 55 + i * 104, y: centerY }));
  } else {
    order.forEach((id, i) => positions.set(id, { x: 55 + i * 104, y: centerY }));
  }
  const width = cycle.length > 1 ? centerX + radiusX + 85 : Math.max(520, order.length * 104 + 110);
  const last = order.at(-1), duplicate = kind === 'duplicate';
  const paths = new Map();
  for (const from of order) {
    const to = next[from], a = positions.get(from);
    const b = to === -1 ? { x: a.x + 100, y: a.y } : positions.get(to);
    let d;
    if (from === to) d = `M ${a.x + 24} ${a.y - 16} C ${a.x + 115} ${a.y - 135}, ${a.x - 115} ${a.y - 135}, ${a.x - 24} ${a.y - 16}`;
    else if (cycle.length > 1 && cycle.includes(from)) {
      const i = cycle.indexOf(from);
      const start = Math.PI + i * Math.PI * 2 / cycle.length + 0.25;
      const end = Math.PI + (i + 1) * Math.PI * 2 / cycle.length - 0.29;
      d = `M ${centerX + radiusX * Math.cos(start)} ${centerY + radiusY * Math.sin(start)} A ${radiusX} ${radiusY} 0 0 1 ${centerX + radiusX * Math.cos(end)} ${centerY + radiusY * Math.sin(end)}`;
    } else {
      const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
      const sx = a.x + dx / length * 31, sy = a.y + dy / length * 31;
      const ex = b.x - dx / length * 37, ey = b.y - dy / length * 37;
      d = `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    paths.set(from, d);
  }
  const slowPath = [], fastPath = [];
  if (previous && (state.line === 2 || state.line === 7)) {
    slowPath.push(previous.slow);
    fastPath.push(previous.fast);
    if (state.line === 2) fastPath.push(next[previous.fast]);
  }
  const arrow = (id, color) => `<marker id="${kind}-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`;
  let svg = `<svg viewBox="0 0 ${width} 440" role="img" aria-label="${duplicate ? 'Array indices connected by nums[index]' : 'Linked list'}: ${order.join(' to ')} to ${entry === -1 ? 'null' : `node ${entry}, forming a cycle`}"><defs>${arrow('link', '#a59abb')}${arrow('loop', '#ffd23f')}${arrow('slow', '#ff3ea5')}${arrow('fast', '#26e3ea')}</defs>`;
  svg += `<text x="24" y="28" class="graph-caption">${duplicate ? 'FROM INDEX 0 · FOLLOW nums[index]' : 'FOLLOW THE ARROWS · EACH ARROW IS A next LINK'}</text>`;
  if (cycle.length > 1) svg += `<ellipse cx="${centerX}" cy="${centerY}" rx="${radiusX + 44}" ry="${radiusY + 37}" class="cycle-region"/><text x="${centerX}" y="${centerY - 6}" class="cycle-caption">CYCLE</text><text x="${centerX}" y="${centerY + 18}" class="cycle-count">${cycle.length} nodes · repeats forever</text>`;
  for (const from of order) svg += `<path d="${paths.get(from)}" class="graph-edge${from === last && entry !== -1 ? ' back-edge' : ''}" marker-end="url(#${kind}-${from === last && entry !== -1 ? 'loop' : 'link'})"/>`;
  for (const [route, color] of [[slowPath, 'slow'], [fastPath, 'fast']]) {
    for (const from of route) svg += `<path d="${paths.get(from)}" class="travel-path ${color}" marker-end="url(#${kind}-${color})"/>`;
  }
  for (const id of order) {
    const p = positions.get(id), s = id === state.slow, f = id === state.fast;
    svg += `<g class="graph-node${s ? ' has-slow' : ''}${f ? ' has-fast' : ''}"><circle cx="${p.x}" cy="${p.y}" r="29"/><text x="${p.x}" y="${p.y + 7}" class="node-number">${id}</text>`;
    if (s) svg += `<g class="pointer-badge slow"><rect x="${p.x - 43}" y="${p.y - 57}" width="40" height="23" rx="5"/><text x="${p.x - 23}" y="${p.y - 41}">S</text></g>`;
    if (f) svg += `<g class="pointer-badge fast"><rect x="${p.x + 3}" y="${p.y - 57}" width="40" height="23" rx="5"/><text x="${p.x + 23}" y="${p.y - 41}">F</text></g>`;
    const label = id === 0 ? 'HEAD' : id === entry ? 'ENTRANCE' : id === last && !duplicate ? 'TAIL' : '';
    if (label) svg += `<text x="${p.x}" y="${p.y + 48}" class="node-label${id === entry ? ' entry-label' : ''}">${label}${id === 0 && entry === 0 ? ' / ENTRANCE' : ''}${id === last && id === entry && !duplicate ? ' / TAIL' : ''}</text>`;
    svg += '</g>';
  }
  if (entry === -1) {
    const p = positions.get(last);
    svg += `<text x="${p.x + 105}" y="${p.y + 6}" class="null-label">null</text>`;
    if (state.fast === -1) svg += `<text x="${p.x + 105}" y="${p.y - 35}" class="null-label fast-text">F</text>`;
  }
  const closing = entry === -1 ? `TAIL.next = null · this chain ends` : `${duplicate ? `nums[${last}]` : 'TAIL.next'} = ${entry} · ${last} points BACK to ${entry}`;
  svg += `<text x="24" y="409" class="closing-label">${closing}</text></svg>`;
  host.innerHTML = svg;
  const routeText = (start, hops) => {
    const nodes = [start];
    for (let i = 0; i < hops; i++) nodes.push(next[nodes.at(-1)]);
    return nodes.map(n => n === -1 ? 'null' : n).join(' → ');
  };
  return slowPath.length
    ? `<span class="slow-text">S · ${routeText(previous.slow, 1)}</span><span class="fast-text">F · ${routeText(previous.fast, state.line === 2 ? 2 : 1)}</span>`
    : `<span class="slow-text">S · ${state.slow}</span><span class="fast-text">F · ${state.fast === -1 ? 'null' : state.fast}</span><span>${state.line === 5 ? 'RESET S TO HEAD · now both move 1 link' : state.done ? 'FINISHED' : 'Pointer positions'}</span>`;
}

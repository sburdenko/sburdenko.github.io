/** Стенды курса «3D-форматы». Логика — в models-3d.js, здесь отрисовка и кнопки. */
import { esc, RM } from '../assets/vhs.js?v=202610081105';
import { drive, act } from './rig-kit.js?v=202610081105';
import {
  HOUSE, signedArea, meshObj, meshStl, stlBinarySize, meshRig,
  tessInfo, cylinderTris, tessRig,
  UNITS, unitsView, unitsRig,
  USD_LAYERS, usdResolve, usdRig,
  FEATURES, FORMATS, convertRig,
  nurbsPoint, nurbsError, nurbsRig,
  BIM, BIM_TRIS, bimFilter, bimRig,
  CLASH_ITEMS, findClashes, clashRig,
  PC_FORMATS, PC_COUNTS, pcSize, pcCloud, pcRig
} from './models-3d.js?v=202610081105';

const fmtBytes = b => b < 1024 ? `${b} Б` : b < 1048576 ? `${(b / 1024).toFixed(1)} КБ` : b < 1073741824 ? `${(b / 1048576).toFixed(1)} МБ` : `${(b / 1073741824).toFixed(2)} ГБ`;
const num = (v, d = 2) => v.toLocaleString('ru-RU', { maximumFractionDigits: d });
const seg = (items, cur, prefix) => `<div class="seg wrap">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(label), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;

/* ---------- сборка меша ---------- */

function meshbuild(card, host, done) {
  const S = 34, PAD = 24, W = 4 * S + PAD * 2, H = 5 * S + PAD * 2;
  const X = p => PAD + p.x * S, Y = p => H - PAD - p.y * S;
  drive(card, host, meshRig, s => {
    const poly = HOUSE.map(p => `${X(p)},${Y(p)}`).join(' ');
    const tris = s.tris.map(t => `<polygon class="tri ${signedArea(HOUSE, t) > 0 ? 'front' : 'back'}" points="${t.map(i => `${X(HOUSE[i])},${Y(HOUSE[i])}`).join(' ')}"/>`).join('');
    const verts = HOUSE.map((p, i) => `<g class="vtx${s.sel.includes(i) ? ' on' : ''}" data-act="v:${i}" role="button" tabindex="0" aria-label="Вершина ${p.n}"><circle cx="${X(p)}" cy="${Y(p)}" r="13"/><text x="${X(p)}" y="${Y(p) + 4}">${p.n}</text></g>`).join('');
    const obj = meshObj(HOUSE, s.tris), stl = meshStl(HOUSE, s.tris);
    return `<div class="mesh-wrap">
        <svg class="mesh-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Домик из пяти вершин"><polygon class="outline" points="${poly}"/>${tris}${verts}</svg>
        <div class="mesh-legend"><span class="f">■ лицом к тебе</span><span class="b">■ изнанкой</span></div>
      </div>
      <div class="vm-note">${esc(s.msg)}</div>
      <div class="files2">
        <div><div class="colh">OBJ · ${obj.length} байт · вершин записано: ${HOUSE.length}</div><pre class="code small">${esc(obj)}</pre></div>
        <div><div class="colh">STL · бинарный ${stlBinarySize(s.tris.length)} байт · вершин записано: ${s.tris.length * 3}</div><pre class="code small">${esc(stl)}</pre></div>
      </div>
      <div class="btns">${act('undo', 'Убрать последний')}${act('flip', 'Развернуть обход')}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- тесселяция цилиндра ---------- */

function drawCylinder(cv, n, flat, angle) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || 300, h = 220;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const tilt = 0.45, ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt);
  const rot = ([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; return [x1, y * ct - z1 * st, y * st + z1 * ct]; };
  const k = Math.min(w, h) * 0.32;
  const tris = cylinderTris(n).map(([pts, nrm]) => {
    const p = pts.map(rot), nr = rot(nrm);
    return { p, nr, z: (p[0][2] + p[1][2] + p[2][2]) / 3 };
  }).filter(t => t.nr[2] > -0.02).sort((a, b) => a.z - b.z);
  const light = [0.4, 0.6, 0.7];
  for (const t of tris) {
    const nrm = t.nr;
    const l = Math.max(0, nrm[0] * light[0] + nrm[1] * light[1] + nrm[2] * light[2]);
    const shade = flat ? 0.25 + 0.75 * l : 0.35 + 0.65 * Math.pow(l, 0.8);
    c.beginPath();
    t.p.forEach(([x, y], i) => (i ? c.lineTo : c.moveTo).call(c, w / 2 + x * k, h / 2 - y * k));
    c.closePath();
    c.fillStyle = `rgba(${Math.round(38 * shade + 20)},${Math.round(227 * shade)},${Math.round(234 * shade)},1)`;
    c.fill();
    // плоские нормали: видны грани; гладкие: рёбер не рисуем, как и видеокарта при сглаживании
    c.strokeStyle = flat ? 'rgba(11,7,21,.6)' : `rgba(${Math.round(38 * shade + 20)},${Math.round(227 * shade)},${Math.round(234 * shade)},1)`;
    c.lineWidth = flat ? (n > 96 ? 0.3 : 0.8) : 0.6;
    c.stroke();
  }
}

function tess(card, host, done) {
  let angle = 0.6, raf = 0, drag = null;
  const ctl = drive(card, host, tessRig, s => {
    const info = tessInfo(s.n, s.flat);
    const presets = [6, 12, 24, 48, 64, 128];
    return `<canvas class="cyl" aria-label="Цилиндр из ${info.tris} треугольников"></canvas>
      <label class="slider">Сегментов по окружности <output>${s.n}</output><input type="range" min="3" max="160" value="${s.n}" data-n aria-label="Сегментов по окружности"></label>
      <div class="btns">${presets.map(p => act(`n:${p}`, String(p), 'btn sm')).join('')}${act('flat', s.flat ? 'Гладкие нормали' : 'Плоские нормали', 'btn sm')}</div>
      <div class="pool-stats">
        <div class="counter"><b>${info.tris}</b><span>треугольников</span></div>
        <div class="counter${info.err <= 0.1 ? ' good' : ''}"><b>${num(info.err, 3)}</b><span>мм отклонение от цилиндра</span></div>
        <div class="counter"><b>${info.gpu}</b><span>вершин для видеокарты (точек — ${info.positions})</span></div>
        <div class="counter"><b>${fmtBytes(info.stl)}</b><span>бинарный STL</span></div>
      </div>
      <div class="pool-io">GLB ≈ <b>${fmtBytes(info.glb)}</b> · STEP с тем же цилиндром ≈ <b>${fmtBytes(info.step)}</b> — в нём «радиус 50 мм, высота 100 мм», и размер не зависит от качества.</div>`;
  }, done, (box, s) => {
    const cv = box.querySelector('.cyl');
    const paint = () => drawCylinder(cv, s.n, s.flat, angle);
    paint();
    const input = box.querySelector('[data-n]');
    input.oninput = () => { box.querySelector('.slider output').textContent = input.value; drawCylinder(cv, +input.value, s.flat, angle); };
    input.onchange = () => ctl.set(tessRig.act(card, ctl.get(), `n:${input.value}`));
    cv.onpointerdown = e => { drag = { x: e.clientX, a: angle }; cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = e => { if (drag) { angle = drag.a + (e.clientX - drag.x) / 80; paint(); } };
    cv.onpointerup = () => { drag = null; };
    cancelAnimationFrame(raf);
    if (!RM) {
      const spin = () => { if (!cv.isConnected) return; if (!drag) { angle += 0.004; drawCylinder(cv, ctl.get().n, ctl.get().flat, angle); } raf = requestAnimationFrame(spin); };
      raf = requestAnimationFrame(spin);
    }
  });
}

/* ---------- единицы и оси ---------- */

function units(card, host, done) {
  drive(card, host, unitsRig, s => {
    const v = unitsView(s);
    const H = 150, ground = 132, personH = 1.8;
    // логарифмическая шкала: человек 1,8 м и кружка рядом
    const px = m => Math.max(4, Math.min(120, 40 * Math.log10(1 + m * 9)));
    const mugH = px(v.seen), manH = px(personH);
    const mug = v.upright
      ? `<rect x="150" y="${ground - mugH}" width="${mugH * 0.8}" height="${mugH}" rx="4" class="mug"/><path d="M${150 + mugH * 0.8} ${ground - mugH * 0.75} q ${mugH * 0.35} ${mugH * 0.25} 0 ${mugH * 0.5}" class="mug-h"/>`
      : `<rect x="150" y="${ground - mugH * 0.8}" width="${mugH}" height="${mugH * 0.8}" rx="4" class="mug"/><path d="M${150 + mugH * 0.25} ${ground - mugH * 0.8} q ${mugH * 0.25} -${mugH * 0.35} ${mugH * 0.5} 0" class="mug-h"/>`;
    return `<svg class="units-svg" viewBox="0 0 300 ${H}" role="img" aria-label="Кружка рядом с человеком">
        <line x1="10" y1="${ground}" x2="290" y2="${ground}" class="gnd"/>
        <g class="man"><circle cx="70" cy="${ground - manH + 8}" r="8"/><line x1="70" y1="${ground - manH + 16}" x2="70" y2="${ground - manH * 0.4}"/><line x1="70" y1="${ground - manH * 0.4}" x2="60" y2="${ground}"/><line x1="70" y1="${ground - manH * 0.4}" x2="80" y2="${ground}"/></g>
        <text x="70" y="${ground + 14}" class="lbl">человек 1,8 м</text>${mug}
      </svg>
      <div class="vm-note${v.ok ? ' ret' : ' err'}">В файл записано число <b>${num(v.written, 3)}</b>. Просмотрщик glTF читает его как метры: кружка высотой <b>${num(v.seen, 3)} м</b>${v.upright ? '' : ', и она лежит на боку: ось вверх у вас разная'}.${v.ok ? ' Всё сходится.' : ''}</div>
      <div class="ctl-group"><span class="ctl-label">Единицы при экспорте</span>${seg(Object.keys(UNITS).map(u => [u, { mm: 'мм', cm: 'см', m: 'м', in: 'дюймы' }[u]]), s.unit, 'unit')}</div>
      <div class="ctl-group"><span class="ctl-label">Ось вверх в файле</span>${seg([['Z', 'Z вверх (как в исходной программе)'], ['Y', 'Y вверх (как в glTF)']], s.up, 'up')}</div>`;
  }, done);
}

/* ---------- USD: слои и варианты ---------- */

const CHAIR = { oak: '#c89a5b', walnut: '#7a4b2a', red: '#e04a5a' };

function usd(card, host, done) {
  drive(card, host, usdRig, s => {
    const r = usdResolve(s);
    const sc = r.scale.value, legs = r.legs.value, tall = r.height.value === 'барный';
    const col = CHAIR[r.color.value];
    const seatY = tall ? 60 : 90, w = 80 * sc, x0 = 110 - w / 2;
    const legX = legs === 3 ? [x0 + 6, x0 + w / 2, x0 + w - 10] : [x0 + 4, x0 + w * 0.3, x0 + w * 0.62, x0 + w - 8];
    const svg = `<svg class="chair" viewBox="0 0 220 170" role="img" aria-label="Стул: ${esc(r.color.value)}, ножек ${legs}">
      <rect x="${x0}" y="${seatY - 70}" width="${w * 0.18}" height="70" rx="3" fill="${col}"/>
      <rect x="${x0}" y="${seatY}" width="${w}" height="10" rx="3" fill="${col}"/>
      ${legX.map(x => `<rect x="${x}" y="${seatY + 10}" width="5" height="${158 - seatY - 10}" fill="${col}" opacity=".85"/>`).join('')}
      <line x1="10" y1="160" x2="210" y2="160" class="gnd"/></svg>`;
    const layers = s.order.map(id => USD_LAYERS.find(l => l.id === id)).map((l, i) => `<div class="layer${s.on[l.id] ? ' on' : ''}">
      <span class="lv">${i + 1}</span><span class="lt"><b>${esc(l.file)}</b><small>${esc(l.role)} · ${Object.entries(l.opinions).map(([k, v]) => `${k} = ${v}`).join(', ')}</small></span>
      ${l.locked ? '<span class="badge-s">основа</span>' : act(`layer:${l.id}`, s.on[l.id] ? 'выключить' : 'включить', 'btn sm')}</div>`).join('');
    const table = Object.entries(r).map(([k, v]) => `<div class="fld"><span>${k}</span><b>${esc(String(v.value))}</b><span>← ${esc(v.from)}</span></div>`).join('');
    return `<div class="usd"><div>${svg}</div><div class="layers"><div class="colh">Стек слоёв: выше — сильнее</div>${layers}</div></div>
      <div class="roots"><div class="colh">Что получилось и откуда</div>${table}</div>
      <div class="ctl-group"><span class="ctl-label">Вариант стула (variantSet «style»)</span>${seg([['classic', 'classic — 4 ножки'], ['bar', 'bar — барный, 3 ножки']], s.variant, 'var')}</div>
      <div class="btns">${act('swap', 'Поменять местами слои 1 и 2')}${act('reset', 'Сначала ↺')}</div>`;
  }, done);
}

/* ---------- конвертер ---------- */

const MARK = { yes: ['✓', 'сохранится'], part: ['≈', 'частично'], no: ['✗', 'потеряется'] };

function convert(card, host, done) {
  drive(card, host, convertRig, s => {
    const rows = card.asset.map(f => {
      if (!s.fmt) return `<div class="cv-row"><span>${esc(FEATURES[f])}</span><span class="cv-m idle">?</span></div>`;
      const st = FORMATS[s.fmt].caps[f], note = FORMATS[s.fmt].notes?.[f];
      return `<div class="cv-row ${st}"><span>${esc(FEATURES[f])}${note ? `<small>${esc(note)}</small>` : ''}</span><span class="cv-m">${MARK[st][0]} ${MARK[st][1]}</span></div>`;
    }).join('');
    const lost = s.fmt ? card.asset.filter(f => FORMATS[s.fmt].caps[f] !== 'yes').length : null;
    return `<div class="roots"><div class="colh">Исходная модель: ${esc(card.assetName)}</div>${rows}</div>
      ${s.fmt ? `<div class="vm-note${lost ? ' err' : ' ret'}">${lost ? `${FORMATS[s.fmt].name}: проблемы с ${lost} из ${card.asset.length} свойств.` : `${FORMATS[s.fmt].name} сохранит всё.`}</div>` : ''}
      <div class="ctl-group"><span class="ctl-label">Сохранить как</span>${seg(Object.entries(FORMATS).map(([k, f]) => [k, f.name]), s.fmt, 'fmt')}</div>`;
  }, done);
}

/* ---------- NURBS ---------- */

function nurbsPic(card, w) {
  const S = 150, O = 20, P = (x, y) => `${O + x * S},${O + S - y * S}`;
  const pts = Array.from({ length: 61 }, (_, i) => nurbsPoint(w, i / 60)).map(p => P(p.x, p.y)).join(' ');
  const err = nurbsError(w);
  return {
    svg: `<svg class="nurbs" viewBox="0 0 ${S + O * 2} ${S + O * 2}" role="img" aria-label="Кривая и четверть окружности">
        <path d="M${P(1, 0)} A ${S} ${S} 0 0 0 ${P(0, 1)}" class="circle"/>
        <polyline points="${P(1, 0)} ${P(1, 1)} ${P(0, 1)}" class="ctrl"/>
        <polyline points="${pts}" class="curve"/>
        ${[[1, 0], [1, 1], [0, 1]].map(([x, y], i) => `<circle cx="${O + x * S}" cy="${O + S - y * S}" r="${i === 1 ? 4 + w * 3 : 4}" class="cp${i === 1 ? ' w' : ''}"/>`).join('')}
      </svg>`,
    stats: `<div class="counter${err <= card.goal.max ? ' good' : ''}"><b>${num(err * 50, 3)}</b><span>мм максимальная ошибка при радиусе 50 мм</span></div>
        <div class="counter"><b class="word">${w === 1 ? 'парабола' : err < 0.002 ? 'окружность' : w < 1 ? 'эллипс' : 'гипербола'}</b><span>что это за кривая</span></div>`
  };
}

function nurbs(card, host, done) {
  const ctl = drive(card, host, nurbsRig, s => {
    const pic = nurbsPic(card, s.w);
    return `<div class="nurbs-pic">${pic.svg}</div>
      <label class="slider">Вес средней точки w <output>${num(s.w, 3)}</output><input type="range" min="0.2" max="2" step="0.005" value="${s.w}" data-w aria-label="Вес средней точки"></label>
      <div class="pool-stats two">${pic.stats}</div>
      <div class="btns">${act('w-:0.05', 'w − 0,05', 'btn sm')}${act('w-:0.005', 'w − 0,005', 'btn sm')}${act('w+:0.005', 'w + 0,005', 'btn sm')}${act('w+:0.05', 'w + 0,05', 'btn sm')}${act('w:1', 'w = 1, обычная кривая Безье', 'btn sm')}</div>`;
  }, done, box => {
    const input = box.querySelector('[data-w]');
    // пока тянут — перерисовываем только картинку, иначе ползунок пересоздастся и перетаскивание оборвётся
    input.oninput = () => {
      const pic = nurbsPic(card, +input.value);
      box.querySelector('.nurbs-pic').innerHTML = pic.svg;
      box.querySelector('.pool-stats').innerHTML = pic.stats;
      box.querySelector('.slider output').textContent = num(+input.value, 3);
    };
    input.onchange = () => ctl.set(nurbsRig.act(card, ctl.get(), `w:${input.value}`));
  });
}

/* ---------- BIM ---------- */

const TYPE_RU = { IfcWall: 'стены', IfcDoor: 'двери', IfcWindow: 'окна', IfcSlab: 'плиты' };

function bim(card, host, done) {
  drive(card, host, bimRig, s => {
    if (s.mesh) {
      const tris = BIM.reduce((a, e) => a + BIM_TRIS[e.type], 0);
      return `<div class="vm-note err">Здание сохранено как GLB. Осталось ${BIM.length} кусков геометрии и ${tris} треугольников. Типов, этажей, огнестойкости и связей больше нет — фильтровать нечего.</div>
        <div class="bim-list">${BIM.map((e, i) => `<div class="bim-row mesh"><span class="oid">mesh_${i}</span><span>${BIM_TRIS[e.type]} треугольников</span></div>`).join('')}</div>
        <div class="btns">${act('mesh', 'Вернуть IFC', 'btn primary')}${act('reset', 'Сначала ↺')}</div>`;
    }
    const list = bimFilter(s);
    const sel = BIM.find(e => e.id === s.sel);
    return `<div class="crumbs">IfcProject › IfcSite › IfcBuilding › IfcBuildingStorey ${s.storey ?? '1, 2'}</div>
      <div class="ctl-group"><span class="ctl-label">Тип</span>${seg(Object.entries(TYPE_RU).map(([k, v]) => [k, `${k} (${v})`]), s.type, 'type')}</div>
      <div class="ctl-group"><span class="ctl-label">Этаж</span>${seg([[1, 'Этаж 1'], [2, 'Этаж 2']], s.storey, 'storey')}</div>
      <div class="btns">${act('fire', s.fire ? '✓ только с FireRating' : 'Только с FireRating', 'btn sm')}${act('mesh', 'Сохранить как GLB', 'btn sm')}${act('reset', 'Сначала ↺', 'btn sm')}</div>
      <div class="vm-note">Найдено: <b>${list.length}</b></div>
      <div class="bim-list">${list.map(e => `<button type="button" class="bim-row${s.sel === e.id ? ' on' : ''}" data-act="sel:${e.id}"><span class="oid">${e.type}</span><span>${esc(e.name)}</span><span class="st">этаж ${e.storey}</span></button>`).join('') || '<div class="empty">ничего не найдено</div>'}</div>
      ${sel ? `<div class="roots"><div class="colh">Свойства · GlobalId ${esc(sel.id)}</div>${Object.entries(sel.props).map(([k, v]) => `<div class="fld"><span>Pset_${sel.type.slice(3)}Common.${k}</span><b>${esc(String(v))}</b></div>`).join('')}<div class="fld"><span>IfcRelContainedInSpatialStructure</span><b>этаж ${sel.storey}</b></div></div>` : ''}`;
  }, done);
}

/* ---------- координация и BCF ---------- */

const TOLS = [[0, 'жёсткие (0 мм)'], [50, 'зазор 50 мм'], [150, 'зазор 150 мм']];

function clash(card, host, done) {
  drive(card, host, clashRig, s => {
    const sx = x => 10 + x / 12000 * 280, sy = y => 150 - (y - 2200) / 1000 * 130;
    const list = s.ran ? findClashes(s.tol) : [];
    const hot = new Set(s.pick != null && list[s.pick] ? [list[s.pick].a, list[s.pick].b] : []);
    const boxes = CLASH_ITEMS.map(e => `<rect x="${sx(e.box[0])}" y="${sy(e.box[3])}" width="${sx(e.box[2]) - sx(e.box[0])}" height="${sy(e.box[1]) - sy(e.box[3])}" class="cb ${e.model.slice(0, 2) === 'КР' ? 'kr' : e.model.slice(0, 2) === 'ОВ' ? 'ov' : 'vk'}${hot.has(e.id) ? ' hot' : ''}"/><text x="${sx(e.box[0]) + 3}" y="${sy(e.box[3]) - 3}" class="lbl">${e.id}</text>`).join('');
    const item = id => CLASH_ITEMS.find(e => e.id === id);
    const rows = list.map((c, i) => `<button type="button" class="bim-row${s.pick === i ? ' on' : ''}" data-act="pick:${i}"><span class="oid">${c.hard ? 'пересечение' : `зазор ${c.gap} мм`}</span><span>${item(c.a).kind} ${c.a} × ${item(c.b).kind} ${c.b}</span></button>`).join('');
    const b = s.bcf;
    const xml = b ? `markup.bcf
<Topic Guid="7c1e…" TopicType="Clash" TopicStatus="Open">
  <Title>${item(b.a).kind} ${b.a} × ${item(b.b).kind} ${b.b}</Title>
  <AssignedTo>${item(b.b).model}</AssignedTo>
</Topic>
viewpoint.bcfv
<Components>
  <Selection>
    <Component IfcGuid="${item(b.a).guid}"/>
    <Component IfcGuid="${item(b.b).guid}"/>
  </Selection>
</Components>
<PerspectiveCamera>
  <CameraViewPoint X="…" Y="…" Z="…"/>
  <CameraDirection …/>
</PerspectiveCamera>
snapshot.png` : '';
    return `<svg class="clash-svg" viewBox="0 0 300 160" role="img" aria-label="Разрез: балки, воздуховод и трубы">${boxes}</svg>
      <div class="mesh-legend"><span class="kr">■ КР</span><span class="ov">■ ОВ</span><span class="vk">■ ВК</span></div>
      <div class="ctl-group"><span class="ctl-label">Правило проверки</span>${seg(TOLS, s.tol, 'tol')}</div>
      <div class="btns">${act('run', 'Найти коллизии', 'btn primary')}${act('bcf', 'Создать BCF-замечание', 'btn', s.pick == null)}${act('reset', 'Сначала ↺')}</div>
      ${s.ran ? `<div class="vm-note">Найдено коллизий: <b>${list.length}</b>${list.length ? ' — выбери одну.' : ''}</div><div class="bim-list">${rows}</div>` : ''}
      ${b ? `<div class="colh">Содержимое .bcfzip — модели внутри нет</div><pre class="code small">${esc(xml)}</pre>` : ''}`;
  }, done);
}

/* ---------- облако точек ---------- */

const CLS_COLOR = { 2: [150, 110, 60], 5: [60, 200, 90], 6: [230, 90, 120] };
const CLOUD = pcCloud();

function drawCloud(cv, s) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || 300, h = 210;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#07040f'; c.fillRect(0, 0, w, h);
  const step = Math.round(100 / s.density);
  const k = w / 26;
  const pts = CLOUD.filter((_, i) => i % step === 0).map(p => ({ p, sx: w / 2 + (p.x + p.z * 0.55) * k, sy: h - 30 - (p.y - p.z * 0.35) * k, d: p.z }));
  pts.sort((a, b) => a.d - b.d);
  for (const { p, sx, sy } of pts) {
    let col;
    if (s.mode === 'rgb') col = p.rgb;
    else if (s.mode === 'class') col = CLS_COLOR[p.cls];
    else if (s.mode === 'intensity') { const v = Math.round(40 + p.i * 215); col = [v, v, v]; }
    else { const t = Math.min(1, p.y / 7); col = [Math.round(38 + t * 217), Math.round(227 - t * 140), Math.round(234 - t * 170)]; }
    c.fillStyle = `rgb(${col.map(Math.round).join(',')})`;
    c.fillRect(sx, sy, 1.8, 1.8);
  }
}

function points(card, host, done) {
  drive(card, host, pcRig, s => {
    const shown = Math.round(CLOUD.length * s.density / 100);
    const n = PC_COUNTS[s.n];
    const sizes = Object.entries(PC_FORMATS).map(([k, f]) => `<div class="fld${k === s.fmt ? ' on' : ''}"><span>${f.name}</span><b>${fmtBytes(pcSize(k, n))}</b></div>`).join('');
    return `<canvas class="cloud" aria-label="Облако точек: земля, здание, дерево"></canvas>
      <div class="ctl-group"><span class="ctl-label">Раскраска</span>${seg([['rgb', 'RGB с камеры'], ['class', 'Классы LAS'], ['intensity', 'Интенсивность'], ['height', 'Высота']], s.mode, 'mode')}</div>
      <div class="ctl-group"><span class="ctl-label">Плотность (на экране ${shown} точек)</span>${seg([[100, '100 %'], [50, '50 %'], [20, '20 %']], s.density, 'density')}</div>
      ${s.mode === 'class' ? '<div class="mesh-legend"><span style="color:rgb(150,110,60)">■ 2 — земля</span><span style="color:rgb(230,90,120)">■ 6 — здание</span><span style="color:rgb(60,200,90)">■ 5 — высокая растительность</span></div>' : ''}
      <div class="roots"><div class="colh">Калькулятор размера файла</div>
        <div class="ctl-group"><span class="ctl-label">Сколько точек в скане</span>${seg(Object.keys(PC_COUNTS).map(k => [k, k.replace('M', ' млн').replace('1B', '1 млрд')]), s.n, 'n')}</div>
        <div class="ctl-group"><span class="ctl-label">Формат</span>${seg(Object.entries(PC_FORMATS).map(([k, f]) => [k, f.name]), s.fmt, 'fmt')}</div>
        ${sizes}<div class="pool-io">${esc(PC_FORMATS[s.fmt].note)}</div></div>`;
  }, done, (box, s) => drawCloud(box.querySelector('.cloud'), s));
}

export const RIGS_3D = { meshbuild, tess, units, usd, convert, nurbs, bim, clash, points };

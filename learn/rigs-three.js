/** Стенды курса «Three.js: начальный уровень». Логика — в models-three.js, картинка — настоящий Three.js. */
import { esc } from '../assets/vhs.js?v=202610101341';
import { drive, act } from './rig-kit.js?v=202610101341';
import { codeHtml } from './code-view.js?v=202610101341';
import { makeView, VIEW_ASPECT } from './three-view.js?v=202610101341';
import { tr } from './i18n.js?v=202610101341';
import {
  firstRig, firstView, firstCode,
  CAM_OBJECTS, CAM_OPTIONS, camSees, camRig,
  EARTH_R, MOON_R, orbitWorld, graphRig,
  MATERIALS, LIGHTS, SHADOW_FLAGS, lightView, lightRig,
  texView, texRig
} from './models-three.js?v=202610101341';

const seg = (items, cur, prefix) => `<div class="seg wrap literal">${items.map(([v, label]) => act(`${prefix}:${v}`, esc(tr(label)), '').replace('class=""', `aria-pressed="${String(v) === String(cur)}"`)).join('')}</div>`;
const tog = (a, on, text) => act(a, `${on ? '✓ ' : ''}${esc(text)}`, '').replace('class=""', `aria-pressed="${on}"`);
const BG = 0x0b0715;
const lock = card => new Set(card.lock ?? []);


/* ---------- схема «вид сверху»: где камера и что в её пирамиде ---------- */

/**
 * SVG вида сверху (ось X вправо, ось Z вниз — к зрителю; камера смотрит вверх, вдоль −Z).
 * cam: { z, fov, near, far }; items: [{ x, z, color, label, hide, size }]; k — пикселей на единицу.
 */
function topSvg({ cam, items, k, oy, hint }) {
  const ox = 100, W = 200, H = 200;
  const X = x => ox + x * k, Z = z => oy + z * k;
  const half = d => d * Math.tan((cam.fov / 2) * Math.PI / 180) * VIEW_ASPECT;
  const n = Math.max(cam.near, 0), f = cam.far;
  const poly = [[-half(n), cam.z - n], [half(n), cam.z - n], [half(f), cam.z - f], [-half(f), cam.z - f]].map(([x, z]) => `${X(x).toFixed(1)},${Z(z).toFixed(1)}`).join(' ');
  const grid = [];
  for (let i = -6; i <= 6; i++) { grid.push(`<line x1="${X(i)}" y1="0" x2="${X(i)}" y2="${H}" class="tp-g"/>`); }
  for (let z = Math.ceil(-oy / k); z <= (H - oy) / k; z++) grid.push(`<line x1="0" y1="${Z(z)}" x2="${W}" y2="${Z(z)}" class="tp-g"/>`);
  const objs = items.map(it => {
    const sz = (it.size ?? 1) * k;
    return `<g class="${it.hide ? 'tp-hide' : ''}"><rect x="${X(it.x) - sz / 2}" y="${Z(it.z) - sz / 2}" width="${sz}" height="${sz}" rx="2" style="--c:${it.color}" class="tp-o"/>${it.label ? `<text x="${X(it.x)}" y="${Z(it.z) - sz / 2 - 3}" class="tp-t" text-anchor="middle">${esc(it.label)}</text>` : ''}</g>`;
  }).join('');
  const cx = X(0), cy = Z(cam.z);
  const icon = `<g transform="translate(${cx} ${cy})" class="tp-cam"><rect x="-8" y="-3" width="16" height="11" rx="2"/><polygon points="-5,-3 5,-3 8,-10 -8,-10"/><circle cx="-4" cy="-13" r="3.2"/><circle cx="4" cy="-13" r="3.2"/></g>`;
  return `<svg class="tp" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(tr({ ru: 'Вид сверху: камера и объекты', en: 'Top view: the camera and the objects' }))}">
    ${grid.join('')}
    <polygon points="${poly}" class="tp-f"/>
    ${objs}
    ${icon}
    <text x="${Math.min(Math.max(cx, 34), 166)}" y="${Math.min(cy + 24, H - 4)}" class="tp-t cam" text-anchor="middle">${esc(tr({ ru: 'камера', en: 'camera' }))} z = ${cam.z}</text>
    <g class="tp-ax"><line x1="12" y1="${H - 26}" x2="34" y2="${H - 26}"/><line x1="12" y1="${H - 26}" x2="12" y2="${H - 6}"/><text x="38" y="${H - 23}">+X</text><text x="16" y="${H - 6}">+Z</text></g>
    <text x="${W - 6}" y="12" class="tp-t top" text-anchor="end">${esc(tr({ ru: 'вид сверху', en: 'top view' }))}</text>
    ${hint ? `<text x="${W / 2}" y="${H / 2 - 36}" class="tp-t warn" text-anchor="middle">${esc(hint)}</text>` : ''}
  </svg>`;
}

/* ---------- первая сцена ---------- */

function tjfirst(card, host, done) {
  const L = lock(card);
  const pair = document.createElement('div');
  pair.className = 'tj-pair';
  host.append(pair);
  const top = document.createElement('div');
  top.className = 'tj-top';
  const view = makeView(pair, (THREE, renderer, { RM }) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, VIEW_ASPECT, 0.1, 100);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshNormalMaterial());
    cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({ color: 0xffffff })));
    cube.rotation.set(0.4, 0.6, 0);
    // пол с сеткой и оси: так видно, где «вперёд» и где вверх (X красная, Y зелёная, Z синяя)
    const grid = new THREE.GridHelper(20, 20, 0x4a3d78, 0x2a2147);
    grid.position.y = -0.8;
    const axes = new THREE.AxesHelper(1.4);
    axes.position.set(-1.6, -0.8, 0);
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 120 }, (_, i) => [(Math.sin(i * 12.9) * 9), 0.3 + Math.abs(Math.sin(i * 7.7)) * 5, -2 - Math.abs(Math.cos(i * 3.1)) * 14]).flat(), 3)), new THREE.PointsMaterial({ color: 0x7fd4ff, size: 0.06 }));
    scene.add(grid, axes, stars);
    renderer.setClearColor(BG);
    let s = null;
    return {
      update(n) { s = n; camera.position.z = n.camZ; if (n.added) scene.add(cube); else scene.remove(cube); },
      frame() {
        if (!s || !(s.render || s.loop)) { renderer.clear(); return; }
        if (s.loop && !RM) cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
    };
  });
  pair.append(top);
  drive(card, host, firstRig, s => {
    const v = firstView(s);
    return `<div class="vm-note${v.visible ? ' ret' : ' err'}">${esc(v.why)}</div>
      <pre class="code small full">${codeHtml(firstCode(s))}</pre>
      <div class="btns seg wrap literal">${L.has('add') ? '' : tog('add', s.added, 'scene.add(cube)')}${L.has('render') ? '' : tog('render', s.render, 'renderer.render(…)')}${L.has('loop') ? '' : tog('loop', s.loop, 'setAnimationLoop(…)')}</div>
      ${L.has('camz') ? '' : `<div class="ctl-group"><span class="ctl-label">camera.position.z</span>${seg([[0, '0'], [5, '5']], s.camZ, 'camz')}</div>`}`;
  }, done, (box, s) => {
    view.update(s);
    top.innerHTML = topSvg({
      cam: { z: s.camZ, fov: 50, near: 0.1, far: 100 }, k: 18, oy: 56,
      items: [{ x: 0, z: 0, color: s.added ? '#c47bff' : '#8f86b5', label: s.added ? 'cube' : tr({ ru: 'куб (не в сцене)', en: 'cube (not in scene)' }), hide: !s.added }],
      hint: s.camZ === 0 ? tr({ ru: 'камера внутри куба', en: 'the camera is inside the cube' }) : ''
    });
  });
}

/* ---------- камера ---------- */

function tjcam(card, host, done) {
  const L = lock(card);
  const pair = document.createElement('div');
  pair.className = 'tj-pair';
  host.append(pair);
  const top = document.createElement('div');
  top.className = 'tj-top';
  const view = makeView(pair, (THREE, renderer) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    const camera = new THREE.PerspectiveCamera(50, VIEW_ASPECT, 0.1, 50);
    const grid = new THREE.GridHelper(40, 40, 0x3a2f5c, 0x241c3d);
    grid.position.y = -0.5;
    scene.add(grid);
    for (const o of CAM_OBJECTS) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: o.color }));
      m.position.set(o.x, 0, o.z);
      m.rotation.y = 0.5;
      scene.add(m);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(3, 5, 4);
    scene.add(sun);
    return {
      update(s) {
        Object.assign(camera, { fov: s.fov, near: s.near, far: s.far });
        camera.position.set(0, 0, s.z);
        camera.updateProjectionMatrix();
      },
      frame() { renderer.render(scene, camera); }
    };
  });
  pair.append(top);
  drive(card, host, camRig, s => {
    const seen = camSees(s);
    const rows = CAM_OBJECTS.map((o, i) => `<div class="cv-row ${seen[i].ok ? 'yes' : 'no'}"><span><b style="color:${o.color}">■</b> ${esc(tr(o.name))} (x ${o.x}, z ${o.z})<small>${esc(seen[i].why)}</small></span><span class="cv-m">${seen[i].ok ? tr({ ru: '✓ видно', en: '✓ visible' }) : tr({ ru: '✗ не видно', en: '✗ not visible' })}</span></div>`).join('');
    const ctl = Object.entries(CAM_OPTIONS).filter(([k]) => !L.has(k)).map(([k, vals]) => `<div class="ctl-group"><span class="ctl-label">${{ fov: tr({ ru: 'fov (вертикальный угол, °)', en: 'fov (vertical angle, °)' }), z: 'camera.position.z', near: 'near', far: 'far' }[k]}</span>${seg(vals.map(v => [v, String(v)]), s[k], k)}</div>`).join('');
    return `<pre class="code small">${codeHtml(`const camera = new THREE.PerspectiveCamera(${s.fov}, w / h, ${s.near}, ${s.far});\ncamera.position.z = ${s.z};`)}</pre>
      <div class="roots"><div class="colh">${tr({ ru: 'Что попадёт в кадр (по центру кубика)', en: 'What gets into the frame (by cube center)' })}</div>${rows}</div>${ctl}`;
  }, done, (box, s) => {
    view.update(s);
    const seen = camSees(s);
    top.innerHTML = topSvg({
      cam: { z: s.z, fov: s.fov, near: s.near, far: s.far }, k: 7, oy: 112,
      items: CAM_OBJECTS.map((o, i) => ({ x: o.x, z: o.z, color: o.color, label: tr(o.name), hide: !seen[i].ok }))
    });
  });
}

/* ---------- иерархия ---------- */

function tjgraph(card, host, done) {
  const L = lock(card);
  const view = makeView(host, (THREE, renderer, { RM }) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    const camera = new THREE.PerspectiveCamera(45, VIEW_ASPECT, 0.1, 100);
    camera.position.set(0, 10, 7);
    camera.lookAt(0, 0, 0);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffc94d }));
    scene.add(sun);
    const ring = new THREE.Mesh(new THREE.RingGeometry(EARTH_R - 0.02, EARTH_R + 0.02, 96), new THREE.MeshBasicMaterial({ color: 0x3a2f5c, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    const pivot = new THREE.Group();
    sun.add(pivot);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 16), new THREE.MeshLambertMaterial({ color: 0x4f9dff }));
    earth.position.x = EARTH_R;
    pivot.add(earth);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 12), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const light = new THREE.PointLight(0xfff2d0, 60, 0, 2);
    scene.add(light);
    let target = 0, shown = 0;
    return {
      update(s) {
        target = s.angle * Math.PI / 180;
        if (target < shown - 0.01) shown -= Math.PI * 2;
        earth.scale.setScalar(s.scale);
        if (s.parent === 'earth') { earth.add(moon); moon.position.set(MOON_R, 0, 0); }
        else { scene.add(moon); moon.position.set(EARTH_R + MOON_R, 0, 0); }
      },
      frame() {
        shown = RM ? target : shown + (target - shown) * 0.12;
        pivot.rotation.y = shown;
        renderer.render(scene, camera);
      }
    };
  });
  drive(card, host, graphRig, s => {
    const w = orbitWorld(s);
    const f = v => v.toFixed(1);
    return `<pre class="code small">${codeHtml(`const pivot = new THREE.Group();\nsun.add(pivot);\npivot.add(earth);             // earth.position.x = ${EARTH_R}\nearth.scale.setScalar(${s.scale});\n${s.parent === 'earth' ? 'earth.add(moon);              // moon.position.x = 1.2' : 'scene.add(moon);              // moon.position.x = 5.2'}\n\npivot.rotation.y = THREE.MathUtils.degToRad(${s.angle});`)}</pre>
      <div class="pool-stats"><div class="counter"><b>${s.angle}°</b><span>${tr({ ru: 'поворот pivot', en: 'pivot rotation' })}</span></div><div class="counter"><b>${f(w.earth.x)}, ${f(w.earth.z)}</b><span>${tr({ ru: 'Земля в мире (x, z)', en: 'Earth in world (x, z)' })}</span></div><div class="counter"><b>${f(w.moon.x)}, ${f(w.moon.z)}</b><span>${tr({ ru: 'Луна в мире (x, z)', en: 'Moon in world (x, z)' })}</span></div><div class="counter${Math.abs(w.dist - MOON_R * s.scale) < 0.01 && s.parent === 'earth' ? ' good' : ''}"><b>${f(w.dist)}</b><span>${tr({ ru: 'от Луны до Земли', en: 'Moon to Earth' })}</span></div></div>
      <div class="btns">${act('orbit', 'pivot.rotation.y += 45°', 'btn primary')}${act('reset', tr({ ru: 'Сначала ↺', en: 'Start over ↺' }))}</div>
      ${L.has('parent') ? '' : `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Родитель Луны', en: 'Moon\'s parent' })}</span>${seg([['scene', 'scene.add(moon)'], ['earth', 'earth.add(moon)']], s.parent, 'parent')}</div>`}
      ${L.has('scale') ? '' : `<div class="btns seg wrap literal">${tog('scale', s.scale === 2, 'earth.scale = 2')}</div>`}`;
  }, done, (box, s) => view.update(s));
}

/* ---------- свет и материалы ---------- */

function tjlight(card, host, done) {
  const L = lock(card);
  const view = makeView(host, (THREE, renderer, { RM }) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    const camera = new THREE.PerspectiveCamera(45, VIEW_ASPECT, 0.1, 100);
    camera.position.set(0, 2.6, 5.2);
    camera.lookAt(0, 0.8, 0);
    const mats = {
      basic: new THREE.MeshBasicMaterial({ color: 0x4f9dff }),
      lambert: new THREE.MeshLambertMaterial({ color: 0x4f9dff }),
      standard: new THREE.MeshStandardMaterial({ color: 0x4f9dff, roughness: 0.35, metalness: 0.1 })
    };
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.22, 128, 24), mats.standard);
    knot.position.y = 1.2;
    scene.add(knot);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x9a92b0, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    const dir = new THREE.DirectionalLight(0xffffff, 2.5);
    dir.position.set(2.5, 5, 2);
    dir.shadow.mapSize.set(1024, 1024);
    const pt = new THREE.PointLight(0xffaa66, 25, 0, 2);
    pt.position.set(-2, 2.2, 1.5);
    let sm = null;
    return {
      update(s) {
        knot.material = mats[s.mat];
        for (const [k, l] of [['amb', amb], ['dir', dir], ['pt', pt]]) { if (s[k]) scene.add(l); else scene.remove(l); }
        if (sm !== s.sm) {
          sm = s.sm;
          renderer.shadowMap.enabled = s.sm;
          // смена shadowMap требует перекомпилировать шейдеры
          [...Object.values(mats), floor.material].forEach(m => { m.needsUpdate = true; });
        }
        dir.castShadow = s.lc;
        knot.castShadow = s.cc;
        floor.receiveShadow = s.fr;
      },
      frame() {
        if (!RM) knot.rotation.y += 0.006;
        renderer.render(scene, camera);
      }
    };
  });
  drive(card, host, lightRig, s => {
    const v = lightView(s);
    const lights = Object.entries(LIGHTS).filter(([k]) => !L.has(k)).map(([k, n]) => tog(k, s[k], `scene.add(new ${n}(…))`)).join('');
    const shadows = L.has('shadows') ? '' : `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Тени — нужны все четыре', en: 'Shadows — all four are needed' })}</span><div class="seg wrap literal">${Object.entries(SHADOW_FLAGS).map(([k, t]) => tog(k, s[k], t)).join('')}</div></div>`;
    return `<div class="vm-note${v.look === 'shaded' ? ' ret' : v.look === 'black' ? ' err' : ''}">${esc(v.why)}${v.shadow ? tr({ ru: ' Тень на полу есть.', en: ' There is a shadow on the floor.' }) : s.dir && v.missing.length < 4 ? tr({ ru: ` Для тени не хватает: ${v.missing.length}.`, en: ` Missing for the shadow: ${v.missing.length}.` }) : ''}</div>
      ${L.has('mat') ? '' : `<div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Материал узла', en: 'Knot material' })}</span>${seg(Object.entries(MATERIALS), s.mat, 'mat')}</div>`}
      <div class="ctl-group"><span class="ctl-label">${tr({ ru: 'Свет', en: 'Lights' })}</span><div class="seg wrap literal">${lights}</div></div>
      ${shadows}`;
  }, done, (box, s) => view.update(s));
}

/* ---------- текстуры ---------- */

function checker(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const cols = ['#ff5d73', '#ffd166', '#5dfc9a', '#4f9dff'];
  [[0, 0], [128, 0], [0, 128], [128, 128]].forEach(([x, y], i) => {
    g.fillStyle = cols[i]; g.fillRect(x, y, 128, 128);
    g.fillStyle = '#0b0715'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(i + 1), x + 64, y + 68);
  });
  return new THREE.CanvasTexture(c);
}

function tjtex(card, host, done) {
  const L = lock(card);
  const view = makeView(host, (THREE, renderer) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    const camera = new THREE.PerspectiveCamera(45, VIEW_ASPECT, 0.1, 50);
    camera.position.set(0, 0, 4.2);
    const tex = checker(THREE);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.75), new THREE.MeshBasicMaterial({ map: tex }));
    scene.add(plane);
    return {
      update(s) {
        tex.repeat.set(s.repeat, s.repeat);
        tex.wrapS = tex.wrapT = s.wrap === 'repeat' ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
        tex.colorSpace = s.cs === 'srgb' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        tex.needsUpdate = true;
      },
      frame() { renderer.render(scene, camera); }
    };
  });
  drive(card, host, texRig, s => {
    const v = texView(s);
    const good = v.colors && (card.goal.tiles == null || v.tiles === card.goal.tiles);
    return `<pre class="code small">${codeHtml(`const tex = await new THREE.TextureLoader().loadAsync('tiles.png');\n${s.cs === 'srgb' ? 'tex.colorSpace = THREE.SRGBColorSpace;' : `// ${tr({ ru: 'tex.colorSpace не задан', en: 'tex.colorSpace not set' })}`}\ntex.wrapS = tex.wrapT = THREE.${s.wrap === 'repeat' ? 'RepeatWrapping' : 'ClampToEdgeWrapping'};\ntex.repeat.set(${s.repeat}, ${s.repeat});`)}</pre>
      <div class="vm-note${good ? ' ret' : ''}">${esc(v.why)}</div>
      ${L.has('rep') ? '' : `<div class="ctl-group"><span class="ctl-label">tex.repeat</span>${seg([[1, '1 × 1'], [4, '4 × 4']], s.repeat, 'rep')}</div>`}
      ${L.has('wrap') ? '' : `<div class="ctl-group"><span class="ctl-label">wrapS / wrapT</span>${seg([['clamp', 'ClampToEdgeWrapping'], ['repeat', 'RepeatWrapping']], s.wrap, 'wrap')}</div>`}
      ${L.has('cs') ? '' : `<div class="ctl-group"><span class="ctl-label">colorSpace</span>${seg([['none', tr({ ru: 'не задан', en: 'not set' })], ['srgb', 'SRGBColorSpace']], s.cs, 'cs')}</div>`}`;
  }, done, (box, s) => view.update(s));
}

export const RIGS_THREE = { tjfirst, tjcam, tjgraph, tjlight, tjtex };

/** Three.js, начальный уровень, раздел 1, урок 2: сцена, камера, рендерер. */
export default {
  id: 'tj.u1.l2',
  title: 'Первая сцена',
  sub: 'Scene, PerspectiveCamera, WebGLRenderer и Mesh',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Минимальная программа',
      body: '<p>Создаём сцену, камеру и рендерер, делаем кубик, кладём его в сцену и просим рендерер нарисовать.</p>',
      code: "const scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);\ncamera.position.z = 5;\n\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(w, h);\ndocument.body.appendChild(renderer.domElement);\n\nconst cube = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshNormalMaterial());\nscene.add(cube);\n\nrenderer.render(scene, camera);"
    },
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Экран пустой. Включай строки кода, пока кубик не появится. Сверху — настоящий Three.js.',
      lock: ['loop'],
      goal: { visible: true },
      solve: ['add', 'camz:5', 'render']
    },
    {
      t: 'choice',
      q: 'Почему при camera.position.z = 0 кубика не видно?',
      options: ['Камера внутри кубика: изнутри грани повёрнуты от нас и не рисуются', 'z = 0 запрещено', 'Камера смотрит вверх'],
      answer: 0,
      explain: 'И камера, и кубик по умолчанию стоят в точке (0, 0, 0). Камеру отодвигают назад.'
    },
    {
      t: 'learn',
      title: 'Куда смотрит камера',
      body: '<p>По умолчанию камера стоит в начале координат и смотрит вдоль оси <b>−Z</b> — «в экран». Поэтому её отодвигают по +Z: <code>camera.position.z = 5</code>. Ось Y — вверх, X — вправо.</p>'
    },
    {
      t: 'order',
      q: 'Расставь шаги',
      items: ['Создать сцену', 'Создать камеру и отодвинуть её', 'Создать рендерер и добавить холст на страницу', 'Создать Mesh и положить в сцену', 'renderer.render(scene, camera)'],
      explain: 'Порядок создания не так важен, как то, чтобы render вызывался после того, как всё готово.'
    },
    {
      t: 'tapline',
      q: 'Из-за какой строки кубик не появится?',
      code: 'const cube = new THREE.Mesh(geometry, material);\ncube.position.x = 1;\nrenderer.render(scene, camera);',
      answer: 0,
      explain: 'Кубик создан, но не добавлен в сцену: нет scene.add(cube). Рендерер рисует только сцену.'
    },
    {
      t: 'blanks',
      q: 'Mesh из геометрии и материала',
      code: 'const box = new THREE.___(\n  new THREE.___(1, 1, 1),\n  new THREE.MeshNormalMaterial());',
      tiles: ['Mesh', 'BoxGeometry', 'Cube', 'Box', 'Object3D'],
      answer: ['Mesh', 'BoxGeometry'],
      explain: 'Класса Cube в Three.js нет — кубик это Mesh с BoxGeometry.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['BoxGeometry', 'Форма: коробка'],
        ['MeshNormalMaterial', 'Красит по направлению граней, свет не нужен'],
        ['renderer.domElement', 'Холст canvas для страницы'],
        ['scene.add', 'Положить объект в мир']
      ]
    },
    {
      t: 'choice',
      q: 'Куда по умолчанию смотрит камера Three.js?',
      options: ['Вдоль −Z, в экран', 'Вдоль +Y, вверх', 'Вдоль +X, вправо'],
      answer: 0,
      explain: 'Чтобы посмотреть на точку, есть camera.lookAt(x, y, z).'
    }
  ]
};

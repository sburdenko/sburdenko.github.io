/** Three.js, начальный уровень, раздел 2, урок 2: near, far, lookAt и OrbitControls. */
export default {
  id: 'tj.u2.l2',
  title: 'near, lookAt и OrbitControls',
  sub: 'Как не обрезать близкое и как дать покрутить сцену',
  minutes: 7,
  cards: [
    {
      t: 'rig', rig: 'tjcam',
      task: 'Красный кубик рядом с камерой, но его не видно. Почини.',
      start: { near: 5, z: 3 }, lock: ['fov', 'far'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['near:0.1']
    },
    {
      t: 'learn',
      title: 'Почему не ставят near = 0.000001',
      body: '<p>Глубина каждого пикселя хранится с ограниченной точностью, и почти вся она уходит на область рядом с near. Слишком маленький near — и далёкие поверхности начинают мерцать, просвечивая друг через друга. Это <b>z-fighting</b>.</p><p>Правило: near — как можно больше, far — как можно меньше, лишь бы сцена влезала.</p>'
    },
    {
      t: 'choice',
      q: 'Далёкие стены мерцают и «пробиваются» друг через друга. Что проверить первым?',
      options: ['Не слишком ли маленький near (и большой far)', 'Цвет стен', 'Частоту кадров'],
      answer: 0,
      explain: 'Классическая причина z-fighting — near = 0.0001 при far = 100000.'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'Нужно, чтобы синий кубик НЕ рисовался (он фон и только мешает), а красный и зелёный — да.',
      lock: ['fov', 'z'],
      goal: { see: ['a', 'b'], hide: ['c'] },
      solve: ['far:10']
    },
    {
      t: 'learn',
      title: 'lookAt',
      body: '<p>Камеру можно поставить куда угодно и повернуть на точку: <code>camera.lookAt(x, y, z)</code>.</p>',
      code: 'camera.position.set(4, 3, 6);\ncamera.lookAt(0, 0, 0);'
    },
    {
      t: 'learn',
      title: 'OrbitControls: крути мышью',
      body: '<p>Готовое дополнение: перетаскивание вращает камеру вокруг цели, колесо приближает. С <code>enableDamping</code> движение плавное — тогда в цикле нужен <code>controls.update()</code>.</p>',
      code: "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n\nconst controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;\n\nrenderer.setAnimationLoop(() => {\n  controls.update();\n  renderer.render(scene, camera);\n});"
    },
    {
      t: 'tapline',
      q: 'Включили enableDamping, а камера дёргается. Перед какой строкой нужен controls.update()?',
      code: 'renderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});',
      answer: 2,
      explain: 'controls.update() перед render — он и делает плавное затухание.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['near слишком большой', 'Обрезан ближний объект'],
        ['far слишком маленький', 'Обрезан дальний объект'],
        ['near крошечный', 'Мерцание z-fighting'],
        ['lookAt', 'Повернуть камеру на точку']
      ]
    },
    {
      t: 'blanks',
      q: 'Откуда импортировать OrbitControls',
      code: "import { OrbitControls } from 'three/___/controls/OrbitControls.js';",
      tiles: ['addons', 'examples', 'src', 'controls'],
      answer: ['addons'],
      explain: 'three/addons/ — короткий путь к примерам и дополнениям из пакета three.'
    }
  ]
};

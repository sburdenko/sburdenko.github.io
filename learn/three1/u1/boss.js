/** Финал раздела 1: первая сцена. */
export default {
  id: 'tj.u1.boss',
  title: 'Финал: первая сцена',
  sub: 'От пустого холста до вращения',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Собери вращающийся кубик с нуля.',
      goal: { visible: true, spin: true },
      solve: ['add', 'camz:5', 'loop']
    },
    {
      t: 'tapline',
      q: 'После какой строки забыли добавить холст на страницу?',
      code: "const renderer = new THREE.WebGLRenderer();\nrenderer.setSize(800, 600);\nscene.add(cube);\nrenderer.render(scene, camera);",
      answer: 1,
      explain: 'Холст renderer.domElement не добавлен на страницу: document.body.appendChild(renderer.domElement).'
    },
    {
      t: 'multi',
      q: 'Почему экран может быть пустым? Отметь все.',
      options: ['Mesh не добавлен в сцену', 'Камера внутри объекта', 'Не вызван render', 'Камера отодвинута по +Z'],
      answer: [0, 1, 2],
      explain: 'Отодвинуть камеру по +Z — как раз правильно.'
    },
    {
      t: 'choice',
      q: 'Что делает cube.rotation.y += 1.5 * dt?',
      options: ['Поворачивает на 1,5 радиана в секунду при любой частоте кадров', 'Поворачивает на 1,5 градуса за кадр', 'Двигает кубик вверх'],
      answer: 0,
      explain: 'Радианы, а не градусы. Полный оборот — 2π ≈ 6,28.'
    },
    {
      t: 'order',
      q: 'Обработчик resize',
      items: ['camera.aspect = w / h', 'camera.updateProjectionMatrix()', 'renderer.setSize(w, h)'],
      explain: 'Сначала камера, потом холст.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['WebGL', 'Доступ к видеокарте из браузера'],
        ['Three.js', 'Удобная библиотека поверх него'],
        ['Mesh', 'Видимый объект'],
        ['−Z', 'Куда смотрит камера']
      ]
    },
    {
      t: 'blanks',
      q: 'Вращение в цикле',
      code: 'renderer.___(() => {\n  cube.rotation.y += 0.01;\n  renderer.___(scene, camera);\n});',
      tiles: ['setAnimationLoop', 'render', 'loop', 'draw', 'update'],
      answer: ['setAnimationLoop', 'render'],
      explain: 'Без render внутри цикла сцена менялась бы, но кадры не рисовались.'
    },
    {
      t: 'choice',
      q: 'Что рисует renderer.render(scene, camera)?',
      options: ['Один кадр: сцену глазами этой камеры', 'Бесконечную анимацию', 'Только камеру'],
      answer: 0,
      explain: 'Для анимации render вызывают в каждом кадре.'
    }
  ]
};

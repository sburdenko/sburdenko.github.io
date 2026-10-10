/** Three.js, начальный уровень, раздел 1, урок 3: анимация и размер окна. */
export default {
  id: 'tj.u1.l3',
  title: 'Анимация и размер окна',
  sub: 'setAnimationLoop, время кадра и resize',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Картинка рисуется один раз',
      body: '<p><code>renderer.render</code> рисует один кадр. Чтобы что-то двигалось, кадры нужно рисовать постоянно — около 60 раз в секунду, и между ними менять сцену.</p>',
      code: 'renderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});'
    },
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Кубик стоит. Заставь его вращаться.',
      start: { added: true, camZ: 5, render: true }, lock: ['add', 'camz'],
      goal: { visible: true, spin: true },
      solve: ['loop']
    },
    {
      t: 'choice',
      q: 'Чем setAnimationLoop лучше своего цикла while(true)?',
      options: ['Браузер вызывает функцию перед каждым кадром экрана и не замораживает страницу', 'Он быстрее рисует', 'while тоже подойдёт'],
      answer: 0,
      explain: 'Внутри это requestAnimationFrame; плюс он нужен для VR/AR-сессий.'
    },
    {
      t: 'learn',
      title: 'Скорость не должна зависеть от монитора',
      body: '<p><code>+= 0.01</code> за кадр — на мониторе 144 Гц кубик крутится вдвое быстрее, чем на 60 Гц. Правильно — умножать на время, прошедшее с прошлого кадра.</p>',
      code: 'const clock = new THREE.Clock();\nrenderer.setAnimationLoop(() => {\n  const dt = clock.getDelta();        // секунды с прошлого кадра\n  cube.rotation.y += 1.5 * dt;        // 1.5 радиана в секунду\n  renderer.render(scene, camera);\n});'
    },
    {
      t: 'choice',
      q: 'Кубик крутится вдвое быстрее у коллеги с монитором 120 Гц. Почему?',
      options: ['Поворот прибавляется за кадр, а не за секунду; у него вдвое больше кадров', 'У него быстрее видеокарта', 'Ошибка в Three.js'],
      answer: 0,
      explain: 'Умножай скорость на dt из THREE.Clock.'
    },
    {
      t: 'learn',
      title: 'Окно поменяло размер',
      body: '<p>При изменении размера окна нужно обновить и камеру, и рендерер. Иначе картинка растянется.</p>',
      code: "window.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});\nrenderer.setPixelRatio(Math.min(devicePixelRatio, 2));"
    },
    {
      t: 'tapline',
      q: 'Окно расширили — и кубик сплющился. Какой строки не хватает после этой?',
      code: "window.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  renderer.setSize(innerWidth, innerHeight);\n});",
      answer: 1,
      explain: 'После смены aspect (или fov, near, far) нужен camera.updateProjectionMatrix() — иначе камера считает по-старому.'
    },
    {
      t: 'choice',
      q: 'Зачем Math.min(devicePixelRatio, 2)?',
      options: ['На экранах с плотностью 3 картинка рисовалась бы в 9 раз больше пикселей — это тяжело для телефона', 'Без этого не работает', 'Чтобы было размыто'],
      answer: 0,
      explain: 'Плотность 2 уже выглядит чётко, а нагрузка растёт с квадратом.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['setAnimationLoop', 'Рисовать каждый кадр'],
        ['clock.getDelta()', 'Время с прошлого кадра'],
        ['updateProjectionMatrix', 'Применить новые параметры камеры'],
        ['setPixelRatio', 'Чёткость на плотных экранах']
      ]
    }
  ]
};

/** Three.js, начальный уровень, раздел 2, урок 3: OrthographicCamera. */
export default {
  id: 'tj.u2.l3',
  title: 'OrthographicCamera',
  sub: 'Камера без перспективы',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Далёкое не уменьшается',
      body: '<p>У <b>OrthographicCamera</b> нет перспективы: предмет одного размера одинаков и вблизи, и вдали. Пирамида видимости становится коробкой.</p><p>Так рисуют чертежи и CAD-виды, изометрические игры, 2D-интерфейсы поверх 3D.</p>',
      code: 'const h = 10, w = h * aspect;\nconst camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);'
    },
    {
      t: 'choice',
      q: 'Два одинаковых кубика: один в 2 метрах, другой в 20. Как они выглядят в OrthographicCamera?',
      options: ['Одинакового размера', 'Дальний в 10 раз меньше', 'Дальний не виден'],
      answer: 0,
      explain: 'Перспективное уменьшение — свойство только PerspectiveCamera.'
    },
    {
      t: 'learn',
      title: 'Шесть чисел вместо fov',
      body: '<p><b>left, right, top, bottom</b> — границы коробки в единицах сцены, <b>near, far</b> — как и раньше. Приближение — свойство <code>zoom</code> (после изменения — снова <code>updateProjectionMatrix()</code>).</p>'
    },
    {
      t: 'multi',
      q: 'Где уместна OrthographicCamera? Отметь все.',
      options: ['Чертёж детали с точными размерами', 'Изометрическая стратегия', 'Миникарта сверху', 'Шутер от первого лица'],
      answer: [0, 1, 2],
      explain: 'Для «живого» взгляда от первого лица нужна перспектива.'
    },
    {
      t: 'tapline',
      q: 'Окно расширили, картинка растянулась. Какую строку исправить в resize?',
      code: "window.addEventListener('resize', () => {\n  const w = 10 * innerWidth / innerHeight;\n  camera.left = -5; camera.right = 5;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});",
      answer: 2,
      explain: 'Границы должны зависеть от пропорций: camera.left = -w / 2; camera.right = w / 2.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['PerspectiveCamera', 'Как глаз: далёкое меньше'],
        ['OrthographicCamera', 'Как чертёж: размеры не меняются'],
        ['zoom', 'Приближение ортокамеры'],
        ['left / right', 'Ширина видимой коробки']
      ]
    },
    {
      t: 'choice',
      q: 'Что общего у обеих камер?',
      options: ['near, far и необходимость updateProjectionMatrix после изменений', 'fov', 'Перспектива'],
      answer: 0,
      explain: 'fov есть только у перспективной.'
    },
    {
      t: 'blanks',
      q: 'Приблизь ортокамеру вдвое',
      code: 'camera.___ = 2;\ncamera.___();',
      tiles: ['zoom', 'updateProjectionMatrix', 'fov', 'scale', 'update'],
      answer: ['zoom', 'updateProjectionMatrix'],
      explain: 'У ортокамеры нет fov, приближают через zoom.'
    }
  ]
};

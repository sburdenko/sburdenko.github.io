/** Финал курса «Three.js: начальный уровень». */
export default {
  id: 'tj.u5.boss',
  title: 'Финал курса',
  sub: 'Сцена от холста до модели',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Разминка: вращающийся кубик с нуля.',
      goal: { visible: true, spin: true },
      solve: ['camz:5', 'add', 'loop']
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'Красный и синий видны, зелёный — нет. Покажи все три, двигая только камеру назад.',
      start: { fov: 35, z: 3 }, lock: ['fov', 'near', 'far'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['z:10']
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Объёмный узел из Standard-материала с тенью.',
      goal: { look: 'shaded', shadow: true },
      solve: ['dir', 'sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'rig', rig: 'tjtex',
      task: 'Плитка 4×4 уже есть, но цвета бледные. Почини.',
      start: { repeat: 4, wrap: 'repeat' }, lock: ['rep', 'wrap'],
      goal: { tiles: 'tiled', colors: true },
      solve: ['cs:srgb']
    },
    {
      t: 'order',
      q: 'Порядок типичной программы',
      items: ['Сцена, камера, рендерер', 'Свет', 'Загрузка модели glTF', 'Центр и масштаб модели', 'Цикл setAnimationLoop с render'],
      explain: 'Плюс обработчик resize — в любой момент.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и лечение',
      pairs: [
        ['Пустой экран, камера в 0', 'camera.position.z = 5'],
        ['Модель чёрная', 'Добавить свет'],
        ['Бледная текстура', 'SRGBColorSpace'],
        ['Растёт память', 'dispose()']
      ]
    },
    {
      t: 'multi',
      q: 'Что берут из three/addons? Отметь все.',
      options: ['OrbitControls', 'GLTFLoader', 'DRACOLoader', 'PerspectiveCamera'],
      answer: [0, 1, 2],
      explain: 'Камеры, сцены и материалы — в самом three.'
    },
    {
      t: 'choice',
      q: 'Что дальше, на среднем уровне?',
      options: ['Карты окружения и HDR, анимации glTF, клики по объектам (Raycaster), InstancedMesh и производительность', 'Ничего, это всё', 'Только шейдеры'],
      answer: 0,
      explain: 'А шейдеры, WebGPU и TSL — на продвинутом.'
    }
  ]
};

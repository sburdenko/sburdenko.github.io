/** Three.js, начальный уровень, раздел 4, урок 2: источники света. */
export default {
  id: 'tj.u4.l2',
  title: 'Источники света',
  sub: 'Ambient, Directional, Point — кто как светит',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Четыре главных',
      body: '<p><b>AmbientLight</b> — равномерно отовсюду. Не даёт объёма, только «подсвечивает тени».<br><b>DirectionalLight</b> — как солнце: параллельные лучи из одной стороны.<br><b>PointLight</b> — лампочка: во все стороны, слабеет с расстоянием.<br><b>SpotLight</b> — прожектор: конус.</p>'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Только AmbientLight — узел плоский. Добавь лампочку, чтобы появился объём.',
      start: { amb: true }, lock: ['shadows', 'mat', 'dir'],
      goal: { look: 'shaded' },
      solve: ['pt']
    },
    {
      t: 'choice',
      q: 'Почему с одним AmbientLight форма плоская?',
      options: ['Он светит одинаково со всех сторон — нет светлых и тёмных сторон', 'Он слишком слабый', 'Он не работает со Standard'],
      answer: 0,
      explain: 'Объём глаз читает по перепадам освещённости.'
    },
    {
      t: 'learn',
      title: 'Яркость в физических единицах',
      body: '<p>С r155 свет в Three.js физически корректный. У PointLight и SpotLight <code>decay = 2</code>: яркость падает с квадратом расстояния. Поэтому лампочке с <code>intensity = 1</code> в 5 метрах от объекта почти нечего показать — ставят десятки.</p>',
      code: 'const bulb = new THREE.PointLight(0xffaa66, 25);   // цвет, интенсивность\nbulb.position.set(-2, 2, 1.5);\nscene.add(bulb);'
    },
    {
      t: 'choice',
      q: 'PointLight с intensity 1 почти не освещает объект в 5 метрах. Почему?',
      options: ['Свет слабеет с квадратом расстояния: в 5 м — в 25 раз', 'PointLight не светит дальше 1 м', 'Нужен Basic-материал'],
      answer: 0,
      explain: 'Подними intensity или поднеси лампу ближе.'
    },
    {
      t: 'learn',
      title: 'Куда светит DirectionalLight',
      body: '<p>Направленный свет светит из своей <code>position</code> в точку <code>target</code> (по умолчанию — центр мира). Двигать target можно, но его нужно добавить в сцену.</p>',
      code: 'const sun = new THREE.DirectionalLight(0xffffff, 2.5);\nsun.position.set(3, 5, 2);\nscene.add(sun);'
    },
    {
      t: 'match',
      q: 'Соедини свет и аналог',
      pairs: [
        ['DirectionalLight', 'Солнце'],
        ['PointLight', 'Лампочка'],
        ['SpotLight', 'Прожектор'],
        ['AmbientLight', 'Рассеянный свет отовсюду']
      ]
    },
    {
      t: 'multi',
      q: 'Классическая недорогая схема света? Отметь все нужные.',
      options: ['AmbientLight или HemisphereLight послабее — чтобы тени не были чёрными', 'Один DirectionalLight — главный свет', 'Десять PointLight', 'Без света, MeshBasicMaterial везде'],
      answer: [0, 1],
      explain: 'Каждый источник — дополнительная работа шейдера для каждого пикселя.'
    }
  ]
};

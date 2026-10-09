/** Three.js, начальный уровень, раздел 5, урок 1: текстуры. */
export default {
  id: 'tj.u5.l1',
  title: 'Текстуры',
  sub: 'Загрузка, sRGB, повтор',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Картинка на поверхности',
      body: '<p>Текстура — картинка, натянутая на геометрию по UV-координатам. Загружают через <code>TextureLoader</code> и кладут в свойство материала <code>map</code>.</p>',
      code: "const tex = await new THREE.TextureLoader().loadAsync('wood.jpg');\ntex.colorSpace = THREE.SRGBColorSpace;\nconst mat = new THREE.MeshStandardMaterial({ map: tex });"
    },
    {
      t: 'learn',
      title: 'Почему цвета бледные',
      body: '<p>Обычные картинки (JPG, PNG) хранят цвета в пространстве <b>sRGB</b>. Three.js считает свет в линейном пространстве. Если не сказать, что текстура — sRGB, её цвета прочитают как линейные, и они выйдут бледными, «выцветшими».</p><p>Помечают так только цветовые карты (<code>map</code>, <code>emissiveMap</code>). Карты нормалей и шероховатости — данные, их не трогают.</p>'
    },
    {
      t: 'rig', rig: 'tjtex',
      task: 'Плитка должна повториться 4×4 и иметь правильные цвета.',
      goal: { tiles: 'tiled', colors: true },
      solve: ['rep:4', 'wrap:repeat', 'cs:srgb']
    },
    {
      t: 'choice',
      q: 'repeat = 4, но вместо плитки — одна копия в углу и растянутые полосы. Что не так?',
      options: ['wrapS и wrapT в режиме ClampToEdge; для повтора нужен RepeatWrapping', 'Картинка слишком маленькая', 'Нужно repeat = 16'],
      answer: 0,
      explain: 'По умолчанию края «зажаты»: всё за пределами 0…1 берёт крайний пиксель.'
    },
    {
      t: 'multi',
      q: 'Каким текстурам нужно colorSpace = SRGBColorSpace? Отметь все.',
      options: ['map (цвет)', 'emissiveMap (свечение)', 'normalMap', 'roughnessMap'],
      answer: [0, 1],
      explain: 'Нормали и шероховатость — числа, а не цвета.'
    },
    {
      t: 'blanks',
      q: 'Плитка 8×8',
      code: 'tex.wrapS = tex.wrapT = THREE.___;\ntex.repeat.set(___, 8);',
      tiles: ['RepeatWrapping', '8', 'ClampToEdgeWrapping', '4', 'MirroredRepeatWrapping'],
      answer: ['RepeatWrapping', '8'],
      explain: 'MirroredRepeatWrapping тоже повторяет, но через раз отражает.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['TextureLoader', 'Загружает картинку'],
        ['map', 'Цвет поверхности'],
        ['SRGBColorSpace', 'Цвета не бледные'],
        ['RepeatWrapping', 'Повтор плиткой']
      ]
    },
    {
      t: 'choice',
      q: 'Поменял wrapS у уже показанной текстуры — ничего не изменилось. Что сделать?',
      options: ['tex.needsUpdate = true', 'Перезагрузить страницу', 'Создать новый материал'],
      answer: 0,
      explain: 'Некоторые параметры текстуры применяются только при загрузке в видеокарту.'
    }
  ]
};

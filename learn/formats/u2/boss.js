/** Финал раздела 2 курса «3D-форматы»: меш-форматы. */
export default {
  id: 'f3d.u2.boss',
  title: 'Финал: меш-форматы',
  sub: 'OBJ, STL, PLY, glTF, FBX, USD — проверь себя',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'convert',
      task: 'Персонажа нужно передать между программами без потерь, но формат должен быть открытым стандартом. Найди его.',
      assetName: 'анимированный персонаж',
      asset: ['geometry', 'normals', 'uv', 'pbr', 'hierarchy', 'skin', 'morph'],
      goal: { kind: 'keep', not: ['fbx'] },
      solve: ['fmt:gltf']
    },
    {
      t: 'choice',
      q: 'Какой формат хранит только треугольники без цвета и единиц?',
      options: ['STL', 'PLY', 'glTF', 'USD'],
      answer: 0,
      explain: 'Минимализм STL — и сила, и слабость.'
    },
    {
      t: 'tapline',
      q: 'Какая строка заголовка PLY объявляет цвет?',
      code: 'ply\nformat ascii 1.0\nelement vertex 8\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nend_header',
      lang: 'plain',
      answer: 6,
      explain: 'property uchar red — красная компонента цвета вершины.'
    },
    {
      t: 'choice',
      q: 'Чем GLB отличается от .gltf?',
      options: ['Всё упаковано в один бинарный файл', 'Другие материалы', 'GLB — устаревшая версия'],
      answer: 0,
      explain: 'Содержание одно и то же, упаковка разная.'
    },
    {
      t: 'choice',
      q: 'В USD слой A выше слоя B. Оба задают цвет. Чей цвет победит?',
      options: ['Слоя A', 'Слоя B', 'Смешаются'],
      answer: 0,
      explain: 'Выше — сильнее.'
    },
    {
      t: 'multi',
      q: 'Что не умеет OBJ? Отметь все.',
      options: ['Иерархию с трансформациями', 'Скелетную анимацию', 'Единицы измерения', 'UV-координаты'],
      answer: [0, 1, 2],
      explain: 'UV в OBJ есть: строки vt.'
    },
    {
      t: 'rig', rig: 'usd',
      task: 'Красный барный стул без правки chair.usda.',
      goal: { color: 'red', legs: 3 },
      solve: ['layer:shot', 'var:bar']
    },
    {
      t: 'choice',
      q: 'Почему FBX — стандарт для анимации, но не для веба?',
      options: ['Он закрытый и рассчитан на обмен между программами, а не на быструю доставку к экрану', 'Он не умеет анимацию', 'Он текстовый'],
      answer: 0,
      explain: 'Для веба есть glTF: открытый и готовый к рендеру.'
    },
    {
      t: 'choice',
      q: 'Какой формат почти вытеснен glTF?',
      options: ['DAE (Collada)', 'STL', 'USD', 'PLY'],
      answer: 0,
      explain: 'Оба от Khronos, glTF решает ту же задачу проще и быстрее.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['OBJ', 'Текст: v, vt, vn, f'],
        ['STL', 'Треугольники для печати'],
        ['PLY', 'Сканы и облака точек'],
        ['USDZ', 'AR на iPhone']
      ]
    }
  ]
};

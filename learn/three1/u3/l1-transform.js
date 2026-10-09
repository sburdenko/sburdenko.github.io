/** Three.js, начальный уровень, раздел 3, урок 1: position, rotation, scale. */
export default {
  id: 'tj.u3.l1',
  title: 'position, rotation, scale',
  sub: 'Где объект, как повёрнут и какого размера',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Три свойства любого объекта',
      body: '<p>У каждого объекта сцены (Mesh, камера, свет, группа) есть:</p><p><b>position</b> — где он: x, y, z.<br><b>rotation</b> — поворот вокруг осей X, Y, Z <b>в радианах</b>.<br><b>scale</b> — масштаб по осям, 1 — исходный размер.</p>',
      code: 'cube.position.set(2, 0.5, 0);\ncube.rotation.y = Math.PI / 4;     // 45°\ncube.scale.set(1, 2, 1);           // вдвое выше'
    },
    {
      t: 'choice',
      q: 'cube.rotation.y = 90 — на сколько повернётся кубик?',
      options: ['На 90 радиан — это больше 14 оборотов, а не 90°', 'На 90°', 'Не повернётся'],
      answer: 0,
      explain: 'Нужно Math.PI / 2 или THREE.MathUtils.degToRad(90).'
    },
    {
      t: 'blanks',
      q: 'Поверни на 180° вокруг Y',
      code: 'mesh.rotation.y = Math.___;',
      tiles: ['PI', 'PI / 2', '180', 'TAU'],
      answer: ['PI'],
      explain: 'π радиан = 180°.'
    },
    {
      t: 'learn',
      title: 'Оси в Three.js',
      body: '<p><b>Y — вверх</b>, X — вправо, Z — к зрителю. Это правая система координат, как в glTF. В Blender и многих CAD вверх смотрит Z — поэтому модели при импорте бывают «лёжа».</p>'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['position.y = 2', 'Поднять на 2'],
        ['rotation.y = Math.PI / 2', 'Повернуть на 90° вокруг вертикали'],
        ['scale.setScalar(0.5)', 'Уменьшить вдвое'],
        ['scale.x = -1', 'Зеркально отразить']
      ]
    },
    {
      t: 'choice',
      q: 'Модель из Blender лежит на боку. Вероятная причина?',
      options: ['В Blender вверх смотрит Z, а в Three.js — Y', 'Модель сломана', 'Камера повёрнута'],
      answer: 0,
      explain: 'Экспортёр glTF из Blender обычно сам переводит оси (+Y Up) — проверь эту галочку.'
    },
    {
      t: 'multi',
      q: 'У каких объектов есть position, rotation и scale? Отметь все.',
      options: ['Mesh', 'Камера', 'Источник света', 'Group', 'Материал'],
      answer: [0, 1, 2, 3],
      explain: 'Всё это потомки Object3D. Материал — не объект сцены.'
    },
    {
      t: 'choice',
      q: 'Что вернёт THREE.MathUtils.degToRad(180)?',
      options: ['≈ 3.1416', '180', '0.5'],
      answer: 0,
      explain: 'π.'
    }
  ]
};

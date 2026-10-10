/** Финал раздела 3: объекты и иерархия. */
export default {
  id: 'tj.u3.boss',
  title: 'Финал: объекты в сцене',
  sub: 'Трансформации и иерархия',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjgraph',
      task: 'Земля вдвое больше, Луна пусть летит рядом на расстоянии 2,4. Три шага орбиты.',
      goal: { orbits: 3, dist: 2.4 },
      solve: ['parent:earth', 'scale', 'orbit', 'orbit', 'orbit']
    },
    {
      t: 'choice',
      q: 'Что напишешь, чтобы повернуть на 30°?',
      options: ['rotation.y = THREE.MathUtils.degToRad(30)', 'rotation.y = 30', 'rotation.y = 30 * 180 / Math.PI'],
      answer: 0,
      explain: 'Третий вариант переводит в обратную сторону.'
    },
    {
      t: 'tapline',
      q: 'Колесо машины должно крутиться вместе с машиной при повороте. Какая строка мешает?',
      code: 'const car = new THREE.Group();\ncar.add(body);\nscene.add(wheel);\ncar.rotation.y = Math.PI / 6;',
      answer: 2,
      explain: 'Колесо лежит в сцене, а не в машине: нужно car.add(wheel).'
    },
    {
      t: 'blanks',
      q: 'Сделай Луну спутником Земли',
      code: 'earth.___(moon);\nmoon.position.x = 1.2;',
      tiles: ['add', 'attach', 'push', 'set'],
      answer: ['add'],
      explain: 'attach тоже существует: он сохраняет мировую позицию при смене родителя. Здесь — add.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['Ось вверх в Three.js', 'Y'],
        ['Ось вверх в Blender', 'Z'],
        ['Единица угла', 'Радиан'],
        ['Невидимый держатель', 'Group']
      ]
    },
    {
      t: 'multi',
      q: 'Что правда? Отметь все.',
      options: ['Позиция ребёнка считается от родителя', 'Масштаб родителя растягивает и расстояния до детей', 'getWorldPosition даёт мировые координаты', 'У сцены нет position'],
      answer: [0, 1, 2],
      explain: 'Scene тоже Object3D — у неё position есть.'
    },
    {
      t: 'choice',
      q: 'Как сделать солнечную систему, где Земля летит по кругу?',
      options: ['Положить Землю в Group в центре на расстоянии 4 и крутить группу', 'Каждый кадр вручную задавать x и z через sin и cos — единственный способ', 'Крутить саму Землю'],
      answer: 0,
      explain: 'Через sin/cos тоже можно, но с группой проще, и дети Земли полетят вместе.'
    },
    {
      t: 'rig', rig: 'tjgraph',
      task: 'Почини систему: Луна остаётся на месте, пока Земля улетает. Два шага орбиты.',
      lock: ['scale'],
      goal: { orbits: 2, dist: 1.2 },
      solve: ['parent:earth', 'orbit', 'orbit']
    }
  ]
};

/** Three.js, начальный уровень, раздел 4, урок 1: материалы. */
export default {
  id: 'tj.u4.l1',
  title: 'Материалы',
  sub: 'Basic, Lambert, Standard — и почему всё чёрное',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Материал — как выглядит поверхность',
      body: '<p><b>MeshBasicMaterial</b> — просто заливка, свет игнорирует.<br><b>MeshLambertMaterial</b> — матовый, дешёвый, реагирует на свет.<br><b>MeshStandardMaterial</b> — физически корректный (PBR): <code>roughness</code> (шероховатость) и <code>metalness</code> (металличность). Стандарт де-факто, как в glTF.</p>'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'MeshStandardMaterial — а на экране только чёрный силуэт. Почини светом.',
      lock: ['shadows', 'mat'],
      goal: { look: 'shaded' },
      solve: ['dir']
    },
    {
      t: 'choice',
      q: 'Почему без света MeshStandardMaterial чёрный?',
      options: ['Он считает, сколько света отражает поверхность; нет света — нечего отражать', 'Это ошибка', 'Чёрный — цвет по умолчанию'],
      answer: 0,
      explain: 'Самая частая ошибка новичка: «ничего не видно» при правильной камере.'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Свет есть, а узел плоский, без объёма. Поменяй материал.',
      start: { mat: 'basic', dir: true }, lock: ['shadows'],
      goal: { look: 'shaded' },
      solve: ['mat:standard']
    },
    {
      t: 'learn',
      title: 'roughness и metalness',
      body: '<p><b>roughness</b> 0 — зеркально гладкий, 1 — матовый (по умолчанию 1).<br><b>metalness</b> 0 — пластик, дерево, камень; 1 — металл.</p><p>Металлу нужно, что отражать: без карты окружения (<code>scene.environment</code>) металл выглядит тёмным. Это тема среднего уровня.</p>',
      code: 'new THREE.MeshStandardMaterial({ color: 0x4f9dff, roughness: 0.3, metalness: 0 });'
    },
    {
      t: 'match',
      q: 'Соедини материал и случай',
      pairs: [
        ['MeshBasicMaterial', 'Свет не нужен: интерфейс, отладка'],
        ['MeshLambertMaterial', 'Дёшево и матово'],
        ['MeshStandardMaterial', 'Реалистично, PBR'],
        ['MeshNormalMaterial', 'Проверить нормали и форму']
      ]
    },
    {
      t: 'multi',
      q: 'Какие материалы реагируют на свет? Отметь все.',
      options: ['MeshLambertMaterial', 'MeshStandardMaterial', 'MeshPhysicalMaterial', 'MeshBasicMaterial'],
      answer: [0, 1, 2],
      explain: 'Physical — расширенный Standard: лак, стекло, ткань.'
    },
    {
      t: 'blanks',
      q: 'Матовый пластик',
      code: 'new THREE.MeshStandardMaterial({ color: 0xff0000, ___: 0.9, ___: 0 });',
      tiles: ['roughness', 'metalness', 'shininess', 'opacity'],
      answer: ['roughness', 'metalness'],
      explain: 'shininess — у Phong, не у Standard.'
    }
  ]
};

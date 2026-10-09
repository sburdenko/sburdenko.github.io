/** Финал раздела 4: свет и материалы. */
export default {
  id: 'tj.u4.boss',
  title: 'Финал: свет и материалы',
  sub: 'Объём и тени',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjlight',
      task: 'С нуля: объёмный узел с тенью на полу, материал — Lambert.',
      start: { mat: 'basic' },
      goal: { look: 'shaded', shadow: true },
      solve: ['mat:lambert', 'dir', 'sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'choice',
      q: 'Сцена правильная, камера смотрит на модель, но экран чёрный. Модель с MeshStandardMaterial. Первая догадка?',
      options: ['Нет источников света', 'Камера сломана', 'Нужен WebGPU'],
      answer: 0,
      explain: 'Временно поставь MeshNormalMaterial или добавь AmbientLight — и проверь.'
    },
    {
      t: 'tapline',
      q: 'Какая строка лишняя для тени от узла?',
      code: 'renderer.shadowMap.enabled = true;\nsun.castShadow = true;\nambient.castShadow = true;\nknot.castShadow = true;\nfloor.receiveShadow = true;',
      answer: 2,
      explain: 'AmbientLight теней не отбрасывает — у него нет направления.'
    },
    {
      t: 'match',
      q: 'Соедини симптом и причину',
      pairs: [
        ['Всё чёрное', 'Нет света для Standard'],
        ['Нет объёма', 'Только Ambient или Basic-материал'],
        ['Нет тени', 'Не хватает одного из четырёх флагов'],
        ['Лампа не светит издалека', 'Затухание с квадратом расстояния']
      ]
    },
    {
      t: 'multi',
      q: 'Что делает сцену тяжелее для видеокарты? Отметь все.',
      options: ['Много источников света', 'Тени от PointLight', 'Большой shadow.mapSize', 'MeshBasicMaterial'],
      answer: [0, 1, 2],
      explain: 'Basic — самый дешёвый материал.'
    },
    {
      t: 'blanks',
      q: 'Металлическая гладкая поверхность',
      code: '{ metalness: ___, roughness: ___ }',
      tiles: ['1', '0.1', '0', '5'],
      answer: ['1', '0.1'],
      explain: 'И не забудь карту окружения — металлу нужно что-то отражать.'
    },
    {
      t: 'choice',
      q: 'Чем MeshStandardMaterial лучше Lambert?',
      options: ['Физически корректный: блики, шероховатость, металл; совпадает с материалами glTF', 'Он дешевле', 'Он не требует света'],
      answer: 0,
      explain: 'Lambert — когда нужно дёшево и без бликов.'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Только рассеянный свет: узел плоский. Сделай его объёмным, не трогая материал.',
      start: { amb: true }, lock: ['mat', 'shadows'],
      goal: { look: 'shaded' },
      solve: ['dir']
    }
  ]
};

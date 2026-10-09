/** Three.js, начальный уровень, раздел 4, урок 3: тени. */
export default {
  id: 'tj.u4.l3',
  title: 'Тени',
  sub: 'Четыре флага и одна карта теней',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Тени выключены по умолчанию',
      body: '<p>Тени стоят дорого, поэтому Three.js рисует их только если явно попросить. Нужны <b>все четыре</b> настройки:</p>',
      code: 'renderer.shadowMap.enabled = true;   // рендерер умеет тени\nsun.castShadow = true;               // свет отбрасывает тени\nknot.castShadow = true;              // объект отбрасывает\nfloor.receiveShadow = true;          // пол принимает'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Солнце светит, а тени на полу нет. Включи всё, что нужно.',
      start: { amb: true, dir: true }, lock: ['mat'],
      goal: { look: 'shaded', shadow: true },
      solve: ['sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'choice',
      q: 'Включили castShadow у объекта и у света, receiveShadow у пола — тени нет. Что забыли?',
      options: ['renderer.shadowMap.enabled = true', 'scene.shadow = true', 'Тени работают только с OrthographicCamera'],
      answer: 0,
      explain: 'Без него рендерер вообще не строит карту теней.'
    },
    {
      t: 'learn',
      title: 'Как это работает',
      body: '<p>Свет «фотографирует» сцену со своей стороны в текстуру глубины — <b>карту теней</b>. Потом для каждого пикселя проверяется: виден ли он из света? Если нет — он в тени.</p><p>Размер карты — <code>light.shadow.mapSize</code> (по умолчанию 512×512). Больше — чётче, но дороже.</p>'
    },
    {
      t: 'choice',
      q: 'Тени лесенкой и размытые. Что первое попробовать?',
      options: ['Увеличить light.shadow.mapSize и сузить область теневой камеры', 'Больше источников света', 'Выключить antialias'],
      answer: 0,
      explain: 'У DirectionalLight тени снимает ортокамера light.shadow.camera — чем меньше её коробка, тем чётче.'
    },
    {
      t: 'multi',
      q: 'Какие источники могут отбрасывать тени? Отметь все.',
      options: ['DirectionalLight', 'PointLight', 'SpotLight', 'AmbientLight'],
      answer: [0, 1, 2],
      explain: 'Ambient светит отовсюду — у него нет стороны, откуда отбрасывать тень. PointLight рисует шесть карт — это дорого.'
    },
    {
      t: 'match',
      q: 'Соедини флаг и смысл',
      pairs: [
        ['shadowMap.enabled', 'Рендерер умеет тени'],
        ['light.castShadow', 'Свет строит карту теней'],
        ['mesh.castShadow', 'Объект отбрасывает тень'],
        ['mesh.receiveShadow', 'На объект ложатся тени']
      ]
    },
    {
      t: 'blanks',
      q: 'Пол принимает тени',
      code: 'floor.___ = true;',
      tiles: ['receiveShadow', 'castShadow', 'shadow', 'shadowMap'],
      answer: ['receiveShadow'],
      explain: 'Объект может и отбрасывать, и принимать — оба флага сразу.'
    }
  ]
};

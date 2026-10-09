/** Three.js, начальный уровень, раздел 5, урок 2: загрузка моделей и уборка. */
export default {
  id: 'tj.u5.l2',
  title: 'Модели glTF и уборка',
  sub: 'GLTFLoader, масштаб, центр и dispose',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'glTF — «JPEG для 3D»',
      body: '<p>Готовые модели в Three.js почти всегда грузят в формате <b>glTF</b> (.gltf или бинарный .glb): геометрия, PBR-материалы, текстуры и анимации в одном файле. Про сам формат — в курсе «3D-форматы».</p>',
      code: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';\n\nconst gltf = await new GLTFLoader().loadAsync('chair.glb');\nscene.add(gltf.scene);"
    },
    {
      t: 'choice',
      q: 'Что добавляют в сцену после загрузки?',
      options: ['gltf.scene — группу со всеми объектами модели', 'gltf целиком', 'gltf.meshes[0]'],
      answer: 0,
      explain: 'В gltf ещё есть animations, cameras и asset — их берут отдельно.'
    },
    {
      t: 'learn',
      title: 'Модель огромная или где-то сбоку',
      body: '<p>Модели приходят в разных масштабах и с центром где угодно. Габаритная коробка <code>Box3</code> помогает поставить модель на место.</p>',
      code: 'const box = new THREE.Box3().setFromObject(gltf.scene);\nconst size = box.getSize(new THREE.Vector3());\nconst center = box.getCenter(new THREE.Vector3());\ngltf.scene.position.sub(center);              // в центр мира\ngltf.scene.scale.setScalar(2 / Math.max(size.x, size.y, size.z));'
    },
    {
      t: 'order',
      q: 'Расставь шаги показа модели',
      items: ['Загрузить через GLTFLoader', 'Посчитать Box3 модели', 'Сдвинуть к центру и подогнать масштаб', 'Добавить gltf.scene в сцену', 'Поставить свет и камеру'],
      explain: 'Без света PBR-материалы glTF будут чёрными.'
    },
    {
      t: 'learn',
      title: 'Сжатые модели',
      body: '<p>Тяжёлую геометрию сжимают Draco или meshopt — файл меньше в разы. Загрузчику нужен декодер:</p>',
      code: "import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';\n\nconst draco = new DRACOLoader().setDecoderPath('/draco/');\nconst loader = new GLTFLoader().setDRACOLoader(draco);"
    },
    {
      t: 'learn',
      title: 'Убрал из сцены ≠ освободил память',
      body: '<p><code>scene.remove(model)</code> только убирает объект из сцены. Геометрия, материалы и текстуры остаются в памяти видеокарты, пока не вызвать <code>dispose()</code>. Проверить утечку помогает <code>renderer.info.memory</code>.</p>',
      code: 'model.traverse(o => {\n  if (o.isMesh) {\n    o.geometry.dispose();\n    o.material.map?.dispose();\n    o.material.dispose();\n  }\n});\nscene.remove(model);'
    },
    {
      t: 'choice',
      q: 'Конфигуратор меняет модели, и через час вкладка падает. renderer.info.memory.geometries всё растёт. Что не так?',
      options: ['Старые модели убирают из сцены, но не вызывают dispose', 'Слишком много света', 'Нужен больший far'],
      answer: 0,
      explain: 'Сборщик мусора JavaScript не освобождает память видеокарты.'
    },
    {
      t: 'tapline',
      q: 'Где утечка памяти?',
      code: 'function swap(next) {\n  scene.remove(current);\n  scene.add(next);\n  current = next;\n}',
      answer: 1,
      explain: 'Убрали current, но не освободили его геометрию, материалы и текстуры.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['GLTFLoader', 'Загрузить .glb'],
        ['Box3', 'Габариты модели'],
        ['DRACOLoader', 'Распаковать сжатую геометрию'],
        ['dispose()', 'Освободить память видеокарты']
      ]
    }
  ]
};

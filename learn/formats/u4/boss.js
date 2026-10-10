/** Финал раздела 4 курса «3D-форматы»: BIM. */
export default {
  id: 'f3d.u4.boss',
  title: 'Финал: умное здание',
  sub: 'IFC, координация и BCF — проверь себя',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'bim',
      task: 'Отфильтруй окна второго этажа.',
      goal: { kind: 'filter', type: 'IfcWindow', storey: 2 },
      solve: ['type:IfcWindow', 'storey:2']
    },
    {
      t: 'choice',
      q: 'Чем IFC отличается от GLB с той же геометрией?',
      options: ['В IFC у объектов есть тип, этаж, свойства и связи', 'IFC меньше весит', 'Ничем'],
      answer: 0,
      explain: 'GLB знает, как выглядит. IFC знает, что это такое.'
    },
    {
      t: 'rig', rig: 'clash',
      task: 'Найди все коллизии с зазором 150 мм.',
      goal: { kind: 'count', tol: 150, n: 4 },
      solve: ['tol:150', 'run']
    },
    {
      t: 'tapline',
      q: 'Какая строка — сама стена?',
      code: "#140=IFCPROPERTYSINGLEVALUE('FireRating',$,IFCLABEL('REI 90'),$);\n#120=IFCWALL('2O2Fr$t4X7Zf8NOew3FLOH',#5,'Exterior wall 300',$,$,#121,#130,$,.STANDARD.);\n#130=IFCPRODUCTDEFINITIONSHAPE($,$,(#131));",
      lang: 'plain',
      answer: 1,
      explain: 'IFCWALL с GlobalId. #130 — её геометрия, #140 — свойство.'
    },
    {
      t: 'choice',
      q: 'Почему IFC открывается и в Revit, и в Archicad?',
      options: ['Это открытый стандарт ISO 16739', 'Это формат Autodesk', 'Он хранит только треугольники'],
      answer: 0,
      explain: 'IFC придумали именно для обмена между разными программами.'
    },
    {
      t: 'multi',
      q: 'Что из этого — родные закрытые форматы? Отметь все.',
      options: ['RVT', 'PLN', 'NWD', 'IFC', 'BCF'],
      answer: [0, 1, 2],
      explain: 'IFC и BCF — открытые стандарты buildingSMART.'
    },
    {
      t: 'choice',
      q: 'Координатор хочет передать инженеру «вот тут труба в балке». Что отправить?',
      options: ['BCF-замечание с камерой и GlobalId', 'Всю модель в RVT', 'Скриншот в мессенджер без ссылок на элементы'],
      answer: 0,
      explain: 'BCF откроет у инженера ровно тот вид и выделит нужные элементы.'
    },
    {
      t: 'order',
      q: 'Пространственная структура IFC',
      items: ['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey'],
      explain: 'Сверху вниз.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['IFC', 'Открытая BIM-модель'],
        ['BCF', 'Задачи по модели'],
        ['NWD', 'Сводная модель Navisworks'],
        ['GlobalId', 'Как найти объект в любой программе']
      ]
    }
  ]
};

/** 3D, раздел 4, урок 2: IFC изнутри. */
const IFC = "#120=IFCWALL('2O2Fr$t4X7Zf8NOew3FLOH',#5,'Exterior wall 300',$,$,#121,#130,$,.STANDARD.);\n#140=IFCPROPERTYSINGLEVALUE('FireRating',$,IFCLABEL('REI 90'),$);\n#141=IFCPROPERTYSET('3xYz…',#5,'Pset_WallCommon',$,(#140));\n#150=IFCRELDEFINESBYPROPERTIES('1aBc…',#5,$,$,(#120),#141);";

export default {
  id: 'f3d.u4.l2',
  title: 'IFC изнутри',
  sub: 'Дерево здания, свойства и GlobalId',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'IFC — открытый стандарт buildingSMART',
      body: '<p><b>IFC</b> (Industry Foundation Classes) поддерживает организация buildingSMART, это стандарт ISO 16739.</p><p>Самые распространённые версии — IFC2x3 и IFC4. IFC4.3 добавил инфраструктуру: дороги, мосты, железные дороги.</p>'
    },
    {
      t: 'learn',
      title: 'Дерево здания',
      body: '<p>Всё лежит в пространственной структуре: <b>IfcProject</b> → <b>IfcSite</b> (участок) → <b>IfcBuilding</b> → <b>IfcBuildingStorey</b> (этаж) → элементы: IfcWall, IfcDoor, IfcWindow, IfcSlab.</p><p>Свойства собраны в наборы (property sets). Например, Pset_WallCommon: FireRating, IsExternal, LoadBearing.</p>'
    },
    {
      t: 'rig', rig: 'bim',
      task: 'Отфильтруй двери второго этажа.',
      goal: { kind: 'filter', type: 'IfcDoor', storey: 2 },
      solve: ['type:IfcDoor', 'storey:2']
    },
    {
      t: 'choice',
      q: 'Сколько дверей на втором этаже?',
      options: ['3', '2', '5', '1'],
      answer: 0,
      explain: 'Две межкомнатные и одна на балкон.'
    },
    {
      t: 'rig', rig: 'bim',
      task: 'Найди все стены, у которых указан предел огнестойкости, и открой свойства одной из них.',
      goal: { kind: 'sel', type: 'IfcWall' },
      solve: ['type:IfcWall', 'fire', 'sel:2O2Fr$t4X7Zf8NOew3FLOH']
    },
    {
      t: 'order',
      q: 'Расставь пространственную структуру IFC сверху вниз',
      items: ['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey', 'IfcWall'],
      explain: 'Проект → участок → здание → этаж → элемент.'
    },
    {
      t: 'learn',
      title: 'Файл .ifc — это STEP',
      body: '<p>Самая частая кодировка IFC — тот же текстовый формат ISO 10303-21, что и у STEP из машиностроения. Строки с номерами, которые ссылаются друг на друга.</p>',
      code: IFC,
      lang: 'plain',
      deep: 'GlobalId — 128-битный GUID, записанный 22 символами в особом base64-алфавите. По нему объект узнают при обновлениях модели и в BCF-замечаниях. Есть ещё ifcXML и ifcZIP, а buildingSMART разрабатывает IFC5 с другим, более веб-дружелюбным устройством.'
    },
    {
      t: 'tapline',
      q: 'Какая строка задаёт огнестойкость?',
      code: IFC,
      lang: 'plain',
      answer: 1,
      explain: 'IFCPROPERTYSINGLEVALUE с именем FireRating и значением REI 90. Строка 4 привязывает набор свойств к стене #120.'
    },
    {
      t: 'multi',
      q: 'Что есть в IFC? Отметь все.',
      options: ['Типы объектов: IfcWall, IfcDoor', 'Этажи и здание', 'Наборы свойств', 'Уникальные GlobalId', 'История правок из Revit'],
      answer: [0, 1, 2, 3],
      explain: 'IFC — снимок для обмена. История и внутренности программы остаются в её родном файле.'
    },
    {
      t: 'match',
      q: 'Соедини',
      pairs: [
        ['IfcBuildingStorey', 'Этаж'],
        ['Pset_WallCommon', 'Набор свойств стены'],
        ['GlobalId', 'Уникальный номер объекта'],
        ['IfcRelContainedInSpatialStructure', 'Связь «элемент на этаже»']
      ]
    }
  ]
};

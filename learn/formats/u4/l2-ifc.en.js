/** 3D, unit 4, lesson 2: IFC from the inside. */
const IFC = "#120=IFCWALL('2O2Fr$t4X7Zf8NOew3FLOH',#5,'Exterior wall 300',$,$,#121,#130,$,.STANDARD.);\n#140=IFCPROPERTYSINGLEVALUE('FireRating',$,IFCLABEL('REI 90'),$);\n#141=IFCPROPERTYSET('3xYz…',#5,'Pset_WallCommon',$,(#140));\n#150=IFCRELDEFINESBYPROPERTIES('1aBc…',#5,$,$,(#120),#141);";

export default {
  id: 'f3d.u4.l2',
  title: 'IFC from the inside',
  sub: 'The building tree, properties and GlobalId',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'IFC: an open buildingSMART standard',
      body: '<p><b>IFC</b> (Industry Foundation Classes) is maintained by buildingSMART and is the ISO 16739 standard.</p><p>The most common versions are IFC2x3 and IFC4. IFC4.3 added infrastructure: roads, bridges, railways.</p>'
    },
    {
      t: 'learn',
      title: 'The building tree',
      body: '<p>Everything sits in a spatial structure: <b>IfcProject</b> → <b>IfcSite</b> → <b>IfcBuilding</b> → <b>IfcBuildingStorey</b> (a floor) → elements: IfcWall, IfcDoor, IfcWindow, IfcSlab.</p><p>Properties are grouped into property sets. For example, Pset_WallCommon: FireRating, IsExternal, LoadBearing.</p>'
    },
    {
      t: 'rig', rig: 'bim',
      task: 'Filter for the doors on the second floor.',
      goal: { kind: 'filter', type: 'IfcDoor', storey: 2 },
      solve: ['type:IfcDoor', 'storey:2']
    },
    {
      t: 'choice',
      q: 'How many doors are on the second floor?',
      options: ['3', '2', '5', '1'],
      answer: 0,
      explain: 'Two interior doors and one to the balcony.'
    },
    {
      t: 'rig', rig: 'bim',
      task: 'Find all walls that have a fire rating set, and open the properties of one of them.',
      goal: { kind: 'sel', type: 'IfcWall' },
      solve: ['type:IfcWall', 'fire', 'sel:2O2Fr$t4X7Zf8NOew3FLOH']
    },
    {
      t: 'order',
      q: 'Arrange the IFC spatial structure from top to bottom',
      items: ['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey', 'IfcWall'],
      explain: 'Project → site → building → storey → element.'
    },
    {
      t: 'learn',
      title: 'An .ifc file is STEP',
      body: '<p>The most common IFC encoding is the same ISO 10303-21 text format used by STEP in mechanical engineering: numbered lines that refer to each other.</p>',
      code: IFC,
      lang: 'plain',
      deep: 'A GlobalId is a 128-bit GUID written as 22 characters in a special base64 alphabet. It is how an object is recognized across model updates and in BCF issues. There are also ifcXML and ifcZIP, and buildingSMART is developing IFC5 with a different, more web-friendly design.'
    },
    {
      t: 'tapline',
      q: 'Which line sets the fire rating?',
      code: IFC,
      lang: 'plain',
      answer: 1,
      explain: 'IFCPROPERTYSINGLEVALUE named FireRating with the value REI 90. Line 4 attaches the property set to wall #120.'
    },
    {
      t: 'multi',
      q: 'What does IFC contain? Select all.',
      options: ['Object types: IfcWall, IfcDoor', 'Storeys and the building', 'Property sets', 'Unique GlobalIds', 'Edit history from Revit'],
      answer: [0, 1, 2, 3],
      explain: 'IFC is a snapshot for exchange. History and program internals stay in the program’s native file.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IfcBuildingStorey', 'A floor'],
        ['Pset_WallCommon', 'A wall’s property set'],
        ['GlobalId', 'An object’s unique ID'],
        ['IfcRelContainedInSpatialStructure', 'The “element is on this floor” link']
      ]
    }
  ]
};

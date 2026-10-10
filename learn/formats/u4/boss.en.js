/** Final of unit 4 of the 3D formats course: BIM. */
export default {
  id: 'f3d.u4.boss',
  title: 'Final: the smart building',
  sub: 'IFC, coordination and BCF: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'bim',
      task: 'Filter for the windows on the second floor.',
      goal: { kind: 'filter', type: 'IfcWindow', storey: 2 },
      solve: ['type:IfcWindow', 'storey:2']
    },
    {
      t: 'choice',
      q: 'How is IFC different from a GLB with the same geometry?',
      options: ['In IFC, objects have a type, a storey, properties and relationships', 'IFC is smaller', 'No difference'],
      answer: 0,
      explain: 'GLB knows what it looks like. IFC knows what it is.'
    },
    {
      t: 'rig', rig: 'clash',
      task: 'Find all clashes with a 150 mm clearance.',
      goal: { kind: 'count', tol: 150, n: 4 },
      solve: ['tol:150', 'run']
    },
    {
      t: 'tapline',
      q: 'Which line is the wall itself?',
      code: "#140=IFCPROPERTYSINGLEVALUE('FireRating',$,IFCLABEL('REI 90'),$);\n#120=IFCWALL('2O2Fr$t4X7Zf8NOew3FLOH',#5,'Exterior wall 300',$,$,#121,#130,$,.STANDARD.);\n#130=IFCPRODUCTDEFINITIONSHAPE($,$,(#131));",
      lang: 'plain',
      answer: 1,
      explain: 'IFCWALL with a GlobalId. #130 is its geometry, #140 is a property.'
    },
    {
      t: 'choice',
      q: 'Why does IFC open in both Revit and Archicad?',
      options: ['It is the open standard ISO 16739', 'It is an Autodesk format', 'It stores only triangles'],
      answer: 0,
      explain: 'IFC was created precisely for exchange between different programs.'
    },
    {
      t: 'multi',
      q: 'Which of these are closed native formats? Select all.',
      options: ['RVT', 'PLN', 'NWD', 'IFC', 'BCF'],
      answer: [0, 1, 2],
      explain: 'IFC and BCF are open buildingSMART standards.'
    },
    {
      t: 'choice',
      q: 'A coordinator wants to tell an engineer “there is a pipe in this beam”. What do they send?',
      options: ['A BCF issue with a camera and GlobalIds', 'The whole model as RVT', 'A screenshot in a chat app with no element references'],
      answer: 0,
      explain: 'BCF opens exactly that view for the engineer and highlights the right elements.'
    },
    {
      t: 'order',
      q: 'The IFC spatial structure',
      items: ['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey'],
      explain: 'From top to bottom.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['IFC', 'Open BIM model'],
        ['BCF', 'Issues about a model'],
        ['NWD', 'Navisworks federated model'],
        ['GlobalId', 'How to find an object in any program']
      ]
    }
  ]
};

/** 3D, unit 4, lesson 1: what BIM is. */
export default {
  id: 'f3d.u4.l1',
  title: 'What BIM is',
  sub: 'A building as a database with a 3D view',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Not just shape, but meaning',
      body: '<p>In <b>BIM</b> (Building Information Modeling) a building is assembled not from triangles but from objects: wall, door, window, slab. Each one has a type, a storey, materials, a fire rating, a manufacturer, a cost.</p><p>It is a database that happens to have a 3D view.</p>'
    },
    {
      t: 'learn',
      title: 'Put simply',
      body: '<p>A mesh is a photo of a finished LEGO model: you see what it looks like.</p><p>BIM is the LEGO set itself, with instructions: every brick knows what it is, what it clips onto and how much it costs.</p>'
    },
    {
      t: 'rig', rig: 'bim',
      task: 'Find the doors on the second floor, then tap “Save as GLB” and see what is left.',
      goal: { kind: 'mesh' },
      solve: ['type:IfcDoor', 'storey:2', 'mesh']
    },
    {
      t: 'choice',
      q: 'What was left after saving as GLB?',
      options: ['Only geometry: the properties and relationships are gone', 'Everything, as before', 'Only properties, no geometry'],
      answer: 0,
      explain: 'GLB is a display format. It has no idea what a “door” or a “storey” is.'
    },
    {
      t: 'multi',
      q: 'What does a BIM door object know that a mesh does not? Select all.',
      options: ['That it is a door', 'Which floor it is on', 'Its fire resistance rating', 'Which wall it sits in', 'What it looks like'],
      answer: [0, 1, 2, 3],
      explain: 'A mesh knows the look too. But meaning, place in the building and properties belong to BIM alone.'
    },
    {
      t: 'choice',
      q: 'Why do builders need “smart” objects?',
      options: ['To compute quantities and cost, check codes, find clashes and hand data over to facility management', 'To make renders prettier', 'To make files smaller'],
      answer: 0,
      explain: 'Schedules, cost estimates and timelines all come out of a BIM model. Geometry is only part of the data.'
    },
    {
      t: 'learn',
      title: 'Who works with BIM',
      body: '<p>The architect, the structural engineer, the HVAC, plumbing and electrical engineers: each in their own program.</p><p>To bring it all together you need a common language, <b>IFC</b>, and a federated model for coordination.</p>'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['BIM', 'Objects with properties and relationships'],
        ['Mesh', 'Geometry only'],
        ['IFC', 'Open language for BIM exchange'],
        ['Federated model', 'All disciplines together']
      ]
    }
  ]
};

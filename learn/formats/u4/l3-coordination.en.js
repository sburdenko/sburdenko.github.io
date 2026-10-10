/** 3D, unit 4, lesson 3: native formats, Navisworks and clash detection. */
export default {
  id: 'f3d.u4.l3',
  title: 'Native formats and coordination',
  sub: 'RVT, PLN, Navisworks and clashes',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Every program keeps its own',
      body: '<p><b>RVT</b> is Revit’s native format, and it is closed. A file from a newer Revit will not open in an older one. <b>PLN</b> is Archicad’s native format.</p><p>The native format has everything: history, families, views, drawing sheets. IFC has only what is needed for exchange.</p>'
    },
    {
      t: 'learn',
      title: 'Navisworks: the federated model',
      body: '<p>Disciplines are modeled in different programs, and <b>Navisworks</b> brings them into one scene.</p><p><b>NWC</b> is a cache generated from each source file. <b>NWD</b> is a published federated model with all geometry inside, easy to view and check.</p>',
      deep: 'There is also NWF, a “list of links” to the source files: on open, Navisworks pulls in fresh NWCs. Clash detection (Clash Detective) lives in Navisworks Manage; in the cloud, services like Autodesk Construction Cloud take its place.'
    },
    {
      t: 'rig', rig: 'clash',
      task: 'Run a hard clash check between disciplines.',
      goal: { kind: 'count', tol: 0, n: 2 },
      solve: ['run']
    },
    {
      t: 'choice',
      q: 'How many hard clashes were found?',
      options: ['2', '0', '4', '5'],
      answer: 0,
      explain: 'Duct D-7 runs straight through both beams.'
    },
    {
      t: 'rig', rig: 'clash',
      task: 'Pipes need 50 mm of clearance for insulation. Check with a 50 mm tolerance.',
      goal: { kind: 'count', tol: 50, n: 3 },
      solve: ['tol:50', 'run']
    },
    {
      t: 'choice',
      q: 'Why did one more clash show up with 50 mm clearance?',
      options: ['Pipe P-4 runs 10 mm below a beam: no intersection, but the insulation will not fit', 'The check made a mistake', 'The beam moved'],
      answer: 0,
      explain: 'This is a “soft” clash: the elements do not intersect, but the required clearance is violated.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['RVT is a closed format', 'NWD is a federated model for viewing and checking', 'NWC is generated from source files', 'IFC stores everything RVT has', 'PLN is a Navisworks format'],
      answer: [0, 1, 2],
      explain: 'IFC carries only exchange data. PLN is Archicad’s format.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['RVT', 'Revit'],
        ['PLN', 'Archicad'],
        ['NWC', 'Navisworks cache of one source file'],
        ['NWD', 'Published federated model']
      ]
    }
  ]
};

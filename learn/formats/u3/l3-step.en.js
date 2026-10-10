/** 3D, unit 3, lesson 3: STEP and IGES. */
const STEP = "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF'));\nENDSEC;\nDATA;\n#10=CARTESIAN_POINT('',(0.,0.,0.));\n#11=DIRECTION('',(0.,0.,1.));\n#12=AXIS2_PLACEMENT_3D('',#10,#11,$);\n#13=CYLINDRICAL_SURFACE('',#12,50.);\nENDSEC;\nEND-ISO-10303-21;";

export default {
  id: 'f3d.u3.l3',
  title: 'STEP and IGES',
  sub: 'Neutral formats of mechanical engineering',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'STEP: the common language of engineering',
      body: '<p><b>STEP</b> is the international standard ISO 10303. Every serious CAD system understands it: SolidWorks, CATIA, NX, Creo, Inventor, Fusion, FreeCAD.</p><p>It holds exact surfaces (B-rep, NURBS) and assemblies, and the <b>AP242</b> protocol adds dimensions and tolerances right on the model (PMI).</p>',
      deep: 'Application protocols (APs) are different “dialects” of STEP. AP203 is the design 3D model, AP214 is automotive (added colors and layers), and AP242 merged them and added PMI and data for drawing-free manufacturing (MBD).'
    },
    {
      t: 'learn',
      title: 'What STEP looks like',
      body: '<p>It is text. Each line is an entity with its own number, and it refers to other numbers.</p>',
      code: STEP,
      lang: 'plain'
    },
    {
      t: 'tapline',
      q: 'Which line sets the 50 mm radius?',
      code: STEP,
      lang: 'plain',
      answer: 8,
      explain: 'CYLINDRICAL_SURFACE(name, placement, radius) is our “cylinder with a 50 radius”.'
    },
    {
      t: 'choice',
      q: 'What does #13 refer to?',
      code: STEP,
      lang: 'plain',
      options: ['#12, the cylinder’s coordinate system: a point and an axis direction', '#10, the center of the circle', 'Nothing'],
      answer: 0,
      explain: '#12 in turn refers to point #10 and direction #11. That is how STEP builds a model from small linked pieces.'
    },
    {
      t: 'learn',
      title: 'IGES: the ancestor',
      body: '<p><b>IGES</b> appeared in the US in 1980 and was the main exchange format for a long time. The last version is 5.3 (1996).</p><p>It carries surfaces, but often handles solids and assemblies badly: after import you get “surfaces without a solid” that have to be stitched together. Today people use STEP instead.</p>'
    },
    {
      t: 'choice',
      q: 'You imported an IGES and got a pile of separate surfaces with no volume. Why?',
      options: ['IGES often carries only surfaces without solid topology; you have to stitch them or use STEP', 'The file is corrupted', 'Not enough memory'],
      answer: 0,
      explain: 'Without topology the program does not know the surfaces form a closed solid.'
    },
    {
      t: 'multi',
      q: 'What can STEP AP242 carry? Select all.',
      options: ['Exact surfaces', 'Assemblies of parts', 'Dimensions and tolerances on the model (PMI)', 'Character animation', 'PBR textures for a game'],
      answer: [0, 1, 2],
      explain: 'STEP is about engineering, not games.'
    },
    {
      t: 'choice',
      q: 'A contractor asks for a part model “in a neutral format”. What do you send?',
      options: ['STEP', 'STL', 'FBX', 'OBJ'],
      answer: 0,
      explain: 'STEP keeps the exact geometry, and it can be edited further in any CAD system. STL is just triangles.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['ISO 10303', 'The STEP standard'],
        ['AP242', 'Protocol with dimensions and tolerances'],
        ['IGES', 'STEP’s predecessor, from 1980'],
        ['PMI', 'Dimensions and tolerances on the model']
      ]
    }
  ]
};

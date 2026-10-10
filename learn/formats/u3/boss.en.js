/** Final of unit 3 of the 3D formats course: CAD. */
export default {
  id: 'f3d.u3.boss',
  title: 'Final: exact geometry',
  sub: 'B-rep, tessellation, STEP and DWG: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tess', start: 6,
      task: 'Prepare the cylinder for the web: deviation of 0.1 mm or less and no more than 260 triangles.',
      goal: { kind: 'err', max: 0.1, maxTris: 260 },
      solve: ['n:64']
    },
    {
      t: 'choice',
      q: 'How is a cylinder in STEP different from a cylinder in GLB?',
      options: ['STEP has the formula “radius 50 mm”; GLB has a set of triangles', 'No difference', 'GLB is more precise'],
      answer: 0,
      explain: 'STEP stores the exact surface; GLB stores an approximation of it.'
    },
    {
      t: 'rig', rig: 'nurbs',
      task: 'Turn the Bézier curve into an exact quarter circle.',
      goal: { max: 0.001 },
      solve: ['w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w+:0.005']
    },
    {
      t: 'choice',
      q: 'The segment count went up 3 times. The tessellation error dropped by about…',
      options: ['9 times', '3 times', '6 times'],
      answer: 0,
      explain: 'The error falls with the square of the segment count.'
    },
    {
      t: 'tapline',
      q: 'Where is the exact surface here?',
      code: "#20=CARTESIAN_POINT('',(0.,0.,0.));\n#21=DIRECTION('',(0.,0.,1.));\n#22=AXIS2_PLACEMENT_3D('',#20,#21,$);\n#23=SPHERICAL_SURFACE('',#22,25.);",
      lang: 'plain',
      answer: 3,
      explain: 'SPHERICAL_SURFACE with radius 25 is an exact sphere. The rest is its coordinate system.'
    },
    {
      t: 'multi',
      q: 'Which of these are exact CAD geometry? Select all.',
      options: ['STEP', 'IGES', '3DM', 'STL', 'GLB'],
      answer: [0, 1, 2],
      explain: 'STL and GLB are triangles.'
    },
    {
      t: 'choice',
      q: 'A drawing from a new AutoCAD will not open for a colleague with an old one. What do you do?',
      options: ['Save to an older DWG version or send a DXF', 'Convert it to STL', 'Nothing will help'],
      answer: 0,
      explain: 'AutoCAD can “Save As” older DWG versions.'
    },
    {
      t: 'choice',
      q: 'What does the angular tolerance give you in tessellation?',
      options: ['Small circles get split finely enough even when the chordal deviation is already met', 'The file gets smaller', 'The model rotates'],
      answer: 0,
      explain: 'The angle limits how much neighboring triangles can differ in slope.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['STEP', 'Neutral engineering format'],
        ['DXF', 'Text with group codes'],
        ['NURBS', 'Curves with weights'],
        ['Tessellation', 'Formula → triangles']
      ]
    }
  ]
};

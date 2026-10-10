/** Final of the 3D formats course: point clouds and picking a format for the job. */
export default {
  id: 'f3d.u5.boss',
  title: 'Final: which format do you need',
  sub: 'The whole course mixed together, from STL to LAZ',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'points',
      task: 'Fit 100 million points into 1 GB.',
      goal: { kind: 'fit', n: '100M', maxBytes: 1e9 },
      solve: ['n:100M', 'fmt:laz']
    },
    {
      t: 'match',
      q: 'Match each task to a format',
      pairs: [
        ['Print a part', 'STL'],
        ['Show a model on a website', 'GLB'],
        ['Send a part to another CAD system', 'STEP'],
        ['Move a BIM model between programs', 'IFC']
      ]
    },
    {
      t: 'match',
      q: 'More tasks',
      pairs: [
        ['Archive of laser scans', 'LAZ'],
        ['Scans with panoramic photos', 'E57'],
        ['An issue: “clash here”', 'BCF'],
        ['AR on iPhone', 'USDZ']
      ]
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A scan with vertex colors: find a simple format, with no scenes or animation, that keeps the color.',
      assetName: 'room scan',
      asset: ['geometry', 'vcolor'],
      goal: { kind: 'keep', not: ['gltf', 'fbx', 'usd', 'dae'] },
      solve: ['fmt:ply']
    },
    {
      t: 'choice',
      q: 'Which format stores exact geometry rather than triangles?',
      options: ['STEP', 'STL', 'PLY', 'LAS'],
      answer: 0,
      explain: 'STEP holds B-rep and NURBS. The others are triangles or points.'
    },
    {
      t: 'choice',
      q: 'A LAS point has class 6. What is it?',
      options: ['Building', 'Ground', 'Water'],
      answer: 0,
      explain: '2 is ground, 5 is high vegetation, 6 is building, 9 is water.'
    },
    {
      t: 'multi',
      q: 'Which formats are open standards? Select all.',
      options: ['glTF', 'IFC', 'STEP', 'E57', 'RVT', 'DWG'],
      answer: [0, 1, 2, 3],
      explain: 'RVT and DWG are closed Autodesk formats.'
    },
    {
      t: 'choice',
      q: 'To show a STEP file in a browser, you need to…',
      options: ['Tessellate it into triangles and save it as, say, GLB', 'Rename it to .glb', 'Open it as text'],
      answer: 0,
      explain: 'Browsers draw triangles, not formulas.'
    },
    {
      t: 'choice',
      q: 'You got an .rcp without .rcs files and an .obj without an .mtl. What do they have in common?',
      options: ['They are files of references: without the files they point to, the data is incomplete', 'Both are outdated', 'Nothing'],
      answer: 0,
      explain: 'External references are the top cause of “broken” transfers in 3D. The fix is single-file packages: GLB, USDZ, NWD, E57.'
    },
    {
      t: 'order',
      q: 'From construction site to issue',
      items: ['Laser scanning (E57)', 'Cloud in ReCap (RCP)', 'Comparison with the BIM model (IFC)', 'Issue about the deviation (BCF)'],
      explain: 'The course’s four worlds in one chain.'
    }
  ]
};

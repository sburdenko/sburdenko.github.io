/** 3D, unit 5, lesson 3: PTS/XYZ, ReCap and the path from scan to model. */
export default {
  id: 'f3d.u5.l3',
  title: 'PTS, XYZ and ReCap',
  sub: 'Plain text, Autodesk projects and scan-to-BIM',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'As simple as it gets: XYZ and PTS',
      body: '<p><b>XYZ</b> is text: each line holds x y z, sometimes r g b too.<br><b>PTS</b> (a Leica format): the first line is the point count, then x y z, intensity and r g b.</p><p>Anything can open it, but it is huge and slow: every digit is a separate byte.</p>'
    },
    {
      t: 'tapline',
      q: 'Which PTS line is the point count?',
      code: '3\n12.402 3.118 0.021 -1204 112 118 96\n12.405 3.120 0.019 -1188 110 117 95\n12.409 3.117 0.024 -1250 113 119 97',
      lang: 'plain',
      answer: 0,
      explain: 'The first line says how many points follow. The fourth number on each line is intensity, then the color.'
    },
    {
      t: 'choice',
      q: 'Why are PTS and XYZ so big?',
      options: ['Every digit is written as a text character: a point takes dozens of bytes instead of 20–36', 'They store extra points', 'They have photos embedded'],
      answer: 0,
      explain: '“12.402” is 6 bytes as text, while in LAS the same coordinate is a 4-byte integer.'
    },
    {
      t: 'learn',
      title: 'RCP and RCS: point clouds in Autodesk',
      body: '<p><b>ReCap</b> is Autodesk’s point cloud software. <b>RCS</b> is a single scan converted into a fast indexed format. <b>RCP</b> is a project that references a set of RCS files.</p><p>RCP is what you load into Revit, Navisworks and AutoCAD.</p>'
    },
    {
      t: 'choice',
      q: 'A colleague sent only an .rcp, and the cloud will not open. Why?',
      options: ['RCP is a project of references; the points themselves live in .rcs files that were not included', 'The RCP is corrupted', 'Revit cannot do point clouds'],
      answer: 0,
      explain: 'Same story as an OBJ without textures: a file of references without the things it references.'
    },
    {
      t: 'learn',
      title: 'From scan to BIM model',
      body: '<p>Scans from different stations are stitched into one cloud: that is <b>registration</b>. Then the cloud is cleaned and classified, and walls and pipes are modeled from it: that is <b>scan-to-BIM</b>.</p><p>This is how teams check whether everything was built as designed, or model an old building before renovation.</p>'
    },
    {
      t: 'order',
      q: 'Put the scan-to-BIM steps in order',
      items: ['Scanning from stations', 'Registration: stitch scans into one cloud', 'Cleaning and classification', 'Modeling BIM objects from the cloud', 'Comparing “as built” with the design'],
      explain: 'From points to smart objects, and back to checking.'
    },
    {
      t: 'rig', rig: 'points',
      task: 'A billion points: fit into 10 GB.',
      goal: { kind: 'fit', n: '1B', maxBytes: 1e10 },
      solve: ['n:1B', 'fmt:laz']
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['XYZ', 'Text: x y z'],
        ['PTS', 'Leica text with intensity'],
        ['RCS', 'A single indexed ReCap scan'],
        ['RCP', 'A ReCap project with references']
      ]
    }
  ]
};

/** 3D, unit 3, lesson 2: tessellation, from formula to triangles. */
export default {
  id: 'f3d.u3.l2',
  title: 'Tessellation',
  sub: 'How finely to slice exact geometry',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'To show CAD, you cut it into triangles',
      body: '<p>A GPU cannot draw “cylinder R50”. So before display, exact geometry is <b>tessellated</b>: turned into triangles.</p><p>The main question is how finely.</p>'
    },
    {
      t: 'rig', rig: 'tess', start: 8,
      task: 'Get the deviation from the true cylinder down to 0.1 mm or less, using no more than 260 triangles. Spin the cylinder with your finger.',
      goal: { kind: 'err', max: 0.1, maxTris: 260 },
      solve: ['n:64']
    },
    {
      t: 'learn',
      title: 'Chord and sagitta',
      body: '<p>A straight segment in place of an arc is a <b>chord</b>. The largest distance between the arc and the chord is the <b>sagitta</b> (chord height): r · (1 − cos(π / n)).</p><p>Double the segments and the error drops about fourfold, while the triangle count doubles.</p>'
    },
    {
      t: 'choice',
      q: 'There were 32 segments, now there are 64. How did the error change?',
      options: ['It dropped about 4 times', '2 times', '8 times', 'It did not change'],
      answer: 0,
      explain: 'For large n the sagitta ≈ r·π²/(2n²): the error falls with the square of the segment count.'
    },
    {
      t: 'choice',
      q: 'How does the size of a STEP file with this cylinder change between coarse and fine tessellation?',
      options: ['Not at all: STEP holds the formula, and tessellation happens later, at display or export', 'It grows with the triangle count', 'It shrinks'],
      answer: 0,
      explain: 'A STEP file’s size depends on the part’s complexity, not on display quality.'
    },
    {
      t: 'learn',
      title: 'Export settings',
      body: '<p>When CAD exports to STL or glTF, you set tolerances. <b>Chordal deviation</b> is how far triangles may stray from the surface, in millimeters. <b>Angular deviation</b> is how much neighboring triangles may differ in slope.</p><p>Tight tolerances give smooth and heavy; loose ones give light and angular.</p>',
      deep: 'The angular tolerance saves small features: for a Ø2 mm hole, a 0.1 mm chordal deviation gives only 7 segments, and the angle forces more. For the web, 0.1–0.5 mm is often enough. Huge assemblies get LODs (several levels of detail) or streaming formats like 3D Tiles.'
    },
    {
      t: 'multi',
      q: 'What grows when you tighten the tessellation tolerance? Select all.',
      options: ['Triangle count', 'STL or GLB file size', 'GPU load', 'Accuracy of the source CAD model', 'STEP file size'],
      answer: [0, 1, 2],
      explain: 'The source CAD model is exact already. Only its approximation changes.'
    },
    {
      t: 'order',
      q: 'A CAD part’s path to a website',
      items: ['STEP from the CAD system', 'Tessellation with a tolerance', 'glTF/GLB with triangles', 'Display in the browser'],
      explain: 'Formula → triangles → delivery format → screen.'
    },
    {
      t: 'choice',
      q: 'A Ø2 mm hole looks like a heptagon at a 0.1 mm chordal tolerance. What helps?',
      options: ['Add an angular tolerance: it forces small circles to be split finer', 'Loosen the chordal tolerance', 'Save as OBJ instead of STL'],
      answer: 0,
      explain: 'The chordal tolerance suits large arcs; the angular one suits small ones.'
    }
  ]
};

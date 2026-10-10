/** 3D, unit 1, lesson 2: winding order, front face, normals. */
export default {
  id: 'f3d.u1.l2',
  title: 'Normals and the front face',
  sub: 'Why models sometimes have holes',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A face has a front and a back',
      body: '<p>The order in which a triangle’s vertices are listed sets its front side. Counterclockwise (as you look at the triangle) means it faces you; clockwise means you see its back.</p><p>The GPU usually skips the back side, which saves almost half the work. This is called <b>backface culling</b>.</p>'
    },
    {
      t: 'rig', rig: 'meshbuild',
      task: 'Build the house so every triangle faces you (green). Got a red one? Reverse its winding.',
      goal: { ccw: true },
      solve: ['v:0', 'v:1', 'v:2', 'v:0', 'v:2', 'v:4', 'v:4', 'v:2', 'v:3']
    },
    {
      t: 'choice',
      q: 'In a game, some faces of a model vanished: you can only see them from inside. Most likely…',
      options: ['Those triangles have reversed winding, so their normals point inward', 'There are too few triangles', 'The texture failed to load'],
      answer: 0,
      explain: 'Back faces are culled, so flipped faces disappear from the outside. In an editor you fix it by recalculating normals to point outward.'
    },
    {
      t: 'learn',
      title: 'A normal is an arrow pointing out',
      body: '<p>A <b>normal</b> is a unit vector perpendicular to the surface. Lighting uses it: how much the surface is turned toward the light.</p><p>In STL each triangle has one normal. In OBJ and glTF normals are stored per vertex, which allows smooth lighting.</p>',
      deep: 'There are also normal maps: textures that replace the normal at every point and draw fine detail without extra triangles. To orient such a texture correctly you need tangents.'
    },
    {
      t: 'rig', rig: 'tess', start: 12,
      task: 'Switch between flat and smooth normals and compare how many vertices the GPU needs.',
      goal: { kind: 'flat' },
      solve: ['flat']
    },
    {
      t: 'choice',
      q: 'Why does the GPU need more vertices with flat normals?',
      options: ['To the GPU a vertex is a position plus a normal; on an edge between faces with different normals, the point has to be stored twice', 'Flat normals need more triangles', 'It is a bug in the demo'],
      answer: 0,
      explain: 'The GPU cannot do “one point, two normals”. A sharp edge means duplicated vertices.'
    },
    {
      t: 'choice',
      q: 'A cube with sharp edges has 8 corners. How many vertices will the GPU get?',
      options: ['24', '8', '12', '36'],
      answer: 0,
      explain: 'Each corner belongs to three faces with different normals, so it gets three copies: 8 × 3 = 24.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['The order of a triangle’s vertices sets its front side', 'glTF treats counterclockwise winding as the front', 'Normals are needed to compute lighting', 'A normal is the color of a vertex', 'The back of a triangle is always drawn'],
      answer: [0, 1, 2],
      explain: 'A normal is a direction, not a color. You can turn on back faces (a double-sided material), but by default they are culled.'
    }
  ]
};

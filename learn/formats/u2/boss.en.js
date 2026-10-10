/** Final of unit 2 of the 3D formats course: mesh formats. */
export default {
  id: 'f3d.u2.boss',
  title: 'Final: mesh formats',
  sub: 'OBJ, STL, PLY, glTF, FBX, USD: test yourself',
  minutes: 7,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'convert',
      task: 'A character has to move between programs without losses, but the format must be an open standard. Find it.',
      assetName: 'animated character',
      asset: ['geometry', 'normals', 'uv', 'pbr', 'hierarchy', 'skin', 'morph'],
      goal: { kind: 'keep', not: ['fbx'] },
      solve: ['fmt:gltf']
    },
    {
      t: 'choice',
      q: 'Which format stores only triangles, with no color or units?',
      options: ['STL', 'PLY', 'glTF', 'USD'],
      answer: 0,
      explain: 'STL’s minimalism is both its strength and its weakness.'
    },
    {
      t: 'tapline',
      q: 'Which PLY header line declares a color?',
      code: 'ply\nformat ascii 1.0\nelement vertex 8\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nend_header',
      lang: 'plain',
      answer: 6,
      explain: 'property uchar red is the red component of the vertex color.'
    },
    {
      t: 'choice',
      q: 'How is GLB different from .gltf?',
      options: ['Everything is packed into one binary file', 'Different materials', 'GLB is an outdated version'],
      answer: 0,
      explain: 'Same contents, different packaging.'
    },
    {
      t: 'choice',
      q: 'In USD, layer A is above layer B. Both set a color. Whose color wins?',
      options: ['Layer A’s', 'Layer B’s', 'They blend'],
      answer: 0,
      explain: 'Higher means stronger.'
    },
    {
      t: 'multi',
      q: 'What can OBJ not do? Select all.',
      options: ['Hierarchy with transforms', 'Skeletal animation', 'Units', 'UV coordinates'],
      answer: [0, 1, 2],
      explain: 'OBJ does have UVs: the vt lines.'
    },
    {
      t: 'rig', rig: 'usd',
      task: 'A red bar stool, without editing chair.usda.',
      goal: { color: 'red', legs: 3 },
      solve: ['layer:shot', 'var:bar']
    },
    {
      t: 'choice',
      q: 'Why is FBX a standard for animation but not for the web?',
      options: ['It is closed and built for exchange between programs, not for fast delivery to the screen', 'It cannot do animation', 'It is a text format'],
      answer: 0,
      explain: 'For the web there is glTF: open and ready to render.'
    },
    {
      t: 'choice',
      q: 'Which format has glTF almost replaced?',
      options: ['DAE (Collada)', 'STL', 'USD', 'PLY'],
      answer: 0,
      explain: 'Both come from Khronos; glTF does the same job more simply and faster.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['OBJ', 'Text: v, vt, vn, f'],
        ['STL', 'Triangles for printing'],
        ['PLY', 'Scans and point clouds'],
        ['USDZ', 'AR on iPhone']
      ]
    }
  ]
};

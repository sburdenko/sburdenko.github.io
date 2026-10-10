/** 3D, unit 2, lesson 2: PLY, for meshes and point clouds. */
const HEADER = 'ply\nformat binary_little_endian 1.0\nelement vertex 120000\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nelement face 0\nend_header';

export default {
  id: 'f3d.u2.l2',
  title: 'PLY for scans',
  sub: 'A header that describes itself',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'PLY from Stanford',
      body: '<p>PLY (Polygon File Format) was created at Stanford in the 1990s, the same place that scanned the famous “Stanford bunny”.</p><p>First comes a header: how many vertices, what properties they have (x, y, z, color, normal…), how many faces. Then the data itself, as text or in binary.</p>'
    },
    {
      t: 'tapline',
      q: 'Which line says how many vertices there will be?',
      code: HEADER,
      lang: 'plain',
      answer: 2,
      explain: 'element vertex 120000 means 120 thousand vertices with the listed properties follow.'
    },
    {
      t: 'choice',
      q: 'This file says element face 0. What does that mean?',
      code: HEADER,
      lang: 'plain',
      options: ['There are no faces: it is a point cloud', 'The file is corrupted', 'The faces are in another file'],
      answer: 0,
      explain: 'PLY happily stores points without faces, which is why scanners love it.'
    },
    {
      t: 'learn',
      title: 'Why scanners love PLY',
      body: '<p>You can give vertices any properties: color, normal, scanner confidence, intensity. There may be no faces at all.</p><p>That is why PLY is common in photogrammetry, science and robotics.</p>',
      deep: '3D Gaussian Splatting models are usually stored in PLY too: each “point” is a Gaussian with its own properties (scale, rotation, opacity, color coefficients). The format allows this with no extensions, just new property lines.'
    },
    {
      t: 'choice',
      q: 'A scanner produced millions of colored points. Which of the simple mesh formats fits?',
      options: ['PLY', 'STL', 'DAE'],
      answer: 0,
      explain: 'STL stores only triangles without color. PLY stores points with any properties.'
    },
    {
      t: 'multi',
      q: 'What can PLY store? Select all.',
      options: ['Points without faces', 'Vertex colors', 'Normals', 'Custom properties, such as scanner confidence', 'Skeletal animation'],
      answer: [0, 1, 2, 3],
      explain: 'PLY is a flexible table of vertex and face properties. It has no animation or scene.'
    },
    {
      t: 'blanks',
      q: 'Declare a color property in the PLY header',
      code: 'element vertex 3\nproperty float x\nproperty float y\nproperty float z\nproperty ___ red',
      lang: 'plain',
      tiles: ['uchar', 'vertex', 'face', 'ply'],
      answer: ['uchar'],
      explain: 'uchar is a byte from 0 to 255, the usual type for color.'
    },
    {
      t: 'match',
      q: 'Match the header lines',
      pairs: [
        ['ply', 'The first line of the file'],
        ['element', 'How many items follow'],
        ['property', 'What fields they have'],
        ['end_header', 'The data starts here']
      ]
    }
  ]
};

/** 3D, unit 2, lesson 1: OBJ and STL, the simple old formats. */
export default {
  id: 'f3d.u2.l1',
  title: 'OBJ and STL',
  sub: 'Simple, old and understood by everyone',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'OBJ: a text file from the 80s',
      body: '<p>Wavefront created OBJ in the late 1980s. It is plain text: a <code>v</code> line is a vertex, <code>vt</code> is a UV, <code>vn</code> is a normal, <code>f</code> is a face made of vertex numbers (counting from one). Materials live in a separate .mtl file.</p><p>It opens in Notepad and in almost any 3D program.</p>',
      code: 'mtllib box.mtl\nv 0 0 0\nv 1 0 0\nv 1 1 0\nvt 0 0\nvn 0 0 1\nusemtl Wood\nf 1/1/1 2/1/1 3/1/1',
      lang: 'plain',
      deep: 'f 1/1/1 means the position, UV and normal numbers. A face can be a quad or an n-gon: OBJ does not require triangles. Negative indices count from the end. There is no hierarchy or animation: o and g are just group names.'
    },
    {
      t: 'learn',
      title: 'STL: the language of 3D printers',
      body: '<p>STL was created in 1987 for stereolithography (by 3D Systems). Inside there are only triangles: each has a normal and three vertices. No color, no UVs, no units.</p><p>It comes in text and binary flavors. Binary: an 80-byte header, the triangle count, and 50 bytes per triangle.</p>'
    },
    {
      t: 'rig', rig: 'meshbuild',
      task: 'Build the house from front-facing triangles and compare how many bytes and vertices go into OBJ and into STL.',
      goal: { ccw: true },
      solve: ['v:0', 'v:1', 'v:2', 'v:0', 'v:2', 'v:4', 'v:4', 'v:2', 'v:3']
    },
    {
      t: 'blanks',
      q: 'Complete the OBJ face from vertices 1, 2, 3',
      code: 'v 0 0 0\nv 1 0 0\nv 0 1 0\n___ 1 2 3',
      lang: 'plain',
      tiles: ['f', 'v', 'vn', 'g'],
      answer: ['f'],
      explain: 'f stands for face. The numbers refer to the v lines in order, starting from one.'
    },
    {
      t: 'choice',
      q: 'How big is a binary STL with 1,000 triangles?',
      options: ['50,084 bytes', '1,000 bytes', '12,000 bytes', '36,084 bytes'],
      answer: 0,
      explain: '84 bytes of header and counter + 1,000 × 50 bytes: normal 12, three vertices 36, attribute bytes 2.'
    },
    {
      t: 'choice',
      q: 'Why is STL still the standard in 3D printing?',
      options: ['A printer only needs the shape, and STL is the simplest, most widely understood way to send it', 'It stores the plastic colors', 'Printers can read nothing else'],
      answer: 0,
      explain: 'A slicer needs a closed volume made of triangles. STL does not need anything else.',
      deep: 'There is also the newer 3MF for printing: units, colors, materials and multiple objects in one zip file. Slicer support for it keeps growing.'
    },
    {
      t: 'tapline',
      q: 'Which line of the text STL holds the normal?',
      code: 'solid part\n  facet normal 0 0 1\n    outer loop\n      vertex 0 0 0\n      vertex 1 0 0\n      vertex 0 1 0\n    endloop\n  endfacet\nendsolid part',
      lang: 'plain',
      answer: 1,
      explain: 'facet normal is the triangle’s normal, followed by three vertex lines.'
    },
    {
      t: 'multi',
      q: 'What gets lost if you save a game character as STL? Select all.',
      options: ['Textures and UVs', 'Colors', 'Skeleton and animation', 'Units', 'The surface shape'],
      answer: [0, 1, 2, 3],
      explain: 'Only the shape, made of triangles, survives.'
    },
    {
      t: 'match',
      q: 'Match the OBJ lines',
      pairs: [
        ['v', 'Vertex'],
        ['vt', 'UV coordinate'],
        ['vn', 'Normal'],
        ['f', 'Face']
      ]
    }
  ]
};

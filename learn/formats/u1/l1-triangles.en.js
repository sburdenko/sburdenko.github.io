/** 3D, unit 1, lesson 1: vertices, edges, faces, and why triangles. */
const HOUSE_SOLVE = ['v:0', 'v:1', 'v:2', 'v:0', 'v:2', 'v:4', 'v:4', 'v:2', 'v:3'];

export default {
  id: 'f3d.u1.l1',
  title: 'Vertices and triangles',
  sub: 'What every 3D model is glued together from',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'A model is an empty shell',
      body: '<p>Almost every 3D model in a game or a browser is a thin “skin” with nothing inside. It is glued together from flat pieces.</p><p>Think of a paper mask: from the outside it looks like a face, but inside it is hollow.</p>'
    },
    {
      t: 'learn',
      title: 'Three words',
      body: '<p>A <b>vertex</b> is a point in space: three numbers x, y, z.<br>An <b>edge</b> is a line segment between two vertices.<br>A <b>face</b> is a flat piece bounded by edges.</p><p>A set of vertices and faces is called a <b>mesh</b>.</p>'
    },
    {
      t: 'learn',
      title: 'Why triangles',
      body: '<p>Exactly one plane passes through any three points, so a triangle is always flat. A quad can have one corner “bent out”, and then it is unclear how to shade it.</p><p>The GPU draws only triangles, so everything else is cut into them before display.</p>',
      deep: 'Modelers love quads: they work better with subdivision smoothing and edge loops. But renderers and glTF get triangles: a quad is 2 triangles, a convex n-gon is n − 2.'
    },
    {
      t: 'learn',
      title: 'A mesh has to go into a file',
      body: '<p>A <b>file format</b> is an agreement on how to write a mesh down: what comes after what and what each number means. There are many formats. You will see their names all the time, so here are the four main ones:</p><p><b>OBJ</b> is an old, simple text format: a list of vertices, then a list of triangles.<br><b>STL</b> is the 3D printing format: triangles only, no color or textures.<br><b>glTF</b> is the modern format for games and the browser.<br><b>FBX</b> is for exchange between tools like Blender, Maya and Unity.</p><p>We will cover each one in detail in unit two. For now, one thing matters: different formats write the same mesh in different ways.</p>'
    },
    {
      t: 'learn',
      title: 'Two ways to write triangles',
      body: '<p><b>OBJ</b> first lists every vertex once, then writes each triangle as numbers: “vertices 1, 2, 3”.</p><p><b>STL</b> has no numbers: every triangle writes out all three points in full. A vertex shared by neighboring triangles is repeated once for every triangle that meets there.</p>'
    },
    {
      t: 'rig', rig: 'meshbuild',
      task: 'Build a house out of triangles: tap three vertices at a time. Below you can see how OBJ and STL would write the same mesh. Count the vertices in each.',
      goal: {},
      solve: HOUSE_SOLVE
    },
    {
      t: 'choice',
      q: 'How many triangles does it take to cover the house, a convex pentagon?',
      options: ['3', '5', '2', '4'],
      answer: 0,
      explain: 'A convex polygon with n vertices splits into n − 2 triangles: 5 − 2 = 3.'
    },
    {
      t: 'choice',
      q: 'Why does STL store 9 vertices while OBJ stores only 5?',
      options: ['OBJ lists each vertex once and refers to it by number, while STL repeats vertices in every triangle', 'STL is more precise', 'OBJ compresses the data'],
      answer: 0,
      explain: 'These are two approaches: an indexed mesh (OBJ, glTF) and “triangle soup” (STL). Indices save space and keep connectivity.'
    },
    {
      t: 'match',
      q: 'Match each word to its meaning',
      pairs: [
        ['Vertex', 'A point: three numbers x, y, z'],
        ['Edge', 'A segment between two vertices'],
        ['Face', 'A flat piece, usually a triangle'],
        ['Mesh', 'A set of vertices and faces']
      ]
    },
    {
      t: 'choice',
      q: 'How many triangles does a cube have?',
      options: ['12', '6', '8', '24'],
      answer: 0,
      explain: '6 square faces, 2 triangles each.'
    },
    {
      t: 'choice',
      q: 'Why does the GPU draw triangles specifically?',
      options: ['A triangle is always flat, so it is simple and fast to shade', 'One manufacturer decided so long ago', 'Triangles look nicer'],
      answer: 0,
      explain: 'A face that is flat with no exceptions is the perfect building block for hardware that draws billions of faces per second.'
    }
  ]
};

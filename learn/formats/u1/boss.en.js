/** Final of unit 1 of the 3D formats course. */
export default {
  id: 'f3d.u1.boss',
  title: 'Final: anatomy of a model',
  sub: 'Vertices, normals, UVs and the scene: test yourself',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'meshbuild',
      task: 'Build the house with every triangle facing you.',
      goal: { ccw: true },
      solve: ['v:1', 'v:2', 'v:3', 'v:0', 'v:1', 'v:3', 'v:0', 'v:3', 'v:4']
    },
    {
      t: 'choice',
      q: 'How many triangles do you get from one quad?',
      options: ['2', '4', '1', '3'],
      answer: 0,
      explain: 'A quad is cut along a diagonal into two triangles.'
    },
    {
      t: 'tapline',
      q: 'Which OBJ line sets a UV coordinate?',
      code: 'v 0 0 0\nv 1 0 0\nv 0 1 0\nvt 0 0\nvn 0 0 1\nf 1/1/1 2/1/1 3/1/1',
      lang: 'plain',
      answer: 3,
      explain: 'vt is a texture vertex, that is, a UV. vn is a normal, f is a face.'
    },
    {
      t: 'choice',
      q: 'A triangle is listed clockwise as you look at it. What do you see with backface culling on?',
      options: ['Nothing: its back is facing you', 'A normal triangle', 'A black triangle'],
      answer: 0,
      explain: 'Counterclockwise winding counts as the front.'
    },
    {
      t: 'choice',
      q: 'A cube with sharp edges: how many vertices does the GPU need?',
      options: ['24', '8', '12'],
      answer: 0,
      explain: 'Three copies of each corner, one for each face with its own normal.'
    },
    {
      t: 'rig', rig: 'units',
      task: 'Make the mug in glTF stand upright and be 10 cm tall.',
      goal: {},
      solve: ['up:Y', 'unit:m']
    },
    {
      t: 'multi',
      q: 'What do OBJ and STL not store? Select all.',
      options: ['Units', 'A hierarchy with transforms', 'Skeletal animation', 'Vertex coordinates'],
      answer: [0, 1, 2],
      explain: 'Every mesh has vertices. But these old formats have no units, hierarchy or animation.'
    },
    {
      t: 'choice',
      q: 'A model arrived gray. What do you check first?',
      options: ['Whether the material and texture files were included', 'The triangle count', 'The up axis'],
      answer: 0,
      explain: 'External textures are the thing most often lost in transit.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Normal', 'Surface direction for lighting'],
        ['UV', 'Coordinates on a texture'],
        ['Transform', 'A node’s translation, rotation, scale'],
        ['Backface culling', 'The back side is not drawn']
      ]
    }
  ]
};

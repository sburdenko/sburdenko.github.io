/** 3D, unit 3, lesson 1: mesh versus math: B-rep and NURBS. */
const W_SOLVE = ['w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w-:0.05', 'w+:0.005'];

export default {
  id: 'f3d.u3.l1',
  title: 'Mesh versus math',
  sub: 'B-rep, NURBS and a true circle',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A cylinder is a formula',
      body: '<p>In a mesh, a cylinder might be 64 triangles: it looks right, but it is an approximation.</p><p>In CAD, a cylinder is “a cylindrical surface with a 50 mm radius”: exact math. You can approximate it down to a micron, compute its volume exactly, or drill a hole dead center.</p>'
    },
    {
      t: 'learn',
      title: 'B-rep: a boundary made of exact pieces',
      body: '<p>CAD describes a solid by its boundary: <b>B-rep</b> (boundary representation). Faces are pieces of exact surfaces: plane, cylinder, torus, NURBS. Edges are exact curves. Vertices are points.</p><p>On top of that there is <b>topology</b>: which face borders which, and along which edge.</p>'
    },
    {
      t: 'choice',
      q: 'How many faces does a cylinder have in B-rep?',
      options: ['3: two flat caps and one cylindrical face', '64', '1', '6'],
      answer: 0,
      explain: 'The side is one face lying on an exact cylindrical surface, plus two flat ones.',
      deep: 'Many geometry kernels (Parasolid, ACIS, Open CASCADE) cut the side face with a “seam”: a helper edge where the surface closes on itself. There are still three faces.'
    },
    {
      t: 'learn',
      title: 'NURBS: how to write any curve',
      body: '<p><b>NURBS</b> (non-uniform rational B-splines) are curves and surfaces defined by control points with weights.</p><p>A plain Bézier curve cannot draw an exact circle, only something close. Give a control point a <b>weight</b>, and it can.</p>'
    },
    {
      t: 'rig', rig: 'nurbs',
      task: 'An arc from three control points. Tune the middle point’s weight so the curve lies on the circle: error under 0.05 mm at a 50 mm radius.',
      goal: { max: 0.001 },
      solve: W_SOLVE
    },
    {
      t: 'choice',
      q: 'Which weight gave an exact quarter circle?',
      options: ['≈ 0.707, the cosine of 45°', '1', '0.5', '2'],
      answer: 0,
      explain: 'For an arc spanning angle θ, the middle weight is cos(θ/2). For 90° that is cos 45° ≈ 0.7071.'
    },
    {
      t: 'choice',
      q: 'With w = 1 the curve is…',
      options: ['A parabola: a plain Bézier curve that only approximates the circle', 'An exact circle', 'A straight line'],
      answer: 0,
      explain: 'Without weights a quadratic Bézier curve is a piece of a parabola. The demo shows the error: about 3 mm at a 50 mm radius.'
    },
    {
      t: 'multi',
      q: 'What can you do exactly with CAD geometry but not with a mesh? Select all.',
      options: ['Compute volume and area exactly', 'Get the exact radius of a hole', 'Build an exact fillet along an edge', 'Show it in a browser right away with no preparation'],
      answer: [0, 1, 2],
      explain: 'For display, though, CAD actually has to be turned into triangles. That is the next lesson.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['B-rep', 'A solid as a set of exact faces'],
        ['NURBS', 'Curves with control points and weights'],
        ['Mesh', 'An approximation with triangles'],
        ['Topology', 'What borders what']
      ]
    }
  ]
};

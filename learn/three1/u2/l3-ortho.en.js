/** Three.js beginner, unit 2, lesson 3: OrthographicCamera. */
export default {
  id: 'tj.u2.l3',
  title: 'OrthographicCamera',
  sub: 'A camera without perspective',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Distant things do not shrink',
      body: '<p>An <b>OrthographicCamera</b> has no perspective: objects of the same size look the same up close and far away. The view pyramid becomes a box.</p><p>It is used for technical drawings and CAD views, isometric games, and 2D interfaces on top of 3D.</p>',
      code: 'const h = 10, w = h * aspect;\nconst camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);'
    },
    {
      t: 'choice',
      q: 'Two identical cubes: one 2 meters away, the other 20. How do they look through an OrthographicCamera?',
      options: ['The same size', 'The far one is 10 times smaller', 'The far one is invisible'],
      answer: 0,
      explain: 'Perspective shrinking only happens with a PerspectiveCamera.'
    },
    {
      t: 'learn',
      title: 'Six numbers instead of fov',
      body: '<p><b>left, right, top, bottom</b> are the box edges in scene units, and <b>near, far</b> work as before. To zoom, use the <code>zoom</code> property (and call <code>updateProjectionMatrix()</code> again after changing it).</p>'
    },
    {
      t: 'multi',
      q: 'Where does an OrthographicCamera make sense? Select all that apply.',
      options: ['A part drawing with exact dimensions', 'An isometric strategy game', 'A top-down minimap', 'A first-person shooter'],
      answer: [0, 1, 2],
      explain: 'A "living" first-person view needs perspective.'
    },
    {
      t: 'tapline',
      q: 'The window got wider and the picture stretched. Which line in resize needs fixing?',
      code: "window.addEventListener('resize', () => {\n  const w = 10 * innerWidth / innerHeight;\n  camera.left = -5; camera.right = 5;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});",
      answer: 2,
      explain: 'The edges must depend on the aspect ratio: camera.left = -w / 2; camera.right = w / 2.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['PerspectiveCamera', 'Like an eye: far things look smaller'],
        ['OrthographicCamera', 'Like a blueprint: sizes stay the same'],
        ['zoom', 'Zooms an ortho camera'],
        ['left / right', 'Width of the visible box']
      ]
    },
    {
      t: 'choice',
      q: 'What do both cameras have in common?',
      options: ['near, far, and the need to call updateProjectionMatrix after changes', 'fov', 'Perspective'],
      answer: 0,
      explain: 'Only the perspective camera has fov.'
    },
    {
      t: 'blanks',
      q: 'Zoom the ortho camera in 2x',
      code: 'camera.___ = 2;\ncamera.___();',
      tiles: ['zoom', 'updateProjectionMatrix', 'fov', 'scale', 'update'],
      answer: ['zoom', 'updateProjectionMatrix'],
      explain: 'An ortho camera has no fov, so you zoom with zoom.'
    }
  ]
};

/** Three.js beginner, unit 1, lesson 2: scene, camera, renderer. */
export default {
  id: 'tj.u1.l2',
  title: 'Your first scene',
  sub: 'Scene, PerspectiveCamera, WebGLRenderer and Mesh',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'The smallest program',
      body: '<p>Create a scene, a camera and a renderer, make a cube, put it in the scene and ask the renderer to draw.</p>',
      code: "const scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);\ncamera.position.z = 5;\n\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(w, h);\ndocument.body.appendChild(renderer.domElement);\n\nconst cube = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshNormalMaterial());\nscene.add(cube);\n\nrenderer.render(scene, camera);"
    },
    {
      t: 'rig', rig: 'tjfirst',
      task: 'The screen is empty. Turn on lines of code until the cube shows up. Above is real Three.js.',
      lock: ['loop'],
      goal: { visible: true },
      solve: ['add', 'camz:5', 'render']
    },
    {
      t: 'choice',
      q: 'Why is the cube invisible when camera.position.z = 0?',
      options: ['The camera is inside the cube: from inside, the faces point away from us and are not drawn', 'z = 0 is not allowed', 'The camera is looking up'],
      answer: 0,
      explain: 'Both the camera and the cube start at (0, 0, 0). That is why you move the camera back.'
    },
    {
      t: 'learn',
      title: 'Where the camera looks',
      body: '<p>By default the camera sits at the origin and looks down the <b>−Z</b> axis, "into the screen". So you move it back along +Z: <code>camera.position.z = 5</code>. Y points up, X points right.</p>'
    },
    {
      t: 'order',
      q: 'Put the steps in order',
      items: ['Create the scene', 'Create the camera and move it back', 'Create the renderer and add its canvas to the page', 'Create a Mesh and add it to the scene', 'renderer.render(scene, camera)'],
      explain: 'The creation order matters less than calling render once everything is ready.'
    },
    {
      t: 'tapline',
      q: 'Which line keeps the cube from showing up?',
      code: 'const cube = new THREE.Mesh(geometry, material);\ncube.position.x = 1;\nrenderer.render(scene, camera);',
      answer: 0,
      explain: 'The cube is created but never added to the scene: scene.add(cube) is missing. The renderer only draws the scene.'
    },
    {
      t: 'blanks',
      q: 'A Mesh from a geometry and a material',
      code: 'const box = new THREE.___(\n  new THREE.___(1, 1, 1),\n  new THREE.MeshNormalMaterial());',
      tiles: ['Mesh', 'BoxGeometry', 'Cube', 'Box', 'Object3D'],
      answer: ['Mesh', 'BoxGeometry'],
      explain: 'Three.js has no Cube class. A cube is a Mesh with a BoxGeometry.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['BoxGeometry', 'Shape: a box'],
        ['MeshNormalMaterial', 'Colors by face direction, needs no light'],
        ['renderer.domElement', 'The canvas element for the page'],
        ['scene.add', 'Put an object into the world']
      ]
    },
    {
      t: 'choice',
      q: 'Where does a Three.js camera look by default?',
      options: ['Down −Z, into the screen', 'Up +Y', 'Right along +X'],
      answer: 0,
      explain: 'To look at a specific point, use camera.lookAt(x, y, z).'
    }
  ]
};

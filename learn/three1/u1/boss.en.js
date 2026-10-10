/** Unit 1 final: your first scene. */
export default {
  id: 'tj.u1.boss',
  title: 'Final: your first scene',
  sub: 'From an empty canvas to a spinning cube',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Build a spinning cube from scratch.',
      goal: { visible: true, spin: true },
      solve: ['add', 'camz:5', 'loop']
    },
    {
      t: 'tapline',
      q: 'After which line did someone forget to add the canvas to the page?',
      code: "const renderer = new THREE.WebGLRenderer();\nrenderer.setSize(800, 600);\nscene.add(cube);\nrenderer.render(scene, camera);",
      answer: 1,
      explain: 'The renderer.domElement canvas never got onto the page: document.body.appendChild(renderer.domElement).'
    },
    {
      t: 'multi',
      q: 'Why might the screen be empty? Select all that apply.',
      options: ['The Mesh was not added to the scene', 'The camera is inside the object', 'render was never called', 'The camera was moved back along +Z'],
      answer: [0, 1, 2],
      explain: 'Moving the camera back along +Z is exactly the right thing to do.'
    },
    {
      t: 'choice',
      q: 'What does cube.rotation.y += 1.5 * dt do?',
      options: ['Rotates 1.5 radians per second at any frame rate', 'Rotates 1.5 degrees per frame', 'Moves the cube up'],
      answer: 0,
      explain: 'Radians, not degrees. A full turn is 2π ≈ 6.28.'
    },
    {
      t: 'order',
      q: 'The resize handler',
      items: ['camera.aspect = w / h', 'camera.updateProjectionMatrix()', 'renderer.setSize(w, h)'],
      explain: 'Camera first, then the canvas.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['WebGL', 'GPU access from the browser'],
        ['Three.js', 'A friendly library on top of it'],
        ['Mesh', 'A visible object'],
        ['−Z', 'Where the camera looks']
      ]
    },
    {
      t: 'blanks',
      q: 'Spinning in a loop',
      code: 'renderer.___(() => {\n  cube.rotation.y += 0.01;\n  renderer.___(scene, camera);\n});',
      tiles: ['setAnimationLoop', 'render', 'loop', 'draw', 'update'],
      answer: ['setAnimationLoop', 'render'],
      explain: 'Without render inside the loop, the scene would change but no frames would be drawn.'
    },
    {
      t: 'choice',
      q: 'What does renderer.render(scene, camera) draw?',
      options: ['One frame: the scene as seen by this camera', 'An endless animation', 'Only the camera'],
      answer: 0,
      explain: 'For animation, call render every frame.'
    }
  ]
};

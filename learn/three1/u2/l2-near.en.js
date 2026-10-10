/** Three.js beginner, unit 2, lesson 2: near, far, lookAt and OrbitControls. */
export default {
  id: 'tj.u2.l2',
  title: 'near, lookAt and OrbitControls',
  sub: 'How not to clip nearby objects, and how to let users orbit the scene',
  minutes: 7,
  cards: [
    {
      t: 'rig', rig: 'tjcam',
      task: 'The red cube is right next to the camera, but you cannot see it. Fix it.',
      start: { near: 5, z: 3 }, lock: ['fov', 'far'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['near:0.1']
    },
    {
      t: 'learn',
      title: 'Why not set near = 0.000001',
      body: '<p>Each pixel\'s depth is stored with limited precision, and almost all of it is spent on the area close to near. Make near too small and distant surfaces start to flicker, showing through each other. This is <b>z-fighting</b>.</p><p>The rule: near as large as possible, far as small as possible, as long as the scene still fits.</p>'
    },
    {
      t: 'choice',
      q: 'Distant walls flicker and "bleed" through each other. What do you check first?',
      options: ['Whether near is too small (and far too large)', 'The wall color', 'The frame rate'],
      answer: 0,
      explain: 'The classic cause of z-fighting is near = 0.0001 with far = 100000.'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'The blue cube should NOT be drawn (it is background and just gets in the way), but red and green should.',
      lock: ['fov', 'z'],
      goal: { see: ['a', 'b'], hide: ['c'] },
      solve: ['far:10']
    },
    {
      t: 'learn',
      title: 'lookAt',
      body: '<p>You can put the camera anywhere and turn it toward a point: <code>camera.lookAt(x, y, z)</code>.</p>',
      code: 'camera.position.set(4, 3, 6);\ncamera.lookAt(0, 0, 0);'
    },
    {
      t: 'learn',
      title: 'OrbitControls: spin it with the mouse',
      body: '<p>A ready-made add-on: dragging orbits the camera around a target, the wheel zooms. With <code>enableDamping</code> the motion is smooth, and then you need <code>controls.update()</code> in the loop.</p>',
      code: "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n\nconst controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;\n\nrenderer.setAnimationLoop(() => {\n  controls.update();\n  renderer.render(scene, camera);\n});"
    },
    {
      t: 'tapline',
      q: 'You turned on enableDamping and the camera jerks around. Before which line does controls.update() belong?',
      code: 'renderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});',
      answer: 2,
      explain: 'controls.update() goes before render. It is what produces the smooth easing.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['near too large', 'Nearby object is clipped'],
        ['far too small', 'Distant object is clipped'],
        ['near tiny', 'z-fighting flicker'],
        ['lookAt', 'Turn the camera toward a point']
      ]
    },
    {
      t: 'blanks',
      q: 'Where to import OrbitControls from',
      code: "import { OrbitControls } from 'three/___/controls/OrbitControls.js';",
      tiles: ['addons', 'examples', 'src', 'controls'],
      answer: ['addons'],
      explain: 'three/addons/ is the short path to the examples and add-ons shipped in the three package.'
    }
  ]
};

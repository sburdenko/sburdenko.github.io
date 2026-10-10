/** Three.js beginner, unit 1, lesson 3: animation and window size. */
export default {
  id: 'tj.u1.l3',
  title: 'Animation and window size',
  sub: 'setAnimationLoop, frame time and resize',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A picture is drawn once',
      body: '<p><code>renderer.render</code> draws a single frame. To make things move, you have to keep drawing frames, about 60 times a second, and change the scene in between.</p>',
      code: 'renderer.setAnimationLoop(() => {\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n});'
    },
    {
      t: 'rig', rig: 'tjfirst',
      task: 'The cube is standing still. Make it spin.',
      start: { added: true, camZ: 5, render: true }, lock: ['add', 'camz'],
      goal: { visible: true, spin: true },
      solve: ['loop']
    },
    {
      t: 'choice',
      q: 'Why is setAnimationLoop better than your own while(true) loop?',
      options: ['The browser calls your function before each screen frame and the page does not freeze', 'It draws faster', 'while works just as well'],
      answer: 0,
      explain: 'Under the hood it uses requestAnimationFrame, and you also need it for VR/AR sessions.'
    },
    {
      t: 'learn',
      title: 'Speed should not depend on the monitor',
      body: '<p>With <code>+= 0.01</code> per frame, the cube spins more than twice as fast on a 144 Hz monitor as on a 60 Hz one. The right way is to multiply by the time since the last frame.</p>',
      code: 'const clock = new THREE.Clock();\nrenderer.setAnimationLoop(() => {\n  const dt = clock.getDelta();        // seconds since the last frame\n  cube.rotation.y += 1.5 * dt;        // 1.5 radians per second\n  renderer.render(scene, camera);\n});'
    },
    {
      t: 'choice',
      q: 'On a teammate\'s 120 Hz monitor the cube spins twice as fast. Why?',
      options: ['Rotation is added per frame, not per second, and they get twice as many frames', 'Their GPU is faster', 'A bug in Three.js'],
      answer: 0,
      explain: 'Multiply the speed by dt from THREE.Clock.'
    },
    {
      t: 'learn',
      title: 'The window was resized',
      body: '<p>When the window size changes, update both the camera and the renderer. Otherwise the picture gets stretched.</p>',
      code: "window.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(innerWidth, innerHeight);\n});\nrenderer.setPixelRatio(Math.min(devicePixelRatio, 2));"
    },
    {
      t: 'tapline',
      q: 'The window got wider and the cube looks squashed. Tap the line that should be followed by one more call.',
      code: "window.addEventListener('resize', () => {\n  camera.aspect = innerWidth / innerHeight;\n  renderer.setSize(innerWidth, innerHeight);\n});",
      answer: 1,
      explain: 'After changing aspect (or fov, near, far) you need camera.updateProjectionMatrix(). Otherwise the camera keeps using the old values.'
    },
    {
      t: 'choice',
      q: 'Why Math.min(devicePixelRatio, 2)?',
      options: ['On a screen with pixel ratio 3 you would render 9 times as many pixels, which is heavy for a phone', 'It does not work without it', 'To make things blurry'],
      answer: 0,
      explain: 'A ratio of 2 already looks sharp, and the cost grows with the square.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['setAnimationLoop', 'Draw every frame'],
        ['clock.getDelta()', 'Time since the last frame'],
        ['updateProjectionMatrix', 'Apply new camera settings'],
        ['setPixelRatio', 'Sharpness on dense screens']
      ]
    }
  ]
};

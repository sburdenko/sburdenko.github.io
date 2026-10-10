/** Three.js beginner, unit 2, lesson 1: PerspectiveCamera. */
export default {
  id: 'tj.u2.l1',
  title: 'PerspectiveCamera',
  sub: 'Field of view, aspect, near and far',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'The view pyramid',
      body: '<p>A camera sees a truncated pyramid called the <b>frustum</b>. Four numbers define it:</p><p><b>fov</b>: the vertical field of view in degrees.<br><b>aspect</b>: frame width ÷ height.<br><b>near</b>: nothing closer than this is drawn.<br><b>far</b>: nothing farther than this is drawn either.</p>',
      code: 'new THREE.PerspectiveCamera(fov, aspect, near, far);'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'The green cube sits off to the side and is out of frame. Widen the view without moving the camera.',
      start: { fov: 35, z: 3 }, lock: ['z', 'near', 'far'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['fov:50']
    },
    {
      t: 'choice',
      q: 'What does a large fov, say 100, do?',
      options: ['You see more, but objects get smaller and the edges distort, like a wide-angle lens', 'Objects get bigger', 'The camera sees farther'],
      answer: 0,
      explain: 'Typical scenes use 40–75.'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'The blue cube is far away and has disappeared. Fix it without touching fov or the camera position.',
      start: { far: 10 }, lock: ['fov', 'z', 'near'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['far:50']
    },
    {
      t: 'choice',
      q: 'Why did the blue cube disappear?',
      options: ['It is 20 units away and far = 10: anything beyond far gets cut off', 'It is too small', 'It is behind the camera'],
      answer: 0,
      explain: 'far is the back wall of the view frustum.'
    },
    {
      t: 'learn',
      title: 'Units',
      body: '<p>Three.js has no built-in units: 1 is just 1. But glTF and physics engines agree that 1 = 1 meter, and it pays to stick with that: lights and shadows are tuned for that scale.</p>'
    },
    {
      t: 'match',
      q: 'Match each parameter to its meaning',
      pairs: [
        ['fov', 'Vertical field of view'],
        ['aspect', 'Width ÷ height'],
        ['near', 'Near limit'],
        ['far', 'Far limit']
      ]
    },
    {
      t: 'blanks',
      q: 'A camera with a 60° angle that sees from 0.1 to 1000',
      code: 'new THREE.PerspectiveCamera(___, w / h, ___, 1000);',
      tiles: ['60', '0.1', '0', '1000', '90'],
      answer: ['60', '0.1'],
      explain: 'near = 0 is not allowed. More on that in the next lesson.'
    },
    {
      t: 'choice',
      q: 'The fov of a PerspectiveCamera is the angle…',
      options: ['vertically', 'horizontally', 'diagonally'],
      answer: 0,
      explain: 'The horizontal angle is derived from the vertical one and aspect.'
    }
  ]
};

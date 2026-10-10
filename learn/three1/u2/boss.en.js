/** Unit 2 final: the camera. */
export default {
  id: 'tj.u2.boss',
  title: 'Final: the camera',
  sub: 'The view frustum under control',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjcam',
      task: 'Everything is broken: the angle is too narrow, near is too far away and far is too close. Make all three cubes visible.',
      start: { fov: 35, z: 3, near: 5, far: 10 },
      goal: { see: ['a', 'b', 'c'] },
      solve: ['fov:50', 'near:0.1', 'far:50']
    },
    {
      t: 'choice',
      q: 'You set camera.fov = 75 and nothing changed. Why?',
      options: ['camera.updateProjectionMatrix() was not called', 'fov cannot be changed', 'You have to recreate the renderer'],
      answer: 0,
      explain: 'The camera caches its projection matrix.'
    },
    {
      t: 'multi',
      q: 'What will cut an object out of the picture? Select all that apply.',
      options: ['It is closer than near', 'It is farther than far', 'It is outside the field of view', 'It is too dark'],
      answer: [0, 1, 2],
      explain: 'A dark object is still drawn, just dark.'
    },
    {
      t: 'blanks',
      q: 'Place the camera and turn it toward the center',
      code: 'camera.position.set(4, 3, 6);\ncamera.___(0, 0, 0);',
      tiles: ['lookAt', 'rotate', 'target', 'look'],
      answer: ['lookAt'],
      explain: 'lookAt turns an object to face a point.'
    },
    {
      t: 'match',
      q: 'Match the symptom to the cause',
      pairs: [
        ['Nearby object is clipped', 'near is large'],
        ['Distant object vanished', 'far is small'],
        ['Surfaces flicker', 'near is tiny'],
        ['Picture is stretched', 'aspect was not updated']
      ]
    },
    {
      t: 'choice',
      q: 'Which camera fits an isometric game?',
      options: ['OrthographicCamera', 'PerspectiveCamera with fov 100', 'Either one'],
      answer: 0,
      explain: 'Isometric means no perspective shrinking.'
    },
    {
      t: 'choice',
      q: 'OrbitControls with enableDamping. What must be in the loop?',
      options: ['controls.update()', 'controls.reset()', 'Nothing'],
      answer: 0,
      explain: 'Calling update every frame smoothly finishes the motion.'
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'Keep only red and green in the frame: blue is background and should not be drawn. Do not touch fov or the camera.',
      lock: ['fov', 'z'],
      goal: { see: ['a', 'b'], hide: ['c'] },
      solve: ['far:10']
    }
  ]
};

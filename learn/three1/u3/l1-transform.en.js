/** Three.js beginner, unit 3, lesson 1: position, rotation, scale. */
export default {
  id: 'tj.u3.l1',
  title: 'position, rotation, scale',
  sub: 'Where an object is, how it is turned and how big it is',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Three properties of every object',
      body: '<p>Every object in the scene (a Mesh, a camera, a light, a group) has:</p><p><b>position</b>: where it is, as x, y, z.<br><b>rotation</b>: rotation around the X, Y, Z axes, <b>in radians</b>.<br><b>scale</b>: size along each axis, where 1 is the original size.</p>',
      code: 'cube.position.set(2, 0.5, 0);\ncube.rotation.y = Math.PI / 4;     // 45°\ncube.scale.set(1, 2, 1);           // twice as tall'
    },
    {
      t: 'choice',
      q: 'cube.rotation.y = 90: how far does the cube turn?',
      options: ['90 radians, which is more than 14 full turns, not 90°', '90°', 'It does not turn'],
      answer: 0,
      explain: 'You need Math.PI / 2 or THREE.MathUtils.degToRad(90).'
    },
    {
      t: 'blanks',
      q: 'Rotate 180° around Y',
      code: 'mesh.rotation.y = Math.___;',
      tiles: ['PI', 'PI / 2', '180', 'TAU'],
      answer: ['PI'],
      explain: 'π radians = 180°.'
    },
    {
      t: 'learn',
      title: 'Axes in Three.js',
      body: '<p><b>Y is up</b>, X is right, Z points toward the viewer. It is a right-handed coordinate system, the same as glTF. In Blender and many CAD tools Z is up, which is why imported models sometimes end up "lying down".</p>'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['position.y = 2', 'Raise by 2'],
        ['rotation.y = Math.PI / 2', 'Turn 90° around the vertical'],
        ['scale.setScalar(0.5)', 'Shrink by half'],
        ['scale.x = -1', 'Mirror it']
      ]
    },
    {
      t: 'choice',
      q: 'A model from Blender is lying on its side. Likely cause?',
      options: ['In Blender Z is up, in Three.js it is Y', 'The model is broken', 'The camera is rotated'],
      answer: 0,
      explain: 'Blender\'s glTF exporter usually converts the axes for you (+Y Up). Check that option.'
    },
    {
      t: 'multi',
      q: 'Which objects have position, rotation and scale? Select all that apply.',
      options: ['Mesh', 'Camera', 'Light', 'Group', 'Material'],
      answer: [0, 1, 2, 3],
      explain: 'All of these inherit from Object3D. A material is not a scene object.'
    },
    {
      t: 'choice',
      q: 'What does THREE.MathUtils.degToRad(180) return?',
      options: ['≈ 3.1416', '180', '0.5'],
      answer: 0,
      explain: 'π.'
    }
  ]
};

/** Unit 3 final: objects and hierarchy. */
export default {
  id: 'tj.u3.boss',
  title: 'Final: objects in the scene',
  sub: 'Transforms and hierarchy',
  minutes: 5,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjgraph',
      task: 'Make the Earth twice as big, and let the Moon travel alongside it at a distance of 2.4. Three orbit steps.',
      goal: { orbits: 3, dist: 2.4 },
      solve: ['parent:earth', 'scale', 'orbit', 'orbit', 'orbit']
    },
    {
      t: 'choice',
      q: 'What do you write to rotate by 30°?',
      options: ['rotation.y = THREE.MathUtils.degToRad(30)', 'rotation.y = 30', 'rotation.y = 30 * 180 / Math.PI'],
      answer: 0,
      explain: 'The third option converts in the opposite direction.'
    },
    {
      t: 'tapline',
      q: 'A car wheel should turn along with the car. Which line gets in the way?',
      code: 'const car = new THREE.Group();\ncar.add(body);\nscene.add(wheel);\ncar.rotation.y = Math.PI / 6;',
      answer: 2,
      explain: 'The wheel lives in the scene, not in the car. You need car.add(wheel).'
    },
    {
      t: 'blanks',
      q: 'Make the Moon a satellite of the Earth',
      code: 'earth.___(moon);\nmoon.position.x = 1.2;',
      tiles: ['add', 'attach', 'push', 'set'],
      answer: ['add'],
      explain: 'attach exists too: it keeps the world position when the parent changes. Here you want add.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Up axis in Three.js', 'Y'],
        ['Up axis in Blender', 'Z'],
        ['Unit of angle', 'Radian'],
        ['Invisible holder', 'Group']
      ]
    },
    {
      t: 'multi',
      q: 'Which are true? Select all that apply.',
      options: ['A child\'s position is measured from its parent', 'A parent\'s scale also stretches the distances to its children', 'getWorldPosition gives world coordinates', 'The scene has no position'],
      answer: [0, 1, 2],
      explain: 'Scene is an Object3D too, so it does have a position.'
    },
    {
      t: 'choice',
      q: 'How do you build a solar system where the Earth moves in a circle?',
      options: ['Put the Earth in a Group at the center, 4 units out, and rotate the group', 'Set x and z by hand every frame with sin and cos; it is the only way', 'Rotate the Earth itself'],
      answer: 0,
      explain: 'sin/cos works too, but a group is simpler, and the Earth\'s children come along for the ride.'
    },
    {
      t: 'rig', rig: 'tjgraph',
      task: 'Fix the system: the Moon stays put while the Earth flies away. Two orbit steps.',
      lock: ['scale'],
      goal: { orbits: 2, dist: 1.2 },
      solve: ['parent:earth', 'orbit', 'orbit']
    }
  ]
};

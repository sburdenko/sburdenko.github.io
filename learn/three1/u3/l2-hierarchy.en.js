/** Three.js beginner, unit 3, lesson 2: hierarchy. */
export default {
  id: 'tj.u3.l2',
  title: 'Hierarchy: parents and children',
  sub: 'Group, local and world coordinates',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'Objects inside objects',
      body: '<p>Any object can be a parent: <code>earth.add(moon)</code>. A child\'s position is measured <b>from its parent</b>: a Moon at <code>x = 1.2</code> is 1.2 from the Earth, not from the center of the world.</p><p>Move, rotate or scale the parent, and the children go along with it.</p>'
    },
    {
      t: 'learn',
      title: 'An empty parent: Group',
      body: '<p><code>THREE.Group</code> is an invisible holder object. Take a solar system: the Earth sits inside a "pivot" group, 4 units from the center. Rotate the pivot and the Earth travels along its orbit.</p>'
    },
    {
      t: 'rig', rig: 'tjgraph',
      task: 'The Moon should travel with the Earth. Pick the right parent for it and take two orbit steps.',
      lock: ['scale'],
      goal: { orbits: 2, dist: 1.2 },
      solve: ['parent:earth', 'orbit', 'orbit']
    },
    {
      t: 'choice',
      q: 'Why did the Moon stay put with scene.add(moon)?',
      options: ['Its parent is the scene, and the scene does not rotate; the Earth\'s pivot has nothing to do with it', 'The Moon is too light', 'A renderer bug'],
      answer: 0,
      explain: 'Motion is passed only down the chain from parent to children.'
    },
    {
      t: 'rig', rig: 'tjgraph',
      task: 'Make the Earth twice as big and take one orbit step. What happened to the Moon?',
      start: { parent: 'earth' }, lock: ['parent'],
      goal: { orbits: 1, dist: 2.4 },
      solve: ['scale', 'orbit']
    },
    {
      t: 'choice',
      q: 'Why did the Moon move out to 2.4 and grow too?',
      options: ['A parent\'s scale applies to everything inside it: both the size and the position of its children', 'The Moon was pulled in', 'Pure coincidence'],
      answer: 0,
      explain: 'To grow only the Earth, scale it in a separate group with no children.'
    },
    {
      t: 'learn',
      title: 'Where the object really is',
      body: '<p><code>moon.position</code> is the local position relative to the parent. To get the world position, ask like this:</p>',
      code: 'const p = new THREE.Vector3();\nmoon.getWorldPosition(p);   // coordinates in the world'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Group', 'Invisible parent'],
        ['moon.position', 'Position relative to the parent'],
        ['getWorldPosition', 'Position in the world'],
        ['parent.add(child)', 'Make it a child']
      ]
    },
    {
      t: 'multi',
      q: 'What does a child inherit from its parent? Select all that apply.',
      options: ['Translation', 'Rotation', 'Scale', 'Material'],
      answer: [0, 1, 2],
      explain: 'Each Mesh has its own material.'
    }
  ]
};

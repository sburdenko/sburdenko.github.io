/** Three.js beginner, unit 4, lesson 2: lights. */
export default {
  id: 'tj.u4.l2',
  title: 'Lights',
  sub: 'Ambient, Directional, Point: how each one shines',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'The main four',
      body: '<p><b>AmbientLight</b>: even light from everywhere. It adds no depth, it just "lifts the shadows".<br><b>DirectionalLight</b>: like the sun, parallel rays from one side.<br><b>PointLight</b>: a light bulb, shining in all directions and fading with distance.<br><b>SpotLight</b>: a spotlight, shining in a cone.</p>'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Only an AmbientLight, so the knot looks flat. Add a bulb to bring out the shape.',
      start: { amb: true }, lock: ['shadows', 'mat', 'dir'],
      goal: { look: 'shaded' },
      solve: ['pt']
    },
    {
      t: 'choice',
      q: 'Why does the shape look flat with just an AmbientLight?',
      options: ['It shines equally from every side, so there are no lit and dark sides', 'It is too weak', 'It does not work with Standard'],
      answer: 0,
      explain: 'The eye reads shape from differences in lighting.'
    },
    {
      t: 'learn',
      title: 'Brightness in physical units',
      body: '<p>Since r155, lighting in Three.js is physically correct. PointLight and SpotLight have <code>decay = 2</code>: brightness drops with the square of the distance. So a bulb with <code>intensity = 1</code> five meters from an object barely lights it, and people use values in the tens.</p>',
      code: 'const bulb = new THREE.PointLight(0xffaa66, 25);   // color, intensity\nbulb.position.set(-2, 2, 1.5);\nscene.add(bulb);'
    },
    {
      t: 'choice',
      q: 'A PointLight with intensity 1 barely lights an object 5 meters away. Why?',
      options: ['Light fades with distance squared: at 5 m it is 25 times weaker', 'PointLight does not reach beyond 1 m', 'You need a Basic material'],
      answer: 0,
      explain: 'Raise the intensity or move the light closer.'
    },
    {
      t: 'learn',
      title: 'Where a DirectionalLight points',
      body: '<p>A directional light shines from its <code>position</code> toward its <code>target</code> (the world origin by default). You can move the target, but then you have to add it to the scene.</p>',
      code: 'const sun = new THREE.DirectionalLight(0xffffff, 2.5);\nsun.position.set(3, 5, 2);\nscene.add(sun);'
    },
    {
      t: 'match',
      q: 'Match each light to its real-world twin',
      pairs: [
        ['DirectionalLight', 'The sun'],
        ['PointLight', 'A light bulb'],
        ['SpotLight', 'A spotlight'],
        ['AmbientLight', 'Diffuse light from everywhere']
      ]
    },
    {
      t: 'multi',
      q: 'A classic, inexpensive lighting setup? Select everything it needs.',
      options: ['A dimmer AmbientLight or HemisphereLight, so shadows are not pitch black', 'One DirectionalLight as the key light', 'Ten PointLights', 'No lights, MeshBasicMaterial everywhere'],
      answer: [0, 1],
      explain: 'Every light is extra shader work for every pixel.'
    }
  ]
};

/** Three.js beginner, unit 4, lesson 3: shadows. */
export default {
  id: 'tj.u4.l3',
  title: 'Shadows',
  sub: 'Four flags and one shadow map',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'Shadows are off by default',
      body: '<p>Shadows are expensive, so Three.js only draws them when you ask explicitly. You need <b>all four</b> settings:</p>',
      code: 'renderer.shadowMap.enabled = true;   // the renderer supports shadows\nsun.castShadow = true;               // the light casts shadows\nknot.castShadow = true;              // the object casts them\nfloor.receiveShadow = true;          // the floor receives them'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'The sun is shining, but there is no shadow on the floor. Turn on everything it takes.',
      start: { amb: true, dir: true }, lock: ['mat'],
      goal: { look: 'shaded', shadow: true },
      solve: ['sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'choice',
      q: 'You set castShadow on the object and the light, and receiveShadow on the floor, but there is no shadow. What did you forget?',
      options: ['renderer.shadowMap.enabled = true', 'scene.shadow = true', 'Shadows only work with an OrthographicCamera'],
      answer: 0,
      explain: 'Without it, the renderer never builds a shadow map at all.'
    },
    {
      t: 'learn',
      title: 'How it works',
      body: '<p>The light "photographs" the scene from its own point of view into a depth texture, the <b>shadow map</b>. Then each pixel is checked: can the light see it? If not, it is in shadow.</p><p>The map size is <code>light.shadow.mapSize</code> (512×512 by default). Bigger is sharper, but costlier.</p>'
    },
    {
      t: 'choice',
      q: 'Shadows look jagged and blurry. What do you try first?',
      options: ['Increase light.shadow.mapSize and tighten the shadow camera\'s area', 'Add more lights', 'Turn off antialias'],
      answer: 0,
      explain: 'A DirectionalLight renders shadows with an ortho camera, light.shadow.camera. The smaller its box, the sharper the result.'
    },
    {
      t: 'multi',
      q: 'Which lights can cast shadows? Select all that apply.',
      options: ['DirectionalLight', 'PointLight', 'SpotLight', 'AmbientLight'],
      answer: [0, 1, 2],
      explain: 'Ambient shines from everywhere, so there is no side to cast a shadow from. A PointLight renders six maps, which is expensive.'
    },
    {
      t: 'match',
      q: 'Match each flag to its meaning',
      pairs: [
        ['shadowMap.enabled', 'The renderer supports shadows'],
        ['light.castShadow', 'The light builds a shadow map'],
        ['mesh.castShadow', 'The object casts a shadow'],
        ['mesh.receiveShadow', 'Shadows fall on the object']
      ]
    },
    {
      t: 'blanks',
      q: 'The floor receives shadows',
      code: 'floor.___ = true;',
      tiles: ['receiveShadow', 'castShadow', 'shadow', 'shadowMap'],
      answer: ['receiveShadow'],
      explain: 'An object can both cast and receive: set both flags.'
    }
  ]
};

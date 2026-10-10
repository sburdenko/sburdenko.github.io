/** Unit 4 final: lights and materials. */
export default {
  id: 'tj.u4.boss',
  title: 'Final: lights and materials',
  sub: 'Depth and shadows',
  minutes: 6,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjlight',
      task: 'From scratch: a shaded knot that casts a shadow on the floor, with a Lambert material.',
      start: { mat: 'basic' },
      goal: { look: 'shaded', shadow: true },
      solve: ['mat:lambert', 'dir', 'sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'choice',
      q: 'The scene is set up right and the camera points at the model, but the screen is black. The model uses MeshStandardMaterial. First guess?',
      options: ['There are no lights', 'The camera is broken', 'You need WebGPU'],
      answer: 0,
      explain: 'Temporarily switch to MeshNormalMaterial or add an AmbientLight, and check.'
    },
    {
      t: 'tapline',
      q: 'Which line is unnecessary for the knot\'s shadow?',
      code: 'renderer.shadowMap.enabled = true;\nsun.castShadow = true;\nambient.castShadow = true;\nknot.castShadow = true;\nfloor.receiveShadow = true;',
      answer: 2,
      explain: 'AmbientLight casts no shadows: it has no direction.'
    },
    {
      t: 'match',
      q: 'Match the symptom to the cause',
      pairs: [
        ['Everything is black', 'No light for Standard'],
        ['No sense of depth', 'Only Ambient, or a Basic material'],
        ['No shadow', 'One of the four flags is missing'],
        ['Lamp does not reach from afar', 'Falloff with distance squared']
      ]
    },
    {
      t: 'multi',
      q: 'What makes a scene heavier for the GPU? Select all that apply.',
      options: ['Lots of lights', 'PointLight shadows', 'A large shadow.mapSize', 'MeshBasicMaterial'],
      answer: [0, 1, 2],
      explain: 'Basic is the cheapest material there is.'
    },
    {
      t: 'blanks',
      q: 'A smooth metal surface',
      code: '{ metalness: ___, roughness: ___ }',
      tiles: ['1', '0.1', '0', '5'],
      answer: ['1', '0.1'],
      explain: 'And do not forget an environment map: metal needs something to reflect.'
    },
    {
      t: 'choice',
      q: 'What makes MeshStandardMaterial better than Lambert?',
      options: ['It is physically based: highlights, roughness, metal, and it matches glTF materials', 'It is cheaper', 'It needs no light'],
      answer: 0,
      explain: 'Use Lambert when you want cheap and no highlights.'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'Only ambient light, so the knot looks flat. Give it depth without touching the material.',
      start: { amb: true }, lock: ['mat', 'shadows'],
      goal: { look: 'shaded' },
      solve: ['dir']
    }
  ]
};

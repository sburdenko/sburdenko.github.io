/** Three.js beginner, unit 4, lesson 1: materials. */
export default {
  id: 'tj.u4.l1',
  title: 'Materials',
  sub: 'Basic, Lambert, Standard, and why everything is black',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A material is how a surface looks',
      body: '<p><b>MeshBasicMaterial</b>: a flat fill that ignores light.<br><b>MeshLambertMaterial</b>: matte, cheap, reacts to light.<br><b>MeshStandardMaterial</b>: physically based (PBR), with <code>roughness</code> and <code>metalness</code>. The de facto standard, same as in glTF.</p>'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'MeshStandardMaterial, yet all you see is a black silhouette. Fix it with light.',
      lock: ['shadows', 'mat'],
      goal: { look: 'shaded' },
      solve: ['dir']
    },
    {
      t: 'choice',
      q: 'Why is MeshStandardMaterial black without light?',
      options: ['It computes how much light the surface reflects; no light, nothing to reflect', 'It is a bug', 'Black is the default color'],
      answer: 0,
      explain: 'The most common beginner mistake: "I see nothing" even though the camera is fine.'
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'There is light, but the knot looks flat, with no depth. Change the material.',
      start: { mat: 'basic', dir: true }, lock: ['shadows'],
      goal: { look: 'shaded' },
      solve: ['mat:standard']
    },
    {
      t: 'learn',
      title: 'roughness and metalness',
      body: '<p><b>roughness</b>: 0 is mirror smooth, 1 is matte (the default is 1).<br><b>metalness</b>: 0 is plastic, wood, stone; 1 is metal.</p><p>Metal needs something to reflect: without an environment map (<code>scene.environment</code>) it looks dark. That is an intermediate-level topic.</p>',
      code: 'new THREE.MeshStandardMaterial({ color: 0x4f9dff, roughness: 0.3, metalness: 0 });'
    },
    {
      t: 'match',
      q: 'Match each material to its use',
      pairs: [
        ['MeshBasicMaterial', 'No light needed: UI, debugging'],
        ['MeshLambertMaterial', 'Cheap and matte'],
        ['MeshStandardMaterial', 'Realistic, PBR'],
        ['MeshNormalMaterial', 'Check normals and shape']
      ]
    },
    {
      t: 'multi',
      q: 'Which materials react to light? Select all that apply.',
      options: ['MeshLambertMaterial', 'MeshStandardMaterial', 'MeshPhysicalMaterial', 'MeshBasicMaterial'],
      answer: [0, 1, 2],
      explain: 'Physical is an extended Standard: clearcoat, glass, fabric.'
    },
    {
      t: 'blanks',
      q: 'Matte plastic',
      code: 'new THREE.MeshStandardMaterial({ color: 0xff0000, ___: 0.9, ___: 0 });',
      tiles: ['roughness', 'metalness', 'shininess', 'opacity'],
      answer: ['roughness', 'metalness'],
      explain: 'shininess belongs to Phong, not Standard.'
    }
  ]
};

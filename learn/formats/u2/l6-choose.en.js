/** 3D, unit 2, lesson 6: which format to choose and what gets lost in conversion. */
export default {
  id: 'f3d.u2.l6',
  title: 'Which format to choose',
  sub: 'The task decides, not fashion',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'No best format, only the right one',
      body: '<p>3D printing needs only the shape: STL or 3MF.<br>Web and AR on Android: glTF/GLB. AR on iPhone: USDZ.<br>Animation between programs: FBX.<br>Scans: PLY.<br>Large studio scenes: USD.</p>'
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A part for 3D printing: only the shape matters. Pick the simplest format for printing.',
      assetName: 'bracket part',
      asset: ['geometry'],
      goal: { kind: 'fmt', fmt: 'stl' },
      solve: ['fmt:stl']
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A scan with a color at every point. Find a simple format, with no scenes or animation, that keeps vertex colors.',
      assetName: 'sculpture scan',
      asset: ['geometry', 'normals', 'vcolor'],
      goal: { kind: 'keep', not: ['gltf', 'fbx', 'usd', 'dae'] },
      solve: ['fmt:ply']
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A character with PBR, animation and a camera for AR on iPhone. Everything has to survive.',
      assetName: 'character for AR Quick Look',
      asset: ['geometry', 'normals', 'uv', 'pbr', 'hierarchy', 'skin', 'cameras', 'units'],
      goal: { kind: 'fmt', fmt: 'usd' },
      solve: ['fmt:usd']
    },
    {
      t: 'order',
      q: 'A model from Blender has to go on a website. Put the steps in order',
      items: ['Check the scale and up axis', 'Export to glTF/GLB', 'Compress geometry and textures (Draco, KTX2)', 'Show it in three.js or <model-viewer>'],
      explain: 'Correct units first, then the delivery format, then compression and display.'
    },
    {
      t: 'match',
      q: 'Match each task to a format',
      pairs: [
        ['3D printing', 'STL or 3MF'],
        ['Web and AR on Android', 'glTF/GLB'],
        ['AR on iPhone', 'USDZ'],
        ['Animation between programs', 'FBX']
      ]
    },
    {
      t: 'choice',
      q: 'Why does an FBX → OBJ → FBX round trip damage a model?',
      options: ['OBJ stores no hierarchy or animation, so they are lost for good in the middle step', 'FBX cannot open OBJ', 'Because of number rounding'],
      answer: 0,
      explain: 'Conversion can only lose data. You cannot get it back.'
    },
    {
      t: 'choice',
      q: 'A client sent an STL and asks you to “color and animate it”. What do you say?',
      options: ['STL has no colors, UVs or skeleton: we need the source in a format with materials and animation', 'I will convert it to FBX and everything will appear', 'STL cannot be opened'],
      answer: 0,
      explain: 'You can turn an STL into an FBX, but it will contain the same bare shape.'
    }
  ]
};

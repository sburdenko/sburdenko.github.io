/** 3D, unit 2, lesson 4: FBX and Collada. */
const DAE = '<COLLADA version="1.4.1">\n  <asset>\n    <unit name="meter" meter="1"/>\n    <up_axis>Z_UP</up_axis>\n  </asset>\n  <library_geometries>…</library_geometries>\n</COLLADA>';

export default {
  id: 'f3d.u2.l4',
  title: 'FBX and Collada',
  sub: 'The pipeline workhorse and its open ancestor',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'FBX: the workhorse of game dev',
      body: '<p>FBX started as the format of Kaydara’s Filmbox and has belonged to Autodesk since 2006. It stores meshes, materials, hierarchy, skeletons, animation, morphs, cameras and lights.</p><p>The format is closed. The official way to read it is the free but closed-source FBX SDK. Other programs rely on reverse engineering. Hence “an FBX from Blender looks wrong in Max”.</p>'
    },
    {
      t: 'learn',
      title: 'Collada: open XML that never took off',
      body: '<p>DAE (Collada) was created at Sony Computer Entertainment, then moved to Khronos, the same group that makes glTF.</p><p>It is XML: human-readable, but heavy and too flexible, so every program understood it its own way. Today glTF has almost replaced it.</p>'
    },
    {
      t: 'choice',
      q: 'Why does an FBX from one program sometimes open with errors in another?',
      options: ['The format is closed, and not everyone uses the official SDK, so each program reads it a little differently', 'FBX gets corrupted when copied', 'Programs break other vendors’ files on purpose'],
      answer: 0,
      explain: 'No open spec means no guarantee that everyone reads the file the same way.'
    },
    {
      t: 'choice',
      q: 'An animator is moving a rigged character from Maya to Unity. What is used most often?',
      options: ['FBX', 'STL', 'PLY', 'DXF'],
      answer: 0,
      explain: 'FBX is the de facto standard for moving animated models between DCC tools and engines.'
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A scene with a skeleton and a camera from an old program. Try at least three formats and see where the skeleton gets lost.',
      assetName: 'animated scene',
      asset: ['geometry', 'uv', 'hierarchy', 'skin', 'cameras'],
      goal: { kind: 'tried', n: 3 },
      solve: ['fmt:obj', 'fmt:fbx', 'fmt:dae']
    },
    {
      t: 'tapline',
      q: 'Which Collada line sets the units?',
      code: DAE,
      lang: 'plain',
      answer: 2,
      explain: 'unit meter="1" means one file unit equals one meter.'
    },
    {
      t: 'choice',
      q: 'A Collada file says <up_axis>Z_UP</up_axis>. What will a Y-up viewer do?',
      code: DAE,
      lang: 'plain',
      options: ['Rotate the model on import, if it reads the header correctly', 'Refuse to open it', 'Nothing, axes do not matter'],
      answer: 0,
      explain: 'The up axis is written in the file, so a good importer will rotate the model itself.'
    },
    {
      t: 'multi',
      q: 'What can FBX do? Select all.',
      options: ['Skeletal animation', 'Blend shapes (morphs)', 'Cameras and lights', 'Object hierarchy', 'An open specification'],
      answer: [0, 1, 2, 3],
      explain: 'It can do everything except be open.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['FBX', 'Closed Autodesk format'],
        ['DAE', 'Open XML from Khronos'],
        ['glTF', 'Took over from Collada'],
        ['FBX SDK', 'Free but closed-source library']
      ]
    }
  ]
};

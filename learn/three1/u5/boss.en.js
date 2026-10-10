/** Final of the course "Three.js: Beginner". */
export default {
  id: 'tj.u5.boss',
  title: 'Course final',
  sub: 'A scene from empty canvas to loaded model',
  minutes: 8,
  boss: true,
  cards: [
    {
      t: 'rig', rig: 'tjfirst',
      task: 'Warm-up: a spinning cube from scratch.',
      goal: { visible: true, spin: true },
      solve: ['camz:5', 'add', 'loop']
    },
    {
      t: 'rig', rig: 'tjcam',
      task: 'Red and blue are visible, green is not. Show all three by only moving the camera back.',
      start: { fov: 35, z: 3 }, lock: ['fov', 'near', 'far'],
      goal: { see: ['a', 'b', 'c'] },
      solve: ['z:10']
    },
    {
      t: 'rig', rig: 'tjlight',
      task: 'A shaded knot with a Standard material and a shadow.',
      goal: { look: 'shaded', shadow: true },
      solve: ['dir', 'sm', 'lc', 'cc', 'fr']
    },
    {
      t: 'rig', rig: 'tjtex',
      task: 'The 4×4 tiling is already there, but the colors look washed out. Fix it.',
      start: { repeat: 4, wrap: 'repeat' }, lock: ['rep', 'wrap'],
      goal: { tiles: 'tiled', colors: true },
      solve: ['cs:srgb']
    },
    {
      t: 'order',
      q: 'The order of a typical program',
      items: ['Scene, camera, renderer', 'Lights', 'Load a glTF model', 'Center and scale the model', 'A setAnimationLoop loop with render'],
      explain: 'Plus a resize handler, which can go anywhere.'
    },
    {
      t: 'match',
      q: 'Match the symptom to the fix',
      pairs: [
        ['Empty screen, camera at 0', 'camera.position.z = 5'],
        ['Model is black', 'Add a light'],
        ['Washed-out texture', 'SRGBColorSpace'],
        ['Memory keeps growing', 'dispose()']
      ]
    },
    {
      t: 'multi',
      q: 'What comes from three/addons? Select all that apply.',
      options: ['OrbitControls', 'GLTFLoader', 'DRACOLoader', 'PerspectiveCamera'],
      answer: [0, 1, 2],
      explain: 'Cameras, scenes and materials live in three itself.'
    },
    {
      t: 'choice',
      q: 'What comes next, at the intermediate level?',
      options: ['Environment maps and HDR, glTF animations, clicking on objects (Raycaster), InstancedMesh and performance', 'Nothing, that is all there is', 'Only shaders'],
      answer: 0,
      explain: 'Shaders, WebGPU and TSL come at the advanced level.'
    }
  ]
};

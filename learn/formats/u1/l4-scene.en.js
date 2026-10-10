/** 3D, unit 1, lesson 4: scene hierarchy, units and the up axis. */
export default {
  id: 'f3d.u1.l4',
  title: 'Scene, units and axes',
  sub: 'Why a model arrives 1000 times too big, or lying on its side',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'A file often holds a whole scene',
      body: '<p>A file stores not one mesh but a tree of objects: car → body → four wheels. Each node has its own <b>transform</b>: translation, rotation and scale relative to its parent.</p><p>Rotate the car, and the wheels go with it.</p>'
    },
    {
      t: 'order',
      q: 'Arrange the hierarchy from top to bottom',
      items: ['Scene', 'Car', 'Body', 'Front left wheel'],
      explain: 'The wheel is a child of the body, the body is a child of the car, the car is a child of the scene.'
    },
    {
      t: 'learn',
      title: 'Units: meters, centimeters or nothing',
      body: '<p>The number 10 in a file: 10 of what? By spec, glTF is always in meters. FBX stores the scale in the file settings. OBJ and STL store no units at all, so the program has to guess.</p><p>Hence the classic “the model arrived 1000 times too big”.</p>'
    },
    {
      t: 'learn',
      title: 'Which axis points up',
      body: '<p>In some programs up is the Y axis (glTF, Maya, Unity); in others it is Z (Blender, 3ds Max, Unreal Engine, most CAD systems).</p><p>If you do not rotate the model on export, it will lie on its side.</p>'
    },
    {
      t: 'rig', rig: 'units',
      task: 'A 10 cm mug is exported without conversion from a Z-up program into a glTF viewer. Pick the settings so the mug stands upright at a normal size.',
      goal: {},
      solve: ['unit:m', 'up:Y']
    },
    {
      t: 'choice',
      q: 'A 25 mm part was exported in inches (0.984). The slicer assumed the STL is in millimeters. What size will it show?',
      options: ['About 1 mm', '25 mm', '635 mm'],
      answer: 0,
      explain: 'STL stores no units. The slicer read 0.984 as millimeters, and the part became tiny.'
    },
    {
      t: 'choice',
      q: 'Why do the wheels move with the car when you move it?',
      options: ['The wheels are child nodes: their transform is relative to the parent', 'The program moves every object in the scene', 'The wheels are merged with the body into one mesh'],
      answer: 0,
      explain: 'The wheel’s final position = the car’s transform × the body’s × the wheel’s own.'
    },
    {
      t: 'multi',
      q: 'Which of these use Y up? Select all.',
      options: ['glTF', 'Unity', 'Maya', 'Blender', 'Unreal Engine', '3ds Max'],
      answer: [0, 1, 2],
      explain: 'Blender, 3ds Max and Unreal are Z up. Exporters usually rotate the model for you, but not always.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['glTF', 'Meters, Y up'],
        ['OBJ', 'No units'],
        ['FBX', 'Scale in the file settings'],
        ['Blender', 'Z up']
      ]
    }
  ]
};

/** Three.js beginner, unit 5, lesson 1: textures. */
export default {
  id: 'tj.u5.l1',
  title: 'Textures',
  sub: 'Loading, sRGB, repeating',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'A picture on a surface',
      body: '<p>A texture is an image wrapped onto geometry using UV coordinates. You load it with <code>TextureLoader</code> and put it into the material\'s <code>map</code> property.</p>',
      code: "const tex = await new THREE.TextureLoader().loadAsync('wood.jpg');\ntex.colorSpace = THREE.SRGBColorSpace;\nconst mat = new THREE.MeshStandardMaterial({ map: tex });"
    },
    {
      t: 'learn',
      title: 'Why the colors look washed out',
      body: '<p>Regular images (JPG, PNG) store colors in the <b>sRGB</b> color space. Three.js does its lighting math in linear space. If you do not say the texture is sRGB, its colors are read as linear and come out pale and faded.</p><p>Only color maps get this flag (<code>map</code>, <code>emissiveMap</code>). Normal and roughness maps are data, so leave them alone.</p>'
    },
    {
      t: 'rig', rig: 'tjtex',
      task: 'The tile should repeat 4×4 and have correct colors.',
      goal: { tiles: 'tiled', colors: true },
      solve: ['rep:4', 'wrap:repeat', 'cs:srgb']
    },
    {
      t: 'choice',
      q: 'repeat = 4, but instead of tiles you get one copy in the corner and stretched stripes. What is wrong?',
      options: ['wrapS and wrapT are set to ClampToEdge; repeating needs RepeatWrapping', 'The image is too small', 'You need repeat = 16'],
      answer: 0,
      explain: 'By default the edges are "clamped": everything outside 0…1 takes the edge pixel.'
    },
    {
      t: 'multi',
      q: 'Which textures need colorSpace = SRGBColorSpace? Select all that apply.',
      options: ['map (color)', 'emissiveMap (glow)', 'normalMap', 'roughnessMap'],
      answer: [0, 1],
      explain: 'Normals and roughness are numbers, not colors.'
    },
    {
      t: 'blanks',
      q: 'An 8×8 tiling',
      code: 'tex.wrapS = tex.wrapT = THREE.___;\ntex.repeat.set(___, 8);',
      tiles: ['RepeatWrapping', '8', 'ClampToEdgeWrapping', '4', 'MirroredRepeatWrapping'],
      answer: ['RepeatWrapping', '8'],
      explain: 'MirroredRepeatWrapping repeats too, but mirrors every other copy.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['TextureLoader', 'Loads an image'],
        ['map', 'Surface color'],
        ['SRGBColorSpace', 'Colors are not washed out'],
        ['RepeatWrapping', 'Tiled repeat']
      ]
    },
    {
      t: 'choice',
      q: 'You changed wrapS on a texture that is already on screen, and nothing happened. What do you do?',
      options: ['tex.needsUpdate = true', 'Reload the page', 'Create a new material'],
      answer: 0,
      explain: 'Some texture settings only take effect when the texture is uploaded to the GPU.'
    }
  ]
};

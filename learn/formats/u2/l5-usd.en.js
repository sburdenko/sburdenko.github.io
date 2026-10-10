/** 3D, unit 2, lesson 5: USD and USDZ: layers, variants, AR. */
export default {
  id: 'f3d.u2.l5',
  title: 'USD and USDZ',
  sub: 'Scenes built from layers and variants',
  minutes: 7,
  cards: [
    {
      t: 'learn',
      title: 'USD: Pixar’s scene language',
      body: '<p>Pixar open-sourced <b>Universal Scene Description</b> in 2016. It is not just “a file with a model” but a way to assemble huge scenes from hundreds of files.</p><p>Each department works in its own layer, and the final scene composes itself.</p>'
    },
    {
      t: 'learn',
      title: 'Layers: who wins',
      body: '<p>Layers form a stack. If two layers set the same attribute, the stronger one wins: the one higher up.</p><p>The chair asset lives in one file, its placement in the scene in another, per-shot tweaks in a third. Nobody touches anyone else’s file.</p>',
      deep: 'USD strength order is remembered as LIVRPS: Local (opinions in layers), Inherits, VariantSets, References, Payloads, Specializes. A payload is deferred loading of heavy parts of a scene: you open a city and load only the block you need.'
    },
    {
      t: 'rig', rig: 'usd',
      task: 'Make the chair red without touching the asset file chair.usda.',
      goal: { color: 'red' },
      solve: ['layer:shot']
    },
    {
      t: 'choice',
      q: 'shot.usda says “red”, set.usda says “walnut”. The shot layer is higher. What will the chair be?',
      options: ['Red', 'Walnut', 'The color from chair.usda'],
      answer: 0,
      explain: 'A stronger layer overrides the opinions of weaker ones.'
    },
    {
      t: 'learn',
      title: 'Variants',
      body: '<p>A <b>VariantSet</b> is a set of mutually exclusive versions inside one asset: color, level of detail, “regular or bar stool”. Switch it and the scene changes, while the files stay the same.</p>'
    },
    {
      t: 'rig', rig: 'usd',
      task: 'You need the walnut chair from set.usda in its bar variant.',
      goal: { color: 'walnut', legs: 3 },
      solve: ['var:bar']
    },
    {
      t: 'learn',
      title: 'USDZ: USD for AR',
      body: '<p><b>USDZ</b> is an uncompressed zip archive with USD files and textures inside. Apple uses it for AR Quick Look: open a link on an iPhone and the model appears on your table.</p><p>NVIDIA Omniverse is built entirely on USD. Since 2023 USD has been developed by the AOUSD alliance: Pixar, Apple, Adobe, Autodesk, NVIDIA.</p>'
    },
    {
      t: 'choice',
      q: 'Why is USDZ an uncompressed zip?',
      options: ['The files inside can be read straight from the archive without unpacking', 'It makes the file smaller', 'Apple cannot unpack zip'],
      answer: 0,
      explain: 'The files are also aligned to 64 bytes, so they can be memory-mapped and read right away.'
    },
    {
      t: 'multi',
      q: 'Where will you run into USD? Select all.',
      options: ['AR Quick Look on iPhone (USDZ)', 'NVIDIA Omniverse', 'Film and animation', '3D printer firmware', 'AutoCAD drawings'],
      answer: [0, 1, 2],
      explain: 'USD grew out of film and spread to AR and industrial “digital twins”.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Layer', 'A file with opinions about attributes'],
        ['VariantSet', 'Switchable versions of an asset'],
        ['Reference', 'Bring in another file as part of the scene'],
        ['USDZ', 'An archive for AR']
      ]
    }
  ]
};

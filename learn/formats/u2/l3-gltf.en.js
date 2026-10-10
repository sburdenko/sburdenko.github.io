/** 3D, unit 2, lesson 3: glTF and GLB. */
export default {
  id: 'f3d.u2.l3',
  title: 'glTF and GLB',
  sub: 'The “JPEG of 3D”: ready to display',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'Ready to display',
      body: '<p><b>glTF</b> (GL Transmission Format) is made by the Khronos Group; version 2.0 came out in 2017. People call it the “JPEG of 3D”: a browser, AR viewer or engine can show the model right away, with almost no conversion.</p><p>Meters, Y up, PBR materials, hierarchy, skeletal animation: it is all defined in the standard.</p>'
    },
    {
      t: 'learn',
      title: '.gltf or .glb',
      body: '<p><code>.gltf</code> is JSON describing the scene, with a <code>.bin</code> file of vertex arrays and texture images next to it.</p><p><code>.glb</code> is the same thing in one binary file. GLB is handier for sending: nothing gets lost.</p>',
      deep: 'GLB: a 12-byte header (magic “glTF”, version 2, file length), then a JSON chunk and a BIN chunk. The data sits in buffers, while bufferViews and accessors describe how to read it. The arrays go to the GPU with almost no processing, hence “ready to render”.'
    },
    {
      t: 'tapline',
      q: 'Which line says where the vertex positions are?',
      code: '"meshes": [{\n  "primitives": [{\n    "attributes": {\n      "POSITION": 0,\n      "NORMAL": 1,\n      "TEXCOORD_0": 2\n    },\n    "indices": 3,\n    "material": 0\n  }]\n}]',
      lang: 'plain',
      answer: 3,
      explain: 'POSITION is the vertex positions. The number is the index of the accessor that says where they are in the binary data.'
    },
    {
      t: 'choice',
      q: 'What does the 0 in "POSITION": 0 mean?',
      options: ['The index of an accessor, which describes where in the binary data the positions are', 'The coordinate of the first vertex', 'The material number'],
      answer: 0,
      explain: 'The JSON only describes the data. The numbers themselves are in a binary buffer, and the accessor gives the type, count and offset.'
    },
    {
      t: 'learn',
      title: 'Extensions: compression',
      body: '<p>The glTF core can be extended. <code>KHR_draco_mesh_compression</code> and <code>EXT_meshopt_compression</code> shrink geometry several times over. <code>KHR_texture_basisu</code> adds KTX2 textures that the GPU reads without unpacking them into huge RGBA.</p><p>This is how 3D on the web gets lightweight.</p>'
    },
    {
      t: 'rig', rig: 'convert',
      task: 'A character with PBR materials and animation has to be shown in a browser. Find the format that keeps everything.',
      assetName: 'game character',
      asset: ['geometry', 'normals', 'uv', 'pbr', 'hierarchy', 'skin', 'morph'],
      goal: { kind: 'keep' },
      solve: ['fmt:gltf']
    },
    {
      t: 'choice',
      q: 'Why pick GLB over FBX for the web?',
      options: ['It is an open standard, a single file and ready to render; three.js, Babylon.js and AR viewers understand it', 'FBX cannot do textures', 'GLB stores geometry more precisely'],
      answer: 0,
      explain: 'FBX is closed and built for exchange between programs, not for fast delivery to a browser.'
    },
    {
      t: 'multi',
      q: 'What does the glTF 2.0 spec define? Select all.',
      options: ['Units are meters', 'Y is up', 'Metallic-roughness PBR materials', 'Exact NURBS surfaces', 'Layers and variants, as in USD'],
      answer: [0, 1, 2],
      explain: 'glTF is about delivering triangles to the screen. Exact CAD geometry and building scenes from layers are jobs for other formats.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['.gltf', 'JSON plus separate files'],
        ['.glb', 'Everything in one binary file'],
        ['Draco', 'Geometry compression'],
        ['KTX2', 'Compressed textures for the GPU']
      ]
    }
  ]
};

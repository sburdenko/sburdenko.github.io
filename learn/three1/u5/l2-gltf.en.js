/** Three.js beginner, unit 5, lesson 2: loading models and cleaning up. */
export default {
  id: 'tj.u5.l2',
  title: 'glTF models and cleanup',
  sub: 'GLTFLoader, scale, centering and dispose',
  minutes: 8,
  cards: [
    {
      t: 'learn',
      title: 'glTF: the "JPEG of 3D"',
      body: '<p>Ready-made models in Three.js are almost always loaded as <b>glTF</b> (.gltf or binary .glb): geometry, PBR materials, textures and animations in one file. The format itself is covered in the "3D formats" course.</p>',
      code: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';\n\nconst gltf = await new GLTFLoader().loadAsync('chair.glb');\nscene.add(gltf.scene);"
    },
    {
      t: 'choice',
      q: 'What do you add to the scene after loading?',
      options: ['gltf.scene, a group with all of the model\'s objects', 'The whole gltf object', 'gltf.meshes[0]'],
      answer: 0,
      explain: 'gltf also has animations, cameras and asset; you take those separately.'
    },
    {
      t: 'learn',
      title: 'The model is huge, or off to one side',
      body: '<p>Models arrive at all sorts of scales, with their center anywhere. A bounding box, <code>Box3</code>, helps you put the model in its place.</p>',
      code: 'const box = new THREE.Box3().setFromObject(gltf.scene);\nconst size = box.getSize(new THREE.Vector3());\nconst center = box.getCenter(new THREE.Vector3());\ngltf.scene.position.sub(center);              // to the world origin\ngltf.scene.scale.setScalar(2 / Math.max(size.x, size.y, size.z));'
    },
    {
      t: 'order',
      q: 'Put the steps for showing a model in order',
      items: ['Load it with GLTFLoader', 'Compute the model\'s Box3', 'Move it to the center and fit the scale', 'Add gltf.scene to the scene', 'Set up the lights and the camera'],
      explain: 'Without light, glTF\'s PBR materials will be black.'
    },
    {
      t: 'learn',
      title: 'Compressed models',
      body: '<p>Heavy geometry is compressed with Draco or meshopt, which makes the file several times smaller. The loader needs a decoder:</p>',
      code: "import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';\n\nconst draco = new DRACOLoader().setDecoderPath('/draco/');\nconst loader = new GLTFLoader().setDRACOLoader(draco);"
    },
    {
      t: 'learn',
      title: 'Removed from the scene ≠ memory freed',
      body: '<p><code>scene.remove(model)</code> only takes the object out of the scene. Geometry, materials and textures stay in GPU memory until you call <code>dispose()</code>. <code>renderer.info.memory</code> helps you spot a leak.</p>',
      code: 'model.traverse(o => {\n  if (o.isMesh) {\n    o.geometry.dispose();\n    o.material.map?.dispose();\n    o.material.dispose();\n  }\n});\nscene.remove(model);'
    },
    {
      t: 'choice',
      q: 'A configurator swaps models, and after an hour the tab crashes. renderer.info.memory.geometries keeps growing. What is wrong?',
      options: ['Old models are removed from the scene, but dispose is never called', 'Too many lights', 'far needs to be larger'],
      answer: 0,
      explain: 'The JavaScript garbage collector does not free GPU memory.'
    },
    {
      t: 'tapline',
      q: 'Where is the memory leak?',
      code: 'function swap(next) {\n  scene.remove(current);\n  scene.add(next);\n  current = next;\n}',
      answer: 1,
      explain: 'current was removed, but its geometry, materials and textures were never freed.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['GLTFLoader', 'Load a .glb'],
        ['Box3', 'Model dimensions'],
        ['DRACOLoader', 'Unpack compressed geometry'],
        ['dispose()', 'Free GPU memory']
      ]
    }
  ]
};

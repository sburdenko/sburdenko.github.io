/** 3D, unit 1, lesson 3: UV unwrapping, textures and PBR materials. */
export default {
  id: 'f3d.u1.l3',
  title: 'UVs and materials',
  sub: 'How a picture gets onto a model, and why metal shines',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'How to stick a picture on 3D',
      body: '<p>To paint a model with a picture (a texture), each vertex gets a second set of coordinates, <b>UV</b>: where on the picture this point sits. U is horizontal, V is vertical, both from 0 to 1.</p><p>This is an <b>unwrap</b>: like cutting open a cardboard box and laying it flat on a table.</p>'
    },
    {
      t: 'learn',
      title: 'A material is what an object is made of',
      body: '<p>A material says how a surface reflects light. The modern approach is <b>PBR</b> (physically based rendering): base color, metallic and roughness.</p><p>The same numbers look almost the same in different programs, which is why PBR became the standard.</p>',
      deep: 'glTF uses the metallic-roughness model: baseColor, metallic, roughness, normal, occlusion, emissive, plus extensions (transmission, clearcoat, sheen). Older formats such as OBJ with .mtl and Collada describe materials with Phong: diffuse, specular, shininess. Those materials transfer poorly between programs.'
    },
    {
      t: 'tapline',
      q: 'Which glTF line says the material is metal?',
      code: '"materials": [{\n  "name": "Steel",\n  "pbrMetallicRoughness": {\n    "baseColorFactor": [0.8, 0.8, 0.8, 1.0],\n    "metallicFactor": 1.0,\n    "roughnessFactor": 0.3\n  }\n}]',
      lang: 'plain',
      answer: 4,
      explain: 'metallicFactor = 1 means metal. 0 means a dielectric: plastic, wood, stone.'
    },
    {
      t: 'choice',
      q: 'A vertex has UV = (0.5, 0.5). Where is it on the texture?',
      options: ['In the center of the picture', 'In the top-left corner', 'Outside the picture'],
      answer: 0,
      explain: 'Both coordinates are halfway through the 0 to 1 range.'
    },
    {
      t: 'choice',
      q: 'metallic = 1, roughness = 0. What does it look like?',
      options: ['Polished, mirror-like metal', 'Matte rubber', 'Clear glass'],
      answer: 0,
      explain: 'Metal with zero roughness reflects like a mirror. The higher the roughness, the blurrier the highlight.'
    },
    {
      t: 'learn',
      title: 'Textures inside or alongside',
      body: '<p>Pictures either sit as separate files next to the model (OBJ + .mtl + .png, glTF + .bin + .png) or live inside a single file (GLB, USDZ, FBX with embedded textures).</p><p>Separate files are easy to lose when you send them, hence the eternal “the model arrived gray”.</p>'
    },
    {
      t: 'choice',
      q: 'Someone sent you model.obj, and in the viewer it is gray. Why?',
      options: ['They did not include the .mtl and textures: OBJ keeps materials separately', 'OBJ cannot do color', 'The viewer is broken'],
      answer: 0,
      explain: 'OBJ points to material.mtl with an mtllib line, and that file points to the pictures. No files, no color.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['UV', 'Where a point lies on the picture'],
        ['Texture', 'The picture itself'],
        ['Metallic', 'Metal or not'],
        ['Roughness', 'How matte the surface is']
      ]
    },
    {
      t: 'multi',
      q: 'What does a glTF PBR material describe? Select all.',
      options: ['Base color', 'Metallic', 'Roughness', 'Triangle count', 'Model file name'],
      answer: [0, 1, 2],
      explain: 'A material is about the surface. Geometry and files are not its concern.'
    }
  ]
};

/** Three.js beginner, unit 1, lesson 1: what Three.js is. */
export default {
  id: 'tj.u1.l1',
  title: 'What is Three.js',
  sub: '3D in the browser without the WebGL pain',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: '3D right on the page',
      body: '<p>Browsers can draw 3D through <b>WebGL</b>, which gives JavaScript access to the GPU. But WebGL is very low-level: shaders, buffers, matrices. Drawing a single cube takes about a hundred lines.</p><p><b>Three.js</b> is a library on top of WebGL. You say "here is a scene, here is a camera, here is a cube", and it does all the low-level work.</p>'
    },
    {
      t: 'learn',
      title: 'Four key words',
      body: '<p><b>Scene</b>: everything that exists in the world.<br><b>Camera</b>: where we look from and how.<br><b>Renderer</b>: the artist. It takes the scene and the camera and paints a picture on a canvas.<br><b>Mesh</b>: a visible object, made of a <b>geometry</b> (the shape) plus a <b>material</b> (how the surface looks).</p>'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['Scene', 'Everything in the world'],
        ['Camera', 'Where we look from'],
        ['Renderer', 'Draws the picture'],
        ['Mesh', 'Geometry + material']
      ]
    },
    {
      t: 'choice',
      q: 'Why use Three.js if the browser already has WebGL?',
      options: ['WebGL is too low-level: Three.js handles the shaders, buffers and matrices for you', 'Without Three.js the browser cannot do 3D', 'Three.js draws without the GPU'],
      answer: 0,
      explain: 'Three.js is WebGL (and now WebGPU too), just pleasant to use.'
    },
    {
      t: 'learn',
      title: 'Where you will see it',
      body: '<p>Product configurators ("design your sneakers"), 3D model and BIM viewers in the browser, data visualization, portfolio sites with effects, browser games.</p><p>It was created by Ricardo Cabello (mrdoob), and the first version came out in 2010. Versions are named by release number: r170, r171…</p>'
    },
    {
      t: 'learn',
      title: 'How to add it',
      body: '<p>In a project with a bundler (Vite, webpack): <code>npm install three</code>. Without a bundler, load the module from a CDN through an import map.</p>',
      code: "import * as THREE from 'three';\n\n// add-ons (orbit camera, loaders) are imported separately:\nimport { OrbitControls } from 'three/addons/controls/OrbitControls.js';"
    },
    {
      t: 'blanks',
      q: 'Import Three.js',
      code: "import * as ___ from '___';",
      tiles: ['THREE', 'three', 'WebGL', 'three.js', 'Three'],
      answer: ['THREE', 'three'],
      explain: 'The package is called three, and by convention everything goes into an object named THREE.'
    },
    {
      t: 'multi',
      q: 'What do you need to see a cube? Select all that apply.',
      options: ['A scene with a cube', 'A camera', 'A renderer', 'A Node.js server'],
      answer: [0, 1, 2],
      explain: 'Three.js runs entirely in the browser. A server is only needed to serve the files.'
    }
  ]
};

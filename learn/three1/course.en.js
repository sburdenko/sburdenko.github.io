/** Course "Three.js: Beginner": first scene, camera, objects, lights, textures and models. */
import u1l1 from './u1/l1-what.en.js?v=202610100802';
import u1l2 from './u1/l2-scene.en.js?v=202610100802';
import u1l3 from './u1/l3-loop.en.js?v=202610100802';
import u1boss from './u1/boss.en.js?v=202610100802';
import u2l1 from './u2/l1-perspective.en.js?v=202610100802';
import u2l2 from './u2/l2-near.en.js?v=202610100802';
import u2l3 from './u2/l3-ortho.en.js?v=202610100802';
import u2boss from './u2/boss.en.js?v=202610100802';
import u3l1 from './u3/l1-transform.en.js?v=202610100802';
import u3l2 from './u3/l2-hierarchy.en.js?v=202610100802';
import u3boss from './u3/boss.en.js?v=202610100802';
import u4l1 from './u4/l1-materials.en.js?v=202610100802';
import u4l2 from './u4/l2-lights.en.js?v=202610100802';
import u4l3 from './u4/l3-shadows.en.js?v=202610100802';
import u4boss from './u4/boss.en.js?v=202610100802';
import u5l1 from './u5/l1-textures.en.js?v=202610100802';
import u5l2 from './u5/l2-gltf.en.js?v=202610100802';
import u5boss from './u5/boss.en.js?v=202610100802';

export default {
  id: 'three1',
  title: 'Three.js: beginner',
  units: [
    {
      id: 'u1',
      title: 'Your first scene',
      blurb: 'What Three.js is; scene, camera, renderer and Mesh; the animation loop and window resizing.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'The camera',
      blurb: 'PerspectiveCamera: fov, aspect, near and far; z-fighting, lookAt and OrbitControls; OrthographicCamera.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Objects in the scene',
      blurb: 'position, rotation in radians and scale; axes; hierarchy with Group, local and world coordinates.',
      lessons: [u3l1, u3l2, u3boss]
    },
    {
      id: 'u4',
      title: 'Lights and materials',
      blurb: 'Basic, Lambert and Standard; light sources and their falloff; the four shadow flags.',
      lessons: [u4l1, u4l2, u4l3, u4boss]
    },
    {
      id: 'u5',
      title: 'Textures and models',
      blurb: 'TextureLoader, sRGB and repeating, loading glTF, centering and scaling a model, dispose. The course final.',
      lessons: [u5l1, u5l2, u5boss]
    }
  ]
};

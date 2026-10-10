/** Курс «Three.js: начальный уровень»: первая сцена, камера, объекты, свет, текстуры и модели. */
import u1l1 from './u1/l1-what.js?v=202610100800';
import u1l2 from './u1/l2-scene.js?v=202610100800';
import u1l3 from './u1/l3-loop.js?v=202610100800';
import u1boss from './u1/boss.js?v=202610100800';
import u2l1 from './u2/l1-perspective.js?v=202610100800';
import u2l2 from './u2/l2-near.js?v=202610100800';
import u2l3 from './u2/l3-ortho.js?v=202610100800';
import u2boss from './u2/boss.js?v=202610100800';
import u3l1 from './u3/l1-transform.js?v=202610100800';
import u3l2 from './u3/l2-hierarchy.js?v=202610100800';
import u3boss from './u3/boss.js?v=202610100800';
import u4l1 from './u4/l1-materials.js?v=202610100800';
import u4l2 from './u4/l2-lights.js?v=202610100800';
import u4l3 from './u4/l3-shadows.js?v=202610100800';
import u4boss from './u4/boss.js?v=202610100800';
import u5l1 from './u5/l1-textures.js?v=202610100800';
import u5l2 from './u5/l2-gltf.js?v=202610100800';
import u5boss from './u5/boss.js?v=202610100800';

export default {
  id: 'three1',
  title: 'Three.js: начальный уровень',
  units: [
    {
      id: 'u1',
      title: 'Первая сцена',
      blurb: 'Что такое Three.js, сцена, камера, рендерер и Mesh, цикл анимации и изменение размера окна.',
      lessons: [u1l1, u1l2, u1l3, u1boss]
    },
    {
      id: 'u2',
      title: 'Камера',
      blurb: 'PerspectiveCamera: fov, aspect, near и far, z-fighting, lookAt и OrbitControls, OrthographicCamera.',
      lessons: [u2l1, u2l2, u2l3, u2boss]
    },
    {
      id: 'u3',
      title: 'Объекты в сцене',
      blurb: 'position, rotation в радианах и scale, оси, иерархия: Group, локальные и мировые координаты.',
      lessons: [u3l1, u3l2, u3boss]
    },
    {
      id: 'u4',
      title: 'Свет и материалы',
      blurb: 'Basic, Lambert и Standard, источники света и их затухание, четыре флага теней.',
      lessons: [u4l1, u4l2, u4l3, u4boss]
    },
    {
      id: 'u5',
      title: 'Текстуры и модели',
      blurb: 'TextureLoader, sRGB и повтор, загрузка glTF, центр и масштаб модели, dispose. Финал курса.',
      lessons: [u5l1, u5l2, u5boss]
    }
  ]
};

/** Курс «3D-форматы»: от вершин и треугольников до CAD, BIM и облаков точек. */
import u1l1 from './u1/l1-triangles.js?v=202610101413';
import u1l2 from './u1/l2-normals.js?v=202610101413';
import u1l3 from './u1/l3-uv.js?v=202610101413';
import u1l4 from './u1/l4-scene.js?v=202610101413';
import u1boss from './u1/boss.js?v=202610101413';
import u2l1 from './u2/l1-obj-stl.js?v=202610101413';
import u2l2 from './u2/l2-ply.js?v=202610101413';
import u2l3 from './u2/l3-gltf.js?v=202610101413';
import u2l4 from './u2/l4-fbx-dae.js?v=202610101413';
import u2l5 from './u2/l5-usd.js?v=202610101413';
import u2l6 from './u2/l6-choose.js?v=202610101413';
import u2boss from './u2/boss.js?v=202610101413';
import u3l1 from './u3/l1-brep.js?v=202610101413';
import u3l2 from './u3/l2-tessellation.js?v=202610101413';
import u3l3 from './u3/l3-step.js?v=202610101413';
import u3l4 from './u3/l4-dwg.js?v=202610101413';
import u3boss from './u3/boss.js?v=202610101413';
import u4l1 from './u4/l1-bim.js?v=202610101413';
import u4l2 from './u4/l2-ifc.js?v=202610101413';
import u4l3 from './u4/l3-coordination.js?v=202610101413';
import u4l4 from './u4/l4-bcf.js?v=202610101413';
import u4boss from './u4/boss.js?v=202610101413';
import u5l1 from './u5/l1-clouds.js?v=202610101413';
import u5l2 from './u5/l2-las.js?v=202610101413';
import u5l3 from './u5/l3-pts-recap.js?v=202610101413';
import u5boss from './u5/boss.js?v=202610101413';

export default {
  id: 'formats3d',
  title: '3D-форматы',
  units: [
    {
      id: 'u1',
      title: 'Из чего сделана 3D-модель',
      blurb: 'Вершины и треугольники, нормали и лицевая сторона, UV и материалы, сцена, единицы и оси. Без этого не понять ни один формат.',
      lessons: [u1l1, u1l2, u1l3, u1l4, u1boss]
    },
    {
      id: 'u2',
      title: 'Меши: форматы для показа и обмена',
      blurb: 'OBJ, STL, PLY, glTF/GLB, FBX, Collada, USD/USDZ — что умеет каждый, где встретишь и что потеряется при конвертации.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2l5, u2l6, u2boss]
    },
    {
      id: 'u3',
      title: 'CAD: точная геометрия',
      blurb: 'B-rep и NURBS вместо треугольников, тесселяция с допусками, STEP и IGES, DWG, DXF, DWF и 3DM.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'BIM: здания из умных объектов',
      blurb: 'Объекты со свойствами вместо мешей, IFC изнутри, RVT, PLN и Navisworks, поиск коллизий и BCF-замечания.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    },
    {
      id: 'u5',
      title: 'Облака точек',
      blurb: 'Сканы стройки: точки, интенсивность и классы, LAS и LAZ, E57, PTS/XYZ, ReCap и путь scan-to-BIM.',
      lessons: [u5l1, u5l2, u5l3, u5boss]
    },
    { id: 'u6', title: 'Доставка 3D в веб', soon: true, blurb: 'Draco, meshopt и KTX2, уровни детализации, 3D Tiles и потоковая загрузка огромных моделей и облаков.' },
    { id: 'u7', title: 'Новые представления', soon: true, blurb: 'Gaussian splatting и NeRF: сцены не из треугольников и не из точек — и в каких форматах их хранят.' }
  ]
};

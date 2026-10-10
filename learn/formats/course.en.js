/** The 3D formats course: from vertices and triangles to CAD, BIM and point clouds. */
import u1l1 from './u1/l1-triangles.en.js?v=202610101018';
import u1l2 from './u1/l2-normals.en.js?v=202610101018';
import u1l3 from './u1/l3-uv.en.js?v=202610101018';
import u1l4 from './u1/l4-scene.en.js?v=202610101018';
import u1boss from './u1/boss.en.js?v=202610101018';
import u2l1 from './u2/l1-obj-stl.en.js?v=202610101018';
import u2l2 from './u2/l2-ply.en.js?v=202610101018';
import u2l3 from './u2/l3-gltf.en.js?v=202610101018';
import u2l4 from './u2/l4-fbx-dae.en.js?v=202610101018';
import u2l5 from './u2/l5-usd.en.js?v=202610101018';
import u2l6 from './u2/l6-choose.en.js?v=202610101018';
import u2boss from './u2/boss.en.js?v=202610101018';
import u3l1 from './u3/l1-brep.en.js?v=202610101018';
import u3l2 from './u3/l2-tessellation.en.js?v=202610101018';
import u3l3 from './u3/l3-step.en.js?v=202610101018';
import u3l4 from './u3/l4-dwg.en.js?v=202610101018';
import u3boss from './u3/boss.en.js?v=202610101018';
import u4l1 from './u4/l1-bim.en.js?v=202610101018';
import u4l2 from './u4/l2-ifc.en.js?v=202610101018';
import u4l3 from './u4/l3-coordination.en.js?v=202610101018';
import u4l4 from './u4/l4-bcf.en.js?v=202610101018';
import u4boss from './u4/boss.en.js?v=202610101018';
import u5l1 from './u5/l1-clouds.en.js?v=202610101018';
import u5l2 from './u5/l2-las.en.js?v=202610101018';
import u5l3 from './u5/l3-pts-recap.en.js?v=202610101018';
import u5boss from './u5/boss.en.js?v=202610101018';

export default {
  id: 'formats3d',
  title: '3D formats',
  units: [
    {
      id: 'u1',
      title: 'What a 3D model is made of',
      blurb: 'Vertices and triangles, normals and the front face, UVs and materials, the scene, units and axes. You need these to understand any format.',
      lessons: [u1l1, u1l2, u1l3, u1l4, u1boss]
    },
    {
      id: 'u2',
      title: 'Meshes: formats for display and exchange',
      blurb: 'OBJ, STL, PLY, glTF/GLB, FBX, Collada, USD/USDZ: what each can do, where you will meet it, and what gets lost in conversion.',
      lessons: [u2l1, u2l2, u2l3, u2l4, u2l5, u2l6, u2boss]
    },
    {
      id: 'u3',
      title: 'CAD: exact geometry',
      blurb: 'B-rep and NURBS instead of triangles, tessellation with tolerances, STEP and IGES, DWG, DXF, DWF and 3DM.',
      lessons: [u3l1, u3l2, u3l3, u3l4, u3boss]
    },
    {
      id: 'u4',
      title: 'BIM: buildings made of smart objects',
      blurb: 'Objects with properties instead of meshes, IFC from the inside, RVT, PLN and Navisworks, clash detection and BCF issues.',
      lessons: [u4l1, u4l2, u4l3, u4l4, u4boss]
    },
    {
      id: 'u5',
      title: 'Point clouds',
      blurb: 'Site scans: points, intensity and classes, LAS and LAZ, E57, PTS/XYZ, ReCap and the scan-to-BIM path.',
      lessons: [u5l1, u5l2, u5l3, u5boss]
    },
    { id: 'u6', title: 'Delivering 3D to the web', soon: true, blurb: 'Draco, meshopt and KTX2, levels of detail, 3D Tiles and streaming huge models and point clouds.' },
    { id: 'u7', title: 'New representations', soon: true, blurb: 'Gaussian splatting and NeRF: scenes made of neither triangles nor points, and the formats used to store them.' }
  ]
};

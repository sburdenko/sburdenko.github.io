/** Tape 07 strings: { key: { en, ru } }. Code snippets are shared by both languages. */

const both = value => ({ en: value, ru: value });

/* ---------------- code snippets ---------------- */

const CODE = {
  'mesh.one': `var rp = new RenderParams(material);
// one mesh, one matrix, this frame only: call it every frame
Graphics.RenderMesh(rp, mesh, 0, Matrix4x4.TRS(pos, rot, scale));`,
  'mesh.cpuArray': `Matrix4x4[] matrices = new Matrix4x4[count];   // filled by your simulation
var rp = new RenderParams(material);           // material: Enable GPU Instancing
Graphics.RenderMeshInstanced(rp, mesh, 0, matrices, count);`,
  'mesh.cpuCount': `// positions live in a StructuredBuffer the shader reads by instance id
material.SetBuffer("_Positions", positionsBuffer);
var rp = new RenderParams(material) { worldBounds = bounds };
Graphics.RenderMeshPrimitives(rp, mesh, 0, count);`,
  'mesh.gpuArgs': `var args = new GraphicsBuffer(GraphicsBuffer.Target.IndirectArguments,
    1, GraphicsBuffer.IndirectDrawIndexedArgs.size);
var cmd = new GraphicsBuffer.IndirectDrawIndexedArgs[1];
cmd[0].indexCountPerInstance = mesh.GetIndexCount(0);
cmd[0].instanceCount = (uint)count;   // or written on the GPU by CopyCount
args.SetData(cmd);
var rp = new RenderParams(material) { worldBounds = bounds };
Graphics.RenderMeshIndirect(rp, mesh, args);`,
  'none.cpuCount': `// no mesh: the vertex shader builds each vertex from SV_VertexID
material.SetBuffer("_Points", pointsBuffer);
var rp = new RenderParams(material) { worldBounds = bounds };
Graphics.RenderPrimitives(rp, MeshTopology.Triangles, 6, count); // 6 verts = 1 quad`,
  'none.cpuCount.indexed': `// your own index buffer (Target.Index) instead of a mesh
Graphics.RenderPrimitivesIndexed(rp, MeshTopology.Triangles,
    indexBuffer, indexCount, 0, count);`,
  'none.gpuArgs': `var args = new GraphicsBuffer(GraphicsBuffer.Target.IndirectArguments,
    1, GraphicsBuffer.IndirectDrawArgs.size);
var cmd = new GraphicsBuffer.IndirectDrawArgs[1];
cmd[0].vertexCountPerInstance = 6;
cmd[0].instanceCount = 0;             // a compute shader fills it in
args.SetData(cmd);
Graphics.RenderPrimitivesIndirect(rp, MeshTopology.Triangles, args);`,
  'none.gpuArgs.indexed': `// IndirectDrawIndexedArgs, plus your index buffer
Graphics.RenderPrimitivesIndexedIndirect(rp, MeshTopology.Triangles,
    indexBuffer, args);`,
};

const TARGET_CODE = {
  Structured: `var instances = new GraphicsBuffer(GraphicsBuffer.Target.Structured,
    count, sizeof(float) * 16);                 // one float4x4 per instance
instances.SetData(matrices);
material.SetBuffer("_Instances", instances);`,
  Raw: `mesh.vertexBufferTarget |= GraphicsBuffer.Target.Raw;
GraphicsBuffer vb = mesh.GetVertexBuffer(0);  // read as ByteAddressBuffer
compute.SetBuffer(kernel, "_Vertices", vb);
// ... and Dispose() it when you are done: it is your handle`,
  Append: `var visible = new GraphicsBuffer(GraphicsBuffer.Target.Append,
    count, sizeof(uint));
visible.SetCounterValue(0);                   // every frame, before the dispatch
compute.SetBuffer(kernel, "_Visible", visible);`,
  Counter: `// Counter: a Structured buffer with a hidden counter (RWStructuredBuffer
// IncrementCounter/DecrementCounter), without Append/Consume semantics
var list = new GraphicsBuffer(GraphicsBuffer.Target.Structured
    | GraphicsBuffer.Target.Counter, count, stride);`,
  IndirectArguments: `var args = new GraphicsBuffer(GraphicsBuffer.Target.IndirectArguments,
    1, GraphicsBuffer.IndirectDrawIndexedArgs.size);
// draw calls and DispatchIndirect read their numbers from here
GraphicsBuffer.CopyCount(visible, args, sizeof(uint)); // -> instanceCount`,
  Vertex: `var vb = new GraphicsBuffer(GraphicsBuffer.Target.Vertex, vertexCount, stride);
vb.SetData(vertices);   // bound by the input assembler, not read as an array`,
  Index: `var ib = new GraphicsBuffer(GraphicsBuffer.Target.Index, indexCount, sizeof(ushort));
ib.SetData(indices);
Graphics.RenderPrimitivesIndexed(rp, MeshTopology.Triangles, ib, indexCount);`,
  Constant: `var cb = new GraphicsBuffer(GraphicsBuffer.Target.Constant, 1, 64);
cb.SetData(new[] { settings });   // small, read by every thread alike
material.SetConstantBuffer("Settings", cb, 0, 64);`,
  CopySource: `// allows this buffer to be the source of a GPU copy
Graphics.CopyBuffer(src, dst);   // src needs CopySource, dst CopyDestination`,
  CopyDestination: `// allows this buffer to be the destination of a GPU copy
var dst = new GraphicsBuffer(GraphicsBuffer.Target.Structured
    | GraphicsBuffer.Target.CopyDestination, count, stride);`,
};

const CULL_CODE = {
  reset: `visible.SetCounterValue(0);   // hidden counter of the Append buffer = 0`,
  dispatch: `cull.SetBuffer(kernel, "_Instances", instances); // all N, uploaded once
cull.SetBuffer(kernel, "_Visible", visible);     // AppendStructuredBuffer<uint>
cull.Dispatch(kernel, (count + 63) / 64, 1, 1);

// HLSL, one thread per instance
[numthreads(64,1,1)] void Cull(uint id : SV_DispatchThreadID) {
    if (id < _Count && InFrustum(_Instances[id])) _Visible.Append(id);
}`,
  copyCount: `// GPU to GPU: the counter lands in instanceCount (byte offset 4)
GraphicsBuffer.CopyCount(visible, args, sizeof(uint));`,
  drawIndirect: `Graphics.RenderMeshIndirect(rp, mesh, args);

// vertex shader: InitIndirectDrawArgs(0) first, then
uint i = _Visible[GetIndirectInstanceID(svInstanceID)];
float4x4 m = _Instances[i];`,
  readback: `// the naive way: ask the CPU how many survived
GraphicsBuffer.CopyCount(visible, countBuffer, 0);
countBuffer.GetData(countOnCpu);   // blocks until the GPU gets here`,
  wait: `// nothing to do: the CPU waits for the GPU to finish everything queued
// before this point. The frames stop overlapping.`,
  drawCpu: `Graphics.RenderMeshPrimitives(rp, mesh, 0, countOnCpu[0]);
// the same picture, one frame of parallelism lost`,
};

const BRG_CODE = {
  grd: `// Project Settings > Graphics: BatchRendererGroup Variants = Keep All
// URP Asset: SRP Batcher on, GPU Resident Drawer = Instanced Drawing
// Universal Renderer: Rendering Path = Forward+ (Deferred+ from 6.1)
// Static batching off: it is not compatible with BRG
// Code: none. Ordinary MeshRenderers are picked up automatically.`,
  ent: `// Entities Graphics: a baked or created entity with these components
// is drawn through a BatchRendererGroup that the package owns
RenderMeshUtility.AddComponents(entity, entityManager, renderMeshDescription,
    renderMeshArray, MaterialMeshInfo.FromRenderMeshArrayIndices(0, 0));`,
  own: `brg = new BatchRendererGroup(OnPerformCulling, IntPtr.Zero);
meshId = brg.RegisterMesh(mesh);
materialId = brg.RegisterMaterial(material);
batchId = brg.AddBatch(metadata, instanceData.bufferHandle); // GraphicsBuffer
// every view (camera, shadow cascade): fill visible instances and draw commands
JobHandle OnPerformCulling(BatchRendererGroup rg, BatchCullingContext ctx,
    BatchCullingOutput output, IntPtr userContext) { /* ... */ }`,
};

const LAMP_CODE = {
  deco: `// HLSL fragment: the phase comes from the lamp's own index
float phase = frac(instanceID * 0.618 + _Time.y * _Speed);
float on = step(0.5, phase);          // hard on/off
return _Color * on;                   // emission > 1 + bloom = a glow`,
  state: `// C#: only when a machine changes its state
lampState[i] = (byte)newState; dirty = true;
// once per frame, only if dirty
if (dirty) { stateBuffer.SetData(lampState); dirty = false; }

// HLSL: 0 off, 1 steady, 2 blinking (blinking still runs on the GPU)
uint s = _State[instanceID];
float on = s == 1 ? 1 : s == 2 ? step(0.5, frac(_Time.y * 2)) : 0;`,
  part: `// the lamp is a zone of the machine's mesh: vertex color .a = 1 there
// its state is one more number in the machine's per-instance data
struct MachineData { float4x4 objectToWorld; uint lampState; };
float lamp = v.color.a * LampLevel(_Machines[instanceID].lampState, _Time.y);`,
  naive: `// what not to do: 2000 GameObjects, 2000 coroutines
IEnumerator Blink() {
    while (true) {
        yield return new WaitForSeconds(0.5f);   // allocates unless cached
        renderer.enabled = !renderer.enabled;
    }
}`,
};

const PT_CODE = {
  per: `// one ParticleSystem per machine: 2000 systems to update and draw
foreach (var machine in machines) machine.smoke.Play();`,
  shared: `// one system for the whole world; the simulation emits where it needs
var p = new ParticleSystem.EmitParams { applyShapeToPosition = true };
foreach (var m in machinesThatSmokeThisFrame) {
    p.position = m.exhaust;
    smoke.Emit(p, 3);
}`,
};

const ARGS_CODE = a => `var cmd = new GraphicsBuffer.IndirectDrawIndexedArgs[1];
cmd[0].indexCountPerInstance = ${a.indexCountPerInstance}; // byte offset 0
cmd[0].instanceCount         = ${a.instanceCount}; // offset 4
cmd[0].startIndex            = ${a.startIndex}; // offset 8
cmd[0].baseVertexIndex       = ${a.baseVertexIndex}; // offset 12
cmd[0].startInstance         = ${a.startInstance}; // offset 16
args.SetData(cmd);
Graphics.RenderMeshIndirect(rp, mesh, args);`;

export const DICT = {
  'page.title': { en: 'Drawing thousands in Unity — Render API, buffers, indirect · Tape 07', ru: 'Рисуем тысячи в Unity — Render API, буферы, indirect · Кассета 07' },

  /* ---------------- hero + map ---------------- */
  'hero.eyebrow': { en: 'Tape 07 · Rendering in Unity 6 · without GameObjects', ru: 'Кассета 07 · Рендер в Unity 6 · без GameObject' },
  'hero.title': { en: 'Drawing thousands', ru: 'Рисуем тысячи' },
  'hero.subtitle': { en: 'Render API, buffers, indirect, BRG and particles', ru: 'Render API, буферы, indirect, BRG и партиклы' },
  'hero.lede': {
    en: 'Tape 01 is about making GameObjects cheaper. This one is about the other half: when there are no GameObjects and you draw your own data. Which call to make, which buffer to create, how the GPU decides how many to draw, and where particles and plain shaders win. Every piece below is clickable.',
    ru: 'Кассета 01 — о том, как удешевить GameObject. Эта — о второй половине: когда GameObject нет и ты рисуешь свои данные. Какой вызов взять, какой буфер создать, как GPU сам решает, сколько рисовать, и где выигрывают партиклы и обычный шейдер. Всё ниже кликается.'
  },
  'hero.take': {
    en: '<div><span class="n">1</span><h3>Who owns the object?</h3><p>A GameObject with a renderer — make it cheaper (tape 01). Your own array — draw it yourself with the Render* calls.</p></div><div><span class="n">2</span><h3>Where does its data live?</h3><p>Re-sent by the CPU every frame, or resident in a GPU buffer and updated only when it changes.</p></div><div><span class="n">3</span><h3>Who decides how many?</h3><p>The CPU passes an array or a number, or a compute shader writes the count into an args buffer and the CPU never reads it.</p></div>',
    ru: '<div><span class="n">1</span><h3>Кто владеет объектом?</h3><p>GameObject с рендерером — удешевляй его (кассета 01). Твой массив — рисуй сам вызовами Render*.</p></div><div><span class="n">2</span><h3>Где живут его данные?</h3><p>CPU пересылает их каждый кадр — или они лежат в GPU-буфере и обновляются только при изменении.</p></div><div><span class="n">3</span><h3>Кто решает, сколько рисовать?</h3><p>CPU передаёт массив или число — или compute shader пишет количество в args-буфер, и CPU его не читает.</p></div>'
  },
  'map.tag': { en: 'MAP · TWO AXES', ru: 'КАРТА · ДВЕ ОСИ' },
  'map.h': { en: 'Every way to draw, on one board', ru: 'Все способы рисовать — на одной доске' },
  'map.hint': {
    en: 'Click a chip. The ones marked ·01 are covered in depth on tape 01; the rest are below on this tape.',
    ru: 'Нажми на фишку. Отмеченные ·01 подробно разобраны на кассете 01, остальные — ниже на этой.'
  },
  'map.axGo': { en: 'A GameObject owns it', ru: 'Владеет GameObject' },
  'map.axOwn': { en: 'Your own array owns it', ru: 'Владеет твой массив' },
  'map.axCpu': { en: 'CPU re-sends data every frame', ru: 'CPU шлёт данные каждый кадр' },
  'map.axGpu': { en: 'Data stays on the GPU', ru: 'Данные живут на GPU' },
  'map.q.go.cpu': { en: 'Renderer · prepared every frame', ru: 'Renderer · подготовка каждый кадр' },
  'map.q.own.cpu': { en: 'Your arrays · sent every frame', ru: 'Твои массивы · отправка каждый кадр' },
  'map.q.go.gpu': { en: 'Renderer · resident', ru: 'Renderer · резидентно' },
  'map.q.own.gpu': { en: 'Your buffers · resident', ru: 'Твои буферы · резидентно' },
  'map.who': { en: 'Who prepares data', ru: 'Кто готовит данные' },
  'map.cull': { en: 'Culling', ru: 'Culling' },
  'map.when': { en: 'Take it when', ru: 'Когда брать' },
  'map.inTape1': { en: 'Taken apart on tape 01 ►', ru: 'Разобрано на кассете 01 ►' },
  'map.below': { en: 'Taken apart below ▼', ru: 'Разобрано ниже ▼' },
  'map.names': both({
    static: 'Static batching', dynamic: 'Dynamic batching', srp: 'SRP Batcher', goInst: 'GPU instancing (Renderer)',
    grd: 'GPU Resident Drawer', rmesh: 'RenderMesh', rinst: 'RenderMeshInstanced', rprim: 'RenderMeshPrimitives · RenderPrimitives',
    rindirect: 'RenderMeshIndirect', brg: 'BatchRendererGroup',
  }),
  'map.info': {
    en: {
      static: ['Merges static meshes that share a material into big combined meshes when the build or scene is processed. The GPU draws the merged mesh; the objects can no longer move.', 'The editor, once', 'Unity, per object', 'Level geometry that never moves'],
      dynamic: ['Every frame the CPU merges small meshes with the same material into one. Costs CPU time and has tight vertex limits.', 'The CPU, every frame', 'Unity', 'Almost never in modern projects'],
      srp: ['Keeps material data in persistent GPU buffers, so switching between objects with the same shader variant skips most of the setup. The draw calls themselves remain.', 'The engine', 'Unity', 'Always on in URP/HDRP: the default for an ordinary scene'],
      goInst: ['Objects with the same mesh and material go out as one instanced draw with a block of matrices. In URP the SRP Batcher wins if the shader is compatible with it.', 'The engine', 'Unity', 'Hundreds of identical objects you still want as GameObjects'],
      grd: ['Unity 6: ordinary MeshRenderers are drawn through a BatchRendererGroup. Their data lives on the GPU and identical mesh + material pairs are instanced automatically.', 'The engine', 'The engine, optionally GPU occlusion culling', 'Big GameObject scenes where CPU render time became the bottleneck'],
      rmesh: ['One mesh with one matrix, drawn this frame without any Renderer. Call it every frame you want it seen.', 'You, on the CPU', 'By worldBounds, per call', 'A single object you do not want as a GameObject (a gizmo, a preview)'],
      rinst: ['You pass an array of matrices (or your own struct) from the CPU; Unity draws them instanced. The array goes to the GPU again every frame.', 'You, on the CPU, every frame', 'The whole call, by bounds Unity computes from your matrices; no per-instance culling', 'Thousands of objects from your own simulation whose data changes on the CPU'],
      rprim: ['The CPU only says how many. The shader reads positions from a StructuredBuffer by instance id; with RenderPrimitives there is no mesh at all and vertices come from SV_VertexID.', 'You, uploaded when it changes', 'By worldBounds; finer culling is yours', 'Tens of thousands from a buffer, count known on the CPU; procedural geometry'],
      rindirect: ['The count (and ranges) sit in a GPU buffer of draw arguments. A compute shader culls or generates instances and writes that count; the CPU never reads it back.', 'A compute shader, or you rarely', 'Yours, usually a compute shader', 'Tens or hundreds of thousands; grass, debris, crowds with GPU culling'],
      brg: ['The low-level API under Entities Graphics and the GPU Resident Drawer: you own the instance buffer, register meshes and materials, and fill visible instances and draw commands per view in a culling callback.', 'You, completely', 'Yours, in a callback (Burst jobs)', 'You are building your own rendering layer and need culling, LOD and memory under control'],
    },
    ru: {
      static: ['Склеивает статичные меши с общим материалом в большие объединённые меши при сборке или обработке сцены. GPU рисует склейку; двигать объекты уже нельзя.', 'Редактор, один раз', 'Unity, по объектам', 'Геометрия уровня, которая никогда не двигается'],
      dynamic: ['Каждый кадр CPU склеивает мелкие меши с одним материалом в один. Тратит CPU и имеет жёсткие лимиты по вершинам.', 'CPU, каждый кадр', 'Unity', 'В современных проектах почти никогда'],
      srp: ['Держит данные материалов в постоянных буферах на GPU, поэтому переход между объектами с одним вариантом шейдера обходится без большей части подготовки. Сами draw calls остаются.', 'Движок', 'Unity', 'Всегда включён в URP/HDRP: путь по умолчанию для обычной сцены'],
      goInst: ['Объекты с одним мешем и материалом уходят одним instanced-вызовом с блоком матриц. В URP побеждает SRP Batcher, если шейдер с ним совместим.', 'Движок', 'Unity', 'Сотни одинаковых объектов, которые удобно держать как GameObject'],
      grd: ['Unity 6: обычные MeshRenderer рисуются через BatchRendererGroup. Их данные живут на GPU, одинаковые меш + материал инстансятся автоматически.', 'Движок', 'Движок, опционально GPU occlusion culling', 'Большие сцены из GameObject, где узким местом стало CPU-время рендера'],
      rmesh: ['Один меш, одна матрица, рисуется в этом кадре без всякого Renderer. Вызывай каждый кадр, пока он должен быть виден.', 'Ты, на CPU', 'По worldBounds, на вызов', 'Один объект, которому не нужен GameObject (гизмо, превью)'],
      rinst: ['Ты передаёшь с CPU массив матриц (или свою структуру), Unity рисует их инстансингом. Массив уходит на GPU заново каждый кадр.', 'Ты, на CPU, каждый кадр', 'Весь вызов целиком по bounds, которые Unity считает по матрицам; поштучного culling нет', 'Тысячи объектов из своей симуляции, данные меняются на CPU'],
      rprim: ['CPU говорит только «сколько». Шейдер читает позиции из StructuredBuffer по номеру инстанса; у RenderPrimitives меша нет вовсе, вершины строятся из SV_VertexID.', 'Ты, заливаешь, когда меняется', 'По worldBounds; точнее — сам', 'Десятки тысяч из буфера, count известен на CPU; процедурная геометрия'],
      rindirect: ['Количество (и диапазоны) лежат в GPU-буфере аргументов отрисовки. Compute shader отсекает или порождает инстансы и сам пишет количество; CPU его никогда не читает.', 'Compute shader или изредка ты', 'Свой, обычно compute shader', 'Десятки и сотни тысяч: трава, обломки, толпы с GPU-culling'],
      brg: ['Низкоуровневый API под Entities Graphics и GPU Resident Drawer: буфер инстансов твой, меши и материалы ты регистрируешь сам, видимые инстансы и команды отрисовки заполняешь в callback culling для каждого вида.', 'Ты, полностью', 'Свой, в callback (Burst-джобы)', 'Ты строишь свой слой рендера и хочешь держать culling, LOD и память под контролем'],
    }
  },

  /* ---------------- CH.01 API ---------------- */
  'api.h2': { en: 'Draw* → Render*: one grid instead of a dozen names', ru: 'Draw* → Render*: одна сетка вместо дюжины имён' },
  'api.prose': {
    en: `<p>There is no “one old, one new” pair. There are two families: the old <code>Graphics.Draw*</code> calls and the newer <code>Graphics.Render*</code> calls added in Unity 2021.2. The new ones take a single <code>RenderParams</code> struct instead of a long list of overloads, and they work with <code>GraphicsBuffer</code>. Since the 2022.1 docs every old call says “This function is now obsolete. Use Graphics.Render… instead” — but only in the docs: there is no <code>[Obsolete]</code> attribute, old code compiles without warnings.</p>
<p>Every call is the answer to two questions. <b>Where does the geometry come from?</b> A Mesh, or nothing — the vertex shader builds vertices from <code>SV_VertexID</code>. <b>Who decides how many instances there are, and where their data comes from?</b> One matrix, an array of matrices from the CPU, just a number from the CPU (the shader reads the data itself), or a number that already sits in a GPU buffer.</p>
<p>That is also why <code>DrawMeshInstancedIndirect</code> and <code>RenderPrimitivesIndirect</code> are not a pair: the first draws a Mesh, the second draws without one. The new partner of <code>DrawMeshInstancedIndirect</code> is <code>RenderMeshIndirect</code>.</p>`,
    ru: `<p>Пары «одна старая, одна новая» нет. Есть два семейства: старые вызовы <code>Graphics.Draw*</code> и новые <code>Graphics.Render*</code>, появившиеся в Unity 2021.2. Новые принимают одну структуру <code>RenderParams</code> вместо длинного списка перегрузок и работают с <code>GraphicsBuffer</code>. Начиная с документации 2022.1 у каждого старого вызова написано «This function is now obsolete. Use Graphics.Render… instead» — но только в документации: атрибута <code>[Obsolete]</code> нет, старый код компилируется без предупреждений.</p>
<p>Каждый вызов — ответ на два вопроса. <b>Откуда геометрия?</b> Из Mesh или ниоткуда: вершинный шейдер строит вершины по <code>SV_VertexID</code>. <b>Кто решает, сколько инстансов и откуда их данные?</b> Одна матрица, массив матриц с CPU, просто число с CPU (данные шейдер читает сам) или число, которое уже лежит в GPU-буфере.</p>
<p>Поэтому <code>DrawMeshInstancedIndirect</code> и <code>RenderPrimitivesIndirect</code> — не пара: первый рисует Mesh, второй — без меша. Новый напарник <code>DrawMeshInstancedIndirect</code> — <code>RenderMeshIndirect</code>.</p>`
  },
  'api.facts': {
    en: `<div><span class="k need">Three rules</span><p><b>Instanced</b> — matrices come from the CPU in an array.</p>
<p><b>Primitives / Procedural</b> — the CPU sends no matrices at all, only a count; data is in your buffer.</p>
<p><b>Indirect</b> — even the count is in a GPU buffer: whatever the GPU computed, it draws, with zero readback.</p></div><div><span class="k need">And “Now”</span><p><code>DrawMeshNow</code> / <code>DrawProceduralNow</code> draw immediately with the currently set shader pass: no per-pixel lighting, no realtime shadows. There is no Render* twin; inside a pipeline use a <code>CommandBuffer</code> or a render pass.</p></div>`,
    ru: `<div><span class="k need">Три правила</span><p><b>Instanced</b> — матрицы приходят с CPU массивом.</p>
<p><b>Primitives / Procedural</b> — матриц с CPU нет вообще, только количество; данные в твоём буфере.</p>
<p><b>Indirect</b> — даже количество лежит в GPU-буфере: что GPU насчитал, то и рисует, без readback.</p></div><div><span class="k need">И «Now»</span><p><code>DrawMeshNow</code> / <code>DrawProceduralNow</code> рисуют сразу текущим проходом шейдера: без попиксельного света и realtime-теней. Двойника в Render* нет; внутри пайплайна — <code>CommandBuffer</code> или render pass.</p></div>`
  },
  'api.tag': { en: 'RIG · GEOMETRY × COUNT', ru: 'СТЕНД · ГЕОМЕТРИЯ × КОЛИЧЕСТВО' },
  'api.h': { en: 'Pick a cell — get the call, what the shader reads and the code', ru: 'Выбери клетку — получишь вызов, что читает шейдер и код' },
  'api.indexedTg': { en: '+ own index buffer', ru: '+ свой индексный буфер' },
  'api.aria': { en: 'Geometry and instance count grid', ru: 'Сетка: геометрия и количество инстансов' },
  'api.corner': { en: 'geometry ↓ · count →', ru: 'геометрия ↓ · количество →' },
  'api.cols': {
    en: { one: 'One object', cpuArray: 'Array of matrices from the CPU', cpuCount: 'A number from the CPU', gpuArgs: 'A number in a GPU buffer' },
    ru: { one: 'Один объект', cpuArray: 'Массив матриц с CPU', cpuCount: 'Число с CPU', gpuArgs: 'Число в GPU-буфере' }
  },
  'api.rows': { en: { mesh: 'A Mesh', none: 'No mesh' }, ru: { mesh: 'Есть Mesh', none: 'Меша нет' } },
  'api.noCell': { en: 'Does not exist: without a mesh there is nothing to send matrices for — the shader reads a buffer', ru: 'Не бывает: без меша матрицы с CPU слать незачем — шейдер читает буфер' },
  'api.count': { en: 'How many', ru: 'Сколько' },
  'api.shader': { en: 'The shader reads', ru: 'Шейдер читает' },
  'api.when': { en: 'Take it when', ru: 'Когда брать' },
  'api.info': {
    en: {
      'mesh.one': { what: 'One mesh with one matrix, drawn by the pipeline like a renderer would be, but only for this frame.', count: '1', shader: 'Ordinary object-to-world matrix', when: 'A single procedural object without a GameObject', code: CODE['mesh.one'] },
      'mesh.cpuArray': { what: 'An array of matrices — or your own unmanaged struct with an <code>objectToWorld</code> field, optionally <code>prevObjectToWorld</code> for motion vectors and <code>renderingLayerMask</code>; other fields are ignored — goes from the CPU into an instanced draw. The material needs Enable GPU Instancing. One draw holds up to 511 instances by default (objectToWorld and worldToObject each), 1023 with <code>#pragma instancing_options assumeuniformscaling</code>; Unity splits a bigger call into several.', count: 'The length you pass', shader: 'unity_ObjectToWorld per instance, from the array', when: 'Thousands of instances whose positions your C# computes every frame', code: CODE['mesh.cpuArray'] },
      'mesh.cpuCount': { what: 'The CPU passes only a count. No matrices travel: the shader reads per-instance data from your StructuredBuffer by instance id.', count: 'An int from the CPU', shader: 'Your StructuredBuffer[instance id]', when: 'Tens of thousands from a buffer that changes rarely; the count is known on the CPU', code: CODE['mesh.cpuCount'] },
      'mesh.gpuArgs': { what: 'The mesh is yours, but how many to draw sits in an IndirectArguments buffer. A compute shader can write that number, so the CPU never needs to know it.', count: 'instanceCount in the args buffer', shader: 'Your buffer, indexed by GetIndirectInstanceID()', when: 'A compute shader culls or spawns instances: grass, debris, GPU crowds', code: CODE['mesh.gpuArgs'] },
      'none.cpuCount': { what: 'No mesh at all. The vertex shader builds each vertex from SV_VertexID and SV_InstanceID and reads your buffers.', count: 'vertexCount × instanceCount from the CPU', shader: 'SV_VertexID, SV_InstanceID and your buffers', when: 'Quads, lines, ribbons, particles built entirely in the shader', code: CODE['none.cpuCount'] },
      'none.cpuCount.indexed': { what: 'The same, plus an index buffer of your own, so vertices can be shared between triangles.', count: 'indexCount × instanceCount from the CPU', shader: 'SV_VertexID (taken from your indices) and your buffers', when: 'Procedural meshes where triangles share vertices', code: CODE['none.cpuCount.indexed'] },
      'none.gpuArgs': { what: 'No mesh and no count from the CPU: both vertex and instance counts come from an IndirectDrawArgs buffer.', count: 'IndirectDrawArgs in a GPU buffer', shader: 'SV_VertexID and GetIndirectInstanceID()', when: 'The GPU itself generates geometry: marching cubes, GPU particles, procedural grass', code: CODE['none.gpuArgs'] },
      'none.gpuArgs.indexed': { what: 'Indexed version of the indirect draw: IndirectDrawIndexedArgs plus your index buffer.', count: 'IndirectDrawIndexedArgs in a GPU buffer', shader: 'Your indices, vertex and instance ids', when: 'GPU-generated geometry that also shares vertices', code: CODE['none.gpuArgs.indexed'] },
    },
    ru: {
      'mesh.one': { what: 'Один меш с одной матрицей, пайплайн рисует его как обычный рендерер, но только в этом кадре.', count: '1', shader: 'Обычную матрицу object-to-world', when: 'Один процедурный объект без GameObject', code: CODE['mesh.one'] },
      'mesh.cpuArray': { what: 'Массив матриц — или своя unmanaged-структура с полем <code>objectToWorld</code>, по желанию <code>prevObjectToWorld</code> для motion vectors и <code>renderingLayerMask</code>; остальные поля игнорируются — уходит с CPU в instanced-вызов. На материале нужна галочка Enable GPU Instancing. В один draw по умолчанию входит до 511 инстансов (на каждый objectToWorld и worldToObject), 1023 — с <code>#pragma instancing_options assumeuniformscaling</code>; вызов побольше Unity режет на несколько.', count: 'Длина, которую передал', shader: 'unity_ObjectToWorld каждого инстанса, из массива', when: 'Тысячи инстансов, позиции которых считает C# каждый кадр', code: CODE['mesh.cpuArray'] },
      'mesh.cpuCount': { what: 'CPU передаёт только количество. Матрицы не едут: шейдер читает данные инстанса из твоего StructuredBuffer по номеру инстанса.', count: 'int с CPU', shader: 'Твой StructuredBuffer[номер инстанса]', when: 'Десятки тысяч из буфера, который меняется редко; количество известно на CPU', code: CODE['mesh.cpuCount'] },
      'mesh.gpuArgs': { what: 'Меш твой, но сколько рисовать — лежит в буфере IndirectArguments. Это число может записать compute shader, и CPU его знать не нужно.', count: 'instanceCount в args-буфере', shader: 'Твой буфер по GetIndirectInstanceID()', when: 'Compute shader отсекает или порождает инстансы: трава, обломки, толпы на GPU', code: CODE['mesh.gpuArgs'] },
      'none.cpuCount': { what: 'Меша нет вовсе. Вершинный шейдер строит каждую вершину из SV_VertexID и SV_InstanceID и читает твои буферы.', count: 'vertexCount × instanceCount с CPU', shader: 'SV_VertexID, SV_InstanceID и твои буферы', when: 'Квады, линии, ленты, частицы, целиком построенные в шейдере', code: CODE['none.cpuCount'] },
      'none.cpuCount.indexed': { what: 'То же плюс свой индексный буфер, чтобы треугольники делили вершины.', count: 'indexCount × instanceCount с CPU', shader: 'SV_VertexID (из твоих индексов) и твои буферы', when: 'Процедурные меши, где треугольники делят вершины', code: CODE['none.cpuCount.indexed'] },
      'none.gpuArgs': { what: 'Ни меша, ни количества с CPU: и число вершин, и число инстансов — из буфера IndirectDrawArgs.', count: 'IndirectDrawArgs в GPU-буфере', shader: 'SV_VertexID и GetIndirectInstanceID()', when: 'Геометрию порождает сам GPU: marching cubes, GPU-частицы, процедурная трава', code: CODE['none.gpuArgs'] },
      'none.gpuArgs.indexed': { what: 'Индексированная версия indirect: IndirectDrawIndexedArgs плюс твой индексный буфер.', count: 'IndirectDrawIndexedArgs в GPU-буфере', shader: 'Твои индексы, номера вершин и инстансов', when: 'Геометрия с GPU, которая ещё и делит вершины', code: CODE['none.gpuArgs.indexed'] },
    }
  },
  'rp.h': { en: 'One struct instead of ten overloads', ru: 'Одна структура вместо десяти перегрузок' },
  'rp.hint': { en: 'Every Render* call takes a RenderParams. Click a field to see what it controls. Note the defaults: a fresh RenderParams casts no shadows and uses no probes.', ru: 'Каждый вызов Render* принимает RenderParams. Нажми на поле — увидишь, за что оно отвечает. Обрати внимание на значения по умолчанию: свежий RenderParams не отбрасывает теней и не использует пробы.' },
  'rp.fields': {
    en: {
      material: 'The material to draw with. The only field the constructor asks for: new RenderParams(material).',
      worldBounds: 'A world-space box around everything this call draws, used to cull and sort the call as a single entity. RenderMeshInstanced computes it from your matrices if you leave it; for Primitives and Indirect calls you must set it to cover all instances — the default is a zero-size box at the origin.',
      camera: 'Draw only for this camera. Left null, the call renders in every camera.',
      layer: 'The layer the draw belongs to, for culling masks and per-layer lighting.',
      renderingLayerMask: 'Rendering Layers: which lights and decals affect the draw.',
      shadowCastingMode: 'Whether the instances cast shadows (Off, On, TwoSided, ShadowsOnly). <b>Off by default</b> — unlike the old DrawMesh, which cast shadows. The classic “why no shadows” after migrating.',
      receiveShadows: 'Whether the instances receive shadows. False by default.',
      matProps: 'A MaterialPropertyBlock for per-call values such as buffers or a shared offset.',
      lightProbeUsage: 'How light probes light the draw: off, blended probes, a proxy volume, or custom. Off by default, as are reflection probes.',
      motionVectorMode: 'Whether the draw writes motion vectors, for TAA and motion blur.',
      rendererPriority: 'Sort order among transparent draws with the same material priority.',
      reflectionProbeUsage: 'How reflection probes are sampled for the draw.',
    },
    ru: {
      material: 'Материал, которым рисовать. Единственное поле, которое просит конструктор: new RenderParams(material).',
      worldBounds: 'Коробка в мировых координатах вокруг всего, что рисует вызов; по ней вызов отсекается и сортируется как одно целое. RenderMeshInstanced посчитает её сам по твоим матрицам; для Primitives и Indirect задай её сам на все инстансы — по умолчанию это коробка нулевого размера в начале координат.',
      camera: 'Рисовать только для этой камеры. Если null — вызов рисуется во всех камерах.',
      layer: 'Слой отрисовки — для culling mask и освещения по слоям.',
      renderingLayerMask: 'Rendering Layers: какие источники света и декали действуют на отрисовку.',
      shadowCastingMode: 'Отбрасывают ли инстансы тени (Off, On, TwoSided, ShadowsOnly). <b>По умолчанию Off</b> — в отличие от старого DrawMesh, где тени были. Классическое «куда делись тени» после перехода.',
      receiveShadows: 'Принимают ли инстансы тени. По умолчанию false.',
      matProps: 'MaterialPropertyBlock для значений на вызов: буферы, общий сдвиг.',
      lightProbeUsage: 'Как light probes освещают отрисовку: никак, смешанные пробы, proxy volume или свои. По умолчанию Off, как и reflection probes.',
      motionVectorMode: 'Пишет ли отрисовка motion vectors — для TAA и motion blur.',
      rendererPriority: 'Порядок сортировки среди прозрачных с тем же приоритетом материала.',
      reflectionProbeUsage: 'Как берутся reflection probes.',
    }
  },

  /* ---------------- CH.02 buffers ---------------- */
  'buf.h2': { en: 'GraphicsBuffer: one class, many jobs', ru: 'GraphicsBuffer: один класс, много ролей' },
  'buf.prose': {
    en: `<p>A buffer is a linear array of bytes in video memory: <code>count × stride</code>. That is all. The “many buffers” you meet are not different classes but different <b>targets</b> of one class, <code>GraphicsBuffer</code>: flags that say who is allowed to read it and how.</p>
<p>Think of a target as “who is the reader”: a shader reading an array of structs (<code>Structured</code>), a shader reading raw bytes (<code>Raw</code>), a compute shader appending with a GPU-side counter (<code>Append</code>), a draw call taking its numbers (<code>IndirectArguments</code>), or the input assembler fetching vertices and indices (<code>Vertex</code>, <code>Index</code>). Flags combine with <code>|</code>.</p>
<p>When in doubt, it is <code>Structured</code>. <code>IndirectArguments</code> is only for args. <code>Append</code> is for when a compute shader decides “how many”.</p>
<p>One more flag lives apart from targets: <code>UsageFlags.LockBufferForWrite</code>. With it, <code>LockBufferForWrite&lt;T&gt;()</code> hands you a <code>NativeArray</code> to write straight into (fewer copies than <code>SetData</code>) — for buffers you refill every frame. The GPU may then only read that buffer.</p>`,
    ru: `<p>Буфер — это линейный массив байт в видеопамяти: <code>count × stride</code>. Всё. «Куча буферов», которую ты встречаешь, — не разные классы, а разные <b>роли (Target)</b> одного класса <code>GraphicsBuffer</code>: флаги, которые говорят, кому и как его можно читать.</p>
<p>Думай о Target как о «кто читатель»: шейдер читает массив структур (<code>Structured</code>), шейдер читает сырые байты (<code>Raw</code>), compute дописывает элементы со счётчиком на GPU (<code>Append</code>), draw call берёт свои числа (<code>IndirectArguments</code>), input assembler тянет вершины и индексы (<code>Vertex</code>, <code>Index</code>). Флаги комбинируются через <code>|</code>.</p>
<p>Сомневаешься — бери <code>Structured</code>. <code>IndirectArguments</code> — только для args. <code>Append</code> — когда «сколько» решает compute shader.</p>
<p>Ещё один флаг живёт отдельно от ролей: <code>UsageFlags.LockBufferForWrite</code>. С ним <code>LockBufferForWrite&lt;T&gt;()</code> даёт <code>NativeArray</code>, в который пишешь напрямую (копий меньше, чем у <code>SetData</code>), — для буферов, которые перезаливаешь каждый кадр. GPU такой буфер может только читать.</p>`
  },
  'names.tag': { en: 'THREE NAMES THAT CONFUSE', ru: 'ТРИ ИМЕНИ, КОТОРЫЕ ПУТАЮТ' },
  'names.aria': { en: 'Buffer class', ru: 'Класс буфера' },
  'names.is': { en: 'What it is', ru: 'Что это' },
  'names.use': { en: 'Use it', ru: 'Когда' },
  'names.info': {
    en: {
      graphics: ['The general GPU buffer class. Every target lives here, and the Render* calls, indirect draws and Mesh.GetVertexBuffer all speak GraphicsBuffer.', 'GPU memory with targets', 'In new code, always'],
      compute: ['The older class for compute-shader buffers (Default, Append, Counter, IndirectArguments types). It still works and is not deprecated, but it cannot be a vertex or index buffer and the new APIs take a GraphicsBuffer.', 'An older, narrower GPU buffer', 'Only in old code you do not want to touch'],
      command: ['Not a data buffer at all: a recorded list of GPU commands — “set this render target, draw this, dispatch that, copy this buffer”. The name is the trap.', 'A list of commands', 'To schedule work inside the pipeline (render passes, Render Graph)'],
    },
    ru: {
      graphics: ['Общий класс GPU-буфера. Все роли живут здесь, и вызовы Render*, indirect-отрисовка и Mesh.GetVertexBuffer говорят на GraphicsBuffer.', 'GPU-память с ролями', 'В новом коде — всегда'],
      compute: ['Старый класс для буферов compute-шейдеров (типы Default, Append, Counter, IndirectArguments). Работает и не помечен устаревшим, но не может быть вершинным или индексным буфером, а новые API ждут GraphicsBuffer.', 'Старый, более узкий GPU-буфер', 'Только в старом коде, который не хочется трогать'],
      command: ['Вообще не буфер данных: записанный список GPU-команд — «поставь этот render target, нарисуй это, запусти dispatch, скопируй буфер». Ловушка — в названии.', 'Список команд', 'Чтобы встроить работу в пайплайн (render pass, Render Graph)'],
    }
  },
  'targets.tag': { en: 'GRAPHICSBUFFER.TARGET', ru: 'GRAPHICSBUFFER.TARGET' },
  'targets.h': { en: 'Who reads this buffer?', ru: 'Кто читает этот буфер?' },
  'targets.hint': { en: 'Pick a target: who reads it, the HLSL declaration and the C# that creates it.', ru: 'Выбери роль: кто читает, объявление в HLSL и код на C#, который его создаёт.' },
  'targets.reader': { en: 'Reader', ru: 'Читает' },
  'targets.info': {
    en: {
      Structured: { what: 'An array of structs any shader can index. Nine times out of ten this is the buffer: instance matrices, colors, particle data.', reader: 'Any shader, by index', hlsl: 'StructuredBuffer<T> / RWStructuredBuffer<T>', code: TARGET_CODE.Structured },
      Raw: { what: 'Raw 32-bit words addressed by byte offset, so one buffer can hold mixed types. This is how you read a mesh’s own vertex buffer from a compute shader.', reader: 'A shader, by byte offset', hlsl: 'ByteAddressBuffer / RWByteAddressBuffer', code: TARGET_CODE.Raw },
      Append: { what: 'A structured buffer with a hidden counter: Append() is a GPU-side push_back. A culling compute shader writes the survivors here; the CPU does not know how many.', reader: 'A compute shader that appends or consumes', hlsl: 'AppendStructuredBuffer<T> / ConsumeStructuredBuffer<T>', code: TARGET_CODE.Append },
      Counter: { what: 'A structured buffer with a counter you move yourself with IncrementCounter / DecrementCounter, without append semantics.', reader: 'A shader that keeps its own count', hlsl: 'RWStructuredBuffer<T> + IncrementCounter()', code: TARGET_CODE.Counter },
      IndirectArguments: { what: 'The numbers of a draw or dispatch command: index count, instance count, start offsets. The CPU or a compute shader writes them, the draw call reads them.', reader: 'RenderMeshIndirect, RenderPrimitivesIndirect, DispatchIndirect', hlsl: 'none — or RWStructuredBuffer<uint> when a compute shader writes it', code: TARGET_CODE.IndirectArguments },
      Vertex: { what: 'A vertex buffer the input assembler binds and fetches by vertex layout.', reader: 'The input assembler', hlsl: 'none — vertex inputs', code: TARGET_CODE.Vertex },
      Index: { what: 'An index buffer: which vertices make each triangle.', reader: 'The input assembler', hlsl: 'none', code: TARGET_CODE.Index },
      Constant: { what: 'A constant buffer: small, uniform data every thread reads alike.', reader: 'Any shader, as a cbuffer', hlsl: 'cbuffer Settings { … }', code: TARGET_CODE.Constant },
      CopySource: { what: 'Allows the buffer to be the source of a GPU-side copy.', reader: 'Graphics.CopyBuffer, CommandBuffer.CopyBuffer', hlsl: 'none', code: TARGET_CODE.CopySource },
      CopyDestination: { what: 'Allows the buffer to be the destination of a GPU-side copy.', reader: 'Graphics.CopyBuffer, CommandBuffer.CopyBuffer', hlsl: 'none', code: TARGET_CODE.CopyDestination },
    },
    ru: {
      Structured: { what: 'Массив структур, который любой шейдер читает по индексу. В девяти случаях из десяти нужен именно он: матрицы инстансов, цвета, данные частиц.', reader: 'Любой шейдер, по индексу', hlsl: 'StructuredBuffer<T> / RWStructuredBuffer<T>', code: TARGET_CODE.Structured },
      Raw: { what: 'Сырые 32-битные слова по смещению в байтах, так что в одном буфере могут лежать разные типы. Так из compute-шейдера читают собственный вершинный буфер меша.', reader: 'Шейдер, по смещению в байтах', hlsl: 'ByteAddressBuffer / RWByteAddressBuffer', code: TARGET_CODE.Raw },
      Append: { what: 'Structured-буфер со скрытым счётчиком: Append() — это push_back на GPU. Compute, который отсекает, пишет сюда выживших; CPU не знает, сколько их.', reader: 'Compute shader, который дописывает или забирает', hlsl: 'AppendStructuredBuffer<T> / ConsumeStructuredBuffer<T>', code: TARGET_CODE.Append },
      Counter: { what: 'Structured-буфер со счётчиком, который ты двигаешь сам через IncrementCounter / DecrementCounter, без семантики append.', reader: 'Шейдер, который сам ведёт счёт', hlsl: 'RWStructuredBuffer<T> + IncrementCounter()', code: TARGET_CODE.Counter },
      IndirectArguments: { what: 'Числа команды отрисовки или dispatch: сколько индексов, сколько инстансов, начальные смещения. Пишет CPU или compute shader, читает draw call.', reader: 'RenderMeshIndirect, RenderPrimitivesIndirect, DispatchIndirect', hlsl: 'нет — или RWStructuredBuffer<uint>, если пишет compute', code: TARGET_CODE.IndirectArguments },
      Vertex: { what: 'Вершинный буфер: input assembler подключает его и читает по раскладке вершин.', reader: 'Input assembler', hlsl: 'нет — входы вершины', code: TARGET_CODE.Vertex },
      Index: { what: 'Индексный буфер: из каких вершин состоит каждый треугольник.', reader: 'Input assembler', hlsl: 'нет', code: TARGET_CODE.Index },
      Constant: { what: 'Constant buffer: маленькие общие данные, которые все потоки читают одинаково.', reader: 'Любой шейдер, как cbuffer', hlsl: 'cbuffer Settings { … }', code: TARGET_CODE.Constant },
      CopySource: { what: 'Разрешает буферу быть источником копирования на GPU.', reader: 'Graphics.CopyBuffer, CommandBuffer.CopyBuffer', hlsl: 'нет', code: TARGET_CODE.CopySource },
      CopyDestination: { what: 'Разрешает буферу быть приёмником копирования на GPU.', reader: 'Graphics.CopyBuffer, CommandBuffer.CopyBuffer', hlsl: 'нет', code: TARGET_CODE.CopyDestination },
    }
  },
  'args.tag': { en: 'RIG · AN ARGS BUFFER, CELL BY CELL', ru: 'СТЕНД · ARGS-БУФЕР ПО ЯЧЕЙКАМ' },
  'args.h': { en: 'Five numbers that decide what the GPU draws', ru: 'Пять чисел, которые решают, что нарисует GPU' },
  'args.hint': {
    en: 'One IndirectDrawIndexedArgs command is five uints, 20 bytes. The mesh: a vertex buffer with a house (vertices 0–4) and a tree (5–9), an index buffer of three triangles over the first five vertices, and a buffer with 12 instance slots. Change the numbers and watch.',
    ru: 'Одна команда IndirectDrawIndexedArgs — пять uint, 20 байт. Меш: вершинный буфер с домиком (вершины 0–4) и деревом (5–9), индексный буфер из трёх треугольников по первым пяти вершинам и буфер на 12 инстансов. Меняй числа и смотри.'
  },
  'args.fields': {
    en: {
      indexCountPerInstance: 'How many indices each instance draws (3 per triangle)',
      instanceCount: 'How many instances — the number a compute shader usually writes',
      startIndex: 'Where in the index buffer to start',
      baseVertexIndex: 'Added to every index: the same indices, other vertices',
      startInstance: 'First instance id; GetIndirectInstanceID() includes it, SV_InstanceID does not',
    },
    ru: {
      indexCountPerInstance: 'Сколько индексов рисует каждый инстанс (3 на треугольник)',
      instanceCount: 'Сколько инстансов — это число обычно пишет compute shader',
      startIndex: 'С какого места индексного буфера начать',
      baseVertexIndex: 'Прибавляется к каждому индексу: те же индексы, другие вершины',
      startInstance: 'Номер первого инстанса; GetIndirectInstanceID() его учитывает, SV_InstanceID — нет',
    }
  },
  'args.presets': {
    en: {
      all: { label: 'The whole house × 5', args: { indexCountPerInstance: 9, instanceCount: 5, startIndex: 0, baseVertexIndex: 0, startInstance: 0 } },
      roof: { label: 'Only the roof', args: { indexCountPerInstance: 3, instanceCount: 6, startIndex: 6, baseVertexIndex: 0, startInstance: 0 } },
      tree: { label: 'Same indices, tree vertices', args: { indexCountPerInstance: 9, instanceCount: 6, startIndex: 0, baseVertexIndex: 5, startInstance: 0 } },
      culled: { label: 'Culled to zero', args: { indexCountPerInstance: 9, instanceCount: 0, startIndex: 0, baseVertexIndex: 0, startInstance: 0 } },
      second: { label: 'Second command: ids from 6', args: { indexCountPerInstance: 9, instanceCount: 6, startIndex: 0, baseVertexIndex: 0, startInstance: 6 } },
    },
    ru: {
      all: { label: 'Весь домик × 5', args: { indexCountPerInstance: 9, instanceCount: 5, startIndex: 0, baseVertexIndex: 0, startInstance: 0 } },
      roof: { label: 'Только крыша', args: { indexCountPerInstance: 3, instanceCount: 6, startIndex: 6, baseVertexIndex: 0, startInstance: 0 } },
      tree: { label: 'Те же индексы, вершины дерева', args: { indexCountPerInstance: 9, instanceCount: 6, startIndex: 0, baseVertexIndex: 5, startInstance: 0 } },
      culled: { label: 'Всё отсечено', args: { indexCountPerInstance: 9, instanceCount: 0, startIndex: 0, baseVertexIndex: 0, startInstance: 0 } },
      second: { label: 'Вторая команда: номера с 6', args: { indexCountPerInstance: 9, instanceCount: 6, startIndex: 0, baseVertexIndex: 0, startInstance: 6 } },
    }
  },
  'args.svgAria': { en: 'Twelve instance slots and the triangles drawn in each', ru: 'Двенадцать слотов инстансов и треугольники, нарисованные в каждом' },
  'args.drawn': {
    en: (n, tris) => `Drawn: <b>${n}</b> instance${n === 1 ? '' : 's'} × <b>${tris}</b> triangle${tris === 1 ? '' : 's'}. ${n === 0 ? 'An instanceCount of 0 is legal: the draw call is issued and draws nothing — exactly what GPU culling produces when nothing is visible.' : ''}`,
    ru: (n, tris) => `Нарисовано: <b>${n}</b> инст. × <b>${tris}</b> треуг. ${n === 0 ? 'instanceCount = 0 — законно: вызов уходит и ничего не рисует. Ровно это и получается, когда GPU-culling ничего не нашёл.' : ''}`
  },
  'args.warn': {
    en: {
      indexOut: 'startIndex + indexCount runs past the index buffer. On a real GPU this reads garbage or nothing — the driver will not stop you.',
      instanceOut: 'Instance ids run past your instance buffer. The shader would read past the end of _Instances.',
      vertexOut: 'baseVertexIndex points indices past the vertex buffer.',
      partialTriangle: 'indexCount is not a multiple of 3: the leftover indices make no triangle.',
    },
    ru: {
      indexOut: 'startIndex + indexCount вылезает за индексный буфер. На настоящем GPU это мусор или пустота — драйвер не остановит.',
      instanceOut: 'Номера инстансов вылезают за твой буфер инстансов. Шейдер прочитал бы за концом _Instances.',
      vertexOut: 'baseVertexIndex уводит индексы за вершинный буфер.',
      partialTriangle: 'indexCount не кратен 3: лишние индексы треугольника не дают.',
    }
  },
  'args.code': { en: ARGS_CODE, ru: ARGS_CODE },

  /* ---------------- CH.03 indirect ---------------- */
  'cull.h2': { en: 'One frame of GPU culling: the CPU never learns the count', ru: 'Кадр GPU-culling: CPU так и не узнаёт количество' },
  'cull.prose': {
    en: `<p>This is the reason the whole <code>Append → IndirectArguments</code> chain exists. All N instances sit in a <code>Structured</code> buffer, uploaded once. Every frame a compute shader tests each of them against the camera and appends the survivors to a second buffer. One GPU-side copy moves the append counter into the <code>instanceCount</code> cell of the args buffer, and <code>RenderMeshIndirect</code> draws exactly that many.</p>
<p>The CPU issues four commands and never reads a number back. Switch on the naive version and see why that matters: reading the count on the CPU makes it wait for the GPU, and the overlap between CPU and GPU frames disappears.</p>`,
    ru: `<p>Ради этого и существует вся цепочка <code>Append → IndirectArguments</code>. Все N инстансов лежат в <code>Structured</code>-буфере, залитом один раз. Каждый кадр compute shader проверяет каждый из них против камеры и дописывает выживших во второй буфер. Одно копирование на GPU переносит счётчик append в ячейку <code>instanceCount</code> args-буфера, и <code>RenderMeshIndirect</code> рисует ровно столько.</p>
<p>CPU отдаёт четыре команды и ни одного числа назад не читает. Включи наивную версию и посмотри, почему это важно: чтение количества на CPU заставляет его ждать GPU, и кадры CPU и GPU перестают перекрываться.</p>`
  },
  'cull.facts': {
    en: `<div><span class="k need">Three buffers</span><p><b>instances</b> · Structured — all N, uploaded once.</p>
<p><b>visible</b> · Append — the compute shader writes survivors.</p>
<p><b>args</b> · IndirectArguments — one IndirectDrawIndexedArgs; instanceCount is filled on the GPU.</p></div><div><span class="k need">The trap</span><p>Set <code>RenderParams.worldBounds</code> to cover everything. The call is culled by that box before your compute shader’s result is ever used.</p></div>`,
    ru: `<div><span class="k need">Три буфера</span><p><b>instances</b> · Structured — все N, залиты один раз.</p>
<p><b>visible</b> · Append — compute пишет выживших.</p>
<p><b>args</b> · IndirectArguments — одна IndirectDrawIndexedArgs; instanceCount заполняется на GPU.</p></div><div><span class="k need">Ловушка</span><p>Задай <code>RenderParams.worldBounds</code> на всё сразу. Вызов отсекается по этой коробке раньше, чем пригодится результат твоего compute.</p></div>`
  },
  'cull.tag': { en: 'RIG · ONE FRAME, STEP BY STEP', ru: 'СТЕНД · ОДИН КАДР ПО ШАГАМ' },
  'cull.h': { en: 'Turn the camera, step through the frame', ru: 'Поверни камеру и пройди кадр по шагам' },
  'cull.readbackTg': { en: 'Naive: read the count on the CPU', ru: 'Наивно: читать количество на CPU' },
  'cull.cvAria': { en: 'A field of objects seen from above, a camera cone, visible objects highlighted', ru: 'Поле объектов сверху, конус камеры, видимые объекты подсвечены' },
  'cull.count': { en: 'Instances', ru: 'Инстансов' },
  'cull.angle': { en: 'Camera turn', ru: 'Поворот камеры' },
  'cull.play': { en: '► Play the frame', ru: '► Проиграть кадр' },
  'cull.pause': { en: '❚❚ Pause', ru: '❚❚ Пауза' },
  'cull.total': { en: 'In the buffer', ru: 'В буфере' },
  'cull.visible': { en: 'Visible', ru: 'Видимых' },
  'cull.cpuKnows': { en: 'The CPU knows', ru: 'CPU знает' },
  'cull.nothing': { en: 'nothing', ru: 'ничего' },
  'cull.steps': {
    en: {
      reset: ['Reset the counter', 'CPU · one command', 'The Append buffer’s hidden counter goes to zero. Otherwise last frame’s survivors stay counted.', CULL_CODE.reset],
      dispatch: ['Cull on the GPU', 'CPU issues · GPU runs', 'One thread per instance: test against the camera, Append() if visible. Thousands of tests run in parallel; the CPU only issued a dispatch.', CULL_CODE.dispatch],
      copyCount: ['Counter → args', 'GPU → GPU', 'CopyCount writes the append counter into instanceCount, byte offset 4 of the args buffer. No data leaves the GPU. On DirectX 11/12 the destination must be a Raw or IndirectArguments buffer.', CULL_CODE.copyCount],
      drawIndirect: ['Draw indirect', 'CPU issues · GPU draws', 'RenderMeshIndirect reads its numbers from args. The shader maps each instance to a visible index and reads the matrix.', CULL_CODE.drawIndirect],
      readback: ['Read the count back', 'GPU → CPU', 'The naive way: copy the counter into a small buffer and GetData() it to know how many to draw.', CULL_CODE.readback],
      wait: ['The CPU waits', 'CPU stalls', 'GetData has to wait until the GPU has executed everything queued before it — usually the previous frame or two. The CPU sits idle; the GPU then sits idle waiting for the next commands.', CULL_CODE.wait],
      drawCpu: ['Draw with the CPU’s count', 'CPU issues · GPU draws', 'The same picture as the indirect path, bought with a sync point every frame.', CULL_CODE.drawCpu],
    },
    ru: {
      reset: ['Обнулить счётчик', 'CPU · одна команда', 'Скрытый счётчик Append-буфера — в ноль. Иначе выжившие прошлого кадра останутся в счёте.', CULL_CODE.reset],
      dispatch: ['Culling на GPU', 'CPU запускает · GPU считает', 'Один поток на инстанс: проверка против камеры, Append(), если виден. Тысячи проверок идут параллельно; CPU лишь запустил dispatch.', CULL_CODE.dispatch],
      copyCount: ['Счётчик → args', 'GPU → GPU', 'CopyCount пишет счётчик append в instanceCount — смещение 4 байта в args-буфере. Данные с GPU не уходят. На DirectX 11/12 приёмник должен быть буфером Raw или IndirectArguments.', CULL_CODE.copyCount],
      drawIndirect: ['Отрисовка indirect', 'CPU запускает · GPU рисует', 'RenderMeshIndirect берёт свои числа из args. Шейдер сопоставляет каждый инстанс видимому индексу и читает матрицу.', CULL_CODE.drawIndirect],
      readback: ['Прочитать количество', 'GPU → CPU', 'Наивный способ: скопировать счётчик в маленький буфер и забрать его через GetData(), чтобы знать, сколько рисовать.', CULL_CODE.readback],
      wait: ['CPU ждёт', 'CPU простаивает', 'GetData ждёт, пока GPU выполнит всё, что стояло в очереди до него, — обычно прошлый кадр-два. CPU простаивает, а потом простаивает GPU в ожидании следующих команд.', CULL_CODE.wait],
      drawCpu: ['Отрисовка с числом от CPU', 'CPU запускает · GPU рисует', 'Та же картинка, что и в indirect, купленная точкой синхронизации в каждом кадре.', CULL_CODE.drawCpu],
    }
  },
  'cull.blk': {
    en: { submit: 'submit', wait: 'waits for the GPU', cull: 'cull', draw: 'draw', queued: 'previous frames' },
    ru: { submit: 'команды', wait: 'ждёт GPU', cull: 'culling', draw: 'отрисовка', queued: 'прошлые кадры' }
  },
  'cull.stallNote': {
    en: ms => `The CPU sat idle for about ${ms} ms waiting for queued GPU work — every frame. The numbers are a model to compare the two ways, not a measurement.`,
    ru: ms => `CPU простоял около ${ms} мс в ожидании очереди GPU — и так каждый кадр. Цифры — модель для сравнения двух способов, не замер.`
  },
  'cull.noStall': {
    en: 'The CPU only submits and moves on to the next frame; the GPU works on its own. The numbers are a model, not a measurement.',
    ru: 'CPU только отдаёт команды и уходит к следующему кадру; GPU работает сам. Цифры — модель, не замер.'
  },

  /* ---------------- CH.04 BRG ---------------- */
  'brg.h2': { en: 'BatchRendererGroup: the engine inside the engine', ru: 'BatchRendererGroup: движок внутри движка' },
  'brg.prose': {
    en: `<p><code>BatchRendererGroup</code> is the low-level API that both Entities Graphics and the GPU Resident Drawer are built on. You hand Unity a GPU buffer with instance data, describe its layout with metadata, register meshes and materials, and implement a culling callback that Unity calls for every view — each camera and each shadow cascade. In it you decide which instances are visible and write draw commands, usually in Burst jobs.</p>
<p>The data stays on the GPU between frames; you update only what changed. Shaders read it through DOTS instancing (<code>DOTS_INSTANCING_ON</code>), which URP and HDRP shaders already support.</p>
<p>The question is not “BRG or not” but “who fills BRG for me”. Switch the owner above the table.</p>`,
    ru: `<p><code>BatchRendererGroup</code> — низкоуровневый API, на котором построены и Entities Graphics, и GPU Resident Drawer. Ты отдаёшь Unity GPU-буфер с данными инстансов, описываешь его раскладку метаданными, регистрируешь меши и материалы и пишешь callback culling, который Unity вызывает для каждого вида — каждой камеры и каждого каскада теней. В нём ты решаешь, какие инстансы видны, и пишешь команды отрисовки, обычно в Burst-джобах.</p>
<p>Данные остаются на GPU между кадрами; обновляешь только изменённое. Шейдеры читают их через DOTS instancing (<code>DOTS_INSTANCING_ON</code>), который шейдеры URP и HDRP уже поддерживают.</p>
<p>Вопрос не «BRG или нет», а «кто заполняет BRG за меня». Переключи владельца над таблицей.</p>`
  },
  'brg.facts': {
    en: `<div><span class="k need">Versus RenderMeshIndirect</span><p>Indirect: you do culling on the GPU yourself, Unity knows nothing about your instances. BRG: Unity calls you per view (cameras, shadows) and draws what you list, with SRP lighting, picking and shadows built in.</p></div><div><span class="k need">Cost</span><p>The most code of anything on this tape. Worth it when you are building a rendering layer, not a feature.</p></div>`,
    ru: `<div><span class="k need">Против RenderMeshIndirect</span><p>Indirect: culling на GPU делаешь сам, Unity о твоих инстансах ничего не знает. BRG: Unity сам зовёт тебя на каждый вид (камеры, тени) и рисует то, что ты перечислил, — со светом SRP, picking и тенями из коробки.</p></div><div><span class="k need">Цена</span><p>Больше всего кода из всего, что есть на этой кассете. Окупается, когда строишь слой рендера, а не фичу.</p></div>`
  },
  'brg.tag': { en: 'RIG · WHO DOES WHAT', ru: 'СТЕНД · КТО ЧТО ДЕЛАЕТ' },
  'brg.h': { en: 'The same BRG, three owners', ru: 'Один BRG, три владельца' },
  'brg.aria': { en: 'Who fills the BatchRendererGroup', ru: 'Кто заполняет BatchRendererGroup' },
  'brg.own': { en: 'Your own BRG', ru: 'Свой BRG' },
  'brg.task': { en: 'Job', ru: 'Задача' },
  'brg.who': { en: 'Who does it', ru: 'Кто делает' },
  'brg.rows': {
    en: [
      ['Where objects come from', 'MeshRenderers in the scene', 'Entities with rendering components', '✋ Your arrays'],
      ['Instance data in a GPU buffer', 'The engine uploads and updates', 'The package uploads changed chunks', '✋ You fill a GraphicsBuffer, AddBatch with metadata'],
      ['Register meshes and materials', 'The engine', 'The package', '✋ RegisterMesh / RegisterMaterial'],
      ['Culling per camera and shadow view', 'The engine (+ GPU occlusion culling option)', 'The package, in jobs', '✋ Your OnPerformCulling callback'],
      ['Draw commands', 'The engine', 'The package', '✋ You write BatchCullingOutputDrawCommands'],
      ['Shaders', 'Standard URP/HDRP shaders work', 'Standard URP/HDRP shaders work', 'DOTS instancing support needed (URP/HDRP Lit have it)'],
    ],
    ru: [
      ['Откуда объекты', 'MeshRenderer в сцене', 'Сущности с компонентами рендера', '✋ Твои массивы'],
      ['Данные инстансов в GPU-буфере', 'Движок заливает и обновляет', 'Пакет заливает изменённые чанки', '✋ Ты заполняешь GraphicsBuffer, AddBatch с метаданными'],
      ['Регистрация мешей и материалов', 'Движок', 'Пакет', '✋ RegisterMesh / RegisterMaterial'],
      ['Culling на каждую камеру и тень', 'Движок (+ опция GPU occlusion culling)', 'Пакет, в джобах', '✋ Твой callback OnPerformCulling'],
      ['Команды отрисовки', 'Движок', 'Пакет', '✋ Ты пишешь BatchCullingOutputDrawCommands'],
      ['Шейдеры', 'Стандартные URP/HDRP работают', 'Стандартные URP/HDRP работают', 'Нужна поддержка DOTS instancing (у URP/HDRP Lit есть)'],
    ]
  },
  'brg.notes': {
    en: {
      grd: 'You write no BRG code: switch it on and ordinary MeshRenderers go through BRG. Excluded and left on the normal path: SkinnedMeshRenderers, particles, renderers with a MaterialPropertyBlock, a light probe proxy volume, a per-instance callback such as OnRenderObject, or a shader without DOTS instancing. Static batching should be off. Unity 6.0 needs Forward+; from 6.1 Deferred+ works too.',
      ent: 'If you already use ECS, Entities Graphics is BRG with everything filled in from components. You do not write the culling callback.',
      own: 'Everything with ✋ is yours — Unity does no frustum or occlusion culling of BRG instances for you. The project needs the SRP Batcher, BRG variants kept and unsafe code allowed. In return: no GameObjects, your own memory layout, culling and LOD, and Unity still lights, shadows and picks the result.',
    },
    ru: {
      grd: 'Кода BRG ты не пишешь: включил — обычные MeshRenderer пошли через BRG. Исключаются и идут обычным путём: SkinnedMeshRenderer, частицы, рендереры с MaterialPropertyBlock, с light probe proxy volume, с колбэком вроде OnRenderObject или с шейдером без DOTS instancing. Static batching лучше выключить. Unity 6.0 требует Forward+, с 6.1 подходит и Deferred+.',
      ent: 'Если ты уже на ECS, Entities Graphics — это BRG, заполненный из компонентов. Callback culling ты не пишешь.',
      own: 'Всё, что с ✋, — твоё: frustum и occlusion culling инстансов BRG Unity за тебя не делает. Проекту нужны SRP Batcher, BRG-варианты в сборке и разрешённый unsafe-код. Взамен: никаких GameObject, своя раскладка памяти, culling и LOD, а освещение, тени и picking Unity всё равно делает сам.',
    }
  },
  'brg.code': { en: BRG_CODE, ru: BRG_CODE },

  /* ---------------- CH.05 particles ---------------- */
  'pt.h2': { en: 'Particles: where they really win', ru: 'Партиклы: где они действительно выгоднее' },
  'pt.prose': {
    en: `<p>Particles win where you need hundreds or thousands of <b>short-lived things with no state and no gameplay meaning</b>, with birth, death and motion. Writing that yourself — a pool, spawning, gravity, fading, sorting, billboards — means writing a particle system again, only worse.</p>
<p><b>Shuriken</b> (the Particle System) simulates on the CPU and typically draws a system in one draw call per material (trails are separate). It collides with physics colliders, has sub-emitters and triggers, and C# can read every particle. <b>VFX Graph</b> simulates in compute shaders on the GPU: millions of particles, collisions with the depth buffer, signed distance fields and primitives, but the CPU does not see individual particles.</p>
<p>The border: a machine lives long, has state and is queried — it is an entity of your simulation. A spark lives half a second and nobody ever asks about it — it is an effect.</p>`,
    ru: `<p>Партиклы выигрывают там, где нужны сотни и тысячи <b>короткоживущих штук без состояния и без игрового смысла</b> — с рождением, смертью и движением. Писать это самому — пул, спавн, гравитация, затухание, сортировка, billboard — значит заново написать партикл-систему, только хуже.</p>
<p><b>Shuriken</b> (Particle System) симулирует на CPU и обычно рисует систему одним draw call на материал (trail — отдельно). Сталкивается с физическими коллайдерами, умеет sub-emitters и триггеры, и C# может прочитать каждую частицу. <b>VFX Graph</b> симулирует в compute-шейдерах на GPU: миллионы частиц, столкновения с depth-буфером, SDF и примитивами, но отдельных частиц CPU не видит.</p>
<p>Граница: станок живёт долго, имеет состояние, его о чём-то спрашивают — это сущность твоей симуляции. Искра живёт полсекунды, и про неё никто не спросит — это эффект.</p>`
  },
  'pt.facts': {
    en: `<div><span class="k need">Not particles</span><p>Items on a conveyor, anything with colliders and gameplay meaning, static decoration.</p></div><div><span class="k need">The usual mistake</span><p>One particle system per object on thousands of objects. Make one system per <i>type of effect</i> for the whole world and <code>Emit()</code> into it from the simulation.</p></div>`,
    ru: `<div><span class="k need">Не партиклы</span><p>Предметы на конвейере, всё, у чего коллайдеры и игровой смысл, статичный декор.</p></div><div><span class="k need">Частая ошибка</span><p>Своя партикл-система на каждый объект при тысячах объектов. Делай одну систему на <i>тип эффекта</i> на весь мир и <code>Emit()</code> в неё из симуляции.</p></div>`
  },
  'pt.tag': { en: 'RIG · WHAT KIND OF THING IS IT', ru: 'СТЕНД · ЧТО ЭТО ЗА ШТУКИ' },
  'pt.h': { en: 'Describe the things — get the tool', ru: 'Опиши штуки — получи инструмент' },
  'pt.count': { en: 'Alive at the same time', ru: 'Живых одновременно' },
  'pt.lifeAria': { en: 'Lifetime', ru: 'Время жизни' },
  'pt.short': { en: 'Live a second or two', ru: 'Живут секунду-две' },
  'pt.long': { en: 'Live for minutes', ru: 'Живут минутами' },
  'pt.colliders': { en: 'Must hit physics colliders', ru: 'Должны биться о коллайдеры' },
  'pt.cpuEvents': { en: 'C# must hear about each one', ru: 'C# должен узнать о каждой' },
  'pt.state': { en: 'Have state, are queried later', ru: 'Есть состояние, их спрашивают' },
  'pt.picks': {
    en: { entities: 'Not particles: entities + instancing', shuriken: 'Shuriken', shurikenHeavy: 'Shuriken — but watch the CPU', vfx: 'VFX Graph', either: 'Either: Shuriken or VFX Graph' },
    ru: { entities: 'Не партиклы: сущности + instancing', shuriken: 'Shuriken', shurikenHeavy: 'Shuriken — но следи за CPU', vfx: 'VFX Graph', either: 'Любой: Shuriken или VFX Graph' }
  },
  'pt.why': {
    en: {
      state: 'Things with gameplay state belong in your simulation’s arrays and are drawn with instancing. A particle system would hide the state you need to query.',
      long: 'Things that live for minutes are not effects. Keep them in the simulation and draw them as instances.',
      events: 'Per-particle callbacks into C# need the CPU to know each particle: that is Shuriken (collision and trigger messages, GetParticles). VFX Graph’s Output Event context sends events to C# (VisualEffect.outputEventReceived) from its spawn system, not from individual particles, and particle data cannot be read back.',
      colliders: 'Physics colliders live on the CPU, so does Shuriken’s world collision. VFX Graph collides with the depth buffer, SDFs and primitives instead.',
      many: 'Tens of thousands and more with simple behaviour: VFX Graph keeps the whole simulation on the GPU, the CPU barely notices.',
      few: 'A few thousand simple particles: both tools handle it. Shuriken is simpler to script, VFX Graph scales further.',
    },
    ru: {
      state: 'Штуки с игровым состоянием — в массивы симуляции и в instancing. Партикл-система спрячет состояние, которое тебе надо спрашивать.',
      long: 'То, что живёт минутами, — не эффект. Держи это в симуляции и рисуй инстансами.',
      events: 'Колбэк в C# на каждую частицу требует, чтобы CPU знал каждую частицу: это Shuriken (сообщения о столкновениях и триггерах, GetParticles). Контекст Output Event у VFX Graph шлёт события в C# (VisualEffect.outputEventReceived) от системы спавна, а не от отдельных частиц, и прочитать данные частиц обратно нельзя.',
      colliders: 'Физические коллайдеры живут на CPU, как и столкновения Shuriken с миром. VFX Graph сталкивается с depth-буфером, SDF и примитивами.',
      many: 'Десятки тысяч и больше с простым поведением: VFX Graph держит всю симуляцию на GPU, CPU почти не замечает.',
      few: 'Несколько тысяч простых частиц: справятся оба. Shuriken проще скриптовать, VFX Graph дальше масштабируется.',
    }
  },
  'pt.sysTag': { en: 'RIG · ONE SYSTEM PER WHAT', ru: 'СТЕНД · ОДНА СИСТЕМА НА ЧТО' },
  'pt.sysH': { en: 'Smoke over every machine', ru: 'Дымок над каждым станком' },
  'pt.sharedTg': { en: 'One shared system + Emit()', ru: 'Одна общая система + Emit()' },
  'pt.effects': { en: 'Machines that smoke', ru: 'Станков с дымком' },
  'pt.systems': { en: 'Particle systems', ru: 'Партикл-систем' },
  'pt.calls': { en: 'Draw calls (about)', ru: 'Draw calls (примерно)' },
  'pt.particles': { en: 'Particles', ru: 'Частиц' },
  'pt.perNote': {
    en: 'Each system is its own object: its own update, bounds, culling and draw. A thousand systems with ten particles each cost far more than one system with ten thousand.',
    ru: 'Каждая система — отдельный объект: свой update, bounds, culling и отрисовка. Тысяча систем по десять частиц стоит гораздо дороже одной системы на десять тысяч.'
  },
  'pt.sharedNote': {
    en: 'One system for the effect type, placed in world space. The simulation calls Emit() at the right positions when a machine smokes. The same idea as instancing: one container, many copies.',
    ru: 'Одна система на тип эффекта, в мировых координатах. Симуляция вызывает Emit() в нужных точках, когда станок дымит. Та же идея, что у instancing: один контейнер, много копий.'
  },
  'pt.perCode': { en: PT_CODE.per, ru: PT_CODE.per },
  'pt.sharedCode': { en: PT_CODE.shared, ru: PT_CODE.shared },

  /* ---------------- CH.06 lamps ---------------- */
  'lamp.h2': { en: 'Case: 2000 blinking lamps', ru: 'Кейс: 2000 мигающих лампочек' },
  'lamp.kicker': {
    en: 'It depends on one question: is the blinking cosmetic, or is it state? Switch between the answers and watch what the CPU sends to the GPU every frame.',
    ru: 'Всё зависит от одного вопроса: мигание — это косметика или состояние? Переключай ответы и смотри, что CPU шлёт на GPU каждый кадр.'
  },
  'lamp.tag': { en: 'RIG · THE SAME 2000 LAMPS', ru: 'СТЕНД · ТЕ ЖЕ 2000 ЛАМПОЧЕК' },
  'lamp.h': { en: 'Four ways to blink', ru: 'Четыре способа мигать' },
  'lamp.aria': { en: 'How the lamps are made', ru: 'Как сделаны лампочки' },
  'lamp.deco': { en: 'Decoration', ru: 'Декор' },
  'lamp.state': { en: 'Machine state', ru: 'Состояние станка' },
  'lamp.part': { en: 'Part of the machine', ru: 'Деталь станка' },
  'lamp.naive': { en: '2000 GameObjects', ru: '2000 GameObject' },
  'lamp.cvAria': { en: '2000 lamps blinking', ru: '2000 мигающих лампочек' },
  'lamp.bytes': { en: 'CPU → GPU this frame', ru: 'CPU → GPU в этом кадре' },
  'lamp.bytesD': { en: 'lamp data only', ru: 'только данные лампочек' },
  'lamp.calls': { en: 'Draw calls for lamps', ru: 'Draw calls на лампочки' },
  'lamp.callsPart': { en: 'drawn with the machines', ru: 'рисуются вместе со станками' },
  'lamp.objects': { en: 'Objects in the scene', ru: 'Объектов в сцене' },
  'lamp.coroutines': { en: n => `+ ${n} coroutines`, ru: n => `+ ${n} корутин` },
  'lamp.modes': {
    en: {
      deco: { text: '<p><b>Decoration</b> — a garland, background lights, nobody checks which one is on. The CPU does not take part at all: one mesh, one emissive material, all 2000 drawn instanced (or merged, if they never move). Each lamp shifts its phase by its own index, so they blink out of step but deterministically. Zero bytes per frame, a couple of shader instructions.</p><p>This is the right answer eight times out of ten.</p>', code: LAMP_CODE.deco },
      state: { text: '<p><b>State</b> — the lamp says a machine is working, overloaded or broken. The state lives in the simulation: an array of 2000 bytes, changed where the machine changes, by event. Once a frame, and only if something changed, it goes to a GPU buffer. The shader reads its own value by instance id: off, steady or blinking.</p><p>Notice: even here the blinking itself runs in the shader. The CPU sends a <i>mode</i>, not on/off every frame.</p>', code: LAMP_CODE.state },
      part: { text: '<p><b>Part of the machine</b> — there is no lamp mesh. The lamp’s vertices in the machine’s mesh are marked in the vertex color as an emissive zone, and its state is one more number in the machine’s per-instance data. The machine is already drawn as an instance, so the lamp is free.</p><p>The cheapest option, because the lamp does not exist as a thing at all.</p>', code: LAMP_CODE.part },
      naive: { text: '<p><b>What not to do.</b> 2000 GameObjects with a MeshRenderer and a coroutine each that flips <code>renderer.enabled</code>. That is 2000 coroutines, 2000 renderer toggles, up to 2000 draw calls, and <code>new WaitForSeconds</code> allocates unless you cache it.</p><p>And no 2000 <code>Light</code> components: real lights cost per light per pixel. A glow is emission above 1 in HDR plus bloom; real lights only for the few that matter.</p>', code: LAMP_CODE.naive },
    },
    ru: {
      deco: { text: '<p><b>Декор</b> — гирлянда, огоньки на фоне, никто не проверяет, какая горит. CPU не участвует вообще: один меш, один эмиссивный материал, все 2000 рисуются инстансингом (или склеены, если не двигаются). Каждая лампочка сдвигает фазу на свой номер, поэтому мигают вразнобой, но детерминированно. Ноль байт в кадр, пара инструкций шейдера.</p><p>Это правильный ответ в восьми случаях из десяти.</p>', code: LAMP_CODE.deco },
      state: { text: '<p><b>Состояние</b> — лампочка показывает, что станок работает, перегружен или сломан. Состояние живёт в симуляции: массив из 2000 байт, меняется там, где меняется станок, по событию. Раз в кадр и только если что-то поменялось, он уходит в GPU-буфер. Шейдер читает своё значение по номеру инстанса: выкл, горит, мигает.</p><p>Заметь: даже здесь само мигание — в шейдере. CPU шлёт <i>режим</i>, а не «вкл/выкл» каждый кадр.</p>', code: LAMP_CODE.state },
      part: { text: '<p><b>Деталь станка</b> — меша лампочки нет. Вершины лампочки в меше станка помечены в вершинном цвете как эмиссивная зона, а её состояние — ещё одно число в per-instance данных станка. Станок и так рисуется инстансом, лампочка на нём бесплатна.</p><p>Самый дешёвый вариант: лампочки как сущности вообще нет.</p>', code: LAMP_CODE.part },
      naive: { text: '<p><b>Как не надо.</b> 2000 GameObject с MeshRenderer и корутиной у каждого, которая щёлкает <code>renderer.enabled</code>. Это 2000 корутин, 2000 переключений рендерера, до 2000 draw calls, а <code>new WaitForSeconds</code> аллоцирует, если не закешировать.</p><p>И никаких 2000 <code>Light</code>: настоящий свет стоит на каждый источник на каждый пиксель. Свечение — это эмиссия выше 1 в HDR плюс bloom; настоящий свет — только для единичных важных.</p>', code: LAMP_CODE.naive },
    }
  },

  /* ---------------- CH.07 chooser ---------------- */
  'choose.h2': { en: 'What would you pick', ru: 'Что бы ты выбрал' },
  'choose.kicker': { en: 'Nine situations from real projects. Pick, then read why.', ru: 'Девять ситуаций из реальных проектов. Выбери, потом прочитай почему.' },
  'choose.prev': { en: '◀ Back', ru: '◀ Назад' },
  'choose.next': { en: 'Next ►', ru: 'Дальше ►' },
  'choose.of': { en: (i, n) => `Situation ${i} of ${n}`, ru: (i, n) => `Ситуация ${i} из ${n}` },
  'choose.right': { en: '✓ Right.', ru: '✓ Верно.' },
  'choose.wrong': { en: tool => `✗ Better: ${tool}.`, ru: tool => `✗ Лучше: ${tool}.` },
  'choose.hint': { en: 'Pick one of the four.', ru: 'Выбери один из четырёх.' },
  'choose.score': { en: (r, n) => `right ${r} of ${n}`, ru: (r, n) => `верно ${r} из ${n}` },
  'tools': {
    en: { static: 'Static batching', srp: 'SRP Batcher (default)', grd: 'GPU Resident Drawer', rinst: 'RenderMeshInstanced', rindirect: 'RenderMeshIndirect + compute', rprim: 'RenderPrimitives', brg: 'Your own BatchRendererGroup', shader: 'Instancing + the shader does it', shuriken: 'Shuriken', vfx: 'VFX Graph' },
    ru: { static: 'Static batching', srp: 'SRP Batcher (по умолчанию)', grd: 'GPU Resident Drawer', rinst: 'RenderMeshInstanced', rindirect: 'RenderMeshIndirect + compute', rprim: 'RenderPrimitives', brg: 'Свой BatchRendererGroup', shader: 'Instancing + всё делает шейдер', shuriken: 'Shuriken', vfx: 'VFX Graph' }
  },
  'choose.items': {
    en: {
      lamps: { q: '2000 decorative lamps on a factory floor blink out of step. Nobody checks which one is on.', a: 'The blinking is time in the shader with a phase from the instance index. The CPU sends nothing per frame; particles and buffers are overkill.' },
      level: { q: 'A big level of rocks, walls and props that never move, in many materials.', a: 'Static geometry is merged ahead of time; the SRP Batcher handles the rest. In Unity 6 the GPU Resident Drawer is the other good answer — but not both at once: static batching is not compatible with BRG or the GPU Resident Drawer. A hand-written buffer wins nothing here.' },
      grass: { q: '200 000 blades of grass around the player, only the visible ones should be drawn, the CPU budget is tight.', a: 'All blades sit in a buffer, a compute shader culls them against the camera and writes the count into an args buffer. The CPU never learns the number.' },
      rts: { q: '5000 RTS units. Your C# simulation moves them every frame; each needs a matrix.', a: 'The data already changes on the CPU every frame, so sending it as an array is natural. Beyond tens of thousands, move the simulation to jobs and write into a GPU buffer (or BRG).' },
      scene: { q: 'An ordinary Unity 6 URP scene of 30 000 MeshRenderers; the profiler shows the render thread is the bottleneck.', a: 'No rewrite needed: switch on the GPU Resident Drawer (Forward+, SRP Batcher on, BRG variants kept, static batching off) and the MeshRenderers move to a resident BRG path. GPU occlusion culling can go on top.' },
      sparks: { q: 'Welding sparks: 500 at a time, they bounce off the floor and machines, a sound plays when one hits.', a: 'Collisions with physics colliders and per-hit callbacks into C# need the CPU to know each particle: Shuriken.' },
      rain: { q: 'Rain over the whole city: a million drops, they splash on whatever is on screen.', a: 'Millions of simple particles with depth-buffer collisions: VFX Graph keeps it all on the GPU.' },
      engine: { q: 'You are building a custom renderer for a voxel world: your own chunk memory, LOD and culling in Burst jobs, with URP lighting and shadows.', a: 'This is exactly what BRG is for: your buffers and culling callback, Unity’s lighting, shadows and picking.' },
      ribbons: { q: 'Motion trails as ribbons: each is N points in a buffer; the geometry is a strip built in the vertex shader. The count is known on the CPU.', a: 'No mesh is needed: RenderPrimitives with a vertex count per ribbon, the shader builds the strip from SV_VertexID.' },
    },
    ru: {
      lamps: { q: '2000 декоративных лампочек в цехе мигают вразнобой. Никто не проверяет, какая горит.', a: 'Мигание — время в шейдере с фазой от номера инстанса. CPU ничего не шлёт в кадр; партиклы и буферы тут из пушки по воробьям.' },
      level: { q: 'Большой уровень из камней, стен и пропсов, которые никогда не двигаются, во множестве материалов.', a: 'Статика склеивается заранее, остальное — SRP Batcher. В Unity 6 второй хороший ответ — GPU Resident Drawer, но не вместе: static batching несовместим с BRG и GPU Resident Drawer. Рукописному буферу тут нечего выигрывать.' },
      grass: { q: '200 000 травинок вокруг игрока, рисовать только видимые, бюджет CPU жёсткий.', a: 'Все травинки в буфере, compute отсекает их по камере и пишет количество в args-буфер. CPU так и не узнаёт число.' },
      rts: { q: '5000 юнитов RTS. Твоя симуляция на C# двигает их каждый кадр, каждому нужна матрица.', a: 'Данные и так меняются на CPU каждый кадр, отправлять их массивом естественно. За десятками тысяч — симуляцию в джобы и запись в GPU-буфер (или BRG).' },
      scene: { q: 'Обычная сцена Unity 6 URP из 30 000 MeshRenderer; профайлер показывает, что узкое место — render thread.', a: 'Переписывать ничего не надо: включи GPU Resident Drawer (Forward+, SRP Batcher, BRG-варианты в сборке, static batching выключен), и MeshRenderer уйдут на резидентный путь BRG. Сверху можно включить GPU occlusion culling.' },
      sparks: { q: 'Искры от сварки: 500 одновременно, отскакивают от пола и станков, при ударе звучит звук.', a: 'Столкновения с физическими коллайдерами и колбэк в C# на удар требуют, чтобы CPU знал каждую частицу: Shuriken.' },
      rain: { q: 'Дождь над всем городом: миллион капель, разбиваются обо всё, что на экране.', a: 'Миллионы простых частиц со столкновениями по depth-буферу: VFX Graph держит всё на GPU.' },
      engine: { q: 'Ты пишешь свой рендер воксельного мира: своя память чанков, LOD и culling в Burst-джобах, со светом и тенями URP.', a: 'Ровно для этого и есть BRG: твои буферы и callback culling, а свет, тени и picking — Unity.' },
      ribbons: { q: 'Шлейфы движения лентами: каждый — N точек в буфере, геометрия — полоса, собранная в вершинном шейдере. Количество известно на CPU.', a: 'Меш не нужен: RenderPrimitives с числом вершин на ленту, шейдер строит полосу из SV_VertexID.' },
    }
  },

  /* ---------------- CH.08 interview ---------------- */
  'qa.h2': { en: 'Cheat sheet and questions you will be asked', ru: 'Шпаргалка и вопросы, которые спросят' },
  'qa.kicker': { en: 'Say your answer out loud before you open the card.', ru: 'Скажи ответ вслух, прежде чем открывать карточку.' },
  'cheat.task': { en: 'You have', ru: 'У тебя' },
  'cheat.pick': { en: 'Take', ru: 'Бери' },
  'cheat.why': { en: 'Because', ru: 'Потому что' },
  'cheat.rows': {
    en: [
      ['An ordinary scene of GameObjects', 'SRP Batcher; in Unity 6 also the GPU Resident Drawer', 'No code, the engine does it'],
      ['Thousands from your C# simulation', '<code>RenderMeshInstanced</code>', 'Data changes on the CPU anyway'],
      ['Tens of thousands from a buffer, count known', '<code>RenderMeshPrimitives</code> / <code>RenderPrimitives</code>', 'No matrices travel, only a number'],
      ['A compute shader decides how many', '<code>RenderMeshIndirect</code> + Append + CopyCount', 'Zero readback'],
      ['Your own rendering layer with culling and LOD', '<code>BatchRendererGroup</code>', 'Your memory, Unity’s lighting and shadows'],
      ['Short-lived effects', 'Shuriken; VFX Graph for very many', 'A ready-made simulation of birth and death'],
      ['Blinking, pulsing, scrolling', 'The shader, by time and instance index', 'Nothing per frame from the CPU'],
    ],
    ru: [
      ['Обычная сцена из GameObject', 'SRP Batcher; в Unity 6 ещё GPU Resident Drawer', 'Кода нет, всё делает движок'],
      ['Тысячи из своей симуляции на C#', '<code>RenderMeshInstanced</code>', 'Данные и так меняются на CPU'],
      ['Десятки тысяч из буфера, количество известно', '<code>RenderMeshPrimitives</code> / <code>RenderPrimitives</code>', 'Матрицы не едут, только число'],
      ['Количество решает compute shader', '<code>RenderMeshIndirect</code> + Append + CopyCount', 'Ноль readback'],
      ['Свой слой рендера с culling и LOD', '<code>BatchRendererGroup</code>', 'Твоя память, свет и тени Unity'],
      ['Короткоживущие эффекты', 'Shuriken; VFX Graph, если их очень много', 'Готовая симуляция рождения и смерти'],
      ['Мигание, пульсация, бегущая текстура', 'Шейдер по времени и номеру инстанса', 'С CPU в кадр — ничего'],
    ]
  },
  'qa.items': {
    en: [
      ['What replaced DrawMeshInstancedIndirect, and why is RenderPrimitivesIndirect not its twin?', '<p><code>RenderMeshIndirect</code>: same idea — a Mesh, the count from a GPU args buffer — but with <code>RenderParams</code> and a <code>GraphicsBuffer</code> of typed <code>IndirectDrawIndexedArgs</code>, and several commands per call. <code>RenderPrimitivesIndirect</code> draws without a mesh; its old twin is <code>DrawProceduralIndirect</code>.</p>'],
      ['Instanced, Procedural/Primitives, Indirect — what is the difference?', '<p>Who decides how many and where the data comes from. Instanced: an array of matrices from the CPU. Primitives/Procedural: only a count from the CPU, the shader reads your buffer. Indirect: even the count is in a GPU buffer, so a compute shader can decide it.</p>'],
      ['ComputeBuffer, GraphicsBuffer, CommandBuffer — which is which?', '<p>GraphicsBuffer is the general GPU buffer with targets; the new APIs take it. ComputeBuffer is the older, narrower class for compute buffers — still working. CommandBuffer is not a data buffer at all but a list of GPU commands.</p>'],
      ['What are GraphicsBuffer targets for?', '<p>They say who reads the buffer: shaders as an array (Structured), as raw bytes (Raw), compute with a GPU counter (Append/Counter), a draw or dispatch taking its numbers (IndirectArguments), the input assembler (Vertex/Index), a cbuffer (Constant), GPU copies (CopySource/CopyDestination). Flags combine.</p>'],
      ['How do you draw only visible instances without the CPU knowing how many?', '<p>Instances in a Structured buffer; a compute shader appends the visible ones to an Append buffer; <code>GraphicsBuffer.CopyCount</code> copies its counter into <code>instanceCount</code> of an IndirectArguments buffer; <code>RenderMeshIndirect</code> draws. Reset the counter with <code>SetCounterValue(0)</code> each frame.</p>'],
      ['Why not just read the visible count with GetData?', '<p>GetData waits for the GPU to finish everything queued before it. The CPU stalls, CPU and GPU stop working on different frames in parallel, and you lose that overlap every frame. If you must read back, use <code>AsyncGPUReadback</code> and accept a frame or more of latency.</p>'],
      ['My RenderMeshIndirect draws nothing when the camera turns. Why?', '<p>The call is culled as a whole by <code>RenderParams.worldBounds</code>. With buffer-driven instances set bounds that cover all of them.</p>'],
      ['What is in IndirectDrawIndexedArgs, and what does startInstance do?', '<p>indexCountPerInstance, instanceCount, startIndex, baseVertexIndex, startInstance — five uints, 20 bytes. startInstance offsets instance ids for this command; in the shader use <code>GetIndirectInstanceID()</code>, because <code>SV_InstanceID</code> alone starts at zero.</p>'],
      ['BRG, GPU Resident Drawer, Entities Graphics — how are they related?', '<p>BatchRendererGroup is the low-level API. The GPU Resident Drawer fills it automatically from MeshRenderers; Entities Graphics fills it from ECS components; or you fill it yourself: buffers, registered meshes and materials, a culling callback per view writing draw commands.</p>'],
      ['When are particles the right answer, and which ones?', '<p>For many short-lived things without state: sparks, smoke, dust. Shuriken when you need physics colliders or per-particle C# events; VFX Graph when there are tens of thousands and the logic is simple. Anything with state and a long life is an entity drawn with instancing. One system per effect type, not per object.</p>'],
      ['2000 lamps must blink. How?', '<p>The blinking itself is always in the shader by time. From the CPU only the state, and only when it changes — or nothing at all if it is decoration. Best of all, the lamp is an emissive zone of the machine’s mesh with one number in the machine’s per-instance data.</p>'],
    ],
    ru: [
      ['Что заменило DrawMeshInstancedIndirect и почему RenderPrimitivesIndirect — не его близнец?', '<p><code>RenderMeshIndirect</code>: та же идея — Mesh и количество из GPU-буфера args, — но с <code>RenderParams</code> и <code>GraphicsBuffer</code> с типизированными <code>IndirectDrawIndexedArgs</code>, и несколько команд за вызов. <code>RenderPrimitivesIndirect</code> рисует без меша; его старый близнец — <code>DrawProceduralIndirect</code>.</p>'],
      ['Instanced, Procedural/Primitives, Indirect — в чём разница?', '<p>Кто решает «сколько» и откуда данные. Instanced: массив матриц с CPU. Primitives/Procedural: с CPU только количество, шейдер читает твой буфер. Indirect: даже количество лежит в GPU-буфере, и его может решить compute shader.</p>'],
      ['ComputeBuffer, GraphicsBuffer, CommandBuffer — что есть что?', '<p>GraphicsBuffer — общий GPU-буфер с ролями, новые API принимают его. ComputeBuffer — старый, более узкий класс для compute, по-прежнему работает. CommandBuffer — вообще не буфер данных, а список GPU-команд.</p>'],
      ['Зачем нужны роли GraphicsBuffer.Target?', '<p>Они говорят, кто читает буфер: шейдер как массив (Structured), как байты (Raw), compute со счётчиком на GPU (Append/Counter), draw или dispatch за своими числами (IndirectArguments), input assembler (Vertex/Index), cbuffer (Constant), копирование на GPU (CopySource/CopyDestination). Флаги комбинируются.</p>'],
      ['Как нарисовать только видимые инстансы, чтобы CPU не знал, сколько их?', '<p>Инстансы в Structured-буфере; compute дописывает видимые в Append-буфер; <code>GraphicsBuffer.CopyCount</code> копирует его счётчик в <code>instanceCount</code> буфера IndirectArguments; <code>RenderMeshIndirect</code> рисует. Счётчик каждый кадр обнуляй через <code>SetCounterValue(0)</code>.</p>'],
      ['Почему бы просто не прочитать количество через GetData?', '<p>GetData ждёт, пока GPU выполнит всё, что стояло до него. CPU простаивает, CPU и GPU перестают параллельно работать над разными кадрами, и это перекрытие теряется каждый кадр. Если читать всё же нужно — <code>AsyncGPUReadback</code> с задержкой в кадр и больше.</p>'],
      ['RenderMeshIndirect ничего не рисует, когда камера поворачивается. Почему?', '<p>Вызов целиком отсекается по <code>RenderParams.worldBounds</code>. Для инстансов из буфера задай bounds, которые покрывают их все.</p>'],
      ['Что лежит в IndirectDrawIndexedArgs и что делает startInstance?', '<p>indexCountPerInstance, instanceCount, startIndex, baseVertexIndex, startInstance — пять uint, 20 байт. startInstance сдвигает номера инстансов этой команды; в шейдере бери <code>GetIndirectInstanceID()</code>, потому что голый <code>SV_InstanceID</code> начинается с нуля.</p>'],
      ['BRG, GPU Resident Drawer, Entities Graphics — как связаны?', '<p>BatchRendererGroup — низкоуровневый API. GPU Resident Drawer заполняет его автоматически из MeshRenderer, Entities Graphics — из компонентов ECS, или заполняешь сам: буферы, зарегистрированные меши и материалы, callback culling на каждый вид, который пишет команды отрисовки.</p>'],
      ['Когда партиклы — правильный ответ и какие?', '<p>Для множества короткоживущих штук без состояния: искры, дым, пыль. Shuriken, если нужны физические коллайдеры или события в C# на частицу; VFX Graph, если их десятки тысяч и логика простая. Всё с состоянием и долгой жизнью — сущность с instancing. Одна система на тип эффекта, а не на объект.</p>'],
      ['2000 лампочек должны мигать. Как?', '<p>Само мигание — всегда в шейдере по времени. С CPU только состояние и только при изменении, а если это декор — ничего. Лучше всего — лампочка как эмиссивная зона меша станка с одним числом в его per-instance данных.</p>'],
    ]
  },

  'foot.stop': { en: '■ STOP · END OF TAPE 07', ru: '■ STOP · КОНЕЦ КАССЕТЫ 07' },
  'foot.source': {
    en: 'Checked against the Unity 6 Scripting API and Manual. The CPU/GPU timings on the culling rig are a model for comparing approaches, not measurements.',
    ru: 'Сверено со Scripting API и Manual Unity 6. Время CPU/GPU на стенде culling — модель для сравнения подходов, не замер.'
  },
};

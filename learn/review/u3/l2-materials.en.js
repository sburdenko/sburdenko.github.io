/** Section 3, lesson 2 of the "Code review: find the bug" course. */
export default {
  id: 'rv.u3.l2',
  title: 'Materials and batching',
  sub: 'renderer.material, SRP Batcher, MaterialPropertyBlock, GPU Instancing',
  minutes: 10,
  cards: [
    {
      t: 'learn',
      title: 'A private paint can for every marker',
      body: '<p>A workshop has one shared palette: red paint and gray paint. Any marker walks up and takes what it needs. That is <code>sharedMaterial</code>.</p><p>Now imagine that the first time a marker asks to be painted, it is handed its own <b>private can</b>, poured from the shared one. There are a hundred cans, and nobody knows who will throw them away. That is <code>renderer.material</code>: the first access <b>clones</b> the material for that renderer (the name gets an "(Instance)" suffix).</p><p>Two troubles at once: the copies are <b>not destroyed automatically</b>, and every marker now has its own material, so the GPU has a harder time merging them into one draw call.</p>',
      deep: '<p>The Unity docs say it plainly: you are responsible for destroying materials created through <code>.material</code> (<code>Destroy</code> in <code>OnDestroy</code>). They are only cleaned up automatically when unused assets are unloaded: <code>Resources.UnloadUnusedAssets</code>, or a normal (Single mode) scene load. In a long-lived scene the copies pile up.</p>'
    },
    {
      t: 'rig', rig: 'hunt',
      task: 'Three methods paint markers. Find both different ways to do it badly.',
      code: `private void Recolor(List<GameObject> markers)
{
    for (int i = 0; i < markers.Count; i++)
    {
        var r = markers[i].GetComponent<Renderer>();
        r.material.color = i < 10 ? Color.red : Color.gray;
    }
}

private void Dim(Renderer r)
{
    r.sharedMaterial.color = Color.gray;
}

private void Glow(Renderer r)
{
    r.material.SetFloat("_Glow", 1f);
}`,
      bugs: [
        { lines: [5, 16], title: 'Touching .material creates a copy', why: 'Every renderer gets a private material. The copies pile up in memory until someone destroys them, and batching falls apart.' },
        { lines: [11], title: 'sharedMaterial.color paints the shared material', why: 'You change the material itself: the color changes for everything that uses it. In the editor the change is even saved into the asset file.' }
      ],
      goal: { min: 2, maxFalse: 2 },
      solve: ['flag:5', 'flag:11', 'check']
    },
    {
      t: 'choice',
      q: 'There are 100 markers in the scene and each one called renderer.material.color. How many materials live in memory now?',
      options: [
        'One: the material is shared',
        'About a hundred copies plus the original',
        'Two: red and gray'
      ],
      answer: 1,
      explain: 'The first access to .material on each renderer clones the source material. The copies stay until someone destroys them or unused assets are unloaded.',
      wrong: {
        0: 'The material stays shared only while you read .sharedMaterial.',
        2: 'You would get red and gray if we assigned two ready-made materials.'
      }
    },
    {
      t: 'learn',
      title: 'What batching is',
      body: '<p>Every "draw this" command costs the CPU time. <b>Batching</b> merges commands so there are fewer of them.</p><p><b>Static</b> works for objects that never move and have the Static flag. <b>Dynamic</b>: the CPU merges small meshes that share a material (small means roughly 300 vertices; it is off by default in URP). <b>SRP Batcher</b>, in URP and HDRP: objects with the same <b>shader</b> are drawn back to back without reconfiguring, and the material data lives in GPU memory. <b>GPU Instancing</b>: one mesh and one material are drawn as a pack, and the values that differ go in an array.</p><p>The general idea: the more things are identical, the better they merge.</p>'
    },
    {
      t: 'learn',
      title: 'Three right ways to paint',
      body: '<p><b>1. Two shared materials.</b> Red and gray are set up in the inspector, and the code is just <code>r.sharedMaterial = _red</code>. No copies, no leak.</p><p><b>2. MaterialPropertyBlock (MPB).</b> A note attached to the renderer: "use that material, but with a different color". No new material is created, so no leak.</p><p><b>3. GPU Instancing.</b> One material and one mesh, while each instance has its own color through an instanced shader property.</p><p>An important catch: in a <b>URP/HDRP</b> project an MPB takes that renderer out of the SRP Batcher. Different materials on the same shader, though, batch fine in the SRP Batcher! So for red/gray on URP, two shared materials are usually the best choice.</p>',
      deep: '<p>In the Built-in RP, "MPB + GPU Instancing" is the classic pair: different property values do not break instancing. In URP, if a renderer is SRP Batcher compatible, the SRP Batcher is used (it has priority), and instancing picks up the renderers the SRP Batcher cannot take (for example, those with an MPB). Shader compatibility is shown in the shader inspector ("SRP Batcher: compatible"). For thousands of identical objects, newer Unity versions also have Graphics.RenderMeshInstanced and BatchRendererGroup, but that is a separate topic.</p>'
    },
    {
      t: 'choice',
      q: 'A URP project, 500 markers, each either red or gray. What do you choose?',
      options: [
        'renderer.material.color on each one: "simpler"',
        'A MaterialPropertyBlock on every renderer',
        'Two shared materials on one shader and r.sharedMaterial = the right one',
        'Destroy and recreate the material every frame'
      ],
      answer: 2,
      explain: 'The SRP Batcher merges two shared materials on one shader with no trouble, and there are no copies.',
      wrong: {
        0: 'That means 500 material copies and garbage in memory.',
        1: 'An MPB removes the renderer from the SRP Batcher: on URP that is worse than two materials.',
        3: 'The worst option: heavy work and memory fragmentation every frame.'
      }
    },
    {
      t: 'blanks',
      q: 'Assign ready-made materials, and leave the renderer alone if it already has the right one.',
      code: `[SerializeField] private Material _red;
[SerializeField] private Material _gray;

private void Paint(Renderer r, int index)
{
    var target = index < 10 ? _red : _gray;
    if (r.___ != target)
        r.___ = target;
}`,
      tiles: ['sharedMaterial', 'sharedMaterial', 'material', 'color'],
      answer: ['sharedMaterial', 'sharedMaterial'],
      explain: 'sharedMaterial reads and assigns the shared material without cloning. If we read .material for the comparison, the copy would already be created by the check.'
    },
    {
      t: 'order',
      q: 'If you still need a MaterialPropertyBlock (Built-in RP or instancing), put the steps in order.',
      items: [
        'Create the MaterialPropertyBlock once, in a class field',
        'Get the property ID once with Shader.PropertyToID',
        'Read the renderer current values: r.GetPropertyBlock(block)',
        'Write the color: block.SetColor(id, color)',
        'Apply it to the renderer: r.SetPropertyBlock(block)'
      ],
      explain: 'The block and the ID are created once, so there is no garbage. After that the pattern is read, change, write.'
    },
    {
      t: 'multi',
      q: 'Which statements are true? Select all that apply.',
      options: [
        'The SRP Batcher can merge renderers with different materials on the same shader',
        'MaterialPropertyBlock is compatible with the SRP Batcher',
        'renderer.material clones the material, and you must destroy the copies yourself',
        'MaterialPropertyBlock creates a new material',
        'GPU Instancing draws instances that share one mesh and one material as a pack'
      ],
      answer: [0, 2, 4],
      explain: 'An MPB does not create new materials, but renderers with a block drop out of the SRP Batcher.'
    },
    {
      t: 'tapline',
      q: 'A URP project with the SRP Batcher on. Which line knocks the renderer out of the SRP Batcher?',
      code: `foreach (var r in renderers)
{
    r.sharedMaterial = _red;
    r.shadowCastingMode = ShadowCastingMode.Off;
    r.SetPropertyBlock(_block);
}`,
      answer: 4,
      explain: 'A renderer with a MaterialPropertyBlock does not use the SRP Batcher (it goes through the regular path or instancing). The other lines do not affect batching.'
    },
    {
      t: 'match',
      q: 'Match the approach to the situation',
      pairs: [
        ['Static batching', 'Buildings that never move'],
        ['Dynamic batching', 'Very small meshes in the Built-in RP'],
        ['SRP Batcher', 'URP/HDRP, many materials on one shader'],
        ['GPU Instancing', 'Thousands of identical meshes with different colors'],
        ['MaterialPropertyBlock', 'Different values on one material in the Built-in RP']
      ]
    },
    {
      t: 'learn',
      title: 'How to find a material leak',
      body: '<p>Open the <b>Memory Profiler</b> (or Profiler → Memory) and look at the material count. If it grows every time markers appear, some code uses <code>.material</code>. The copy names end with <b>"(Instance)"</b>.</p><p>The <b>Frame Debugger</b> shows why batches did not merge: every draw call has a reason ("Objects have different materials" and so on).</p>',
      deep: '<p>A small detail: <code>Material.color</code> writes to the property marked with the <code>[MainColor]</code> attribute or named <code>_Color</code>. In URP Lit shaders that is <code>_BaseColor</code>, which is marked correctly, but with hand-written shaders you can get "nothing changes color". With <code>SetColor</code> by string you must give the right name. Cache the ID: <code>Shader.PropertyToID("_BaseColor")</code>.</p>'
    }
  ]
};

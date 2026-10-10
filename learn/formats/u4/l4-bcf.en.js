/** 3D, unit 4, lesson 4: BCF, issues instead of models. */
export default {
  id: 'f3d.u4.l4',
  title: 'BCF: issues, not models',
  sub: 'How to say “the problem is right here”',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'An issue instead of a model',
      body: '<p>Finding a clash is only half the job. You have to hand it to whoever will fix it.</p><p><b>BCF</b> (BIM Collaboration Format, from buildingSMART) is not a model but an issue: a title, a status, an assignee, a camera viewpoint, a screenshot and the GlobalIds of the elements. The model itself is not inside.</p>'
    },
    {
      t: 'rig', rig: 'clash',
      task: 'Find the clash between duct D-7 and beam B-12 and create a BCF issue for it.',
      goal: { kind: 'bcf', pair: ['D-7', 'B-12'] },
      solve: ['run', 'pick:0', 'bcf']
    },
    {
      t: 'tapline',
      q: 'Which line points to a specific element in the model?',
      code: '<Topic Guid="7c1e…" TopicStatus="Open">\n  <Title>Duct D-7 × Beam B-12</Title>\n</Topic>\n<Component IfcGuid="0Np4AyS5p7Th2Wg9Va4Ij3"/>\n<PerspectiveCamera>…</PerspectiveCamera>',
      lang: 'plain',
      answer: 3,
      explain: 'IfcGuid is the same GlobalId from IFC. Any program can use it to find the duct in its own copy of the model.'
    },
    {
      t: 'choice',
      q: 'Why is BCF tiny even when the model weighs gigabytes?',
      options: ['It has no geometry: only GlobalId references, a camera and a screenshot', 'It is heavily compressed', 'It stores a simplified model'],
      answer: 0,
      explain: 'Every participant has their own copy of the model. BCF tells them where to look in it.'
    },
    {
      t: 'learn',
      title: 'Inside a .bcfzip',
      body: '<p>It is a zip archive. Each issue gets a folder with <code>markup.bcf</code> (XML: title, comments, status), <code>viewpoint.bcfv</code> (camera, visible and selected elements) and <code>snapshot.png</code>.</p><p>There is also the BCF API for exchanging issues through the cloud, with no files.</p>'
    },
    {
      t: 'order',
      q: 'The life of one issue',
      items: ['A check found a clash', 'The coordinator created a BCF with a camera and GlobalIds', 'The engineer opened the BCF and saw the same spot', 'They fixed the model and closed the issue'],
      explain: 'BCF connects people and programs without sending the model itself.'
    },
    {
      t: 'multi',
      q: 'What is inside a BCF? Select all.',
      options: ['The issue title and status', 'A camera viewpoint', 'A screenshot', 'Element GlobalIds', 'The building model itself'],
      answer: [0, 1, 2, 3],
      explain: 'Everything except the model.'
    },
    {
      t: 'choice',
      q: 'Will a BCF open in a different program from the one that created it?',
      options: ['Yes, if it supports BCF: it is an open buildingSMART standard', 'No, only in the same one', 'Only in Revit'],
      answer: 0,
      explain: 'BCF is supported by Revit, Archicad, Solibri, BIMcollab, Navisworks (via plugins) and many others.'
    }
  ]
};

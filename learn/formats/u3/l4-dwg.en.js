/** 3D, unit 3, lesson 4: DWG, DXF, DWF and 3DM. */
const DXF = '0\nLINE\n8\nWalls\n10\n0.0\n20\n0.0\n30\n0.0\n11\n5000.0\n21\n0.0\n31\n0.0';

export default {
  id: 'f3d.u3.l4',
  title: 'DWG, DXF, DWF and 3DM',
  sub: 'The AutoCAD and Rhino formats',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'DWG: AutoCAD’s native format',
      body: '<p>DWG arrived with AutoCAD in 1982. The format is closed: Autodesk does not publish the spec. It has versions (for example AC1032 is the AutoCAD 2018 format), and an old AutoCAD will not open a newer file.</p><p>Other programs read DWG through the Open Design Alliance libraries, built by reverse engineering.</p>'
    },
    {
      t: 'learn',
      title: 'DXF: the open text version',
      body: '<p>Autodesk documents DXF publicly. It is text made of “group code, value” pairs: 0 is the object type, 8 is the layer, 10/20/30 are X, Y, Z of the first point, 11/21/31 of the second.</p>',
      code: DXF,
      lang: 'plain'
    },
    {
      t: 'tapline',
      q: 'Tap the X value of the line’s second end',
      code: DXF,
      lang: 'plain',
      answer: 11,
      explain: 'Code 11 is the X of the second point, and the value comes on the next line: 5000.0.'
    },
    {
      t: 'choice',
      q: 'The drawing units are millimeters. How long is the line?',
      code: DXF,
      lang: 'plain',
      options: ['5 m', '5,000 m', '50 cm'],
      answer: 0,
      explain: 'From (0, 0, 0) to (5000, 0, 0) is 5,000 mm, which is 5 meters.'
    },
    {
      t: 'learn',
      title: 'DWF and 3DM',
      body: '<p><b>DWF</b> (Design Web Format) is a lightweight Autodesk format “for viewing and printing”, like PDF for drawings: you can look and mark up, but not edit.</p><p><b>3DM</b> is Rhino’s native format. The openNURBS library for reading and writing it is open, so many programs understand 3DM.</p>'
    },
    {
      t: 'choice',
      q: 'The client only needs to view the drawing and leave markups, with no editing rights. What do you send?',
      options: ['DWF (or PDF)', 'DWG', 'DXF', '3DM'],
      answer: 0,
      explain: 'DWG and DXF are source files and can be edited. DWF is for viewing.'
    },
    {
      t: 'multi',
      q: 'Which are true about DWG? Select all.',
      options: ['It is AutoCAD’s native format', 'The spec is closed', 'A newer DWG may not open in an older AutoCAD', 'It is a text format', 'It is an ISO standard'],
      answer: [0, 1, 2],
      explain: 'DXF is the text one. DWG is binary and is nobody’s standard but Autodesk’s.'
    },
    {
      t: 'blanks',
      q: 'Fill in the group code for the layer',
      code: '0\nLINE\n___\nWalls',
      lang: 'plain',
      tiles: ['8', '10', '0', '62'],
      answer: ['8'],
      explain: 'Code 8 is the layer name. 62 is the color number, 10 is the X coordinate.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['DWG', 'Closed native AutoCAD format'],
        ['DXF', 'Open text exchange'],
        ['DWF', 'View and markup only'],
        ['3DM', 'Rhino, openNURBS library']
      ]
    }
  ]
};

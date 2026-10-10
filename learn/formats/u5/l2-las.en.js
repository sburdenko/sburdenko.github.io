/** 3D, unit 5, lesson 2: LAS, LAZ and E57. */
export default {
  id: 'f3d.u5.l2',
  title: 'LAS, LAZ and E57',
  sub: 'Laser scanning standards',
  minutes: 6,
  cards: [
    {
      t: 'learn',
      title: 'LAS: the laser scanning standard',
      body: '<p>LAS is specified by ASPRS, the American Society for Photogrammetry and Remote Sensing. It is a binary file: a header and point records of equal size.</p><p>There are several record formats. For example, format 7 in LAS 1.4: coordinates, intensity, return number, class, GPS time and color, 36 bytes per point.</p>',
      deep: 'Coordinates are stored as 32-bit integers with a scale and offset from the header: X = Xrecord × scale + offset. That way millimeter precision fits in 4 bytes even for coordinates hundreds of kilometers out.'
    },
    {
      t: 'learn',
      title: 'LAZ: the same LAS, compressed',
      body: '<p>LAZ (LASzip) compresses LAS <b>losslessly</b>, usually down to 7–20% of the size. Decompress it and you get the original LAS, byte for byte.</p><p>That is why scan archives are almost always kept in LAZ.</p>'
    },
    {
      t: 'rig', rig: 'points',
      task: 'A 100-million-point scan has to fit into 1 GB. Pick a format in the calculator.',
      goal: { kind: 'fit', n: '100M', maxBytes: 1e9 },
      solve: ['n:100M', 'fmt:laz']
    },
    {
      t: 'choice',
      q: 'Why did LAZ fit while LAS did not?',
      options: ['LAZ compresses the same data losslessly several times over', 'LAZ throws away some points', 'LAZ stores fewer decimal places'],
      answer: 0,
      explain: 'Nothing is lost: neighboring points are similar, and the algorithm encodes the difference between them.'
    },
    {
      t: 'learn',
      title: 'E57: the open scanner format',
      body: '<p><b>E57</b> is the ASTM E2807 standard. It stores not only points but the structure of the survey: where the scanner stood, each station’s point grid, and panoramic photos.</p><p>It is handy for exchange between software from different scanner makers.</p>'
    },
    {
      t: 'choice',
      q: 'You need to hand over scans along with panoramic photos from each station. What do you pick?',
      options: ['E57', 'XYZ', 'STL', 'LAS'],
      answer: 0,
      explain: 'LAS and XYZ store only points. E57 can hold images and station positions too.'
    },
    {
      t: 'choice',
      q: 'How much space do 10 million points at 36 bytes take?',
      options: ['About 360 MB', 'About 36 MB', 'About 3.6 GB'],
      answer: 0,
      explain: '10,000,000 × 36 = 360,000,000 bytes.'
    },
    {
      t: 'multi',
      q: 'Which are true? Select all.',
      options: ['LAZ is lossless compression', 'A LAS point can have a class', 'E57 can store images', 'LAS is a text format', 'LAZ loses precision'],
      answer: [0, 1, 2],
      explain: 'LAS is binary, and LAZ gives the data back byte for byte.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['LAS', 'Binary ASPRS standard'],
        ['LAZ', 'LAS with lossless compression'],
        ['E57', 'Open ASTM format with scans and photos'],
        ['Record format 7', '36 bytes with color and time']
      ]
    }
  ]
};

/** 3D, unit 5, lesson 1: what a point cloud is. */
export default {
  id: 'f3d.u5.l1',
  title: 'What a point cloud is',
  sub: 'Millions of points instead of surfaces',
  minutes: 5,
  cards: [
    {
      t: 'learn',
      title: 'Millions of points instead of surfaces',
      body: '<p>A laser scanner stands on a construction site and “fires” a beam at everything around it. Each reflection is a point: x, y, z, sometimes a color and the strength of the return.</p><p>There are no surfaces, only points, and lots of them: millions or billions. Like a dot drawing made with a marker: from afar you see a house, up close only dots.</p>'
    },
    {
      t: 'rig', rig: 'points',
      task: 'Cycle through the color modes: what data does each point store? Look at at least three.',
      goal: { kind: 'modes', n: 3 },
      solve: ['mode:class', 'mode:intensity']
    },
    {
      t: 'choice',
      q: 'What is a point’s intensity?',
      options: ['How strongly the beam reflected off the surface', 'Screen brightness', 'Distance to the scanner'],
      answer: 0,
      explain: 'Glass and wet asphalt reflect weakly, white plaster strongly. That is why the windows look dark in the demo.'
    },
    {
      t: 'learn',
      title: 'Point classes',
      body: '<p>In LAS clouds each point can have a <b>class</b>: 2 is ground, 5 is high vegetation, 6 is building, 9 is water.</p><p>Algorithms and people assign classes so that later you can, say, keep only the ground and build the terrain.</p>'
    },
    {
      t: 'choice',
      q: 'You need to build the terrain of a site. Which points do you keep?',
      options: ['Class 2: ground', 'Class 6: buildings', 'All of them'],
      answer: 0,
      explain: 'A digital terrain model (DTM) is built from ground points. Trees and houses get in the way.'
    },
    {
      t: 'multi',
      q: 'Where do point clouds come from? Select all.',
      options: ['A terrestrial laser scanner', 'Lidar on a drone or plane', 'Photogrammetry from photos', 'The lidar in an iPhone Pro', 'Export from STL'],
      answer: [0, 1, 2, 3],
      explain: 'STL is already triangles. You can sample a cloud from it, but that is not a scan.'
    },
    {
      t: 'choice',
      q: 'What makes a point cloud awkward to display compared with a mesh?',
      options: ['There are no surfaces: up close you see gaps, and there are billions of points', 'It is always black and white', 'It cannot be rotated'],
      answer: 0,
      explain: 'That is why big clouds are shown in pieces: nearby areas in detail, distant ones thinned out.',
      deep: 'For the web, clouds are cut into an octree of detail levels, for example the Potree format or 3D Tiles. The viewer loads only visible and nearby nodes.'
    },
    {
      t: 'match',
      q: 'Match them up',
      pairs: [
        ['XYZ', 'The point’s position'],
        ['RGB', 'Color from the scanner’s camera'],
        ['Intensity', 'Strength of the beam’s return'],
        ['Class', 'Ground, building, vegetation']
      ]
    }
  ]
};

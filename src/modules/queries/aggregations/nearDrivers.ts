export const nearDrivers = (coordinates, distance) => [
  {
    $geoNear: {
      near: { type: 'Point', coordinates },
      distanceField: 'dist.calculated',
      maxDistance: distance,
      query: { role: 'JUN' },
      /* includeLocs: 'dist.test', */
      spherical: true,
    },
  },
];

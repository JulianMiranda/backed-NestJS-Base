export const nearDrivers = (coordinates: [number, number], distance) => [
  {
    $geoNear: {
      near: { type: 'Point', coordinates },
      distanceField: 'dist.calculated',
      maxDistance: distance,
      query: { role: 'JUN' },
      spherical: true,
    },
  },
];

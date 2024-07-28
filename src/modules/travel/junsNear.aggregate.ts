export const junsNear = (
  minDistance: number,
  maxDistance: number,
  coordinates: [number, number],
) => [
  {
    $geoNear: {
      near: { type: 'Point', coordinates },
      distanceField: 'dist.calculated',
      minDistance: minDistance,
      maxDistance: maxDistance,
      query: { role: 'JUN' },
      includeLocs: 'dist.test',
      spherical: true,
    },
  },
  { $sort: { ratingAvg: -1 } },
];

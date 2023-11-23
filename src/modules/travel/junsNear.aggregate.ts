export const junsNear = (
  minDistance: number,
  maxDistance: number,
  coordinates: any,
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

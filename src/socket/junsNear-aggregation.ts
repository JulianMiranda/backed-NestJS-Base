export const junsNear = (distance: number, coordinates: any) => [
  /*  {
    $match: {
      $expr: {
        $and: [
          { $eq: ['$status', true] },
          { $eq: ['$acceptFastTravel', true] },
          { $eq: ['$role', 'JUN'] },
        ],
      },
    },
  }, */
  {
    $geoNear: {
      near: { type: 'Point', coordinates },
      distanceField: 'dist.calculated',
      maxDistance: distance,
      query: { role: 'JUN' },
      includeLocs: 'dist.test',
      spherical: true,
    },
  },
];

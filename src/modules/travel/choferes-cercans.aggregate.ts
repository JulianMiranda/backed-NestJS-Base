import { PipelineStage } from 'mongoose';
export function choferesCercanosAggregate(
  minDistance: number,
  maxDistance: number,
  coordinates: [number, number],
  travelTypeField: any,
): PipelineStage[] {
  return [
    {
      $geoNear: {
        near: { type: 'Point', coordinates },
        distanceField: 'dist.calculated',
        minDistance: minDistance,
        maxDistance: maxDistance,
        query: {
          role: 'JUN',
          [travelTypeField]: true,
        },
        includeLocs: 'dist.test',
        spherical: true,
      },
    },
    { $match: { [travelTypeField]: true } },
    { $sort: { ratingAvg: -1 } },
  ];
}

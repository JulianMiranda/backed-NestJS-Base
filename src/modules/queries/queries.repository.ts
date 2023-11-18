import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';
import { nearDrivers } from './aggregations/nearDrivers';
import { GeoUtils } from 'src/utils/geoDistance';

@Injectable()
export class QueriesRepository {
  constructor(
    @InjectModel('Travel') private travelDb: Model<any>,
    @InjectModel('User') private userDb: Model<any>,
  ) {}

  async nearDrivers(data): Promise<any> {
    try {
      const { coordinates, distance } = data;
      console.log(data);
      return this.userDb.aggregate(nearDrivers(coordinates, distance));
    } catch (e) {
      throw new InternalServerErrorException('nearDrivers query error', e);
    }
  }

  async distanceFromTo(data): Promise<any> {
    const { latitud_punto1, longitud_punto1, latitud_punto2, longitud_punto2 } =
      data;
    try {
      return GeoUtils.calculateCostForDistance(
        GeoUtils.calculateHaversineDistance(
          latitud_punto1,
          longitud_punto1,
          latitud_punto2,
          longitud_punto2,
        ),
      );
      /* return this.userDb.aggregate(
        distanceFromTo(
          latitud_punto1,
          longitud_punto1,
          latitud_punto2,
          longitud_punto2,
        ),
      ); */
    } catch (e) {
      throw new InternalServerErrorException('nearDrivers query error', e);
    }
  }
}

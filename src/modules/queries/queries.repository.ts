import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';
import { GeoUtils } from 'src/utils/geoDistance';
import { Viaje, obtenerViajesSimilares } from 'src/utils/shared';

@Injectable()
export class QueriesRepository {
  constructor(
    @InjectModel('Travel') private travelDb: Model<any>,
    @InjectModel('User') private userDb: Model<any>,
  ) {}

  async nearDrivers(data): Promise<any> {
    try {
      const { coordinates, distance } = data;
      return this.userDb.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates },
            distanceField: 'dist.calculated',
            maxDistance: distance,
            query: { role: 'JUN' },
            spherical: true,
          },
        },
      ]);
    } catch (e) {
      throw new InternalServerErrorException('nearDrivers query error', e);
    }
  }

  async distanceFromTo(data): Promise<any> {
    const { latitud_punto1, longitud_punto1, latitud_punto2, longitud_punto2 } =
      data;
    try {
      const price = GeoUtils.calculateCostForDistance(
        GeoUtils.calculateHaversineDistance(
          latitud_punto1,
          longitud_punto1,
          latitud_punto2,
          longitud_punto2,
        ),
      );
      return {
        fast: price,
        fastShared: parseFloat((price * 0.7).toFixed(2)),
        schedule: parseFloat((price * 1.3).toFixed(2)),
        scheduleShared: parseFloat((price * 1.1).toFixed(2)),
      };
    } catch (e) {
      throw new InternalServerErrorException('nearDrivers query error', e);
    }
  }

  async test(data): Promise<any> {
    const { origen, destino } = data;
    try {
      const nuevoViaje: Viaje = {
        origen,
        destino,
      };
      const arrayDeViajes: Viaje[] = [
        {
          origen: { latitud: -0.145336, longitud: -78.500788 },
          destino: {
            latitud: -0.7163777574567749,
            longitud: -77.6681359555366,
          },
        },
        {
          origen: {
            latitud: -0.1693133577537478,
            longitud: -78.48148555916711,
          },
          destino: {
            latitud: -0.2498302883216194,
            longitud: -78.30466287449849,
          },
        },
        {
          origen: {
            latitud: -0.1693133577537478,
            longitud: -78.48148555916711,
          },
          destino: {
            latitud: -0.6279390740258882,
            longitud: -77.76705418442553,
          },
        },
        {
          origen: {
            latitud: -0.25364022281959864,
            longitud: -78.50349227942475,
          },
          destino: {
            latitud: -0.46244451915529117,
            longitud: -78.05347223320216,
          },
        },
      ];

      const viajesSimilares = await obtenerViajesSimilares(
        nuevoViaje,
        arrayDeViajes,
      );

      return viajesSimilares;
    } catch (e) {
      throw new InternalServerErrorException('nearDrivers query error', e);
    }
  }
}

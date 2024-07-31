import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Coordinates, Travel, TravelPoint } from 'src/dto/travel.dto';
import { User } from 'src/dto/user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TRAVELTYPE } from 'src/enums/traveltype.enum';
import { AppGateway } from 'src/app.gateway';
import { TRAVELSTATE } from 'src/enums/travelstate.enum';
import { choferesCercanosAggregate } from 'src/modules/travel/choferes-cercans.aggregate';

@Injectable()
export class TravelService {
  constructor(
    @InjectModel('Travel') private readonly travelDb: Model<Travel>,

    @Inject(forwardRef(() => AppGateway)) private appGateway: AppGateway,
  ) {}
  private getTravelTypeField(type: TRAVELTYPE): string {
    switch (type) {
      case TRAVELTYPE.FAST:
        return 'acceptFastTravel';
      case TRAVELTYPE.SCHEDULE:
        return 'acceptScheduleTravel';
      case TRAVELTYPE.FASTSHARED:
        return 'acceptFastSharedTravel';
      case TRAVELTYPE.SCHEDULESHARED:
        return 'acceptScheduleSharedTravel';
      default:
        throw new Error('Tipo de viaje no válido');
    }
  }
  async buscarChoferesCercanos(
    origen: Coordinates,
    minDistance: number,
    maxDistance: number,
    travelTypeField: string,
    userDb: Model<User, object, object>,
  ): Promise<User[]> {
    const { longitude, latitude } = origen;
    const coordinates: [number, number] = [latitude, longitude];

    const choferesCercanos = await userDb.aggregate(
      choferesCercanosAggregate(
        minDistance,
        maxDistance,
        coordinates,
        travelTypeField,
      ),
    );

    return choferesCercanos;
  }

  async proponerViajeOnetoOne(
    viaje: Travel,
    userDb: Model<User, object, object>,
    minDistance: number,
    maxDistance: number,
  ): Promise<void> {
    const { fromCoordinates, type } = viaje;
    const travelTypeField = this.getTravelTypeField(type);
    const origen = viaje.fromLocation.travelPoint.coordinates;

    const choferesCercanos = await this.buscarChoferesCercanos(
      origen,
      minDistance,
      maxDistance,
      travelTypeField,
      userDb,
    );
    let accepted = false;
    for (const chofer of choferesCercanos) {
      accepted = await this.proponerViajeAChofer(
        viaje,
        chofer,
        fromCoordinates,
      );
      if (accepted) {
        console.log('Viaje aceptado');
        const result = await this.travelDb.updateOne(
          {
            _id: viaje._id,
            state: TRAVELSTATE.ORDER,
            $or: [{ driver: { $exists: false } }, { driver: null }],
          },
          {
            $set: {
              state: TRAVELSTATE.TAKED,
              driver: chofer._id,
            },
          },
        );

        if (result.modifiedCount > 0) {
          // Si la actualización fue exitosa
          this.appGateway.emitToClient(viaje.user.toString(), 'viaje-tomado', {
            chofer,
          });
          this.appGateway.emitToClient(
            chofer._id.toString(),
            'viaje-confirmado',
            { viaje },
          );
          console.log('Viaje aceptado');
        } else {
          console.log(
            'El viaje no se pudo actualizar, ya fue tomado por otro chofer.',
          );
          this.appGateway.emitToClient(
            chofer._id.toString(),
            'viaje-no-confirmado',
            { message: 'No se pudo actualizar el viaje' },
          );
        }
        break;
      } else {
        console.log('viaje no aceptado');
      }
    }

    if (!accepted) {
      this.appGateway.emitToClient(viaje.user.toString(), 'viaje-no-tomado', {
        message: 'Ningún chofer aceptó el viaje',
      });
    }
  }

  private async proponerViajeAChofer(
    viaje: Travel,
    chofer: User,
    fromCoordinates: TravelPoint,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const clientId = chofer._id.toString();
      console.log('Viaje propuesto a: ', clientId);
      this.appGateway.emitToClient(clientId, 'propuesta-viaje', {
        viajeId: viaje._id,
        choferId: clientId,
        fromCoordinates: fromCoordinates,
        cost: viaje.cost,
        currency: viaje.currency,
        type: viaje.type,
      });
      const timeout = setTimeout(() => {
        resolve(false);
      }, 15000);
      this.appGateway.handleMessageRespPropuestaTS = (response) => {
        if (
          response.viajeId === viaje._id.toString() &&
          response.choferId === clientId
        ) {
          clearTimeout(timeout);
          resolve(response.accepted);
        }
      };
    });
  }

  /*---------------------------------------ANTES---------------------------------------*/
}

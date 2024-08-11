import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Coordinates, Travel } from 'src/dto/travel.dto';
import { User } from 'src/dto/user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TRAVELTYPE } from 'src/enums/traveltype.enum';
import { AppGateway } from 'src/app.gateway';
import { TRAVELSTATE } from 'src/enums/travelstate.enum';
import { choferesCercanosAggregate } from 'src/modules/travel/choferes-cercans.aggregate';

@Injectable()
export class TravelService {
  private pendingProposals: Map<string, (accepted: boolean) => void> =
    new Map();
  private travelAcceptedAfterTime: boolean = false;

  constructor(
    @InjectModel('Travel') private readonly travelDb: Model<Travel>,
    @InjectModel('User') private readonly userDb: Model<User>,
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
  ): Promise<User[]> {
    const { longitude, latitude } = origen;
    const coordinates: [number, number] = [latitude, longitude];

    const choferesCercanos = await this.userDb.aggregate(
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
    minDistance: number,
    maxDistance: number,
  ): Promise<void> {
    const { type } = viaje;
    const travelTypeField = this.getTravelTypeField(type);
    const origen = viaje.fromLocation.travelPoint.coordinates;

    const choferesCercanos = await this.buscarChoferesCercanos(
      origen,
      minDistance,
      maxDistance,
      travelTypeField,
    );
    this.travelAcceptedAfterTime = false;
    for (const chofer of choferesCercanos) {
      const accepted = await this.proponerViajeAChofer(viaje, chofer);
      console.log('accepted', accepted);

      if (accepted) {
        break;
      }
      if (this.travelAcceptedAfterTime) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera 10 segundos antes de la siguiente propuesta
    }
  }

  private async proponerViajeAChofer(
    viaje: Travel,
    chofer: User,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const driver = chofer._id.toString();
      const key = `${driver}-${viaje._id.toString()}`;
      console.log('Viaje propuesto a: ', driver);
      this.appGateway.emitToClient(driver, 'propuesta-viaje', {
        driver: driver,
        id: viaje._id,
        cost: viaje.cost,
        payment: viaje.payment,
        type: viaje.type,
        state: viaje.state,
        date: viaje.date,
        status: viaje.status,
        user: viaje.user,
        fromLocation: viaje.fromLocation,
        toLocation: viaje.toLocation,
      });

      const timeout = setTimeout(() => {
        this.pendingProposals.delete(key);
        resolve(false);
      }, 10000);

      this.pendingProposals.set(key, (accepted: boolean) => {
        clearTimeout(timeout);
        resolve(accepted);
      });
    });
  }

  async handlePropuestaResponse(response: {
    id: string;
    driver: string;
    accepted: boolean;
  }) {
    const key = `${response.driver}-${response.id}`;
    const resolve = this.pendingProposals.get(key);

    if (resolve) {
      resolve(response.accepted);
      this.pendingProposals.delete(key);
    }

    if (response.accepted) {
      const viaje = await this.travelDb.findOne({
        _id: response.id,
        state: TRAVELSTATE.ORDER,
        $or: [{ driver: { $exists: false } }, { driver: null }],
      });

      if (viaje) {
        const result = await this.travelDb.updateOne(
          {
            _id: viaje._id,
            state: TRAVELSTATE.ORDER,
            $or: [{ driver: { $exists: false } }, { driver: null }],
          },
          {
            $set: {
              state: TRAVELSTATE.TAKED,
              driver: response.driver,
            },
          },
        );

        if (result.modifiedCount > 0) {
          this.appGateway.emitToClient(viaje.user.toString(), 'viaje-tomado', {
            driver: response.driver,
          });
          this.appGateway.emitToClient(
            response.driver.toString(),
            'viaje-confirmado',
            { viaje },
          );
          await this.userDb.updateOne(
            { _id: response.driver },
            { isInTravel: true },
          );
          this.travelAcceptedAfterTime = true;
        } else {
          this.appGateway.emitToClient(
            response.driver.toString(),
            'viaje-no-confirmado',
            { message: 'El viaje ya fue tomado por otro chofer.' },
          );
        }
      } else {
        this.appGateway.emitToClient(
          response.driver.toString(),
          'viaje-no-confirmado',
          { message: 'El viaje no está disponible.' },
        );
      }
    } else {
      this.appGateway.emitToClient(response.driver, 'viaje-no-confirmado', {
        message: 'El viaje no fue confirmado a tiempo.',
      });
    }
  }
}

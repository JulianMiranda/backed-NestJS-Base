// otro-servicio.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Coordinates, Travel } from 'src/dto/travel.dto';
import { User } from 'src/dto/user.dto';
import { Model } from 'mongoose';
import { junsNear } from 'src/modules/travel/junsNear.aggregate';
import { SocketService } from 'src/socket/socket.service';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TravelService {
  constructor(
    @InjectModel('Travel') private readonly travelDb: Model<Travel>,
    private readonly socketService: SocketService,
  ) {}

  private propuestaAceptada = false;

  async stopSearching(user, travel) {
    console.log('stopSearching', user, travel);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ObjectId = require('mongodb').ObjectId;
      const userId = ObjectId(user);
      const travelId = ObjectId(travel);

      const travelDocument = await this.travelDb.updateOne(
        {
          _id: travelId,
          state: 'order',
          driver: { $exists: false },
        },
        {
          $set: {
            driver: userId,
            state: 'taked',
          },
        },
      );
      if (travelDocument.nModified > 0) {
        console.log('El viaje se actualizó exitosamente.');
        this.socketService.acceptedTravel({ userId, travelId });
      } else {
        console.log(
          'El viaje no se actualizó. Puede que no cumpla con los criterios de búsqueda.',
        );
        this.socketService.errorTakedTravel({ userId, travelId });
      }
      this.propuestaAceptada = true;
    } catch (e) {
      throw new InternalServerErrorException('stopSearching Database error', e);
    }
  }

  async enviarPropuestaPorSocketConTiempo(
    socketId: string,
    travelId: string,
    tiempoEspera: number,
    socketService: SocketService,
  ): Promise<void> {
    // ... lógica antes de enviar la propuesta

    // Enviar propuesta después de un tiempo de espera
    await this.tiempoDeEspera(tiempoEspera);

    if (!this.propuestaAceptada) {
      socketService.newTravel({
        userId: socketId,
        travelId,
      });
    }

    /*  setTimeout(() => {
      socketService.newTravel({
        userId: socketId,
        travelId,
      });
    }, tiempoEspera); */
  }

  async buscarChoferesCercanos(
    origen: Coordinates,
    minDistance: number,
    maxDistance: number,
    userDb: Model<User, object, object>,
  ): Promise<User[]> {
    const { longitude, latitude } = origen;
    const coordinates = [latitude, longitude];
    console.log('BuscarChof', minDistance, maxDistance, coordinates);

    const choferesCercanos = await userDb.aggregate(
      junsNear(minDistance, maxDistance, coordinates),
    );
    console.log('choferesCercanos', choferesCercanos);

    return choferesCercanos;
  }
  tiempoDeEspera(tiempoEspera: number): Promise<void> {
    return new Promise((resolve) => {
      // Utilizar setTimeout para esperar un tiempo adicional
      setTimeout(() => {
        resolve(); // Resuelve la promesa después del tiempo de espera adicional
      }, tiempoEspera);
    });
  }

  async proponerViajeAChoferes(
    origen: Coordinates,
    minDistance: number,
    maxDistance: number,
    tiempoEspera: number,
    travel: Travel,
    socketService: any,
    userDb: Model<User, object, object>,
  ): Promise<void> {
    console.log('proponerViajeAChoferes');
    console.log('origen', origen);
    console.log('minDistance', minDistance);
    console.log('maxDistance', maxDistance);
    console.log('tiempoEspera', tiempoEspera);
    console.log('travel', travel.id);
    const choferesCercanos = await this.buscarChoferesCercanos(
      origen,
      minDistance,
      maxDistance,
      userDb,
    );

    for (const chofer of choferesCercanos) {
      if (this.propuestaAceptada) {
        // Si la propuesta ya ha sido aceptada, detener la iteración
        console.log('Break Propusta aceptada');

        break;
      }
      const socketId = chofer._id; // Asume que tienes un campo socketId en tu entidad Chofer

      // Enviar propuesta después de un tiempo de espera
      await this.enviarPropuestaPorSocketConTiempo(
        socketId,
        travel._id,
        tiempoEspera,
        socketService,
      );
    }
    await this.tiempoDeEspera(tiempoEspera);
  }

  async proponerViajeConLogicaTiempo(
    viaje: Travel,
    socketService: SocketService,
    userDb: Model<User, object, object>,
  ): Promise<void> {
    console.log('TravelService proponerViajeConLogicaTiempo');

    const origen = viaje.fromLocation.travelPoint.coordinates;
    const minDistance = 1;
    const maxDistance = 1000;
    const tiempoEsperaInicial = 5000;
    const tiempoEsperaAdicional = 20000;
    await this.proponerViajeAChoferes(
      origen,
      minDistance,
      maxDistance,
      tiempoEsperaInicial,
      viaje,
      socketService,
      userDb,
    );

    // Después de 1 minuto, amplía el radio de búsqueda y vuelve a proponer el viaje
    setTimeout(async () => {
      await this.proponerViajeAChoferes(
        origen,
        minDistance + 1001,
        maxDistance + 1000,
        tiempoEsperaInicial,
        viaje,
        socketService,
        userDb,
      );

      // Si después de un tiempo adicional no hay respuesta, puedes realizar acciones adicionales
      setTimeout(() => {
        console.log(
          'Ningún chofer ha aceptado el viaje después del tiempo adicional.',
        );
        // Puedes implementar lógica adicional aquí, como buscar choferes en una ubicación más amplia, etc.
      }, tiempoEsperaAdicional);
    }, tiempoEsperaAdicional);
  }
}

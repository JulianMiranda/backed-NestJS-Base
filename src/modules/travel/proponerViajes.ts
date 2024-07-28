import { Coordinates, Travel } from 'src/dto/travel.dto';
import { junsNear } from './junsNear.aggregate';
import { User } from 'src/dto/user.dto';
import { Model } from 'mongoose';
import { SocketService } from 'src/socket/socket.service';

function enviarPropuestaPorSocketConTiempo(
  socketId: string,
  travelId: string,
  tiempoEspera: number,
  socketService: SocketService,
): Promise<void> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      socketService.newTravel({
        travelId: travelId,
        userId: socketId,
      });
      resolve();
    }, tiempoEspera);

    this.socketService.server.on('test', () => {
      console.log('Testing socket');
    });

    this.socket.on('accept-travel', () => {
      console.log('Socket en ProponerViaje');
      clearTimeout(timeoutId);
      resolve();
    });
  });
}

async function buscarChoferesCercanos(
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
function tiempoDeEspera(tiempoEspera: number): Promise<void> {
  return new Promise((resolve) => {
    // Utilizar setTimeout para esperar un tiempo adicional
    setTimeout(() => {
      resolve(); // Resuelve la promesa después del tiempo de espera adicional
    }, tiempoEspera);
  });
}

async function proponerViajeAChoferes(
  origen: Coordinates,
  minDistance: number,
  maxDistance: number,
  tiempoEspera: number,
  travel: Travel,
  socketRepository: any,
  userDb: Model<User, object, object>,
): Promise<void> {
  console.log('proponerViajeAChoferes');
  console.log('origen', origen);
  console.log('minDistance', minDistance);
  console.log('maxDistance', maxDistance);
  console.log('tiempoEspera', tiempoEspera);
  console.log('travel', travel.id);
  const choferesCercanos = await buscarChoferesCercanos(
    origen,
    minDistance,
    maxDistance,
    userDb,
  );

  let propuestaAceptada = false;

  for (const chofer of choferesCercanos) {
    if (propuestaAceptada) {
      // Si la propuesta ya ha sido aceptada, detener la iteración
      break;
    }
    const socketId = chofer._id; // Asume que tienes un campo socketId en tu entidad Chofer

    // Enviar propuesta después de un tiempo de espera
    await enviarPropuestaPorSocketConTiempo(
      socketId,
      travel._id,
      tiempoEspera,
      socketRepository,
    ).then(() => {
      propuestaAceptada = true;
    });
  }
  await tiempoDeEspera(tiempoEspera);
}

export async function proponerViajeConLogicaTiempo(
  viaje: Travel,
  socketService: SocketService,
  userDb: Model<User, object, object>,
): Promise<void> {
  console.log('proponerViajeConLogicaTiempo');

  const origen = viaje.fromLocation.travelPoint.coordinates;
  const minDistance = 1;
  const maxDistance = 1000;
  const tiempoEsperaInicial = 5000;
  const tiempoEsperaAdicional = 20000;
  await proponerViajeAChoferes(
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
    await proponerViajeAChoferes(
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

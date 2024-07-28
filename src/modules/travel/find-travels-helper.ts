import { InternalServerErrorException } from '@nestjs/common';
import { Travel } from 'src/dto/travel.dto';
import { junsNear } from 'src/socket/junsNear-aggregation';

export async function findTravelsFast(
  travel: Travel,
  socketService: any,
  userDb: any,
): Promise<any> {
  try {
    console.log('Travel', travel);
    const distance = 8000;
    const coordinates = [
      travel.fromLocation.travelPoint.coordinates.latitude,
      travel.fromLocation.travelPoint.coordinates.longitude,
    ];
    console.log('coordinates', coordinates);
    const JUNs = await userDb.aggregate(junsNear(distance, coordinates));
    for (const jun of JUNs) {
      console.log('JUNs', jun);
      console.log('Enviar a JUNS new-travel', jun._id);
      socketService.newTravel({
        travelId: travel._id.toString(),
        userId: jun._id,
      });
      /* this.socket.to(jun._id.toString()).emit('new-travel', travel.id); */
    }
  } catch (e) {
    throw new InternalServerErrorException(
      'filter newTravel Database error',
      e,
    );
  }
}
export function findTravelsFastShared(): any {}
export function findTravelsSchedule(): any {}
export function findTravelsScheduleShared(): any {}

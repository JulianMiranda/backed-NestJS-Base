import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../../dto/message.dto';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { Travel } from '../../dto/travel.dto';
import { ENTITY } from '../../enums/entity.enum';
import {
  findTravelsFast,
  findTravelsFastShared,
  findTravelsSchedule,
  findTravelsScheduleShared,
} from './find-travels-helper';
import { User } from 'src/dto/user.dto';
import { TravelService } from 'src/services/travel.service';

@Injectable()
export class TravelRepository {
  readonly type = ENTITY.TRAVELS;

  constructor(
    @InjectModel('Travel') private travelDb: Model<Travel>,
    @InjectModel('Message') private messageDb: Model<Message>,
    @InjectModel('User') private userDb: Model<User>,
    private readonly travelService: TravelService,
  ) {}

  /* public socket: Server; */

  async getList(query: MongoQuery): Promise<any> {
    try {
      const { filter, projection, sort, limit, skip, page, population } = query;
      const [count, opportunities] = await Promise.all([
        this.travelDb.countDocuments(filter),
        this.travelDb
          .find(filter, projection)
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .populate(population),
      ]);
      const totalPages = limit !== 0 ? Math.floor(count / limit) : 1;
      return { count, page, totalPages, data: opportunities };
    } catch (e) {
      throw new InternalServerErrorException(
        'filter opportunities Database error',
        e,
      );
    }
  }

  async getOne(id: string): Promise<Travel> {
    try {
      const document = await this.travelDb.findOne({ _id: id }).populate([
        { path: 'user', select: { name: true } },
        { path: 'driver', select: { name: true } },
      ]);

      if (!document)
        throw new NotFoundException(`Could not find Travel for id: ${id}`);

      return document;
    } catch (e) {
      if (e.status === 404) throw e;
      else
        throw new InternalServerErrorException('findTravel Database error', e);
    }
  }

  async create(data: any): Promise<any> {
    try {
      data.fromLocation = {
        type: 'Point',
        travelPoint: data.fromCoordinates,
      };

      data.toLocation = {
        type: 'Point',
        travelPoint: data.toCoordinates,
      };
      const newTravel = new this.travelDb(data);
      const document = await newTravel.save();
      const minDistance = 1;
      const maxDistance = 10000;
      this.travelService.proponerViajeOnetoOne(
        document,
        minDistance,
        maxDistance,
      );

      return document;
    } catch (e) {
      throw new InternalServerErrorException('createTravel Database error', e);
    }
  }
  async testFindDrivers(data: any, id: string): Promise<any> {
    try {
      data.fromLocation = {
        type: 'Point',
        travelPoint: data.fromCoordinates,
      };

      data.toLocation = {
        type: 'Point',
        travelPoint: data.toCoordinates,
      };
      console.log('testFindDrivers');
      const document = await this.travelDb.findOne({ _id: id });
      const minDistance = 1;
      const maxDistance = 10000;
      this.travelService.proponerViajeOnetoOne(
        document,
        minDistance,
        maxDistance,
      );
      return document;
    } catch (e) {
      throw new InternalServerErrorException(
        'testFindDrivers Database error',
        e,
      );
    }
  }
  async update(id: string, data: Partial<Travel>): Promise<boolean> {
    try {
      const { fromCoordinates, toCoordinates } = data;
      if (fromCoordinates)
        data.fromLocation = { type: 'Point', travelPoint: fromCoordinates };
      if (toCoordinates)
        data.toLocation = { type: 'Point', travelPoint: toCoordinates };

      const document = await this.travelDb.findOneAndUpdate(
        { _id: id },
        { ...data },
        { new: true },
      );

      if (!document)
        throw new NotFoundException(
          `Could not find Travel to update for id: ${id}`,
        );

      return !!document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('updateTravel Database error', e);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const document = await this.travelDb.findOneAndUpdate(
        { _id: id },
        { status: false },
      );

      if (!document)
        throw new NotFoundException(
          `Could not find Travel to delete for id: ${id}`,
        );
      /* this.notificationsRepository.deleteTravelNotification(
        document._id,
        document.user,
        document.owner,
        NOTIFICATION.CANCELLATION,
      ); */
      return !!document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('deleteTravel Database error', e);
    }
  }

  async searchDrivers(travel: Travel) {
    console.log('Travel', travel);

    switch (travel.type) {
      case 'fast':
        findTravelsFast(travel, this.userDb);
        break;
      case 'fast':
        findTravelsFastShared();
        break;
      case 'schedule':
        findTravelsSchedule();
        break;
      case 'fast':
        findTravelsScheduleShared();
        break;
      default:
        break;
    }
  }
}

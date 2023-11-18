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
import { ENTITY } from '../../enums/entity.enum'; /* 
import { NOTIFICATION } from '../../enums/notification.enum';
import { NotificationsRepository } from '../notifications/notifications.repository'; */
import { SocketRepository } from 'src/socket/socket.repository';
import { GeoUtils } from 'src/utils/geoDistance';

@Injectable()
export class TravelRepository {
  readonly type = ENTITY.TRAVELS;

  constructor(
    @InjectModel('Travel') private travelDb: Model<Travel>,
    @InjectModel('Message') private messageDb: Model<Message>,
    private socketRepository: SocketRepository /* 
    private notificationsRepository: NotificationsRepository, */,
  ) {}

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
      console.log('Crearing Travel', data);
      data.fromLocation = {
        type: 'Point',
        travelPoint: data.fromCoordinates,
      };
      console.log('fromLocation', data.fromLocation);

      data.toLocation = {
        type: 'Point',
        travelPoint: data.toCoordinates,
      };
      console.log(data);
      const cost = GeoUtils.calculateCostForDistance(
        GeoUtils.calculateHaversineDistance(
          data.fromCoordinates.coordinates.latitude,
          data.fromCoordinates.coordinates.longitude,
          data.toCoordinates.coordinates.latitude,
          data.toCoordinates.coordinates.longitude,
        ),
      );
      data.cost = cost;
      console.log('Costo', cost);
      const newTravel = new this.travelDb(data);
      const document = await newTravel.save();
      const travel = await this.travelDb.findOneAndUpdate(
        { _id: document._id },
        { new: true },
      );
      this.socketRepository.newTravel(travel);
      /*  this.notificationsRepository.createTravelNotification(
          travel._id,
          NOTIFICATION.OPPORTUNITY,
          data.user,
          data.owner,
        ); */
      return travel.id;
    } catch (e) {
      throw new InternalServerErrorException('createTravel Database error', e);
    }
  }

  async update(id: string, data: Partial<Travel>): Promise<boolean> {
    try {
      const { fromCoordinates, toCoordinates } = data;
      if (fromCoordinates)
        data.fromLocation = { type: 'Point', fromCoordinates };
      if (toCoordinates) data.toLocation = { type: 'Point', toCoordinates };

      const document = await this.travelDb
        .findOneAndUpdate({ _id: id }, data, { new: true })
        .populate([
          {
            path: 'images',
            match: { status: true },
            select: { url: true },
          },
        ]);

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
}

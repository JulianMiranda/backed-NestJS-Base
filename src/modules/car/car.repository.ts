import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { Car } from '../../dto/car.dto';
import { Image } from 'src/dto/image.dto';
import { ENTITY } from '../../enums/entity.enum';
import { ImageRepository } from '../image/image.repository';

@Injectable()
export class CarRepository {
  readonly type = ENTITY.CARS;

  constructor(
    @InjectModel('Car') private carDb: Model<Car>,
    private imageRepository: ImageRepository,
  ) {}

  async getList(query: MongoQuery): Promise<any> {
    try {
      const { filter, projection, sort, limit, skip, page, population } = query;
      const [count, cars] = await Promise.all([
        this.carDb.countDocuments(filter),
        this.carDb
          .find(filter, projection)
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .populate(population),
      ]);
      const totalPages = limit !== 0 ? Math.floor(count / limit) : 1;
      return { count, page, totalPages, data: cars };
    } catch (e) {
      throw new InternalServerErrorException('Filter cars Database error', e);
    }
  }

  async getOne(id: string): Promise<Car> {
    try {
      const document = await this.carDb.findOne({ _id: id }).populate([
        {
          path: 'image',
          match: { status: true },
          select: { url: true },
        },
      ]);

      if (!document)
        throw new NotFoundException(`Could not find car for id: ${id}`);

      return document;
    } catch (e) {
      if (e.status === 404) throw e;
      else throw new InternalServerErrorException('findCar Database error', e);
    }
  }

  async update(
    id: string,
    data: Partial<Car>,
    image: Partial<Image>,
  ): Promise<Car> {
    try {
      let newImage = {};
      if (image) {
        await this.imageRepository.deleteImagesByTypeAndId(this.type, id);

        image.parentType = this.type;
        image.parentId = id;
        const imageModel = await this.imageRepository.insertImages([image]);
        newImage = { image: imageModel[0]._id };
      }
      const document = await this.carDb
        .findOneAndUpdate({ _id: id }, { ...data, ...newImage }, { new: true })
        .select({
          name: true,
          lastName: true,
          phone: true,
          email: true,
          image: true,
          role: true,
          lastNotificationCheck: true,
          notificationTokens: true,
          theme: true,
          reciveNotifications: true,
          favoritesPlaces: true,
          lastTravel: true,
          acceptFastTravel: true,
          acceptScheduleTravel: true,
          location: true,
          ratingStars: true,
          ratingAvg: true,
        })
        .populate([
          {
            path: 'image',
            match: { status: true },
            select: { url: true, blurHash: true },
          },
        ]);

      if (!document)
        throw new NotFoundException(
          `Could not find car to update for id: ${id}`,
        );

      return document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('updateCar Database error', e);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const document = await this.carDb.findOneAndUpdate(
        { _id: id },
        { status: false },
      );

      if (!document)
        throw new NotFoundException(
          `Could not find car to delete for id: ${id}`,
        );
      return !!document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('deleteCar Database error', e);
    }
  }
}

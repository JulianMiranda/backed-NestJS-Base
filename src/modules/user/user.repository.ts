import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { User } from '../../dto/user.dto';
import { Image } from 'src/dto/image.dto';
import { ENTITY } from '../../enums/entity.enum';
import { ImageRepository } from '../image/image.repository';

@Injectable()
export class UserRepository {
  readonly type = ENTITY.USERS;

  constructor(
    @InjectModel('User') private userDb: Model<User>,
    private imageRepository: ImageRepository,
  ) {}

  async getList(query: MongoQuery): Promise<any> {
    try {
      const { filter, projection, sort, limit, skip, page, population } = query;
      const [count, users] = await Promise.all([
        this.userDb.countDocuments(filter),
        this.userDb
          .find(filter, projection)
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .populate(population),
      ]);
      const totalPages = limit !== 0 ? Math.floor(count / limit) : 1;
      return { count, page, totalPages, data: users };
    } catch (e) {
      throw new InternalServerErrorException('Filter users Database error', e);
    }
  }

  async getOne(id: string): Promise<User> {
    try {
      const document = await this.userDb.findOne({ _id: id }).populate([
        {
          path: 'image',
          match: { status: true },
          select: { url: true },
        },
      ]);

      if (!document)
        throw new NotFoundException(`Could not find user for id: ${id}`);

      return document;
    } catch (e) {
      if (e.status === 404) throw e;
      else throw new InternalServerErrorException('findUser Database error', e);
    }
  }

  async update(
    id: string,
    data: Partial<User>,
    image: Partial<Image>,
  ): Promise<User> {
    try {
      const {
        notificationTokens,
        lastTravelUpdate,
        coordinates,
        rating,
        ...rest
      } = data;

      if (coordinates) {
        const location = { type: 'Point', coordinates };
        await this.userDb.findOneAndUpdate({ _id: id }, { location });
      }

      if (rating) {
        const { ratingStars } = await this.userDb
          .findOne({ _id: id }, { ratingStars: true })
          .lean();

        if (rating === 1) ratingStars.one++;
        else if (rating === 2) ratingStars.two++;
        else if (rating === 3) ratingStars.three++;
        else if (rating === 4) ratingStars.four++;
        else if (rating === 5) ratingStars.five++;

        const ratingKeys = Object.values(ratingStars);

        const sum = ratingKeys.reduce((a: number, b: number) => a + b);
        const totalSum = ratingKeys.reduce(
          (a: number, b: number, i: number) => a + b * (i + 1),
        );
        const ratingAvg = (Number(totalSum) / Number(sum)).toFixed(2);

        await this.userDb.findOneAndUpdate(
          { _id: id },
          { ratingStars, ratingAvg: Number(ratingAvg) },
        );
      }

      if (notificationTokens) {
        await this.userDb.findOneAndUpdate(
          { _id: id },
          { $addToSet: { notificationTokens } },
        );
      }
      if (lastTravelUpdate) {
        const user = await this.userDb.findOne({ _id: id });

        const indiceFavoritoExistente = user.lastTravel.findIndex(
          (lastTravelUser) =>
            lastTravelUser.name === lastTravelUpdate.name &&
            lastTravelUser.address === lastTravelUpdate.address,
        );
        if (indiceFavoritoExistente !== -1) {
          // Si ya existe, moverlo al principio del array
          user.lastTravel.unshift(
            user.lastTravel.splice(indiceFavoritoExistente, 1)[0],
          );
        } else {
          // Si no existe, agregarlo al principio y asegurarse de que la longitud del array sea 2 como máximo
          user.lastTravel.unshift(lastTravelUpdate);
          user.lastTravel = user.lastTravel.slice(0, 2);
        }
        await this.userDb.updateOne(
          { _id: id },
          { $set: { lastTravel: user.lastTravel } },
        );

        /*   console.log('lastTravel: ' + JSON.stringify(lastTravel)); */
        /*  await this.userDb.findOneAndUpdate(
          { _id: id },
          { $addToSet: { lastTravel } },
        ); */
        /* const user =  await this.userDb.findOne({ _id: id})
       if(user.lastTravel.length < 2){
       const exist = user.lastTravel.filter(lT => JSON.stringify(lT) === JSON.stringify(lastTravel))
       if(exist.length > 0) {return}
      } else {
        
      } */
      }
      let newImage = {};
      if (image) {
        await this.imageRepository.deleteImagesByTypeAndId(this.type, id);

        image.parentType = this.type;
        image.parentId = id;
        const imageModel = await this.imageRepository.insertImages([image]);
        newImage = { image: imageModel[0]._id };
      }
      const document = await this.userDb
        .findOneAndUpdate({ _id: id }, { ...rest, ...newImage }, { new: true })
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
          acceptSharedTravel: true,
          acceptScheduleSharedTravel: true,
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
          `Could not find user to update for id: ${id}`,
        );

      return document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('updateUser Database error', e);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const document = await this.userDb.findOneAndUpdate(
        { _id: id },
        { status: false },
      );

      if (!document)
        throw new NotFoundException(
          `Could not find user to delete for id: ${id}`,
        );
      return !!document;
    } catch (e) {
      if (e.status === 404) throw e;
      throw new InternalServerErrorException('deleteUser Database error', e);
    }
  }
}

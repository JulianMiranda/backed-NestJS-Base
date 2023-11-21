import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { Message } from 'src/dto/message.dto';
import { User } from 'src/dto/user.dto';
import { ENTITY } from 'src/enums/entity.enum';
import { users } from './users-aggregation';
import { Travel } from 'src/dto/travel.dto';
import { junsNear } from './junsNear-aggregation';
import { GeoUtils } from 'src/utils/geoDistance';

@Injectable()
export class SocketRepository {
  readonly type = ENTITY.USERS;

  constructor(
    @InjectModel('User') private userDb: Model<User>,
    @InjectModel('Message')
    private messageDb: Model<Message> /* private appGateway: AppGateway, */,
  ) {}
  public socket: Server;

  async getUsers(uid: any): Promise<any> {
    try {
      const messages = await this.messageDb.find({
        $or: [{ de: uid }, { para: uid }],
      });
      const list = [];
      messages.map(({ de, para }) => {
        if (de.toString() === uid) {
          if (!list.includes(para.toString())) {
            list.push(para.toString());
          }
        } else {
          if (!list.includes(de.toString())) {
            list.push(de.toString());
          }
        }
      });

      const usersBd = await this.userDb.aggregate(users(list));

      return usersBd;
    } catch (e) {
      throw new InternalServerErrorException(
        'filter getUsers Database error',
        e,
      );
    }
  }
  async grabarMensaje(payload: Message): Promise<any> {
    try {
      const mensaje = await new this.messageDb(payload).save();
      return mensaje;
    } catch (e) {
      throw new InternalServerErrorException(
        'filter grabarMensaje Database error',
        e,
      );
    }
  }

  async newTravel({ travelId, userId }): Promise<any> {
    try {
      console.log('TravelId', travelId);
      console.log('userId', userId);

      this.socket.to(userId).emit('new-travel', travelId);
    } catch (e) {
      throw new InternalServerErrorException(
        'filter newTravel Database error',
        e,
      );
    }
  }

  async enviarDirect(id: string, opportunity: Partial<any>): Promise<any> {
    try {
      this.socket.to(id).emit('oportunidad-directa', opportunity);
      /* this.appGateway.wss
					.to(id)
					.emit('oportunidad-posible', {mensaje: 'oportunidad-posible'}); */
    } catch (e) {
      throw new InternalServerErrorException(
        'filter enviarDirect Database error',
        e,
      );
    }
  }

  async acceptedOwner(id: string): Promise<any> {
    try {
      this.socket.to(id).emit('accepted-owner');
    } catch (e) {
      throw new InternalServerErrorException(
        'filter enviarDirect Database error',
        e,
      );
    }
  }

  async getUserAuthAndOnline(
    token: '',
  ): Promise<{ status: boolean; userId: string }> {
    try {
      /* const firebaseInfo = await FirebaseService.getAdmin
				.auth()
				.verifyIdToken(token);
			const uid = firebaseInfo.uid; */
      const user = await this.userDb.findOneAndUpdate(
        { _id: token },
        { online: true },
      );
      return { status: true, userId: user.id };
    } catch (error) {
      console.log('No existe usuario', error);
      return { status: false, userId: null };
    }
  }
  async getUserAuthAndOffline(
    token: '',
  ): Promise<{ status: boolean; userId: string }> {
    try {
      /* const firebaseInfo = await FirebaseService.getAdmin
				.auth()
				.verifyIdToken(token);
			const uid = firebaseInfo.uid; */
      const user = await this.userDb.findOneAndUpdate(
        { _id: token },
        { online: false },
      );
      return { status: true, userId: user.id };
    } catch (error) {
      console.log(error);
      return { status: false, userId: null };
    }
  }
}

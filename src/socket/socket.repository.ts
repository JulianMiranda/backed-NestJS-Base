import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { Message } from 'src/dto/message.dto';
import { User } from 'src/dto/user.dto';
import { ENTITY } from 'src/enums/entity.enum';
import { users } from './users-aggregation';
import { Travel } from 'src/dto/travel.dto';

@Injectable()
export class SocketRepository {
  readonly type = ENTITY.USERS;

  constructor(
    @InjectModel('User') private userDb: Model<User>,
    @InjectModel('Travel') private travelDb: Model<Travel>,
    @InjectModel('Message')
    private messageDb: Model<Message> /* private appGateway: AppGateway, */,
  ) {}
  public socket: Server;
  private logger = new Logger('AppGateway');

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
      this.socket.to(userId.toString()).emit('new-travel', travelId);
      this.socket.to('655197ebf39275245d0f7b76').emit('test');

      this.logger.log(`new-travel to: ${userId} travel: ${travelId}`);
    } catch (e) {
      throw new InternalServerErrorException(
        'filter newTravel Database error',
        e,
      );
    }
  }
  async acceptTravel({
    user,
    travelId,
  }: {
    user: string;
    travelId: string;
  }): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ObjectId = require('mongodb').ObjectId;
      const userId = ObjectId(user);
      const travel = ObjectId(travelId);

      const travelDocument = await this.travelDb.updateOne(
        {
          _id: travel,
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
      console.log(travelDocument);
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

  async getUserToken({
    token,
  }: {
    token: any;
  }): Promise<{ status: boolean; userId: string }> {
    try {
      /* const firebaseInfo = await FirebaseService.getAdmin
				.auth()
				.verifyIdToken(token);
			const uid = firebaseInfo.uid; */
      const user = await this.userDb.findOne({ _id: token });
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

  /*   handleAcceptPropuestaEvent(socket: Socket, callback: () => void): void {
    socket.on('aceptarPropuesta', () => {
      callback();
    });
  } */
}

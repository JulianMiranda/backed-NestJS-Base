import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Travel } from 'src/dto/travel.dto';
import { User } from 'src/dto/user.dto';

interface Client {
  id: string;
  name: string;
}

@Injectable()
export class SocketService {
  constructor(
    @InjectModel('User')
    private userDb: Model<User>,
    @InjectModel('Travel')
    private travelDb: Model<Travel>,
  ) {}
  public server: Server = null;

  private clients: Record<string, Client> = {};
  private readonly logger = new Logger(SocketService.name);

  onClientConnected(client: Client) {
    this.clients[client.id] = client;
  }

  onClientDisconnected(id: string) {
    delete this.clients[id];
  }

  handleAcceptPropuestaEvent(socket: Socket, callback: () => void): void {
    socket.on('test', () => {
      console.log('Test en service');
      callback();
    });
  }

  /* @SubscribeMessage('test')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!message) {
      return;
    }
    console.log('Tests');
  } */

  handleTest(socket: Socket): void {
    console.log('handleTest');
  }

  async getUserToken({
    token,
  }: {
    token: string;
  }): Promise<{ status: boolean; userId: string }> {
    try {
      const user = await this.userDb.findOne({ _id: token });
      return { status: true, userId: user.id };
    } catch (error) {
      console.log('No existe usuario', error);
      return { status: false, userId: null };
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
      console.log(userId, travel);

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

  async newTravel({ travelId, userId }): Promise<any> {
    try {
      /*  this.socket.to(userId.toString()).emit('new-travel', travelId);
      this.socket.to('655197ebf39275245d0f7b76').emit('test'); */

      this.logger.log(`new-travel to: ${userId} travel: ${travelId}`);
    } catch (e) {
      throw new InternalServerErrorException(
        'filter newTravel Database error',
        e,
      );
    }
  }

  async acceptedTravel({ travelId, userId }): Promise<any> {
    try {
      this.server.to(userId.toString()).emit('accepted-travel', travelId);

      this.logger.log(`acceptedtravel to: ${userId} travel: ${travelId}`);
    } catch (e) {
      throw new InternalServerErrorException(
        'filter newTravel Database error',
        e,
      );
    }
  }
  async errorTakedTravel({ travelId, userId }): Promise<any> {
    try {
      this.server.to(userId.toString()).emit('error-taked-travel', travelId);

      this.logger.log(`errorTakedTravel to: ${userId} travel: ${travelId}`);
    } catch (e) {
      throw new InternalServerErrorException(
        'filter newTravel Database error',
        e,
      );
    }
  }
}

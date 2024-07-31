import { Logger, OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Model } from 'mongoose';
import { User } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';

interface RespPropuesta {
  viajeId: string;
  choferId: string;
  accepted: boolean;
}

@WebSocketGateway()
export class AppGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;
  private clients: Map<string, Socket> = new Map();
  private readonly logger = new Logger('SocketGateway');

  constructor(@InjectModel('User') private userDb: Model<User>) {}

  onModuleInit() {
    this.server.on('connection', async (socket: Socket) => {
      const token = socket.handshake.headers['x-token'];
      if (!token) {
        return socket.disconnect();
      }
      if (typeof token !== 'string') {
        return socket.disconnect();
      }
      const { status, userId } = await this.getUserToken({
        token,
      });
      if (!status) {
        console.log('Invalid client');
        return socket.disconnect();
      }
      this.logger.log(`New client connected: ${userId} ${socket.id}`);
      socket.join(userId);
      this.clients.set(userId, socket);
      socket.on('disconnect', () => {
        this.clients.delete(userId);
        this.logger.log('Client disconnected', socket.id);
      });
      socket.on('respuesta-propuesta', (response) => {
        console.log('Respuesta de propuesta', response);
        this.handleMessageRespPropuestaTS(response);
      });
    });
  }

  async getUserToken({
    token,
  }: {
    token: any;
  }): Promise<{ status: boolean; userId: string }> {
    try {
      const user = await this.userDb.findOne({ _id: token });
      return { status: true, userId: user.id };
    } catch (error) {
      console.log('No existe usuario', error);
      return { status: false, userId: null };
    }
  }

  handleMessageRespPropuestaTS(response: RespPropuesta) {
    const {} = response;
  }

  emitToClient(clientId: string, event: string, payload: any) {
    const clientSocket = this.clients.get(clientId);
    if (clientSocket) {
      clientSocket.emit(event, payload);
    }
  }
}

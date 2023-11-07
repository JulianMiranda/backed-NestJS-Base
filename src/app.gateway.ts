import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketRepository } from './socket/socket.repository';

@WebSocketGateway({ transport: ['websocket'] })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  wss: Server;
  socket: Socket;
  constructor(private socketRepository: SocketRepository) {}

  private logger = new Logger('AppGateway');

  afterInit() {
    this.socketRepository.socket = this.wss;
  }

  async handleConnection(client) {
    const token = client.handshake.headers['x-token'];
    if (!token) {
      return client.disconnect();
    }

    const { status, userId } =
      await this.socketRepository.getUserAuthAndOnline(token);
    if (!status) {
      console.log('Invalid client');
      return client.disconnect();
    }
    this.logger.log('New client connected', userId);
    client.join(userId);
    client.on('mensaje-personal', async (payload) => {
      const mensaje = await this.socketRepository.grabarMensaje(payload);
      this.wss.to(payload.para).emit('mensaje-personal', mensaje);
      this.wss.to(payload.de).emit('mensaje-personal', mensaje);
    });

    this.wss.emit(
      'lista-usuarios',
      await this.socketRepository.getUsers(userId),
    );
  }

  async handleDisconnect(client) {
    const token = client.handshake.headers['x-token'];
    const { userId } = await this.socketRepository.getUserAuthAndOffline(token);
    const users = await this.socketRepository.getUsers(userId);

    this.wss.emit('lista-usuarios', users);

    this.logger.log('Client disconnected');
  }

  /*  async newTravel() {
    console.log('Hacer new travel');
    this.wss.emit('new-travel');

    this.logger.log('new-travel');
  } */
}

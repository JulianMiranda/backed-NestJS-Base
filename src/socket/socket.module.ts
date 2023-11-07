import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from '../app.gateway';
import { UserSchema } from 'src/schemas/user.schema';
import { SocketController } from './socket.controller';
import { SocketRepository } from './socket.repository';
import { MessageSchema } from 'src/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'Message',
        schema: MessageSchema,
      },
    ]),
  ],

  controllers: [SocketController],
  providers: [SocketRepository, AppGateway],
  exports: [SocketRepository],
})
export class SocketModule {}

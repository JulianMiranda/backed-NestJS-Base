import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from 'src/schemas/message.schema';
import TravelSchema from '../../schemas/travel.schema';
import { TravelController } from './travel.controller';
import { TravelRepository } from './travel.repository';
import { SocketModule } from 'src/socket/socket.module';
import UserSchema from 'src/schemas/user.schema';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Travel',
        schema: TravelSchema,
      },
      {
        name: 'Message',
        schema: MessageSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    /* NotificationsModule, */
    SocketModule,
  ],
  controllers: [TravelController],
  providers: [TravelRepository, AppGateway],
})
export class TravelModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from 'src/schemas/message.schema';
import TravelSchema from '../../schemas/travel.schema';
import { TravelController } from './travel.controller';
import { TravelRepository } from './travel.repository';
import { SocketModule } from 'src/socket/socket.module';

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
    ]),
    /* NotificationsModule, */
    SocketModule,
  ],
  controllers: [TravelController],
  providers: [TravelRepository],
})
export class TravelModule {}

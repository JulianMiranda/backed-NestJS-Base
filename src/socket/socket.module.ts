import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from '../app.gateway';
import UserSchema from 'src/schemas/user.schema';
import TravelSchema from 'src/schemas/travel.schema';
import { SocketService } from './socket.service';
import { TravelService } from 'src/services/travel.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'Travel',
        schema: TravelSchema,
      },
    ]),
  ],
  providers: [SocketService, TravelService, AppGateway],
})
export class SocketModule {}

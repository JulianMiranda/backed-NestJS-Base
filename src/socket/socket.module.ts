import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from '../app.gateway';
import UserSchema from 'src/schemas/user.schema';
import TravelSchema from 'src/schemas/travel.schema';

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
  providers: [AppGateway],
})
export class SocketModule {}

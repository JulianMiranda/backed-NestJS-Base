import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppGateway } from '../app.gateway';
import UserSchema from 'src/schemas/user.schema';
import TravelSchema from 'src/schemas/travel.schema';
import { TravelModule } from 'src/modules/travel/travel.module';

@Module({
  imports: [
    forwardRef(() => TravelModule),
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
  exports: [AppGateway],
})
export class SocketModule {}

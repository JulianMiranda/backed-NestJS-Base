import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from 'src/schemas/message.schema';
import TravelSchema from '../../schemas/travel.schema';
import { TravelController } from './travel.controller';
import { TravelRepository } from './travel.repository';
import UserSchema from 'src/schemas/user.schema';
import { TravelService } from 'src/services/travel.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    forwardRef(() => SocketModule),
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
  ],
  controllers: [TravelController],
  providers: [TravelRepository, TravelService],
  exports: [TravelService],
})
export class TravelModule {}

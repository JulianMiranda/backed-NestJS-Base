import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from '../../schemas/user.schema';
import { QueriesController } from './queries.controller';
import { QueriesRepository } from './queries.repository';
import TravelSchema from 'src/schemas/travel.schema';
import { GeoUtils } from 'src/utils/geoDistance';

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

  controllers: [QueriesController],
  providers: [QueriesRepository, GeoUtils],
})
export class QueriesModule {}

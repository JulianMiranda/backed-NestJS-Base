import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CarSchema from '../../schemas/car.schema';
import { ImageModule } from '../image/image.module';
import { CarsController } from './car.controller';
import { CarRepository } from './car.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Car',
        schema: CarSchema,
      },
    ]),
    ImageModule,
  ],
  controllers: [CarsController],
  providers: [CarRepository],
  exports: [CarRepository],
})
export class CarModule {}
